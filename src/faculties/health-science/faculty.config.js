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
  header: {
    unitName: "KHOA KHOA HỌC SỨC KHỎE",
    email: "dhcn@iuh.edu.vn",
    phone: "0283 8940 390",
    quickLinks: [
      { text: "Tuyển dụng - Việc làm", href: "#" },
      { text: "Sinh viên", href: "/students.html" },
      { text: "Kết nối doanh nghiệp", href: "#" },
    ],
    navItems: [
      { text: "GIỚI THIỆU", href: "/about.html" },
      { text: "TIN TỨC - SỰ KIỆN", href: "/news.html" },
      {
        text: "NGHIÊN CỨU KHOA HỌC",
        children: [
          { text: "Đề tài nghiên cứu", href: "/news.html" },
          { text: "Công bố khoa học", href: "/news.html" },
          { text: "Giải thưởng", href: "/news.html" },
          { text: "Hợp tác nghiên cứu", href: "/news.html" },
        ],
      },
      {
        text: "ĐÀO TẠO",
        children: [
          { text: "Chuyên ngành đào tạo", href: "/majors.html" },
          { text: "Chương trình đào tạo", href: "/about.html" },
          { text: "Tuyển sinh", href: "/contact.html" },
          { text: "Kế hoạch giảng dạy", href: "/about.html" },
          { text: "Đánh giá chất lượng", href: "/form.html" },
        ],
      },
      {
        text: "SINH VIÊN",
        children: [
          { text: "Thông tin sinh viên", href: "/students.html" },
          { text: "Biểu mẫu", href: "/form.html" },
          { text: "Tin tức", href: "/news.html" },
          { text: "Liên hệ", href: "/contact.html" },
        ],
      },
    ],
  },
  search: {
    quickLinks: [
      { text: "Tuyển sinh", href: "/majors.html" },
      { text: "Học bổng", href: "/students.html" },
      { text: "Nghiên cứu khoa học", href: "/news.html" },
      { text: "Đào tạo", href: "/majors.html" },
      { text: "Lịch thi", href: "/students.html" },
      { text: "Thông báo", href: "/news.html" },
    ],
    categories: [
      { text: "Tin tức - Sự kiện", href: "/news.html", icon: "TT" },
      { text: "Đào tạo", href: "/majors.html", icon: "DT" },
      { text: "Nghiên cứu khoa học", href: "/news.html", icon: "NC" },
      { text: "Sinh viên", href: "/students.html", icon: "SV" },
    ],
  },
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
