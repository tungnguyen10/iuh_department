# faculty-build-pipeline Specification

## Purpose
Defines how the Vite build pipeline handles per-faculty builds, page resolution, asset copying, and data file cascading.

## Requirements
### Requirement: Per-faculty build command
Build system SHALL support `VITE_FACULTY={faculty-id}` env var để build static site riêng cho từng khoa vào output directory riêng.

`package.json` SHALL có scripts: `dev:{faculty-id}` và `build:{faculty-id}` cho mỗi khoa đã config. `build:all` script SHALL build tất cả faculties sequentially.

#### Scenario: Build faculty cụ thể ra dist riêng
- **WHEN** chạy `yarn build:health-science`
- **THEN** static files được output vào `dist/health-science/` với đúng faculty colors và content

#### Scenario: Dev server cho faculty cụ thể
- **WHEN** chạy `yarn dev:health-science`
- **THEN** dev server start với KKSK faculty data, colors, và components

#### Scenario: build:all chạy tất cả faculties
- **WHEN** chạy `yarn build:all`
- **THEN** mỗi faculty được build sequentially, mỗi cái ra dist folder riêng

### Requirement: Faculty-specific page glob
Vite build SHALL tìm page HTML files trong `src/faculties/{FACULTY}/pages/` trước, merge với `src/pages/` (shared). Nếu cùng tên file tồn tại ở cả hai nơi, faculty-specific file có priority.

#### Scenario: Faculty index page override shared
- **WHEN** `src/faculties/health-science/pages/index.html` tồn tại
- **THEN** build dùng faculty page thay vì `src/pages/index.html`

#### Scenario: Shared pages không override
- **WHEN** faculty không có `pages/news.html` nhưng `src/pages/news.html` tồn tại
- **THEN** build include `news.html` từ shared

#### Scenario: Faculty-only page được include
- **WHEN** `src/faculties/information-tech/pages/labs.html` tồn tại và không có shared equivalent
- **THEN** build include page này

### Requirement: Faculty assets trong build output
Build system SHALL copy assets từ `src/faculties/{FACULTY}/assets/` (nếu tồn tại) vào dist output, merge với shared assets. Faculty assets override shared assets của cùng tên file.

#### Scenario: Faculty logo override shared logo
- **WHEN** `src/faculties/information-tech/assets/images/intro-image.png` tồn tại
- **THEN** dist/information-tech/ chứa faculty-specific image thay vì shared version

### Requirement: Data file cascade
`public/data/messages-vi.json` và `messages-en.json` SHALL được đọc theo order: faculty-specific (`src/faculties/{FACULTY}/data/`) override shared (`public/data/`). Deep merge SHALL được áp dụng — faculty chỉ cần override keys thay đổi.

#### Scenario: Faculty override một số keys trong messages
- **WHEN** `faculty/data/messages-vi.json` chỉ chứa `{"faculty.name": "Khoa CNTT"}` và shared có 50 keys
- **THEN** built site dùng faculty value cho `faculty.name` và shared values cho 49 keys còn lại
