import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { deepMerge } from '../utils.js'

export const copyPublicDataPlugin = (rootDir, outDir, facultyId) => ({
  name: 'copy-public-data',
  closeBundle() {
    const sharedDataDir = resolve(rootDir, 'public/data')
    const facultyDataDir = resolve(rootDir, 'src/faculties', facultyId, 'data')
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
