import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const EXTERNAL_HREF_RE = /^(?:https?:|mailto:|tel:|\/\/|#)/i

const fail = (facultyId, message) => {
  throw new Error(`Invalid site data for faculty "${facultyId}": ${message}`)
}

const requireString = (value, path, facultyId) => {
  if (typeof value !== 'string' || value.trim() === '') fail(facultyId, `${path} must be a non-empty string`)
}

const validateHref = (href, path, facultyId, pageRoutes) => {
  requireString(href, path, facultyId)
  if (EXTERNAL_HREF_RE.test(href)) return

  const pathname = href.split(/[?#]/, 1)[0]
  if (!pathname.startsWith('/')) fail(facultyId, `${path} must be an absolute internal URL or an external URL`)
  if (!pageRoutes.has(pathname)) fail(facultyId, `${path} references an unbuilt route: ${pathname}`)
}

const validateLink = (link, path, facultyId, pageRoutes, { icon = false } = {}) => {
  if (!link || typeof link !== 'object' || Array.isArray(link)) fail(facultyId, `${path} must be an object`)
  requireString(link.text, `${path}.text`, facultyId)
  validateHref(link.href, `${path}.href`, facultyId, pageRoutes)
  if (icon) requireString(link.icon, `${path}.icon`, facultyId)
}

const validateLinks = (links, path, facultyId, pageRoutes, options) => {
  if (!Array.isArray(links)) fail(facultyId, `${path} must be an array`)
  links.forEach((link, index) => validateLink(link, `${path}[${index}]`, facultyId, pageRoutes, options))
}

const validateNavigation = (items, path, facultyId, pageRoutes, depth = 0) => {
  if (!Array.isArray(items) || items.length === 0) fail(facultyId, `${path} must be a non-empty array`)
  if (depth > 2) fail(facultyId, `${path} exceeds the maximum navigation depth of 2 child levels`)

  items.forEach((item, index) => {
    const itemPath = `${path}[${index}]`
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail(facultyId, `${itemPath} must be an object`)
    requireString(item.text, `${itemPath}.text`, facultyId)
    const hasHref = Object.hasOwn(item, 'href')
    const hasChildren = Object.hasOwn(item, 'children')
    if (hasHref === hasChildren) fail(facultyId, `${itemPath} must define exactly one of href or children`)
    if (hasHref) validateHref(item.href, `${itemPath}.href`, facultyId, pageRoutes)
    if (hasChildren) validateNavigation(item.children, `${itemPath}.children`, facultyId, pageRoutes, depth + 1)
  })
}

export const validateSiteData = (site, { facultyId, pageRoutes }) => {
  const routes = new Set(pageRoutes)
  if (!site || typeof site !== 'object' || Array.isArray(site)) fail(facultyId, 'root must be an object')
  if (site.version !== 1) fail(facultyId, `version must be 1; received ${String(site.version)}`)

  const identity = site.identity
  if (!identity || typeof identity !== 'object' || Array.isArray(identity)) fail(facultyId, 'identity must be an object')
  for (const key of ['unitName', 'organizationName', 'email', 'address', 'mapAddress']) {
    requireString(identity[key], `identity.${key}`, facultyId)
  }
  if (!identity.phone || typeof identity.phone !== 'object' || Array.isArray(identity.phone)) fail(facultyId, 'identity.phone must be an object')
  requireString(identity.phone.text, 'identity.phone.text', facultyId)
  requireString(identity.phone.href, 'identity.phone.href', facultyId)

  validateLinks(site.quickLinks, 'quickLinks', facultyId, routes, { icon: true })
  validateNavigation(site.navigation, 'navigation', facultyId, routes)

  if (!site.footer || typeof site.footer !== 'object' || Array.isArray(site.footer)) fail(facultyId, 'footer must be an object')
  if (!Array.isArray(site.footer.columns) || site.footer.columns.length === 0) fail(facultyId, 'footer.columns must be a non-empty array')
  site.footer.columns.forEach((column, index) => {
    requireString(column?.title, `footer.columns[${index}].title`, facultyId)
    validateLinks(column?.links, `footer.columns[${index}].links`, facultyId, routes)
  })
  validateLinks(site.footer.socialLinks, 'footer.socialLinks', facultyId, routes, { icon: true })

  if (!site.search || typeof site.search !== 'object' || Array.isArray(site.search)) fail(facultyId, 'search must be an object')
  validateLinks(site.search.quickLinks, 'search.quickLinks', facultyId, routes)
  validateLinks(site.search.categories, 'search.categories', facultyId, routes, { icon: true })

  return site
}

export const loadFacultySiteData = ({ facultyId, facultyDataRoot, pageRoutes }) => {
  const siteFile = resolve(facultyDataRoot, 'site.json')
  if (!existsSync(siteFile)) throw new Error(`Missing site data for faculty "${facultyId}": ${siteFile}`)

  let site
  try {
    site = JSON.parse(readFileSync(siteFile, 'utf8'))
  } catch (error) {
    throw new Error(`Invalid site data for faculty "${facultyId}" at ${siteFile}: ${error.message}`)
  }
  return validateSiteData(site, { facultyId, pageRoutes })
}
