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
  header: {
    unitName: "PHÒNG QUẢN LÝ KÝ TÚC XÁ",
    email: "kytucxa@iuh.edu.vn",
    phone: "0283 8940 390",
    quickLinks: [
      { text: "Giới thiệu KTX", href: "/about.html" },
      { text: "Đăng ký nội trú", href: "/news-detail.html" },
      { text: "Sinh viên nội trú", href: "/news.html" },
      { text: "Hỗ trợ bảo trì", href: "/news-detail.html" },
    ],
    navItems: [
      { text: "TRANG CHỦ", href: "/" },
      { text: "GIỚI THIỆU", href: "/about.html" },
      { text: "THÔNG BÁO", href: "/news.html" },
      {
        text: "DỊCH VỤ NỘI TRÚ",
        children: [
          { text: "Trang chủ", href: "/" },
          { text: "Giới thiệu KTX", href: "/about.html" },
          { text: "Thông báo", href: "/news.html" },
          { text: "Chi tiết thông báo", href: "/news-detail.html" },
          { text: "Hoạt động", href: "/activities.html" },
          { text: "Chi tiết hoạt động", href: "/activities-details.html" },
          { text: "Liên hệ", href: "/contact.html" },
          { text: "Đăng nhập", href: "/login.html" },
          { text: "Tra cứu đăng ký", href: "/tra-cuu.html" },
        ],
      },
      { text: "CƠ SỞ VẬT CHẤT", href: "/#infrastructure-section" },
      { text: "LIÊN HỆ", href: "/contact.html" },
    ],
  },
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
  ],
};

export default dormitoryManagementFacultyConfig;
