## Context

Audit phát hiện 4 vấn đề kéo dài trong codebase từ giai đoạn migrate single-faculty → multi-faculty:

1. **Build artifacts trong source tree**: `src/dist/health-science/` và `src/pages/dist/health-science/` là leftover từ build chạy sai cwd/OUT_DIR. Hiện không bị gitignore, gây nhiễu khi search và bloat repo.
2. **Identity leakage trong "shared" pages**: `src/pages/about.html`, `majors.html`, `students.html`, `leadership-detail.html` chứa text cứng tên Khoa Khoa học Sức khoẻ ngay cả khi build cho khoa khác sẽ thấy nội dung KKSK.
3. **`form.html` 67KB là demo lib components**, không thuộc nội dung khoa nhưng đang được build vào mọi `dist/<faculty>/`.
4. **Architecture chưa được kiểm chứng** với khoa thứ 2 — không biết cơ chế override hiện tại có đủ cho khoa khác hẳn về tính chất (vd Phòng Quản Lý Ký Túc Xá là đơn vị hành chính, không phải khoa đào tạo).

Stakeholders:
- Developer maintain cho ~10 khoa
- Mỗi khoa có content team riêng cần edit nội dung không động vào core
- Build pipeline phải output 1 dist riêng cho mỗi khoa → deploy domain riêng

## Goals / Non-Goals

**Goals:**
- Source tree sạch: không có build outputs ở `src/`.
- Mỗi page có "tier" rõ ràng + quy tắc về vị trí lưu/cách override.
- `src/pages/` chỉ chứa nội dung thực sự dùng được cho mọi khoa (frame template, hoặc skeleton + placeholder).
- Khoa Health Science vẫn build và chạy như cũ sau migration (không regression).
- Khoa thứ 2 (`dormitory-management`) build và chạy được, render đúng identity riêng (tên đơn vị, màu, contact, nav).
- Validate được rằng cơ chế override hiện tại đủ dùng cho 1 unit có tính chất khác KKSK (không có "ngành đào tạo", không có "lãnh đạo khoa", có thể có "phòng/ban khác").

**Non-Goals:**
- Không xây data-binding mechanism mới cho HTML pages (vd template engine bind từ JSON). Phase này giữ data-include hiện tại; data-driven rendering nếu cần sẽ là change riêng.
- Không thêm cơ chế `@faculty/` cho `.js` hoặc `.scss`. Component logic vẫn shared.
- Không refactor structure của `vite.config.js` (các plugin layoutPlugin, transformDataInclude giữ nguyên).
- Không design lại nav schema trong `faculty.json` — dùng schema hiện tại.
- Không thiết kế khoa `dormitory-management` thành dự án production-ready với content thật. Mục tiêu là smoke test architecture, content có thể là placeholder/demo.

## Decisions

### D1. Tier classification cho pages

Mỗi page trong `src/pages/` được gắn 1 tier qua HTML comment header:
```html
<!-- TIER: shared-template | shared-with-vars | faculty-content | dev-only -->
```

| Tier | Định nghĩa | Vị trí lưu | Override |
|---|---|---|---|
| `shared-template` | Frame chung, content render từ data-include + JSON faculty | `src/pages/` | Không cần override; data ở `faculties/<id>/data/*.json` |
| `shared-with-vars` | Frame chung, content có placeholder `{{faculty.*}}` từ `faculty.json` | `src/pages/` | Không cần override; biến từ `faculty.json` |
| `faculty-content` | Content khác hẳn giữa các khoa, phải override toàn page | `src/faculties/<id>/pages/` | Bắt buộc mỗi faculty có file |
| `dev-only` | Demo/playground, không build vào dist | `src/pages/_dev/` | N/A |

**Phân loại 13 pages hiện tại:**

| Page | Tier | Lý do |
|---|---|---|
| `index.html` | `faculty-content` | Landing mỗi khoa khác hẳn |
| `about.html` | `faculty-content` | Lịch sử/sứ mệnh/đội ngũ riêng |
| `majors.html` | `faculty-content` | Đơn vị không phải khoa đào tạo (vd Ký túc xá) có thể không có page này |
| `major-detail.html` | `faculty-content` | Theo `majors.html` |
| `students.html` | `faculty-content` | Mỗi khoa có CLB/biểu mẫu/học bổng riêng |
| `news.html`, `news-detail.html` | `shared-template` | Frame card list giống nhau, data từ JSON |
| `leadership.html`, `leadership-detail.html` | `shared-template` | Org tree + profile, data từ JSON |
| `partners.html` | `shared-template` | Logo grid + tabs, data từ JSON |
| `document-detail.html` | `shared-template` | PDF viewer template |
| `contact.html` | `shared-with-vars` | Đã dùng `{{faculty.email}}`, `{{faculty.phone}}` |
| `form.html` | `dev-only` | Components demo |

**Alternative considered**: Tách hẳn shared và faculty thành 2 root build — bị reject vì duplicate skeleton, đụng layoutPlugin và `prepareFacultyWorkspace` lớn.

### D2. Pages tier `shared-template` chưa có data-binding — giữ nguyên trong phase này

Pages `news/leadership/partners/document-detail` hiện hardcode card content trong HTML. Để **không vượt scope**, giai đoạn này chỉ:
- Đánh tier label vào HTML comment.
- Document trong instructions rằng tier này sẽ được data-driven trong change tương lai.
- Khoa `dormitory-management` build vẫn cùng content placeholder của KKSK cho các page này — chấp nhận được vì là smoke test architecture, không phải content.

**Alternative considered**: Đẩy phase 1 (data layer) vào change này — bị reject vì scope quá lớn, rủi ro cao, ngoài Goals.

### D3. Faculty page resolution mở rộng — faculty được phép có page KHÔNG có trong shared

Hiện tại `collectFacultyPages` merge: shared + faculty (faculty override file cùng tên). Đã hoạt động đúng với case "faculty thêm page mới" (vd `dormitory-management/pages/services.html`).

Giữ nguyên — verified bằng đọc code.

### D4. Faculty được phép THIẾU page có trong shared

Trường hợp Ký túc xá không có "ngành đào tạo" → không cần `majors.html`/`major-detail.html`.

Hiện tại `collectFacultyPages` luôn copy shared pages vào workspace, dẫn tới mọi khoa luôn có đủ 13 pages dù có cần hay không.

**Decision**: Faculty.json thêm field optional `excludePages: string[]`. Khi build, `collectFacultyPages` filter ra các file có tên trong `excludePages`. Nav links trong `faculty.json` cũng không trỏ tới page bị exclude → user không truy cập được.

```json
{
  "excludePages": ["majors.html", "major-detail.html"]
}
```

**Alternative considered**:
- *Convention-based*: Page tier `faculty-content` mặc định không build nếu faculty không override. Bị reject vì không tường minh và phá pattern hiện có (build vẫn cần shared `index.html` làm fallback).
- *Mỗi tier `faculty-content` bắt buộc faculty override*: Bị reject vì ép Ký túc xá phải tạo file rỗng cho `majors.html`.

### D5. `form.html` chuyển sang `src/pages/_dev/`

`collectFacultyPages` glob `*.html` ở top-level `src/pages/` → file trong `_dev/` tự động bị bỏ qua. Không cần thay đổi build code.

Page vẫn dev được qua URL trực tiếp `/_dev/form.html` ở dev server (Vite root vẫn thấy vì `_dev` nằm trong workspace pages dir sau khi mirror).

**Alternative considered**: Xoá hẳn `form.html` — bị reject vì là showcase components hữu ích cho dev.

### D6. `dormitory-management` faculty config

`faculty.json` cho khoa Ký túc xá:
- `id`: `dormitory-management`
- `name`: `"Phòng Quản Lý Ký Túc Xá"`
- `shortName`: `"KTX"` (standardized short label for this smoke-test faculty)
- `excludePages`: `["majors.html", "major-detail.html", "leadership-detail.html"]` (đề xuất; user có thể điều chỉnh)
- `nav`: structure phù hợp đơn vị quản lý (vd: Giới thiệu / Dịch vụ / Quy định / Tin tức / Liên hệ)
- `colors`: bộ màu khác KKSK để verify brand token system hoạt động (vd primary green/teal)
- `social`, `topBar`, `email`, `phone`: placeholder values

**Alternative considered**: Đặt `id` là `ktx` — bị reject vì không match convention kebab-case english của KKSK (`health-science`).

### D7. Source tree hygiene rules

`.gitignore` thêm:
```
# Build outputs ở mọi cấp dưới src/ (chống tái phát leftover)
src/**/dist/
src/dist/

# Vite faculty workspace
.tmp/
```

Audit script (optional, không bắt buộc trong change này): thêm npm script `clean:src` chạy xoá các thư mục này nếu phát hiện.

## Risks / Trade-offs

- **Risk: Routes break sau khi di chuyển content** → Mitigation: URL không đổi (`/about.html` vẫn map đúng vì `prepareFacultyWorkspace` mirror vào workspace). Test thủ công các nav links sau migration cho cả 2 khoa.

- **Risk: Tailwind purge sót class** trong faculty pages mới → Mitigation: `tailwind.config.js` đã có `src/faculties/**/*.{html,js}` trong content paths (đã verified). Sau khi tạo dormitory pages, build và check một số class quan trọng.

- **Risk: `excludePages` config gây confusion** ("tại sao build không có page X?") → Mitigation: Document trong `multi-faculty.instructions.md` với ví dụ cụ thể. Build log có thể in danh sách excluded pages.

- **Trade-off: Pages tier `shared-template` vẫn KKSK content** trong giai đoạn này → Chấp nhận vì smoke test mục tiêu là verify identity rendering (header/footer/colors/nav), không phải content quality.

- **Risk: User content team KKSK đang edit `src/pages/about.html`** → khi di chuyển sang `src/faculties/health-science/pages/about.html`, file path đổi → cần thông báo. Mitigation: Document migration map trong tasks.md, file content bit-for-bit identical sau di chuyển.

- **Risk: Nav links cứng `/majors.html` trong faculty bị exclude** → 404. Mitigation: D4 spec yêu cầu faculty.json nav không trỏ tới excluded pages; nếu nav có link → fail-fast trong validation `loadFaculty`.

## Open Questions

1. **Phòng QLKTX có dùng template `leadership.html` không?** Có "Trưởng phòng" — có thể dùng. Hay cần tier mới `staff-list` riêng?
2. **`excludePages` có nên áp dụng cho cả `news.html`?** Có lẽ không — phòng nào cũng có thông báo. Giữ default trong shared.
3. **URL deployment** cho khoa thứ 2 là gì? (Không ảnh hưởng change này, nhưng cần biết khi tới phase deploy.)
