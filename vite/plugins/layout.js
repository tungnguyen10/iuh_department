import { dirname, relative, resolve } from 'path'
import { readFileSync } from 'fs'
import { applyFacultyTemplateVars, buildFacultyCssVars } from '../faculty/render.js'
import { withBaseFactory } from '../utils.js'

let layoutCache = null

const getLayoutTemplate = (rootDir) => {
  if (!layoutCache) {
    layoutCache = readFileSync(resolve(rootDir, 'src/layouts/default.html'), 'utf-8')
  }
  return layoutCache
}

export const layoutPlugin = ({ rootDir, base, faculty, workspace }) => ({
  name: 'layout-plugin',
  transformIndexHtml: {
    order: 'pre',
    handler(html, { path, filename }) {
      const titleMatch = html.match(/<!--\s*LAYOUT:\s*title="([^"]+)"\s*-->/)
      const descMatch = html.match(/<!--\s*LAYOUT:\s*description="([^"]+)"\s*-->/)
      const keywordsMatch = html.match(/<!--\s*LAYOUT:\s*keywords="([^"]+)"\s*-->/)
      const ogImageMatch = html.match(/<!--\s*LAYOUT:\s*ogImage="([^"]+)"\s*-->/)
      const urlMatch = html.match(/<!--\s*LAYOUT:\s*url="([^"]+)"\s*-->/)
      const scriptMatch = html.match(/<!--\s*LAYOUT:\s*script="([^"]+)"\s*-->/)

      if (!titleMatch) {
        return applyFacultyTemplateVars(html, faculty, base)
      }

      const layout = getLayoutTemplate(rootDir)
      const loadingComponent = readFileSync(resolve(rootDir, 'src/components/loading/loading.html'), 'utf-8')
      const withBase = withBaseFactory(base)
      const sourceFile = filename || resolve(workspace.pagesDir, path.replace(/^\/+/, '') || 'index.html')
      const mainScriptPath = relative(dirname(sourceFile), resolve(workspace.rootDir, 'main.js')).replace(/\\/g, '/')
      const content = html.replace(/<!--\s*LAYOUT:[^>]+-->\s*/g, '').trim()
      const title = titleMatch[1]
      const description = descMatch?.[1] || 'Static website vá»›i Vite + Vanilla JS + TailwindCSS'
      const keywords = keywordsMatch?.[1] || 'vite, vanilla js, tailwindcss, static site'
      const ogImage = withBase(ogImageMatch?.[1] || '/assets/images/default.jpg')
      const url = urlMatch?.[1] || withBase(path.replace(/\.html$/, ''))
      const pageScript = scriptMatch?.[1]
        ? `<!-- Page-specific JS -->\n  <script type="module" src="${scriptMatch[1]}"></script>`
        : ''

      let result = layout
        .replace(/\{\{title\}\}/g, title)
        .replace(/\{\{description\}\}/g, description)
        .replace(/\{\{keywords\}\}/g, keywords)
        .replace(/\{\{ogImage\}\}/g, ogImage)
        .replace(/\{\{url\}\}/g, url)
        .replace('{{loadingComponent}}', loadingComponent)
        .replace('{{content}}', content)
        .replace(/\{\{pageScript\}\}/g, pageScript)
        .replace('src="/main.js"', `src="${mainScriptPath}"`)

      result = result.replace('</head>', `  ${buildFacultyCssVars(faculty)}\n</head>`)
      result = applyFacultyTemplateVars(result, faculty, base)

      result = result
        .replace(/href="\//g, `href="${base === '/' ? '/' : base}`)
        .replace(/src="\//g, `src="${base === '/' ? '/' : base}`)
        .replace(/content="\//g, `content="${base === '/' ? '/' : base}`)

      return result
    }
  }
})
