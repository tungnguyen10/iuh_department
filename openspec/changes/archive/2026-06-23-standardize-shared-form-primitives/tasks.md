## 1. Engine And Style Foundations

- [x] 1.1 Inventory current `form.scss` classes and confirm which ones the new primitives can reuse versus extend.
- [x] 1.2 Extend `form.scss` with classes for display rows (`iuh-form-display`, `iuh-form-display-row`, `iuh-form-display-label`, `iuh-form-display-value`, modifiers), file widget (`iuh-form-file`, `iuh-form-file-trigger`, `iuh-form-file-status`), data table (`iuh-form-table`, header / row / cell / empty state), inline group (`iuh-form-inline`, label + control + trailing widget), and any new modifiers required by the migrated Health Science pages.
- [x] 1.3 Verify the new classes compile without warnings and the bundle size delta is acceptable.

## 2. Optional Slots In Existing Primitives

- [x] 2.1 Add `form/label-icon.html` sub-include (single line emitting an icon `<img>` only when `data-icon` is non-empty).
- [x] 2.2 Update `form/field.html` (all three variants) so the icon, required marker, helper text, and error text are emitted via line-strippable patterns or sub-includes; empty `data-icon`, `data-required-text`, `data-helper-text`, and `data-error-text` SHALL produce zero DOM.
- [x] 2.3 Manually verify that omitting each optional `data-*` attribute on every variant produces clean HTML (no empty `<img src="">`, no empty `<span>`, no empty `<p>`).

## 3. Variadic Options

- [x] 3.1 Add `form/option.html` sub-include that renders one `<option value>` row from `data-value` and `data-text`.
- [x] 3.2 Add `form/choice-option.html` sub-include that renders one radio or checkbox `<label>` row from `data-name`, `data-type`, `data-value`, `data-text`, optional `data-attrs`, optional `data-class`.
- [x] 3.3 Update `form/field.html` select variant to support a slot-based mode that renders zero options by default and accepts any number of nested `option.html` includes from the caller.
- [x] 3.4 Update `form/choice.html` so the radio group variant accepts any number of nested `choice-option.html` includes; keep the existing 3-option flat variant as a convenience.
- [x] 3.5 Add convenience variants for 2 and 4 inlined options if at least one consumer needs them; otherwise rely on the per-option nested include.

## 4. New Primitives

- [x] 4.1 Create `form/display-row.html` with variants for two-column grid row (label left, value right) and full-width row (used for state messages such as "Đăng ký" status).
- [x] 4.2 Create `form/file.html` for a labeled file input plus side action button; reuse `iuh-form-control`, the button include, and `iuh-form-helper` / `iuh-form-error` patterns.
- [x] 4.3 Create `form/table.html` with header row, body row, and empty-state variants; support an explicit empty-state caption like "Không có thông tin".
- [x] 4.4 Create `form/inline-group.html` for label + control + trailing widget; ensure the widget slot can host an image, a custom HTML block, or a button include.

## 5. Documentation

- [x] 5.1 Update `src/shared/components/form/README.md` with usage snippets for every primitive (field input, field textarea, field select with N options, choice radio with N options, single checkbox, display row, file, table, inline group).
- [x] 5.2 Document engine constraints (no loops/conditionals, line-strip rule, attribute placeholders are not auto-stripped, indirection pattern for optional `src` / `href` attributes).
- [x] 5.3 Document the `iuh-form-*` class namespaces and modifier conventions.

## 6. Dormitory Captcha Migration

- [x] 6.1 Replace the hand-rolled captcha label + image + input block in `src/faculties/dormitory-management/pages/login.html` with `inline-group.html`.
- [x] 6.2 Visually verify the login page renders identically before and after migration.

## 7. Health Science Contact Migration

- [x] 7.1 Rewrite the form body inside `src/faculties/health-science/pages/contact.html` to use shared primitives (field input, field textarea, helper/error slots) without changing the surrounding hero, headings, privacy notice, map card, or submit button styling.
- [x] 7.2 Verify visual parity against the current page (form spacing, focus ring, hover state, error text alignment).

## 8. Health Science Form Demo Migration

- [x] 8.1 Rewrite the "Text Inputs" section of `src/faculties/health-science/pages/form.html` using shared field primitives.
- [x] 8.2 Rewrite the "Number & Date Inputs" section using shared field primitives (input variants for number, date, time, range).
- [x] 8.3 Rewrite the "Select / Choice" section using shared select field and choice primitives, including any case with more than five options.
- [x] 8.4 Rewrite the "File / Upload" section using the new `file.html` primitive.
- [x] 8.5 Rewrite the "Textarea" section using the field textarea variant.
- [x] 8.6 Rewrite the "Actions / Submit" section using the existing button include and `iuh-form-actions` / `iuh-form-note` classes.
- [x] 8.7 Verify the demo page still showcases the same set of components after migration.

## 9. Regression Audit

- [x] 9.1 Grep `src/faculties/**/pages/**.html` for raw `<input`, `<select`, `<textarea` and confirm every remaining match is justified (primitive consumer placeholders, intentional inline-group widget contents) or replaced.
- [x] 9.2 Verify Dormitory `pages/contact.html` and `pages/login.html` render identically after the shared layer changes.
- [x] 9.3 Verify Health Science home and other unrelated pages render identically.

## 10. Verification

- [x] 10.1 Run OpenSpec validation for `standardize-shared-form-primitives`.
- [x] 10.2 Run the selected build for `FACULTY=health-science` and confirm `contact.html` and `form.html` build successfully.
- [x] 10.3 Run the selected build for `FACULTY=dormitory-management` and confirm `login.html` and `contact.html` build successfully.
- [x] 10.4 Capture before/after screenshots for the four migrated pages and review for unintended visual drift.
