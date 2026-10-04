# IUH — Trung tâm IDCS Website Working Brief

> **Mục đích:** Tài liệu làm việc cho team/AI/dev khi triển khai website Trung tâm IDCS trên nền tảng website IUH hiện có.  
> **Nguyên tắc chính:** **Đọc codebase trước, tái sử dụng facilities hiện có trước, chỉ tạo mới khi thật sự cần.**

---

## 0. BẮT BUỘC ĐỌC TRƯỚC KHI CODE

Trước khi chỉnh sửa hoặc tạo component mới, phải thực hiện đủ các bước sau:

### 0.1. Đọc tài liệu/codebase context

Kiểm tra và đọc các tài liệu hiện có trong repository, ưu tiên:

- `README.md`
- các file trong `docs/`
- tài liệu architecture / coding convention
- tài liệu faculty/department module
- build/deploy instructions
- data/content conventions
- component conventions
- asset conventions
- routing/page structure
- CSS/design token conventions
- accessibility rules
- lint/build/test commands

**Không được giả định cấu trúc codebase chỉ dựa trên brief này.**

### 0.2. Xác minh baseline hiện tại

Trước khi implement, ghi lại:

```text
Branch:
Commit:
Build command:
Faculty/module id:
Entry page:
Global layout:
Global header:
Global footer:
Shared CSS:
Shared JS/helpers:
Shared data utilities:
```

Nếu repository đã thay đổi so với tài liệu cũ, **ưu tiên code thực tế hiện tại**.

### 0.3. Audit facilities có sẵn trong codebase

Phải kiểm tra các phần có thể tái sử dụng trước khi tạo mới:

- Header / navigation
- Footer
- Breadcrumb
- Section wrapper/container
- Grid system
- Typography system
- Buttons / CTA
- Cards
- Tabs
- Accordion
- Slider / carousel
- News listing
- News detail
- Document / legal document listing
- Search
- Pagination
- Modal / dialog
- Image helpers
- Icon system
- Data loading/rendering helpers
- JSON schema/content pattern
- Build-time includes
- Shared partials
- Shared JS interaction utilities
- Responsive utilities
- Accessibility helpers
- Animation utilities
- Existing faculty blocks có layout tương tự

### 0.4. Quy tắc reuse

Ưu tiên theo thứ tự:

```text
1. Reuse nguyên component/facility hiện có
2. Extend component hiện có bằng modifier/class/config
3. Tạo variant mới trong shared component nếu có khả năng dùng lại
4. Chỉ tạo component riêng cho IDCS nếu thật sự đặc thù
```

**Không duplicate logic hoặc CSS nếu codebase đã có facility tương đương.**

### 0.5. Theo dõi facilities trong quá trình làm

Tạo và duy trì bảng audit:

| Facility / Component | Có sẵn? | File / Path | Reuse | Extend | Tạo mới | Ghi chú |
|---|---:|---|---:|---:|---:|---|
| Section wrapper | Có | `@shared/components/common/section-title.html` | x | | | |
| Button / CTA | Có | `@shared/components/button/button.html` | x | | | 13 variant |
| Tabs | Có | `@shared/components/tabs/` | x | | | Layout dọc qua SCSS scoped |
| News list | Có | `@shared/components/news/` | x | | | Render build-time từ `data/news.json` |
| Document list | Có (faculty) | `organization-administration/components/documents/` | | x | | Promote lên `@shared/components/documents/` |
| Card | Có | `@shared/components/common/event-card.html` | | | x | Schema event ≠ schema course → `home/training/course-card.html` |
| Icon | Có | `src/shared/assets/svgs/` | x | | | |
| Slider | Có | `@shared/components/home/carousel/` | | | x | Shared `carousel.js` import cứng ảnh dormitory → IDCS tự sở hữu `home/carousel`, reuse `.hero-carousel` SCSS |
| Animation | Có | `.nttFade`, `brand-deco.scss` | x | | | |
| Data renderer | Có | `news-renderer.js` (`data-news-list`) | x | | | |

---

# 1. WEBSITE POSITIONING

## Trung tâm IDCS

Website không nên được xử lý như website của một khoa đào tạo thông thường.

Định vị đề xuất:

> **Trung tâm cung cấp năng lực, dịch vụ kỹ thuật, đào tạo, tư vấn cải tiến và chuyển giao công nghệ cho doanh nghiệp.**

Tone tổng thể:

```text
IUH Institutional
+
Industrial / Engineering
+
Technology
+
Professional B2B
```

### Tránh

- Quá giống website tuyển sinh.
- Quá nhiều block tin tức.
- Card lặp lại liên tục.
- SaaS-style quá mạnh, mất nhận diện IUH.
- Animation nặng.
- Visual quá marketing, thiếu cảm giác kỹ thuật/chuyên môn.

---

# 2. SITEMAP KHÁCH HÀNG YÊU CẦU

```text
TRUNG TÂM IDCS
│
├── 01. TRANG CHỦ
│
├── 02. GIỚI THIỆU
│   ├── Giới thiệu chung
│   ├── Chức năng – Nhiệm vụ
│   ├── Cơ cấu tổ chức
│   ├── Nhân sự
│   └── Cơ sở vật chất
│
├── 03. ĐÀO TẠO NGẮN HẠN
│   ├── Các chương trình đào tạo
│   ├── Lịch khai giảng
│   └── Đăng ký khóa học
│
├── 04. DỊCH VỤ ĐO KIỂM
│   ├── Danh mục dịch vụ
│   ├── Năng lực thiết bị
│   └── Yêu cầu dịch vụ
│
├── 05. TƯ VẤN CẢI TIẾN
│   └── Chất lượng & Năng suất
│
├── 06. CHUYỂN GIAO CÔNG NGHỆ
│
├── 07. HỖ TRỢ PHÁT TRIỂN CÔNG NGHIỆP
│
├── 08. TIN TỨC
│
├── 09. VĂN BẢN PHÁP LUẬT
│
└── 10. LIÊN HỆ
```

---

# 3. HOMEPAGE — BLOCKS ĐÃ CHỐT

Phần này tập trung vào các block:

```text
02  IDCS LÀM GÌ?
03  DỊCH VỤ NỔI BẬT
04  ĐÀO TẠO NGẮN HẠN
05  NĂNG LỰC IDCS
06  CẢI TIẾN CHẤT LƯỢNG & NĂNG SUẤT
07  CHUYỂN GIAO CÔNG NGHỆ
08  HỖ TRỢ PHÁT TRIỂN CÔNG NGHIỆP
09  TIN TỨC & VĂN BẢN
```

Mục tiêu UX:

```text
IDCS là ai
↓
IDCS cung cấp gì
↓
Doanh nghiệp có thể sử dụng dịch vụ gì
↓
IDCS có năng lực gì
↓
IDCS giải quyết vấn đề như thế nào
↓
Công nghệ được chuyển giao ra sao
↓
IDCS hỗ trợ hệ sinh thái doanh nghiệp thế nào
↓
Tin tức / văn bản chuyên ngành
```

---

# 4. BLOCK 02 — IDCS LÀM GÌ?

## Mục tiêu

User vào website phải hiểu nhanh IDCS hoạt động trong những nhóm nào.

### Eyebrow

**LĨNH VỰC HOẠT ĐỘNG**

### Headline

**Kết nối tri thức, công nghệ và nhu cầu thực tế của doanh nghiệp**

### Description

IDCS cung cấp các chương trình đào tạo, dịch vụ kỹ thuật, tư vấn cải tiến và chuyển giao công nghệ nhằm nâng cao năng lực sản xuất và hỗ trợ doanh nghiệp phát triển bền vững.

### 4 lĩnh vực

#### 01. Đào tạo & phát triển năng lực

Các chương trình đào tạo ngắn hạn, bồi dưỡng chuyên môn và nâng cao kỹ năng cho đội ngũ kỹ thuật, quản lý và người lao động.

#### 02. Đo kiểm & dịch vụ kỹ thuật

Hỗ trợ đo lường, kiểm tra, đánh giá và phân tích các thông số kỹ thuật phục vụ sản xuất và kiểm soát chất lượng.

#### 03. Tư vấn cải tiến

Đồng hành cùng doanh nghiệp cải tiến quy trình, chất lượng, năng suất và hiệu quả vận hành.

#### 04. Chuyển giao công nghệ

Kết nối nghiên cứu, giải pháp kỹ thuật và công nghệ từ nhà trường đến ứng dụng thực tế tại doanh nghiệp.

## Layout

Desktop:

```text
┌─────────────────────────────────────────────────────┐
│ LĨNH VỰC HOẠT ĐỘNG                                 │
│                                                     │
│ Kết nối tri thức, công nghệ                         │
│ và nhu cầu thực tế của doanh nghiệp                 │
│                                                     │
│ ┌─────────────────────┬───────────────────────────┐ │
│ │ 01                  │ 02                        │ │
│ │ ĐÀO TẠO             │ ĐO KIỂM                   │ │
│ │ description         │ description               │ │
│ │              ↗      │                    ↗      │ │
│ ├─────────────────────┼───────────────────────────┤ │
│ │ 03                  │ 04                        │ │
│ │ TƯ VẤN CẢI TIẾN    │ CHUYỂN GIAO CÔNG NGHỆ    │ │
│ └─────────────────────┴───────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### UI note

- Không dùng 4 card floating giống nhau nếu codebase không bắt buộc.
- Ưu tiên grid có border/divider.
- Hover có thể đổi background/image nhẹ.
- Mỗi item link tới landing page tương ứng.

---

# 5. BLOCK 03 — DỊCH VỤ NỔI BẬT

## Mục tiêu

Trả lời:

> **Doanh nghiệp có thể nhờ IDCS làm cụ thể việc gì?**

### Eyebrow

**DỊCH VỤ IDCS**

### Headline

**Giải pháp chuyên môn cho nhu cầu thực tế**

### Description

Khám phá các nhóm dịch vụ chuyên môn được IDCS triển khai nhằm hỗ trợ doanh nghiệp trong kiểm soát chất lượng, cải tiến sản xuất và phát triển công nghệ.

## Layout đề xuất

**Service Explorer**

```text
┌────────────────────┬─────────────────────────────────┐
│ 01 Đo lường     →  │ DỊCH VỤ ĐO LƯỜNG              │
│ 02 Kiểm tra     →  │                                 │
│ 03 Phân tích    →  │ Mô tả dịch vụ                  │
│ 04 Đánh giá     →  │                                 │
│ 05 Tư vấn       →  │ • Capability                   │
│                    │ • Capability                   │
│                    │ • Capability                   │
│                    │                                 │
│                    │ [Yêu cầu dịch vụ →]            │
│                    │                   [IMAGE]       │
└────────────────────┴─────────────────────────────────┘
```

## Interaction

- Desktop: left nav + right detail.
- Tablet: tabs / horizontal scroll.
- Mobile: accordion hoặc stacked tabs nếu facility có sẵn.
- Không tạo custom JS nếu codebase đã có tabs/accordion utility.

## CTA

**Yêu cầu dịch vụ**

---

# 6. BLOCK 04 — ĐÀO TẠO NGẮN HẠN

## Mục tiêu

Thể hiện IDCS như một đơn vị **professional / corporate training**, không giống danh sách môn học.

### Eyebrow

**ĐÀO TẠO & PHÁT TRIỂN NĂNG LỰC**

### Headline

**Kiến thức ứng dụng cho đội ngũ trong kỷ nguyên công nghiệp mới**

### Description

Các chương trình đào tạo ngắn hạn được xây dựng theo nhu cầu thực tế, kết hợp kiến thức chuyên môn của IUH và kinh nghiệm triển khai trong môi trường doanh nghiệp.

## Filter gợi ý

```text
Tất cả
Quản lý chất lượng
Kỹ thuật
Sản xuất
Công nghệ
```

## Homepage content

- 01 featured course/program
- 02–03 course cards
- CTA xem toàn bộ chương trình

### Card information

```text
Category
Course title
Duration
Format
Audience
CTA
```

## Layout

```text
┌───────────────────────────────────────────┐
│ FEATURED PROGRAM                          │
│ Nâng cao năng suất & cải tiến quy trình  │
│ [Chi tiết chương trình]          [IMAGE] │
└───────────────────────────────────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Course 01  │ │ Course 02  │ │ Course 03  │
└────────────┘ └────────────┘ └────────────┘
```

### CTA

**Xem tất cả chương trình đào tạo**

---

# 7. BLOCK 05 — NĂNG LỰC IDCS

## Mục tiêu

Tăng credibility và trả lời:

> **Tại sao doanh nghiệp nên làm việc với IDCS?**

### Eyebrow

**NĂNG LỰC IDCS**

### Headline

**Nền tảng chuyên môn cho những giải pháp thực tiễn**

### Description

IDCS khai thác nguồn lực chuyên gia, phòng thí nghiệm, trang thiết bị và hệ sinh thái nghiên cứu của Trường Đại học Công nghiệp TP.HCM để phục vụ đào tạo, tư vấn và hỗ trợ doanh nghiệp.

## Layout

```text
┌───────────────────────┬──────────────────────────────┐
│                       │ NĂNG LỰC IDCS                │
│   LAB / EQUIPMENT     │                              │
│       IMAGE           │ 20+          XX+             │
│                       │ Chuyên gia   Thiết bị        │
│                       │                              │
│                       │ XX+          XX+             │
│                       │ Lĩnh vực     Đối tác         │
│                       │                              │
│                       │ [Khám phá năng lực →]        │
└───────────────────────┴──────────────────────────────┘
```

## Bottom capability strip

```text
Chuyên gia
Phòng thí nghiệm
Thiết bị
Nghiên cứu
Mạng lưới đối tác
```

### Data rule

- Không fake số liệu.
- Dùng placeholder trong dev nếu chưa có data thật.
- Data thật phải đến từ source/content convention đang dùng trong codebase.

---

# 8. BLOCK 06 — CẢI TIẾN CHẤT LƯỢNG & NĂNG SUẤT

## Mục tiêu

Biến nội dung tư vấn thành **consulting process**, không chỉ là mô tả dịch vụ.

### Eyebrow

**TƯ VẤN DOANH NGHIỆP**

### Headline

**Từ nhận diện vấn đề đến cải tiến có thể đo lường**

### Description

IDCS đồng hành cùng doanh nghiệp trong việc đánh giá hiện trạng, xác định điểm nghẽn và xây dựng giải pháp nâng cao chất lượng, năng suất và hiệu quả vận hành.

## Process

```text
01
KHẢO SÁT HIỆN TRẠNG
        ↓
02
PHÂN TÍCH VẤN ĐỀ
        ↓
03
ĐỀ XUẤT GIẢI PHÁP
        ↓
04
TRIỂN KHAI CẢI TIẾN
        ↓
05
ĐÁNH GIÁ HIỆU QUẢ
```

Desktop có thể chuyển thành horizontal flow:

```text
01            02            03            04            05
Khảo sát  →   Phân tích →   Giải pháp →   Triển khai →  Đánh giá
```

## Outcome

```text
Nâng cao chất lượng
Tối ưu năng suất
Cải thiện vận hành
```

## Visual

- Dark navy / deep IUH blue.
- Typography lớn.
- Line/progress graphic.
- Animation nhẹ khi section vào viewport nếu codebase có sẵn utility.

### CTA

**Trao đổi với chuyên gia**

---

# 9. BLOCK 07 — CHUYỂN GIAO CÔNG NGHỆ

## Mục tiêu

Cho thấy vai trò kết nối:

```text
Research → Application → Industry
```

### Eyebrow

**NGHIÊN CỨU → ỨNG DỤNG**

### Headline

**Đưa công nghệ từ phòng nghiên cứu vào thực tiễn**

### Description

IDCS đóng vai trò kết nối giữa năng lực nghiên cứu của IUH và nhu cầu đổi mới của doanh nghiệp, thúc đẩy việc thử nghiệm, hoàn thiện và ứng dụng các giải pháp công nghệ trong thực tế.

## Pipeline

```text
01
NGHIÊN CỨU
    ↓
02
GIẢI PHÁP
    ↓
03
THỬ NGHIỆM
    ↓
04
CHUYỂN GIAO
    ↓
05
ỨNG DỤNG
```

## Supporting content

```text
Nghiên cứu ứng dụng
Thử nghiệm giải pháp
Chuyển giao kỹ thuật
Hợp tác doanh nghiệp
```

## Layout

```text
┌────────────────────────┬───────────────────────────┐
│ Content                │ Visual pipeline           │
│ Headline               │                           │
│ Description            │ RESEARCH                  │
│ CTA                    │    ↓                      │
│                        │ PROTOTYPE                 │
│                        │    ↓                      │
│                        │ PILOT                     │
│                        │    ↓                      │
│                        │ INDUSTRY                  │
└────────────────────────┴───────────────────────────┘
```

### CTA

**Khám phá hoạt động chuyển giao**

---

# 10. BLOCK 08 — HỖ TRỢ PHÁT TRIỂN CÔNG NGHIỆP

## Mục tiêu

Thể hiện IDCS như một **điểm kết nối nguồn lực**, không phải chỉ là nơi bán từng dịch vụ đơn lẻ.

### Headline

**Đồng hành cùng doanh nghiệp trong hành trình phát triển**

### Description

Kết nối nguồn lực từ trường đại học, chuyên gia và hệ sinh thái công nghiệp để hỗ trợ doanh nghiệp giải quyết các nhu cầu về công nghệ, nhân lực, năng suất và đổi mới.

## Ecosystem visual

```text
                 CÔNG NGHỆ
                     │
                     │
        NHÂN LỰC ── IDCS ── CHẤT LƯỢNG
                     │
                     │
            NĂNG SUẤT / ĐỔI MỚI
```

## Business needs

### Bạn đang gặp bài toán nào?

```text
→ Cần nâng cao năng lực nhân sự
→ Cần cải tiến quy trình sản xuất
→ Cần kiểm tra / đánh giá kỹ thuật
→ Cần tìm giải pháp công nghệ
→ Cần chuyên gia tư vấn
```

### CTA

**Gửi nhu cầu cho IDCS**

---

# 11. BLOCK 09 — TIN TỨC & VĂN BẢN

## Mục tiêu

Gộp 2 content type nhưng vẫn giữ đúng sitemap riêng:

- Tin tức
- Văn bản pháp luật

### Eyebrow

**CẬP NHẬT**

### Headline

**Tin tức, hoạt động & thông tin chuyên ngành**

## Tabs

```text
[ Tin tức ] [ Văn bản pháp luật ]
```

### Tab: Tin tức

Layout:

```text
┌────────────────────────────────┬─────────────────────┐
│ FEATURE IMAGE                  │ Tin nhỏ 01          │
│                                ├─────────────────────┤
│ Featured title                 │ Tin nhỏ 02          │
│ Date / Category                ├─────────────────────┤
│ Description                    │ Tin nhỏ 03          │
└────────────────────────────────┴─────────────────────┘
```

### Tab: Văn bản pháp luật

Không dùng image card.

```text
LOẠI          VĂN BẢN                         NGÀY

Thông tư      Thông tư số XX/2026/...        12.09.26    ↓
Quyết định    Quyết định số XX/...           02.09.26    ↓
Nghị định     Nghị định số XX/...            21.08.26    ↓
```

### Reuse rule

Ưu tiên dùng:

- news renderer có sẵn
- document list có sẵn
- tabs có sẵn
- date formatting helper có sẵn
- content JSON conventions có sẵn

Không viết lại hệ thống news/document nếu platform đã hỗ trợ.

---

# 12. HOMEPAGE VISUAL RHYTHM

Không được để 8 section cùng một kiểu card.

Nhịp đề xuất:

| Block | Background | Layout type |
|---|---|---|
| 02 IDCS làm gì | White | 2×2 structured grid |
| 03 Dịch vụ nổi bật | Light gray | Interactive explorer |
| 04 Đào tạo ngắn hạn | White | Featured + cards |
| 05 Năng lực IDCS | Soft gray | Image + stats |
| 06 Cải tiến chất lượng | Dark navy | Process timeline |
| 07 Chuyển giao công nghệ | White | Content + pipeline |
| 08 Hỗ trợ phát triển CN | Light blue | Ecosystem + needs |
| 09 Tin tức & văn bản | White | Editorial + tabs |

---

# 13. VISUAL SYSTEM

## Color

Ưu tiên sử dụng design tokens/colors đã tồn tại trong IUH codebase.

Nếu chưa có token phù hợp:

- IUH primary blue
- Deep navy
- White
- Soft gray
- Light blue
- Neutral text

**Không hard-code palette mới nếu codebase đã có CSS variables/token system.**

## Typography

Reuse typography system hiện có.

Hierarchy:

```text
Eyebrow
Section heading
Section description
Card/service title
Body
Meta
CTA
```

## Image direction

Ưu tiên:

- Laboratory
- Industrial equipment
- Engineers
- Measurement/testing
- Manufacturing
- Research
- Technology transfer
- Corporate training

Tránh:

- Generic office stock images
- Student lifestyle ảnh không liên quan
- Illustration quá SaaS

---

# 14. RESPONSIVE PRINCIPLES

## Desktop

- Tận dụng wide layout.
- Section có breathing space.
- Explorer/process/pipeline có thể hiển thị đầy đủ.

## Tablet

- 2-column → cân nhắc 1-column.
- Service explorer chuyển tab/horizontal nav nếu cần.
- Process không được overflow.

## Mobile

Ưu tiên:

```text
Readability
↓
Content hierarchy
↓
Touch interaction
↓
Minimal horizontal scroll
```

Mobile transformation:

| Desktop | Mobile |
|---|---|
| 2×2 grid | 1 column |
| Service explorer | Tabs / Accordion |
| Horizontal process | Vertical process |
| Image + stats | Image → stats |
| Ecosystem diagram | Simplified stacked layout |
| News feature + side list | Featured → stacked list |

Không custom mobile interaction nếu existing facility đã xử lý.

---

# 15. ACCESSIBILITY

Phải tuân thủ facility/rule hiện có trong codebase.

Tối thiểu:

- semantic heading order
- keyboard usable
- focus visible
- CTA là link/button đúng semantics
- tabs có ARIA phù hợp
- accordion có state
- alt text cho image
- không dựa chỉ vào màu sắc
- motion hỗ trợ `prefers-reduced-motion`
- contrast đạt chuẩn

---

# 16. CONTENT MODEL GỢI Ý

Không bắt buộc dùng schema này nếu codebase đã có convention khác.

## Service

```json
{
  "id": "",
  "title": "",
  "shortDescription": "",
  "description": "",
  "image": "",
  "href": "",
  "capabilities": []
}
```

## Course

```json
{
  "title": "",
  "category": "",
  "duration": "",
  "format": "",
  "audience": "",
  "image": "",
  "href": "",
  "featured": false
}
```

## Capability Metric

```json
{
  "value": "",
  "label": ""
}
```

## News

**Reuse schema đang có trong platform.**

## Legal Document

**Reuse schema/document convention đang có trong platform.**

---

# 17. COMPONENT / BLOCK MAPPING

Tên chỉ mang tính working name.  
Phải map lại theo naming convention hiện có trong repo.

```text
idcs-fields
idcs-service-explorer
idcs-training
idcs-capabilities
idcs-consulting-process
idcs-technology-transfer
idcs-industrial-support
idcs-updates
```

### Trước khi tạo các component trên

Search codebase xem có component tương đương:

```text
service
feature-grid
tabs
cards
stats
timeline
process
news
documents
media
cta
```

Nếu có, ưu tiên compose/extend.

---

# 18. IMPLEMENTATION TRACKER

Trong quá trình làm, update bảng sau:

| Block | Existing facility | Decision | Files changed | Status |
|---|---|---|---|---|
| 02 IDCS làm gì | section-title, button | New section | `components/home/fields/index.html` | DONE |
| 03 Dịch vụ nổi bật | shared tabs | Extend (SCSS scoped) | `components/home/service-explorer/{index.html,service-explorer.scss}` | DONE |
| 04 Đào tạo ngắn hạn | button | New | `components/home/training/{index.html,course-card.html}` | DONE |
| 05 Năng lực IDCS | section-title, stats-card (JS counter), button | Reuse + New | `components/home/capabilities/index.html` | DONE |
| 06 Cải tiến CL & NS | brand-deco, button | New | `components/home/consulting-process/index.html`, `components/home/process-step.html` | DONE |
| 07 Chuyển giao CN | process-step | Reuse + New | `components/home/technology-transfer/index.html` | DONE |
| 08 Hỗ trợ phát triển CN | button | New | `components/home/industrial-support/index.html` | DONE |
| 09 Tin tức & văn bản | shared tabs, news renderer, document-item | Reuse | `components/home/updates/index.html` | DONE |

Chi tiết triển khai: `docs/superpowers/plans/2026-10-04-idcs-faculty.md`

---

# 19. DEFINITION OF DONE

Một block chỉ được xem là hoàn tất khi:

- [ ] Bám đúng sitemap/customer requirement.
- [ ] Đã audit facility trong codebase.
- [ ] Không duplicate component/helper có sẵn.
- [ ] Content hierarchy rõ.
- [ ] Desktop đúng layout.
- [ ] Tablet ổn.
- [ ] Mobile ổn.
- [ ] Keyboard usable.
- [ ] Không gây regression global styles.
- [ ] Không phá các faculty/module khác.
- [ ] Build pass.
- [ ] Lint/test pass nếu project có.
- [ ] Asset path hợp lệ.
- [ ] Link nội bộ hợp lệ.
- [ ] Không hard-code data nếu platform có content/data layer.
- [ ] Không fake metrics/content production.
- [ ] Visual vẫn thuộc hệ sinh thái IUH.

---

# 20. WORKFLOW CHO AI / DEV

Mỗi lần bắt đầu implementation:

```text
STEP 1
Read repository docs

STEP 2
Understand current faculty/module architecture

STEP 3
Inspect current page + related faculty examples

STEP 4
Audit reusable facilities

STEP 5
Record reuse/extend/new decisions

STEP 6
Implement one block at a time

STEP 7
Test responsive + interaction

STEP 8
Run build/lint/test

STEP 9
Compare visual rhythm across whole homepage

STEP 10
Update implementation tracker
```

---

# 21. IMPORTANT NOTES

1. **Không code ngay sau khi đọc brief.**
2. **Phải đọc docs/codebase trước.**
3. **Phải search facilities/components hiện có.**
4. **Không tạo component mới nếu component cũ có thể extend.**
5. **Không thay đổi global facility chỉ để phục vụ IDCS nếu có nguy cơ ảnh hưởng faculty khác.**
6. Nếu cần thay đổi shared facility:
   - giữ backward compatibility;
   - dùng modifier/config;
   - test các consumer hiện tại.
7. Homepage không phải bản sao sitemap.
8. Mỗi block phải có mục tiêu UX riêng.
9. Không biến toàn bộ homepage thành card grid.
10. Content production phải lấy từ nguồn dữ liệu thật hoặc convention của platform.
11. Các con số năng lực chỉ được đưa lên production khi có số liệu chính thức.
12. Giữ nhận diện IUH xuyên suốt, nhưng IDCS phải có cảm giác **industrial / technology / B2B** rõ ràng.

---

# 22. FINAL HOMEPAGE FLOW

```text
02
IDCS LÀM GÌ?
Overview 4 lĩnh vực

↓

03
DỊCH VỤ NỔI BẬT
Interactive Service Explorer

↓

04
ĐÀO TẠO NGẮN HẠN
Professional Training

↓

05
NĂNG LỰC IDCS
Lab + Equipment + Experts + Metrics

↓

06
CẢI TIẾN CHẤT LƯỢNG & NĂNG SUẤT
Consulting Process

↓

07
CHUYỂN GIAO CÔNG NGHỆ
Research → Pilot → Industry

↓

08
HỖ TRỢ PHÁT TRIỂN CÔNG NGHIỆP
Ecosystem + Business Needs

↓

09
TIN TỨC & VĂN BẢN
News + Legal Documents
```

---

## Working principle

> **Understand the platform first. Reuse existing facilities. Extend carefully. Build only what IDCS truly needs.**
