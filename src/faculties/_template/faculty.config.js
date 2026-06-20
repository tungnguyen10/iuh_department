const facultyComponentStyles = import.meta.glob("./components/**/*.scss", {
  eager: true,
});

export const templateFacultyConfig = {
  id: "_template",
  name: "Template Faculty",
  locale: "vi",
  source: {
    root: "src/faculties/_template",
    pages: "src/faculties/_template/pages",
    components: "src/faculties/_template/components",
    data: "src/faculties/_template/data",
    assets: "src/faculties/_template/assets",
  },
  output: {
    html: "/",
    data: "/data",
    images: "/assets/images",
    svgs: "/assets/svgs",
    documents: "/assets/documents",
  },
  styles: facultyComponentStyles,
  runtimeModules: [],
};

export default templateFacultyConfig;
