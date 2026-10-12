import Swiper from "swiper"
import { Pagination, Autoplay } from "swiper/modules"

export function initRoomsCarousel() {
  return new Swiper(".rooms-swiper", {
    modules: [Pagination, Autoplay],
    slidesPerView: 1,
    loop: true,
    speed: 600,
    autoHeight: false,
    autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: ".rooms-pagination", clickable: true },
    a11y: {
      paginationBulletMessage: "Xem phòng {{index}}",
    },
  })
}
