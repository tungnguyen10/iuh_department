## Context

The repository already has a shared form layer under `src/shared/components/form` (`form.scss`, `field.html`, `choice.html`, `README.md`). Dormitory pages (`login.html`, `contact.html`) consume it. Health Science pages (`contact.html`, `form.html`) bypass it and hand-roll every input with Tailwind utilities, which causes visible style drift and duplicates around 40+ input/select/textarea elements.

The static include engine lives in `vite.config.js` (`transformDataInclude`). Confirmed behavior:

- Each include resolves a component HTML file; `{{key}}` placeholders are replaced by `data-key` attributes (camelCased).
- Variants are selected via `<!-- option N --> ... <!-- option N+1 -->` markers; missing variants fall back to option 1.
- Lines that match `<tag>{{x}}</tag>` with no value get stripped entirely.
- Attribute placeholders like `src="{{icon}}"` are NOT stripped when empty - they emit `src=""` and trigger a broken asset request.
- Includes can nest recursively up to depth 10.
- The engine does NOT support loops or conditionals.

These constraints drive every decision below.

## Goals / Non-Goals

**Goals:**

- Provide a single shared form layer that can express every form surface used by Dormitory and Health Science today, plus the upcoming Dormitory registration/lookup surfaces (display rows, file upload, data table, inline group).
- Eliminate broken-asset requests from optional include slots.
- Support any number of select options and radio options without forking the primitive per arity.
- Keep the migration pure markup - no JavaScript framework, no template engine changes.
- Preserve current visual output for surfaces already using the primitives.
- Migrate Health Science contact and form pages to the shared primitives with no functional regression.

**Non-Goals:**

- No replacement of the static include engine.
- No introduction of a JavaScript-driven form runtime, validation library, or i18n integration.
- No redesign of the visual form language; modifier classes can be added but the base look stays.
- No new server-side endpoints, payload schemas, or analytics.
- No migration of Dormitory surfaces beyond what is required to consume new optional slots (login captcha migration to the inline-group primitive is in scope; everything else stays as-is).

## Decisions

### Decision 1: Variadic options via nested per-option includes plus arity variants

The select field and radio group will support arbitrary option counts through two complementary mechanisms:

- A per-row sub-include for one option (`form/option.html` for `<option>`, `form/choice-option.html` for radio/checkbox `<label>`). Callers can nest as many sub-includes as they need under the parent field or fieldset.
- Existing arity-based variants (e.g. variant 3 with 5 inlined options) stay for callers that want a flat copy-paste shape, but they are reframed as convenience variants on top of the per-row include. New variants for common arities (2, 4, 6) may be added when they map to clear page needs.

Rationale: the include engine has no `{{#each}}` loop. Per-row nested includes are already supported (depth 10) and keep the primitive contract single-source.

Alternatives considered:

- A JavaScript-rendered option list. Rejected - introduces runtime cost for a static surface and breaks the no-JS form posture.
- Generating up to N hard-coded option slots (e.g. 1..10). Rejected - leaves brittle empty placeholders and does not scale.

### Decision 2: Optional slots must emit no DOM when empty

Optional slots (`icon`, `required`, `helper`, `error`) move out of the always-rendered label into their own elements that fully line-strip when the placeholder is empty. Because the engine only strips `<tag>{{x}}</tag>` shapes:

- The icon will be placed on its own line as `<img src="{{icon}}" ...>` wrapped in a single-line `<span>{{iconSlot}}</span>` pattern (an empty `iconSlot` strips the line). The icon emission uses an indirection slot (sub-include `form/label-icon.html`) so empty `data-icon` yields no markup at all.
- The required marker uses the same indirection: `<span class="iuh-form-required">{{requiredText}}</span>` is wrapped so an empty value strips the entire span line.
- Helper and error paragraphs already match the `<tag>{{x}}</tag>` shape and will be cleaned up to keep them strict (single-line, no attributes that contain placeholders).

Rationale: relying on existing engine line-strip semantics avoids changing `vite.config.js`. Indirection via sub-includes guarantees empty slots produce zero bytes.

Alternative considered: change the engine to strip attribute-level empty placeholders. Rejected - widens blast radius beyond this change and risks impacting other includes.

### Decision 3: New primitives, each minimal and single-purpose

The following primitives will be added under `src/shared/components/form/`:

- `display-row.html`: a label/value row for read-only display surfaces. Variants for `<dl>` rows, two-column grid rows, and full-width rows. The row uses dedicated `iuh-form-display-*` classes (label, value, row, group container).
- `file.html`: a labeled file input combined with a side action button. Optional helper/error slots. Reuses `iuh-form-control` styles for the input shell.
- `table.html`: a data-table primitive with header cells include slot, body rows include slot, and an explicit empty-state row. Dedicated `iuh-form-table-*` classes so it does not conflict with general tables elsewhere.
- `inline-group.html`: label + control + trailing side widget (button, image, or auxiliary input). Used by the login captcha and the future upload action.
- Sub-includes already mentioned: `option.html`, `choice-option.html`, `label-icon.html`, and similar small leaves.

Rationale: keeping each primitive small and single-purpose matches the existing `field.html` / `choice.html` style and keeps the include surface easy to scan and override.

Alternative considered: a single mega-include with all slots. Rejected - the engine has no conditionals, so a mega-include would either emit empty markup for unused slots or require even more variants.

### Decision 4: Migrate Health Science by replacing hand-rolled markup in place

Health Science `contact.html` and `form.html` get rewritten to consume the shared primitives without changing the visible page composition (hero, section headers, surrounding cards). Only the form bodies are replaced.

Rationale: the page chrome is page-specific and already reviewed. Replacing only the form bodies keeps the diff focused and the visual delta zero outside the form area.

Alternative considered: drop `form.html` (the demo page) entirely. Rejected for this change - the demo page is the only place that currently advertises form patterns; the migration should turn it into the canonical primitive showcase rather than delete it. A future change may rehome the demo under a docs route.

### Decision 5: Establish a new capability for shared form primitives

Form primitives become their own capability (`shared-form-primitives`) with explicit requirements covering API surface, slot optionality, variadic options, and the new primitive set. `multi-faculty-architecture` is updated to require all faculty form surfaces to consume this capability.

Rationale: forms are now a first-class shared concern (parallel to `shared-news-content`). Putting the contract in its own capability lets faculty-specific specs (`dormitory-management-faculty`, future health-science spec) reference it without restating the contract.

Alternative considered: extend `multi-faculty-architecture` only. Rejected - mixes the platform contract (must use shared primitives) with the primitive contract (what they look like and what slots they expose), making future evolution noisy.

## Risks / Trade-offs

- Empty-slot indirection adds one extra level of include nesting. Mitigation: the engine already handles depth 10 and the new sub-includes are trivial leaves.
- Variadic select via per-option includes is more verbose than `data-option1..N`. Mitigation: keep the inlined arity variants as convenience for short option lists.
- Migrating `pages/form.html` is the largest delta in this change. Mitigation: split the migration into tasks per section (text inputs, number/date, choice, file, textarea, layout) so reviewers can validate each section against the original.
- Visual drift between hand-rolled Health Science styles and shared primitive styles. Mitigation: capture before/after screenshots of `contact.html` and `form.html` during verification; treat any user-visible delta as a blocking regression.
- The login captcha migration introduces a new primitive (`inline-group`). Mitigation: scoped to one consumer for now; future migrations adopt it incrementally.

## Migration Plan

1. Update `form.scss` with classes the new primitives need (display row, file, table, inline group, plus modifiers).
2. Add sub-includes (`option.html`, `choice-option.html`, `label-icon.html`, etc.) and update `field.html` / `choice.html` to consume them so optional slots stop emitting empty DOM.
3. Add new primitives (`display-row.html`, `file.html`, `table.html`, `inline-group.html`).
4. Update `README.md` with usage snippets and engine constraints, including the per-option nesting pattern.
5. Migrate Dormitory `login.html` captcha to `inline-group.html`. Confirm no visual change.
6. Migrate Health Science `contact.html` form body to shared primitives. Confirm no visual change.
7. Migrate Health Science `pages/form.html` form body section by section. Confirm no visual change for each section.
8. Grep audit: no raw `<input|<select|<textarea` remain under `src/faculties/**/pages/**.html` outside primitive consumers.
9. Run OpenSpec validation and selected builds (`health-science`, `dormitory-management`).

Rollback: revert the primitive files and faculty page edits independently. Old Health Science markup can be restored without affecting Dormitory because the include layer is additive until consumers migrate.

## Open Questions

- Should the migrated `pages/form.html` continue to advertise itself as a public demo route, or be moved behind a docs/preview path in a follow-up change? Default for this change: keep the route, just power it from shared primitives.
- Do we want `form.scss` class names extended with `iuh-form-table-*`, `iuh-form-file-*`, `iuh-form-display-*`, `iuh-form-inline-*` namespaces (chosen here for consistency), or shorter aliases? Default: keep `iuh-form-` namespace to mirror existing classes.
