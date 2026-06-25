## Purpose

Defines the shared, selected-faculty news content model and static rendering behavior for reusable news surfaces.

## Requirements

### Requirement: Selected Faculty News Data
The system SHALL source reusable news content from the selected faculty's canonical data directory.

#### Scenario: News data belongs to selected faculty
- **WHEN** a faculty provides news content
- **THEN** the canonical editable source SHALL be `src/faculties/<faculty>/data/news.json`

#### Scenario: News data is used at build time
- **WHEN** a selected faculty build is produced
- **THEN** the selected faculty news data SHALL be read during HTML transformation and injected into generated news markup

### Requirement: Shared News Presentation
The system SHALL render news section, list, detail, carousel, and sidebar presentation through shared news components rather than faculty-specific copies.

#### Scenario: Shared news surfaces render faculty content
- **WHEN** a shared news surface is included by a faculty page or component
- **THEN** the generated HTML SHALL contain items from the selected faculty news data without requiring a browser fetch to `/data/news.json`

#### Scenario: Shared news components avoid faculty-specific defaults
- **WHEN** a component under `src/shared/components/news` or a news-related shared sidebar component is rendered
- **THEN** it MUST NOT contain visible Health Science-only or Dormitory-only hard-coded news copy as its reusable default content

### Requirement: News Detail Selection
The system SHALL support rendering a shared news detail page for the selected faculty.

#### Scenario: Detail page renders selected faculty article
- **WHEN** a user opens `news-detail.html` for a selected faculty
- **THEN** the shared news detail surface SHALL render a deterministic article from that faculty's news data

#### Scenario: Detail page has fallback article
- **WHEN** a user opens the shared news detail page
- **THEN** the page SHALL render a deterministic fallback article from the selected faculty news data or a clear unavailable state

### Requirement: News Links
News cards, list entries, sidebar entries, related entries, and search results SHALL link to selected-faculty news routes rather than unrelated placeholder pages.

#### Scenario: Card links point to news detail
- **WHEN** a news item renders in a shared news surface
- **THEN** its link SHALL point to the selected faculty news detail route without a query string

#### Scenario: Search links point to news content
- **WHEN** selected faculty search data references news items
- **THEN** those entries SHALL link to the news list or news detail route instead of temporary contact or home placeholders

### Requirement: News Renderer Templates Live in Scanned Source

The shared news rendering pipeline SHALL define its HTML template producers (cards, sections, sidebar entries, detail article) in files that fall inside Tailwind's `content` scan paths under `src/`, so every Tailwind class used in the rendered output is emitted by the JIT compiler.

#### Scenario: Arbitrary-value classes are emitted
- **WHEN** a Dormitory Management or Health Science build runs and the news sidebar card markup uses arbitrary-value Tailwind classes (e.g. `w-[70px]`, `h-[70px]`, `md:w-[85px]`, `md:h-[85px]`, `h-[130px]`, `md:h-[150px]`)
- **THEN** the compiled CSS bundle SHALL contain the corresponding rules for every such class actually used by the rendered news markup

#### Scenario: Build config is not on Tailwind's content path
- **WHEN** Tailwind's `content` configuration is inspected
- **THEN** it SHALL NOT include `vite.config.js` or any other file outside `src/` purely to scan rendered template classes

#### Scenario: Renderer modules are colocated with the news feature
- **WHEN** a developer opens the shared news component folder under `src/shared/components/news/`
- **THEN** they SHALL find the JavaScript module that produces the news card, sidebar, section, and detail HTML alongside the news shell components

### Requirement: News Renderer Factory Is Pure At Module Scope

The news renderer module SHALL expose a factory function that the build pipeline calls with already-loaded data and base path, and SHALL NOT perform filesystem reads at module evaluation time.

#### Scenario: Module import has no side effects
- **WHEN** the news renderer module is imported
- **THEN** it SHALL NOT read JSON data, touch the filesystem, or rely on Node-only globals at module top-level

#### Scenario: Build pipeline supplies data
- **WHEN** the Vite plugin invokes the news renderer factory
- **THEN** it SHALL pass the selected faculty's news items and section metadata as arguments, and the factory SHALL return an HTML transform function

