## MODIFIED Requirements

### Requirement: Per-faculty build command
Build system SHALL support `VITE_FACULTY={faculty-id}` env var để build static site riêng cho từng khoa vào output directory riêng.

`package.json` SHALL có scripts: `dev:{faculty-id}` và `build:{faculty-id}` cho mỗi khoa đã config trong `src/faculties/`. `build:all` script SHALL build tất cả faculties sequentially.

Faculties hiện tại: `health-science`, `dormitory-management`.

#### Scenario: Build faculty cụ thể ra dist riêng
- **WHEN** chạy `yarn build:health-science`
- **THEN** static files được output vào `dist/health-science/` với đúng faculty colors và content

#### Scenario: Dev server cho faculty cụ thể
- **WHEN** chạy `yarn dev:health-science`
- **THEN** dev server start với KKSK faculty data, colors, và components

#### Scenario: Build khoa thứ 2 dormitory-management
- **WHEN** chạy `yarn build:dormitory-management`
- **THEN** `dist/dormitory-management/` được tạo với identity Phòng QLKTX (tên, màu, contact, nav riêng); không nhầm lẫn với KKSK content

#### Scenario: build:all chạy tất cả faculties
- **WHEN** chạy `yarn build:all`
- **THEN** mỗi faculty được build sequentially, mỗi cái ra dist folder riêng

### Requirement: Faculty-specific page glob
Vite build SHALL tìm page HTML files trong `src/faculties/{FACULTY}/pages/` trước, merge với `src/pages/` (shared). Nếu cùng tên file tồn tại ở cả hai nơi, faculty-specific file có priority.

Pages trong subdirectory `_dev/` của `src/pages/` (vd `src/pages/_dev/form.html`) SHALL bị exclude khỏi production build cho mọi khoa, nhưng VẪN serve được trong dev server.

Pages có tên trong `faculty.json` field `excludePages` SHALL bị exclude khỏi build của faculty đó (xem `faculty-config` spec).

#### Scenario: Faculty index page override shared
- **WHEN** `src/faculties/health-science/pages/index.html` tồn tại
- **THEN** build dùng faculty page thay vì `src/pages/index.html`

#### Scenario: Shared pages không override
- **WHEN** faculty không có `pages/news.html` nhưng `src/pages/news.html` tồn tại
- **THEN** build include `news.html` từ shared

#### Scenario: Faculty-only page được include
- **WHEN** `src/faculties/dormitory-management/pages/services.html` tồn tại và không có shared equivalent
- **THEN** build include page này

#### Scenario: Page trong _dev/ không build vào production
- **WHEN** `src/pages/_dev/form.html` tồn tại và chạy `yarn build:health-science`
- **THEN** `dist/health-science/form.html` không tồn tại

#### Scenario: Page trong _dev/ vẫn serve được trong dev
- **WHEN** dev server chạy và truy cập `/_dev/form.html`
- **THEN** trang render được với layout đầy đủ

#### Scenario: Page trong excludePages bị bỏ qua
- **WHEN** `excludePages: ["majors.html"]` và `src/pages/majors.html` tồn tại
- **THEN** build của faculty này không output `majors.html`
