import site from "./data/site.json";

const facultyComponentStyles = import.meta.glob("./components/**/*.scss", {
  eager: true,
});

export const organizationAdministrationFacultyConfig = {
  id: "organization-administration",
  name: "Phòng Tổ chức – Hành chính",
  locale: "vi",
  source: {
    root: "src/faculties/organization-administration",
    pages: "src/faculties/organization-administration/pages",
    components: "src/faculties/organization-administration/components",
    data: "src/faculties/organization-administration/data",
    assets: "src/faculties/organization-administration/assets",
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
      selector: ".activity-gallery-card",
      load: () => import("./components/home/activity-gallery/gallery.js"),
      init: "initActivityGallery",
      name: "Activity Gallery",
    },
  ],
};

export default organizationAdministrationFacultyConfig;
