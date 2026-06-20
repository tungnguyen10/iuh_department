import { defineConfig, loadEnv } from 'vite'
import { resolve, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import svgo from 'vite-plugin-svgo'
import { DEFAULT_FACULTY_ID } from './vite/constants.js'
import { loadFaculty } from './vite/faculty/load.js'
import { prepareFacultyWorkspace } from './vite/faculty/workspace.js'
import {
  copyFacultyAssetsPlugin,
  copyImagesPlugin,
  copyPublicDataPlugin,
  copySvgsPlugin,
  layoutPlugin,
  mapSrcRequests,
  transformDataInclude,
} from './vite/plugins/index.js'
import { getBuildSignature, getCssOutputName, normalizeBasePath, resolveOutDir } from './vite/utils.js'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const facultyId = env.VITE_FACULTY || DEFAULT_FACULTY_ID
  const faculty = loadFaculty(rootDir, facultyId)
  const workspace = prepareFacultyWorkspace(rootDir, facultyId, faculty, {
    includeDevPages: command !== 'build',
  })
  const base = normalizeBasePath(env.VITE_BASE_PATH || '/')
  const outDir = resolveOutDir(rootDir, env.VITE_OUT_DIR || '')
  const buildSignature = mode === 'production' ? getBuildSignature() : 'dev-mode'
  const input = workspace.input

  const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'))
  const appVersion = pkg.version || '0.0.0'

  return {
    base,
    root: workspace.pagesDir,
    publicDir: resolve(rootDir, 'public'),
    define: {
      __BUILD_SIGNATURE__: JSON.stringify(buildSignature),
      __APP_VERSION__: JSON.stringify(appVersion),
      __BUILD_MODE__: JSON.stringify(mode)
    },
    plugins: [
      mapSrcRequests(rootDir, facultyId, workspace),
      layoutPlugin({ rootDir, base, faculty, workspace }),
      transformDataInclude(rootDir, base, faculty),
      copyPublicDataPlugin(rootDir, outDir, facultyId),
      copyImagesPlugin(rootDir, outDir),
      copySvgsPlugin(rootDir, outDir),
      copyFacultyAssetsPlugin(rootDir, outDir, facultyId),
      svgo({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIds: false,
                  removeComments: true,
                  removeTitle: false,
                  removeDesc: false,
                },
              },
            },
            'removeXMLNS',
          ],
        },
      }),
    ],

    server: {
      open: true,
      fs: {
        allow: ['..', resolve(rootDir)],
      },
    },

    build: {
      outDir,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      minify: 'esbuild',
      cssMinify: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input,
        output: {
          entryFileNames: ({ name }) => {
            const mappedName = name === 'main' ? 'app' : name
            return `assets/js/${mappedName}.js`
          },
          chunkFileNames: ({ name }) => {
            const isVendor = name === 'vendor'
            const chunkName = isVendor ? 'vendor' : name
            return `assets/js/${chunkName}.js`
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          assetFileNames: assetInfo => {
            const ext = extname(assetInfo.name || '').slice(1)
            if (ext === 'css') {
              const cssName = getCssOutputName(assetInfo.name || '') || 'style'
              return `assets/css/${cssName}[extname]`
            }
            if (ext === 'svg') {
              return 'assets/svgs/[name][extname]'
            }
            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(ext)) {
              return 'assets/images/[name][extname]'
            }
            if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext)) {
              return 'assets/fonts/[name][extname]'
            }
            return 'assets/[name][extname]'
          },
        },
      },
    },

    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
        '@components': resolve(rootDir, 'src/components'),
        '@js': resolve(rootDir, 'src/js'),
        '@styles': resolve(rootDir, 'src/styles'),
        '@assets': resolve(rootDir, 'src/assets'),
      },
    },
  }
})
