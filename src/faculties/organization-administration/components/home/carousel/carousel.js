import Swiper from "swiper";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";

export function initHeroCarousel() {
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