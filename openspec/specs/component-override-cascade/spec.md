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
