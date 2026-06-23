import { defineConfig, loadEnv } from 'vite'
import { resolve, relative, extname, basename, dirname, isAbsolute } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { execSync } from 'child_process'
import svgo from 'vite-plugin-svgo'
import { twMerge } from 'tailwind-merge'
import { copyReferencedSvgs } from './scripts/svg-assets.js'

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

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const loadFacultyNewsData = (facultyDataRoot) => {
  const newsFile = resolve(facultyDataRoot, 'news.json')
  if (!existsSync(newsFile)) return { section: {}, items: [] }

  try {
    const data = JSON.parse(readFileSync(newsFile, 'utf-8'))
    return {
      section: data.section || {},
      items: Array.isArray(data.items) ? data.items.filter((item) => item?.title) : [],
    }
  } catch (error) {
    console.warn(`Failed to read faculty news data: ${newsFile}`, error.message)
    return { section: {}, items: [] }
  }
}

const createNewsRenderer = (base, facultyDataRoot) => {
  const newsData = loadFacultyNewsData(facultyDataRoot)
  const items = newsData.items
  const withBase = (path) => {
    if (!path || path.startsWith('http') || path.startsWith('//')) return path
    const normalized = path.startsWith('/') ? path : `/${path}`
    return base === '/' ? normalized : `${base}${normalized.slice(1)}`
  }
  const newsLink = () => withBase('/news-detail.html')
  const icon = (name) => withBase(`/assets/svgs/${name}`)
  const image = (item) => withBase(item.image || '/assets/images/default.jpg')

  const card = (item) => `
    <article class="group relative bg-primary-white hover:rounded-[10px] overflow-hidden w-full h-full flex flex-col p-2 md:p-2.5 pb-3 md:pb-4 hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${newsLink()}" class="absolute inset-0 z-30" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="block relative w-full aspect-video rounded-[5px] overflow-hidden mb-2 md:mb-2.5">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge absolute top-3 right-3">new</div>
      <div class="flex flex-col flex-1 justify-between w-full">
        <div class="flex flex-col gap-2 md:gap-2.5">
          <h3 class="font-roboto font-medium text-base md:text-lg leading-normal text-title group-hover:text-primary-dark-blue overflow-hidden line-clamp-2 transition-colors duration-300">${escapeHtml(item.title)}</h3>
          <p class="font-roboto font-normal text-sm md:text-base leading-normal text-black overflow-hidden line-clamp-3">${escapeHtml(item.excerpt || '')}</p>
        </div>
        <div class="flex flex-col gap-3 md:gap-4 mt-auto">
          <div class="w-full h-0 border-t border-stroke transition-colors duration-300"></div>
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-[3px] bg-primary-white border border-danger rounded-[5px] group-hover:bg-danger-light transition-all duration-300">
              <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 text-danger shrink-0 transition-all duration-300" />
              <span class="font-roboto font-medium text-xs md:text-sm leading-normal text-danger transition-colors duration-300">${escapeHtml(item.date || '')}</span>
            </div>
            <span class="inline-flex items-center gap-[2px] font-roboto font-medium text-sm md:text-base leading-normal text-gray group-hover:text-primary-dark-blue transition-colors duration-300">Xem thêm</span>
          </div>
        </div>
      </div>
    </article>`

  const eventCard = (item) => `
    <article class="group relative bg-white border border-stroke rounded-[5px] md:rounded-[8px] shadow-[1px_1px_10px_0_rgba(0,0,0,0.1)] p-2 md:p-2.5 w-full hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${newsLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="flex flex-col md:flex-row gap-2 md:gap-2.5 h-full">
        <div class="relative shrink-0 w-full md:w-[240px] lg:w-[280px] h-[180px] md:h-[150px] lg:h-[170px] rounded-[5px] overflow-hidden">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge absolute top-3 right-3 md:left-3 md:right-auto">new</div>
        <div class="flex-1 flex flex-col justify-between py-0 md:py-1.5 min-w-0">
          <div class="flex flex-col gap-2 md:gap-2.5">
            <h3 class="font-roboto font-medium text-base md:text-lg leading-normal text-gray-900 line-clamp-2 group-hover:text-primary-dark-blue transition-colors duration-200">${escapeHtml(item.title)}</h3>
            <p class="font-roboto font-normal text-sm md:text-base leading-normal text-gray-700 line-clamp-2">${escapeHtml(item.excerpt || '')}</p>
          </div>
          <div class="flex flex-col gap-2 md:gap-2.5 mt-2 md:mt-0">
            <div class="w-full h-px bg-stroke"></div>
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center gap-1 md:gap-1.5 px-1.5 py-0.5 bg-white border border-danger rounded-[5px]">
                <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 shrink-0 text-danger" />
                <span class="font-roboto font-medium text-xs md:text-sm leading-normal text-danger">${escapeHtml(item.date || '')}</span>
              </div>
              <span class="font-roboto font-medium text-sm md:text-base leading-normal text-gray-600 group-hover:text-primary-dark-blue transition-colors duration-200">Xem thêm</span>
            </div>
          </div>
        </div>
      </div>
    </article>`

  const sidebarCard = (item, featured = false) => featured ? `
    <article class="group relative flex flex-col gap-2 md:gap-2.5 w-full bg-[#FAFAFA] border border-stroke rounded-[5px] md:rounded-[8px] p-2 md:p-2.5 hover:bg-white hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${newsLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="relative w-full h-[130px] md:h-[150px] rounded-[5px] overflow-hidden">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      </div>
      <div class="flex flex-col gap-2 md:gap-2.5">
        <h3 class="font-roboto font-medium text-sm md:text-base leading-normal text-gray-900 group-hover:text-primary-dark-blue transition-colors duration-200 line-clamp-3">${escapeHtml(item.title)}</h3>
        <div class="flex gap-2.5 items-center">
          <div class="inline-flex items-center gap-1 md:gap-1.5 bg-danger-light rounded-[5px] px-1.5 py-[3px] self-start">
            <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 text-danger">
            <span class="font-roboto font-medium text-xs md:text-sm text-danger">${escapeHtml(item.date || '')}</span>
          </div>
          <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge">new</div>
        </div>
      </div>
    </article>` : `
    <article class="group flex flex-col gap-1 md:gap-1.5 w-full">
      <div class="w-full h-px bg-stroke"></div>
      <div class="relative flex gap-2 md:gap-2.5 bg-[#FAFAFA] border border-stroke rounded-[5px] md:rounded-[8px] p-2 md:p-2.5 hover:bg-white hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
        <a href="${newsLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
        <div class="relative shrink-0 w-[70px] h-[70px] md:w-[85px] md:h-[85px] rounded-[5px] overflow-hidden">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="flex-1 flex flex-col gap-2 md:gap-2.5 min-w-0">
          <h3 class="font-roboto font-medium text-sm md:text-base leading-normal text-gray-900 group-hover:text-primary-dark-blue transition-colors duration-200 line-clamp-2 overflow-hidden text-ellipsis">${escapeHtml(item.title)}</h3>
          <div class="flex gap-2.5 items-center">
            <div class="inline-flex items-center gap-1 md:gap-1.5 bg-danger-light rounded-[5px] px-1.5 py-[3px] self-start">
              <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 text-danger" />
              <span class="font-roboto font-medium text-xs md:text-sm text-danger">${escapeHtml(item.date || '')}</span>
            </div>
            <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge">new</div>
          </div>
        </div>
      </div>
    </article>`

  const articleBlock = (block) => {
    if (!block) return ''
    if (block.type === 'heading') {
      const tag = block.level === 3 ? 'h3' : 'h2'
      return `<${tag}>${escapeHtml(block.text)}</${tag}>`
    }
    if (block.type === 'list') {
      return `<ul>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    }
    if (block.type === 'notice' || block.type === 'info') {
      const color = block.type === 'notice' ? 'danger' : 'primary-dark-blue'
      const bg = block.type === 'notice' ? 'bg-danger-light border-danger' : 'bg-secondary-blue-light border-secondary-blue'
      return `<div class="${bg} border-l-4 p-4 md:p-6 rounded-lg my-6"><h3 class="font-bold text-${color} mb-2">${escapeHtml(block.title || '')}</h3><p class="text-sm text-gray">${escapeHtml(block.text || '')}</p></div>`
    }
    return `<p>${escapeHtml(block.text || '')}</p>`
  }

  const section = (limit = 5) => `
    <div class="container mx-auto px-4 flex flex-col items-center">
      <div class="max-w-3xl text-center">
        ${newsData.section?.eyebrow ? `<span class="font-roboto font-normal text-base md:text-lg text-secondary-blue block mb-2">${escapeHtml(newsData.section.eyebrow)}</span>` : ''}
        <h2 class="font-inter font-bold text-title text-center text-2xl md:text-4xl leading-tight mb-3">${escapeHtml(newsData.section?.title || 'Tin tức')}</h2>
        <p class="font-roboto text-gray-700">${escapeHtml(newsData.section?.description || '')}</p>
      </div>
      <div class="w-full relative">
        <div class="news-swiper py-4 md:py-6 lg:py-8"><div class="swiper-wrapper">${items.slice(0, limit).map((item) => `<div class="swiper-slide">${card(item)}</div>`).join('')}</div></div>
      </div>
      <div class="flex items-center gap-4 md:gap-5 lg:gap-[21px]">
        <button class="news-nav-prev bg-primary-white border border-stroke rounded-full p-2 md:p-2.5 hover:border-primary-dark-blue hover:bg-primary-dark-blue/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous news"><img src="${icon('icon-chevron-left.svg')}" alt="" class="w-6 h-6 md:w-[30px] md:h-[30px]" /></button>
        <button class="news-nav-next bg-primary-white border border-stroke rounded-full p-2 md:p-2.5 hover:border-primary-dark-blue hover:bg-primary-dark-blue/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next news"><img src="${icon('icon-chevron-right.svg')}" alt="" class="w-6 h-6 md:w-[30px] md:h-[30px]" /></button>
      </div>
    </div>`

  const detail = () => {
    const item = items[0]
    if (!item) return '<p class="font-roboto text-gray-700">Chưa có nội dung tin tức.</p>'
    return `
      <article class="bg-white rounded-2xl border border-stroke shadow-sm p-4 md:p-6">
        <div class="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
          <h1 class="font-inter font-bold text-lg md:text-2xl leading-normal text-primary-dark-blue">${escapeHtml(item.title)}</h1>
          <div class="w-full h-px bg-stroke"></div>
          <div class="inline-flex items-center gap-1.5 bg-danger-light rounded-[5px] px-1.5 py-[3px] self-start">
            <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
            <span class="font-roboto font-medium text-xs sm:text-sm text-danger">${escapeHtml(item.date || '')}</span>
          </div>
        </div>
        <figure class="relative w-full aspect-video rounded-xl overflow-hidden mb-6 md:mb-8">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover" />
          ${item.caption ? `<figcaption class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-primary-white text-sm">${escapeHtml(item.caption)}</figcaption>` : ''}
        </figure>
        <div class="article-content">${(item.content || []).map(articleBlock).join('')}</div>
      </article>`
  }

  const stripNewsAttrs = (openTag) =>
    openTag
      .replace(/\sdata-news-[\w-]+(?:=["'][^"']*["'])?/g, '')
      .replace(/\sdata-limit=["'][^"']*["']/g, '')

  const replaceInner = (html, attr, render) =>
    html.replace(new RegExp(`(<[^>]+\\s${attr}(?:\\s[^>]*)?>)[\\s\\S]*?(<\\/[^>]+>)`, 'g'), (match, open, close) => `${stripNewsAttrs(open)}${render(match)}${close}`)

  return (html) => {
    let result = html
    result = result.replace(/(<section[^>]*\sdata-news-section(?:\s[^>]*)?>)[\s\S]*?(<\/section>)/g, (match, open, close) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 5)
      return `${stripNewsAttrs(open)}${section(limit)}${close}`
    })
    result = replaceInner(result, 'data-news-list', () => items.map(eventCard).join(''))
    result = replaceInner(result, 'data-news-detail', detail)
    result = replaceInner(result, 'data-news-carousel-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 5)
      return items.slice(0, limit).map((item) => `<div class="swiper-slide !h-auto">${card(item)}</div>`).join('')
    })
    result = replaceInner(result, 'data-news-sidebar-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 4)
      return items.slice(0, limit).map((item, index) => sidebarCard(item, index === 0)).join('')
    })
    result = replaceInner(result, 'data-news-announcement-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 3)
      const selected = items.filter((item) => item.category?.toLowerCase().includes('thông báo')).slice(0, limit)
      const fallback = selected.length ? selected : items.slice(0, limit)
      return fallback.map((item, index) => sidebarCard(item, index === 0)).join('')
    })
    return result
  }
}

const loadFacultyActivitiesData = (facultyDataRoot) => {
  const activitiesFile = resolve(facultyDataRoot, 'activities.json')
  if (!existsSync(activitiesFile)) return { section: {}, items: [] }

  try {
    const data = JSON.parse(readFileSync(activitiesFile, 'utf-8'))
    return {
      section: data.section || {},
      items: Array.isArray(data.items) ? data.items.filter((item) => item?.title) : [],
    }
  } catch (error) {
    console.warn(`Failed to read faculty activities data: ${activitiesFile}`, error.message)
    return { section: {}, items: [] }
  }
}

const createActivitiesRenderer = (base, facultyDataRoot) => {
  const activitiesData = loadFacultyActivitiesData(facultyDataRoot)
  const items = activitiesData.items
  const withBase = (path) => {
    if (!path || path.startsWith('http') || path.startsWith('//')) return path
    const normalized = path.startsWith('/') ? path : `/${path}`
    return base === '/' ? normalized : `${base}${normalized.slice(1)}`
  }
  const detailLink = () => withBase('/activities-details.html')
  const icon = (name) => withBase(`/assets/svgs/${name}`)
  const image = (item) => withBase(item.image || '/assets/images/default.jpg')

  const activityMeta = (item, compact = false) => `
    <div class="flex flex-wrap items-center gap-2">
      <span class="inline-flex rounded-md bg-secondary-blue-light px-2 py-1 font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
      <span class="inline-flex items-center gap-1 font-roboto text-xs font-medium text-gray-700">
        <img src="${icon('icon-calendar-check.svg')}" alt="" class="${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}" />
        ${escapeHtml(item.date || '')}
      </span>
    </div>`

  const card = (item) => `
    <article class="group relative flex h-full flex-col overflow-hidden rounded-lg border border-stroke bg-primary-white p-2 shadow-[1px_1px_10px_0_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-secondary-blue hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.18)]">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <figure class="relative aspect-video overflow-hidden rounded-md bg-secondary-blue-light">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </figure>
      <div class="flex flex-1 flex-col gap-2.5 p-2.5">
        ${activityMeta(item, true)}
        <h3 class="font-roboto text-base font-medium leading-normal text-title line-clamp-2 transition-colors duration-300 group-hover:text-primary-dark-blue">${escapeHtml(item.title)}</h3>
        <p class="font-roboto text-sm leading-relaxed text-gray-700 line-clamp-3">${escapeHtml(item.excerpt || '')}</p>
      </div>
    </article>`

  const listCard = (item) => `
    <article class="group relative bg-white border border-stroke rounded-[5px] md:rounded-[8px] shadow-[1px_1px_10px_0_rgba(0,0,0,0.1)] p-2 md:p-2.5 w-full hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="flex flex-col md:flex-row gap-2 md:gap-2.5 h-full">
        <div class="relative shrink-0 w-full md:w-[240px] lg:w-[280px] h-[180px] md:h-[150px] lg:h-[170px] rounded-[5px] overflow-hidden">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge absolute top-3 right-3 md:left-3 md:right-auto">new</div>
        <div class="flex-1 flex flex-col justify-between py-0 md:py-1.5 min-w-0">
          <div class="flex flex-col gap-2 md:gap-2.5">
            <span class="inline-flex rounded-md bg-secondary-blue-light px-2 py-1 font-roboto text-xs font-bold text-primary-dark-blue self-start">${escapeHtml(item.category || 'Hoạt động')}</span>
            <h3 class="font-roboto font-medium text-base md:text-lg leading-normal text-gray-900 line-clamp-2 group-hover:text-primary-dark-blue transition-colors duration-200">${escapeHtml(item.title)}</h3>
            <p class="font-roboto font-normal text-sm md:text-base leading-normal text-gray-700 line-clamp-2">${escapeHtml(item.excerpt || '')}</p>
          </div>
          <div class="flex flex-col gap-2 md:gap-2.5 mt-2 md:mt-0">
            <div class="w-full h-px bg-stroke"></div>
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center gap-1 md:gap-1.5 px-1.5 py-0.5 bg-white border border-danger rounded-[5px]">
                <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 shrink-0 text-danger" />
                <span class="font-roboto font-medium text-xs md:text-sm leading-normal text-danger">${escapeHtml(item.date || '')}</span>
              </div>
              <span class="font-roboto font-medium text-sm md:text-base leading-normal text-gray-600 group-hover:text-primary-dark-blue transition-colors duration-200">Xem thêm</span>
            </div>
          </div>
        </div>
      </div>
    </article>`

  const sidebarCard = (item, featured = false) => featured ? `
    <article class="group relative flex flex-col gap-2 rounded-lg border border-stroke bg-[#FAFAFA] p-2 transition-all duration-300 hover:border-secondary-blue hover:bg-white hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.16)]">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <figure class="h-[130px] overflow-hidden rounded-md bg-secondary-blue-light md:h-[150px]">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </figure>
      <div class="flex flex-col gap-2">
        <span class="self-start rounded-md bg-secondary-blue-light px-2 py-1 font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
        <h3 class="font-roboto text-sm font-medium leading-normal text-gray-900 line-clamp-3 transition-colors duration-300 group-hover:text-primary-dark-blue md:text-base">${escapeHtml(item.title)}</h3>
      </div>
    </article>` : `
    <article class="group relative flex gap-2 rounded-lg border border-stroke bg-[#FAFAFA] p-2 transition-all duration-300 hover:border-secondary-blue hover:bg-white hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.16)]">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <figure class="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md bg-secondary-blue-light md:h-[85px] md:w-[85px]">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </figure>
      <div class="min-w-0 flex-1">
        <span class="font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
        <h3 class="mt-1 font-roboto text-sm font-medium leading-normal text-gray-900 line-clamp-2 transition-colors duration-300 group-hover:text-primary-dark-blue md:text-base">${escapeHtml(item.title)}</h3>
      </div>
    </article>`

  const articleBlock = (block) => {
    if (!block) return ''
    if (block.type === 'heading') {
      const tag = block.level === 3 ? 'h3' : 'h2'
      return `<${tag}>${escapeHtml(block.text)}</${tag}>`
    }
    if (block.type === 'list') {
      return `<ul>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    }
    if (block.type === 'notice') {
      return `<div class="my-6 rounded-lg border-l-4 border-danger bg-danger-light p-4 md:p-6"><h3 class="mb-2 font-bold text-danger">${escapeHtml(block.title || '')}</h3><p class="text-sm text-gray">${escapeHtml(block.text || '')}</p></div>`
    }
    if (block.type === 'info') {
      return `<div class="my-6 rounded-lg border-l-4 border-secondary-blue bg-secondary-blue-light p-4 md:p-6"><h3 class="mb-2 font-bold text-primary-dark-blue">${escapeHtml(block.title || '')}</h3><p class="text-sm text-gray">${escapeHtml(block.text || '')}</p></div>`
    }
    return `<p>${escapeHtml(block.text || '')}</p>`
  }

  const detail = () => {
    const item = items[0]
    if (!item) return '<p class="font-roboto text-gray-700">Chưa có nội dung hoạt động.</p>'
    return `
      <article class="rounded-2xl border border-stroke bg-white p-4 shadow-sm md:p-6">
        <div class="mb-6 flex flex-col gap-3 md:mb-8 md:gap-4">
          <span class="self-start rounded-md bg-secondary-blue-light px-2.5 py-1 font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
          <h1 class="font-inter text-xl font-bold leading-tight text-primary-dark-blue md:text-3xl">${escapeHtml(item.title)}</h1>
          <div class="h-px w-full bg-stroke"></div>
          <div class="inline-flex items-center gap-1.5 self-start rounded-md bg-primary-white px-1.5 py-[3px] font-roboto text-xs font-medium text-gray-700 md:text-sm">
            <img src="${icon('icon-calendar-check.svg')}" alt="" class="h-4 w-4 md:h-5 md:w-5" />
            ${escapeHtml(item.date || '')}
          </div>
        </div>
        <figure class="relative mb-6 aspect-video overflow-hidden rounded-xl bg-secondary-blue-light md:mb-8">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover" />
          ${item.caption ? `<figcaption class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-4 text-sm text-primary-white">${escapeHtml(item.caption)}</figcaption>` : ''}
        </figure>
        <div class="article-content">${(item.content || []).map(articleBlock).join('')}</div>
      </article>`
  }

  const categoryItems = () => {
    const counts = items.reduce((acc, item) => {
      const category = item.category || 'Hoạt động'
      acc.set(category, (acc.get(category) || 0) + 1)
      return acc
    }, new Map())

    return `<div class="flex flex-col gap-2">${Array.from(counts.entries()).map(([category, count]) => `
      <a href="${withBase('/activities.html')}" class="flex items-center justify-between rounded-md border border-stroke bg-[#FAFAFA] px-3 py-2 font-roboto text-sm transition-all duration-300 hover:border-primary-dark-blue hover:bg-secondary-blue-light hover:text-primary-dark-blue">
        <span class="font-medium text-gray-700">${escapeHtml(category)}</span>
        <span class="rounded bg-primary-white px-2 py-0.5 text-xs font-bold text-primary-dark-blue">${count}</span>
      </a>`).join('')}</div>`
  }

  const stripActivitiesAttrs = (openTag) =>
    openTag
      .replace(/\sdata-activities-[\w-]+(?:=["'][^"']*["'])?/g, '')
      .replace(/\sdata-limit=["'][^"']*["']/g, '')

  const replaceInner = (html, attr, render) =>
    html.replace(new RegExp(`(<[^>]+\\s${attr}(?:\\s[^>]*)?>)[\\s\\S]*?(<\\/[^>]+>)`, 'g'), (match, open, close) => `${stripActivitiesAttrs(open)}${render(match)}${close}`)

  return (html) => {
    let result = html
    result = replaceInner(result, 'data-activities-list', () => items.map(listCard).join(''))
    result = replaceInner(result, 'data-activities-detail', detail)
    result = replaceInner(result, 'data-activities-sidebar-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 4)
      return items.slice(0, limit).map((item, index) => sidebarCard(item, index === 0)).join('')
    })
    result = replaceInner(result, 'data-activities-carousel-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 5)
      return items.slice(0, limit).map((item) => `<div class="swiper-slide !h-auto">${card(item)}</div>`).join('')
    })
    result = replaceInner(result, 'data-activities-category-items', categoryItems)
    return result
  }
}

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
