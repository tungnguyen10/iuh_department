## ADDED Requirements

### Requirement: Shared form primitive surface
The platform SHALL expose a shared form primitive surface under `src/shared/components/form` that faculties consume for form-like UI.

#### Scenario: Primitive set covers required surfaces
- **WHEN** a faculty needs a form input, textarea, select, radio group, checkbox, read-only display row, file upload, data table, inline grouped control, helper text, error text, action row, or form note
- **THEN** the shared form primitive surface SHALL provide an include or class that satisfies the need without requiring hand-rolled markup

#### Scenario: Primitive surface is documented
- **WHEN** a developer reads `src/shared/components/form/README.md`
- **THEN** it SHALL describe every primitive, its include path, its `data-*` slots, its variants, and at least one usage snippet per primitive
- **AND** it SHALL describe the template engine constraints relevant to the primitives (no loops/conditionals, line-strip rule for empty placeholders, attribute-placeholder caveat, recursive include depth)

### Requirement: Field primitive supports all native input shapes
The field include SHALL render an accessible labeled control for input, textarea, and select shapes using a single canonical class layer.

#### Scenario: Input variant renders all common HTML input types
- **WHEN** a caller invokes the field include with `data-type` set to text, email, password, tel, url, search, number, date, time, datetime-local, month, week, color, or range
- **THEN** the include SHALL render a labeled `<input>` with the requested type and the `iuh-form-control` class
- **AND** it SHALL forward any extra native attributes provided via `data-attrs`

#### Scenario: Textarea variant renders a multi-line control
- **WHEN** a caller invokes the field include in textarea mode with `data-rows`, `data-placeholder`, and `data-attrs`
- **THEN** the include SHALL render a labeled `<textarea>` with `iuh-form-control` and `iuh-form-textarea` classes

#### Scenario: Select variant supports any option count
- **WHEN** a caller invokes the field include in select mode and supplies zero or more nested option sub-includes
- **THEN** the rendered `<select>` SHALL contain only the supplied options
- **AND** the variant SHALL NOT cap the number of supported options

### Requirement: Optional slots emit no DOM when empty
The field, choice, and other primitives SHALL emit zero DOM and zero asset requests for any optional slot that is not provided.

#### Scenario: Omitting the icon emits no image
- **WHEN** the caller does not provide `data-icon`
- **THEN** the rendered label SHALL NOT contain an `<img>` element
- **AND** the rendered HTML SHALL NOT issue any HTTP request for a missing icon asset

#### Scenario: Omitting required marker emits no marker
- **WHEN** the caller does not provide `data-required-text`
- **THEN** the rendered label SHALL NOT contain a required-marker `<span>`

#### Scenario: Omitting helper or error emits no paragraph
- **WHEN** the caller does not provide `data-helper-text` or `data-error-text`
- **THEN** the rendered field SHALL NOT contain a helper or error `<p>` element for that omitted slot

### Requirement: Choice primitive supports radio groups and checkboxes
The choice include SHALL render radio groups and single checkboxes with the same visual treatment.

#### Scenario: Radio group supports any option count
- **WHEN** a caller invokes the choice include in radio-group mode and supplies zero or more nested choice-option sub-includes
- **THEN** the rendered `<fieldset>` SHALL contain only the supplied radio labels
- **AND** the variant SHALL NOT cap the number of supported options

#### Scenario: Radio group convenience variant still works
- **WHEN** a caller invokes the existing flat 3-option radio variant with `data-option1-*`, `data-option2-*`, `data-option3-*`
- **THEN** the include SHALL render the three radios identically to the previous behavior

#### Scenario: Single checkbox variant
- **WHEN** a caller invokes the single-checkbox variant
- **THEN** the include SHALL render a `<label>` containing a single `<input type="checkbox">` and the supplied text

### Requirement: Display row primitive for read-only label/value
The platform SHALL provide a shared primitive for read-only label/value display rows so faculties can render lookup-style information panels without hand-rolled markup.

#### Scenario: Two-column display row
- **WHEN** a caller invokes the display-row primitive with `data-label` and `data-value`
- **THEN** the include SHALL render a row with the label on the left and the value on the right using `iuh-form-display-*` classes

#### Scenario: Full-width display row
- **WHEN** a caller invokes the display-row primitive in full-width mode with `data-label` and a value slot
- **THEN** the rendered row SHALL span the full container width
- **AND** the row SHALL accept rich HTML content in the value slot

#### Scenario: Display row supports optional emphasis modifier
- **WHEN** a caller marks a display row as emphasised (for example a status row)
- **THEN** the rendered value SHALL receive an emphasis class so styles can highlight the row

### Requirement: File upload primitive
The platform SHALL provide a shared primitive for labeled file upload combined with a side action button.

#### Scenario: File primitive renders label, input, and action
- **WHEN** a caller invokes the file primitive with `data-id`, `data-name`, `data-label`, optional `data-accept`, optional `data-action-text`, optional helper/error slots
- **THEN** the include SHALL render a labeled `<input type="file">` styled with `iuh-form-file` classes and an adjacent action button using the shared button include
- **AND** the include SHALL forward any extra native attributes via `data-attrs`

#### Scenario: File primitive supports disabled and required states
- **WHEN** the caller passes `required` or `disabled` through `data-attrs`
- **THEN** the rendered control SHALL reflect those native attributes
- **AND** the file primitive SHALL NOT introduce JavaScript to enforce these states

### Requirement: Data table primitive
The platform SHALL provide a shared primitive for simple data tables with explicit empty-state rendering.

#### Scenario: Table renders header, body, and caption
- **WHEN** a caller invokes the table primitive with header cell content, body row content, and an optional caption
- **THEN** the rendered `<table>` SHALL use `iuh-form-table-*` classes and render the supplied cells

#### Scenario: Table empty-state row
- **WHEN** the caller invokes the table primitive in empty-state mode with `data-empty-text`
- **THEN** the rendered table SHALL contain a single body row that spans all columns and shows the empty-state text

### Requirement: Inline group primitive
The platform SHALL provide a shared primitive for "label + control + trailing widget" rows so patterns like captcha challenges and file-upload action rows do not require hand-rolled markup.

#### Scenario: Inline group renders label, control, and widget
- **WHEN** a caller invokes the inline-group primitive with a label slot, a control slot, and a trailing widget slot
- **THEN** the rendered row SHALL place the control and the trailing widget side by side on wide viewports and stack them on narrow viewports

#### Scenario: Widget slot accepts arbitrary HTML
- **WHEN** the trailing widget slot is given a button include, an `<img>`, or a custom block
- **THEN** the inline-group primitive SHALL embed the widget without overriding its styles

### Requirement: Form layout helpers
The platform SHALL provide shared layout classes for form rows, grids, actions, helper text, error text, and notes.

#### Scenario: Form grid splits columns responsively
- **WHEN** a faculty page wraps form fields in `iuh-form-grid`
- **THEN** the grid SHALL render one column on narrow viewports and the documented multi-column layout on wider viewports

#### Scenario: Form action row primitive
- **WHEN** a faculty page wraps form actions in `iuh-form-actions`
- **THEN** the actions row SHALL render with the documented background, spacing, and stacking behavior

#### Scenario: Helper, error, and note classes are reusable independently
- **WHEN** a faculty page needs a helper paragraph, error paragraph, or informational note outside of a field include
- **THEN** the page SHALL be able to apply `iuh-form-helper`, `iuh-form-error`, or `iuh-form-note` to its own elements and get the canonical styling
