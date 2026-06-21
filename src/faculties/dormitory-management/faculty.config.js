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
      { text: "Đăng ký nội trú", href: "/contact.html" },
      { text: "Sinh viên nội trú", href: "/" },
      { text: "Hỗ trợ bảo trì", href: "/contact.html" },
    ],
    navItems: [
      { text: "TRANG CHỦ", href: "/" },
      { text: "THÔNG BÁO", href: "/" },
      {
        text: "DỊCH VỤ NỘI TRÚ",
        children: [
          { text: "Đăng ký chỗ ở", href: "/contact.html" },
          { text: "Bảo trì phòng ở", href: "/contact.html" },
          { text: "An ninh ký túc xá", href: "/contact.html" },
          { text: "Nội quy sinh hoạt", href: "/" },
        ],
      },
      { text: "CƠ SỞ VẬT CHẤT", href: "/#infrastructure-section" },
      { text: "LIÊN HỆ", href: "/contact.html" },
    ],
  },
  search: {
    quickLinks: [
      { text: "Đăng ký nội trú", href: "/contact.html" },
      { text: "Bảo trì phòng ở", href: "/contact.html" },
      { text: "An ninh ký túc xá", href: "/contact.html" },
      { text: "Cơ sở vật chất", href: "/#infrastructure-section" },
      { text: "Thông báo", href: "/" },
      { text: "Liên hệ", href: "/contact.html" },
    ],
    categories: [
      { text: "Thông báo", href: "/", icon: "TB" },
      { text: "Dịch vụ nội trú", href: "/contact.html", icon: "DV" },
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
