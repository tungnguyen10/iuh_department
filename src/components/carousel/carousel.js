/**
 * Hero Carousel Component
 * Full screen carousel with autoplay, navigation, and pagination
 */

import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'

// Initialize carousel after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const heroSwiper = new Swiper('.hero-swiper', {
    modules: [Navigation, Pagination, Autoplay, EffectCoverflow],
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    speed: 800,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.hero-pagination',
      clickable: true,
      dynamicBullets: false,
    },
    navigation: {
      nextEl: '.hero-nav-next',
      prevEl: '.hero-nav-prev',
    },
    // Keyboard control
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    // Accessibility
    a11y: {
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
      firstSlideMessage: 'This is the first slide',
      lastSlideMessage: 'This is the last slide',
    },
    // Responsive breakpoints
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 1,
      },
      1024: {
        slidesPerView: 1,
      },
    },
  })

  // Pause autoplay when user is viewing another tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      heroSwiper.autoplay.stop()
    } else {
      heroSwiper.autoplay.start()
    }
  })
})
