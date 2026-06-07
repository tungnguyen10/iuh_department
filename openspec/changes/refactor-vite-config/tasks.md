# Tasks - Refactor vite.config.js

## 1. Pre-flight: snapshot baseline

- [ ] 1.1 Verify dev server boot được trên cả 2 faculty trước refactor: `yarn dev:health-science` start clean (sau khi đã fix typo dòng 91 + cross-env nếu có)
- [ ] 1.2 Build baseline: `yarn build:health-science` rồi copy `dist/health-science/` → `.tmp/baseline/health-science/`
- [ ] 1.3 Build baseline: `yarn build:dormitory-management` rồi copy `dist/dormitory-management/` → `.tmp/baseline/dormitory-management/`
- [ ] 1.4 Note `__BUILD_SIGNATURE__` trong baseline HTML để loại trừ khỏi diff sau

## 2. Tạo `vite/utils.js` (leaf)

- [ ] 2.1 Tạo `vite/utils.js`, export: `escapeHtml`, `hexToRgbSpace`, `withBaseFactory`, `normalizeBasePath`, `resolveOutDir`, `getBuildSignature`, `deepMerge`, `copyDirectory`, `getCssOutputName`
- [ ] 2.2 Verify utils.js không import từ `./faculty/` hay `./plugins/` (leaf direction)
- [ ] 2.3 Verify mỗi function nhận tham số explicit (rootDir nếu cần), không reference biến module-level cục bộ

## 3. Tạo `vite/constants.js`

- [ ] 3.1 Tạo `vite/constants.js`, export: `DEFAULT_FACULTY_ID`, `FACULTY_REQUIRED_FIELDS`, `FACULTY_COLOR_KEYS`, `VALID_PAGE_TIERS`, `SOCIAL_CONFIG`
- [ ] 3.2 Đảm bảo không import từ file khác (pure constants)

## 4. Tạo `vite/faculty/load.js`

- [ ] 4.1 Tạo `vite/faculty/load.js`, export: `loadFaculty(rootDir, facultyId)`, `parseTierComment`, `readPageMeta`, `collectPageMetas`, `validateFacultyPages`, `collectNavUrls`, `normalizePageBasename`
- [ ] 4.2 `loadFaculty` nhận `rootDir` parameter (không tự derive `__dirname`)
- [ ] 4.3 Dùng constants từ `../constants.js` và utils từ `../utils.js` (`hexToRgbSpace` cho color validation)
- [ ] 4.4 Verify hành vi `excludePages` validation, nav-url validation giữ nguyên (so với code cũ)

## 5. Tạo `vite/faculty/workspace.js`

- [ ] 5.1 Tạo `vite/faculty/workspace.js`, export: `prepareFacultyWorkspace(rootDir, facultyId, faculty, options)`, `collectFacultyPages`, `getFacultyPagePath`
- [ ] 5.2 Loại bỏ `mirrorDir` nested function — dùng `copyDirectory` từ `../utils.js`
- [ ] 5.3 Verify `.tmp/faculty-build/<id>/` có cấu trúc giống code cũ (main.js, components, config, js, styles, pages)

## 6. Tạo `vite/faculty/render.js`

- [ ] 6.1 Tạo `vite/faculty/render.js`, export: `generateNavHtml`, `generateTopBarHtml`, `generateMobileTopBarHtml`, `generateSocialHtml`, `applyFacultyTemplateVars`, `buildFacultyCssVars`, `resolveIncludePath(rootDir, htmlPath, facultyId)`
- [ ] 6.2 `resolveIncludePath` nhận `rootDir` parameter
- [ ] 6.3 Verify HTML output cho nav/topBar/social giống hệt code cũ (snapshot 1 sample faculty.json, compare string output)

## 7. Tạo `vite/plugins/copy-assets.js` với factory

- [ ] 7.1 Tạo `vite/plugins/copy-assets.js`, export `copyAssetsPlugin(name, getSrc, getDest)` factory
- [ ] 7.2 Export wrapper: `copyImagesPlugin(rootDir, outDir)`, `copySvgsPlugin(rootDir, outDir)`, `copyFacultyAssetsPlugin(rootDir, outDir, facultyId)` — mỗi cái ≤ 5 dòng dùng factory
- [ ] 7.3 Verify factory dùng `copyDirectory` từ `../utils.js`

## 8. Tạo các plugin còn lại

- [ ] 8.1 Tạo `vite/plugins/map-src-requests.js` export `mapSrcRequests(rootDir, facultyId, workspace)`
- [ ] 8.2 Tạo `vite/plugins/layout.js` export `layoutPlugin({ rootDir, base, faculty, workspace })`. Giữ `layoutCache` module-level trong file này.
- [ ] 8.3 Tạo `vite/plugins/transform-include.js` export `transformDataInclude(rootDir, base, faculty)`. Giữ regex y nguyên (variant matching, asset rewriting).
- [ ] 8.4 Tạo `vite/plugins/copy-data.js` export `copyPublicDataPlugin(rootDir, outDir, facultyId)` — dùng `deepMerge` từ utils.

## 9. Tạo `vite/plugins/index.js` (barrel)

- [ ] 9.1 Re-export tất cả plugin từ các file plugin
- [ ] 9.2 Verify `import { mapSrcRequests, layoutPlugin, transformDataInclude, copyPublicDataPlugin, copyImagesPlugin, copySvgsPlugin, copyFacultyAssetsPlugin } from './vite/plugins/index.js'` work

## 10. Rút gọn `vite.config.js`

- [ ] 10.1 Xoá hết hàm helper, plugin definition, generator trong `vite.config.js`
- [ ] 10.2 Import từ `./vite/...` đầy đủ
- [ ] 10.3 Tính `rootDir` 1 lần ở top, truyền xuống `loadFaculty`, `prepareFacultyWorkspace`, plugin factories
- [ ] 10.4 Verify file dưới 150 dòng (`(Get-Content vite.config.js | Measure-Object -Line).Lines`)
- [ ] 10.5 Verify thứ tự plugin trong `plugins: [...]` giống commit cũ

## 11. Kiểm tra dependency direction

- [ ] 11.1 Grep: `Select-String "from '\\.\\./faculty/" vite/utils.js` → empty
- [ ] 11.2 Grep: `Select-String "from '\\.\\./plugins/" vite/utils.js` → empty
- [ ] 11.3 Grep: `Select-String "from '\\.\\./plugins/" vite/faculty/*.js` → empty
- [ ] 11.4 Grep: chỉ 1 định nghĩa `copyDirectory` trong `vite/utils.js` (không còn `mirrorDir`)

## 12. Verify zero-behavior-change

- [ ] 12.1 `yarn build:health-science` exit 0
- [ ] 12.2 Diff `dist/health-science/` vs `.tmp/baseline/health-science/` (loại trừ build signature). Expected: zero diff.
- [ ] 12.3 `yarn build:dormitory-management` exit 0
- [ ] 12.4 Diff `dist/dormitory-management/` vs `.tmp/baseline/dormitory-management/`. Expected: zero diff.
- [ ] 12.5 `yarn dev:health-science` start, browser render đầy đủ section như trước
- [ ] 12.6 `yarn dev:dormitory-management` start, browser render đúng dormitory faculty

## 13. Validation & archive

- [ ] 13.1 Run `npx openspec validate refactor-vite-config --strict` — passes
- [ ] 13.2 Code review: mỗi file `vite/` đảm nhận 1 concern rõ ràng
- [ ] 13.3 Update `.github/instructions/multi-faculty.instructions.md` nếu có chỗ tham chiếu vị trí code cũ
- [ ] 13.4 Archive: `npx openspec archive refactor-vite-config`
