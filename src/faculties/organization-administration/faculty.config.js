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
  runtimeModules: [],
};

export default organizationAdministrationFacultyConfig;
