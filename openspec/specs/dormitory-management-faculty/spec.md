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

### Requirement: Dormitory post-login lookup page
The Dormitory Management module SHALL provide a Dormitory-owned post-login lookup page at `/tra-cuu.html` that presents the signed-in student's profile and dormitory registration status.

#### Scenario: Lookup page renders profile panel
- **WHEN** the Dormitory Management selected build renders `/tra-cuu.html`
- **THEN** the page SHALL include a "THÔNG TIN TRA CỨU" panel
- **AND** the panel SHALL display read-only display rows for the student's full name, MSSV, khoa, lớp, giới tính, năm nhập học, and tình trạng ở KTX

#### Scenario: Lookup page renders stay history
- **WHEN** the Dormitory Management `/tra-cuu.html` page is rendered
- **THEN** the page SHALL include a "Lịch sử ở KTX" section
- **AND** the section SHALL render the stay-history table with columns TT, Thời gian, and Trạng thái
- **AND** the section SHALL render an explicit empty-state row containing "Không có thông tin" when no history exists
- **AND** the section SHALL render one row per history entry when history exists

#### Scenario: Lookup page uses shared form primitives
- **WHEN** the Dormitory Management `/tra-cuu.html` page renders any form-like UI (display rows, file upload, data table, action row, helper text)
- **THEN** the markup SHALL be produced by shared form primitives from `src/shared/components/form`

#### Scenario: Lookup page uses the standard public layout
- **WHEN** the Dormitory Management `/tra-cuu.html` page is rendered
- **THEN** the page SHALL render with the same shared chrome as other public pages (public header, public footer, search modal, scroll-to-top widget)
- **AND** the page SHALL render the shared loading overlay, meta tags, favicons, theme color, main script, and any page-specific script declared via `LAYOUT: script`

### Requirement: Dormitory registration row state model
The Dormitory Management lookup page SHALL render the registration status row according to a defined finite state set.

#### Scenario: No eligible round
- **WHEN** the registration state is `no_round`
- **THEN** the registration row SHALL display "Chưa có đợt ĐK phù hợp!" using the gray informational style
- **AND** the page SHALL NOT render the payment-proof upload section

#### Scenario: Can register
- **WHEN** the registration state is `can_register`
- **THEN** the registration row SHALL display an "Đăng ký nội trú" call to action
- **AND** the page SHALL NOT render the payment-proof upload section

#### Scenario: Pending approval
- **WHEN** the registration state is `pending`
- **THEN** the registration row SHALL display a "Đang chờ duyệt hồ sơ" status using a pending/yellow visual treatment
- **AND** the page SHALL NOT render the payment-proof upload section

#### Scenario: Approved with payment proof required
- **WHEN** the registration state is `approved`
- **THEN** the registration row SHALL display "Đã duyệt hồ sơ - Tải phiếu" with a link to download the registration slip
- **AND** the page SHALL render the "Upload hình biên lai chuyển khoản" section using the shared file primitive
- **AND** the upload section SHALL render a labeled file input combined with an upload action button
- **AND** the upload action SHALL be a prototype no-op that does not transmit data to any backend

#### Scenario: Active
- **WHEN** the registration state is `active`
- **THEN** the registration row SHALL display an "Đang ở KTX" status using an active/green visual treatment
- **AND** the page SHALL NOT render the payment-proof upload section

#### Scenario: All states render simultaneously
- **WHEN** a reviewer opens the lookup page
- **THEN** the page SHALL render all five defined registration states stacked vertically as a static showcase
- **AND** the page SHALL NOT use JavaScript or URL parameters to select between states

### Requirement: Dormitory lookup mock data
The Dormitory Management module SHALL drive the lookup page from a Dormitory-owned mock data fixture so the page is data-shaped rather than hard-coded.

#### Scenario: Mock data fixture exists
- **WHEN** the Dormitory Management module is built
- **THEN** the file `src/faculties/dormitory-management/data/lookup-mock.json` SHALL exist
- **AND** it SHALL contain student profile fields, the current registration state code, supporting copy for that state, and a stay-history rows array (which MAY be empty)

#### Scenario: Mock data feeds the lookup page
- **WHEN** the lookup page is rendered
- **THEN** the visible profile and stay-history values SHALL match the fixture
- **AND** the registration row SHALL match the state declared in the fixture

### Requirement: Dormitory lookup discoverability is post-login only
The Dormitory Management lookup page SHALL be reachable only through the post-login flow.

#### Scenario: Login flow lands on the lookup page
- **WHEN** the Dormitory Management login form is submitted
- **THEN** the prototype SHALL navigate the user to `/tra-cuu.html`

#### Scenario: Lookup page is absent from public surfaces
- **WHEN** the Dormitory Management public header navigation, quick links, footer, search categories, or search-data fixtures are rendered or read
- **THEN** they SHALL NOT contain a link to `/tra-cuu.html`

### Requirement: Dormitory login page uses chromeless layout
The Dormitory Management `pages/login.html` SHALL render with the chromeless layout so the pre-login and post-login surfaces share visual chrome.

#### Scenario: Login page suppresses public chrome
- **WHEN** the Dormitory Management `/login.html` page is rendered
- **THEN** the page SHALL NOT render the public site header, public site footer, search modal, or scroll-to-top widget
- **AND** the page SHALL render the shared loading overlay, meta tags, favicons, theme color, and main script

