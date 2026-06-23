## ADDED Requirements

### Requirement: Faculty form surfaces use shared form primitives
Every faculty module SHALL build its form-like UI from the shared form primitives instead of hand-rolled markup.

#### Scenario: Faculty pages do not hand-roll form controls
- **WHEN** any faculty page under `src/faculties/<faculty>/pages` renders an input, textarea, select, radio, checkbox, file upload, data table, helper text, error text, action row, display row, or inline-grouped control
- **THEN** the markup SHALL be produced by including a shared form primitive from `src/shared/components/form`
- **AND** the page SHALL NOT re-implement the visual styling using ad-hoc Tailwind utility chains when a shared primitive or `iuh-form-*` class already covers the case

#### Scenario: Faculty-specific widgets are encapsulated as primitives
- **WHEN** a faculty needs a form widget that is not yet covered by a shared primitive
- **THEN** the new widget SHALL be added to the shared form primitive surface under `src/shared/components/form` before being consumed by the faculty page
- **AND** the new primitive SHALL be documented in `src/shared/components/form/README.md`

#### Scenario: Health Science form surfaces are migrated to shared primitives
- **WHEN** Health Science `pages/contact.html` or `pages/form.html` is built
- **THEN** every form control in those pages SHALL be rendered through the shared form primitive surface
- **AND** the pages SHALL produce no visible regression compared to their behavior before migration
