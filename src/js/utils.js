/**
 * Utility functions
 */

/**
 * Create toast notification element and append to body
 */
export const createToast = () => {
  // Check if toast already exists
  if (document.getElementById('toast')) return
  
  const toastHTML = `
    <div id="toast-container" class="fixed top-4 right-4 z-50 pointer-events-none">
      <div id="toast" class="toast-notification pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center gap-2.5 min-w-[200px] max-w-[400px] translate-x-[120%] opacity-0 transition-all duration-300" role="alert" style="display: none;">
        <div id="toast-icon" class="shrink-0 w-5 h-5"></div>
        <span id="toast-message" class="font-roboto font-medium text-sm leading-normal flex-1"></span>
        <button type="button" id="toast-close" class="shrink-0 w-5 h-5 opacity-70 hover:opacity-100 transition-opacity duration-200" aria-label="Close">
          <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `
  
  document.body.insertAdjacentHTML('beforeend', toastHTML)
}

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
 * Show a temporary notification message
 * @param {string} message - Message to display
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
export const showNotification = (message, type = 'success', duration = 3000) => {
  const toast = document.getElementById('toast')
  const toastIcon = document.getElementById('toast-icon')
  const toastMessage = document.getElementById('toast-message')
  const toastClose = document.getElementById('toast-close')
  
  if (!toast || !toastIcon || !toastMessage) return
  
  // Set colors based on type
  const colors = {
    success: 'bg-secondary-green text-white',
    error: 'bg-danger text-white',
    warning: 'bg-primary-yellow text-gray-900',
    info: 'bg-primary-dark-blue text-white'
  }
  
  // Set icons based on type
  const icons = {
    success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
    error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
    warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
  }
  
  // Clear previous timeout if exists
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId)
  }
  
  // Update content
  toast.className = `toast-notification pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center gap-2.5 min-w-[200px] max-w-[400px] transition-all duration-300 ${colors[type] || colors.info}`
  toastIcon.innerHTML = icons[type] || icons.info
  toastMessage.textContent = message
  
  // Show toast
  toast.style.display = 'flex'
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)'
    toast.style.opacity = '1'
  })
  
  // Close function
  const closeToast = () => {
    toast.style.transform = 'translateX(120%)'
    toast.style.opacity = '0'
    setTimeout(() => {
      toast.style.display = 'none'
    }, 300)
  }
  
  // Close button handler
  toastClose.onclick = closeToast
  
  // Auto-close after duration
  toast.timeoutId = setTimeout(closeToast, duration)
}

