## ADDED Requirements

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
