# Stats Card Component

Thẻ thống kê với animation đếm số và hiệu ứng hover.

## Features

- ✅ **Number Counting Animation**: Đếm từ 0 lên số mục tiêu khi component xuất hiện
- ✅ **Hover State**: Background đổi màu dark blue, text đổi trắng, số đổi vàng
- ✅ **Intersection Observer**: Chỉ chạy animation khi card vào viewport (tối ưu performance)
- ✅ **Reusable**: Có thể dùng nhiều lần với props khác nhau
- ✅ **Responsive**: Tự động adapt với màn hình

## Usage

### HTML

```html
<!-- Single Stats Card -->
<div data-include="@components/common/stats-card.html"
  data-count="2500"
  data-suffix="+"
  data-bgImage="/assets/images/stats-bg.jpg"
  data-icon="/assets/svgs/student-icon.svg"
  data-iconAlt="Sinh viên"
  data-description="Sinh viên đang theo học">
</div>

<!-- Multiple Cards in Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Card 1 -->
  <div data-include="@components/common/stats-card.html"
    data-count="2500"
    data-suffix="+"
    data-bgImage="/assets/images/students-bg.jpg"
    data-icon="/assets/svgs/student-icon.svg"
    data-iconAlt="Sinh viên"
    data-description="Sinh viên đang theo học">
  </div>

  <!-- Card 2 -->
  <div data-include="@components/common/stats-card.html"
    data-count="150"
    data-suffix="+"
    data-bgImage="/assets/images/faculty-bg.jpg"
    data-icon="/assets/svgs/teacher-icon.svg"
    data-iconAlt="Giảng viên"
    data-description="Giảng viên giàu kinh nghiệm">
  </div>

  <!-- Card 3 -->
  <div data-include="@components/common/stats-card.html"
    data-count="50"
    data-suffix="+"
    data-bgImage="/assets/images/programs-bg.jpg"
    data-icon="/assets/svgs/book-icon.svg"
    data-iconAlt="Chương trình"
    data-description="Chương trình đào tạo">
  </div>

  <!-- Card 4 -->
  <div data-include="@components/common/stats-card.html"
    data-count="95"
    data-suffix="%"
    data-bgImage="/assets/images/graduate-bg.jpg"
    data-icon="/assets/svgs/graduation-icon.svg"
    data-iconAlt="Tốt nghiệp"
    data-description="Tỷ lệ có việc làm">
  </div>
</div>
```

### JavaScript

Import và khởi tạo trong page JS:

```javascript
import { initStatsCards } from '@components/common/stats-card.js'

document.addEventListener('components-loaded', () => {
  initStatsCards()
})
```

## Props

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `count` | number | Yes | Số mục tiêu để đếm tới | `2500` |
| `suffix` | string | No | Ký tự đuôi (+ , % , K, etc.) | `+` hoặc `%` |
| `bgImage` | string | Yes | URL ảnh background | `/assets/images/bg.jpg` |
| `icon` | string | Yes | URL icon SVG/PNG | `/assets/svgs/icon.svg` |
| `iconAlt` | string | Yes | Alt text cho icon | `Sinh viên` |
| `description` | string | Yes | Mô tả văn bản | `Sinh viên đang theo học` |

## States

### Default State
- Background: `bg-primary-white`
- Icon: Dark blue filter
- Description text: `text-gray`
- Number: `text-primary-dark-blue`
- Shadow: `shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)]`

### Hover State
- Background: `bg-primary-dark-blue/90`
- Icon: White filter
- Description text: `text-white`
- Number: `text-primary-yellow`
- Smooth transition: 500ms

## Animation Details

- **Duration**: 2 giây
- **FPS**: 60 frames/giây
- **Trigger**: Khi 50% card vào viewport
- **Format**: Tự động thêm dấu phẩy ngăn cách (2,500)
- **One-time**: Mỗi card chỉ chạy animation 1 lần

## Technical Notes

- Sử dụng **Intersection Observer API** để detect visibility
- Đánh dấu `data-counted="true"` sau khi đã đếm để tránh re-trigger
- Không cần jQuery hay external library
- Pure JavaScript với performance tối ưu
- Auto-imported CSS qua main.js glob pattern

## File Structure

```
src/components/common/
├── stats-card.html      # Component HTML template
├── stats-card.js        # Counting animation logic
├── stats-card.scss      # Component styles
└── README.md           # This file
```
