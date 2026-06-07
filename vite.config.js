import { defineConfig, loadEnv } from 'vite'
import { resolve, extname, basename, dirname, isAbsolute, relative } from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'fs'
import { execSync } from 'child_process'
import svgo from 'vite-plugin-svgo'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DEFAULT_FACULTY_ID = 'health-science'
const FACULTY_REQUIRED_FIELDS = ['id', 'name', 'shortName', 'email', 'phone', 'nav', 'topBar', 'social', 'colors']
const FACULTY_COLOR_KEYS = ['brand-primary', 'brand-accent', 'brand-tint', 'brand-surface']
const VALID_PAGE_TIERS = new Set(['shared-template', 'shared-with-vars', 'faculty-content', 'dev-only'])
const SOCIAL_CONFIG = {
  facebook: {
    label: 'Facebook',
    icon: 'assets/svgs/icon-facebook.svg',
    hoverClass: 'hover:text-[#1877F2]',
  },
  instagram: {
    label: 'Instagram',
    icon: 'assets/svgs/icon-instagram.svg',
    hoverClass: 'hover:text-[#E4405F]',
  },
  youtube: {
    label: 'Youtube',
    icon: 'assets/svgs/icon-youtube.svg',
    hoverClass: 'hover:text-[#FF0000]',
  },
}

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

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

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

const withBaseFactory = (base) => (value = '') => {
  if (!value || value.startsWith('http') || value.startsWith('//') || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value
  }
  const normalized = value.startsWith('/') ? value : `/${value}`
  return base === '/' ? normalized : `${base}${normalized}`.replace(/\/+/g, '/')
}

const hexToRgbSpace = (hex) => {
  const normalized = String(hex || '').trim()
  const match = normalized.match(/^#?([0-9a-fA-F]{6})$/)
  if (!match) {
    throw new Error(`Invalid hex color "${hex}"`)
  }

  const color = match[1]
  const red = Number.parseInt(color.slice(0, 2), 16)
  const green = Number.parseInt(color.slice(2, 4), 16)
  const blue = Number.parseInt(color.slice(4, 6), 16)
  return `${red} ${green} ${blue}`
}

const normalizePageBasename = (value = '') => basename(String(value).trim().replace(/\\/g, '/'))

const parseTierComment = (content = '') => {
  const match = content.match(/^\s*<!--\s*TIER:\s*([a-z-]+)\s*-->/i)
  if (!match) {
    return null
  }
  const tier = match[1].toLowerCase()
  return VALID_PAGE_TIERS.has(tier) ? tier : null
}

const readPageMeta = (rootDir, relativePath) => {
  const normalizedPath = relativePath.replace(/\\/g, '/')
  const absolutePath = resolve(rootDir, relativePath)
  const content = readFileSync(absolutePath, 'utf-8')
  const tier = parseTierComment(content)

  if (!tier) {
    console.warn(`Page ${normalizedPath} chua duoc phan loai tier`)
  }

  return {
    absolutePath,
    basename: normalizePageBasename(relativePath),
    relativePath: normalizedPath,
    tier,
  }
}

const collectPageMetas = (rootDir) => {
  const pageMetas = []
  for (const file of glob.sync('**/*.html', { cwd: rootDir, nodir: true })) {
    pageMetas.push(readPageMeta(rootDir, file))
  }
  return pageMetas
}

const validateFacultyPages = (facultyId, faculty, sharedPageMetas, facultyPageMetas, includeDevPages) => {
  const facultyPageBasenames = new Set(facultyPageMetas.map((page) => page.basename))
  const excludedPages = new Set(faculty.excludePages)
  const knownPageBasenames = new Set([
    ...sharedPageMetas.map((page) => page.basename),
    ...facultyPageMetas.map((page) => page.basename),
  ])

  for (const excludedPage of excludedPages) {
    if (!knownPageBasenames.has(excludedPage)) {
      console.warn(`Faculty '${facultyId}' excludePages contains unknown page "${excludedPage}"`)
    }
  }

  for (const page of sharedPageMetas) {
    if (!includeDevPages && page.relativePath.startsWith('_dev/')) {
      continue
    }
    if (page.tier === 'faculty-content' && !excludedPages.has(page.basename) && !facultyPageBasenames.has(page.basename)) {
      throw new Error(`Faculty '${facultyId}' missing required faculty-content page: ${page.basename}`)
    }
  }
}

const collectNavUrls = (items = [], urls = []) => {
  for (const item of items) {
    if (item?.url) {
      urls.push(item.url)
    }
    if (Array.isArray(item?.children) && item.children.length > 0) {
      collectNavUrls(item.children, urls)
    }
  }
  return urls
}

const loadFaculty = (facultyId) => {
  const facultyDir = resolve(__dirname, 'src/faculties', facultyId)
  const facultyPath = resolve(facultyDir, 'faculty.json')

  if (!existsSync(facultyPath)) {
    throw new Error(`Faculty '${facultyId}' not found at src/faculties/${facultyId}/`)
  }

  const faculty = JSON.parse(readFileSync(facultyPath, 'utf-8'))

  for (const field of FACULTY_REQUIRED_FIELDS) {
    if (faculty[field] === undefined || faculty[field] === null || faculty[field] === '') {
      throw new Error(`Missing required faculty field: ${field}`)
    }
  }

  if (!Array.isArray(faculty.nav)) {
    throw new Error('Missing required faculty field: nav')
  }

  if (!Array.isArray(faculty.topBar)) {
    throw new Error('Missing required faculty field: topBar')
  }

  if (typeof faculty.social !== 'object' || Array.isArray(faculty.social)) {
    throw new Error('Missing required faculty field: social')
  }

  if (typeof faculty.colors !== 'object' || Array.isArray(faculty.colors)) {
    throw new Error('Missing required faculty field: colors')
  }

  // Optional schema fields:
  // - excludePages: array of shared/faculty page basenames to omit from production builds
  faculty.excludePages = Array.isArray(faculty.excludePages)
    ? [...new Set(faculty.excludePages.map(normalizePageBasename).filter(Boolean))]
    : []

  for (const colorKey of FACULTY_COLOR_KEYS) {
    if (!faculty.colors[colorKey]) {
      throw new Error(`Missing required faculty field: colors.${colorKey}`)
    }
    hexToRgbSpace(faculty.colors[colorKey])
  }

  const excludedPages = new Set(faculty.excludePages)
  for (const url of collectNavUrls(faculty.nav)) {
    const pageName = normalizePageBasename(url)
    if (excludedPages.has(pageName)) {
      throw new Error(`Faculty nav url "${url}" points to excluded page "${pageName}"`)
    }
  }

  return faculty
}

const getFacultyPagePath = (facultyId, pageName) => {
  const normalized = pageName.replace(/^\/+/, '')
  const facultyPage = resolve(__dirname, 'src/faculties', facultyId, 'pages', normalized)
  if (existsSync(facultyPage)) {
    return facultyPage
  }
  return resolve(__dirname, 'src/pages', normalized)
}

const collectFacultyPages = (facultyId, options = {}) => {
  const sharedPagesDir = resolve(__dirname, 'src/pages')
  const facultyPagesDir = resolve(__dirname, 'src/faculties', facultyId, 'pages')
  const pageMap = new Map()
  const excludedPages = new Set((options.excludePages || []).map(normalizePageBasename))
  const includeDevPages = options.includeDevPages ?? true
  const sharedPageMetas = collectPageMetas(sharedPagesDir)
  const facultyPageMetas = existsSync(facultyPagesDir) ? collectPageMetas(facultyPagesDir) : []

  validateFacultyPages(facultyId, { excludePages: [...excludedPages] }, sharedPageMetas, facultyPageMetas, includeDevPages)

  for (const page of sharedPageMetas) {
    if (!includeDevPages && page.relativePath.startsWith('_dev/')) {
      continue
    }
    if (excludedPages.has(page.basename)) {
      continue
    }
    pageMap.set(page.relativePath, page.absolutePath)
  }

  if (facultyPageMetas.length > 0) {
    for (const page of facultyPageMetas) {
      if (excludedPages.has(page.basename)) {
        continue
      }
      pageMap.set(page.relativePath, page.absolutePath)
    }
  }

  return pageMap
}

const prepareFacultyWorkspace = (facultyId, faculty, options = {}) => {
  const tempRoot = resolve(__dirname, '.tmp/faculty-build', facultyId)
  const tempPagesDir = resolve(tempRoot, 'pages')
  const pageMap = collectFacultyPages(facultyId, {
    includeDevPages: options.includeDevPages,
    excludePages: faculty.excludePages,
  })
  const mirrorDir = (src, dest) => {
    if (!existsSync(src)) return

    mkdirSync(dest, { recursive: true })
    for (const entry of readdirSync(src, { withFileTypes: true })) {
      const srcPath = resolve(src, entry.name)
      const destPath = resolve(dest, entry.name)
      if (entry.isDirectory()) {
        mirrorDir(srcPath, destPath)
      } else {
        copyFileSync(srcPath, destPath)
      }
    }
  }

  rmSync(tempRoot, { recursive: true, force: true })
  mkdirSync(tempPagesDir, { recursive: true })
  copyFileSync(resolve(__dirname, 'src/main.js'), resolve(tempRoot, 'main.js'))
  for (const dirName of ['components', 'config', 'js', 'styles']) {
    mirrorDir(resolve(__dirname, 'src', dirName), resolve(tempRoot, dirName))
  }

  const input = {}
  for (const [fileName, sourcePath] of pageMap.entries()) {
    const targetPath = resolve(tempPagesDir, fileName)
    mkdirSync(dirname(targetPath), { recursive: true })
    copyFileSync(sourcePath, targetPath)
    input[fileName.replace(/\.html$/i, '').replace(/\\/g, '/')] = targetPath
  }

  return {
    rootDir: tempRoot,
    pagesDir: tempPagesDir,
    input,
  }
}

const buildFacultyCssVars = (faculty) => {
  const declarations = FACULTY_COLOR_KEYS
    .map((key) => `--color-${key}: ${hexToRgbSpace(faculty.colors[key])};`)
    .join('')
  return `<style>:root{${declarations}}</style>`
}

const generateNavHtml = (navArray, base) => {
  const withBase = withBaseFactory(base)
  const baseItemClass =
    'flex items-center justify-center px-3 h-full text-primary-white font-medium text-[16px] xl:hover:bg-white/10 xl:hover:text-primary-yellow transition-all duration-200 relative before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary-yellow before:scale-x-0 xl:hover:before:scale-x-100 before:transition-transform before:duration-300'
  const dropdownItemClass =
    'block px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 border-b border-gray-100 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-yellow before:scale-y-0 xl:hover:before:scale-y-100 before:transition-transform'
  const dropdownItemLastClass =
    'block px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-yellow before:scale-y-0 xl:hover:before:scale-y-100 before:transition-transform'

  const renderTrigger = (item, extraClass = '') => {
    const classes = `${baseItemClass}${extraClass ? ` ${extraClass}` : ''}`
    const label = escapeHtml(item.label)
    if (item.url) {
      return `<a href="${escapeHtml(withBase(item.url))}" class="${classes}">${label}</a>`
    }
    return `<span class="${classes} cursor-pointer">${label}</span>`
  }

  const renderLevelThree = (items = []) =>
    items
      .map((item, index) => {
        const itemClass = index === items.length - 1 ? dropdownItemLastClass : dropdownItemClass
        return `<a href="${escapeHtml(withBase(item.url || '#'))}" class="${itemClass}"><span class="font-medium">${escapeHtml(item.label)}</span></a>`
      })
      .join('')

  const renderLevelTwo = (items = []) =>
    items
      .map((item, index) => {
        if (Array.isArray(item.children) && item.children.length > 0) {
          const itemClass = index === items.length - 1 ? dropdownItemLastClass : dropdownItemClass
          return `<div class="relative group/sub" data-subdropdown>
  <span class="flex items-center justify-between px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 ${index === items.length - 1 ? '' : 'border-b border-gray-100 '}relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-yellow before:scale-y-0 xl:hover:before:scale-y-100 before:transition-transform cursor-pointer">
    <span class="font-medium">${escapeHtml(item.label)}</span>
    <img src="/assets/svgs/chevron-right.svg" alt="" class="chevron-icon w-4 h-4 transition-transform duration-200 xl:group-hover/sub:translate-x-1" />
  </span>
  <div class="sub-dropdown absolute top-0 left-full min-w-[220px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-r-lg opacity-0 invisible pointer-events-none xl:group-hover/sub:opacity-100 xl:group-hover/sub:visible xl:group-hover/sub:pointer-events-auto transition-all duration-300 overflow-hidden z-50" data-subdropdown-menu>
    <div class="border-t-2 border-primary-yellow"></div>
    ${renderLevelThree(item.children)}
  </div>
</div>`
        }

        const itemClass = index === items.length - 1 ? dropdownItemLastClass : dropdownItemClass
        return `<a href="${escapeHtml(withBase(item.url || '#'))}" class="${itemClass}"><span class="font-medium">${escapeHtml(item.label)}</span></a>`
      })
      .join('')

  return navArray
    .map((item) => {
      if (Array.isArray(item.children) && item.children.length > 0) {
        return `<div class="nav-item-dropdown relative group h-full" data-dropdown>
  ${renderTrigger(item, 'cursor-pointer')}
  <div class="dropdown-menu absolute top-full min-w-[250px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-b-lg opacity-0 invisible translate-y-2 xl:group-hover:opacity-100 xl:group-hover:visible xl:group-hover:translate-y-0 transition-all duration-300 z-50" data-dropdown-menu>
    <div class="border-t-2 border-primary-yellow"></div>
    ${renderLevelTwo(item.children)}
  </div>
</div>`
      }

      return `<div class="nav-item-dropdown relative group h-full" data-dropdown>${renderTrigger(item)}</div>`
    })
    .join('')
}

const generateTopBarHtml = (topBarArray, base) => {
  const withBase = withBaseFactory(base)
  return topBarArray
    .map(
      (item, index) =>
        `${index > 0 ? '<span class="h-full w-auto border-l-[1px] border-stroke relative"></span>' : ''}<a href="${escapeHtml(withBase(item.url || '#'))}" class="flex items-center gap-2.5 px-1.5 py-0.5 font-medium text-sm text-primary-dark-blue rounded-[5px] hover:text-primary-yellow transition-colors">${escapeHtml(item.label)}</a>`
    )
    .join('')
}

const generateMobileTopBarHtml = (topBarArray, faculty, base) => {
  const withBase = withBaseFactory(base)
  const quickLinks = topBarArray.slice(0, 3).map((item, index) => {
    const icons = [
      '/assets/svgs/icon-briefcase.svg',
      '/assets/svgs/icon-graduation-cap.svg',
      '/assets/svgs/icon-building.svg',
    ]
    return `<a href="${escapeHtml(withBase(item.url || '#'))}" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="${icons[index]}" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">${escapeHtml(item.label)}</span>
</a>`
  })

  return `${quickLinks.join('')}
<a href="#" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="/assets/svgs/icon-article.svg" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">E-OFFICE</span>
</a>
<a href="mailto:${escapeHtml(faculty.email)}" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="/assets/svgs/icon-mail-outline.svg" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">Email</span>
</a>
<a href="tel:${escapeHtml(faculty.phone.replace(/[^\d+]/g, ''))}" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="/assets/svgs/icon-phone.svg" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">Hotline</span>
</a>`
}

const generateSocialHtml = (social = {}) =>
  Object.entries(SOCIAL_CONFIG)
    .filter(([key]) => Boolean(social[key]))
    .map(
      ([key, config]) => `<li>
  <a href="${escapeHtml(social[key])}" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-2 md:gap-2.5 text-sm md:text-base text-gray-700 ${config.hoverClass} font-roboto transition-colors duration-200">
    <img src="${config.icon}" alt="" class="w-5 h-5 md:w-6 md:h-6">
    <span>${config.label}</span>
  </a>
</li>`
    )
    .join('')

const applyFacultyTemplateVars = (html, faculty, base) => {
  const replacements = {
    '{{faculty.id}}': escapeHtml(faculty.id),
    '{{faculty.name}}': escapeHtml(faculty.name),
    '{{faculty.shortName}}': escapeHtml(faculty.shortName),
    '{{faculty.email}}': escapeHtml(faculty.email),
    '{{faculty.phone}}': escapeHtml(faculty.phone),
    '{{faculty.navHtml}}': generateNavHtml(faculty.nav, base),
    '{{faculty.topBarHtml}}': generateTopBarHtml(faculty.topBar, base),
    '{{faculty.mobileTopBarHtml}}': generateMobileTopBarHtml(faculty.topBar, faculty, base),
    '{{faculty.socialHtml}}': generateSocialHtml(faculty.social),
  }

  let result = html
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.split(placeholder).join(value)
  }
  return result
}

const resolveIncludePath = (htmlPath, facultyId) => {
  if (htmlPath.startsWith('@faculty/')) {
    const relativePath = htmlPath.slice('@faculty/'.length)
    const facultyComponentPath = resolve(__dirname, 'src/faculties', facultyId, 'components', relativePath)
    if (existsSync(facultyComponentPath)) {
      return facultyComponentPath
    }
    return resolve(__dirname, 'src/components', relativePath)
  }

  let componentPath = htmlPath
  if (htmlPath.startsWith('@components/')) {
    componentPath = htmlPath.replace('@components/', 'components/')
  } else if (htmlPath.startsWith('@/')) {
    componentPath = htmlPath.substring(2)
  } else if (htmlPath.startsWith('../')) {
    componentPath = htmlPath.replace(/^\.\.\//, '')
  } else if (htmlPath.startsWith('./')) {
    componentPath = `pages/${htmlPath.slice(2)}`
  } else if (htmlPath.startsWith('/')) {
    componentPath = htmlPath.substring(1)
  }

  return resolve(__dirname, 'src', componentPath)
}

const mapUrlToFsPath = (url, facultyId, workspace) => {
  const [pathname] = url.split('?')

  if (pathname === '/' || pathname === '/index.html') {
    return resolve(workspace.pagesDir, 'index.html')
  }

  if (pathname === '/main.js') {
    return resolve(workspace.rootDir, 'main.js')
  }

  if (/\.html$/i.test(pathname)) {
    const normalizedPagePath = pathname.replace(/^\/+/, '')
    const pagePath = resolve(workspace.pagesDir, normalizedPagePath)
    if (relative(workspace.pagesDir, pagePath).startsWith('..')) {
      return null
    }
    return pagePath
  }

  if (pathname.startsWith('/js/')) {
    return resolve(__dirname, 'src', pathname.slice(1))
  }

  if (pathname.startsWith('/components/')) {
    return resolve(__dirname, 'src', pathname.slice(1))
  }

  if (pathname.startsWith('/assets/')) {
    const relativeAssetPath = pathname.slice('/assets/'.length)
    const facultyAssetPath = resolve(__dirname, 'src/faculties', facultyId, 'assets', relativeAssetPath)
    if (existsSync(facultyAssetPath)) {
      return facultyAssetPath
    }
    return resolve(__dirname, 'src/assets', relativeAssetPath)
  }

  return null
}

const mapSrcRequests = (facultyId, workspace) => ({
  name: 'map-src-requests',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(req.url, facultyId, workspace)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(req.url, facultyId, workspace)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
})

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

// Layout template cache để tránh đọc file nhiều lần
let layoutCache = null
const getLayoutTemplate = () => {
  if (!layoutCache) {
    layoutCache = readFileSync(resolve(__dirname, 'src/layouts/default.html'), 'utf-8')
  }
  return layoutCache
}

const layoutPlugin = (base, faculty, workspace) => ({
  name: 'layout-plugin',
  transformIndexHtml: {
    order: 'pre',
    handler(html, { path, filename }) {
      const titleMatch = html.match(/<!--\s*LAYOUT:\s*title="([^"]+)"\s*-->/)
      const descMatch = html.match(/<!--\s*LAYOUT:\s*description="([^"]+)"\s*-->/)
      const keywordsMatch = html.match(/<!--\s*LAYOUT:\s*keywords="([^"]+)"\s*-->/)
      const ogImageMatch = html.match(/<!--\s*LAYOUT:\s*ogImage="([^"]+)"\s*-->/)
      const urlMatch = html.match(/<!--\s*LAYOUT:\s*url="([^"]+)"\s*-->/)
      const scriptMatch = html.match(/<!--\s*LAYOUT:\s*script="([^"]+)"\s*-->/)

      if (!titleMatch) {
        return applyFacultyTemplateVars(html, faculty, base)
      }

      const layout = getLayoutTemplate()
      const loadingComponent = readFileSync(resolve(__dirname, 'src/components/loading/loading.html'), 'utf-8')
      const withBase = withBaseFactory(base)
      const sourceFile = filename || resolve(workspace.pagesDir, path.replace(/^\/+/, '') || 'index.html')
      const mainScriptPath = relative(dirname(sourceFile), resolve(workspace.rootDir, 'main.js')).replace(/\\/g, '/')
      const content = html.replace(/<!--\s*LAYOUT:[^>]+-->\s*/g, '').trim()
      const title = titleMatch[1]
      const description = descMatch?.[1] || 'Static website với Vite + Vanilla JS + TailwindCSS'
      const keywords = keywordsMatch?.[1] || 'vite, vanilla js, tailwindcss, static site'
      const ogImage = withBase(ogImageMatch?.[1] || '/assets/images/default.jpg')
      const url = urlMatch?.[1] || withBase(path.replace(/\.html$/, ''))
      const pageScript = scriptMatch?.[1]
        ? `<!-- Page-specific JS -->\n  <script type="module" src="${scriptMatch[1]}"></script>`
        : ''

      let result = layout
        .replace(/\{\{title\}\}/g, title)
        .replace(/\{\{description\}\}/g, description)
        .replace(/\{\{keywords\}\}/g, keywords)
        .replace(/\{\{ogImage\}\}/g, ogImage)
        .replace(/\{\{url\}\}/g, url)
        .replace('{{loadingComponent}}', loadingComponent)
        .replace('{{content}}', content)
        .replace(/\{\{pageScript\}\}/g, pageScript)
        .replace('src="/main.js"', `src="${mainScriptPath}"`)

      result = result.replace('</head>', `  ${buildFacultyCssVars(faculty)}\n</head>`)
      result = applyFacultyTemplateVars(result, faculty, base)

      result = result
        .replace(/href="\//g, `href="${base === '/' ? '/' : base}`)
        .replace(/src="\//g, `src="${base === '/' ? '/' : base}`)
        .replace(/content="\//g, `content="${base === '/' ? '/' : base}`)

      return result
    }
  }
})

const transformDataInclude = (base, faculty) => ({
  name: 'transform-data-include',
  transformIndexHtml(html) {
    const withResolvedAssetBase = (assetPath) => {
      const normalizedAssetPath = assetPath.replace(/^\/?assets\//, '')
      return base === '/' ? `/assets/${normalizedAssetPath}` : `${base}assets/${normalizedAssetPath}`
    }

    const processIncludes = (content, depth = 0) => {
      if (depth > 10) {
        console.warn('Max recursion depth reached for data-include')
        return content
      }

      const transformed = content.replace(
        /<div\s+data-include=["']([^"']+)["']([^>]*?)>\s*<\/div>/gs,
        (match, htmlPath, attributes) => {
          try {
            const dataAttrs = {}
            const attrRegex = /data-([\w-]+)=["']([^"']+)["']/g
            let attrMatch
            while ((attrMatch = attrRegex.exec(attributes)) !== null) {
              const key = attrMatch[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
              dataAttrs[key] = attrMatch[2]
            }

            const fullComponentPath = resolveIncludePath(htmlPath, faculty.id)
            let componentHtml = readFileSync(fullComponentPath, 'utf-8').trim()

            const variantNumber = dataAttrs.variant || '1'
            const variantRegex = new RegExp(
              `<!-- option ${variantNumber}[^>]*?-->([\\s\\S]*?)(?=<!-- option \\d|$)`,
              'i'
            )
            const variantMatch = componentHtml.match(variantRegex)
            if (variantMatch) {
              componentHtml = variantMatch[1].trim()
            } else if (componentHtml.includes('<!-- option')) {
              if (variantNumber !== '1') {
                console.warn(`Variant ${variantNumber} not found in ${htmlPath}, falling back to option 1`)
              }
              const fallbackRegex = /<!-- option 1[^>]*?-->([\s\S]*?)(?=<!-- option \d|$)/i
              const fallbackMatch = componentHtml.match(fallbackRegex)
              if (fallbackMatch) {
                componentHtml = fallbackMatch[1].trim()
              } else {
                console.error(`No option 1 found in ${htmlPath}`)
                return '<!-- ERROR: Variant not found and no fallback available -->'
              }
            }

            Object.entries(dataAttrs).forEach(([key, value]) => {
              if (key !== 'include' && key !== 'js' && key !== 'variant') {
                const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
                componentHtml = componentHtml.replace(placeholder, value)
              }
            })

            componentHtml = applyFacultyTemplateVars(componentHtml, faculty, base)
            componentHtml = componentHtml.replace(/^\s*<[^>]+>\s*\{\{(?!faculty\.)[^}]+\}\}\s*<\/[^>]+>\s*$/gm, '')
            componentHtml = componentHtml.replace(/\{\{(?!faculty\.)[^}]+\}\}/g, '')
            return processIncludes(componentHtml, depth + 1)
          } catch (error) {
            console.warn(`Failed to inject component: ${htmlPath}`, error.message)
            return match
          }
        }
      )

      return transformed === content ? content : processIncludes(transformed, depth)
    }

    let transformed = processIncludes(applyFacultyTemplateVars(html, faculty, base))

    transformed = transformed.replace(
      /<img\s+([^>]*?)src=["'](\/?assets\/[^"']+)["']([^>]*?)>/g,
      (match, before, assetPath, after) => {
        return `<img ${before}src="${withResolvedAssetBase(assetPath)}"${after}>`
      }
    )

    transformed = transformed.replace(
      /data-photo-src=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-photo-src="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /srcset=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `srcset="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /data-image=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-image="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /data-featured-image=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-featured-image="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /data-overlayIcon=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-overlayIcon="${withResolvedAssetBase(assetPath)}"`
    )

    return transformed
  }
})

const deepMerge = (baseValue, overrideValue) => {
  if (Array.isArray(baseValue) || Array.isArray(overrideValue)) {
    return overrideValue
  }

  if (
    baseValue &&
    overrideValue &&
    typeof baseValue === 'object' &&
    typeof overrideValue === 'object'
  ) {
    const result = { ...baseValue }
    for (const [key, value] of Object.entries(overrideValue)) {
      result[key] = key in result ? deepMerge(result[key], value) : value
    }
    return result
  }

  return overrideValue
}

const copyDirectory = (src, dest) => {
  if (!existsSync(src)) return

  const entries = readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name)
    const destPath = resolve(dest, entry.name)

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyDirectory(srcPath, destPath)
      continue
    }

    mkdirSync(dirname(destPath), { recursive: true })
    copyFileSync(srcPath, destPath)
  }
}

// Plugin to copy public/data to dist/data with faculty overrides
const copyPublicDataPlugin = (outDir, facultyId) => ({
  name: 'copy-public-data',
  closeBundle() {
    const sharedDataDir = resolve(__dirname, 'public/data')
    const facultyDataDir = resolve(__dirname, 'src/faculties', facultyId, 'data')
    const distDataDir = resolve(outDir, 'data')

    if (!existsSync(sharedDataDir) && !existsSync(facultyDataDir)) return

    mkdirSync(distDataDir, { recursive: true })

    const fileNames = new Set()
    if (existsSync(sharedDataDir)) {
      for (const entry of readdirSync(sharedDataDir, { withFileTypes: true })) {
        if (entry.isFile()) fileNames.add(entry.name)
      }
    }
    if (existsSync(facultyDataDir)) {
      for (const entry of readdirSync(facultyDataDir, { withFileTypes: true })) {
        if (entry.isFile()) fileNames.add(entry.name)
      }
    }

    for (const fileName of fileNames) {
      const sharedPath = resolve(sharedDataDir, fileName)
      const facultyPath = resolve(facultyDataDir, fileName)
      const destPath = resolve(distDataDir, fileName)
      const isJson = fileName.endsWith('.json')

      if (isJson && existsSync(sharedPath) && existsSync(facultyPath)) {
        const merged = deepMerge(
          JSON.parse(readFileSync(sharedPath, 'utf-8')),
          JSON.parse(readFileSync(facultyPath, 'utf-8'))
        )
        writeFileSync(destPath, JSON.stringify(merged, null, 2))
      } else if (existsSync(facultyPath)) {
        copyFileSync(facultyPath, destPath)
      } else if (existsSync(sharedPath)) {
        copyFileSync(sharedPath, destPath)
      }
    }
  }
})

// Plugin to copy src/assets/images to dist/assets/images
const copyImagesPlugin = (outDir) => ({
  name: 'copy-images',
  closeBundle() {
    const srcImagesDir = resolve(__dirname, 'src/assets/images')
    const distImagesDir = resolve(outDir, 'assets/images')

    if (!existsSync(srcImagesDir)) {
      return
    }

    mkdirSync(distImagesDir, { recursive: true })
    copyDirectory(srcImagesDir, distImagesDir)
  }
})

// Plugin to copy src/assets/svgs to dist/assets/svgs
const copySvgsPlugin = (outDir) => ({
  name: 'copy-svgs',
  closeBundle() {
    const srcSvgsDir = resolve(__dirname, 'src/assets/svgs')
    const distSvgsDir = resolve(outDir, 'assets/svgs')

    if (!existsSync(srcSvgsDir)) {
      return
    }

    mkdirSync(distSvgsDir, { recursive: true })
    copyDirectory(srcSvgsDir, distSvgsDir)
  }
})

const copyFacultyAssetsPlugin = (outDir, facultyId) => ({
  name: 'copy-faculty-assets',
  closeBundle() {
    const facultyAssetsDir = resolve(__dirname, 'src/faculties', facultyId, 'assets')
    if (!existsSync(facultyAssetsDir)) {
      return
    }

    copyDirectory(facultyAssetsDir, resolve(outDir, 'assets'))
  }
})

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const facultyId = env.VITE_FACULTY || DEFAULT_FACULTY_ID
  const faculty = loadFaculty(facultyId)
  const workspace = prepareFacultyWorkspace(facultyId, faculty, {
    includeDevPages: command !== 'build',
  })
  const base = normalizeBasePath(env.VITE_BASE_PATH || '/')
  const outDir = resolveOutDir(env.VITE_OUT_DIR || '')
  const buildSignature = mode === 'production' ? getBuildSignature() : 'dev-mode'
  const input = workspace.input

  const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
  const appVersion = pkg.version || '0.0.0'

  return {
    base,
    root: workspace.pagesDir,
    publicDir: resolve(__dirname, 'public'),
    define: {
      __BUILD_SIGNATURE__: JSON.stringify(buildSignature),
      __APP_VERSION__: JSON.stringify(appVersion),
      __BUILD_MODE__: JSON.stringify(mode)
    },
    plugins: [
      mapSrcRequests(facultyId, workspace),
      layoutPlugin(base, faculty, workspace),
      transformDataInclude(base, faculty),
      copyPublicDataPlugin(outDir, facultyId),
      copyImagesPlugin(outDir),
      copySvgsPlugin(outDir),
      copyFacultyAssetsPlugin(outDir, facultyId),
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
        allow: ['..', resolve(__dirname)],
      },
    },

    build: {
      outDir,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      minify: 'esbuild',
      cssMinify: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
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
        '@components': resolve(__dirname, 'src/components'),
        '@js': resolve(__dirname, 'src/js'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@assets': resolve(__dirname, 'src/assets'),
      },
    },
  }
})
