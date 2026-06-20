import { readFileSync } from 'fs'
import { applyFacultyTemplateVars, resolveIncludePath } from '../faculty/render.js'

export const transformDataInclude = (rootDir, base, faculty) => ({
  name: 'transform-data-include',
  transformIndexHtml(html) {
    const withResolvedAssetBase = (assetPath) => {
      const normalizedAssetPath = assetPath.replace(/^\/?assets\//, '')
      return base === '/' ? `/assets/${normalizedAssetPath}` : `${base}assets/${normalizedAssetPath}`
    }

    const processIncludes = (content, depth = 0) => {
      if (depth > 10) {
        console.warn('Max recursion depth reached for data-include')
        return content
      }

      const transformed = content.replace(
        /<div\s+data-include=["']([^"']+)["']([^>]*?)>\s*<\/div>/gs,
        (match, htmlPath, attributes) => {
          try {
            const dataAttrs = {}
            const attrRegex = /data-([\w-]+)=["']([^"']+)["']/g
            let attrMatch
            while ((attrMatch = attrRegex.exec(attributes)) !== null) {
              const key = attrMatch[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
              dataAttrs[key] = attrMatch[2]
            }

            const fullComponentPath = resolveIncludePath(rootDir, htmlPath, faculty.id)
            let componentHtml = readFileSync(fullComponentPath, 'utf-8').trim()

            const variantNumber = dataAttrs.variant || '1'
            const variantRegex = new RegExp(
              `<!-- option ${variantNumber}[^>]*?-->([\\s\\S]*?)(?=<!-- option \\d|$)`,
              'i'
            )
            const variantMatch = componentHtml.match(variantRegex)
            if (variantMatch) {
              componentHtml = variantMatch[1].trim()
            } else if (componentHtml.includes('<!-- option')) {
              if (variantNumber !== '1') {
                console.warn(`Variant ${variantNumber} not found in ${htmlPath}, falling back to option 1`)
              }
              const fallbackRegex = /<!-- option 1[^>]*?-->([\s\S]*?)(?=<!-- option \d|$)/i
              const fallbackMatch = componentHtml.match(fallbackRegex)
              if (fallbackMatch) {
                componentHtml = fallbackMatch[1].trim()
              } else {
                console.error(`No option 1 found in ${htmlPath}`)
                return '<!-- ERROR: Variant not found and no fallback available -->'
              }
            }

            Object.entries(dataAttrs).forEach(([key, value]) => {
              if (key !== 'include' && key !== 'js' && key !== 'variant') {
                const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
                componentHtml = componentHtml.replace(placeholder, value)
              }
            })

            componentHtml = applyFacultyTemplateVars(componentHtml, faculty, base)
            componentHtml = componentHtml.replace(/^\s*<[^>]+>\s*\{\{(?!faculty\.)[^}]+\}\}\s*<\/[^>]+>\s*$/gm, '')
            componentHtml = componentHtml.replace(/\{\{(?!faculty\.)[^}]+\}\}/g, '')
            return processIncludes(componentHtml, depth + 1)
          } catch (error) {
            console.warn(`Failed to inject component: ${htmlPath}`, error.message)
            return match
          }
        }
      )

      return transformed === content ? content : processIncludes(transformed, depth)
    }

    let transformed = processIncludes(applyFacultyTemplateVars(html, faculty, base))

    transformed = transformed.replace(
      /<img\s+([^>]*?)src=["'](\/?assets\/[^"']+)["']([^>]*?)>/g,
      (match, before, assetPath, after) => {
        return `<img ${before}src="${withResolvedAssetBase(assetPath)}"${after}>`
      }
    )

    transformed = transformed.replace(
      /data-photo-src=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-photo-src="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /srcset=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `srcset="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /data-image=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-image="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /data-featured-image=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-featured-image="${withResolvedAssetBase(assetPath)}"`
    )

    transformed = transformed.replace(
      /data-overlayIcon=["'](\/?assets\/[^"']+)["']/g,
      (match, assetPath) => `data-overlayIcon="${withResolvedAssetBase(assetPath)}"`
    )

    return transformed
  }
})
