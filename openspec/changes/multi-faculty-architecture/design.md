## Context

**Current state**: Source được build cứng cho Khoa Khoa học Sức khoẻ (KKSK). Build tool là Vite + vanilla JS + Tailwind v3. Component system dùng `data-include` được resolve ở build time bởi custom Vite plugin (`transformDataInclude`). Layout inject qua `layoutPlugin`. Không có runtime framework.

**Constraints**:
- Static site build — không có server-side rendering, không có runtime framework
- 1 developer maintain toàn bộ ~10 khoa
- Mỗi khoa deploy trên domain riêng như 1 static site độc lập
- **Tailwind CSS `^3.4.17` — cố định, không upgrade lên v4.** Dùng `"rgb(var(--color-brand-primary) / <alpha-value>)"` format cho CSS variable tokens. Không dùng `@theme`, `oklch()`, hay v4-only syntax.
- `data-include` system resolve tại build time — không thể dynamic import at runtime

**Key hardcoded content cần generalize**:
- `header.html`: "KHOA KHOA HỌC SỨC KHOẺ" text, nav links, contact info (email, phone)
- `footer.html`: faculty name, address, phone, email, social links
- `intro/index.html`: text mô tả khoa, ảnh giới thiệu
- `major/index.html`: danh sách chuyên ngành
- `pages/index.html`: sequence và selection of sections

## Goals / Non-Goals

**Goals:**
- 1 lệnh build cho mỗi khoa: `VITE_FACULTY=health-science yarn build`
- Faculty mới chỉ cần tạo `faculty.json` + `data/messages-*.json` để có site hoạt động
- Shared components không bị thay đổi khi thêm khoa mới
- Brand colors per-faculty thông qua CSS variables — support Tailwind opacity modifier đầy đủ
- Header/footer tự động dùng đúng tên khoa, nav links, contact info từ `faculty.json`
- Component override: faculty có thể replace bất kỳ shared component nào mà không fork

**Non-Goals:**
- Không migrate sang runtime framework (Vue/React)
- Không build một site dùng chung cho nhiều khoa trên cùng 1 domain với path-based routing
- Không refactor toàn bộ shared component để dùng `brand-*` tokens — chỉ enforce cho component mới và faculty override
- Không tạo admin UI để manage faculty content
- Không làm CMS hoặc database

## Decisions

### D1: Folder structure — `src/faculties/{id}/` với cascade override

**Decision**: Faculty-specific files sống trong `src/faculties/{faculty-id}/`. Vite plugin resolve theo priority: faculty-specific → shared fallback.

**Alternatives considered**:
- _Separate git repos per faculty_: Quá phức tạp, khó sync shared updates
- _Feature flags / conditional in shared component_: Tạo tight coupling, khó maintain

**Rationale**: Cô lập hoàn toàn per-faculty content, shared code không bị touch, fallback logic đơn giản.

---

### D2: `faculty.json` là single source of truth cho identity

**Decision**: Mỗi faculty có `faculty.json` chứa `id`, `name`, `nav[]`, `topBar[]`, `social`, `colors`. `layoutPlugin` đọc file này khi build và inject vào layout template.

```json
{
  "id": "health-science",
  "name": "Khoa Khoa học Sức khoẻ",
  "shortName": "KKSK",
  "email": "kksk@iuh.edu.vn",
  "phone": "028 3894 0390",
  "nav": [
    { "label": "Giới thiệu", "url": "/about.html" },
    { "label": "Chuyên ngành", "url": "/majors.html" }
  ],
  "topBar": [
    { "label": "Tuyển Dụng – Việc Làm", "url": "#" },
    { "label": "Sinh Viên", "url": "/students.html" }
  ],
  "social": { "facebook": "...", "youtube": "..." },
  "colors": {
    "brand-primary": "#153898",
    "brand-accent":  "#F9B200",
    "brand-tint":    "#8ED8F8",
    "brand-surface": "#E3F6FD"
  }
}
```

**Rationale**: Tập trung toàn bộ faculty identity vào 1 file — dễ copy, dễ audit, không bị phân tán giữa nhiều files.

---

### D3: Brand colors dùng CSS variables (RGB format) trong Tailwind v3

**Decision**: `tailwind.config.js` define `brand.*` tokens với `rgb(var(--color-brand-primary) / <alpha-value>)`. CSS variables lưu dạng space-separated RGB (`21 56 152`). `faculty.json` lưu hex cho dễ đọc, Vite plugin convert sang RGB khi inject.

**Alternatives considered**:
- _Hex CSS variables_: Không support Tailwind opacity modifier (`/40`)
- _Separate Tailwind config per faculty_: Cần rebuild với config khác, phức tạp pipeline
- _Inline style injection_: Kém hơn vì không tận dụng Tailwind class system

**Rationale**: Codebase đang dùng opacity modifier rất nhiều (`primary-dark-blue/40`, `/8`, `/15`, `/90`). RGB format là yêu cầu bắt buộc.

---

### D4: `@faculty/` alias với fallback trong `transformDataInclude`

**Decision**: Thêm alias `@faculty/` vào plugin `transformDataInclude`. Khi resolve `@faculty/intro/index.html`, plugin kiểm tra `src/faculties/{FACULTY}/components/intro/index.html` trước, nếu không tồn tại thì dùng `src/components/intro/index.html`.

```
@faculty/X  →  src/faculties/{FACULTY}/components/X  (nếu exists)
           →  src/components/X                         (fallback)
```

Pages cũng dùng cơ chế tương tự:
```
pages glob  →  src/faculties/{FACULTY}/pages/*.html  (nếu exists, merge với shared)
           →  src/pages/*.html                        (fallback)
```

**Rationale**: Không cần duplicate shared component. Faculty chỉ tạo file khi thực sự cần override.

---

### D5: Header/footer dùng template variables từ `faculty.json`

**Decision**: `header.html` và `footer.html` thay hardcoded content bằng Mustache-style template vars: `{{faculty.name}}`, `{{faculty.shortName}}`, `{{faculty.phone}}`, `{{faculty.email}}`. Nav links được generated từ `{{faculty.nav}}` array.

**Layout plugin** (đã có sẵn) sẽ được mở rộng để inject faculty data vào template vars, tương tự cách `{{title}}`, `{{description}}` đang hoạt động.

**Rationale**: Header/footer structure giống nhau cho mọi khoa — chỉ content thay đổi. Override component là overkill cho trường hợp này.

---

### D6: Migration strategy — Hybrid (không refactor shared component ngay)

**Decision**: Shared component (`src/components/`) giữ nguyên `primary-dark-blue` — đây là màu KKSK, KKSK không cần override. Chỉ enforce `brand-*` tokens cho:
1. Component trong `src/faculties/{X}/components/` (faculty override)
2. Component mới được tạo sau khi có system này

**Rationale**: Refactor toàn bộ shared component ngay lập tức là rủi ro cao, tốn công, không cần thiết vì KKSK là khoa đầu tiên và đang dùng màu mặc định.

## Risks / Trade-offs

**[Risk] Header nav hardcode trong HTML template** → Cần build `{{faculty.nav}}` array thành HTML `<li>` elements trong layoutPlugin. Phức tạp hơn simple string replacement.  
→ _Mitigation_: Implement nav generation bằng `Array.join()` với template string. Giới hạn độ sâu nav ở 2 levels (main + dropdown).

**[Risk] Vite hot-reload với VITE_FACULTY env** → Dev server cần restart khi đổi faculty, không tự reload.  
→ _Mitigation_: Document rõ trong README. Thêm `dev:health-science`, `dev:information-tech` scripts để switch dễ.

**[Risk] `tailwind.config.js` `content` paths không pick up faculty component** → Classes dùng trong `src/faculties/*/components/` bị purge.  
→ _Mitigation_: Đã thêm `"./src/faculties/**/*.{html,js}"` vào content array.

**[Risk] Circular fallback trong @faculty/ alias** → Nếu faculty component gọi `@faculty/X` và X không override, phải đảm bảo fallback không infinite loop.  
→ _Mitigation_: Plugin resolve một lần tại build time, không có runtime recursion.

**[Trade-off] Faculty-specific pages cần duplicate nhiều HTML nếu chỉ muốn đổi 1-2 sections** → Thay vì override toàn bộ `index.html`, có thể dùng `<!-- FACULTY_SECTIONS -->` marker để inject chỉ phần khác.  
→ _Accepted for now_: Tăng complexity của plugin. Có thể revisit khi đủ faculty để thấy pattern.

## Migration Plan

1. **Setup `src/faculties/` structure + KKSK migration** (không break gì)
   - Tạo `src/faculties/health-science/faculty.json`
   - Copy `public/data/messages-*.json` → `src/faculties/health-science/data/`
   - Tạo `src/faculties/health-science/pages/index.html` (giống shared hiện tại)
   - Tạo `src/faculties/health-science/components/intro/` và `major/`

2. **Cập nhật `vite.config.js`**
   - Đọc `VITE_FACULTY` env, load `faculty.json`
   - Thêm hex-to-RGB converter util
   - Inject `<style>:root{...}</style>` vào layout template
   - Thêm `@faculty/` alias resolve với fallback
   - Cập nhật page glob để merge faculty pages + shared pages

3. **Generalize header + footer**
   - Thêm `{{faculty.*}}` vars vào `layoutPlugin` injection
   - Replace hardcoded content trong `header.html` và `footer.html`

4. **Cập nhật `package.json` scripts**

5. **Verify**: Build KKSK với `VITE_FACULTY=health-science` → output giống current build

**Rollback**: `VITE_FACULTY` optional — nếu không set, dùng shared fallback (current behavior). Shared `src/pages/` và `src/components/` không bị xóa.

## Open Questions

- **Nav dropdown**: `faculty.json` nav có cần support dropdown (`children[]`)? Header hiện tại có dropdown structure không?  
  → Cần check header.html nav section chi tiết trước khi implement nav generation.

- **Data cascade**: `messages-vi.json` của faculty có cần **merge** với shared base, hay **replace** hoàn toàn?  
  → Merge (deep merge) sẽ an toàn hơn — faculty chỉ cần override key thay đổi, không cần copy toàn bộ.

- **Images per faculty**: Logo, intro image, carousel images — có trong `src/faculties/{X}/assets/` hay vẫn trong shared `src/assets/`?  
  → Cần quyết định trước khi implement asset copy plugin step.
