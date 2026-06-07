## Context

`vite.config.js` hiện 986 dòng, mix 7 concerns trong 1 file:

```
┌────────────────────────────────────────────────────┐
│ vite.config.js (986 dòng)                          │
├────────────────────────────────────────────────────┤
│ 1. imports + constants                  ~32 dòng   │
│ 2. utils thuần (escape, hex, base)      ~60 dòng   │
│ 3. faculty loader + page tier           ~100 dòng  │
│ 4. workspace mirror (.tmp/...)          ~80 dòng   │
│ 5. nav/topBar/social HTML generators    ~150 dòng  │
│ 6. resolveIncludePath + applyVars       ~40 dòng   │
│ 7. Vite plugins (6 plugin)              ~410 dòng  │
│ 8. defineConfig (config thực)           ~115 dòng  │
└────────────────────────────────────────────────────┘
```

Phần config thực sự của Vite chỉ ~115 dòng. ~870 dòng còn lại là multi-faculty extension code đáng tách riêng. Hiện code base có:
- 2 implementation của copy directory (`copyDirectory` top-level + `mirrorDir` nested) → cùng logic.
- 3 plugin gần như identical (`copyImagesPlugin`, `copySvgsPlugin`, `copyFacultyAssetsPlugin`) → khác mỗi src/dest.
- Typo lẻ tẻ chỉ phát hiện qua dev server crash (`absolut` rác giữa hex parser, vừa fix).

## Goals / Non-Goals

**Goals:**
- Mỗi concern trong 1 file độc lập, đặt theo cây thư mục có ý nghĩa.
- `vite.config.js` thu hẹp về dạng "config Vite chuẩn" — đọc 1 lần hiểu được toàn bộ build setup.
- Loại bỏ 2 chỗ trùng lặp đã biết (copyDirectory, copy*Plugin).
- Đảm bảo zero behavior change: build output trước/sau giống hệt cho cả 2 faculty.

**Non-Goals:**
- Không thêm test suite tự động (verify bằng manual diff).
- Không đổi schema `faculty.json`, page tier convention, hay layout templates.
- Không refactor JS code trong `src/` (chỉ build pipeline).
- Không đổi cách include component (`@components/`, `@faculty/`, `@/`) — giữ nguyên 100%.
- Không tách thành package npm riêng (giữ trong repo dưới `vite/`).

## Decisions

### Decision 1: Cấu trúc thư mục `vite/` theo concern

```
vite/
├── constants.js              ← DEFAULT_FACULTY_ID, VALID_PAGE_TIERS, SOCIAL_CONFIG, ...
├── utils.js                  ← escapeHtml, hexToRgbSpace, withBaseFactory, deepMerge,
│                                copyDirectory, getCssOutputName, normalizeBasePath,
│                                resolveOutDir, getBuildSignature
├── faculty/
│   ├── load.js               ← loadFaculty, parseTierComment, readPageMeta,
│   │                            collectPageMetas, validateFacultyPages,
│   │                            collectNavUrls, normalizePageBasename
│   ├── workspace.js          ← prepareFacultyWorkspace, collectFacultyPages,
│   │                            getFacultyPagePath
│   └── render.js             ← generateNavHtml, generateTopBarHtml,
│                                generateMobileTopBarHtml, generateSocialHtml,
│                                applyFacultyTemplateVars, buildFacultyCssVars,
│                                resolveIncludePath
└── plugins/
    ├── index.js              ← barrel export
    ├── map-src-requests.js   ← dev server middleware
    ├── layout.js             ← layoutPlugin (wrap default.html)
    ├── transform-include.js  ← transformDataInclude (data-include + variants + assets)
    ├── copy-data.js          ← copyPublicDataPlugin (data merge)
    └── copy-assets.js        ← copyAssetsPlugin factory + 3 instance helpers
```

**Alternatives considered:**
- *Phương án B: gộp theo domain*: `vite/faculty.js` (~280 dòng) + `vite/plugins.js` (~480 dòng) + `vite/utils.js`. Ít file hơn nhưng plugins.js vẫn dài, không giải quyết được vấn đề "scroll qua nhiều thứ không liên quan".
- *Phương án C: package npm riêng*: Quá đáng cho repo single-app. Tăng overhead release/version, không có dự án khác dùng lại.
- → Chọn cấu trúc theo concern (chia plugin thành file riêng) vì plugin là đơn vị logic độc lập của Vite, mỗi plugin đáng ở 1 file.

### Decision 2: Naming + import style — ESM relative với `.js` extension

```js
// vite/plugins/copy-assets.js
import { copyDirectory } from '../utils.js'
import { resolve } from 'path'
```

Vì `package.json` đã `"type": "module"`. Bắt buộc extension `.js` trong relative imports cho Node ESM resolver.

**Alternatives considered:**
- TypeScript: tăng setup phức tạp, hiện code base 100% JS.
- Path alias (`@vite/utils`): cần config thêm; relative paths ngắn, đủ rõ.

### Decision 3: Loại trùng lặp — 2 hợp nhất, 0 reorganize

Hai trùng lặp cụ thể:
1. `copyDirectory(src, dest)` (top-level) ≡ `mirrorDir(src, dest)` (nested trong `prepareFacultyWorkspace`). → Giữ `copyDirectory` trong `vite/utils.js`, xoá `mirrorDir`.
2. `copyImagesPlugin(outDir)`, `copySvgsPlugin(outDir)`, `copyFacultyAssetsPlugin(outDir, facultyId)` cùng template. → Tách factory:
   ```js
   // vite/plugins/copy-assets.js
   export const copyAssetsPlugin = (name, getSrc, getDest) => ({
     name,
     closeBundle() {
       const src = getSrc()
       if (!existsSync(src)) return
       const dest = getDest()
       mkdirSync(dest, { recursive: true })
       copyDirectory(src, dest)
     }
   })

   export const copyImagesPlugin = (outDir) =>
     copyAssetsPlugin('copy-images',
       () => resolve(__dirname, 'src/assets/images'),
       () => resolve(outDir, 'assets/images'))
   // ... tương tự cho svgs + faculty assets
   ```

Không reorganize gì khác. Giữ tên hàm cũ để giảm diff noise.

### Decision 4: `__dirname` resolution

Hiện `vite.config.js` tính `__dirname` từ `import.meta.url` ở root config. Sau tách, mỗi module trong `vite/` cần biết project root. Hai lựa chọn:

- **A**: Mỗi file tự derive `__dirname` từ `import.meta.url` rồi `resolve('..')` lên project root.
- **B**: `vite.config.js` truyền `rootDir` vào factory functions như parameter.

→ Chọn **B**. Lý do: explicit dependency injection, dễ test/reuse sau, không phụ thuộc vị trí file. `vite.config.js` tính `rootDir` 1 lần, truyền xuống.

```js
// vite.config.js
const rootDir = dirname(fileURLToPath(import.meta.url))
const faculty = loadFaculty(rootDir, facultyId)
const workspace = prepareFacultyWorkspace(rootDir, facultyId, faculty, opts)
plugins: [
  layoutPlugin({ rootDir, base, faculty, workspace }),
  ...
]
```

### Decision 5: `layoutCache` — preserve module-level scope

Cache `default.html` content hiện là `let layoutCache = null` ở module scope. Sau tách vào `vite/plugins/layout.js`, giữ pattern y nguyên — module-level cache trong file plugin. Mỗi build process load 1 lần, không cần invalidate.

### Decision 6: Verify zero-behavior-change

Trước khi merge, chạy:

```bash
# Snapshot trước (từ git HEAD)
yarn build:health-science       && mv dist/health-science       /tmp/before-hs
yarn build:dormitory-management && mv dist/dormitory-management /tmp/before-dm

# Apply refactor
git checkout refactor-vite-config

# Snapshot sau
yarn build:health-science
yarn build:dormitory-management

# Diff
diff -r /tmp/before-hs dist/health-science
diff -r /tmp/before-dm dist/dormitory-management
```

Expected: **zero diff**. Tolerance: `__BUILD_SIGNATURE__` chứa timestamp → khác. Loại trừ bằng grep loại các string `2026TUNG's_*`.

## Risks / Trade-offs

- **[Circular import]** faculty/render.js dùng `withBaseFactory` từ utils, plugins/transform-include.js dùng faculty/render.js → Mitigation: utils.js là leaf, không import từ faculty/ hay plugins/. faculty/* import utils.js. plugins/* import từ faculty/* và utils.js. Một chiều, không vòng.
- **[ESM Windows path]** `import './faculty/load.js'` (forward slash) hoạt động trên Windows? → Mitigation: Node ESM normalize internally; OK trên cả 2 OS. Tránh dùng `\\` literal.
- **[Hidden dependency on `__dirname`]** Một số function ngầm dùng `__dirname` của top-level config. Sau tách, nếu quên truyền rootDir → file resolve sai. → Mitigation: grep `__dirname` trong code mới sau refactor; mỗi reference phải đến từ tham số rootDir.
- **[Plugin order matters]** `mapSrcRequests` phải chạy trước Vite resolve tự nhiên (hiện thứ tự đúng). Tách file rồi gộp về `plugins: [...]` không đổi thứ tự. → Mitigation: code review check thứ tự plugin trong `defineConfig` return giống commit cũ.
- **[Lost git blame]** Tách file lớn → blame trên `vite.config.js` cũ "biến mất" với phần đã move. → Mitigation: dùng `git mv` không khả thi (tách 1 file thành nhiều); chấp nhận trade-off, ghi chú trong commit message tham chiếu commit cũ.
- **[Risk: bỏ sót edge case]** `transformDataInclude` có nhiều regex (variant, asset rewriting, faculty placeholder). Move qua file mới có thể mất 1-2 dòng → bug ngầm. → Mitigation: snapshot diff (Decision 6) + smoke test 2 faculty render đủ section.
