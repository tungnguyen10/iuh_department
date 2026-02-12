/**
 * Utility functions
 */

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

