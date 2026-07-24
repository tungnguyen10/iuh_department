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
  search: {
    quickLinks: [
      { text: "Giới thiệu", href: "/about.html" },
      { text: "Đăng ký nội trú", href: "/news-detail.html" },
      { text: "Bảo trì phòng ở", href: "/news-detail.html" },
      { text: "An ninh ký túc xá", href: "/news-detail.html" },
      { text: "Cơ sở vật chất", href: "/#infrastructure-section" },
      { text: "Thông báo", href: "/news.html" },
      { text: "Liên hệ", href: "/contact.html" },
    ],
    categories: [
      { text: "Giới thiệu", href: "/about.html", icon: "GT" },
      { text: "Thông báo", href: "/news.html", icon: "TB" },
      { text: "Dịch vụ nội trú", href: "/news-detail.html", icon: "DV" },
      { text: "Cơ sở vật chất", href: "/#infrastructure-section", icon: "CS" },
      { text: "Liên hệ hỗ trợ", href: "/contact.html", icon: "LH" },
    ],
  },
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
    {
      selector: ".recruitment-posting-swiper",
      load: () => import("./components/home/recruitment-posting/recruitment-posting.js"),
      init: "initRecruitmentPostingSwiper",
      name: "Dormitory Recruitment Posting",
    },
  ],
};

export default dormitoryManagementFacultyConfig;
