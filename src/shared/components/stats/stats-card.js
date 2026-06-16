/**
 * Stats Card with Number Counting Animation
 * Counts up when card enters viewport
 */

export function initStatsCards() {
  const statsCards = document.querySelectorAll('.stats-card')
  
  if (!statsCards.length) return

  // Easing function for smooth animation (easeOutQuart)
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4)
  }

  // Counter animation function with smooth easing
  function animateCounter(element, target) {
    const numberElement = element.querySelector('.stats-number')
    if (!numberElement) return

    const duration = 2500 // 2.5 seconds for smoother effect
    const startTime = performance.now()

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Apply easing for smooth acceleration/deceleration
      const easedProgress = easeOutQuart(progress)
      const currentValue = Math.floor(easedProgress * target)

      // Format number with comma separator (no suffix)
      const displayValue = currentValue.toLocaleString('en-US')
      numberElement.textContent = displayValue

      // Continue animation if not finished
      if (progress < 1) {
        requestAnimationFrame(updateCount)
      } else {
        // Ensure final value is exact
        numberElement.textContent = target.toLocaleString('en-US')
      }
    }

    requestAnimationFrame(updateCount)
  }

  // Intersection Observer for triggering animation when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          const count = parseInt(entry.target.dataset.count || '0')
          
          animateCounter(entry.target, count)
          entry.target.dataset.counted = 'true'
        }
      })
    },
    {
      threshold: 0.5, // Trigger when 50% visible
      rootMargin: '0px'
    }
  )

  // Observe all stats cards
  statsCards.forEach((card) => {
    observer.observe(card)
  })
}
