---
applyTo: "src/faculties/**,src/pages/**,vite.config.js,package.json,README.md"
---

# IUH Department — Multi-Faculty Architecture

Source dùng chung cho nhiều khoa. Mỗi khoa build ra 1 static site riêng, deploy lên domain riêng.

---

## 1. Folder Structure

```
src/
├── components/          ← SHARED BASE — không sửa khi thêm khoa mới
├── pages/               ← SHARED pages + tier comments
│   └── _dev/            ← Dev-only playground pages, never ship to dist
├── layouts/
│   └── default.html     ← SHARED layout (header/footer inject từ faculty.json)
├── js/, styles/         ← SHARED scripts và styles
│
└── faculties/           ← MỖI KHOA 1 FOLDER
    ├── health-science/  ← Khoa Khoa học Sức khoẻ (KKSK)
    │   ├── faculty.json          ← BẮT BUỘC: identity, nav, contact, colors
    │   ├── pages/
    │   │   └── index.html        ← Override nếu sections khác shared
    │   ├── components/
    │   │   ├── intro/index.html  ← Override component với content KKSK
    │   │   └── major/index.html  ← Override danh sách ngành KKSK
    │   └── data/
    │       ├── messages-vi.json  ← i18n content KKSK
    │       └── messages-en.json
    │
    └── information-tech/
        ├── faculty.json
        ├── pages/
        │   └── index.html        ← Khác KKSK: có section labs, không có infra
        ├── components/
        │   ├── intro/
        │   ├── major/
        │   └── labs/index.html   ← Section đặc thù chỉ CNTT có
        └── data/
```

---

## 2. Page Tiers

Every page in `src/pages/` must start with one of these comments:

```html
<!-- TIER: shared-template | shared-with-vars | faculty-content | dev-only -->
```

- `shared-template`: shared frame/content that is safe to build for every faculty
- `shared-with-vars`: shared page that only depends on `faculty.json` placeholders
- `faculty-content`: page content differs by faculty and should be overridden under `src/faculties/{id}/pages/`
- `dev-only`: playground/demo page stored under `src/pages/_dev/` and excluded from production builds

Current baseline mapping:

- `index.html`, `about.html`, `majors.html`, `major-detail.html`, `students.html`: `faculty-content`
- `news.html`, `news-detail.html`, `leadership.html`, `leadership-detail.html`, `partners.html`, `document-detail.html`: `shared-template`
- `contact.html`: `shared-with-vars`
- `_dev/form.html`: `dev-only`

## 3. `faculty.json` — Schema bắt buộc

Mỗi khoa **phải có** file này. Là nguồn duy nhất để config identity.

```json
{
  "id": "health-science",
  "name": "Khoa Khoa học Sức khoẻ",
  "shortName": "KKSK",
  "email": "kksk@iuh.edu.vn",
  "phone": "028 3894 0390",
  "nav": [
    { "label": "Giới thiệu", "url": "/about.html" },
    { "label": "Chuyên ngành", "url": "/majors.html" },
    { "label": "Tuyển sinh", "url": "/admission.html" },
    { "label": "Nghiên cứu", "url": "/research.html" },
    { "label": "Tin tức", "url": "/news.html" },
    { "label": "Đối tác", "url": "/partners.html" }
  ],
  "topBar": [
    { "label": "Tuyển Dụng – Việc Làm", "url": "#" },
    { "label": "Sinh Viên", "url": "/students.html" },
    { "label": "Kết Nối Doanh Nghiệp", "url": "#" }
  ],
  "social": {
    "facebook": "https://facebook.com/...",
    "youtube": "https://youtube.com/..."
  },
  "excludePages": ["majors.html", "major-detail.html"],
  "colors": {
    "brand-primary": "#153898",
    "brand-accent":  "#F9B200",
    "brand-tint":    "#8ED8F8",
    "brand-surface": "#E3F6FD"
  }
}
```

`excludePages` is optional. It allows a faculty to opt out of shared or overridden pages by basename. `vite.config.js` validates that no `nav[*].url` or nested nav child points at an excluded page.

**Colors field**: `vite.config.js` đọc file này, convert hex → RGB space-separated, inject vào `<head>` của mỗi page:
```html
<style>
  :root {
    --color-brand-primary: 21 56 152;
    --color-brand-accent: 249 178 0;
    --color-brand-tint: 142 216 248;
    --color-brand-surface: 227 246 253;
  }
</style>
```

---

## 4. Resolve Priority — Component và Pages

```
@faculty/intro/index.html  resolves:
  1. src/faculties/{FACULTY}/components/intro/index.html  ← nếu TỒN TẠI
  2. src/components/intro/index.html                       ← FALLBACK

pages/index.html  resolves:
  1. src/faculties/{FACULTY}/pages/index.html  ← nếu TỒN TẠI
  2. src/pages/index.html                       ← FALLBACK

data/messages-vi.json  resolves:
  1. src/faculties/{FACULTY}/data/messages-vi.json  ← nếu TỒN TẠI
  2. public/data/messages-vi.json                    ← FALLBACK
```

**Khi tạo faculty mới**: Chỉ tạo file khi nội dung/structure KHÁC shared. Không copy file chỉ để có.

---

## 5. Build Commands

```bash
# Dev server cho từng khoa
VITE_FACULTY=health-science yarn dev
VITE_FACULTY=dormitory-management yarn dev

# Build từng khoa ra dist riêng
VITE_FACULTY=health-science yarn build --outDir dist/health-science
VITE_FACULTY=dormitory-management yarn build --outDir dist/dormitory-management

# Build tất cả (script trong package.json)
yarn build:all
```

`package.json` scripts pattern:
```json
"dev:health-science":   "VITE_FACULTY=health-science vite",
"dev:dormitory-management": "VITE_FACULTY=dormitory-management vite",
"build:health-science": "VITE_FACULTY=health-science vite build --outDir dist/health-science",
"build:dormitory-management": "VITE_FACULTY=dormitory-management vite build --outDir dist/dormitory-management",
"build:all": "yarn build:health-science && yarn build:dormitory-management"
```

Production builds skip `src/pages/_dev/**`. The dev server still serves those pages via routes like `/_dev/form.html`.

---

## 6. Rules khi tạo Faculty mới

### Bắt buộc
- [ ] Tạo `src/faculties/{faculty-id}/faculty.json` với đủ fields theo schema
- [ ] Tạo `src/faculties/{faculty-id}/data/messages-vi.json` với content riêng
- [ ] `faculty-id` dùng kebab-case: `health-science`, `information-tech`, `economics`
- [ ] Đánh giá page nào cần `excludePages` ngay từ đầu nếu đơn vị không dùng route đó

### Chỉ tạo khi cần override
- `pages/index.html` — chỉ khi sections index.html **khác** so với shared
- `pages/about.html`, `pages/students.html`, `pages/majors.html` — khi page thuộc tier `faculty-content`
- `components/intro/` — chỉ khi text/image giới thiệu khác (thường phải override)
- `components/major/` — chỉ khi danh sách ngành học khác (luôn phải override)
- `components/{section-mới}/` — section đặc thù chỉ khoa đó có

### Không làm
- Không copy nguyên file shared vào faculty folder chỉ để thay đổi màu → dùng `brand-*` tokens
- Không sửa file trong `src/components/` vì lý do của 1 khoa cụ thể
- Không đặt page playground ở `src/pages/` top-level; dùng `src/pages/_dev/`

---

## 7. Component mới trong Faculty Override

Khi tạo component trong `src/faculties/{X}/components/`:

```html
<!-- PHẢI dùng brand-* tokens, KHÔNG dùng primary-dark-blue -->
<section class="bg-brand-primary text-primary-white">
<button class="bg-brand-primary hover:bg-brand-accent">
<div class="border-brand-primary/20">
<span class="bg-brand-surface text-brand-primary">
```

Xem `design-system.instructions.md` cho full color token rules.

---

## 8. `messages-vi.json` — Content data-driven

Nội dung thay đổi theo khoa (text, không phải structure) nên để trong messages JSON thay vì override component:

```json
{
  "intro.title": "Khoa Khoa học Sức khoẻ",
  "intro.body": "Khoa Khoa học Sức khoẻ là đơn vị đào tạo...",
  "intro.image": "/assets/images/intro-image.png",
  "faculty.fullName": "Khoa Khoa học Sức khoẻ - Trường Đại học Công nghiệp TP.HCM",
  "stats.students": "2500+",
  "stats.graduates": "500+",
  "stats.partners": "50+"
}
```

Component đọc qua `t('intro.title')` — xem `src/js/i18n.js`.

---

## 9. Tóm tắt — Minimum để ra 1 khoa mới

```
src/faculties/new-faculty/
├── faculty.json              ← name, nav, contact, colors
├── pages/                    ← override các page tier `faculty-content` nếu cần
└── data/
    ├── messages-vi.json      ← nội dung text riêng
    └── messages-en.json
```

Nếu index sections giống shared → không cần `pages/`
Nếu intro/major text riêng nhưng layout giống → dùng messages JSON, không cần override component
Nếu có section đặc thù → tạo `components/{section}/` trong faculty folder
Nếu không dùng một route shared nào đó → khai báo `excludePages` trong `faculty.json`
