## ADDED Requirements

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
