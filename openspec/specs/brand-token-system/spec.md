# brand-token-system Specification

## Purpose
Defines the CSS variable-based brand color token system for per-faculty theming with Tailwind v3 opacity modifier support.

## Requirements
### Requirement: Brand tokens defined trong Tailwind config
`tailwind.config.js` SHALL define `brand.*` color tokens sử dụng CSS variable format tương thích với Tailwind v3 opacity modifier syntax.

Token names: `brand.primary`, `brand.accent`, `brand.tint`, `brand.surface`.
Format: `"rgb(var(--color-brand-{name}) / <alpha-value>)"`.

#### Scenario: Brand token classes compile thành CSS đúng
- **WHEN** component dùng class `bg-brand-primary`
- **THEN** compiled CSS chứa `background-color: rgb(var(--color-brand-primary))`

#### Scenario: Opacity modifier hoạt động với brand tokens
- **WHEN** component dùng class `bg-brand-primary/40`
- **THEN** compiled CSS chứa `background-color: rgb(var(--color-brand-primary) / 0.4)`

#### Scenario: Text, border, shadow đều support brand tokens
- **WHEN** component dùng `text-brand-primary`, `border-brand-accent`, `shadow-brand-primary/20`
- **THEN** tất cả compile thành CSS với CSS variable references đúng

### Requirement: CSS variable defaults trong main.scss
`src/styles/main.scss` SHALL định nghĩa `:root` block với default values cho 4 brand CSS variables dưới dạng space-separated RGB integers.

Default values (Khoa Khoa học Sức khoẻ):
- `--color-brand-primary`: `21 56 152` (#153898)
- `--color-brand-accent`: `249 178 0` (#F9B200)
- `--color-brand-tint`: `142 216 248` (#8ED8F8)
- `--color-brand-surface`: `227 246 253` (#E3F6FD)

#### Scenario: Default colors render đúng khi không inject faculty colors
- **WHEN** page load mà không có faculty-specific CSS variable override
- **THEN** brand colors hiển thị đúng màu KKSK (navy blue #153898, yellow #F9B200)

### Requirement: Per-faculty CSS variables injected vào head
Build system SHALL inject `<style>:root{...}</style>` block vào `<head>` của mỗi page với CSS variable values tương ứng với `faculty.json.colors`.

Hex colors từ `faculty.json` SHALL được convert sang space-separated RGB integers trước khi inject.

#### Scenario: Faculty với custom primary color
- **WHEN** `faculty.json` có `"colors": {"brand-primary": "#1a6b3c", ...}` và page được build
- **THEN** `<head>` của HTML chứa `--color-brand-primary: 26 107 60;`

#### Scenario: CSS variable override default
- **WHEN** faculty-injected `:root` block và main.scss `:root` defaults đều tồn tại
- **THEN** faculty-injected block (trong `<head>`) override main.scss defaults (trong linked CSS) vì specificity/order

### Requirement: Tailwind content paths include faculties
`tailwind.config.js` content array SHALL include `"./src/faculties/**/*.{html,js}"` để Tailwind không purge brand token classes dùng trong faculty override components.

#### Scenario: Class trong faculty component không bị purge
- **WHEN** `src/faculties/information-tech/components/intro/index.html` dùng `bg-brand-primary`
- **THEN** class này được giữ lại trong compiled CSS output

### Requirement: Instruction file enforce brand token usage
`.agents/instructions/design-system.instructions.md` SHALL document rules phân biệt khi dùng `brand-*` tokens vs legacy `primary-dark-blue` tokens.

#### Scenario: Instruction file active cho đúng file patterns
- **WHEN** agent làm việc với file trong `src/**/*.{html,js,scss}`
- **THEN** instruction file `applyTo` pattern match và rules được apply
