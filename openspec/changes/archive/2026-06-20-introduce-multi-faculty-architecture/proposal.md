## Why

The current codebase is a working single-faculty Vite static site, but the architecture standard now requires one shared platform that can build multiple faculty websites without copying projects or forking reusable components. This change creates the contract for migrating the existing Health Science site into a multi-faculty structure while keeping the current site buildable after each migration phase.

## What Changes

- Introduce a `Shared Platform + Faculty Modules` architecture for the IUH faculty website codebase.
- Establish `src/shared` as the home for reusable platform code: shared layout, common components, cards, feature components, styles, JavaScript utilities, fonts, system icons, and generic assets.
- Establish `src/faculties/<faculty>` as the home for faculty-owned content: pages, data, documents, faculty images, faculty-specific modules, faculty styles, and faculty JavaScript.
- Add `health-science` as the first faculty module by migrating the current single-site content into the faculty structure.
- Add faculty-aware build behavior so `FACULTY=health-science yarn build` can build only the shared platform plus the selected faculty.
- Preserve the existing root deployment behavior and runtime expectations while introducing the new source layout.
- Require phased migration with cleanup gates: every phase must leave the repository buildable, remove or document temporary compatibility code, and prevent old/new structures from drifting apart.
- Require compatibility aliases only as temporary migration tools, not as permanent architecture.
- Require component classification rules based on the architecture standard:
  - shared by default
  - faculty-owned only when content/module behavior is clearly specific to one faculty
  - promote faculty components to shared when a second faculty reuses them
- Require asset classification rules:
  - shared assets: IUH/system logos, fonts, generic icons, generic defaults, social icons
  - faculty assets: banners, partner logos, faculty photos, lab/activity images, documents
- Require documentation updates so onboarding explains how to add a faculty, where to place content, how to classify components/assets, and how to build one faculty.
- Non-goal: redesign the UI, replace Vite/Vanilla JS with a framework, add a CMS/backend, or create additional faculty websites beyond the structural support and the migrated `health-science` baseline.

## Capabilities

### New Capabilities

- `multi-faculty-architecture`: Defines the shared platform and faculty module architecture, faculty-aware build contract, classification rules, migration cleanup gates, and verification requirements for preserving the existing Health Science site while enabling future faculty websites.

### Modified Capabilities

- None. Existing `site-runtime-stability` requirements remain invariants that this change must preserve rather than modify.

## Impact

- Affected documentation:
  - `docs/iUH Faculty Website Architecture Stand.md`
  - `docs/source-overview.md`
  - `README.md`
- Affected build/tooling:
  - `vite.config.js`
  - `package.json`
  - `.env*`
  - build scripts and output copy plugins
- Affected source layout:
  - `src/pages`
  - `src/components`
  - `src/assets`
  - `src/layouts`
  - `src/styles`
  - `src/js`
  - new `src/shared`
  - new `src/faculties/health-science`
- Affected public/runtime data:
  - `public/data`
  - `public/assets/documents`
  - runtime data URL helpers
- Affected runtime imports:
  - `src/main.js`
  - component JavaScript imports
  - build-time `data-include` aliases
- Verification must include at minimum:
  - current root build still succeeds
  - `FACULTY=health-science yarn build` succeeds
  - search modal still loads data
  - major quiz still loads data
  - PDF/document page still works
  - header/footer/global widgets still initialize once
  - no stale duplicate source directories remain after each completed migration phase
