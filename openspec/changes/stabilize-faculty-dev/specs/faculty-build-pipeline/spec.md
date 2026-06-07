## MODIFIED Requirements

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
