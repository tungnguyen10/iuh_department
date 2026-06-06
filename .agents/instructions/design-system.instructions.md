---
applyTo: "src/**/*.{html,js,scss}"
---

# IUH Department — Design System

> **Tailwind CSS version: `^3.4.17` — KHÔNG dùng v4 syntax.**
> CSS variable color format phải là `"rgb(var(--token) / <alpha-value>)"` (v3 standard).
> Không dùng `@theme`, `oklch()`, hay bất kỳ syntax nào chỉ có trong Tailwind v4.

Đây là nguồn sự thật duy nhất cho design tokens và usage rules. Không hardcode giá trị màu, kích thước, shadow ngoài những gì được định nghĩa ở đây.

---

## 1. Color System

### 1.1 System Tokens — dùng trực tiếp tên token

Không thay đổi giữa các khoa. Dùng trực tiếp tên class Tailwind:

| Token | Value | Class example | Dùng cho |
|-------|-------|---------------|----------|
| `title` | #212121 | `text-title` | Heading, page title |
| `black` | #616161 | `text-black` | Body text |
| `gray` | #757575 | `text-gray` | Muted / secondary text |
| `gray-light` | #FAFAFA | `bg-gray-light` | Page bg, card inner bg |
| `stroke` | #EEEEEE | `border-stroke` | Dividers, card borders |
| `primary-white` | #FFFFFF | `text-primary-white` | Text on dark backgrounds |
| `danger` | #DD2F2C | `text-danger`, `bg-danger` | Error state |
| `danger-light` | #FFEBEEFF | `bg-danger-light` | Error background |
| `secondary-green` | #75C7A3 | `text-secondary-green` | Success / health accent |
| `secondary-yellow` | #FFE293 | `bg-secondary-yellow` | Warning / highlight bg |
| `secondary-yellow-light` | #FEF9E3 | `bg-secondary-yellow-light` | Warning background |

### 1.2 Brand Tokens — bắt buộc dùng `brand-*` cho component mới

Thay đổi theo từng khoa. Giá trị được inject từ `faculty.json` vào CSS variable khi build.

```
bg-brand-primary      → Màu chủ đạo (header, primary button, active nav)
text-brand-primary    → Text màu chủ đạo
border-brand-primary  → Border màu chủ đạo
bg-brand-accent       → Màu nhấn (hover CTA, badge, highlight)
bg-brand-tint         → Màu tint nhẹ (icon bg, tag bg, pagination)
bg-brand-surface      → Nền section nhẹ (research bg, topbar, input focus)
```

**Opacity modifier hỗ trợ đầy đủ** — format RGB được dùng để Tailwind v3 opacity hoạt động:

```html
✅ bg-brand-primary/40     → rgba với opacity 40%
✅ bg-brand-primary/8      → rgba với opacity 8% (overlay nhẹ)
✅ text-brand-primary/80
✅ shadow-brand-primary/20
```

**Tailwind config syntax (v3):**
```js
// ✅ Đúng — Tailwind v3
"rgb(var(--color-brand-primary) / <alpha-value>)"

// ❌ Sai — chỉ dùng được trong Tailwind v4
oklch(var(--color-brand-primary))
@theme { --color-brand-primary: ... }
```

**Rules:**
```
✅ Dùng trong component mới hoặc faculty override:
   bg-brand-primary, text-brand-primary, border-brand-primary
   bg-brand-accent, bg-brand-tint, bg-brand-surface

❌ KHÔNG dùng trong component mới:
   bg-primary-dark-blue   (chỉ dùng trong shared/legacy component)
   bg-[#153898]           (hardcode hex)
   bg-secondary-blue-light (dùng bg-brand-surface thay thế)
```

**Legacy shared components** (`src/components/`) vẫn giữ `primary-dark-blue` — đây là màu KKSK, sẽ refactor khi cần override ở khoa khác.

---

## 2. Typography

### Font families

```
font-sans / font-roboto  → Roboto (default cho body, buttons, labels)
font-inter               → Inter (headings, section titles)
```

### Type scale (mobile-first)

| Class | px | Dùng cho |
|-------|----|----------|
| `text-xs` | 12 | Label, tag, caption |
| `text-sm` | 14 | Secondary text, nav link, breadcrumb |
| `text-base` | 16 | Body, button text |
| `text-lg` | 18 | Subheading (mobile) |
| `text-xl` | 20 | Subheading (desktop) |
| `text-2xl` | 24 | Section title (mobile) |
| `text-3xl` | 30 | Section title (desktop) |
| `text-[32px]` | 32 | Large hero title |

**Không dùng arbitrary size trừ `text-[15px]`** (article body — đặc thù) và `text-[32px]` (hero title).

### Font weight

| Weight | Class | Dùng cho |
|--------|-------|----------|
| 400 | `font-normal` | Body text, paragraph |
| 500 | `font-medium` | Button, label, nav link |
| 600 | `font-semibold` | Subheading, card title |
| 700 | `font-bold` | Section title, page title |
| 800 | `font-extrabold` | Logo text only |

### Standard text patterns

```html
<!-- Section title -->
<h2 class="font-inter font-bold text-2xl md:text-[32px] text-title">

<!-- Card title -->
<h3 class="font-inter font-semibold text-base md:text-lg text-title line-clamp-2">

<!-- Body paragraph -->
<p class="font-roboto font-normal text-base md:text-lg text-black leading-relaxed">

<!-- Label / caption -->
<span class="font-roboto font-medium text-xs md:text-sm text-gray">

<!-- Article body -->
<div class="font-roboto font-normal text-[15px] md:text-base leading-relaxed text-black">
```

---

## 3. Layout & Spacing

### Section wrapper (standard)

```html
<section class="w-full py-8 md:py-14">
  <div class="container mx-auto px-4">
    <!-- content -->
  </div>
</section>
```

### Section với background

```html
<!-- Brand surface bg -->
<section class="w-full py-8 md:py-14 bg-brand-surface">

<!-- Dark bg (header area) -->
<section class="w-full py-8 md:py-14 bg-brand-primary text-primary-white">
```

### Main content + sidebar layout

```html
<section class="container mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-12 md:gap-8">
  <div class="flex-1 w-full lg:w-9/12"><!-- Main --></div>
  <div class="w-full lg:w-3/12 shrink-0"><!-- Sidebar --></div>
</section>
```

### Gap scale

```
gap-2 / gap-2.5 / gap-3   → Element nhỏ (icon + text, tag list)
gap-4 / gap-5              → Card grid, form fields
gap-6 / gap-8              → Section nội bộ
gap-10 / gap-12            → Major section divisions
```

### Card padding

```
p-2 md:p-2.5    → Tight card (partner logo, thumbnail)
p-3 md:p-4      → Standard card
p-4 md:p-5      → Comfortable card
p-6 md:p-8      → CTA box / featured card
```

---

## 4. Shadow System

Dùng arbitrary shadow (không dùng shadow-sm/md/lg Tailwind mặc định):

```
shadow-[1px_1px_6px_0_rgba(0,0,0,0.06)]               → Subtle card
shadow-[1px_1px_10px_0_rgba(21,56,152,0.15)]           → Default card
shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)]            → Hover card
shadow-[4px_8px_30px_0_rgba(21,56,152,0.35)]           → Modal / elevated
shadow-[0_4px_12px_rgba(253,185,19,0.3)]               → Accent glow
shadow-[inset_0px_0px_20px_0px_rgba(142,216,248,0.80)] → Section inset glow
```

**Khi làm component mới** cho faculty override, thay hardcode RGBA của primary-dark-blue bằng:
```
rgba(var(--color-brand-primary), 0.2)   → CSS variable aware
```

---

## 5. Border & Rounding

```
border border-stroke          → Card outline (default)
border border-brand-primary   → Focused / active state
rounded-[5px]                 → Input, small element
rounded-lg / rounded-[8px] / rounded-[10px]  → Card, container
rounded-xl                    → Search box, input group
rounded-2xl                   → Modal, CTA box
rounded-full                  → Button, avatar, badge
```

---

## 6. Transitions & Animations

### Standard transitions

```
transition-colors duration-200   → Color-only change (hover text/bg)
transition-all duration-300      → Standard (border, shadow, opacity)
transition-all duration-500 ease-in-out  → Smooth (button, expand)
```

### Custom animations (định nghĩa trong tailwind.config.js)

```
animate-jelly        → Elastic bounce (button click)
animate-pop          → Quick scale pulse (success action)
animate-shake        → Error vibration (form validation fail)
animate-success-pulse → Glow ring (success state)
animate-flash-badge  → Badge flash (new notification)
```

### Arbitrary animations (inline)

```html
animate-[float_4s_ease-in-out_infinite]   → Floating decoration
animate-[spin_20s_linear_infinite]        → Slow bg rotation
```

---

## 7. Breakpoints

```
sm:  640px   → Nhỏ nhất (ít dùng)
md:  768px   → PRIMARY breakpoint — hầu hết responsive dùng đây
lg:  1024px  → Desktop layout switch (flex-col → flex-row)
xl:  1120px  → Desktop nav (header)
2xl: 1280px  → Container max-width
```

Pattern chuẩn: `class-mobile md:class-desktop` — hiếm khi cần 3 breakpoint.
