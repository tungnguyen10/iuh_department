/**
 * Careers - Business Connection Event Carousel
 * Vertical carousel for event cards with navigation from event-featured
 */
import Swiper from 'swiper'
import { Navigation, Mousewheel } from 'swiper/modules'
import './careers.scss'

export function initBusinessConnectionSwiper() {
  const swiperEl = document.querySelector('.business-connection-swiper');
  if (!swiperEl) return;
  
  const slideCount = swiperEl.querySelectorAll('.swiper-slide').length;
  
  // Cache DOM elements for performance
  const careersContainer = swiperEl.closest('.careers-section');
  const featuredImg = careersContainer?.querySelector('.event-featured-image');
  
  const businessConnectionSwiper = new Swiper('.business-connection-swiper', {
    modules: [Navigation, Mousewheel],
    direction: 'vertical',
    slidesPerView: Math.min(3, slideCount),
    spaceBetween: 16,
    grabCursor: true,
    mousewheel: {
      enabled: true,
      forceToAxis: true,
      sensitivity: 1,
      releaseOnEdges: true,
      eventsTarget: '.business-connection-swiper',
    },
    navigation: {
      nextEl: '.business-connection-next', // Right button (chevron-right) goes DOWN
      prevEl: '.business-connection-prev', // Left button (chevron-left) goes UP
      disabledClass: 'opacity-30 pointer-events-none',
    },
    // Responsive breakpoints
    breakpoints: {
      640: {
        slidesPerView: Math.min(3, slideCount),
        spaceBetween: 16,
      },
      768: {
        slidesPerView: Math.min(3, slideCount),
        spaceBetween: 16,
      },
      1024: {
        slidesPerView: Math.min(3, slideCount),
        spaceBetween: 16,
      },
    },
  });

  // Sync featured image with active carousel slide
  if (featuredImg) {
    businessConnectionSwiper.on('slideChange', () => {
      const activeSlide = businessConnectionSwiper.slides[businessConnectionSwiper.activeIndex];
      const featuredImage = activeSlide?.dataset.featuredImage;
      
      if (featuredImage) {
        featuredImg.src = featuredImage;
      }
    });
  }

  return businessConnectionSwiper;
}
