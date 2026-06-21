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
