import { existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { copyDirectory } from '../utils.js'

export const copyAssetsPlugin = (name, getSrc, getDest) => ({
  name,
  closeBundle() {
    const src = getSrc()
    if (!existsSync(src)) {
      return
    }

    const dest = getDest()
    mkdirSync(dest, { recursive: true })
    copyDirectory(src, dest)
  }
})

export const copyImagesPlugin = (rootDir, outDir) =>
  copyAssetsPlugin('copy-images', () => resolve(rootDir, 'src/assets/images'), () => resolve(outDir, 'assets/images'))

export const copySvgsPlugin = (rootDir, outDir) =>
  copyAssetsPlugin('copy-svgs', () => resolve(rootDir, 'src/assets/svgs'), () => resolve(outDir, 'assets/svgs'))

export const copyFacultyAssetsPlugin = (rootDir, outDir, facultyId) =>
  copyAssetsPlugin('copy-faculty-assets', () => resolve(rootDir, 'src/faculties', facultyId, 'assets'), () => resolve(outDir, 'assets'))
