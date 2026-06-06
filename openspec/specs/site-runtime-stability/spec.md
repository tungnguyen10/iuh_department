# site-runtime-stability Specification

## Purpose
TBD - created by archiving change stabilize-site-runtime-tooling. Update Purpose after archive.
## Requirements
### Requirement: Canonical Local Toolchain
The project SHALL document and support a single canonical local toolchain that can run OpenSpec and Vite builds with the supported Node version and package manager. Per-faculty build commands (`VITE_FACULTY={id} yarn build`) SHALL be documented alongside the standard build command.

#### Scenario: Build command uses supported runtime
- **WHEN** a developer follows the documented build instructions
- **THEN** the build SHALL run with Node 20.19+ or Node 22.12+ and SHALL complete successfully

#### Scenario: Unsupported npm path is not presented as equivalent
- **WHEN** the repository uses Yarn PnP artifacts without package binaries in `node_modules`
- **THEN** README instructions MUST NOT present `npm run build` as an equally supported command unless npm support is restored

#### Scenario: Per-faculty build documented
- **WHEN** a developer wants to build a specific faculty
- **THEN** README SHALL document `VITE_FACULTY={faculty-id} yarn build` or equivalent `yarn build:{faculty-id}` script syntax

### Requirement: OpenSpec Command Compatibility
The project SHALL document how to run OpenSpec commands with a supported Node runtime when the default shell Node is incompatible.

#### Scenario: List changes succeeds
- **WHEN** a developer follows the documented OpenSpec command path
- **THEN** `openspec list --json` SHALL return valid change JSON instead of failing with an ESM syntax error

### Requirement: Search Modal Interactivity
The global search modal SHALL bind input, clear, and keyboard events when initialized.

#### Scenario: Search input performs query
- **WHEN** a user opens the search modal and types a non-empty query
- **THEN** the modal SHALL load search data, filter results, and show either results or the empty state

#### Scenario: Clear button resets search
- **WHEN** a user clicks the clear button after entering a query
- **THEN** the modal SHALL clear the input and return to the initial state

### Requirement: Base-Path Safe Data Loading
Runtime data fetches and dev server asset serving SHALL respect the configured base path. The dev server `fs.allow` SHALL permit access to all project source files regardless of the generated workspace root location.

#### Scenario: Search data under subpath
- **WHEN** the site is built with `VITE_BASE_PATH=/iuh/test/`
- **THEN** search data SHALL be fetched from `/iuh/test/data/search-data.json`

#### Scenario: Quiz data under subpath
- **WHEN** the site is built with `VITE_BASE_PATH=/iuh/test/`
- **THEN** quiz data SHALL be fetched from `/iuh/test/data/quiz-data.json`

#### Scenario: Dev server serves assets from src directory
- **WHEN** the dev server root is set to a generated workspace directory (e.g., `.tmp/faculty-build/`)
- **AND** a request maps to a file under `src/assets/`
- **THEN** the server SHALL serve the file without a 403 Forbidden error

### Requirement: Base-Path Safe Navigation and Assets
Internal navigation, document links, and custom asset attributes SHALL either be base-path safe or explicitly documented as root-only.

#### Scenario: Subpath build does not emit root-only internal links
- **WHEN** the site is built with `VITE_BASE_PATH=/iuh/test/`
- **THEN** generated internal links and asset references needed for normal navigation SHALL not point to the domain root unless intentionally external or documented root-only

### Requirement: Single Page Script Injection
The layout system SHALL inject page-specific scripts at most once per page.

#### Scenario: Page declares script metadata
- **WHEN** a page uses `LAYOUT: script`
- **THEN** the generated HTML SHALL contain exactly one script tag for that page-specific script

### Requirement: Single Initialization Path
Runtime components initialized by `src/main.js` SHALL avoid unguarded auto-initialization on module import.

#### Scenario: Component is dynamically imported by main
- **WHEN** `src/main.js` imports and initializes a component based on DOM presence
- **THEN** that component SHALL NOT attach duplicate listeners, observers, or image handlers due to import-time auto-init

### Requirement: Documentation Matches Runtime Architecture
The README SHALL describe the actual layout, component injection, and runtime initialization architecture.

#### Scenario: Developer follows component guidance
- **WHEN** a developer reads README component initialization guidance
- **THEN** the documented pattern SHALL match the lazy selector-based initialization used by `src/main.js`

### Requirement: Placeholder Content Cleanup
Visible placeholder content and wrong-domain data discovered in the audit SHALL be replaced with IUH health-science relevant content or clearly disabled non-final states.

#### Scenario: Public search data is domain relevant
- **WHEN** search results are loaded from `public/data/search-data.json`
- **THEN** result titles and excerpts SHALL be relevant to the IUH health-science site rather than unrelated IT or MBA examples

#### Scenario: News cards do not show lorem ipsum
- **WHEN** news cards and carousels render
- **THEN** users SHALL NOT see `Lorem ipsum` placeholder copy

#### Scenario: Placeholder links are not misleading
- **WHEN** a link has no real destination
- **THEN** it SHALL either be replaced with an existing route, removed, or rendered as a non-navigating disabled/control state

### Requirement: Build pipeline does not break existing pages
The multi-faculty build pipeline changes to `vite.config.js` SHALL NOT break build of any existing page in `src/pages/` when `VITE_FACULTY` defaults to `health-science`.

#### Scenario: All existing pages build successfully after vite.config changes
- **WHEN** `yarn build` is run without `VITE_FACULTY` set (defaults to health-science)
- **THEN** all 14 existing HTML pages build without error and match current output structure

#### Scenario: Data-include resolution unchanged for @components/ alias
- **WHEN** existing components use `data-include="@components/..."` after vite.config refactor
- **THEN** resolution behavior is identical to pre-refactor

