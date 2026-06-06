---
applyTo: "src/**/*.{html,js}"
---

# IUH Department — Component Patterns

Các pattern chuẩn để tạo component mới. Tất cả component dùng `data-include` system — được resolve ở build time bởi Vite plugin.

---

## 1. Cách dùng Component (`data-include`)

```html
<!-- Include component với data props -->
<div data-include="@components/common/section-title.html"
     data-title="Tên section"
     data-subtitle="Badge nhỏ bên trên"
     data-description="Mô tả ngắn"
     data-title-class="text-title"
     data-class="flex flex-col gap-3">
</div>

<!-- @components/ = src/components/  (shared)  -->
<!-- @faculty/    = src/faculties/{FACULTY}/components/  nếu tồn tại, fallback src/components/ -->
```

**Props truyền qua `data-*`** → component đọc bằng `{{propName}}` (camelCase của attribute name bỏ `data-`):
- `data-title` → `{{title}}`
- `data-title-class` → `{{titleClass}}`
- `data-image` → `{{image}}`

---

## 2. Section Title Component

```html
<div data-include="@components/common/section-title.html"
     data-title="Tiêu đề chính"
     data-subtitle="Badge nhỏ"
     data-description="Mô tả dưới tiêu đề"
     data-title-class="text-title"
     data-subtitle-class="text-brand-primary"
     data-description-class="text-gray"
     data-class="flex flex-col gap-3">
</div>
```

**Khi tiêu đề nằm trên nền tối** (`bg-brand-primary`):
```html
data-title-class="text-primary-white"
data-description-class="text-primary-white opacity-90 line-clamp-none"
```

---

## 3. Button Component

8 variants, tất cả dùng `data-include="@components/button/button.html"`:

```html
<!-- Variant 4: Primary CTA (dark bg + white text) -->
<div data-include="@components/button/button.html"
     data-variant="4"
     data-url="/contact.html"
     data-text="Liên hệ ngay"
     data-icon="/assets/svgs/icon-arrow-right.svg"
     data-class="w-fit">
</div>

<!-- Variant 6: Accent CTA (yellow bg) -->
<div data-include="@components/button/button.html"
     data-variant="6"
     data-url="/contact.html"
     data-text="Liên hệ hợp tác">
</div>

<!-- Variant 8: Outline (white bg + border) -->
<div data-include="@components/button/button.html"
     data-variant="8"
     data-url="/document.pdf"
     data-text="Tải tài liệu"
     data-icon="/assets/svgs/icon-download.svg"
     data-download="download"
     data-class="w-fit">
</div>
```

| Variant | Style | Dùng khi |
|---------|-------|----------|
| 1 | Surface blue, hover yellow | Secondary action trên nền trắng |
| 2 | Surface yellow, hover dark | Secondary action dạng warning |
| 3 | Surface blue, hover dark | Tertiary |
| 4 | **Brand primary, hover accent** | Primary CTA (dùng nhiều nhất) |
| 5 | Danger light, hover danger | Destructive action |
| 6 | **Accent (yellow), hover surface** | Featured / standout CTA |
| 7 | Brand primary full-width | Form submit |
| 8 | Outline, hover fill | Download / secondary trên nền tối |

---

## 4. Card Pattern

### Standard Article Card

```html
<article class="group relative bg-primary-white border border-stroke rounded-[10px]
               overflow-hidden p-2 md:p-2.5
               hover:border-brand-tint hover:rounded-[8px] md:hover:rounded-lg
               hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)]
               transition-all duration-300 cursor-pointer">
  <!-- Thumbnail -->
  <div class="relative aspect-[16/9] rounded-[8px] overflow-hidden mb-2.5">
    <img src="{{image}}" alt="{{imageAlt}}"
         class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
  </div>
  <!-- Meta -->
  <div class="flex items-center gap-2 mb-1.5">
    <span class="font-roboto font-medium text-xs text-primary-white bg-brand-primary
                 px-2 py-0.5 rounded-full">{{category}}</span>
    <span class="text-xs text-gray">{{date}}</span>
  </div>
  <!-- Title -->
  <h3 class="font-inter font-semibold text-sm md:text-base text-title
             line-clamp-2 leading-snug group-hover:text-brand-primary
             transition-colors duration-200">
    {{title}}
  </h3>
</article>
```

### Partner Logo Card

```html
<div class="group bg-primary-white border border-stroke rounded-[10px] p-4 md:p-5
            flex items-center justify-center aspect-[3/2] overflow-hidden
            hover:border-brand-tint hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)]
            transition-all duration-300">
  <a href="{{link}}" target="_blank" rel="noopener">
    <img src="{{image}}" alt="{{alt}}"
         class="w-full h-full object-contain filter grayscale group-hover:grayscale-0
                transition-all duration-500">
  </a>
</div>
```

---

## 5. Section Wrapper

### Standard section

```html
<section data-module="{{moduleName}}" class="w-full py-8 md:py-14 {{class}}">
  <div class="container mx-auto px-4">
    <!-- Section Title -->
    <div data-include="@components/common/section-title.html"
         data-title="..."
         data-class="mb-6 md:mb-8"
         data-title-class="text-title">
    </div>
    <!-- Content -->
  </div>
</section>
```

### Section trên nền brand surface

```html
<section data-module="{{moduleName}}" class="w-full py-8 md:py-14 bg-brand-surface">
  <div class="container mx-auto px-4">
    <div data-include="@components/common/section-title.html"
         data-title="..."
         data-title-class="text-title text-center">
    </div>
  </div>
</section>
```

### CTA Box (nền tối brand primary)

```html
<div class="bg-brand-primary rounded-2xl p-6 md:p-8 text-primary-white">
  <div class="flex flex-col gap-6">
    <div data-include="@components/common/section-title.html"
         data-title="..."
         data-description="..."
         data-title-class="text-primary-white"
         data-description-class="text-primary-white opacity-90 line-clamp-none"
         data-class="flex flex-col gap-3">
    </div>
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Buttons -->
    </div>
  </div>
</div>
```

---

## 6. Breadcrumb

Tất cả inner pages dùng breadcrumb ở đầu `<main>`:

```html
<div data-include="@components/common/breadcrumb.html"
     data-parent-page1="Trang chủ"
     data-parent-link1="/"
     data-parent-page2="Tên mục cha"
     data-parent-link2="/parent.html"
     data-current-page="Trang hiện tại">
</div>
```

---

## 7. Page Layout (inner pages)

```html
<section class="container mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-12 md:gap-8">
  <!-- Main Content: 9/12 -->
  <div class="flex-1 w-full lg:w-9/12 flex flex-col gap-6 md:gap-10">
    <!-- Breadcrumb đặt ngoài section này, trước section -->
    <!-- Content -->
  </div>

  <!-- Sidebar: 3/12 -->
  <div class="w-full lg:w-3/12 shrink-0 flex flex-col gap-6 md:gap-8">
    <div data-include="@components/sidebar/news.html" data-class="w-full"></div>
    <div data-include="@components/sidebar/announcements.html" data-class="w-full"></div>
    <div data-include="@components/sidebar/videos.html" data-class="w-full"></div>
  </div>
</section>
```

---

## 8. Filter Tabs

```html
<div class="tabs-container">
  <div class="tabs-nav flex gap-2 border-b border-stroke overflow-x-auto">
    <button class="tab-btn active text-gray border-b-2 border-transparent
                   px-4 md:px-5 py-2 md:py-2.5
                   font-roboto font-medium text-sm md:text-base
                   transition-colors duration-200 whitespace-nowrap"
            data-tab="all">
      Tất cả
    </button>
    <!-- Thêm tab-btn nữa với data-tab="category-id" -->
  </div>
  <div class="tabs-content mt-6 md:mt-8">
    <div class="tab-panel" data-tab-panel="all">
      <!-- Grid content -->
    </div>
    <div class="tab-panel hidden" data-tab-panel="category-id">
      <!-- Hidden panels -->
    </div>
  </div>
</div>
```

Active class được xử lý bởi `src/js/` tab logic — không cần JS mới.

---

## 9. Grid Layouts

### Partner / Logo grid

```html
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
```

### News card grid

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
```

### Stats grid

```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
```

---

## 10. Image Overlay Gradient

Dùng khi overlay text trên ảnh:

```html
<div class="relative aspect-[16/9] rounded-xl overflow-hidden">
  <img src="..." class="w-full h-full object-cover">
  <!-- Gradient overlay từ trong suốt → brand primary -->
  <div class="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/30 to-transparent">
  </div>
  <div class="absolute bottom-0 left-0 p-4 text-primary-white">
    <!-- Text content -->
  </div>
</div>
```
