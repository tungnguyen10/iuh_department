import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs'
import { dirname, extname, join, relative, resolve, sep } from 'path'

const DIST_SCAN_EXTENSIONS = new Set(['.html', '.css', '.js'])
const SOURCE_SCAN_EXTENSIONS = new Set(['.html', '.css', '.scss', '.js', '.mjs', '.cjs'])
const SVG_REFERENCE_RE = /(?:(?:\.\.\/)+|\.\/|\/)?assets\/svgs\/[^"'`)\s?#]+\.svg(?:\?[^"'`)\s#]*)?/gi

export const normalizeSvgReference = (rawReference) => {
  if (!rawReference || typeof rawReference !== 'string') return null

  const withoutQuery = rawReference.split(/[?#]/, 1)[0].replace(/\\/g, '/')
  const marker = 'assets/svgs/'
  const markerIndex = withoutQuery.toLowerCase().indexOf(marker)
  if (markerIndex < 0) return null

  const normalized = withoutQuery.slice(markerIndex + marker.length)
  if (!normalized || normalized.startsWith('/') || normalized.includes('\0')) {
    return null
  }

  const parts = normalized.split('/')
  if (parts.some((part) => part === '..' || part === '.' || part === '')) {
    return null
  }

  if (!normalized.toLowerCase().endsWith('.svg')) {
    return null
  }

  return normalized
}

export const extractSvgReferences = (content) => {
  const references = new Set()

  for (const match of content.matchAll(SVG_REFERENCE_RE)) {
    const normalized = normalizeSvgReference(match[0])
    if (normalized) references.add(normalized)
  }

  return [...references].sort()
}

const walkFiles = (rootDir, visitor) => {
  if (!existsSync(rootDir)) return

  for (const entry of readdirSync(rootDir)) {
    const entryPath = join(rootDir, entry)
    const stats = statSync(entryPath)

    if (stats.isDirectory()) {
      walkFiles(entryPath, visitor)
    } else if (stats.isFile()) {
      visitor(entryPath)
    }
  }
}

export const collectSvgReferencesFromDist = (distDir) => {
  const references = new Map()

  walkFiles(distDir, (filePath) => {
    if (!DIST_SCAN_EXTENSIONS.has(extname(filePath).toLowerCase())) return

    const content = readFileSync(filePath, 'utf-8')
    for (const svgPath of extractSvgReferences(content)) {
      if (!references.has(svgPath)) {
        references.set(svgPath, new Set())
      }
      references.get(svgPath).add(relative(distDir, filePath).replace(/\\/g, '/'))
    }
  })

  return references
}

const addReference = (references, svgPath, sourceFile) => {
  if (!references.has(svgPath)) {
    references.set(svgPath, new Set())
  }
  references.get(svgPath).add(sourceFile)
}

export const collectSvgReferencesFromSourceRoots = (sourceRoots, baseDir = process.cwd()) => {
  const references = new Map()

  for (const sourceRoot of sourceRoots) {
    walkFiles(sourceRoot, (filePath) => {
      if (!SOURCE_SCAN_EXTENSIONS.has(extname(filePath).toLowerCase())) return

      const content = readFileSync(filePath, 'utf-8')
      for (const svgPath of extractSvgReferences(content)) {
        addReference(references, svgPath, relative(baseDir, filePath).replace(/\\/g, '/'))
      }
    })
  }

  return references
}

export const mergeSvgReferences = (...referenceMaps) => {
  const merged = new Map()

  for (const references of referenceMaps) {
    for (const [svgPath, sourceFiles] of references.entries()) {
      for (const sourceFile of sourceFiles) {
        addReference(merged, svgPath, sourceFile)
      }
    }
  }

  return merged
}

export const validateSvgReferences = (references, sharedSvgRoot) => {
  const missing = []

  for (const [svgPath, sourceFiles] of references.entries()) {
    const sourceFile = resolve(sharedSvgRoot, svgPath)
    const relativeToRoot = relative(sharedSvgRoot, sourceFile)

    if (
      relativeToRoot.startsWith('..') ||
      relativeToRoot === '' ||
      relativeToRoot.split(sep).includes('..') ||
      !existsSync(sourceFile)
    ) {
      missing.push({
        svgPath,
        sourceFiles: [...sourceFiles].sort(),
      })
    }
  }

  return missing
}

export const formatMissingSvgError = (missing) => {
  const lines = ['Missing SVG asset references:']

  for (const item of missing) {
    lines.push(`- assets/svgs/${item.svgPath}`)
    for (const sourceFile of item.sourceFiles.slice(0, 5)) {
      lines.push(`  referenced by ${sourceFile}`)
    }
  }

  return lines.join('\n')
}

export const copyReferencedSvgs = ({ distDir, sharedSvgRoot, sourceRoots = [], sourceBaseDir = process.cwd() }) => {
  const references = mergeSvgReferences(
    collectSvgReferencesFromDist(distDir),
    collectSvgReferencesFromSourceRoots(sourceRoots, sourceBaseDir),
  )
  const missing = validateSvgReferences(references, sharedSvgRoot)

  if (missing.length) {
    throw new Error(formatMissingSvgError(missing))
  }

  const outputRoot = resolve(distDir, 'assets/svgs')
  let copied = 0

  for (const svgPath of [...references.keys()].sort()) {
    const sourceFile = resolve(sharedSvgRoot, svgPath)
    const outputFile = resolve(outputRoot, svgPath)
    mkdirSync(dirname(outputFile), { recursive: true })
    copyFileSync(sourceFile, outputFile)
    copied++
  }

  return {
    copied,
    references: [...references.keys()].sort(),
  }
}
