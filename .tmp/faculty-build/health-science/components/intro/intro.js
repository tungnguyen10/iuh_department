/**
 * Intro Component - Height Equalization
 * Equalizes height between intro content and notification sidebar on desktop
 */

export function initIntro() {
  function equalizeHeights() {
    const intro = document.querySelector('.intro-section .flex-1')
    const notification = document.querySelector('.notification-section')
    
    if (!intro || !notification) return
    
    // Only apply on desktop (768px and above)
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    
    if (isDesktop) {
      // Keep intro at natural height (as standard)
      intro.style.height = 'auto'
      
      // Get natural height of intro section after reset
      const introHeight = intro.offsetHeight
      
      // Set notification section to match intro height
      notification.style.height = `${introHeight}px`
    } else {
      // Reset heights on mobile
      intro.style.height = 'auto'
      notification.style.height = '450px'
    }
  }

  // Run on load
  equalizeHeights()

  // Run on window resize with debounce
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      equalizeHeights()
    }, 250)
  })
}
