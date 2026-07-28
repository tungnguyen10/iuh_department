# IUH Lookup Addon Redesign

## Goal

Redesign the student-information addon on the dormitory lookup page to match the approved reference: a clean, highly legible student dossier that visually separates personal data from current dormitory placement.

## Scope

- Change only the `iuh-lookup-addon` markup and styles on `tra-cuu.html`.
- Preserve the displayed values, existing lookup tabs, profile panel, and registration-state behaviour.
- Keep the addon as a responsive sidebar on large screens and a full-width block on smaller screens.

## Visual direction

- Outer shell: a soft white-to-pale-blue surface with a fine cool-blue border and restrained shadow.
- Inner card: white background, rounded corners, and a larger inset than the surrounding lookup UI.
- Identity: compact uppercase eyebrow, a large two-line-capable name in IUH blue, and a vivid magenta circular initials avatar.
- Metadata: the first identity row is unboxed; the following fields are individually bordered, aligned label/value rows. Current accommodation fields receive a pale-blue fill and blue values.
- Typography: retain the project’s Inter/sans stack. Labels use uppercase, muted gray, letter-spaced utility text; values use a dark, medium-to-bold readable face.

## Responsive and accessibility requirements

- Do not truncate long faculty names or student names; allow natural wrapping.
- Keep labels and values in separate columns at practical widths, and switch to a stacked presentation on narrow screens.
- Preserve semantic `aside`, `article`, `header`, heading, and paragraph content.
- Use color only as an enhancement: borders, contrast, and font weight must keep highlighted rows readable.

## Validation

- Build with `yarn build`.
- Inspect the generated lookup page at desktop and narrow viewport widths to ensure the addon retains its spacing, wrapping, and hierarchy.
