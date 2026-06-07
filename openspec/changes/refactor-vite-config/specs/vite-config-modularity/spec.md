## ADDED Requirements

### Requirement: Vite build pipeline modular layout
Build pipeline code (faculty loader, workspace prep, HTML generators, custom plugins) SHALL được tách khỏi `vite.config.js` vào thư mục `vite/` với cấu trúc sau:

```
vite/
├── constants.js          # shared constants (DEFAULT_FACULTY_ID, SOCIAL_CONFIG, ...)
├── utils.js              # leaf helpers (escapeHtml, hexToRgbSpace, deepMerge, copyDirectory, ...)
├── faculty/
│   ├── load.js           # loadFaculty, validateFacultyPages, page tier parsing
│   ├── workspace.js      # prepareFacultyWorkspace, collectFacultyPages
│   └── render.js         # nav/topBar/social HTML generators, applyFacultyTemplateVars
└── plugins/
    ├── index.js          # barrel export
    ├── map-src-requests.js
    ├── layout.js
    ├── transform-include.js
    ├── copy-data.js
    └── copy-assets.js
```

`vite.config.js` SHALL chỉ chứa imports + `defineConfig` + return object Vite (không inline plugin/helper definition).

#### Scenario: vite.config.js dưới 150 dòng
- **WHEN** mở `vite.config.js` sau refactor
- **THEN** file dưới 150 dòng, không chứa định nghĩa hàm helper hay plugin (chỉ import + defineConfig)

#### Scenario: Mỗi plugin một file
- **WHEN** xem `vite/plugins/`
- **THEN** mỗi plugin (`mapSrcRequests`, `layoutPlugin`, `transformDataInclude`, `copyPublicDataPlugin`, `copyAssetsPlugin`) ở file riêng biệt

#### Scenario: Faculty code tách khỏi plugin code
- **WHEN** mở `vite/faculty/render.js`
- **THEN** file chỉ chứa logic tạo HTML từ `faculty.json` (nav, topBar, social, CSS vars), không chứa Vite plugin definition

### Requirement: Dependency injection cho project root
Module trong `vite/` SHALL nhận `rootDir` làm parameter từ `vite.config.js`, không tự derive từ `import.meta.url` của riêng mình.

#### Scenario: loadFaculty nhận rootDir
- **WHEN** gọi `loadFaculty(rootDir, facultyId)` từ `vite.config.js`
- **THEN** function dùng `rootDir` truyền vào để resolve `src/faculties/<id>/faculty.json`, không reference biến `__dirname` cục bộ

#### Scenario: Plugin factory nhận rootDir qua options
- **WHEN** `defineConfig` gọi `layoutPlugin({ rootDir, base, faculty, workspace })`
- **THEN** plugin dùng `rootDir` từ options object để resolve layout templates và component paths

### Requirement: Loại bỏ trùng lặp đã biết
Refactor SHALL gộp 2 cặp code trùng lặp hiện có:

1. `copyDirectory` (top-level) và `mirrorDir` (nested trong `prepareFacultyWorkspace`) — giữ 1 export trong `vite/utils.js`.
2. `copyImagesPlugin` + `copySvgsPlugin` + `copyFacultyAssetsPlugin` — gộp về 1 factory `copyAssetsPlugin`, các helper cũ trở thành 1-line wrapper.

#### Scenario: Một copyDirectory duy nhất
- **WHEN** grep toàn bộ `vite/` cho `function copyDirectory|copyDirectory =`
- **THEN** chỉ tìm thấy 1 định nghĩa trong `vite/utils.js`

#### Scenario: copyAssetsPlugin factory
- **WHEN** xem `vite/plugins/copy-assets.js`
- **THEN** có 1 factory function `copyAssetsPlugin(name, getSrc, getDest)` và các helper `copyImagesPlugin`/`copySvgsPlugin`/`copyFacultyAssetsPlugin` đều dùng factory này (mỗi cái ≤ 5 dòng)

### Requirement: Zero behavior change
Refactor SHALL không thay đổi build output. Output của `yarn build:health-science` và `yarn build:dormitory-management` trước/sau refactor SHALL identical, ngoại trừ `__BUILD_SIGNATURE__` (chứa timestamp).

#### Scenario: Build output không đổi cho health-science
- **WHEN** so sánh `dist/health-science/` trước và sau refactor (loại trừ build signature)
- **THEN** không có file nào khác biệt (file list giống, content giống)

#### Scenario: Build output không đổi cho dormitory-management
- **WHEN** so sánh `dist/dormitory-management/` trước và sau refactor (loại trừ build signature)
- **THEN** không có file nào khác biệt

#### Scenario: Dev server start clean
- **WHEN** chạy `yarn dev:health-science` sau refactor
- **THEN** server start không lỗi, browser render đầy đủ section như trước

### Requirement: Module dependency direction
Imports trong `vite/` SHALL theo chiều một hướng: `utils.js` (leaf) ← `faculty/*` ← `plugins/*`. Không có circular import.

#### Scenario: utils.js không import từ faculty hay plugins
- **WHEN** grep imports trong `vite/utils.js`
- **THEN** không có dòng `from './faculty/...'` hay `from './plugins/...'`

#### Scenario: faculty/* không import từ plugins
- **WHEN** grep imports trong `vite/faculty/*.js`
- **THEN** không có dòng `from '../plugins/...'`
