import { existsSync } from 'fs'
import { resolve } from 'path'

const mapUrlToFsPath = (rootDir, url, facultyId, workspace) => {
  const [pathname] = url.split('?')

  if (pathname === '/main.js') {
    return resolve(workspace.rootDir, 'main.js')
  }

  if (pathname.startsWith('/js/')) {
    return resolve(rootDir, 'src', pathname.slice(1))
  }

  if (pathname.startsWith('/components/')) {
    return resolve(rootDir, 'src', pathname.slice(1))
  }

  if (pathname.startsWith('/assets/')) {
    const relativeAssetPath = pathname.slice('/assets/'.length)
    const facultyAssetPath = resolve(rootDir, 'src/faculties', facultyId, 'assets', relativeAssetPath)
    if (existsSync(facultyAssetPath)) {
      return facultyAssetPath
    }
    return resolve(rootDir, 'src/assets', relativeAssetPath)
  }

  return null
}

export const mapSrcRequests = (rootDir, facultyId, workspace) => ({
  name: 'map-src-requests',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(rootDir, req.url, facultyId, workspace)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next()
      const mapped = mapUrlToFsPath(rootDir, req.url, facultyId, workspace)
      if (mapped) {
        req.url = `/@fs/${mapped}`
      }
      next()
    })
  },
})
