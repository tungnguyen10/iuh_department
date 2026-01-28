/**
 * Home Page JS
 * Chỉ chạy trên trang home
 */

import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { initMajorSwiper } from '@components/major/major.js'
import { initAdmissionSwiper } from '@components/admission/admission.js'

document.addEventListener('components-loaded', () => {
  const btn = document.getElementById('demo-btn')
  const output = document.getElementById('demo-output')
  
  if (btn && output) {
    let clickCount = 0
    
    btn.addEventListener('click', () => {
      clickCount++
      output.textContent = `You clicked ${clickCount} time${clickCount > 1 ? 's' : ''}!`
      
      // Thêm animation
      output.classList.remove('animate-pulse')
      void output.offsetWidth // Trigger reflow
      output.classList.add('animate-pulse')
    })
  }

  // Initialize Swiper
  const swiper = new Swiper('.tech-swiper', {
    modules: [Navigation, Pagination, Autoplay],
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  })

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
})
