/**
 * Initialize admission carousel with Swiper
 */
import Swiper from 'swiper'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'

export function initAdmissionSwiper() {
  const swiperEl = document.querySelector('.admission-swiper')
  
  // Safety check: ensure element exists
  if (!swiperEl) {
    console.warn('Admission swiper element not found')
    return null
  }

  const swiperInstance = new Swiper('.admission-swiper', {
    modules: [Pagination, Navigation, Autoplay],
    slidesPerView: 1.2, // Mobile: 1.2 slides
    spaceBetween: 16,
    centeredSlides: false,
    observer: true,
    observeParents: true,
    updateOnWindowResize: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.admission-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.admission-nav-next',
      prevEl: '.admission-nav-prev',
    },
    breakpoints: {
      // Tablet: 1.3 slides
      640: {
        slidesPerView: 1.3,
        spaceBetween: 20,
      },
      // Desktop: 2 slides
      1024: {
        slidesPerView: 2,
        spaceBetween: 24,
      },
    },
    on: {
      init: function () {
        console.log('Admission swiper initialized')
      },
      resize: function () {
        this.update()
      },
    },
  })

  return swiperInstance
}
