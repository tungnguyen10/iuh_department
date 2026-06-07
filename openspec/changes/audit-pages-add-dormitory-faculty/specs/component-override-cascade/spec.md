## MODIFIED Requirements

### Requirement: @faculty/ alias resolve với shared fallback
Vite build system SHALL resolve `@faculty/` prefix trong `data-include` attributes theo priority: faculty-specific component trước, shared component làm fallback.

```
@faculty/intro/index.html
  → src/faculties/{FACULTY}/components/intro/index.html  (nếu file tồn tại)
  → src/components/intro/index.html                       (fallback)
```

Resolution scope CHỈ áp dụng cho HTML files include qua `data-include` attribute. JS modules và SCSS files KHÔNG được resolve qua `@faculty/` prefix — component logic và styles luôn được share giữa các khoa.

#### Scenario: Faculty có component override
- **WHEN** `data-include="@faculty/intro/index.html"` và `src/faculties/health-science/components/intro/index.html` tồn tại
- **THEN** faculty-specific component được include (không phải shared)

#### Scenario: Faculty không có override dùng shared fallback
- **WHEN** `data-include="@faculty/news/index.html"` và faculty không có `components/news/`
- **THEN** `src/components/news/index.html` được include thay thế

#### Scenario: @components/ alias không bị ảnh hưởng
- **WHEN** `data-include="@components/common/breadcrumb.html"`
- **THEN** luôn resolve về `src/components/common/breadcrumb.html`, không bị intercept bởi @faculty/ logic

#### Scenario: JS module không resolve qua @faculty/
- **WHEN** code chứa `import('@faculty/foo.js')` hoặc tương tự
- **THEN** Vite KHÔNG resolve qua faculty cascade; behavior giống module path bình thường (thường fail/throw)
