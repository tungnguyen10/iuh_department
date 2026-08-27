import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const repoRoot = resolve(new URL('..', import.meta.url).pathname)
const srcRoot = join(repoRoot, 'src')
const faculties = {
  'health-science': 13,
  'dormitory-management': 14,
  'political-student-affairs': 8,
  'organization-administration': 8,
}

const collectSourceFiles = async (directory) => {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectSourceFiles(path))
    else if (/\.(?:html|json)$/.test(entry.name)) files.push(path)
  }
  return files.sort()
}

const hashSource = async () => {
  const hash = createHash('sha256')
  for (const path of await collectSourceFiles(srcRoot)) {
    hash.update(path.slice(srcRoot.length))
    hash.update(await readFile(path))
  }
  return hash.digest('hex')
}

test('building every faculty leaves source immutable and emits resolved chrome only', { timeout: 120_000 }, async () => {
  const sourceBefore = await hashSource()
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'iuh-site-chrome-'))

  try {
    for (const [facultyId, expectedPageCount] of Object.entries(faculties)) {
      const outDir = join(temporaryRoot, facultyId)
      execFileSync('corepack', ['yarn', 'build'], {
        cwd: repoRoot,
        env: { ...process.env, FACULTY: facultyId, VITE_OUT_DIR: outDir },
        stdio: 'pipe',
      })

      const outputFiles = await readdir(outDir, { recursive: true })
      const htmlFiles = outputFiles.filter((file) => file.endsWith('.html'))
      assert.equal(htmlFiles.length, expectedPageCount, `${facultyId} output page count`)
      assert.ok(outputFiles.includes('data/search-data.json'), `${facultyId} keeps runtime search data`)
      for (const buildOnlyFile of ['data/site.json', 'data/news.json', 'data/activities.json']) {
        assert.equal(outputFiles.includes(buildOnlyFile), false, `${facultyId} emitted build-only ${buildOnlyFile}`)
      }

      for (const htmlFile of htmlFiles) {
        const html = await readFile(join(outDir, htmlFile), 'utf8')
        assert.doesNotMatch(html, /data-site-[\w-]+/, `${facultyId}/${htmlFile} has an unresolved site marker`)
        assert.doesNotMatch(html, /data-include=["'][^"']+["']/, `${facultyId}/${htmlFile} has an unresolved include`)
        assert.doesNotMatch(html, /\{\{[^}]+\}\}/, `${facultyId}/${htmlFile} has an unresolved placeholder`)
      }
    }

    assert.equal(await hashSource(), sourceBefore, 'build changed source HTML or JSON')
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})
