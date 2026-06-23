## Why

The shared form primitives under `src/shared/components/form` are inconsistent and incomplete, so faculties cannot rely on them for every form surface:

- `field.html` (select variant) hard-codes exactly five options.
- `choice.html` (radio group) hard-codes exactly three options.
- Optional slots (`icon`, `required`, `helper`, `error`) always emit DOM, leaving empty `<img src="">` requests and empty `<p>` tags when slots are not provided.
- There is no shared primitive for read-only label/value display rows, file upload + action, or data tables. Pages either hand-roll the markup (Dormitory `login.html` captcha) or skip the shared primitives entirely (Health Science `contact.html`, `form.html`).
- As a result, Health Science form surfaces drift from the canonical IUH form style and the upcoming Dormitory registration/lookup page would not be expressible with the current primitives.

Standardizing the primitives and migrating Health Science fixes the drift, removes broken-asset requests in shared includes, and unblocks the new Dormitory registration/lookup surface (separate change).

## What Changes

- Add variadic option support to the shared select field and radio group so the same primitive can render any option count (1..N).
- Make optional slots (`icon`, `required`, `helper`, `error`) truly optional in the shared field include so empty slots emit no DOM and no broken asset requests.
- Add new shared primitives for read-only display rows (label : value), file upload with side action, and data tables with empty state.
- Add a shared primitive for inline-group controls (label + control + side widget / side button) so patterns like the login captcha and the future upload row stop being hand-rolled.
- Extend `form.scss` with the classes required by the new primitives and modifier classes the migrated pages need.
- Update `src/shared/components/form/README.md` so every primitive has a usage snippet and the engine constraints are documented.
- Migrate Health Science `pages/contact.html` and `pages/form.html` from hand-rolled markup to the shared primitives without changing visible behavior.
- Preserve all current Dormitory and Health Science behavior, including existing form layouts that already use the shared primitives.

## Capabilities

### New Capabilities

- `shared-form-primitives`: defines the canonical shared form primitive contract (field, choice, display row, file upload, table, inline group, layout helpers) that all faculty form surfaces must consume.

### Modified Capabilities

- `multi-faculty-architecture`: requires that faculty form surfaces (input, select, radio, checkbox, textarea, display rows, file upload, data tables, action rows, helper/error text) be expressed through the shared form primitives rather than hand-rolled markup.

## Impact

- Affected source:
  - `src/shared/components/form/field.html`
  - `src/shared/components/form/choice.html`
  - `src/shared/components/form/form.scss`
  - `src/shared/components/form/README.md`
  - new files under `src/shared/components/form/` (display row, file upload, table, inline group, option/row sub-includes as needed)
  - `src/faculties/health-science/pages/contact.html`
  - `src/faculties/health-science/pages/form.html`
- No backend, API, dependency, or build pipeline changes. Template engine (`vite.config.js`) is unchanged; the variadic-option strategy uses already-supported nested includes plus per-arity variants.
- Verification:
  - OpenSpec validation for `standardize-shared-form-primitives`.
  - Selected build for `FACULTY=health-science` and `FACULTY=dormitory-management` succeeds.
  - Manual visual diff on Health Science `pages/contact.html`, `pages/form.html` and Dormitory `pages/login.html`, `pages/contact.html` confirms no regression.
  - Grep audit confirms no raw `<input>`, `<select>`, `<textarea>` remains in `src/faculties/**/pages/**.html` except for primitive consumers and the one inline-group widget (login captcha) once it migrates to the new inline-group primitive.
