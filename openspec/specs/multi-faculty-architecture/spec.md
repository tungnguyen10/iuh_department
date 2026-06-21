## Purpose

Defines the shared platform and faculty module architecture for the IUH static faculty website, including selected-faculty build behavior, ownership rules, cleanup expectations, and Health Science baseline preservation.

## Requirements

### Requirement: Shared Platform And Faculty Module Source Layout
The repository SHALL organize reusable website platform code under `src/shared` and faculty-owned website code under `src/faculties/<faculty>`.

#### Scenario: Shared platform roots exist
- **WHEN** the multi-faculty architecture migration is complete
- **THEN** reusable layouts, shared components, shared styles, shared JavaScript utilities, shared fonts, and shared generic assets SHALL have canonical source locations under `src/shared`

#### Scenario: Faculty module roots exist
- **WHEN** the `health-science` faculty has been migrated
- **THEN** its pages, faculty data, faculty documents, faculty images, faculty-specific components, faculty styles, and faculty JavaScript SHALL have canonical source locations under `src/faculties/health-science`

#### Scenario: Old single-site roots are not canonical
- **WHEN** a source category has been migrated into `src/shared` or `src/faculties/health-science`
- **THEN** the old single-site source root for that category MUST either be removed or documented as a temporary compatibility path with a cleanup task

### Requirement: Faculty Owns Pages
All website pages SHALL belong to a faculty module rather than a shared pages directory.

#### Scenario: Health Science pages move to faculty ownership
- **WHEN** the current Health Science pages are migrated
- **THEN** every current page from `src/pages` SHALL be present under `src/faculties/health-science/pages`

#### Scenario: Shared pages are not introduced
- **WHEN** a developer adds a new faculty page
- **THEN** the page MUST be placed under `src/faculties/<faculty>/pages` and MUST NOT be placed under `src/shared/pages`

#### Scenario: Page migration preserves route output
- **WHEN** the `health-science` faculty build runs after page migration
- **THEN** the generated routes for the current Health Science pages SHALL remain available unless an explicit route change is documented

### Requirement: Faculty-Aware Build Selection
The build system SHALL support building exactly one selected faculty website from the shared platform plus the selected faculty module.

#### Scenario: Build selected Health Science faculty
- **WHEN** a developer runs `FACULTY=health-science yarn build`
- **THEN** the build SHALL use shared sources and `src/faculties/health-science` sources to produce the Health Science website

#### Scenario: Build excludes non-selected faculty sources
- **WHEN** additional faculty modules exist and a developer builds `FACULTY=health-science`
- **THEN** pages, data, assets, and faculty-specific components from non-selected faculties MUST NOT be included in the Health Science build

#### Scenario: Missing faculty is rejected
- **WHEN** a developer requests a faculty id that has no matching `src/faculties/<faculty>` directory
- **THEN** the build SHALL fail with a clear error naming the missing faculty id

#### Scenario: Existing root deployment behavior remains supported
- **WHEN** the Health Science faculty is built without a non-root `VITE_BASE_PATH`
- **THEN** the generated site SHALL continue to work for the existing root deployment assumption

### Requirement: Component Ownership Classification
Components SHALL be classified as shared or faculty-owned using the architecture standard before or during migration.

#### Scenario: Shared component placement
- **WHEN** a component is reusable across faculties or represents platform UI such as header, footer, button, modal, breadcrumb, pagination, typography, tabs, or search
- **THEN** the component SHALL be placed under `src/shared/components`

#### Scenario: Faculty component placement
- **WHEN** a component is specific to one faculty's content, homepage composition, or domain-specific module behavior
- **THEN** the component SHALL be placed under `src/faculties/<faculty>/components`

#### Scenario: Component is not forked for minor differences
- **WHEN** two faculties need the same component with minor text, image, icon, or layout differences
- **THEN** the implementation MUST prefer data, config, and variants before creating a separate component

#### Scenario: Faculty component promotion
- **WHEN** a faculty-owned component is reused by a second faculty
- **THEN** the component SHALL be promoted to `src/shared/components` and both faculties SHALL consume the shared version

### Requirement: Asset Ownership Classification
Assets SHALL be classified as shared or faculty-owned based on reuse and content ownership.

#### Scenario: Shared asset placement
- **WHEN** an asset is a font, IUH/system logo, generic system icon, generic default image, favicon, or social icon used by the platform
- **THEN** the asset SHALL be placed under `src/shared/assets`

#### Scenario: Faculty asset placement
- **WHEN** an asset is a faculty banner, activity image, lab image, partner logo, faculty-specific major background, faculty document, or faculty-owned photo
- **THEN** the asset SHALL be placed under `src/faculties/<faculty>/assets`

#### Scenario: Output URL compatibility
- **WHEN** a faculty-owned asset or document is moved from an old source location
- **THEN** the selected faculty build SHALL either preserve the existing public output URL or document the public URL change explicitly

### Requirement: Faculty Data Ownership
Runtime data for faculty content SHALL belong to the selected faculty module while preserving runtime data loading behavior.

#### Scenario: Health Science data source ownership
- **WHEN** search, quiz, message, or faculty content data is migrated
- **THEN** the canonical source data SHALL live under `src/faculties/health-science/data`

#### Scenario: Runtime data remains loadable
- **WHEN** the Health Science site is built and a user opens search or major quiz features
- **THEN** the runtime SHALL fetch the selected faculty data successfully using base-path-safe URLs

#### Scenario: Public data root is not canonical after migration
- **WHEN** faculty data has been migrated into `src/faculties/<faculty>/data`
- **THEN** `public/data` MUST NOT remain the canonical editable source for that faculty data

### Requirement: Faculty Runtime Configuration
Faculty-specific runtime modules SHALL be declared by the selected faculty instead of being hard-coded into the shared runtime.

#### Scenario: Shared runtime has no faculty-specific module imports
- **WHEN** the faculty runtime configuration phase is complete
- **THEN** `src/main.js` MUST NOT contain hard-coded imports for Health Science-specific homepage or feature modules

#### Scenario: Faculty config declares module initializers
- **WHEN** a faculty-specific component requires runtime initialization
- **THEN** the selected faculty configuration SHALL declare the selector, import target, and init function required to initialize that module

#### Scenario: Shared global features remain shared
- **WHEN** the site initializes at runtime
- **THEN** shared global features such as header, footer, loading, search modal, SVG inlining, article actions, PDF fallback, and global widgets SHALL continue to initialize from shared runtime code

#### Scenario: Components initialize once
- **WHEN** the selected faculty site loads a page
- **THEN** shared and faculty component initializers MUST NOT attach duplicate event listeners, observers, or handlers due to mixed import paths

### Requirement: Temporary Compatibility Is Explicit And Removed
Temporary aliases, fallback resolvers, bridge directories, or duplicated paths SHALL be treated as migration tools with explicit cleanup conditions.

#### Scenario: Temporary alias has cleanup owner
- **WHEN** a temporary alias such as `@components` is retained during migration
- **THEN** the change tasks MUST identify why it exists, which phase owns it, and when it must be removed or made permanent by policy

#### Scenario: Stale includes are searched before phase completion
- **WHEN** a phase moves components or pages to new roots
- **THEN** the phase MUST search for stale include paths and import paths related to that move before being marked complete

#### Scenario: Duplicate source of truth is not accepted
- **WHEN** a phase is marked complete
- **THEN** no migrated source category may have two undocumented canonical locations

#### Scenario: Compatibility does not become architecture by accident
- **WHEN** the final cleanup phase is complete
- **THEN** any remaining compatibility alias or fallback path MUST be documented as an intentional long-term API, otherwise it MUST be removed

### Requirement: Clean-As-You-Go Phase Gates
Every migration phase SHALL end with validation and cleanup before the next phase begins.

#### Scenario: Phase includes validation
- **WHEN** an implementation phase changes build paths, source layout, imports, includes, data paths, or asset paths
- **THEN** that phase SHALL include a build or targeted verification step appropriate to the changed area

#### Scenario: Phase includes cleanup
- **WHEN** an implementation phase completes a move or migration
- **THEN** that phase SHALL remove obsolete files, obsolete directories, stale path references, or temporary exceptions that are no longer required

#### Scenario: Phase does not proceed with known drift
- **WHEN** stale references, duplicate canonical files, or unresolved compatibility exceptions remain after verification
- **THEN** the next migration phase MUST NOT begin until those items are cleaned or explicitly recorded as deferred with an owner and removal condition

### Requirement: Documentation Matches Final Architecture
Developer documentation SHALL explain the multi-faculty architecture and the rules for adding future faculty websites.

#### Scenario: Architecture documentation is updated
- **WHEN** the migration is complete
- **THEN** documentation SHALL describe `Shared Platform + Faculty Modules`, final source roots, and ownership rules

#### Scenario: Build documentation is updated
- **WHEN** the migration is complete
- **THEN** documentation SHALL show how to build the selected faculty with `FACULTY=<faculty> yarn build`

#### Scenario: New faculty onboarding is documented
- **WHEN** a developer wants to add a new faculty
- **THEN** documentation SHALL explain where to create pages, data, assets, faculty components, styles, JavaScript, and faculty config

#### Scenario: Classification rules are documented
- **WHEN** a developer needs to decide whether something belongs to shared or faculty roots
- **THEN** documentation SHALL provide component and asset classification rules consistent with the architecture standard

### Requirement: Health Science Baseline Preservation
The migrated `health-science` faculty SHALL preserve the existing site behavior unless a change is explicitly documented.

#### Scenario: Current pages remain buildable
- **WHEN** `FACULTY=health-science yarn build` completes
- **THEN** the output SHALL include the current Health Science page set: home, about, majors, major detail, news, news detail, leadership, leadership detail, partners, students, contact, document detail, and form demo unless any page removal is explicitly documented

#### Scenario: Current interactive features remain functional
- **WHEN** the migrated Health Science site is previewed
- **THEN** header navigation, mobile menu, footer accordion, global widgets, search modal, major quiz, carousels, tabs, SVG inlining, article actions, and PDF fallback SHALL continue to function according to their existing contracts

#### Scenario: Existing stability requirements remain invariants
- **WHEN** this architecture change is implemented
- **THEN** existing `site-runtime-stability` requirements SHALL remain satisfied

### Requirement: Centralized SVG Asset Source
The build system SHALL treat `src/shared/assets/svgs` as the only canonical source root for SVG assets served from `/assets/svgs/*`.

#### Scenario: Shared SVG resolves in development
- **WHEN** the dev server receives a request for `/assets/svgs/foo.svg`
- **THEN** it SHALL resolve the file from `src/shared/assets/svgs/foo.svg`

#### Scenario: Faculty SVG override is not supported
- **WHEN** a file exists at `src/faculties/<faculty>/assets/svgs/foo.svg`
- **THEN** the dev server MUST NOT use it to satisfy `/assets/svgs/foo.svg`

#### Scenario: Remaining Health Science SVGs are shared
- **WHEN** the change is complete
- **THEN** `icon-traditional-medicine.svg`, `icon-nutrition.svg`, `icon-nursing.svg`, and `icon-food-science.svg` SHALL exist under `src/shared/assets/svgs`
- **AND** they MUST NOT remain canonical files under `src/faculties/health-science/assets/svgs`

### Requirement: Usage-Based SVG Build Output
The selected-faculty build SHALL copy only SVG files that are referenced by the selected faculty source and shared platform source used by that build.

#### Scenario: Build scans supported HTML attributes
- **WHEN** source files contain `src="/assets/svgs/x.svg"`, `src="assets/svgs/x.svg"`, `data-icon="/assets/svgs/x.svg"`, or `data-pattern="/assets/svgs/x.svg"`
- **THEN** the build SHALL include `x.svg` in `dist_iuh/assets/svgs`

#### Scenario: Build scans CSS SVG URLs
- **WHEN** source CSS contains `url('../assets/svgs/x.svg')`
- **THEN** the build SHALL include `x.svg` in `dist_iuh/assets/svgs`

#### Scenario: Build scans JavaScript SVG strings
- **WHEN** source JavaScript contains a string reference such as `'/assets/svgs/x.svg'`
- **THEN** the build SHALL include `x.svg` in `dist_iuh/assets/svgs`

#### Scenario: Unreferenced shared SVGs are pruned from output
- **WHEN** a shared SVG file is not referenced by the selected faculty source or shared platform source used by the build
- **THEN** the build MUST NOT copy that SVG into `dist_iuh/assets/svgs`

#### Scenario: Missing SVG reference fails the build
- **WHEN** selected faculty or shared platform source references an SVG that does not exist under `src/shared/assets/svgs`
- **THEN** the build SHALL fail with an error that names the missing SVG path
- **AND** the error SHALL identify at least one source file containing the missing reference

#### Scenario: Faculty builds verify pruned SVG output
- **WHEN** Health Science and Dormitory builds complete
- **THEN** `dist_iuh/assets/svgs` SHALL contain the SVG files referenced by that selected faculty build
- **AND** it MUST NOT contain every file from `src/shared/assets/svgs` merely because the file exists in the shared SVG root
