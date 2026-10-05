# IUH — Trung tâm IDCS Website Working Brief

> **Mục đích:** Tài liệu làm việc cho team/AI/dev khi triển khai website **Trung tâm Kỹ thuật hỗ trợ phát triển công nghiệp khu vực phía Nam (IDCS)** trên nền tảng website IUH hiện có.  
> **Cập nhật:** 2026-10-05  
> **Nguyên tắc chính:** **Đọc codebase trước → xác minh source/content hiện tại → reuse facility có sẵn → chỉ tạo mới khi thật sự cần → không biến thông tin dự án/quy hoạch thành năng lực đang vận hành.**

---

# 0. BẮT BUỘC ĐỌC TRƯỚC KHI CODE

## 0.1. Đọc tài liệu/codebase context

Trước khi chỉnh sửa hoặc tạo component mới, phải kiểm tra:

- `README.md`
- `docs/`
- architecture / coding convention
- faculty/department module convention
- build/deploy instructions
- data/content conventions
- component conventions
- asset conventions
- routing/page structure
- CSS/design tokens
- accessibility rules
- lint/build/test commands

**Không được giả định cấu trúc codebase chỉ dựa trên brief này.**

## 0.2. Xác minh baseline hiện tại

Ghi lại trước khi implement:

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

## 0.3. Audit facility/component có sẵn

Phải kiểm tra trước khi tạo mới:

- Header / navigation
- Footer
- Breadcrumb
- Section wrapper / container
- Grid
- Typography
- Button / CTA
- Card
- Tabs
- Accordion
- Slider / carousel
- News list/detail
- Document/legal-document list
- Search
- Pagination
- Modal/dialog
- Image helpers
- Icon system
- Data renderer/helpers
- JSON/content schema
- Build-time includes
- Shared JS interaction utilities
- Responsive helpers
- Accessibility helpers
- Animation utilities
- Existing faculty blocks có layout tương tự

## 0.4. Reuse rule

Ưu tiên:

```text
1. Reuse nguyên component/facility hiện có
2. Extend component hiện có bằng modifier/class/config
3. Tạo variant trong shared component nếu có khả năng dùng lại
4. Chỉ tạo component riêng cho IDCS nếu thật sự đặc thù
```

**Không duplicate logic/CSS nếu platform đã có facility tương đương.**

## 0.5. Facility/component audit tracker

| Facility / Component | Có sẵn? | File / Path | Reuse | Extend | New | Ghi chú |
|---|---:|---|---:|---:|---:|---|
| Section wrapper |  |  |  |  |  |  |
| Button / CTA |  |  |  |  |  |  |
| Tabs |  |  |  |  |  |  |
| Accordion |  |  |  |  |  |  |
| News list |  |  |  |  |  |  |
| Document list |  |  |  |  |  |  |
| Card |  |  |  |  |  |  |
| Icon |  |  |  |  |  |  |
| Slider |  |  |  |  |  |  |
| Animation |  |  |  |  |  |  |
| Data renderer |  |  |  |  |  |  |

---

# 1. IDCS CONTEXT — PHẢI DÙNG ĐÚNG BỐI CẢNH HIỆN TẠI

## 1.1. Tên đơn vị

**Tên đầy đủ:** Trung tâm Kỹ thuật hỗ trợ phát triển công nghiệp khu vực phía Nam  
**Tên viết tắt:** IDCS

> Tên tiếng Anh chỉ publish khi được xác nhận từ source chính thức/client content.

## 1.2. Cơ cấu hiện tại

Theo website IUH hiện tại, **IDCS đang được liệt kê là một Trung tâm trực thuộc Đại học Công nghiệp Thành phố Hồ Chí Minh (IUH)**.

Khi viết content mới:

```text
Ưu tiên:
IDCS — đơn vị trực thuộc Đại học Công nghiệp Thành phố Hồ Chí Minh (IUH), Bộ Công Thương.
```

Không sử dụng mô tả cũ:

```text
IDCS — đơn vị trực thuộc Cục Công nghiệp, Bộ Công Thương.
```

trừ khi đang nói **bối cảnh lịch sử** và có ghi rõ thời điểm.

## 1.3. Không nhầm IDCS với IDC Hà Nội

Phân biệt:

```text
IDCS
Trung tâm Kỹ thuật hỗ trợ phát triển công nghiệp khu vực phía Nam

≠

IDC
Trung tâm Hỗ trợ phát triển công nghiệp
```

Nhiều search result cũ có thể trộn hai đơn vị. Không copy content giữa IDC và IDCS nếu chưa xác minh.

## 1.4. Historical/current-source rule

Thông tin giai đoạn 2020–2025 về IDCS thường ghi đơn vị thuộc **Cục Công nghiệp**. Đây có thể dùng để mô tả:

- lịch sử hình thành
- chương trình đã thực hiện
- track record
- dự án/chương trình cũ

Nhưng không được dùng làm organizational description hiện tại nếu source IUH mới hơn đã thay đổi.

---

# 2. WEBSITE POSITIONING

Website không nên được xử lý như website khoa đào tạo hoặc landing page khóa học.

## 2.1. Positioning đề xuất

> **IDCS là trung tâm hỗ trợ kỹ thuật, đổi mới công nghệ và phát triển năng lực cho doanh nghiệp công nghiệp khu vực phía Nam.**

Phiên bản ngắn cho hero/communication:

> **Nâng cao năng lực công nghiệp Việt Nam**  
> Từ cải tiến sản xuất, phát triển công nghệ đến kết nối chuỗi cung ứng.

## 2.2. Core identity

```text
Technical Support
+
Industrial Consulting
+
Technology & R&D
+
Industry-ready Training
+
Supplier / Supply-chain Development
```

## 2.3. Tone

```text
IUH Institutional
+
Industrial / Engineering
+
Technology
+
Professional B2B
+
Applied / Outcome-oriented
```

### Tránh

- Quá giống website tuyển sinh.
- Định vị IDCS chủ yếu là “trung tâm đào tạo”.
- Quá nhiều block tin tức.
- Card lặp lại liên tục.
- SaaS-style quá mạnh.
- Animation nặng.
- Copy marketing chung chung nhưng thiếu capability/evidence.
- Gọi capability dự kiến là capability đang vận hành.

---

# 3. SITEMAP KHÁCH HÀNG YÊU CẦU

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

# 4. HOMEPAGE — INFORMATION FLOW ĐÃ CHỐT

Tập trung:

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

UX narrative:

```text
IDCS là ai / vai trò gì
↓
IDCS giải quyết nhóm bài toán nào
↓
Doanh nghiệp có thể dùng dịch vụ gì
↓
Đào tạo cho năng lực công nghiệp
↓
IDCS có capability/evidence gì
↓
IDCS cải tiến doanh nghiệp như thế nào
↓
Công nghệ đi từ nghiên cứu đến sản xuất ra sao
↓
IDCS phát triển supplier / supply chain thế nào
↓
Tin tức / chương trình / chính sách / văn bản
```

---

# 5. BLOCK 02 — IDCS LÀM GÌ?

## Mục tiêu

User phải hiểu trong vài giây **IDCS phát triển năng lực công nghiệp bằng 4 trụ cột nào**.

### Eyebrow

**LĨNH VỰC HOẠT ĐỘNG**

### Headline

**Kết nối kỹ thuật, công nghệ và năng lực doanh nghiệp**

### Description

IDCS hỗ trợ doanh nghiệp nâng cao năng lực sản xuất thông qua cải tiến năng suất, giải pháp kỹ thuật và công nghệ, đào tạo nguồn nhân lực và phát triển chuỗi cung ứng.

## 4 core capabilities

### 01. Cải tiến sản xuất & năng suất

- Factory assessment
- Production improvement
- Quality management
- Waste elimination
- Process optimization
- 5S / workplace management
- Productivity improvement

### 02. Kỹ thuật, R&D & chuyển giao công nghệ

- R&D / nghiên cứu ứng dụng
- Reverse engineering
- Engineering
- Prototype / pilot
- CAD / CAM / CAE
- CNC / khuôn mẫu
- Automation
- Technology transfer

### 03. Đào tạo nguồn nhân lực kỹ thuật

- Technical workforce
- Production consultants
- Engineering skills
- Quality / manufacturing training
- Short-term professional training

### 04. Phát triển doanh nghiệp & chuỗi cung ứng

- Supplier development
- Buyer–supplier connection
- FDI supply-chain readiness
- Standards / export readiness
- International cooperation
- SME capability development

## Layout

Ưu tiên structured grid/divider thay vì 4 floating cards giống nhau.

```text
┌─────────────────────┬───────────────────────────┐
│ 01                  │ 02                        │
│ CẢI TIẾN SẢN XUẤT  │ KỸ THUẬT & CÔNG NGHỆ    │
├─────────────────────┼───────────────────────────┤
│ 03                  │ 04                        │
│ ĐÀO TẠO KỸ THUẬT   │ PHÁT TRIỂN CHUỖI CUNG ỨNG│
└─────────────────────┴───────────────────────────┘
```

---

# 6. BLOCK 03 — DỊCH VỤ NỔI BẬT

## Mục tiêu

Trả lời:

> **Doanh nghiệp có thể nhờ IDCS hỗ trợ cụ thể việc gì?**

### Headline

**Giải pháp chuyên môn cho nhu cầu thực tế**

## Working service list

Danh sách này là **content direction**, phải đối chiếu client/codebase trước khi publish:

1. Tư vấn cải tiến sản xuất
2. Tư vấn nâng cao năng suất & chất lượng
3. Dịch vụ đo kiểm / đánh giá kỹ thuật
4. Phát triển nhà cung ứng
5. R&D & chuyển giao công nghệ
6. Thiết kế / chế tạo khuôn mẫu
7. CAD / CAM / CAE / CNC
8. Đào tạo kỹ thuật
9. Hỗ trợ tiêu chuẩn / export readiness
10. Kết nối chuỗi cung ứng

> **Không tự thêm một dịch vụ production nếu client/source hiện tại chưa xác nhận IDCS đang cung cấp dịch vụ đó.**

## Layout đề xuất — Service Explorer

```text
┌────────────────────┬─────────────────────────────────┐
│ Service category   │ SERVICE DETAIL                  │
│ Service category   │ Mô tả                           │
│ Service category   │ Capabilities                    │
│ Service category   │ Evidence / equipment nếu có     │
│                    │ CTA                             │
└────────────────────┴─────────────────────────────────┘
```

Interaction:

- Desktop: nav trái + detail phải
- Tablet: tab/horizontal nav
- Mobile: accordion/stack
- Reuse existing tabs/accordion JS nếu có

CTA:

**Yêu cầu dịch vụ**

---

# 7. BLOCK 04 — ĐÀO TẠO NGẮN HẠN

## Positioning

**Industry-ready / professional training**, không giống danh sách môn học của khoa.

### Headline

**Nâng cao năng lực kỹ thuật cho đội ngũ doanh nghiệp**

### Content directions

- Production improvement
- Quality management
- Mold / tooling
- CAD/CAM/CAE/CNC
- Engineering skills
- Automation / smart manufacturing
- Consultant development
- Technical standards

### Homepage

- 1 featured program
- 2–3 secondary programs
- CTA xem tất cả

### Card fields

```text
Category
Program title
Duration
Format
Audience
CTA
```

> Chỉ hiển thị khóa học/lịch khai giảng thật nếu có source dữ liệu hiện hành.

---

# 8. BLOCK 05 — NĂNG LỰC IDCS

## Mục tiêu

Trả lời:

> **IDCS có nguồn lực nào để giải quyết bài toán doanh nghiệp?**

## Capability dimensions

Ưu tiên:

- Đội ngũ chuyên gia / tư vấn viên
- Kinh nghiệm triển khai doanh nghiệp
- Năng lực kỹ thuật
- Công nghệ
- **Facilities đã được xác nhận**
- **Equipment đã được xác nhận**
- Hệ sinh thái nghiên cứu – đào tạo – chuyển giao IUH
- Quan hệ hợp tác / network đã được xác nhận
- Track record / chương trình đã triển khai

## Layout

```text
IMAGE / VERIFIED FACILITY
+
Capability narrative
+
Verified metrics
+
Capability strip
```

### Metrics

Không fake:

```text
XX doanh nghiệp đã hỗ trợ
XX chương trình
XX chuyên gia
XX thiết bị / lab
```

Chỉ publish khi số liệu có source hiện hành.

## 8.1. FACILITIES RULE — HARD RULE

Chỉ hiển thị facility/lab/equipment khi được xác nhận bởi ít nhất một nguồn phù hợp:

1. Existing codebase/content data
2. Client-provided documents/assets
3. Current official IDCS/IUH source
4. Current official procurement/equipment record nếu wording phù hợp

### Trạng thái bắt buộc

Mỗi facility/equipment item cần xác định:

```text
Operational / Existing
Under development
Planned / Proposed
Unknown / Needs verification
```

### Không được

- Biến quy hoạch dự án thành facility hiện có.
- Dùng facility toàn IUH rồi ghi “IDCS sở hữu”.
- Ghi số lượng lab/equipment không có source.
- Dùng ảnh stock equipment rồi gọi là thiết bị của IDCS.

---

# 9. PLANNED DEVELOPMENT — RESEARCH REFERENCE ONLY

Các tài liệu dự án cũ mô tả định hướng xây dựng Trung tâm tại **Khu Công nghệ cao TP.HCM**, với các không gian/chức năng dự kiến như:

- administration
- R&D workshop
- mechanical engineering
- mold/tooling
- mechatronics
- automation
- new materials
- incubation / enterprise support

Các thông tin này chỉ được dùng dưới nhãn:

```text
Planned
Under development
Project proposal / investment project
```

**Không dùng để viết “IDCS hiện có…” nếu chưa được xác nhận vận hành.**

---

# 10. IUH ECOSYSTEM

Sau khi IDCS nằm trong hệ sinh thái IUH, website có thể thể hiện lợi thế kết nối với năng lực rộng hơn của nhà trường.

Các hướng liên kết có thể nghiên cứu:

- Mechanical Engineering
- Electrical Engineering
- Electronics
- Automotive Engineering
- Automation
- Chemical Engineering
- Textile / Garment
- Applied research
- Technology transfer
- Technical workforce development

Wording an toàn:

> **Kết nối hệ sinh thái đào tạo, nghiên cứu ứng dụng và chuyển giao công nghệ của Đại học Công nghiệp TP.HCM.**

Không viết:

> **IDCS sở hữu toàn bộ lab/equipment của IUH.**

---

# 11. BLOCK 06 — CẢI TIẾN CHẤT LƯỢNG & NĂNG SUẤT

## Mục tiêu

Biến consulting service thành **process/outcome**, không chỉ liệt kê dịch vụ.

### Headline

**Từ hiện trạng sản xuất đến cải tiến có thể đo lường**

## Suggested process

```text
01 ASSESS
Khảo sát hiện trạng
        ↓
02 DIAGNOSE
Phân tích vấn đề / bottleneck
        ↓
03 IMPROVE
Đề xuất & triển khai cải tiến
        ↓
04 STANDARDIZE
Chuẩn hóa quy trình
        ↓
05 SCALE
Đánh giá, duy trì và nhân rộng
```

### Topics/evidence direction

- Factory assessment
- Production management
- Waste elimination
- Industrial Engineering
- Productivity
- Flow improvement
- Quality management
- 5S / workplace management

### Historical research reference

Các chương trình đào tạo/tư vấn trước đây từng sử dụng methodology dạng:

```text
4 Step – 13 Process – 22 Activity
```

**Không gọi đây là “quy trình độc quyền/chuẩn hiện tại của IDCS” nếu client chưa xác nhận.**

---

# 12. BLOCK 07 — CHUYỂN GIAO CÔNG NGHỆ

## Mục tiêu

Thể hiện bridge:

```text
Research → Engineering → Prototype → Pilot → Transfer → Production
```

### Headline

**Đưa giải pháp kỹ thuật từ nghiên cứu vào sản xuất**

## Content directions

- Applied R&D
- Reverse engineering
- Engineering
- Prototype
- Pilot
- Technical transfer
- Production application

## Focus areas — working research categories

Chỉ publish category nếu client/content hiện tại xác nhận:

- Mechanical engineering
- Mold & tooling
- Mechatronics
- Automation
- Electrical/electronics
- New materials

---

# 13. BLOCK 08 — HỖ TRỢ PHÁT TRIỂN CÔNG NGHIỆP

## Mục tiêu

Định vị IDCS như **industrial capability connector**, không phải nơi bán từng service đơn lẻ.

## Sub-pillars

### Supplier Development

Nâng năng lực doanh nghiệp Việt Nam đáp ứng yêu cầu buyer/chuỗi cung ứng.

### Buyer–Supplier Connection

Kết nối doanh nghiệp sản xuất với buyer, FDI và đối tác công nghiệp.

### Standards & Export Readiness

Hỗ trợ doanh nghiệp tiếp cận tiêu chuẩn/chứng nhận/yêu cầu thị trường.

### International Cooperation

Đào tạo, tư vấn, chuyên gia và kết nối quốc tế.

### Enterprise Development

Hỗ trợ SME và capability development.

## “Bạn đang gặp bài toán nào?”

```text
→ Cần nâng cao năng lực nhân sự
→ Cần cải tiến quy trình sản xuất
→ Cần đo kiểm / đánh giá kỹ thuật
→ Cần giải pháp/công nghệ
→ Cần phát triển thành nhà cung ứng
→ Cần chuyên gia tư vấn
```

CTA:

**Gửi nhu cầu cho IDCS**

---

# 14. BLOCK 09 — TIN TỨC & VĂN BẢN

Gộp trên homepage nhưng vẫn giữ content type/sitemap riêng:

- Tin tức / hoạt động / chương trình
- Văn bản pháp luật / chính sách

## Recommended tabs

```text
[ Tin tức & Hoạt động ]
[ Chương trình / Thông báo ]
[ Văn bản pháp luật ]
```

Nếu platform hiện tại chỉ hỗ trợ 2 tabs, giữ:

```text
[ Tin tức ] [ Văn bản pháp luật ]
```

và đưa chương trình/thông báo vào taxonomy Tin tức.

## Legal documents

Không dùng image card.

```text
LOẠI          VĂN BẢN                         NGÀY
Thông tư      ...                             ...
Quyết định    ...                             ...
Nghị định     ...                             ...
```

Reuse:

- news renderer
- document renderer
- tabs
- date helper
- pagination/search nếu có

---

# 15. PROVEN TRACK RECORD — RESEARCH DATA

Các dữ liệu dưới đây dùng làm **research/evidence pool**, phải kiểm tra source/date trước khi đưa lên homepage:

## 15.1. Hỗ trợ doanh nghiệp

Năm 2021, chương trình do IDCS chủ trì lựa chọn **51 doanh nghiệp công nghiệp hỗ trợ khu vực phía Nam** để hỗ trợ kỹ thuật và tư vấn cải tiến sản xuất.

## 15.2. Consultant development / Samsung cooperation

Các chương trình Bộ Công Thương – Samsung giai đoạn trước từng đào tạo hơn 300 tư vấn viên và tư vấn nhiều doanh nghiệp; IDCS tham gia tổ chức/triển khai các khóa ở khu vực phía Nam.

> Không gán toàn bộ số liệu chương trình quốc gia là thành tích riêng IDCS nếu source không nói rõ.

## 15.3. Supplier-development / industry programs

Historical activity areas đã xuất hiện trong các chương trình:

- production improvement
- textile/garment & footwear supporting industry
- supplier development
- export readiness
- mold engineering
- technical consultant development
- international trade/investment connection

## 15.4. VITASK / international cooperation

Historical cooperation có nội dung liên quan:

- automotive
- mold/tooling
- components
- electrical/electronics
- technical support
- workforce development
- Vietnam–Korea enterprise connection

**Logo/partner name usage phải theo rule ở section Partner.**

---

# 16. PARTNERS / LOGOS RULE

Historical cooperation references có thể bao gồm:

- Samsung
- VITASK
- Korean technical experts/programs
- Industrial enterprises / associations

Nhưng:

```text
Do not automatically display partner logos.
```

Logo chỉ dùng khi có:

- client-approved asset
- existing codebase asset
- current official cooperation source phù hợp
- quyền/brand guideline phù hợp

Không dùng logo để tạo cảm giác “current strategic partner” nếu chỉ có historical activity.

---

# 17. HOMEPAGE VISUAL RHYTHM

Không để 8 section cùng một kiểu card.

| Block | Background | Layout type |
|---|---|---|
| 02 IDCS làm gì | White | 2×2 structured capability grid |
| 03 Dịch vụ nổi bật | Light neutral | Interactive service explorer |
| 04 Đào tạo ngắn hạn | White | Featured + programs |
| 05 Năng lực IDCS | Soft gray | Evidence + verified facility/capability |
| 06 Cải tiến CL & NS | Dark navy | Process timeline |
| 07 Chuyển giao CN | White | Content + pipeline |
| 08 Hỗ trợ phát triển CN | Light blue | Supplier/supply-chain ecosystem |
| 09 Tin tức & văn bản | White | Editorial + tabs |

---

# 18. VISUAL SYSTEM

## Color

Ưu tiên design token IUH hiện có.

Nếu cần:

- IUH primary blue
- Deep navy
- White
- Soft gray
- Light blue
- Neutral text

**Không hard-code palette mới nếu codebase đã có CSS variables/token system.**

## Typography

Reuse typography system hiện có:

```text
Eyebrow
Section heading
Section description
Service title
Body
Meta
CTA
```

## Image direction

Ưu tiên:

- real IDCS/IUH industrial activity
- engineers
- manufacturing
- technical consulting
- measurement/testing
- machining / tooling
- automation
- research / prototype
- corporate training
- supplier-development workshops

Tránh:

- generic office stock
- student-lifestyle image không liên quan
- SaaS illustration
- ảnh thiết bị không phải IDCS nhưng caption như asset thực

---

# 19. RESPONSIVE PRINCIPLES

## Desktop

- Wide layout.
- Breathing space.
- Explorer/process/pipeline hiển thị đầy đủ.

## Tablet

- 2-column → 1-column khi cần.
- Explorer → tabs/horizontal nav.
- Process không overflow.

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

| Desktop | Mobile |
|---|---|
| 2×2 capability | 1 column |
| Service explorer | Tabs / Accordion |
| Horizontal process | Vertical process |
| Evidence + media | Media → evidence |
| Supply-chain diagram | Simplified stack |
| News feature + list | Featured → stacked list |

---

# 20. ACCESSIBILITY

Tối thiểu:

- semantic heading order
- keyboard usable
- visible focus
- semantic link/button
- accessible tabs/accordion
- meaningful alt text
- không phụ thuộc chỉ màu
- `prefers-reduced-motion`
- adequate contrast

---

# 21. CONTENT MODEL GỢI Ý

Ưu tiên schema hiện có của platform nếu đã có.

## Service

```json
{
  "id": "",
  "title": "",
  "shortDescription": "",
  "description": "",
  "image": "",
  "href": "",
  "capabilities": [],
  "status": "verified"
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

## Capability

```json
{
  "title": "",
  "description": "",
  "evidence": "",
  "status": "verified"
}
```

## Facility / Equipment

```json
{
  "name": "",
  "type": "facility",
  "status": "operational",
  "source": "",
  "image": "",
  "description": ""
}
```

Allowed `status`:

```text
operational
under-development
planned
needs-verification
```

## News

Reuse platform schema.

## Legal Document

Reuse platform/document schema.

---

# 22. COMPONENT / BLOCK MAPPING

Working names only:

```text
idcs-capability-grid
idcs-service-explorer
idcs-training
idcs-capabilities
idcs-consulting-process
idcs-technology-transfer
idcs-industrial-support
idcs-updates
```

Trước khi tạo mới, search:

```text
feature-grid
service
tabs
accordion
cards
stats
timeline
process
news
documents
media
cta
```

Decision rule:

```text
Reuse → Extend → Shared Variant → IDCS-only New
```

---

# 23. IMPLEMENTATION TRACKER

| Block | Existing facility | Decision | Files changed | Data/source verified | Status |
|---|---|---|---|---|---|
| 02 IDCS làm gì |  | Reuse / Extend / New |  |  | TODO |
| 03 Dịch vụ nổi bật |  | Reuse / Extend / New |  |  | TODO |
| 04 Đào tạo ngắn hạn |  | Reuse / Extend / New |  |  | TODO |
| 05 Năng lực IDCS |  | Reuse / Extend / New |  |  | TODO |
| 06 Cải tiến CL & NS |  | Reuse / Extend / New |  |  | TODO |
| 07 Chuyển giao CN |  | Reuse / Extend / New |  |  | TODO |
| 08 Hỗ trợ phát triển CN |  | Reuse / Extend / New |  |  | TODO |
| 09 Tin tức & văn bản |  | Reuse / Extend / New |  |  | TODO |

---

# 24. CONTENT GUARDRAILS — HARD RULES

1. **Current organization:** ưu tiên source IUH hiện tại; không mô tả IDCS hiện đang trực thuộc Cục Công nghiệp nếu không có historical context.
2. **IDCS ≠ IDC:** không trộn nội dung của Trung tâm Hỗ trợ phát triển công nghiệp tại Hà Nội.
3. **Không invent lab/machine/equipment/certification.**
4. **Planned facility ≠ operational facility.**
5. Trước khi tạo `Facilities / Equipment / Numbers`, phải đọc:
   - codebase
   - data/content files
   - client docs
   - current official source
6. **IUH-wide capability ≠ IDCS-owned asset.**
7. Historical program phải ghi đúng date/context.
8. Historical partner ≠ current official partner nếu chưa xác nhận.
9. Không fake metric để lấp UI production.
10. Không dùng stock image như bằng chứng facility thực tế.
11. Ưu tiên industrial capability/outcome hơn institutional marketing copy.
12. Dịch vụ production phải map được về sitemap/client/source hiện tại.
13. Số liệu cũ có thể dùng làm track record nhưng phải kiểm tra scope: chương trình quốc gia, Cục Công nghiệp hay riêng IDCS.
14. Content chưa xác minh phải có trạng thái `needs-verification`, không silently publish.
15. Nếu source hiện tại mâu thuẫn source cũ, ghi chú và ưu tiên source mới hơn.

---

# 25. DEFINITION OF DONE

Một block chỉ hoàn tất khi:

- [ ] Bám đúng sitemap/customer requirement.
- [ ] Đã audit facility/component trong codebase.
- [ ] Không duplicate component/helper có sẵn.
- [ ] Content hierarchy rõ.
- [ ] Content/source đã phân loại verified / needs verification.
- [ ] Không biến planned facility thành operational facility.
- [ ] Không gán IUH-wide asset cho IDCS.
- [ ] Desktop đúng layout.
- [ ] Tablet ổn.
- [ ] Mobile ổn.
- [ ] Keyboard usable.
- [ ] Không regression global style.
- [ ] Không phá module/faculty khác.
- [ ] Build pass.
- [ ] Lint/test pass nếu project có.
- [ ] Asset path hợp lệ.
- [ ] Internal links hợp lệ.
- [ ] Không hard-code production data nếu platform có data layer.
- [ ] Không fake metrics/content.
- [ ] Visual vẫn thuộc hệ sinh thái IUH.

---

# 26. WORKFLOW CHO AI / DEV

```text
STEP 1
Read repository docs

STEP 2
Confirm current IUH module architecture

STEP 3
Inspect current page + nearest reusable faculty examples

STEP 4
Audit shared facilities/components/helpers

STEP 5
Audit IDCS content/assets/data already in codebase

STEP 6
Classify content:
verified / historical / planned / needs-verification

STEP 7
Record Reuse / Extend / New decisions

STEP 8
Implement one block at a time

STEP 9
Test desktop / tablet / mobile / keyboard

STEP 10
Build + regression check

STEP 11
Update implementation tracker and facility tracker
```

---

# 27. RESEARCH REFERENCES — WORKING SOURCES

> Đây là source list để team kiểm tra content. Trước khi publish số liệu/claim quan trọng, mở lại source và xác minh wording/date.

## Current IUH

- IDCS unit page:  
  https://iuh.edu.vn/vi/trung-tam-ky-thuat-ho-tro-phat-trien-cong-nghiep-khu-vuc-phia-nam.html

- IUH direct units:  
  https://iuh.edu.vn/vi/cac-don-vi-truc-thuoc.html

## Historical / Ministry of Industry and Trade

- MOIT IDCS page / historical organizational context:  
  https://moit.gov.vn/don-vi-quan-ly-nha-nuoc/khoi-tong-cuc-cuc/cuc-cong-nghiep/trung-tam-ky-thuat-ho-tro-phat-trien-cong-nghiep-khu-vuc-phia-nam

- 51 supporting-industry enterprises technical support / production improvement:  
  https://moit.gov.vn/khoa-hoc-va-cong-nghe/51-doanh-nghiep-cong-nghiep-ho-tro-phia-nam-duoc-ho-tro-ho-tro-ky-thuat-tu-van-cai-tien-san-xuat.html

- 2024 program/equipment procurement reference:  
  https://moit.gov.vn/upload/2005517/20240517/QD_1009_0001_61fa4.pdf

- 2025 supporting-industry program reference:  
  https://moit.gov.vn/upload/2005517/fck/files/QD_1080_0001_34dc7.pdf

## Source usage rule

```text
Current organizational claim → current IUH source first
Historical program → source at time of program
Facility/equipment → current confirmed source/client/codebase
Planned project → explicitly label planned/under development
```

---

# 28. FINAL HOMEPAGE DIRECTION

```text
01 HERO
   Positioning + primary CTA

02 IDCS LÀM GÌ?
   4 core industrial capabilities

03 DỊCH VỤ NỔI BẬT
   Service Explorer

04 ĐÀO TẠO NGẮN HẠN
   Industry-ready Training

05 NĂNG LỰC IDCS
   Experts + Evidence + Verified Technology/Facilities + IUH Ecosystem

06 CẢI TIẾN CHẤT LƯỢNG & NĂNG SUẤT
   Assess → Diagnose → Improve → Standardize → Scale

07 CHUYỂN GIAO CÔNG NGHỆ
   Research → Engineering → Prototype → Pilot → Transfer → Production

08 HỖ TRỢ PHÁT TRIỂN CÔNG NGHIỆP
   Supplier → Buyer → Standards → Global Supply Chain

09 TIN TỨC & VĂN BẢN
   News + Programs + Policies + Legal Documents
```

## Core message

Website phải khiến doanh nghiệp hiểu:

> **IDCS không chỉ cung cấp khóa học hay một dịch vụ kỹ thuật đơn lẻ; IDCS là đầu mối hỗ trợ doanh nghiệp nâng cao năng lực sản xuất, phát triển công nghệ và tham gia sâu hơn vào chuỗi cung ứng công nghiệp.**
