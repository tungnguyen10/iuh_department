/**
 * News Carousel Module
 * Swiper-based carousel for news cards
 * Usage: import { initNewsCarousel } from '@components/news/news-carousel.js'
 *        initNewsCarousel(containerSelector)
 */

import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'

/**
 * Initialize news carousel
 * @param {string|HTMLElement} containerSelector - CSS selector or HTMLElement for carousel container
 * @returns {Swiper} Swiper instance
 */
export function initNewsCarousel(containerSelector = '.news-carousel-wrapper') {
  // Support both selector string and HTMLElement
  const container = typeof containerSelector === 'string' 
    ? document.querySelector(containerSelector)
    : containerSelector
  
  if (!container) {
    console.warn(`News carousel container not found:`, containerSelector)
    return null
  }

  const swiperContainer = container.querySelector('.news-carousel-swiper')
  const prevButton = container.querySelector('.news-carousel-prev')
  const nextButton = container.querySelector('.news-carousel-next')
  const paginationEl = container.querySelector('.news-carousel-pagination')

  if (!swiperContainer) {
    console.warn('Swiper container not found in news carousel')
    return null
  }

  // Initialize Swiper
  const swiper = new Swiper(swiperContainer, {
    modules: [Navigation, Pagination],
    
    // Slides config
    slidesPerView: 1.5, // Mobile: 1.5 slides visible
    spaceBetween: 5, // 5px mobile
    
    // Responsive breakpoints (mobile-first)
    breakpoints: {
      // >= 768px (md) - Tablet
      768: {
        slidesPerView: 2.3,
        spaceBetween: 5,
      },
      // >= 1024px (lg) - Desktop
      1024: {
        slidesPerView: 4,
        spaceBetween: 5,
      },
    },

    // Navigation (desktop only)
    navigation: {
      nextEl: nextButton,
      prevEl: prevButton,
    },

    // Pagination (mobile only)
    pagination: {
      el: paginationEl,
      clickable: true,
      dynamicBullets: false,
    },

    // Behavior
    loop: false,
    freeMode: false, // Slide mode (not free scroll)
    grabCursor: true,
    watchOverflow: true,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    speed: 400, // Transition speed in ms
    
    // Accessibility
    a11y: {
      enabled: true,
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
    },
  })

  return swiper
}

/**
 * Initialize all news carousels on page
 * @returns {Swiper[]} Array of Swiper instances
 */
export function initAllNewsCarousels() {
  const carousels = document.querySelectorAll('.news-carousel-wrapper')
  return Array.from(carousels).map(carousel => {
    return initNewsCarousel(carousel) // Pass element directly
  }).filter(Boolean)
}

// Auto-init if module is imported (optional, comment out if not needed)
// if (typeof window !== 'undefined') {
//   document.addEventListener('DOMContentLoaded', () => {
//     initAllNewsCarousels()
//   })
// }
