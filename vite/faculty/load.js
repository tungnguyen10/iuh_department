import { basename, resolve } from 'path'
import { existsSync, readFileSync } from 'fs'
import { glob } from 'glob'
import { FACULTY_COLOR_KEYS, FACULTY_REQUIRED_FIELDS, VALID_PAGE_TIERS } from '../constants.js'
import { hexToRgbSpace } from '../utils.js'

export const normalizePageBasename = (value = '') => basename(String(value).trim().replace(/\\/g, '/'))

export const parseTierComment = (content = '') => {
  const match = content.match(/^\s*<!--\s*TIER:\s*([a-z-]+)\s*-->/i)
  if (!match) {
    return null
  }
  const tier = match[1].toLowerCase()
  return VALID_PAGE_TIERS.has(tier) ? tier : null
}

export const readPageMeta = (rootDir, relativePath) => {
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

export const collectPageMetas = (rootDir) => {
  const pageMetas = []
  for (const file of glob.sync('**/*.html', { cwd: rootDir, nodir: true })) {
    pageMetas.push(readPageMeta(rootDir, file))
  }
  return pageMetas
}

export const validateFacultyPages = (facultyId, faculty, sharedPageMetas, facultyPageMetas, includeDevPages) => {
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

export const collectNavUrls = (items = [], urls = []) => {
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

export const loadFaculty = (rootDir, facultyId) => {
  const facultyDir = resolve(rootDir, 'src/faculties', facultyId)
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
