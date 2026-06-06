## MODIFIED Requirements

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

### Requirement: Build pipeline does not break existing pages
The multi-faculty build pipeline changes to `vite.config.js` SHALL NOT break build of any existing page in `src/pages/` when `VITE_FACULTY` defaults to `health-science`.

#### Scenario: All existing pages build successfully after vite.config changes
- **WHEN** `yarn build` is run without `VITE_FACULTY` set (defaults to health-science)
- **THEN** all 14 existing HTML pages build without error and match current output structure

#### Scenario: Data-include resolution unchanged for @components/ alias
- **WHEN** existing components use `data-include="@components/..."` after vite.config refactor
- **THEN** resolution behavior is identical to pre-refactor
