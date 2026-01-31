/**
 * News Carousel Component
 * Horizontal carousel with navigation buttons
 */
import Swiper from 'swiper'
import { Navigation, Autoplay } from 'swiper/modules'

export function initNewsSwiper() {
  const newsSwiper = new Swiper('.news-swiper', {
    modules: [Navigation, Autoplay],
    slidesPerView: 1.2,
    spaceBetween: 0,
    loop: true,
    grabCursor: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.news-nav-next',
      prevEl: '.news-nav-prev',
    },
    // Responsive breakpoints
    breakpoints: {
      640: {
        slidesPerView: 2,
        // spaceBetween: 10,
      },
      768: {
        slidesPerView: 3,
        // spaceBetween: 10,
      },
      1024: {
        slidesPerView: 4,
        // spaceBetween: 10,
      },
    },
  });

  return newsSwiper;
}
