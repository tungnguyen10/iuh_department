import Swiper from "swiper";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import campusImage from "../../../../faculties/dormitory-management/assets/images/dormitory-campus.jpg";
import facilitySixImage from "../../../../faculties/dormitory-management/assets/images/dormitory-facility-6.jpg";
import facilitySevenImage from "../../../../faculties/dormitory-management/assets/images/dormitory-facility-7.jpg";

const carouselImages = {
  campus: campusImage,
  "facility-6": facilitySixImage,
  "facility-7": facilitySevenImage,
};

export function initHeroCarousel() {
  document.querySelectorAll("[data-carousel-image]").forEach((image) => {
    const imagePath = carouselImages[image.dataset.carouselImage];
    if (!imagePath) return;

    image.src = imagePath;
    image.closest("picture")?.querySelector("[data-carousel-source]")?.setAttribute("srcset", imagePath);
  });

  const heroSwiper = new Swiper(".hero-swiper", {
    modules: [Navigation, Pagination, Autoplay, EffectCoverflow],
    effect: "coverflow",
    coverflowEffect: {
      rotate: 24,
      stretch: 0,
      depth: 90,
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
      el: ".hero-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".hero-nav-next",
      prevEl: ".hero-nav-prev",
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      heroSwiper.autoplay.stop();
    } else {
      heroSwiper.autoplay.start();
    }
  });

  return heroSwiper;
}