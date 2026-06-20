import { dirname, resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { collectPageMetas, normalizePageBasename, validateFacultyPages } from './load.js'
import { copyDirectory } from '../utils.js'

export const getFacultyPagePath = (rootDir, facultyId, pageName) => {
  const normalized = pageName.replace(/^\/+/, '')
  const facultyPage = resolve(rootDir, 'src/faculties', facultyId, 'pages', normalized)
  if (existsSync(facultyPage)) {
    return facultyPage
  }
  return resolve(rootDir, 'src/pages', normalized)
}

export const collectFacultyPages = (rootDir, facultyId, options = {}) => {
  const sharedPagesDir = resolve(rootDir, 'src/pages')
  const facultyPagesDir = resolve(rootDir, 'src/faculties', facultyId, 'pages')
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

export const prepareFacultyWorkspace = (rootDir, facultyId, faculty, options = {}) => {
  const tempRoot = resolve(rootDir, '.tmp/faculty-build', facultyId)
  const tempPagesDir = resolve(tempRoot, 'pages')
  const pageMap = collectFacultyPages(rootDir, facultyId, {
    includeDevPages: options.includeDevPages,
    excludePages: faculty.excludePages,
  })

  rmSync(tempRoot, { recursive: true, force: true })
  mkdirSync(tempPagesDir, { recursive: true })
  copyFileSync(resolve(rootDir, 'src/main.js'), resolve(tempRoot, 'main.js'))
  writeFileSync(resolve(tempPagesDir, 'main.js'), "import '../main.js'\n")
  for (const dirName of ['components', 'config', 'js', 'styles']) {
    copyDirectory(resolve(rootDir, 'src', dirName), resolve(tempRoot, dirName))
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
