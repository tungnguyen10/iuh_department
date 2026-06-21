import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

import {
  copyReferencedSvgs,
  extractSvgReferences,
  formatMissingSvgError,
  normalizeSvgReference,
  validateSvgReferences,
} from '../scripts/svg-assets.js'

const createWorkspace = () => {
  const root = mkdtempSync(join(tmpdir(), 'svg-assets-'))
  const distDir = join(root, 'dist')
  const sharedSvgRoot = join(root, 'shared-svgs')

  mkdirSync(distDir, { recursive: true })
  mkdirSync(sharedSvgRoot, { recursive: true })

  return { root, distDir, sharedSvgRoot }
}

test('extractSvgReferences covers HTML attributes, data attributes, CSS URLs, and JS strings', () => {
  const content = `
    <img src="/assets/svgs/html-absolute.svg">
    <img src="assets/svgs/html-relative.svg">
    <div data-icon="/assets/svgs/data-icon.svg" data-pattern="/assets/svgs/data-pattern.svg"></div>
    .logo { background-image: url('../assets/svgs/css-url.svg'); }
    const icon = '/assets/svgs/js-string.svg';
    const cacheBusted = "/assets/svgs/cache.svg?v=1#hash";
  `

  assert.deepEqual(extractSvgReferences(content), [
    'cache.svg',
    'css-url.svg',
    'data-icon.svg',
    'data-pattern.svg',
    'html-absolute.svg',
    'html-relative.svg',
    'js-string.svg',
  ])
})

test('extractSvgReferences deduplicates references', () => {
  const content = `
    <img src="/assets/svgs/icon.svg">
    <div data-icon="/assets/svgs/icon.svg"></div>
    const icon = '/assets/svgs/icon.svg';
  `

  assert.deepEqual(extractSvgReferences(content), ['icon.svg'])
})

test('normalizeSvgReference rejects traversal and malformed paths', () => {
  assert.equal(normalizeSvgReference('/assets/svgs/icon.svg'), 'icon.svg')
  assert.equal(normalizeSvgReference('../assets/svgs/nested/icon.svg'), 'nested/icon.svg')
  assert.equal(normalizeSvgReference('/assets/svgs/../secret.svg'), null)
  assert.equal(normalizeSvgReference('/assets/svgs/.hidden/../secret.svg'), null)
  assert.equal(normalizeSvgReference('/assets/images/icon.svg'), null)
  assert.equal(normalizeSvgReference('/assets/svgs/'), null)
})

test('validateSvgReferences reports missing SVG with referencing source files', () => {
  const { sharedSvgRoot } = createWorkspace()
  const references = new Map([
    ['missing.svg', new Set(['index.html'])],
  ])

  const missing = validateSvgReferences(references, sharedSvgRoot)
  assert.deepEqual(missing, [
    {
      svgPath: 'missing.svg',
      sourceFiles: ['index.html'],
    },
  ])

  const message = formatMissingSvgError(missing)
  assert.match(message, /assets\/svgs\/missing\.svg/)
  assert.match(message, /referenced by index\.html/)
})

test('copyReferencedSvgs copies only referenced SVGs from shared root', () => {
  const { distDir, sharedSvgRoot } = createWorkspace()
  mkdirSync(join(distDir, 'assets/css'), { recursive: true })
  writeFileSync(join(distDir, 'index.html'), '<img src="/assets/svgs/used.svg">')
  writeFileSync(join(distDir, 'assets/css/style.css'), ".x{background:url('../assets/svgs/from-css.svg')}")
  writeFileSync(join(sharedSvgRoot, 'used.svg'), '<svg></svg>')
  writeFileSync(join(sharedSvgRoot, 'from-css.svg'), '<svg></svg>')
  writeFileSync(join(sharedSvgRoot, 'unused.svg'), '<svg></svg>')

  const result = copyReferencedSvgs({ distDir, sharedSvgRoot })

  assert.deepEqual(result.references, ['from-css.svg', 'used.svg'])
  assert.equal(readFileSync(join(distDir, 'assets/svgs/used.svg'), 'utf-8'), '<svg></svg>')
  assert.equal(readFileSync(join(distDir, 'assets/svgs/from-css.svg'), 'utf-8'), '<svg></svg>')
  assert.throws(
    () => readFileSync(join(distDir, 'assets/svgs/unused.svg'), 'utf-8'),
    /ENOENT/,
  )
})

test('copyReferencedSvgs also scans source roots for CSS references not present in dist', () => {
  const { root, distDir, sharedSvgRoot } = createWorkspace()
  const sourceRoot = join(root, 'src')
  mkdirSync(sourceRoot, { recursive: true })
  writeFileSync(join(distDir, 'index.html'), '<main></main>')
  writeFileSync(join(sourceRoot, 'main.scss'), ".vite-icon{background:url('../assets/svgs/from-source-css.svg')}")
  writeFileSync(join(sharedSvgRoot, 'from-source-css.svg'), '<svg></svg>')

  const result = copyReferencedSvgs({
    distDir,
    sharedSvgRoot,
    sourceRoots: [sourceRoot],
    sourceBaseDir: root,
  })

  assert.deepEqual(result.references, ['from-source-css.svg'])
  assert.equal(readFileSync(join(distDir, 'assets/svgs/from-source-css.svg'), 'utf-8'), '<svg></svg>')
})

test('copyReferencedSvgs fails clearly for missing referenced SVGs', () => {
  const { distDir, sharedSvgRoot } = createWorkspace()
  writeFileSync(join(distDir, 'index.html'), '<img src="/assets/svgs/missing.svg">')

  assert.throws(
    () => copyReferencedSvgs({ distDir, sharedSvgRoot }),
    /Missing SVG asset references:[\s\S]*assets\/svgs\/missing\.svg[\s\S]*referenced by index\.html/,
  )
})
