## ADDED Requirements

### Requirement: Shared Content Components Use Selected Faculty Data
Reusable content-heavy components SHALL use selected-faculty data or configuration when their only differences across faculties are copy, images, dates, links, or item ordering.

#### Scenario: News component reused across faculties
- **WHEN** the news experience is needed by more than one faculty
- **THEN** the UI components SHALL live under `src/shared/components/news`
- **AND** faculty-specific news content SHALL live outside the shared component markup

#### Scenario: Shared content renders statically when possible
- **WHEN** a shared component uses selected-faculty content data and does not require runtime personalization or user interaction to choose its content
- **THEN** the build SHALL prefer injecting the selected-faculty content into generated HTML during the HTML transform
- **AND** it SHOULD NOT require a browser fetch for that content in production

#### Scenario: Shared component avoids content leakage
- **WHEN** a selected faculty build renders a shared content component
- **THEN** visible content from another faculty MUST NOT appear unless it is a true shared platform default
