import { defineConfig, loadEnv } from 'vite'
import { resolve, extname, basename, dirname, isAbsolute } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { execSync } from 'child_process'
import svgo from 'vite-plugin-svgo'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

// Lấy tất cả page HTML
const htmlFiles = glob.sync('**/*.html', {
  cwd: resolve(__dirname, 'src/pages')
})

// Map page cho Rollup
const input = {}
htmlFiles.forEach(file => {
  const name = file.replace('.html', '')
  input[name] = resolve(__dirname, 'src/pages', file)
})

const mapSrcRequests = () => ({
  name: 'map-src-requests',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(req.url)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(req.url)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
})

const mapUrlToFsPath = (url) => {
  if (url === '/main.js') {
    return resolve(__dirname, 'src/main.js')
  }
  if (url.startsWith('/js/')) {
    return resolve(__dirname, 'src', url.slice(1))
  }
  if (url.startsWith('/components/')) {
    return resolve(__dirname, 'src', url.slice(1))
  }
  if (url.startsWith('/assets/')) {
    return resolve(__dirname, 'src', url.slice(1))
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
    layoutCache = readFileSync(resolve(__dirname, 'src/layouts/default.html'), 'utf-8')
  }
  return layoutCache
}

const layoutPlugin = (base) => ({
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
      
      // Nếu không có marker LAYOUT thì skip (giữ nguyên HTML - full page)
      if (!titleMatch) {
        return html
      }
      
      // Load layout template (cached)
      const layout = getLayoutTemplate()
      
      // Load loading component (inline CSS critical)
      const loadingComponent = readFileSync(resolve(__dirname, 'src/components/loading/loading.html'), 'utf-8')
      
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
        .replace(/\{\{pageScript\}\}/g, pageScript)
      
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

const transformDataInclude = (base) => ({
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
            if (htmlPath.startsWith('@components/')) {
              // @components/section-title/... → components/section-title/...
              componentPath = htmlPath.replace('@components/', 'components/')
            } else if (htmlPath.startsWith('@/')) {
              // @/components/... → components/...
              componentPath = htmlPath.substring(2)
            } else if (htmlPath.startsWith('../')) {
              // ../components/... → components/...
              componentPath = htmlPath.replace(/^\.\.\//, '')
            } else if (htmlPath.startsWith('./')) {
              // ./header.html → pages/header.html
              componentPath = `pages/${htmlPath.slice(2)}`
            } else if (base !== '/' && htmlPath.startsWith(base)) {
              componentPath = htmlPath.substring(base.length)
            } else if (htmlPath.startsWith('/')) {
              // /components/... → components/...
              componentPath = htmlPath.substring(1)
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

// Plugin to copy public/data to dist_iuh/data
const copyPublicDataPlugin = (outDir) => ({
  name: 'copy-public-data',
  closeBundle() {
    const publicDataDir = resolve(__dirname, 'public/data')
    const distDataDir = resolve(outDir, 'data')
    
    if (!existsSync(publicDataDir)) return
    
    // Create dist/data if not exists
    if (!existsSync(distDataDir)) {
      mkdirSync(distDataDir, { recursive: true })
    }
    
    // Copy all files from public/data to dist/data
    const copyRecursive = (src, dest) => {
      const entries = readdirSync(src, { withFileTypes: true })
      
      for (const entry of entries) {
        const srcPath = resolve(src, entry.name)
        const destPath = resolve(dest, entry.name)
        
        if (entry.isDirectory()) {
          if (!existsSync(destPath)) {
            mkdirSync(destPath, { recursive: true })
          }
          copyRecursive(srcPath, destPath)
        } else {
          copyFileSync(srcPath, destPath)
          console.log(`Copied: ${entry.name} to data/`)
        }
      }
    }
    
    copyRecursive(publicDataDir, distDataDir)
  }
})

// Plugin to copy src/assets/images to dist_iuh/assets/images
const copyImagesPlugin = (outDir) => ({
  name: 'copy-images',
  closeBundle() {
    const srcImagesDir = resolve(__dirname, 'src/assets/images')
    const distImagesDir = resolve(outDir, 'assets/images')
    
    if (!existsSync(srcImagesDir)) {
      console.log('⚠️  No images folder found in src/assets/')
      return
    }
    
    // Create dist/assets/images if not exists
    if (!existsSync(distImagesDir)) {
      mkdirSync(distImagesDir, { recursive: true })
    }
    
    // Copy all files recursively from src/assets/images to dist/assets/images
    const copyRecursive = (src, dest) => {
      const entries = readdirSync(src, { withFileTypes: true })
      
      for (const entry of entries) {
        const srcPath = resolve(src, entry.name)
        const destPath = resolve(dest, entry.name)
        
        if (entry.isDirectory()) {
          if (!existsSync(destPath)) {
            mkdirSync(destPath, { recursive: true })
          }
          copyRecursive(srcPath, destPath)
        } else {
          copyFileSync(srcPath, destPath)
          console.log(`✓ Copied image: ${entry.name}`)
        }
      }
    }
    
    console.log('📸 Copying images to assets/images...')
    copyRecursive(srcImagesDir, distImagesDir)
  }
})

// Plugin to copy src/assets/svgs to dist_iuh/assets/svgs
const copySvgsPlugin = (outDir) => ({
  name: 'copy-svgs',
  closeBundle() {
    const srcSvgsDir = resolve(__dirname, 'src/assets/svgs')
    const distSvgsDir = resolve(outDir, 'assets/svgs')
    
    if (!existsSync(srcSvgsDir)) {
      console.log('⚠️  No svgs folder found in src/assets/')
      return
    }
    
    // Create dist/assets/svgs if not exists
    if (!existsSync(distSvgsDir)) {
      mkdirSync(distSvgsDir, { recursive: true })
    }
    
    // Copy all SVG files
    const entries = readdirSync(srcSvgsDir, { withFileTypes: true })
    let count = 0
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.svg')) {
        const srcPath = resolve(srcSvgsDir, entry.name)
        const destPath = resolve(distSvgsDir, entry.name)
        copyFileSync(srcPath, destPath)
        count++
      }
    }
    
    console.log(`✓ Copied ${count} SVG files to assets/svgs/`)
  }
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const base = normalizeBasePath(env.VITE_BASE_PATH || '/')
  const outDir = resolveOutDir(env.VITE_OUT_DIR || '')
  const buildSignature = mode === 'production' ? getBuildSignature() : 'dev-mode'

  return {
    base,
    root: 'src/pages',
    publicDir: resolve(__dirname, 'public'),
    define: {
      __BUILD_SIGNATURE__: JSON.stringify(buildSignature)
    },
    plugins: [
      mapSrcRequests(),
      layoutPlugin(base), // Chạy TRƯỚC để wrap layout
      transformDataInclude(base), // Chạy SAU để inject components vào layout
      copyPublicDataPlugin(outDir), // Copy public/data to dist/data
      copyImagesPlugin(outDir), // Copy src/assets/images to dist/assets/images
      copySvgsPlugin(outDir), // Copy src/assets/svgs to dist/assets/svgs
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
        allow: ['..'],
      },
    },

    build: {
      outDir,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        input,
        output: {
          entryFileNames: ({ name }) => {
            const mappedName = name === 'main' ? 'app' : name
            return `assets/js/${mappedName}-[hash].js`
          },
          chunkFileNames: ({ name }) => {
            const isVendor = name === 'vendor'
            const chunkName = isVendor ? 'vendor' : name
            return `assets/js/${chunkName}-[hash].js`
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
              return `assets/css/${cssName}-[hash][extname]`
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
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@js': resolve(__dirname, 'src/js'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@assets': resolve(__dirname, 'src/assets'),
      },
    },
  }
})
