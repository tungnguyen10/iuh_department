## Why

The Dormitory Management module currently has home, news, detail, and contact surfaces, but it lacks a dedicated About page and first-screen introduction section for explaining the unit's role. Adding this page gives students a clearer entry point for understanding housing operations, safety, maintenance support, and residence-life community services.

## What Changes

- Add a Dormitory-owned `about.html` page under the selected faculty module.
- Add a Dormitory-owned AboutIntroSection that presents the unit as a student housing service and community support office.
- Add a Dormitory-owned home intro section directly below the home carousel.
- Compose the About page with overview, service pillars, operating approach, infrastructure/community references, and contact CTA content.
- Update Dormitory navigation, quick links, search data, and relevant internal links so About is discoverable.
- Preserve existing Dormitory home/news/contact behavior and Health Science build behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dormitory-management-faculty`: Adds the Dormitory Management About page, AboutIntroSection, discoverability links, and page-set expectations.

## Impact

- Affected source:
  - `src/faculties/dormitory-management/pages`
  - `src/faculties/dormitory-management/components`
  - `src/faculties/dormitory-management/faculty.config.js`
  - `src/faculties/dormitory-management/data/search-data.json`
- No backend, API, or dependency changes.
- Verification should include OpenSpec validation and selected Dormitory build validation.
