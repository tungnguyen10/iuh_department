## ADDED Requirements

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
