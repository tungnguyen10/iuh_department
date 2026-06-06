## ADDED Requirements

### Requirement: Canonical Asset Path Convention
All HTML asset references in source files SHALL use absolute paths with a leading slash (`/assets/...`). Bare relative paths (`assets/...`) MUST NOT be used in source HTML.

#### Scenario: Component uses absolute asset path
- **WHEN** a component HTML file references an asset image or SVG
- **THEN** the `src`, `data-image`, `data-photo-src`, `srcset`, `data-featured-image`, or `data-overlayIcon` attribute SHALL begin with `/assets/`

#### Scenario: Bare relative path rejected by convention
- **WHEN** a developer writes `src="assets/svgs/icon.svg"` without a leading slash
- **THEN** it SHALL be considered non-conforming and MUST be normalized to `src="/assets/svgs/icon.svg"`

### Requirement: Pipeline Handles Both Path Formats
The `transformDataInclude` plugin SHALL rewrite both `/assets/...` and bare `assets/...` paths with the correct base prefix, as a defense-in-depth measure.

#### Scenario: Absolute asset path rewritten with base
- **WHEN** HTML contains `src="/assets/svgs/logo.svg"` and base is `/health-science/`
- **THEN** the pipeline SHALL rewrite it to `src="/health-science/assets/svgs/logo.svg"`

#### Scenario: Bare relative asset path also rewritten with base
- **WHEN** HTML contains `src="assets/svgs/logo.svg"` and base is `/health-science/`
- **THEN** the pipeline SHALL rewrite it to `src="/health-science/assets/svgs/logo.svg"`

#### Scenario: Root base path preserved
- **WHEN** base is `/` and HTML contains either `/assets/...` or `assets/...`
- **THEN** the pipeline SHALL produce `/assets/...` (no double slash, no empty prefix)
