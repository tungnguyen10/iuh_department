import site from "./data/site.json";

const facultyComponentStyles = import.meta.glob("./components/**/*.scss", {
  eager: true,
});

export const dormitoryManagementFacultyConfig = {
  id: "dormitory-management",
  name: "Phòng Quản lý Ký túc xá",
  locale: "vi",
  source: {
    root: "src/faculties/dormitory-management",
    pages: "src/faculties/dormitory-management/pages",
    components: "src/faculties/dormitory-management/components",
    data: "src/faculties/dormitory-management/data",
    assets: "src/faculties/dormitory-management/assets",
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
      name: "Dormitory Hero Carousel",
    },
    {
      selector: ".infrastructure-card",
      load: () => import("./components/home/infrastructure/infrastructure.js"),
      init: "initInfrastructure",
      name: "Dormitory Infrastructure",
    },
    // Tạm tắt cùng section recruitment-posting (không include ở trang chủ).
    // Bật lại khi thêm lại component vào pages/index.html.
    // {
    //   selector: ".recruitment-posting-swiper",
    //   load: () => import("./components/home/recruitment-posting/recruitment-posting.js"),
    //   init: "initRecruitmentPostingSwiper",
    //   name: "Dormitory Recruitment Posting",
    // },
  ],
};

export default dormitoryManagementFacultyConfig;
