# component-override-cascade Specification

## Purpose
Defines the `@faculty/` alias resolution mechanism for component overrides and the conventions for faculty-specific components.
## Requirements
### Requirement: @faculty alias resolve voi shared fallback
Vite build SHALL resolve `@faculty/` paths in `data-include` attributes by checking the faculty-specific component first, then falling back to the shared component.

```
@faculty/intro/index.html
  -> src/faculties/{FACULTY}/components/intro/index.html
  -> src/components/intro/index.html
```

This resolution scope applies only to HTML includes through `data-include`. JS modules and SCSS files are not resolved through the faculty cascade.

#### Scenario: Faculty co component override
- **WHEN** `data-include="@faculty/intro/index.html"` and `src/faculties/health-science/components/intro/index.html` exists
- **THEN** the faculty-specific component is included

#### Scenario: Faculty khong co override dung shared fallback
- **WHEN** `data-include="@faculty/news/index.html"` and the faculty has no `components/news/`
- **THEN** `src/components/news/index.html` is included

#### Scenario: @components alias khong bi anh huong
- **WHEN** `data-include="@components/common/breadcrumb.html"`
- **THEN** it always resolves to `src/components/common/breadcrumb.html`

#### Scenario: JS module khong resolve qua @faculty
- **WHEN** code uses `import('@faculty/foo.js')`
- **THEN** Vite does not apply the faculty cascade to that module path

### Requirement: Faculty override component dung brand tokens
Component HTML files in `src/faculties/{id}/components/` SHALL use `brand-*` Tailwind tokens instead of hardcoded shared brand colors.

#### Scenario: Faculty override component render dung mau
- **WHEN** `src/faculties/information-tech/components/intro/index.html` uses `bg-brand-primary`
- **THEN** the rendered section uses that faculty's `--color-brand-primary`

#### Scenario: Opacity modifier trong faculty component
- **WHEN** a faculty component uses `bg-brand-primary/40`
- **THEN** CSS output uses the faculty-specific RGB variable with the requested opacity

### Requirement: Faculty-specific section khong co shared equivalent
Faculties SHALL be able to create entirely new section components with no shared equivalent and include them in faculty pages.

#### Scenario: Faculty them section dac thu
- **WHEN** `src/faculties/information-tech/components/labs/index.html` exists and is included in that faculty's `pages/index.html`
- **THEN** the Information Technology build includes the labs section and other faculties are unaffected

### Requirement: Instruction files active cho component development
Instruction files for components and design system rules SHALL target the correct `src/` paths so automated editing follows the expected conventions.

#### Scenario: Agent tao faculty override component follow dung patterns
- **WHEN** an agent creates a file under `src/faculties/{id}/components/`
- **THEN** the relevant instruction files are applied and brand-token rules are followed

### Requirement: Faculty override không trùng byte-for-byte với shared
File trong `src/faculties/{X}/components/<name>/` SHALL NOT có nội dung trùng byte-for-byte với `src/components/<name>/` tương ứng. Nếu faculty muốn dùng identical với shared, faculty SHALL xoá file override để cascade tự fallback về shared.

Lý do: file trùng tạo dead code, gây nhầm lẫn về cascade resolution, và làm rối review khi shared thay đổi (faculty override không tự update).

#### Scenario: Faculty override khác shared (hợp lệ)
- **WHEN** `src/faculties/dormitory-management/components/intro/index.html` có markup khác shared (vd dùng brand-* tokens, content riêng)
- **THEN** override hợp lệ; cascade dùng faculty version

#### Scenario: Faculty override trùng shared (vi phạm)
- **WHEN** `src/faculties/health-science/components/intro/index.html` có hash giống `src/components/intro/index.html`
- **THEN** vi phạm quy ước; faculty override SHALL được xoá để cascade fallback shared

#### Scenario: Sau khi xoá duplicate override, cascade hoạt động
- **WHEN** xoá `src/faculties/health-science/components/intro/index.html` (file đã trùng shared)
- **AND** chạy `yarn build:health-science`
- **THEN** build hoàn thành; `dist/health-science/index.html` chứa intro section render từ `src/components/intro/index.html` (không thiếu, không lỗi)

### Requirement: Section component có wrapper chuẩn
Component HTML là 1 page section (intro, news, industry-partnerships, research, partners, industry-careers, infrastructure, ...) SHALL dùng wrapper pattern:

```html
<section data-module="<name>" class="w-full py-* md:py-* {{class}}">
  <div class="container mx-auto px-4">
    <!-- nội dung section -->
  </div>
</section>
```

Yêu cầu:
- Root element là `<section>` (không phải `<div>` trừ khi có lý do semantic).
- Có `data-module="<name>"` để JS module-manager nhận diện.
- Có vertical padding (`py-8 md:py-14` hoặc tương đương) để tách khỏi section liền kề.
- Có `container mx-auto px-4` (hoặc cùng cấp) để align content vào grid của trang.
- Có `{{class}}` placeholder để consume `data-class` từ page-level include.

#### Scenario: industry-partnerships dùng wrapper chuẩn
- **WHEN** xem `src/components/industry-partnerships/index.html`
- **THEN** root element là `<section data-module="industry-partnerships" class="w-full py-8 md:py-14 {{class}}">` với `<div class="container mx-auto px-4">` bên trong

#### Scenario: Section render với spacing đúng trên dormitory homepage
- **WHEN** dormitory `pages/index.html` include `industry-partnerships` qua `data-include="@components/industry-partnerships/index.html"`
- **THEN** section "Kết nối doanh nghiệp" có vertical padding ≥ 32px trên mobile, ≥ 56px trên desktop, và content căn theo container width (không tràn full viewport)

