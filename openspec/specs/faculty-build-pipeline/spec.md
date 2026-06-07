# faculty-build-pipeline Specification

## Purpose
Defines how the Vite build pipeline handles per-faculty builds, page resolution, asset copying, and data file cascading.
## Requirements
### Requirement: Per-faculty build command
Build system SHALL support `VITE_FACULTY={faculty-id}` env var để build static site riêng cho từng khoa vào output directory riêng.

`package.json` SHALL có scripts: `dev:{faculty-id}` và `build:{faculty-id}` cho mỗi khoa đã config. `build:all` script SHALL build tất cả faculties sequentially.

Build/dev scripts SHALL chạy được trên cross-platform shell (Windows PowerShell, Windows cmd, macOS/Linux bash, zsh) mà không cần shell-specific syntax. Implementation SHALL dùng `cross-env` để set environment variables trong npm scripts.

#### Scenario: Build faculty cụ thể ra dist riêng
- **WHEN** chạy `yarn build:health-science`
- **THEN** static files được output vào `dist/health-science/` với đúng faculty colors và content

#### Scenario: Dev server cho faculty cụ thể
- **WHEN** chạy `yarn dev:health-science`
- **THEN** dev server start với KKSK faculty data, colors, và components

#### Scenario: build:all chạy tất cả faculties
- **WHEN** chạy `yarn build:all`
- **THEN** mỗi faculty được build sequentially, mỗi cái ra dist folder riêng

#### Scenario: Scripts chạy trên Windows PowerShell
- **WHEN** chạy `yarn dev:dormitory-management` từ Windows PowerShell
- **THEN** dev server start thành công với `VITE_FACULTY=dormitory-management`, không bị lỗi "VITE_FACULTY is not recognized as a command"

#### Scenario: Scripts chạy trên macOS/Linux bash
- **WHEN** chạy `yarn build:health-science` từ bash trên macOS
- **THEN** build hoàn thành như trước, không bị regression do cross-env wrapper

### Requirement: Faculty-specific page glob
Vite build SHALL resolve HTML pages from `src/faculties/{FACULTY}/pages/` first, then merge with `src/pages/`. If the same relative page path exists in both places, the faculty-specific page wins.

Pages under `src/pages/_dev/` SHALL be excluded from production builds for every faculty, but SHALL remain reachable in dev server mode.

Pages named in `faculty.json.excludePages` SHALL be excluded from the build for that faculty.

#### Scenario: Faculty index page override shared
- **WHEN** `src/faculties/health-science/pages/index.html` exists
- **THEN** the build uses that page instead of `src/pages/index.html`

#### Scenario: Shared pages khong override
- **WHEN** a faculty has no `pages/news.html` but `src/pages/news.html` exists
- **THEN** the build includes the shared `news.html`

#### Scenario: Faculty-only page duoc include
- **WHEN** `src/faculties/dormitory-management/pages/services.html` exists and there is no shared equivalent
- **THEN** the build includes that page

#### Scenario: Page trong _dev/ khong build vao production
- **WHEN** `src/pages/_dev/form.html` exists and `yarn build:health-science` runs
- **THEN** `dist/health-science/form.html` does not exist

#### Scenario: Page trong _dev/ van serve duoc trong dev
- **WHEN** the dev server is running and `/_dev/form.html` is requested
- **THEN** the page renders with the normal layout

#### Scenario: Page trong excludePages bi bo qua
- **WHEN** `excludePages: ["majors.html"]` and `src/pages/majors.html` exists
- **THEN** that faculty build does not output `majors.html`

### Requirement: Faculty assets trong build output
Build system SHALL copy assets from `src/faculties/{FACULTY}/assets/` into dist output and merge them with shared assets. Faculty assets override shared assets with the same relative path.

#### Scenario: Faculty logo override shared logo
- **WHEN** `src/faculties/information-tech/assets/images/intro-image.png` exists
- **THEN** the faculty dist contains the faculty-specific image instead of the shared version

### Requirement: Data file cascade
Files under `public/data/` SHALL be read with faculty-specific overrides from `src/faculties/{FACULTY}/data/`. For JSON files, deep merge SHALL be applied so a faculty can override only the changed keys.

#### Scenario: Faculty override mot so keys trong messages
- **WHEN** `faculty/data/messages-vi.json` contains only `{"faculty.name": "Khoa CNTT"}` and shared data contains many more keys
- **THEN** the built site uses the faculty value for `faculty.name` and shared values for all remaining keys

