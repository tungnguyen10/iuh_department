import site from "./data/site.json";

const facultyComponentStyles = import.meta.glob("./components/**/*.scss", {
  eager: true,
});

export const idcsFacultyConfig = {
  id: "idcs",
  name: "Trung tâm IDCS",
  locale: "vi",
  source: {
    root: "src/faculties/idcs",
    pages: "src/faculties/idcs/pages",
    components: "src/faculties/idcs/components",
    data: "src/faculties/idcs/data",
    assets: "src/faculties/idcs/assets",
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
  ],
};

export default idcsFacultyConfig;
