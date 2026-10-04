# Kế hoạch: Thêm faculty `idcs` (Trung tâm IDCS)

Ngày: 2026-10-04
Nguồn yêu cầu: `docs/IUH-IDCS-homepage-working-brief.md`

## 1. Quyết định nền tảng

| Hạng mục | Quyết định |
| --- | --- |
| Faculty id | `idcs` |
| Tên hiển thị | Trung tâm IDCS |
| Build command | `FACULTY=idcs corepack yarn build` |
| Phạm vi đợt 1 | Homepage (block 02–09) + bộ page nền tảng |
| Nội dung | Lấy từ site IUH chính và các faculty đã có; không fake metrics |

## 2. Audit facility (theo brief §0.3)

| Facility | Nguồn | Quyết định |
| --- | --- | --- |
| Header / Footer | `@shared/components/{header,footer}/department.html` | Reuse (file faculty chỉ 1 dòng delegate) |
| Site chrome data | `src/shared/components/site-chrome/site-data.js` | Reuse, cấp `data/site.json` |
| Breadcrumb, section-title, page-hero-title, divider, core-deco, brand-deco | `@shared/components/common/*` | Reuse |
| Button (13 variant) | `@shared/components/button/button.html` | Reuse |
| Form field / display-row | `@shared/components/form/*` | Reuse |
| News (render build-time) | `@shared/components/news/*` + `data/news.json` | Reuse |
| Partners | `@shared/components/partners/{index,page}.html` | Reuse |
| Leadership | `@shared/components/leadership/*` | Reuse |
| Tabs | `@shared/components/tabs/*` | Reuse; layout dọc xử lý bằng SCSS scoped, không sửa `tabs.js` |
| Document library | `organization-administration/components/documents/` | **Promote → `src/shared/components/documents/`** |
| Slider | `@shared/components/home/carousel/` | **Không reuse** — `carousel.js` import cứng ảnh dormitory; IDCS tự sở hữu `home/carousel` (markup + Swiper init), vẫn dùng `.hero-carousel` từ shared SCSS |
| Stats card | `@shared/components/stats/*` | Reuse phần JS counter (`.stats-card` + `data-count` + `.stats-number`) với markup compact của block 05 |
| Event card / featured | `@shared/components/common/event-*.html` | Không dùng — schema event (type/location/date) không khớp schema course (duration/format/audience) |

Component tạo mới (đặc thù IDCS): `home/carousel`, `home/hero`, `home/fields`, `home/service-explorer`,
`home/training` (+ `course-card.html`), `home/capabilities`, `home/consulting-process`,
`home/technology-transfer`, `home/industrial-support`, `home/updates`, `home/process-step.html`.

## 3. Page set (10 route)

```text
/                      index.html
/about.html            Giới thiệu chung + #functions + #facilities
/leadership.html       Cơ cấu tổ chức – Nhân sự
/leadership-detail.html
/news.html
/news-detail.html
/legal-documents.html  Văn bản pháp luật (document library)
/document-detail.html
/partners.html
/contact.html          Liên hệ – Yêu cầu dịch vụ
```

5 nhóm dịch vụ trong sitemap khách hàng (đào tạo / đo kiểm / tư vấn / chuyển giao /
hỗ trợ CN) ở đợt này là **section trên homepage** với anchor `/#training`, `/#services`,
`/#consulting`, `/#technology-transfer`, `/#industrial-support`; chưa có landing page riêng.

## 4. Các phase đã thực hiện

### Phase 0 — Scaffold buildable
- `src/faculties/idcs/{pages,components,data,assets}`
- `faculty.config.js` theo contract selected-faculty, `runtimeModules: []`
- `components/{header,footer}` delegate shared department chrome
- `data/site.json` — identity IDCS, navigation 2 cấp, mọi href nội bộ trỏ route được build

### Phase 1 — Data layer
- `data/news.json` — 4 item (đào tạo, dịch vụ kỹ thuật, chuyển giao công nghệ, hợp tác)
- `data/search-data.json` — 16 record (10 page + 2 anchor + 4 tin)

### Phase 2 — Baseline pages
about / leadership / leadership-detail / news / news-detail / partners / contact
compose hoàn toàn từ shared component.

### Phase 3 — Promote document library lên shared
- `git mv organization-administration/components/documents → src/shared/components/documents`
- Đăng ký `initDocumentLibrary` trong `src/shared/shared.config.js`, gỡ khỏi org-admin `runtimeModules`
- Đổi include `@faculty/components/documents/` → `@shared/...` tại org-admin
  (`documents-forms.html`, `document-detail.html`, `home/work-updates/index.html`)
- Cập nhật `tests/document-library.test.js` + `tests/organization-administration-faculty.test.js`

### Phase 4 — Homepage blocks

| Block | Component | Nền | Layout |
| --- | --- | --- | --- |
| Carousel | `home/carousel` | Dark navy | Swiper coverflow 3 slide, runtimeModule `.hero-swiper` |
| Hero | `home/hero` | Dark navy | Content hero + 3 entry card |
| 02 IDCS làm gì | `home/fields` (#fields) | White | Grid 2×2 có divider |
| 03 Dịch vụ nổi bật | `home/service-explorer` (#services) | Gray light | Tabs dọc (lg) / ngang (mobile) |
| 04 Đào tạo ngắn hạn | `home/training` (#training) | White | Featured + 3 course card |
| 05 Năng lực IDCS | `home/capabilities` (#capabilities) | Gray light | Image + 4 số liệu chính thức + capability strip |
| 06 Cải tiến CL & NS | `home/consulting-process` (#consulting) | Dark navy | Timeline 5 bước |
| 07 Chuyển giao CN | `home/technology-transfer` (#technology-transfer) | White | Content + pipeline 5 bước |
| 08 Hỗ trợ phát triển CN | `home/industrial-support` (#industrial-support) | Light blue | Nguồn lực + danh sách bài toán |
| 09 Tin tức & văn bản | `home/updates` (#updates) | White | Tabs [Tin tức \| Văn bản] |

### Phase 5 — Tests & docs
- `tests/idcs-faculty.test.js` (9 test)
- Cập nhật `site-chrome-build.test.js` (`idcs: 10`), `shared-partners.test.js`, `site-chrome.test.js`
- Cập nhật `docs/source-overview.md`

## 5. Assets và số liệu

Ảnh tải từ site IUH chính thức, chuẩn hóa về JPEG 1600px (`sips -s format jpeg -s formatOptions 72 -Z 1600`),
lưu tại `src/faculties/idcs/assets/images/`. Mỗi `<img>` trong component kèm comment `<!-- Photo: <url> -->`.

| File | Nguồn | Dùng ở |
| --- | --- | --- |
| `idcs-facility.jpg` | `iuh.edu.vn/upload/images/baiviet/csvc002.jpg` | hero, capabilities, service explorer (kiểm tra), news #2, ogImage |
| `idcs-technology-transfer.jpg` | `.../2026/09/MOU2.JPG` | about, service explorer (tư vấn kỹ thuật), news #3 |
| `idcs-equipment.jpg` | `.../2026/08/AIoT1.JPG` | service explorer (đo lường), news #4 |
| `idcs-training.jpg` | `.../2026/08/ICTE2.JPG` | training featured, service explorer (đánh giá), news #1 |
| `idcs-consulting.jpg` | `.../2026/04/ISDEA2.JPG` | service explorer (phân tích) |

Số liệu block 05 lấy từ công bố chính thức của Trường (counter trang chủ iuh.edu.vn và
`iuh.edu.vn/vi/co-so-vat-chat.html`), trình bày rõ là **nguồn lực toàn Trường mà IDCS khai thác**:
350+ phòng thí nghiệm & xưởng thực hành · 1.800+ CBVC–NLĐ · 60+ chuyên ngành · 2.000+ công bố khoa học.

## 6. Gotcha đã gặp

| Vấn đề | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `Unresolved data-include remains` | Transformer chỉ khớp `<div data-include=...>` khi `data-include` là **attribute đầu tiên** | Dùng `data-class` thay vì `class=` trên div include |
| `The font-roboto class does not exist` | `font-roboto` không phải Tailwind class (chỉ `font-inter` và `font-sans` được khai báo) | Bỏ khỏi `@apply`; body đã dùng Roboto mặc định |
| Footer social link fail | `site-chrome.test.js` chỉ hỗ trợ hover color cho facebook / instagram / youtube | Dùng đúng 3 icon đó |
| Tabs dọc | `tabs.js` hardcode `border-b-2 border-primary-dark-blue` khi active | SCSS scoped `.iuh-service-explorer .tab-btn.active` (specificity 0,2,0) ghi đè — theo tiền lệ `lookup.scss` của dormitory |
| Ảnh `.jpg` thực chất là PNG | Một số file trên iuh.edu.vn đặt sai đuôi | Chuẩn hóa bằng `sips -s format jpeg` sau khi tải |

## 7. Verification
```bash
FACULTY=idcs corepack yarn build        # 10 html, chỉ data/search-data.json
corepack yarn test                       # 87 test / 81 pass / 6 fail (xem mục 8)
```

## 8. Pre-existing failures (KHÔNG do change này)
Xác nhận bằng cách chạy test trên worktree sạch tại `HEAD`: 6 failure giống hệt.

```text
document listing exposes twelve searchable records and accessible filters   (14 ≠ 12)
document pages compose every compatible shared UI primitive                 (14 ≠ 12)
shared link buttons forward native attributes for new-tab document actions  (10 ≠ 7)
organization administration contact routes to exactly the five approved areas
organization administration pages end with the shared partners section before the footer
organization administration retained pages use the approved vocabulary
```

## 9. Out of scope

- Landing page riêng cho 5 nhóm dịch vụ
- Form đăng ký khóa học / yêu cầu dịch vụ có backend
- Ảnh chân dung nhân sự (leadership vẫn dùng `/assets/images/default.jpg`)
- i18n

## 10. Nợ kỹ thuật phát hiện (không fix trong change này)

`src/shared/components/home/carousel/carousel.js` import cứng 3 ảnh từ
`src/faculties/dormitory-management/assets/images/`, nên mọi faculty build đều kéo theo
ảnh của dormitory. Vi phạm quy tắc "shared không phụ thuộc faculty" trong
`openspec/specs/multi-faculty-architecture`. Ảnh không xuất hiện trong HTML của IDCS,
chỉ nằm trong bundle output.
