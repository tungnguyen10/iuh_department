/**
 * Initialize major cards with single source
 * Just move carousel container position based on viewport
 */
import Swiper from 'swiper'
import { FreeMode, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

export function initMajorSwiper() {
  const carouselContainer = document.getElementById('desktop-carousel-container');
  const mobileContainer = document.getElementById('mobile-carousel-container');
  const desktopParent = carouselContainer?.parentElement;
  
  if (!carouselContainer || !mobileContainer || !desktopParent) return;

  const isDesktop = () => window.innerWidth >= 768;

  // Move carousel based on viewport
  const moveCarousel = () => {
    const currentParent = carouselContainer.parentElement;
    
    if (isDesktop()) {
      // Desktop: Move carousel back to original position (right column)
      if (currentParent !== desktopParent) {
        desktopParent.appendChild(carouselContainer);
        // Update Swiper after DOM move
        if (swiperInstance) {
          swiperInstance.update();
        }
      }
    } else {
      // Mobile: Move carousel to left column (mobile here position)
      if (currentParent !== mobileContainer) {
        mobileContainer.appendChild(carouselContainer);
        // Update Swiper after DOM move
        if (swiperInstance) {
          swiperInstance.update();
        }
      }
    }
  };

  // Move carousel on load
  moveCarousel();

  // Initialize Swiper once
  let swiperInstance = new Swiper('.major-swiper', {
    modules: [FreeMode, Pagination],
    slidesPerView: 1.2,
    spaceBetween: 16,
    freeMode: {
      enabled: true,
      sticky: false,
    },
    grabCursor: true,
    resistanceRatio: 0.85,
    pagination: {
      el: '.major-pagination',
      clickable: true,
      dynamicBullets: false,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      }
    }
  });

  // Move carousel on resize with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      moveCarousel();
    }, 150);
  });
}
