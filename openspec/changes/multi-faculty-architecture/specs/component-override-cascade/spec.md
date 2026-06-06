## ADDED Requirements

### Requirement: @faculty/ alias resolve với shared fallback
Vite build system SHALL resolve `@faculty/` prefix trong `data-include` attributes theo priority: faculty-specific component trước, shared component làm fallback.

```
@faculty/intro/index.html
  → src/faculties/{FACULTY}/components/intro/index.html  (nếu file tồn tại)
  → src/components/intro/index.html                       (fallback)
```

#### Scenario: Faculty có component override
- **WHEN** `data-include="@faculty/intro/index.html"` và `src/faculties/health-science/components/intro/index.html` tồn tại
- **THEN** faculty-specific component được include (không phải shared)

#### Scenario: Faculty không có override dùng shared fallback
- **WHEN** `data-include="@faculty/news/index.html"` và faculty không có `components/news/`
- **THEN** `src/components/news/index.html` được include thay thế

#### Scenario: @components/ alias không bị ảnh hưởng
- **WHEN** `data-include="@components/common/breadcrumb.html"`
- **THEN** luôn resolve về `src/components/common/breadcrumb.html`, không bị intercept bởi @faculty/ logic

### Requirement: Faculty override component dùng brand tokens
Component HTML files trong `src/faculties/{X}/components/` SHALL dùng `brand-*` Tailwind tokens thay vì hardcoded `primary-dark-blue` hay `primary-yellow`.

#### Scenario: Faculty override component render đúng màu
- **WHEN** `src/faculties/information-tech/components/intro/index.html` dùng `bg-brand-primary`
- **THEN** rendered section hiển thị với `--color-brand-primary` của CNTT (không phải màu KKSK cứng)

#### Scenario: Opacity modifier trong faculty component
- **WHEN** faculty component dùng `bg-brand-primary/40`
- **THEN** CSS output có `rgb(var(--color-brand-primary) / 0.4)` với giá trị faculty-specific

### Requirement: Faculty-specific section (không có shared equivalent)
Faculty SHALL có thể tạo section component hoàn toàn mới không tồn tại trong shared, reference nó trong faculty's `pages/index.html`.

#### Scenario: Faculty thêm section đặc thù
- **WHEN** `src/faculties/information-tech/components/labs/index.html` tồn tại và được include trong CNTT's `pages/index.html`
- **THEN** CNTT build include labs section; KKSK build không bị ảnh hưởng

### Requirement: Instruction files active cho component development
`.agents/instructions/components.instructions.md` và `design-system.instructions.md` SHALL có `applyTo` patterns đúng để agent tự động follow rules khi làm việc với files trong `src/`.

#### Scenario: Agent tạo faculty override component follow đúng patterns
- **WHEN** agent tạo file trong `src/faculties/{X}/components/`
- **THEN** instruction files được load và brand token rules được follow
