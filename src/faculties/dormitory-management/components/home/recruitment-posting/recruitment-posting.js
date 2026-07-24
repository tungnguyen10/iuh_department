import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

export function initRecruitmentPostingSwiper() {
  const swiperEl = document.querySelector('.recruitment-posting-swiper')
  if (!swiperEl) return

  const slideCount = swiperEl.querySelectorAll('.swiper-slide').length

  return new Swiper(swiperEl, {
    modules: [Navigation, Pagination, Autoplay],
    slidesPerView: 1.2,
    spaceBetween: 5,
    loop: slideCount > 1,
    grabCursor: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.recruitment-posting-next',
      prevEl: '.recruitment-posting-prev',
      disabledClass: 'opacity-40 pointer-events-none',
    },
    pagination: {
      el: '.recruitment-posting-pagination',
      clickable: true,
      dynamicBullets: false,
    },
    watchOverflow: true,
    speed: 400,
    breakpoints: {
      640: {
        slidesPerView: Math.min(2, slideCount),
        spaceBetween: 5,
      },
      768: {
        slidesPerView: Math.min(3, slideCount),
        spaceBetween: 5,
      },
      1180: {
        slidesPerView: Math.min(4, slideCount),
        spaceBetween: 5,
      },
    },
  })
}
