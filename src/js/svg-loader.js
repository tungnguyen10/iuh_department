/**
 * SVG Inline Loader
 * Replace <img> tags with inline SVG for CSS styling
 */

const svgCache = new Map()

async function loadSvg(src) {
  if (!svgCache.has(src)) {
    const promise = (async () => {
      const response = await fetch(src)
      if (!response.ok) return null

      const svgText = await response.text()
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
      const svg = svgDoc.querySelector('svg')
      if (!svg) return null

      return svg
    })()

    svgCache.set(src, promise)
  }

  return svgCache.get(src)
}

export async function inlineSVGs() {
  const svgImages = document.querySelectorAll('img[src$=".svg"]')

  const promises = Array.from(svgImages).map(async (img) => {
    const src = img.getAttribute('src')
    if (!src) return

    try {
      const baseSvg = await loadSvg(src)
      if (!baseSvg) return

      const svg = baseSvg.cloneNode(true)

      const imgClasses = img.getAttribute('class')
      if (imgClasses) {
        svg.setAttribute('class', imgClasses)
      }

      const alt = img.getAttribute('alt')
      if (alt) {
        svg.setAttribute('aria-label', alt)
      }

      img.replaceWith(svg)
    } catch (error) {
      console.error(`Failed to inline SVG: ${src}`, error)
    }
  })

  await Promise.all(promises)
}
