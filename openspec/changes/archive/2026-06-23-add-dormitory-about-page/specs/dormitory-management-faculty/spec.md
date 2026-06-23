## ADDED Requirements

### Requirement: Dormitory about page
The Dormitory Management module SHALL provide a Dormitory-owned About page that introduces Phong Quan ly Ky Tuc Xa as a student housing operations and support unit.

#### Scenario: About page renders Dormitory introduction
- **WHEN** the Dormitory Management selected faculty build renders `/about.html`
- **THEN** the page SHALL display Dormitory-specific introduction content
- **AND** the content SHALL describe housing operations, safety, maintenance support, and student community support
- **AND** the page SHALL NOT display Health Science-only faculty introduction content

#### Scenario: About page uses shared shell
- **WHEN** a user opens the Dormitory Management About page
- **THEN** it SHALL render inside the shared layout with shared header, footer, breadcrumb support, and global runtime features

### Requirement: Dormitory AboutIntroSection
The Dormitory Management module SHALL include a Dormitory-owned AboutIntroSection for the About page first-screen experience.

#### Scenario: About intro presents service-oriented summary
- **WHEN** the Dormitory Management About page is viewed
- **THEN** the AboutIntroSection SHALL show a service-oriented title, short description, action links, support metrics, and Dormitory service pillars
- **AND** its visible text and assets SHALL be Dormitory-specific

#### Scenario: About intro remains static unless interaction is needed
- **WHEN** the AboutIntroSection is implemented
- **THEN** it SHALL NOT require a new faculty runtime initializer unless the section introduces interactive behavior

### Requirement: Dormitory about discoverability
The Dormitory Management module SHALL expose the About page through normal navigation and search surfaces.

#### Scenario: Header navigation links to About
- **WHEN** the Dormitory Management header navigation is rendered
- **THEN** it SHALL include a link to `/about.html` labeled as the Dormitory introduction or about page

#### Scenario: Search data includes About
- **WHEN** the Dormitory Management search modal uses selected faculty search data
- **THEN** relevant introduction, housing service, and support queries SHALL be able to return `/about.html`

#### Scenario: Internal links avoid placeholders
- **WHEN** Dormitory About-related links are rendered
- **THEN** they SHALL point to existing Dormitory routes or same-page anchors rather than Health Science routes or temporary placeholder pages

### Requirement: Dormitory home intro section
The Dormitory Management home page SHALL include a Dormitory-owned intro section directly below the home carousel.

#### Scenario: Home page renders intro after carousel
- **WHEN** the Dormitory Management home page is built
- **THEN** it SHALL render a Dormitory-specific intro section after the carousel and before the stats section
- **AND** the intro section SHALL describe the unit's housing, safety, maintenance, and student support role

#### Scenario: Home intro uses faculty-owned component
- **WHEN** the Dormitory Management home intro is implemented
- **THEN** its markup SHALL live under `src/faculties/dormitory-management/components/home/intro`
- **AND** it SHALL NOT require a new runtime initializer unless interactive behavior is introduced
