const facultyComponentStyles = import.meta.glob("./components/**/*.scss", {
  eager: true,
});

export const healthScienceFacultyConfig = {
  id: "health-science",
  name: "Khoa Khoa hoc Suc khoe",
  locale: "vi",
  source: {
    root: "src/faculties/health-science",
    pages: "src/faculties/health-science/pages",
    components: "src/faculties/health-science/components",
    data: "src/faculties/health-science/data",
    assets: "src/faculties/health-science/assets",
  },
  output: {
    html: "/",
    data: "/data",
    images: "/assets/images",
    svgs: "/assets/svgs",
    documents: "/assets/documents",
  },
  styles: facultyComponentStyles,
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
      selector: ".avatar-teacher",
      load: () => import("./components/leadership/leadership.js"),
      init: "initLeadership",
      name: "Leadership",
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
    {
      selector: "#majorQuiz",
      load: () => import("./components/major/major-quiz.js"),
      init: "initMajorQuiz",
      name: "Major Quiz",
      assignToWindow: "majorQuizInstance",
    },
  ],
};

export default healthScienceFacultyConfig;
