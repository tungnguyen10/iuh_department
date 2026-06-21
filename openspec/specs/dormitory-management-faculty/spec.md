## Purpose

Defines the Dormitory Management selected faculty module, including its source ownership, page composition, runtime configuration, data isolation, and Health Science preservation expectations.

## Requirements

### Requirement: Dormitory Management selected module
The system SHALL provide a real selected module for Phong Quan ly Ky Tuc Xa under `src/faculties/dormitory-management`.

#### Scenario: Build selected Dormitory module
- **WHEN** a developer runs the build with `FACULTY=dormitory-management`
- **THEN** the build SHALL use shared platform sources and `src/faculties/dormitory-management` sources to produce the Dormitory Management website

#### Scenario: Dormitory module has canonical ownership roots
- **WHEN** the Dormitory Management module is implemented
- **THEN** its pages, data, assets, faculty-owned components, and faculty runtime config SHALL live under `src/faculties/dormitory-management`

### Requirement: Dormitory home page composition
The Dormitory Management home page SHALL render the requested site sections using shared platform UI and Dormitory-owned content.

#### Scenario: Home page renders required sections
- **WHEN** the Dormitory Management home page is built
- **THEN** it SHALL include header, footer, carousel, stats, news, infrastructure, partners, and search modal support

#### Scenario: Home page uses Dormitory-specific content
- **WHEN** the Dormitory Management home page is viewed
- **THEN** visible carousel, stats, news, infrastructure, and partners content SHALL be specific to Phong Quan ly Ky Tuc Xa and SHALL NOT contain Health Science-only copy

### Requirement: Dormitory News Uses Shared News Feature
The Dormitory Management module SHALL use the shared news feature with Dormitory-owned content.

#### Scenario: Dormitory home news uses shared rendering
- **WHEN** the Dormitory Management home page renders its news section
- **THEN** the section SHALL use shared news presentation code
- **AND** it SHALL render Dormitory-owned news content from selected faculty data

#### Scenario: Dormitory news detail exists
- **WHEN** a user opens a Dormitory Management news detail route
- **THEN** it SHALL render inside the shared layout using the shared news detail surface and Dormitory-owned article content

#### Scenario: Dormitory news links are not placeholders
- **WHEN** Dormitory Management news cards or search results are rendered
- **THEN** they SHALL link to Dormitory news routes rather than temporary `contact.html` or home-page placeholders

### Requirement: Dormitory contact page
The Dormitory Management module SHALL provide a Dormitory-owned contact page.

#### Scenario: Contact page renders Dormitory contact content
- **WHEN** the Dormitory Management contact page is built
- **THEN** it SHALL render contact information for Phong Quan ly Ky Tuc Xa rather than Health Science or generic IUH-only contact copy

#### Scenario: Contact page uses shared shell
- **WHEN** the Dormitory Management contact page is viewed
- **THEN** it SHALL render inside the shared layout with shared header and footer

### Requirement: Dormitory runtime configuration
Dormitory-specific runtime modules SHALL be declared by the Dormitory faculty configuration instead of being hard-coded in `src/main.js`.

#### Scenario: Faculty config declares Dormitory modules
- **WHEN** a Dormitory-owned component requires JavaScript initialization
- **THEN** `src/faculties/dormitory-management/faculty.config.js` SHALL declare its selector, import target, init function, and display name

#### Scenario: Shared runtime remains shared
- **WHEN** the Dormitory Management site initializes
- **THEN** shared runtime modules such as header, footer, search, news, stats, and partners SHALL continue to load from shared runtime configuration

### Requirement: Dormitory data and asset isolation
The Dormitory Management module SHALL use Dormitory-owned runtime data and faculty-owned assets where content is specific to the Dormitory site.

#### Scenario: Search uses selected faculty data
- **WHEN** a user opens search on the Dormitory Management site
- **THEN** the search modal SHALL fetch Dormitory-specific data from the selected faculty data output

#### Scenario: Dormitory assets are isolated
- **WHEN** Dormitory-specific carousel, infrastructure, partner, or contact imagery is used
- **THEN** those assets SHALL be sourced from `src/faculties/dormitory-management/assets` unless they are true shared platform defaults

### Requirement: Health Science preservation
Adding the Dormitory Management module SHALL NOT regress the existing Health Science selected module.

#### Scenario: Health Science still builds
- **WHEN** a developer runs the Health Science build after adding Dormitory Management
- **THEN** the Health Science build SHALL still succeed and include the existing Health Science page set

#### Scenario: Health Science runtime remains isolated
- **WHEN** the Health Science site loads
- **THEN** it SHALL continue to initialize Health Science-specific modules from `src/faculties/health-science/faculty.config.js`
