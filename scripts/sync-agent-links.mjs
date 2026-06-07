import { mkdir, readdir, lstat, rm, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')

process.chdir(repoRoot)

const ensureDirs = [
  '.agents/skills',
  '.agents/prompts',
  '.codex/skills',
  '.github/skills',
  '.github/prompts',
]

for (const dir of ensureDirs) {
  await mkdir(dir, { recursive: true })
}

try {
  await lstat('.agents/instructions')
  await mkdir('.github/instructions', { recursive: true })
} catch {
  // No instructions source directory; nothing to mirror.
}

async function resetLinkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    await rm(entryPath, { recursive: true, force: true })
  }
}

async function materializeLink(sourcePath, targetPath, relativePrefix, entryName, isDirectory) {
  const linkTarget = `${relativePrefix}/${entryName}`

  if (process.platform === 'win32') {
    await writeFile(targetPath, linkTarget)
    return
  }

  const linkType = isDirectory ? 'dir' : 'file'

  try {
    await symlink(linkTarget, targetPath, linkType)
  } catch (error) {
    if (!['EPERM', 'EINVAL', 'UNKNOWN'].includes(error?.code ?? '')) {
      throw error
    }

    await writeFile(targetPath, linkTarget)
  }
}

async function linkChildren(sourceDir, targetDir, relativePrefix) {
  await resetLinkDir(targetDir)
  const entries = await readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)
    await materializeLink(sourcePath, targetPath, relativePrefix, entry.name, entry.isDirectory())
  }
}

await linkChildren('.agents/skills', '.codex/skills', '../../.agents/skills')
await linkChildren('.agents/skills', '.github/skills', '../../.agents/skills')
await linkChildren('.agents/prompts', '.github/prompts', '../../.agents/prompts')

try {
  await lstat('.agents/instructions')
  await linkChildren('.agents/instructions', '.github/instructions', '../../.agents/instructions')
} catch {
  // No instructions source directory; nothing to mirror.
}
