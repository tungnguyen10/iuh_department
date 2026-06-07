## Why

`vite.config.js` đã phình lên 986 dòng — gồm constants, helpers, faculty loader, workspace mirror, HTML markup generators, 6 plugin Vite, và config object — tất cả trong một file. Mỗi lần edit phải scroll qua hàng trăm dòng không liên quan; ranh giới giữa "config Vite thật sự" (~115 dòng) và "hệ thống multi-faculty" (~870 dòng) bị mờ. Kết quả: typo lẻ tẻ (như `absolut` rác giữa `hexToRgbSpace`) chỉ phát hiện khi dev server crash, code trùng lặp ngầm (`copyDirectory` hai bản, ba `copy*Plugin` gần giống nhau) khó nhận ra. Tách module hoá để mỗi concern nằm 1 chỗ rõ ràng, dễ review và onboard.

## What Changes

- **Tạo thư mục `vite/`** chứa toàn bộ helpers + plugins của hệ multi-faculty:
  - `vite/constants.js` — `DEFAULT_FACULTY_ID`, `VALID_PAGE_TIERS`, `SOCIAL_CONFIG`, `FACULTY_REQUIRED_FIELDS`, `FACULTY_COLOR_KEYS`.
  - `vite/utils.js` — `escapeHtml`, `hexToRgbSpace`, `withBaseFactory`, `normalizeBasePath`, `resolveOutDir`, `getBuildSignature`, `deepMerge`, `copyDirectory`, `getCssOutputName`.
  - `vite/faculty/load.js` — `loadFaculty`, `parseTierComment`, `readPageMeta`, `collectPageMetas`, `validateFacultyPages`, `collectNavUrls`, `normalizePageBasename`.
  - `vite/faculty/workspace.js` — `prepareFacultyWorkspace`, `collectFacultyPages`, `getFacultyPagePath`.
  - `vite/faculty/render.js` — `generateNavHtml`, `generateTopBarHtml`, `generateMobileTopBarHtml`, `generateSocialHtml`, `applyFacultyTemplateVars`, `buildFacultyCssVars`, `resolveIncludePath`.
  - `vite/plugins/map-src-requests.js` — dev server middleware mapping URL → fs path.
  - `vite/plugins/layout.js` — `layoutPlugin` wrap với `src/layouts/default.html`.
  - `vite/plugins/transform-include.js` — `transformDataInclude` xử lý `data-include` + variant + asset path rewriting.
  - `vite/plugins/copy-data.js` — `copyPublicDataPlugin` (data + faculty data merge).
  - `vite/plugins/copy-assets.js` — gộp `copyImagesPlugin`/`copySvgsPlugin`/`copyFacultyAssetsPlugin` thành 1 factory `copyAssetsPlugin({ src, dest })` để loại trùng lặp.
  - `vite/plugins/index.js` — re-export tất cả plugin để `vite.config.js` import gọn.
- **Rút gọn `vite.config.js` còn ~80–100 dòng**: chỉ giữ `import`, `defineConfig`, return object Vite (base/root/define/plugins/server/build/resolve).
- **Loại bỏ trùng lặp ngầm phát hiện trong quá trình tách**:
  - `copyDirectory` (hàm top-level) và `mirrorDir` (nested trong `prepareFacultyWorkspace`) là cùng logic — gộp về 1 export trong `vite/utils.js`.
  - `copyImagesPlugin` + `copySvgsPlugin` + `copyFacultyAssetsPlugin` cùng template → factory chung.
- **Không thay đổi behavior**: tất cả env vars, output paths, plugin order, asset rewriting rules giữ nguyên. Verify bằng so sánh `dist/` trước/sau (file list + checksum một số HTML/CSS quan trọng).
- **KHÔNG đụng**: `package.json` scripts, `faculty.json` schema, page tier convention, layout templates.

## Capabilities

### New Capabilities

- `vite-config-modularity`: Quy ước cấu trúc thư mục `vite/` (faculty/, plugins/, utils.js, constants.js) và rule "mỗi plugin/helper một file, không nhồi vào `vite.config.js`". Định ranh giới rõ giữa Vite framework config và multi-faculty extension code.

### Modified Capabilities

(Không có — đây là pure structural refactor, không thay đổi requirement của bất kỳ capability nào hiện có.)

## Impact

- **Code**:
  - Mới: `vite/` directory với ~10 file.
  - Thay đổi: `vite.config.js` rút từ 986 → ~100 dòng.
  - Loại bỏ: hàm trùng lặp như mô tả ở mục What Changes.
- **Build behavior**: Không đổi. Verify bằng:
  - `yarn build:health-science` → so sánh output file list + nội dung `index.html`/`assets/css/main.css` với git HEAD.
  - `yarn build:dormitory-management` → tương tự.
  - `yarn dev:health-science` boot thành công, render đúng faculty.
- **Imports**: Nếu nơi khác trong repo có import từ `vite.config.js` (hiếm), phải update path. Audit trước.
- **Risks**:
  - **Circular import**: faculty render dùng `withBaseFactory` từ utils, plugins dùng faculty render — phải tổ chức để utils.js là leaf, faculty/* phụ thuộc utils, plugins phụ thuộc cả hai.
  - **ESM path resolution trên Windows**: Nếu dùng `import` relative phải có `.js` extension đúng để Node resolve.
  - **Hidden state**: `layoutCache` (cached `default.html` content) hiện là module-level let. Khi tách phải đảm bảo cache không bị reset giữa các plugin instance.
- **Testing**: Không có test suite tự động cho config; verify bằng manual build comparison + smoke test 2 faculty.
