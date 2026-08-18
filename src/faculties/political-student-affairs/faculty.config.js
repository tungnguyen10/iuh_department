import site from "./data/site.json";

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
  search: site.search,
  runtimeModules: [],
};

export default politicalStudentAffairsFacultyConfig;
