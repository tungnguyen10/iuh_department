# IUH Faculty Website Architecture Standard

## Mục tiêu

Xây dựng một codebase duy nhất để triển khai nhiều website khoa.

Yêu cầu:

* Tái sử dụng tối đa source hiện có.
* Không nhân bản project cho từng khoa.
* Không chuyển sang framework mới (React/Vue/Next).
* Giữ mô hình HTML + Component + SCSS + Vanilla JS hiện tại.
* Build độc lập cho từng khoa.
* Component dùng chung chỉ tồn tại một nơi.
* Khoa nào có tính năng riêng thì chỉ ảnh hưởng khoa đó.
* Dễ onboarding cho developer mới.
* Dễ maintain trong 2-3 năm tiếp theo.

---

# Nguyên tắc kiến trúc

## 1. Shared First

Mặc định mọi thứ phải được xem là Shared.

Chỉ khi chứng minh được:

* chỉ một khoa sử dụng
* hoặc có khả năng cao không tái sử dụng

thì mới được đặt vào Faculty.

### Sai

```text
components/
  health/
  it/
  economics/
```

### Đúng

```text
shared/
  components/
```

---

## 2. Faculty Owns Content

Faculty sở hữu:

* page
* data
* image
* document
* module đặc thù

Faculty không sở hữu:

* button
* modal
* breadcrumb
* pagination
* header
* footer
* typography
* utility

---

## 3. Không Fork Component

Không tạo:

```text
news-card-health.html
news-card-it.html
news-card-business.html
```

Nếu UI giống 80-90%:

```text
shared/components/news-card
```

và truyền data khác nhau.

---

## 4. Config Trước, Override Sau

Thứ tự ưu tiên:

```text
Config
↓
Variant
↓
Override
```

Không được nhảy thẳng tới Override.

---

# Structure chuẩn

```text
src/

├── shared/
│
├── assets/
│   ├── fonts/
│   ├── images/
│   └── svgs/
│
├── components/
│
│   ├── layout/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── loading/
│   │   └── search-modal/
│
│   ├── common/
│   │   ├── breadcrumb/
│   │   ├── pagination/
│   │   ├── divider/
│   │   ├── section-title/
│   │   ├── article-title/
│   │   └── article-detail/
│
│   ├── cards/
│   │   ├── news-card/
│   │   ├── partner-card/
│   │   ├── event-card/
│   │   └── lecturer-card/
│
│   └── features/
│       ├── modal/
│       ├── tabs/
│       ├── search/
│       └── pdf-viewer/
│
├── layouts/
│   └── default.html
│
├── styles/
│   ├── main.scss
│   ├── typography.scss
│   ├── article.scss
│   └── forms.scss
│
├── js/
│   ├── utils.js
│   ├── loading.js
│   ├── svg-loader.js
│   └── global-widgets.js
│
└── faculties/
```

---

# Faculty Structure

Ví dụ:

```text
faculties/

├── health-science/
│
├── faculty.config.js
│
├── pages/
│   ├── index.html
│   ├── about.html
│   ├── majors.html
│   ├── major-detail.html
│   ├── news.html
│   ├── news-detail.html
│   ├── leadership.html
│   ├── leadership-detail.html
│   ├── students.html
│   ├── partners.html
│   ├── contact.html
│   └── document-detail.html
│
├── data/
│   ├── majors.json
│   ├── leadership.json
│   ├── news.json
│   ├── partners.json
│   └── search-data.json
│
├── assets/
│   ├── images/
│   ├── svgs/
│   └── documents/
│
├── components/
│
│   ├── home/
│   │   ├── carousel/
│   │   ├── intro/
│   │   ├── admission/
│   │   ├── research/
│   │   └── industry-careers/
│
│   └── special/
│
├── styles/
│   └── faculty.scss
│
└── js/
    └── faculty.js
```

---

# Rule Cho Components

## Shared Component

Nếu từ 2 khoa trở lên dùng:

```text
shared/components/
```

Ví dụ:

```text
header
footer
button
breadcrumb
pagination
news-card
```

---

## Faculty Component

Nếu chỉ một khoa dùng:

```text
faculties/<faculty>/components/
```

Ví dụ:

```text
health-major-quiz
traditional-medicine-banner
```

---

## Promotion Rule

Nếu component Faculty được khoa thứ hai sử dụng:

PHẢI chuyển lên Shared.

Ví dụ:

```text
faculties/health/components/major-quiz
```

Sau này CNTT dùng lại:

```text
shared/components/major-quiz
```

---

# Rule Cho Assets

## Shared Assets

```text
logo IUH
font
icon hệ thống
background mặc định
social icons
```

Đặt trong:

```text
shared/assets/
```

---

## Faculty Assets

```text
banner khoa
ảnh giảng viên
logo đối tác
ảnh phòng thí nghiệm
```

Đặt trong:

```text
faculties/<faculty>/assets/
```

---

# Rule Cho Pages

Page luôn thuộc Faculty.

Không tạo:

```text
shared/pages/
```

Lý do:

Mặc dù layout giống nhau nhưng content ownership thuộc Faculty.

Ví dụ:

```text
faculties/health/pages/about.html
faculties/it/pages/about.html
```

Đều dùng:

```text
shared header
shared footer
shared breadcrumb
shared article layout
```

nhưng page vẫn nằm trong Faculty.

---

# Build Strategy

## Build Theo Faculty

Ví dụ:

```bash
FACULTY=health-science yarn build
```

hoặc

```bash
yarn build --faculty=health-science
```

---

## Build Scope

Chỉ lấy:

```text
shared/*
+
faculties/health-science/*
```

Không bundle:

```text
faculties/it/*
faculties/economics/*
```

---

## Output

```text
dist/
```

chỉ chứa website của Faculty đang build.

---

# Những Điều Cấm

## Không tạo Faculty Branch Architecture

Sai:

```text
components/
  health/
  business/
  it/
```

Điều này sẽ dẫn đến:

* duplicate code
* khó maintain
* khó fix bug hàng loạt

---

## Không copy component để sửa nhẹ

Sai:

```text
news-card-v2
news-card-health
news-card-it
```

Nếu khác nhẹ:

* thêm variant
* thêm config

Không tạo component mới.

---

## Không override page khi chưa thử config

Thứ tự:

```text
Data
↓
Config
↓
Variant
↓
Override
```

Override là lựa chọn cuối cùng.

---

# Nguyên Tắc Maintain

Khi thêm khoa mới:

1. Tạo faculty folder.
2. Tạo pages.
3. Thêm assets.
4. Thêm data.
5. Reuse shared component.
6. Chỉ tạo faculty component nếu thật sự cần.
7. Nếu component được khoa thứ hai sử dụng -> promote lên shared.

---

# Kết luận

Codebase phải được xem là:

```text
Shared Platform
+
Faculty Modules
```

Không phải:

```text
Faculty Projects
```

Đây là khác biệt quan trọng nhất.

Mục tiêu cuối cùng là:

Một bug sửa một lần.

Một component sửa một lần.

Một design update áp dụng cho toàn bộ các khoa.
