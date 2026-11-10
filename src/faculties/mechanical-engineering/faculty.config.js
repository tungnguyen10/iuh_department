import site from "./data/site.json";

const facultyComponentStyles = import.meta.glob("./components/**/*.scss", {
  eager: true,
});

export const mechanicalEngineeringFacultyConfig = {
  id: "mechanical-engineering",
  name: "Khoa Công nghệ Cơ khí",
  locale: "vi",
  source: {
    root: "src/faculties/mechanical-engineering",
    pages: "src/faculties/mechanical-engineering/pages",
    components: "src/faculties/mechanical-engineering/components",
    data: "src/faculties/mechanical-engineering/data",
    assets: "src/faculties/mechanical-engineering/assets",
  },
  output: {
    html: "/",
    data: "/data",
    images: "/assets/images",
    svgs: "/assets/svgs",
    documents: "/assets/documents",
  },
  styles: facultyComponentStyles,
  search: site.search,
  runtimeModules: [
    {
      selector: ".hero-swiper",
      load: () => import("./components/home/carousel/carousel.js"),
      init: "initHeroCarousel",
      name: "Hero Carousel",
    },
    {
      selector: ".major-swiper",
      load: () => import("./components/major/major.js"),
      init: "initMajorSwiper",
      name: "Major Swiper",
    },
    {
      selector: ".admission-swiper",
      load: () => import("./components/home/admission/admission.js"),
      init: "initAdmissionSwiper",
      name: "Admission Swiper",
    },
    {
      selector: ".intro-section",
      load: () => import("./components/home/intro/intro.js"),
      init: "initIntro",
      name: "Intro Section",
    },
    {
      selector: ".infrastructure-swiper",
      load: () => import("./components/home/infrastructure/infrastructure.js"),
      init: "initInfrastructure",
      name: "Infrastructure",
    },
    {
      selector: ".business-connection-swiper",
      load: () => import("./components/careers/careers.js"),
      init: "initBusinessConnectionSwiper",
      name: "Business Connection",
    },
    {
      selector: ".industry-partnership-swiper",
      load: () => import("./components/industry-partnerships/industry-partnerships.js"),
      init: "initIndustryPartnershipSwiper",
      name: "Industry Partnerships",
    },
    {
      selector: "#pattern-canvas",
      load: () => import("./components/home/research/research-background-canvas.js"),
      init: "initPatternCanvas",
      name: "Pattern Canvas",
    },
  ],
};

export default mechanicalEngineeringFacultyConfig;
