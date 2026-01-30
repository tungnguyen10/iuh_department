/**
 * Industry Partnerships Event Carousel
 * Vertical carousel for partnership event cards with navigation from event-featured
 */
import Swiper from 'swiper'
import { Navigation, Mousewheel } from 'swiper/modules'

export function initIndustryPartnershipSwiper() {
  const swiperEl = document.querySelector('.industry-partnership-swiper');
  if (!swiperEl) return;
  
  const slideCount = swiperEl.querySelectorAll('.swiper-slide').length;
  
  const industryPartnershipSwiper = new Swiper('.industry-partnership-swiper', {
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
    },
    navigation: {
      nextEl: '.industry-partnership-next',
      prevEl: '.industry-partnership-prev',
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

  return industryPartnershipSwiper;
}
