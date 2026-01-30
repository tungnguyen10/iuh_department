/**
 * Home Page JS
 * Chỉ chạy trên trang home
 */

import { initMajorSwiper } from '@components/major/major.js'
import { initAdmissionSwiper } from '@components/admission/admission.js'
import { initStatsCards } from '@components/stats/stats-card.js'
import { initNewsSwiper } from '@components/news/news.js'
import { initPatternCanvas } from '@components/research/research-background-canvas.js'
import { initInfrastructure } from '@components/infrastructure/infrastructure.js'
import { initBusinessConnectionSwiper } from '@components/careers/careers.js'
import { initIndustryPartnershipSwiper } from '@components/industry-partnerships/industry-partnerships.js'

document.addEventListener('components-loaded', () => {

  // Initialize pattern canvas animation
  initPatternCanvas()
  
  // Initialize infrastructure section
  initInfrastructure()

  // Equalize height between intro and notification sections
  function equalizeHeights() {
    const intro = document.querySelector('.intro-section')
    const notification = document.querySelector('.notification-section')
    
    if (!intro || !notification) return
    
    // Only apply on desktop (768px and above)
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    
    if (isDesktop) {
      // Keep intro at natural height (as standard)
      intro.style.height = 'auto'
      console.log(intro.clientHeight);
      
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

  // Run on window resize
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(equalizeHeights, 150)
  })

  // Initialize major cards Swiper carousel (desktop only)
  initMajorSwiper()
  
  // Initialize admission cards Swiper carousel
  initAdmissionSwiper()

  // Initialize stats cards with counting animation
  initStatsCards()

  // Initialize news carousel
  initNewsSwiper()

  // Initialize business connection events carousel (vertical)
  initBusinessConnectionSwiper()

  // Initialize industry partnership events carousel (vertical)
  initIndustryPartnershipSwiper()
})
