# site-runtime-stability Specification

## Purpose
Defines runtime and tooling stability rules for documented local workflows, base-path-safe behavior, and regression checks across the multi-faculty site.

## Requirements
### Requirement: Canonical Local Toolchain
The project SHALL document and support a single canonical local toolchain that can run OpenSpec and Vite builds with the supported Node version and package manager. Per-faculty build commands SHALL be documented alongside the standard build command.

Documented faculties SHALL match the `src/faculties/` directory list. When a faculty is added or removed, README and `.agents/instructions/multi-faculty.instructions.md` SHALL be updated in the same change.

#### Scenario: Build command uses supported runtime
- **WHEN** a developer follows the documented build instructions
- **THEN** the build runs with Node 20.19+ or Node 22.12+ and completes successfully

#### Scenario: Unsupported npm path is not presented as equivalent
- **WHEN** the repository uses Yarn PnP artifacts without package binaries in `node_modules`
- **THEN** README does not present `npm run build` as equally supported unless npm support is restored

#### Scenario: Per-faculty build documented
- **WHEN** a developer wants to build a specific faculty
- **THEN** README documents `VITE_FACULTY={faculty-id} yarn build` or the equivalent `yarn build:{faculty-id}` script

#### Scenario: Documented faculty list matches source
- **WHEN** a faculty is added or removed in `src/faculties/`
- **THEN** README and `.agents/instructions/multi-faculty.instructions.md` reflect the change in the same commit

### Requirement: Multi-faculty smoke test khi them khoa moi
When a new faculty is added, a smoke test SHALL verify:

1. `yarn build:{new-faculty}` exits successfully.
2. `dist/{new-faculty}/index.html` and other non-excluded pages exist.
3. Built HTML contains the new faculty identity, not another faculty's identity.
4. Injected brand color variables match the faculty's `faculty.json`.
5. Nav labels and count match the faculty config.
6. Shared pages do not contain hardcoded identity text from another faculty.

#### Scenario: Khoa moi build thanh cong lan dau
- **WHEN** `src/faculties/dormitory-management/faculty.json` is created and `yarn build:dormitory-management` runs
- **THEN** the build succeeds and `dist/dormitory-management/` exists with pages

#### Scenario: Khoa moi render dung identity
- **WHEN** `dist/dormitory-management/index.html` is opened or served
- **THEN** the HTML contains `Phòng Quản Lý Ký Túc Xá` in identity slots and does not contain Health Science identity text there

#### Scenario: Brand colors khong bi leak tu khoa khac
- **WHEN** `dormitory-management` is built with colors distinct from Health Science
- **THEN** the injected `<style>` block contains Dormitory Management RGB values, not Health Science values

### Requirement: OpenSpec Command Compatibility
The project SHALL document how to run OpenSpec commands with a supported Node runtime when the default shell Node is incompatible.

#### Scenario: List changes succeeds
- **WHEN** a developer follows the documented OpenSpec command path
- **THEN** `openspec list --json` returns valid change JSON instead of failing with a runtime incompatibility error

### Requirement: Search Modal Interactivity
The global search modal SHALL bind input, clear, and keyboard events when initialized.

#### Scenario: Search input performs query
- **WHEN** a user opens the search modal and types a non-empty query
- **THEN** the modal loads search data, filters results, and shows either results or the empty state

#### Scenario: Clear button resets search
- **WHEN** a user clicks the clear button after entering a query
- **THEN** the modal clears the input and returns to the initial state

### Requirement: Base-Path Safe Data Loading
Runtime data fetches and dev server asset serving SHALL respect the configured base path. The dev server `fs.allow` SHALL permit access to project source files regardless of generated workspace root location.

#### Scenario: Search data under subpath
- **WHEN** the site is built with `VITE_BASE_PATH=/iuh/test/`
- **THEN** search data is fetched from `/iuh/test/data/search-data.json`

#### Scenario: Quiz data under subpath
- **WHEN** the site is built with `VITE_BASE_PATH=/iuh/test/`
- **THEN** quiz data is fetched from `/iuh/test/data/quiz-data.json`

#### Scenario: Dev server serves assets from src directory
- **WHEN** the dev server root is a generated workspace directory
- **AND** a request maps to a file under `src/assets/`
- **THEN** the server serves the file without a 403 error

### Requirement: Base-Path Safe Navigation and Assets
Internal navigation, document links, and custom asset attributes SHALL either be base-path-safe or explicitly documented as root-only.

#### Scenario: Subpath build does not emit root-only internal links
- **WHEN** the site is built with `VITE_BASE_PATH=/iuh/test/`
- **THEN** generated internal links and asset references needed for normal navigation do not point to the domain root unless intentionally external or documented root-only

### Requirement: Single Page Script Injection
The layout system SHALL inject page-specific scripts at most once per page.

#### Scenario: Page declares script metadata
- **WHEN** a page uses `LAYOUT: script`
- **THEN** generated HTML contains exactly one script tag for that page-specific script

### Requirement: Single Initialization Path
Runtime components initialized by `src/main.js` SHALL avoid unguarded auto-initialization on module import.

#### Scenario: Component is dynamically imported by main
- **WHEN** `src/main.js` imports and initializes a component based on DOM presence
- **THEN** that component does not attach duplicate listeners, observers, or handlers due to import-time auto-init

### Requirement: Documentation Matches Runtime Architecture
The README SHALL describe the actual layout, component injection, and runtime initialization architecture.

#### Scenario: Developer follows component guidance
- **WHEN** a developer reads README component initialization guidance
- **THEN** the documented pattern matches the lazy selector-based initialization used by `src/main.js`

### Requirement: Placeholder Content Cleanup
Visible placeholder content and wrong-domain data discovered in audits SHALL be replaced with relevant domain content or clearly disabled non-final states.

#### Scenario: Public search data is domain relevant
- **WHEN** search results are loaded from `public/data/search-data.json`
- **THEN** result titles and excerpts are relevant to the active site rather than unrelated examples

#### Scenario: News cards do not show lorem ipsum
- **WHEN** news cards and carousels render
- **THEN** users do not see `Lorem ipsum` placeholder copy

#### Scenario: Placeholder links are not misleading
- **WHEN** a link has no real destination
- **THEN** it is replaced with a valid route, removed, or rendered as a disabled/non-navigating control

### Requirement: Build pipeline does not break existing pages
Multi-faculty build pipeline changes SHALL NOT break existing pages when `VITE_FACULTY` defaults to `health-science`.

#### Scenario: All existing pages build successfully after vite.config changes
- **WHEN** `yarn build` runs without `VITE_FACULTY`
- **THEN** all existing HTML pages build without error and match the current output structure

#### Scenario: Data-include resolution unchanged for @components alias
- **WHEN** existing components use `data-include="@components/..."`
- **THEN** resolution behavior remains unchanged
