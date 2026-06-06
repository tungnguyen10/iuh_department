## Why

Source hiện tại được build cứng cho 1 khoa (Khoa Khoa học Sức khoẻ). Khi mở rộng cho ~10 khoa, mỗi khoa có navigation, contact, màu sắc brand, nội dung giới thiệu và cấu trúc sections trang chủ khác nhau — không có cơ chế nào để reuse shared code trong khi override phần riêng của từng khoa. Cần một kiến trúc multi-faculty rõ ràng để 1 developer có thể maintain toàn bộ, mỗi khoa build ra 1 static site độc lập deploy trên domain riêng.

## What Changes

- **Thêm `src/faculties/` folder**: Mỗi khoa có subfolder riêng với `faculty.json`, faculty-specific pages, components override, và data files.
- **Thêm `faculty.json` schema**: File config identity cho từng khoa — name, nav links, contact, social, brand colors.
- **Thêm brand color token system**: `tailwind.config.js` thêm `brand.*` tokens dùng CSS variables (RGB format) để support opacity modifier. `main.scss` định nghĩa `:root` defaults.
- **Cập nhật `vite.config.js`**: Đọc `VITE_FACULTY` env var, load `faculty.json`, inject CSS variables vào `<head>`, resolve `@faculty/` alias với fallback sang `@components/`.
- **Cập nhật `package.json`**: Thêm `dev:{faculty}` và `build:{faculty}` scripts cho từng khoa.
- **Thêm instruction files**: `design-system.instructions.md`, `components.instructions.md`, `multi-faculty.instructions.md` để enforce conventions khi làm component mới.
- **Migrate KKSK vào `src/faculties/health-science/`**: Di chuyển content hiện tại vào đúng vị trí mới.

## Capabilities

### New Capabilities

- `faculty-config`: Schema và runtime loading của `faculty.json` — identity, nav, contact, colors cho từng khoa
- `brand-token-system`: CSS variable-based brand tokens trong Tailwind cho phép per-faculty theming mà không cần override component
- `faculty-build-pipeline`: Vite build pipeline nhận `VITE_FACULTY` env var, resolve faculty-specific assets, inject brand tokens, output dist riêng cho từng khoa
- `component-override-cascade`: Cơ chế `@faculty/` alias resolve component override theo priority: faculty-specific → shared fallback

### Modified Capabilities

- `site-runtime-stability`: Build pipeline thay đổi cách resolve pages và components, cần verify existing pages không bị ảnh hưởng

## Impact

- `vite.config.js`: Thêm VITE_FACULTY logic, @faculty/ alias, CSS variable injection, faculty-specific page glob
- `tailwind.config.js`: Thêm `brand.*` tokens, thêm `src/faculties/**` vào content paths (đã làm)
- `src/styles/main.scss`: Thêm `:root` CSS variable defaults (đã làm)
- `src/components/header/header.html`: Thay hardcoded nav links và contact bằng `{{faculty.*}}` template vars
- `src/components/footer/footer.html`: Tương tự header — replace hardcoded faculty info
- `package.json`: Thêm per-faculty scripts
- `public/data/` → `src/faculties/health-science/data/`: Di chuyển messages JSON
- `src/pages/index.html`: Trở thành shared fallback, KKSK-specific sections vào faculty folder
