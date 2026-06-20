## Why

The site now supports a shared platform plus selected faculty modules, but it only has the migrated Health Science faculty as a real runnable module. Phong Quan ly Ky Tuc Xa needs its own runnable site that can reuse the shared IUH shell while presenting dormitory-specific pages, content, assets, and runtime modules.

## What Changes

- Add a new selected module for `dormitory-management` representing "Phong Quan ly Ky Tuc Xa".
- Build the new module as a real runnable site with `FACULTY=dormitory-management`, not as a copy-only scaffold.
- Add Dormitory-owned pages for at least home and contact.
- Reuse shared platform header, footer, search modal, global widgets, common components, news cards, stats cards, partners cards, and shared runtime initializers where appropriate.
- Add Dormitory-owned carousel and infrastructure sections because their copy, imagery, and module ownership are specific to the dormitory site.
- Provide Dormitory-specific content for contact, carousel, partners, infrastructure, news, stats, and search data rather than leaking Health Science text or assets.
- Preserve the existing Health Science build and behavior.
- No dependency, framework, or UI redesign is introduced.

## Capabilities

### New Capabilities

- `dormitory-management-faculty`: Defines the runnable Dormitory Management selected-faculty module, its required pages, content ownership, reusable shared component usage, faculty runtime configuration, and verification expectations.

### Modified Capabilities

- None. Existing site runtime stability requirements remain invariants.

## Impact

- Affected source:
  - `src/faculties/dormitory-management/**`
  - `src/shared/components/**` only if small reusable wrappers or parameterization are needed to prevent Health Science content leakage
  - `src/shared/shared.config.js` only if shared runtime declarations need to support reused shared modules
  - `src/main.js` only if selected-faculty loading exposes a bug while adding the second real module
- Affected build/tooling:
  - `vite.config.js` should already support `FACULTY=<faculty-id>`; this change verifies it with `dormitory-management`.
  - `tailwind.config.js` should continue scanning `src/shared` and `src/faculties`.
- Affected documentation:
  - README and/or `docs/source-overview.md` should mention the new runnable faculty id and build command if implementation adds the module.
- Verification:
  - `FACULTY=dormitory-management npm.cmd run build` succeeds.
  - `FACULTY=health-science npm.cmd run build` still succeeds.
  - Dormitory home page renders header, footer, carousel, stats, news, infrastructure, partners, and search modal without Health Science-only content.
  - Dormitory contact page renders Dormitory contact content.
