## MODIFIED Requirements

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
