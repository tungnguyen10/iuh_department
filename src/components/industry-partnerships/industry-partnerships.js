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
  
  // Cache DOM elements for performance
  const partnershipsContainer = swiperEl.closest('.industry-partnerships-section');
  const featuredImg = partnershipsContainer?.querySelector('.event-featured-image');
  
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

  // Sync featured image with active carousel slide
  if (featuredImg) {
    industryPartnershipSwiper.on('slideChange', () => {
      const activeSlide = industryPartnershipSwiper.slides[industryPartnershipSwiper.activeIndex];
      const featuredImage = activeSlide?.dataset.featuredImage;
      
      if (featuredImage) {
        featuredImg.src = featuredImage;
      }
    });
  }

  return industryPartnershipSwiper;
}
