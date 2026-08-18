/**
 * Utility functions
 */

/**
 * Returns a base-path-safe URL for a public data file.
 * Uses import.meta.env.BASE_URL so builds with VITE_BASE_PATH set correctly
 * prefix the path rather than assuming the domain root.
 *
 * @param {string} path - Path relative to the public root, e.g. "data/search-data.json"
 * @returns {string}
 */
export const publicUrl = (path = '/', base = import.meta.env?.BASE_URL ?? '/') => {
  if (/^(?:https?:|mailto:|tel:|\/\/|#)/i.test(path)) return path
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${normalizedBase}${normalizedPath}`
}

export const dataUrl = (path) => publicUrl(path)

/**
 * Delay execution for a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      textArea.remove()
      return successful
    }
  } catch (err) {
    console.error('Failed to copy text:', err)
    return false
  }
}

/**
 * Share content using Web Share API or fallback to copy
 * @param {Object} shareData - Share data {title, text, url}
 * @returns {Promise<boolean>} - Success status
 */
export const shareContent = async (shareData) => {
  try {
    // Check if Web Share API is available
    if (navigator.share) {
      await navigator.share(shareData)
      return true
    } else {
      // Fallback: copy URL to clipboard
      const url = shareData.url || window.location.href
      const success = await copyToClipboard(url)
      if (success) {
        console.log('Link copied to clipboard')
      }
      return success
    }
  } catch (err) {
    // User cancelled or error occurred
    console.error('Share failed:', err)
    return false
  }
}

/**
 * Optimized Fade-in on Scroll Animation
 * Performance improvements:
 * - Unobserve elements after animation trigger (reduce memory)
 * - rootMargin for early trigger (smoother UX)
 * - requestAnimationFrame for optimal rendering
 * - Optional repeat mode
 * - Cleanup method for memory management
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.selector - CSS selector for elements to animate (default: '.nttFade')
 * @param {string} options.activeClass - Class to add when visible (default: 'nttFaded')
 * @param {number} options.threshold - Visibility threshold 0-1 (default: 0.1 = 10%)
 * @param {string} options.rootMargin - Trigger offset margin (default: '0px 0px -50px 0px' - trigger 50px before)
 * @param {boolean} options.once - Trigger only once (default: true)
 * @param {Function} options.onVisible - Callback when element becomes visible
 * @returns {Object} - Object with destroy method for cleanup
 */
export const initFadeInOnScroll = (options = {}) => {
  const {
    selector = '.nttFade',
    activeClass = 'nttFaded',
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    once = true,
    onVisible = null
  } = options

  // Get all target elements
  const elements = document.querySelectorAll(selector)
  if (elements.length === 0) return null

  // Create IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Use requestAnimationFrame for smooth animation sync
          requestAnimationFrame(() => {
            entry.target.classList.add(activeClass)
            
            // Call optional callback
            if (typeof onVisible === 'function') {
              onVisible(entry.target)
            }

            // Unobserve element if once=true (performance optimization)
            if (once) {
              observer.unobserve(entry.target)
            }
          })
        } else if (!once) {
          // Remove class when out of view (if repeat mode)
          entry.target.classList.remove(activeClass)
        }
      })
    },
    {
      threshold,
      rootMargin // Trigger earlier for smoother experience
    }
  )

  // Observe all elements
  elements.forEach((element) => observer.observe(element))

  // Return cleanup function
  return {
    destroy: () => {
      observer.disconnect()
    },
    observer,
    elements
  }
}

/**
 * Initialize article social media share buttons
 * Optimized with cached values and early returns
 */
export const initArticleActions = () => {
  // Early return if no share buttons exist
  if (!document.querySelector('.js-share-facebook, .js-share-x, .js-share-linkedin')) {
    return
  }

  // Cache values once (performance optimization)
  const currentUrl = encodeURIComponent(window.location.href)
  const pageTitle = encodeURIComponent(
    document.querySelector('h1')?.textContent || document.title
  )

  // Helper function to open share popup
  const openSharePopup = (url, name, width = 600, height = 400) => {
    window.open(url, name, `width=${width},height=${height},scrollbars=yes`)
  }

  // Facebook Share
  const facebookBtns = document.querySelectorAll('.js-share-facebook')
  if (facebookBtns.length > 0) {
    facebookBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        openSharePopup(
          `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
          'facebook-share'
        )
      })
    })
  }

  // X (Twitter) Share
  const xBtns = document.querySelectorAll('.js-share-x')
  if (xBtns.length > 0) {
    xBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        openSharePopup(
          `https://twitter.com/intent/tweet?url=${currentUrl}&text=${pageTitle}`,
          'x-share'
        )
      })
    })
  }

  // LinkedIn Share
  const linkedinBtns = document.querySelectorAll('.js-share-linkedin')
  if (linkedinBtns.length > 0) {
    linkedinBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        openSharePopup(
          `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
          'linkedin-share',
          600,
          600
        )
      })
    })
  }
}

/**
 * Initialize PDF Viewer with Browser Support Detection
 * Handles PDF loading, fallback for unsupported browsers, and error states
 * Optimized with event listener cleanup and early returns
 */
export const initPDFViewer = () => {
  const pdfObject = document.getElementById('pdf-object')
  const pdfViewer = document.getElementById('pdf-viewer')
  const pdfLoading = document.getElementById('pdf-loading')
  const pdfFallback = document.getElementById('pdf-fallback')
  
  // Early return if elements don't exist
  if (!pdfObject || !pdfLoading || !pdfFallback) return
  
  let loadAttempted = false
  let timeoutId = null
  
  /**
   * Check if browser supports inline PDF viewing
   * @returns {boolean} True if supported
   */
  const checkPDFSupport = () => {
    const ua = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua) && !/chrome|firefox|edg/.test(ua)
    
    return !(isIOS || isAndroid)
  }
  
  /**
   * Handle successful PDF load
   */
  const handleLoadComplete = () => {
    if (!loadAttempted) {
      loadAttempted = true
      pdfLoading.classList.add('hidden')
      if (timeoutId) clearTimeout(timeoutId)
    }
  }
  
  /**
   * Show fallback download message
   */
  const showFallback = () => {
    pdfLoading.classList.add('hidden')
    pdfFallback.classList.remove('hidden')
    pdfFallback.classList.add('flex', 'items-center', 'justify-center')
    if (timeoutId) clearTimeout(timeoutId)
  }
  
  // Check support and show fallback immediately if not supported
  if (!checkPDFSupport()) {
    showFallback()
    return
  }
  
  // Event handlers
  const handleLoad = () => handleLoadComplete()
  const handleError = () => showFallback()
  
  // Add listeners with auto-cleanup (once: true)
  pdfObject.addEventListener('load', handleLoad, { once: true })
  pdfObject.addEventListener('error', handleError, { once: true })
  
  if (pdfViewer) {
    pdfViewer.addEventListener('load', handleLoad, { once: true })
    pdfViewer.addEventListener('error', handleError, { once: true })
  }
  
  // Fallback timeout - show download if nothing loads in 5 seconds
  timeoutId = setTimeout(() => {
    if (!loadAttempted) {
      showFallback()
    }
  }, 5000)
}
