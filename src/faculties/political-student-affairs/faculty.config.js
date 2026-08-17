const facultyComponentStyles = import.meta.glob("./components/**/*.scss", {
  eager: true,
});

export const politicalStudentAffairsFacultyConfig = {
  id: "political-student-affairs",
  name: "Phòng Công tác chính trị và Hỗ trợ sinh viên",
  locale: "vi",
  source: {
    root: "src/faculties/political-student-affairs",
    pages: "src/faculties/political-student-affairs/pages",
    components: "src/faculties/political-student-affairs/components",
    data: "src/faculties/political-student-affairs/data",
    assets: "src/faculties/political-student-affairs/assets",
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
      { text: "Tin tức", href: "/news.html" },
      { text: "Ban lãnh đạo", href: "/leadership.html" },
      { text: "Liên hệ hỗ trợ", href: "/contact.html" },
    ],
    categories: [
      { text: "Giới thiệu", href: "/about.html", icon: "GT" },
      { text: "Tin tức", href: "/news.html", icon: "TT" },
      { text: "Ban lãnh đạo", href: "/leadership.html", icon: "LĐ" },
      { text: "Liên hệ", href: "/contact.html", icon: "LH" },
    ],
  },
  runtimeModules: [],
};

export default politicalStudentAffairsFacultyConfig;
