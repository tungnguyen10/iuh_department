import { defineConfig, loadEnv } from 'vite'
import { resolve, relative, extname, basename, dirname, isAbsolute } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { execSync } from 'child_process'
import svgo from 'vite-plugin-svgo'
import { twMerge } from 'tailwind-merge'
import { copyReferencedSvgs } from './scripts/svg-assets.js'
import { createNewsRenderer as buildNewsRenderer } from './src/shared/components/news/news-renderer.js'
import { createActivitiesRenderer as buildActivitiesRenderer } from './src/shared/components/activities/activities-renderer.js'

// Dedupe and resolve Tailwind class conflicts inside every class="..." attribute.
// Runs after data-include substitution so partial defaults can be overridden by callers.
const mergeClassAttributes = (html) =>
  html.replace(/\bclass\s*=\s*(["'])([^"']*)\1/g, (_, quote, value) => {
    const merged = twMerge(value.replace(/\s+/g, ' ').trim())
    return `class=${quote}${merged}${quote}`
  })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = __dirname
const srcRoot = resolve(repoRoot, 'src')
const defaultFacultyId = 'health-science'

// Generate build signature: PREFIX_HASH_TIMESTAMP
const getBuildSignature = () => {
  let gitHash = 'no-git'
  try {
    gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch (error) {
    // Fallback to 'no-git' if git is not available
  }
  const timestamp = new Date().toISOString()
  return `2026TUNG's_${gitHash}_${timestamp}`
}

const createSourcePaths = (facultyId) => {
  const selectedFacultyRoot = resolve(srcRoot, 'faculties', facultyId)

  return {
    repoRoot,
    srcRoot,
    sharedRoot: resolve(srcRoot, 'shared'),
    selectedFacultyRoot,
    selectedFacultyPagesRoot: resolve(selectedFacultyRoot, 'pages'),
    selectedFacultyDataRoot: resolve(selectedFacultyRoot, 'data'),
    selectedFacultyAssetsRoot: resolve(selectedFacultyRoot, 'assets'),
  }
}

const resolveFacultyContext = (facultyId = defaultFacultyId) => {
  const selectedFacultyId = facultyId.trim() || defaultFacultyId
  const paths = createSourcePaths(selectedFacultyId)

  if (!existsSync(paths.selectedFacultyRoot)) {
    throw new Error(
      `FACULTY="${selectedFacultyId}" does not match an existing faculty directory at ${paths.selectedFacultyRoot}.`
    )
  }

  if (!existsSync(paths.selectedFacultyPagesRoot)) {
    throw new Error(
      `FACULTY="${selectedFacultyId}" does not have a pages directory at ${paths.selectedFacultyPagesRoot}.`
    )
  }

  return {
    selectedFacultyId,
    paths,
    pagesRoot: paths.selectedFacultyPagesRoot,
  }
}

const createHtmlInput = (pagesRoot) => {
  const htmlFiles = glob.sync('**/*.html', { cwd: pagesRoot })
  const input = {}

  htmlFiles.forEach(file => {
    const name = file.replace(/\.html$/, '')
    input[name] = resolve(pagesRoot, file)
  })

  return input
}

const relativeModulePath = (fromDir, toFile) => {
  const relativePath = relative(fromDir, toFile).replace(/\\/g, '/')
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

const ASSET_PREFIX_RE = /^\/(?:assets|data)\//

const installSrcRequestMiddleware = (server, paths) => {
  server.middlewares.use((req, res, next) => {
    if (!req.url) return next()
    const pathname = req.url.split('?')[0]
    const mapped = mapUrlToFsPath(req.url, paths)
    if (mapped) {
      req.url = `/@fs/${mapped}`
      return next()
    }
    // Unmatched asset/data requests should fail loudly instead of falling
    // back to the SPA index.html (which corrupts <img>/<script>/fetch responses).
    if (ASSET_PREFIX_RE.test(pathname)) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(`Not found: ${pathname}`)
      return
    }
    next()
  })
}

const mapSrcRequests = (paths) => ({
  name: 'map-src-requests',
  configureServer(server) {
    installSrcRequestMiddleware(server, paths)
  },
  configurePreviewServer(server) {
    installSrcRequestMiddleware(server, paths)
  },
})

const firstExisting = (...candidates) => candidates.find((candidate) => candidate && existsSync(candidate)) || null

const mapUrlToFsPath = (url, paths) => {
  const pathname = url.split('?')[0]

  // HTML pages are served by Vite from the selected faculty pages root so
  // transformIndexHtml plugins can wrap the shared layout and inject includes.

  // Runtime entry script lives at repo src root
  if (pathname === '/main.js') {
    return resolve(paths.srcRoot, 'main.js')
  }

  // Faculty data: /data/foo.json -> <facultyRoot>/data/foo.json
  if (pathname.startsWith('/data/')) {
    const dataFile = resolve(paths.selectedFacultyDataRoot, pathname.slice('/data/'.length))
    if (existsSync(dataFile)) return dataFile
  }

  // Faculty documents: /assets/documents/foo.pdf -> <facultyRoot>/assets/documents/foo.pdf
  if (pathname.startsWith('/assets/documents/')) {
    const docFile = resolve(paths.selectedFacultyAssetsRoot, 'documents', pathname.slice('/assets/documents/'.length))
    if (existsSync(docFile)) return docFile
  }

  // Fonts: /assets/fonts/foo.ttf -> <sharedRoot>/assets/fonts/foo.ttf
  if (pathname.startsWith('/assets/fonts/')) {
    const fontFile = resolve(paths.sharedRoot, 'assets/fonts', pathname.slice('/assets/fonts/'.length))
    if (existsSync(fontFile)) return fontFile
  }

  // Images: faculty wins, shared fallback
  if (pathname.startsWith('/assets/images/')) {
    const sub = pathname.slice('/assets/images/'.length)
    return firstExisting(
      resolve(paths.selectedFacultyAssetsRoot, 'images', sub),
      resolve(paths.sharedRoot, 'assets/images', sub),
    )
  }

  // SVGs are canonical shared assets. Faculty SVG overrides are intentionally unsupported.
  if (pathname.startsWith('/assets/svgs/')) {
    const sub = pathname.slice('/assets/svgs/'.length)
    const svgFile = resolve(paths.sharedRoot, 'assets/svgs', sub)
    return existsSync(svgFile) ? svgFile : null
  }

  // Generic /assets/* fallback: try shared then faculty
  if (pathname.startsWith('/assets/')) {
    const sub = pathname.slice('/assets/'.length)
    return firstExisting(
      resolve(paths.sharedRoot, 'assets', sub),
      resolve(paths.selectedFacultyAssetsRoot, sub),
    )
  }

  return null
}

const getCssOutputName = (name) => {
  if (!name) return 'style'
  const normalized = name.replace(/\\/g, '/')
  const marker = 'styles/'
  const idx = normalized.lastIndexOf(marker)
  if (idx >= 0) {
    return normalized
      .slice(idx + marker.length)
      .replace(/\.css$/i, '')
      .replace(/\//g, '-')
  }
  return basename(normalized, '.css')
}

const normalizeBasePath = (value = '/') => {
  if (!value || value === '.') {
    return '/'
  }
  let normalized = value.trim().replace(/\\/g, '/')
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }
  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`
  }
  return normalized
}

const resolveOutDir = (value = '') => {
  const target = value.trim()
  const finalTarget = target.length ? target : 'dist'
  return isAbsolute(finalTarget) ? finalTarget : resolve(__dirname, finalTarget)
}

// Layout template cache để tránh đọc file nhiều lần
let layoutCache = null
const getLayoutTemplate = () => {
  if (!layoutCache) {
    layoutCache = readFileSync(resolve(__dirname, 'src/shared/layouts/default.html'), 'utf-8')
  }
  return layoutCache
}

const layoutPlugin = (base, mainScript) => ({
  name: 'layout-plugin',
  transformIndexHtml: {
    order: 'pre', // Chạy TRƯỚC để wrap layout trước khi inject components
    handler(html, { path }) {
      // Extract metadata từ HTML comments
      const titleMatch = html.match(/<!--\s*LAYOUT:\s*title="([^"]+)"\s*-->/)
      const descMatch = html.match(/<!--\s*LAYOUT:\s*description="([^"]+)"\s*-->/)
      const keywordsMatch = html.match(/<!--\s*LAYOUT:\s*keywords="([^"]+)"\s*-->/)
      const ogImageMatch = html.match(/<!--\s*LAYOUT:\s*ogImage="([^"]+)"\s*-->/)
      const urlMatch = html.match(/<!--\s*LAYOUT:\s*url="([^"]+)"\s*-->/)
      const scriptMatch = html.match(/<!--\s*LAYOUT:\s*script="([^"]+)"\s*-->/)
      const chromeMatch = html.match(/<!--\s*LAYOUT:\s*chrome="(on|off)"\s*-->/)
      const chromeEnabled = !chromeMatch || chromeMatch[1] !== 'off'
      
      // Nếu không có marker LAYOUT thì skip (giữ nguyên HTML - full page)
      if (!titleMatch) {
        return html
      }
      
      // Load layout template (cached)
      const layout = getLayoutTemplate()
      
      // Load loading component (inline CSS critical)
      const loadingComponent = readFileSync(resolve(__dirname, 'src/shared/components/loading/loading.html'), 'utf-8')
      
      // Extract content: Lấy toàn bộ sau metadata markers
      let content = html
        .replace(/<!--\s*LAYOUT:[^>]+-->\s*/g, '')
        .trim()
      
      // Helper: prepend base path nếu cần
      const withBase = (path) => {
        if (!path || path.startsWith('http') || path.startsWith('//')) return path
        const normalized = path.startsWith('/') ? path : `/${path}`
        return base === '/' ? normalized : `${base}${normalized}`.replace(/\/+/g, '/')
      }
      
      // Extract values với defaults
      const title = titleMatch[1]
      const description = descMatch?.[1] || 'Static website với Vite + Vanilla JS + TailwindCSS'
      const keywords = keywordsMatch?.[1] || 'vite, vanilla js, tailwindcss, static site'
      const ogImage = withBase(ogImageMatch?.[1] || '/assets/images/default.jpg')
      const url = urlMatch?.[1] || withBase(path.replace(/\.html$/, ''))
      const pageScript = scriptMatch?.[1] 
        ? `<!-- Page-specific JS -->\n  <script type="module" src="${scriptMatch[1]}"></script>`
        : ''
      
      // Inject vào layout với base path cho các assets
      let result = layout
        .replace(/\{\{title\}\}/g, title)
        .replace(/\{\{description\}\}/g, description)
        .replace(/\{\{keywords\}\}/g, keywords)
        .replace(/\{\{ogImage\}\}/g, ogImage)
        .replace(/\{\{url\}\}/g, url)
        .replace('{{loadingComponent}}', loadingComponent)
        .replace('{{content}}', content)
        .replace(/\{\{mainScript\}\}/g, mainScript)
        .replace(/\{\{pageScript\}\}/g, pageScript)

      // Strip chrome block when chrome="off"; otherwise just remove the markers
      if (chromeEnabled) {
        result = result
          .replace(/<!--\s*LAYOUT:chrome:start\s*-->/g, '')
          .replace(/<!--\s*LAYOUT:chrome:end\s*-->/g, '')
      } else {
        result = result.replace(/<!--\s*LAYOUT:chrome:start\s*-->[\s\S]*?<!--\s*LAYOUT:chrome:end\s*-->/g, '')
      }
      
      // Apply base path cho favicon và assets trong layout
      result = result
        .replace(/href="\//g, (match) => {
          return `href="${base === '/' ? '/' : base}`
        })
        .replace(/src="\//g, (match) => {
          return `src="${base === '/' ? '/' : base}`
        })
        .replace(/content="\//g, (match) => {
          return `content="${base === '/' ? '/' : base}`
        })
      
      return result
    }
  }
})

const loadFacultyNewsData = (facultyDataRoot) => {
  const newsFile = resolve(facultyDataRoot, 'news.json')
  if (!existsSync(newsFile)) return { sectionMeta: {}, items: [] }

  try {
    const data = JSON.parse(readFileSync(newsFile, 'utf-8'))
    return {
      sectionMeta: data.section || {},
      items: Array.isArray(data.items) ? data.items.filter((item) => item?.title) : [],
    }
  } catch (error) {
    console.warn(`Failed to read faculty news data: ${newsFile}`, error.message)
    return { sectionMeta: {}, items: [] }
  }
}

const createNewsRenderer = (base, facultyDataRoot) => {
  const { items, sectionMeta } = loadFacultyNewsData(facultyDataRoot)
  return buildNewsRenderer({ base, items, sectionMeta })
}

const loadFacultyActivitiesData = (facultyDataRoot) => {
  const activitiesFile = resolve(facultyDataRoot, 'activities.json')
  if (!existsSync(activitiesFile)) return { sectionMeta: {}, items: [] }

  try {
    const data = JSON.parse(readFileSync(activitiesFile, 'utf-8'))
    return {
      sectionMeta: data.section || {},
      items: Array.isArray(data.items) ? data.items.filter((item) => item?.title) : [],
    }
  } catch (error) {
    console.warn(`Failed to read faculty activities data: ${activitiesFile}`, error.message)
    return { sectionMeta: {}, items: [] }
  }
}

const createActivitiesRenderer = (base, facultyDataRoot) => {
  const { items, sectionMeta } = loadFacultyActivitiesData(facultyDataRoot)
  return buildActivitiesRenderer({ base, items, sectionMeta })
}

// HTML templates rendered by this plugin live in src/shared/components/news/news-renderer.js and
// src/shared/components/activities/activities-renderer.js. Any new build-time template MUST live
// under src/ so Tailwind's content globs scan its classes.
const transformDataInclude = (base, facultyId, facultyDataRoot) => ({
  name: 'transform-data-include',
  transformIndexHtml(html) {
    // Recursive function to process nested data-include
    const processIncludes = (content, depth = 0) => {
      if (depth > 10) {
        console.warn('⚠️  Max recursion depth reached for data-include')
        return content
      }
      
      const transformed = content.replace(
        /<div\s+data-include=["']([^"']+)["']([^>]*?)>\s*<\/div>/gs,
        (match, htmlPath, attributes) => {
          try {
            // Extract all data-* attributes (support hyphenated names)
            const dataAttrs = {}
            const attrRegex = /data-([\w-]+)=["']([^"']+)["']/g
            let attrMatch
            while ((attrMatch = attrRegex.exec(attributes)) !== null) {
              // Convert hyphenated to camelCase: data-title-class → titleClass
              const key = attrMatch[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
              dataAttrs[key] = attrMatch[2]
            }
            
            // Xử lý path từ pages
            let componentPath = htmlPath
            if (htmlPath.startsWith('@shared/components/')) {
              componentPath = htmlPath.replace('@shared/', 'shared/')
            } else if (htmlPath.startsWith('@faculty/components/')) {
              componentPath = htmlPath.replace('@faculty/', `faculties/${facultyId}/`)
            } else if (htmlPath.startsWith('./')) {
              // ./header.html → pages/header.html
              componentPath = `pages/${htmlPath.slice(2)}`
            } else if (base !== '/' && htmlPath.startsWith(base)) {
              componentPath = htmlPath.substring(base.length)
            }
            
            // Đọc file component HTML từ src
            const fullComponentPath = resolve(__dirname, 'src', componentPath)
            let componentHtml = readFileSync(fullComponentPath, 'utf-8').trim()
            
            // Handle variant selection - default to option 1 if no variant specified
            const variantNumber = dataAttrs.variant || '1'
            const variantRegex = new RegExp(
              `<!-- option ${variantNumber}[^>]*?-->([\\s\\S]*?)(?=<!-- option \\d|$)`,
              'i'
            )
            const variantMatch = componentHtml.match(variantRegex)
            if (variantMatch) {
              componentHtml = variantMatch[1].trim()
            } else if (componentHtml.includes('<!-- option')) {
              // File có options nhưng không tìm thấy variant → fallback về option 1
              if (variantNumber !== '1') {
                console.warn(`⚠️  Variant ${variantNumber} not found in ${componentPath}, falling back to option 1`)
              }
              const fallbackRegex = /<!-- option 1[^>]*?-->([\s\S]*?)(?=<!-- option \d|$)/i
              const fallbackMatch = componentHtml.match(fallbackRegex)
              if (fallbackMatch) {
                componentHtml = fallbackMatch[1].trim()
              } else {
                // Không có option 1 → return empty với error comment
                console.error(`❌ No option 1 found in ${componentPath}`)
                return `<!-- ERROR: Variant ${variantNumber} not found and no fallback available -->`
              }
            }
            // Nếu file không có comment options thì giữ nguyên (component bình thường không có variants)
            
            // Replace all {{key}} placeholders with data-key values
            Object.entries(dataAttrs).forEach(([key, value]) => {
              if (key !== 'include' && key !== 'js' && key !== 'variant') {
                const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
                componentHtml = componentHtml.replace(placeholder, value)
              }
            })
            
            // Remove entire lines containing only empty placeholders
            // Match lines like: <tag ...>{{placeholder}}</tag>
            componentHtml = componentHtml.replace(/^\s*<[^>]+>\s*\{\{[^}]+\}\}\s*<\/[^>]+>\s*$/gm, '')
            
            // Replace remaining placeholders with empty string
            componentHtml = componentHtml.replace(/\{\{[^}]+\}\}/g, '')
            
            // Recursively process nested includes
            return processIncludes(componentHtml, depth + 1)
          } catch (error) {
            console.warn(`Failed to inject component: ${htmlPath}`, error.message)
            return match // Giữ nguyên nếu có lỗi
          }
        }
      )
      
      // If no changes, return original to stop recursion
      return transformed === content ? content : processIncludes(transformed, depth)
    }
    
    let transformed = processIncludes(html)
    transformed = createNewsRenderer(base, facultyDataRoot)(transformed)
    transformed = createActivitiesRenderer(base, facultyDataRoot)(transformed)
    transformed = mergeClassAttributes(transformed)
    
    // Transform img src="/assets/..." to include base path
    transformed = transformed.replace(
      /<img\s+([^>]*?)src=["']\/assets\/([^"']+)["']([^>]*?)>/g,
      (match, before, assetPath, after) => {
        const finalPath = base === '/' ? `/assets/${assetPath}` : `${base}assets/${assetPath}`
        return `<img ${before}src="${finalPath}"${after}>`
      }
    )
    
    // Transform data-photo-src="/assets/..." to include base path
    transformed = transformed.replace(
      /data-photo-src=["']\/assets\/([^"']+)["']/g,
      (match, assetPath) => {
        const finalPath = base === '/' ? `/assets/${assetPath}` : `${base}assets/${assetPath}`
        return `data-photo-src="${finalPath}"`
      }
    )
    
    // Transform srcset="/assets/..." to include base path
    transformed = transformed.replace(
      /srcset=["']\/assets\/([^"']+)["']/g,
      (match, assetPath) => {
        const finalPath = base === '/' ? `/assets/${assetPath}` : `${base}assets/${assetPath}`
        return `srcset="${finalPath}"`
      }
    )
    
    // Transform data-image="/assets/..." to include base path
    transformed = transformed.replace(
      /data-image=["']\/assets\/([^"']+)["']/g,
      (match, assetPath) => {
        const finalPath = base === '/' ? `/assets/${assetPath}` : `${base}assets/${assetPath}`
        return `data-image="${finalPath}"`
      }
    )
    
    // Transform data-featured-image="/assets/..." to include base path
    transformed = transformed.replace(
      /data-featured-image=["']\/assets\/([^"']+)["']/g,
      (match, assetPath) => {
        const finalPath = base === '/' ? `/assets/${assetPath}` : `${base}assets/${assetPath}`
        return `data-featured-image="${finalPath}"`
      }
    )
    
    // Transform data-overlayIcon="/assets/..." to include base path
    transformed = transformed.replace(
      /data-overlayIcon=["']\/assets\/([^"']+)["']/g,
      (match, assetPath) => {
        const finalPath = base === '/' ? `/assets/${assetPath}` : `${base}assets/${assetPath}`
        return `data-overlayIcon="${finalPath}"`
      }
    )
    
    return transformed
  }
})

// Component JS đã được bundle vào main.js qua import.meta.glob
// Không cần copy components nữa

const copyDirectoryContents = (src, dest, onFileCopied, shouldCopy = () => true) => {
  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    const srcPath = resolve(src, entry.name)
    const destPath = resolve(dest, entry.name)

    if (entry.isDirectory()) {
      if (!shouldCopy(srcPath, entry)) continue
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true })
      }
      copyDirectoryContents(srcPath, destPath, onFileCopied, shouldCopy)
    } else {
      if (!shouldCopy(srcPath, entry)) continue
      copyFileSync(srcPath, destPath)
      onFileCopied?.(entry.name)
    }
  }
}

// Plugin to copy selected faculty data to dist_iuh/data
const copyFacultyDataPlugin = (outDir, facultyDataRoot) => ({
  name: 'copy-faculty-data',
  closeBundle() {
    const distDataDir = resolve(outDir, 'data')
    
    if (!existsSync(facultyDataRoot)) return
    
    if (!existsSync(distDataDir)) {
      mkdirSync(distDataDir, { recursive: true })
    }
    
    copyDirectoryContents(facultyDataRoot, distDataDir, (fileName) => {
      console.log(`Copied faculty data: ${fileName} to data/`)
    }, (srcPath, entry) => {
      return !(entry.isFile() && ['news.json', 'activities.json'].includes(entry.name))
    })
  }
})

// Plugin to copy selected faculty documents to dist_iuh/assets/documents
const copyFacultyDocumentsPlugin = (outDir, facultyDocumentsRoot) => ({
  name: 'copy-faculty-documents',
  closeBundle() {
    const distDocumentsDir = resolve(outDir, 'assets/documents')

    if (!existsSync(facultyDocumentsRoot)) return

    if (!existsSync(distDocumentsDir)) {
      mkdirSync(distDocumentsDir, { recursive: true })
    }

    copyDirectoryContents(facultyDocumentsRoot, distDocumentsDir, (fileName) => {
      console.log(`Copied faculty document: ${fileName} to assets/documents/`)
    })
  }
})

const copyAssetRootsPlugin = (outDir, assetType, sourceRoots) => ({
  name: `copy-${assetType}`,
  closeBundle() {
    const distAssetDir = resolve(outDir, 'assets', assetType)
    const existingRoots = sourceRoots.filter((sourceRoot) => existsSync(sourceRoot))

    if (!existingRoots.length) {
      console.log(`⚠️  No ${assetType} asset roots found`)
      return
    }

    if (!existsSync(distAssetDir)) {
      mkdirSync(distAssetDir, { recursive: true })
    }

    let count = 0
    console.log(`Copying ${assetType} assets...`)
    for (const sourceRoot of existingRoots) {
      copyDirectoryContents(sourceRoot, distAssetDir, () => {
        count++
      })
    }
    console.log(`✓ Copied ${count} ${assetType} assets to assets/${assetType}/`)
  }
})

const copyReferencedSvgsPlugin = (outDir, sharedSvgRoot, sourceRoots) => ({
  name: 'copy-referenced-svgs',
  closeBundle() {
    const result = copyReferencedSvgs({
      distDir: outDir,
      sharedSvgRoot,
      sourceRoots,
      sourceBaseDir: repoRoot,
    })
    console.log(`Copied ${result.copied} referenced SVG assets to assets/svgs/`)
  }
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const faculty = resolveFacultyContext(process.env.FACULTY || env.FACULTY || defaultFacultyId)
  const base = normalizeBasePath(env.VITE_BASE_PATH || '/')
  const outDir = resolveOutDir(env.VITE_OUT_DIR || '')
  const buildSignature = mode === 'production' ? getBuildSignature() : 'dev-mode'
  const input = createHtmlInput(faculty.pagesRoot)
  const mainScript = relativeModulePath(faculty.pagesRoot, resolve(srcRoot, 'main.js'))
  
  // Read version from package.json
  const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
  const appVersion = pkg.version || '0.0.0'

  return {
    base,
    root: faculty.pagesRoot,
    publicDir: false,
    define: {
      __BUILD_SIGNATURE__: JSON.stringify(buildSignature),
      __APP_VERSION__: JSON.stringify(appVersion),
      __BUILD_MODE__: JSON.stringify(mode)
    },
    plugins: [
      mapSrcRequests(faculty.paths),
      layoutPlugin(base, mainScript), // Chạy TRƯỚC để wrap layout
      transformDataInclude(base, faculty.selectedFacultyId, faculty.paths.selectedFacultyDataRoot), // Chạy SAU để inject components vào layout
      copyFacultyDataPlugin(outDir, faculty.paths.selectedFacultyDataRoot), // Copy selected faculty data to dist/data
      copyFacultyDocumentsPlugin(outDir, resolve(faculty.paths.selectedFacultyAssetsRoot, 'documents')), // Copy selected faculty documents
      copyAssetRootsPlugin(outDir, 'images', [
        resolve(faculty.paths.sharedRoot, 'assets/images'),
        resolve(faculty.paths.selectedFacultyAssetsRoot, 'images'),
      ]),
      copyReferencedSvgsPlugin(outDir, resolve(faculty.paths.sharedRoot, 'assets/svgs'), [
        faculty.paths.sharedRoot,
        faculty.paths.selectedFacultyRoot,
      ]),
      svgo({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIds: false,
                  removeComments: true,
                  removeTitle: false,
                  removeDesc: false,
                },
              },
            },
            'removeXMLNS',
          ],
        },
      }),
    ],

    server: {
      open: true,
      fs: {
        // Allow Vite to serve files from the repo root so /@fs/ rewrites
        // can reach src/main.js, src/shared/**, and the selected faculty root.
        allow: [repoRoot],
      },
    },

    preview: {
      fs: {
        allow: [repoRoot],
      },
    },

    build: {
      outDir,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      // Performance optimizations
      minify: 'esbuild', // Fast minification
      cssMinify: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
      rollupOptions: {
        input,
        output: {
          entryFileNames: ({ name }) => {
            const mappedName = name === 'main' ? 'app' : name
            return `assets/js/${mappedName}.js`
          },
          chunkFileNames: ({ name }) => {
            const isVendor = name === 'vendor'
            const chunkName = isVendor ? 'vendor' : name
            return `assets/js/${chunkName}.js`
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          assetFileNames: assetInfo => {
            const ext = extname(assetInfo.name || '').slice(1)
            if (ext === 'css') {
              const cssName = getCssOutputName(assetInfo.name || '') || 'style'
              return `assets/css/${cssName}[extname]`
            }
            if (ext === 'svg') {
              return 'assets/svgs/[name][extname]'
            }
            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(ext)) {
              return 'assets/images/[name][extname]'
            }
            if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext)) {
              return 'assets/fonts/[name][extname]'
            }
            return 'assets/[name][extname]'
          },
        },
      },
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@shared': resolve(__dirname, 'src/shared'),
        '@faculty': faculty.paths.selectedFacultyRoot,
        '@js': resolve(__dirname, 'src/shared/js'),
        '@styles': resolve(__dirname, 'src/shared/styles'),
        '@assets': resolve(__dirname, 'src/shared/assets'),
      },
    },
  }
})
