## 1. Foundation — Faculty Folder Structure

- [x] 1.1 Tạo `src/faculties/` directory structure
- [x] 1.2 Tạo `src/faculties/health-science/faculty.json` với đầy đủ schema (name, shortName, email, phone, nav, topBar, social, colors cho KKSK)
- [x] 1.3 Tạo `src/faculties/health-science/data/` và copy `public/data/messages-vi.json` + `messages-en.json` vào đây
- [x] 1.4 Tạo `src/faculties/health-science/pages/index.html` (copy từ `src/pages/index.html` hiện tại — sections KKSK)
- [x] 1.5 Tạo `src/faculties/health-science/components/intro/` — copy và giữ content KKSK hiện tại
- [x] 1.6 Tạo `src/faculties/health-science/components/major/` — copy và giữ content KKSK hiện tại

## 2. Vite Config — Faculty Loading + CSS Variable Injection

- [x] 2.1 Thêm helper `loadFaculty(facultyId)` trong `vite.config.js`: đọc `faculty.json`, validate required fields, throw error nếu thiếu
- [x] 2.2 Thêm helper `hexToRgbSpace(hex)`: convert `#153898` → `21 56 152` (space-separated integers)
- [x] 2.3 Thêm `VITE_FACULTY` env var reading với default `health-science`
- [x] 2.4 Trong `layoutPlugin`, inject `<style>:root{...}</style>` block vào `<head>` với 4 CSS variables từ `faculty.json.colors`
- [x] 2.5 Trong `layoutPlugin`, mở rộng template variable injection để hỗ trợ `{{faculty.name}}`, `{{faculty.shortName}}`, `{{faculty.email}}`, `{{faculty.phone}}`

## 3. Vite Config — Nav Generation

- [x] 3.1 Implement `generateNavHtml(navArray)` function: convert `faculty.json.nav[]` → HTML `<li>` elements
- [x] 3.2 Implement `generateTopBarHtml(topBarArray)` function: convert `faculty.json.topBar[]` → HTML links
- [x] 3.3 Inject generated nav HTML vào layout template qua placeholder `{{faculty.navHtml}}` và `{{faculty.topBarHtml}}`

## 4. Vite Config — Page Glob và @faculty/ Alias

- [x] 4.1 Cập nhật `htmlFiles` glob: merge `src/faculties/{FACULTY}/pages/*.html` với `src/pages/*.html`, faculty page có priority nếu cùng tên
- [x] 4.2 Cập nhật `mapUrlToFsPath()` trong dev server middleware để handle faculty pages
- [x] 4.3 Trong `transformDataInclude` plugin, thêm resolve logic cho `@faculty/` alias: check faculty component trước, fallback shared
- [x] 4.4 Verify `@components/` alias không bị ảnh hưởng bởi thay đổi trên

## 5. Header và Footer Generalization

- [x] 5.1 Trong `header.html`, replace "KHOA KHOA HỌC SỨC KHOẺ" hardcode → `{{faculty.shortName}}` hoặc `{{faculty.name}}`
- [x] 5.2 Trong `header.html`, replace hardcoded nav `<li>` items → `{{faculty.navHtml}}`
- [x] 5.3 Trong `header.html`, replace hardcoded topBar links → `{{faculty.topBarHtml}}`
- [x] 5.4 Trong `header.html`, replace hardcoded contact (email, phone) → `{{faculty.email}}`, `{{faculty.phone}}`
- [x] 5.5 Trong `footer.html`, replace hardcoded faculty name, phone, email → template vars
- [x] 5.6 Trong `footer.html`, replace social links → generated từ `faculty.json.social`

## 6. Asset Copy Pipeline

- [x] 6.1 Cập nhật `copyPublicDataPlugin`: ưu tiên copy từ `src/faculties/{FACULTY}/data/` over `public/data/`, dùng deep merge cho JSON files
- [x] 6.2 Thêm `copyFacultyAssetsPlugin`: copy `src/faculties/{FACULTY}/assets/` (nếu tồn tại) vào dist, override shared assets cùng tên

## 7. Package.json Scripts

- [x] 7.1 Thêm `dev:health-science` script: `VITE_FACULTY=health-science vite`
- [x] 7.2 Thêm `build:health-science` script: `VITE_FACULTY=health-science vite build --outDir dist/health-science`
- [x] 7.3 Thêm `build:all` script: chạy `build:health-science` (sẽ extend khi thêm khoa mới)
- [x] 7.4 Update `build` script (default) để dùng VITE_FACULTY=health-science (backward compat với `dist_iuh`)

## 8. Verification

- [x] 8.1 Chạy `yarn build:health-science` — verify output giống `dist_iuh/` hiện tại (đúng colors, nav, content)
- [x] 8.2 Verify `yarn build` (không có VITE_FACULTY) vẫn build thành công với default health-science
- [x] 8.3 Tạo thử `src/faculties/test-faculty/faculty.json` với màu khác — verify CSS variables inject đúng màu vào HTML output
- [x] 8.4 Verify `@faculty/intro/` resolve đúng: dùng faculty override khi có, fallback shared khi không
- [x] 8.5 Verify tất cả 14 existing pages build không bị lỗi
- [x] 8.6 Xóa `src/faculties/test-faculty/` sau khi verify xong
