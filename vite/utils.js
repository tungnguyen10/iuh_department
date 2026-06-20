import { execSync } from 'child_process'
import { basename, dirname, isAbsolute, resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'

export const getBuildSignature = () => {
  let gitHash = 'no-git'
  try {
    gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch (error) {
    // Fallback to 'no-git' if git is not available.
  }
  const timestamp = new Date().toISOString()
  return `2026TUNG's_${gitHash}_${timestamp}`
}

export const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const normalizeBasePath = (value = '/') => {
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

export const resolveOutDir = (rootDir, value = '') => {
  const target = value.trim()
  const finalTarget = target.length ? target : 'dist'
  return isAbsolute(finalTarget) ? finalTarget : resolve(rootDir, finalTarget)
}

export const withBaseFactory = (base) => (value = '') => {
  if (!value || value.startsWith('http') || value.startsWith('//') || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value
  }
  const normalized = value.startsWith('/') ? value : `/${value}`
  return base === '/' ? normalized : `${base}${normalized}`.replace(/\/+/g, '/')
}

export const hexToRgbSpace = (hex) => {
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

export const getCssOutputName = (name) => {
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

export const deepMerge = (baseValue, overrideValue) => {
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

export const copyDirectory = (src, dest) => {
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
