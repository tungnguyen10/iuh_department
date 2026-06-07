# faculty-build-pipeline Specification

## Purpose
Defines how the Vite build pipeline handles per-faculty builds, page resolution, asset copying, and data file cascading.

## Requirements
### Requirement: Per-faculty build command
Build system SHALL support `VITE_FACULTY={faculty-id}` env var to build a static site for a specific faculty into a faculty-specific output directory.

`package.json` SHALL include `dev:{faculty-id}` and `build:{faculty-id}` scripts for each configured faculty. `build:all` SHALL build all faculties sequentially.

Current faculties: `health-science`, `dormitory-management`.

#### Scenario: Build faculty ra dist rieng
- **WHEN** running `yarn build:health-science`
- **THEN** static files are written to `dist/health-science/` with the correct faculty colors and content

#### Scenario: Dev server cho faculty cu the
- **WHEN** running `yarn dev:health-science`
- **THEN** the dev server starts with Health Science faculty data, colors, and components

#### Scenario: Build khoa thu 2 dormitory-management
- **WHEN** running `yarn build:dormitory-management`
- **THEN** `dist/dormitory-management/` is created with Dormitory Management identity, colors, contact info, and nav; it does not leak Health Science identity content

#### Scenario: build:all chay tat ca faculties
- **WHEN** running `yarn build:all`
- **THEN** each faculty is built sequentially into its own dist folder

### Requirement: Faculty-specific page glob
Vite build SHALL resolve HTML pages from `src/faculties/{FACULTY}/pages/` first, then merge with `src/pages/`. If the same relative page path exists in both places, the faculty-specific page wins.

Pages under `src/pages/_dev/` SHALL be excluded from production builds for every faculty, but SHALL remain reachable in dev server mode.

Pages named in `faculty.json.excludePages` SHALL be excluded from the build for that faculty.

#### Scenario: Faculty index page override shared
- **WHEN** `src/faculties/health-science/pages/index.html` exists
- **THEN** the build uses that page instead of `src/pages/index.html`

#### Scenario: Shared pages khong override
- **WHEN** a faculty has no `pages/news.html` but `src/pages/news.html` exists
- **THEN** the build includes the shared `news.html`

#### Scenario: Faculty-only page duoc include
- **WHEN** `src/faculties/dormitory-management/pages/services.html` exists and there is no shared equivalent
- **THEN** the build includes that page

#### Scenario: Page trong _dev/ khong build vao production
- **WHEN** `src/pages/_dev/form.html` exists and `yarn build:health-science` runs
- **THEN** `dist/health-science/form.html` does not exist

#### Scenario: Page trong _dev/ van serve duoc trong dev
- **WHEN** the dev server is running and `/_dev/form.html` is requested
- **THEN** the page renders with the normal layout

#### Scenario: Page trong excludePages bi bo qua
- **WHEN** `excludePages: ["majors.html"]` and `src/pages/majors.html` exists
- **THEN** that faculty build does not output `majors.html`

### Requirement: Faculty assets trong build output
Build system SHALL copy assets from `src/faculties/{FACULTY}/assets/` into dist output and merge them with shared assets. Faculty assets override shared assets with the same relative path.

#### Scenario: Faculty logo override shared logo
- **WHEN** `src/faculties/information-tech/assets/images/intro-image.png` exists
- **THEN** the faculty dist contains the faculty-specific image instead of the shared version

### Requirement: Data file cascade
Files under `public/data/` SHALL be read with faculty-specific overrides from `src/faculties/{FACULTY}/data/`. For JSON files, deep merge SHALL be applied so a faculty can override only the changed keys.

#### Scenario: Faculty override mot so keys trong messages
- **WHEN** `faculty/data/messages-vi.json` contains only `{"faculty.name": "Khoa CNTT"}` and shared data contains many more keys
- **THEN** the built site uses the faculty value for `faculty.name` and shared values for all remaining keys
