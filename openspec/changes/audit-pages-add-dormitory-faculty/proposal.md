## Why

Multi-faculty architecture đã có cơ chế override (faculty.json, `@faculty/` alias, deep-merge data) nhưng chưa được validate với khoa thứ 2. Audit pages hiện tại phát hiện: nội dung "shared" thực chất hardcode cho Khoa Khoa học Sức khoẻ (về tên khoa, lịch sử, ngành đào tạo), data layer trống (chưa có file nào trong `faculties/<id>/data/`), và build artifacts leftover (`src/dist/`, `src/pages/dist/`) tồn tại trong source tree. Cần dọn dẹp, định hình rõ ranh giới shared vs faculty-specific, và thêm khoa **Phòng Quản Lý Ký Túc Xá** (`dormitory-management`) làm smoke test thực tế cho architecture.

## What Changes

- **Dọn build artifacts khỏi source tree**: Xoá `src/dist/`, `src/pages/dist/`. Bổ sung `.gitignore` patterns chặn `dist/` ở mọi cấp dưới `src/`.
- **Phân loại pages theo tier**: Mỗi page trong `src/pages/` được gắn nhãn rõ ràng — `shared-template` (frame chung, content từ data), `shared-with-vars` (frame chung, biến từ `faculty.json`), `faculty-content` (cần override theo khoa), hoặc `dev-only` (không build production).
- **Tách nội dung KKSK ra khỏi `src/pages/`**: Các page tier `faculty-content` (`about.html`, `majors.html`, `students.html`) chuyển nội dung Khoa Khoa học Sức khoẻ về `src/faculties/health-science/pages/`. `src/pages/` giữ template skeleton hoặc bỏ hẳn nếu không thể chia sẻ.
- **Loại `form.html` khỏi production build**: File 67KB này là demo components, không thuộc nội dung khoa. Chuyển sang dev playground (vd `src/pages/_dev/form.html`) và exclude khỏi `collectFacultyPages`.
- **Thêm khoa `dormitory-management`**: Tạo `src/faculties/dormitory-management/` với `faculty.json` (tên: "Phòng Quản Lý Ký Túc Xá", màu sắc, nav, social, contact riêng), pages override cho `index.html` + `about.html` + bất kỳ page tier `faculty-content` nào áp dụng được, và data files demo.
- **Thêm `build:dormitory-management` script** vào `package.json` và document trong `multi-faculty.instructions.md`.
- **BREAKING — Resolve order của `@faculty/`**: Document rõ pattern `@faculty/<path>` resolve faculty trước, fallback shared. Không thay đổi behaviour, chỉ formalize trong spec.

## Capabilities

### New Capabilities

- `page-tier-classification`: Quy ước phân loại pages theo mức độ shared (template / template+vars / faculty-content / dev-only) và rule cho từng tier về vị trí lưu, cách override, cách build.
- `source-tree-hygiene`: Quy tắc giữ source tree sạch — build outputs không nằm trong `src/`, `.tmp/` được isolate, gitignore enforce.

### Modified Capabilities

- `faculty-config`: Schema `faculty.json` được validate với khoa thứ 2 (dormitory-management). Yêu cầu mọi field hiện tại vẫn đủ; nếu phát hiện thiếu (vd department-type, parent-org), bổ sung field optional.
- `faculty-build-pipeline`: `collectFacultyPages` cần exclude pages tier `dev-only`. `prepareFacultyWorkspace` cần handle case faculty page khác hẳn shared (không chỉ override file cùng tên).
- `component-override-cascade`: Document rõ resolve order và scope override (HTML hiện tại; JS/SCSS chưa support). Spec định ranh giới rõ để tránh hiểu nhầm.
- `site-runtime-stability`: Thêm checklist khi build faculty mới — verify shared assets resolve đúng, faculty assets override đúng, không bị dính KKSK content.

## Impact

- **Code**:
  - `vite.config.js` — `collectFacultyPages` filter dev-only pages; có thể cần thêm validation cho faculty.json fields mới.
  - `package.json` — thêm `dev:dormitory-management`, `build:dormitory-management`.
  - `.gitignore` — patterns chặn `src/**/dist/`, `**/.tmp/`.
- **Source tree**:
  - Xoá: `src/dist/`, `src/pages/dist/`.
  - Di chuyển: `src/pages/about.html` → `src/faculties/health-science/pages/about.html` (giả định tier `faculty-content`).
  - Di chuyển: `src/pages/form.html` → `src/pages/_dev/form.html` (hoặc tương đương).
  - Tạo mới: `src/faculties/dormitory-management/{faculty.json, pages/*, data/*}`.
- **Tài liệu**:
  - `.agents/instructions/multi-faculty.instructions.md` — cập nhật quy ước phân loại pages, lệnh build, pattern thêm khoa mới.
- **Build outputs**:
  - Khoa mới `dist/dormitory-management/` từ `build:dormitory-management`.
- **Risks**:
  - Pages đang được link cứng từ nav (`/about.html`, `/majors.html`...) — phải đảm bảo route vẫn hoạt động sau khi di chuyển content (chỉ đổi nguồn file, URL giữ nguyên).
  - Tailwind content scan đã thêm `src/faculties/**` (có sẵn) — verify class strings trong faculty pages mới được purge đúng.
