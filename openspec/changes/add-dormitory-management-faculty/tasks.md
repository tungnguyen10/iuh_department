## 1. Dormitory Module Foundation

- [ ] 1.1 Record current git status and identify unrelated dirty files that must not be reverted.
- [ ] 1.2 Create `src/faculties/dormitory-management` with pages, components, data, and assets ownership roots.
- [ ] 1.3 Add `src/faculties/dormitory-management/faculty.config.js` with id, display name, source/output paths, style glob, and runtime module declarations.
- [ ] 1.4 Confirm `FACULTY=dormitory-management` resolves the new module instead of falling back to Health Science.

## 2. Home Page And Dormitory Sections

- [ ] 2.1 Create `pages/index.html` with layout metadata and the requested home composition.
- [ ] 2.2 Add a Dormitory-owned carousel component with Dormitory-specific copy, image references, and carousel initializer if needed.
- [ ] 2.3 Add Dormitory-owned infrastructure section and card markup using Dormitory-specific copy, images, and links.
- [ ] 2.4 Add Dormitory-specific stats content using shared stats card UI or a faculty-owned wrapper around shared cards.
- [ ] 2.5 Add Dormitory-specific news content using shared news card/carousel UI or a faculty-owned wrapper around shared cards.
- [ ] 2.6 Add Dormitory-specific partners content using shared partner logo/card UI or a faculty-owned wrapper around shared cards.
- [ ] 2.7 Audit the built home page source for Health Science-only text and replace any leakage.

## 3. Contact Page

- [ ] 3.1 Create `pages/contact.html` using the shared layout, header, footer, breadcrumb style, and Dormitory-specific contact content.
- [ ] 3.2 Replace Health Science or generic-only contact text with Dormitory Management address, phone, email, office hours, or documented placeholder values.
- [ ] 3.3 Confirm contact page links and icons resolve under the selected Dormitory build.

## 4. Data, Assets, And Runtime Isolation

- [ ] 4.1 Add Dormitory-specific `data/search-data.json` for search modal results.
- [ ] 4.2 Add Dormitory image assets or intentionally use shared defaults with Dormitory-specific text until real assets are available.
- [ ] 4.3 Ensure Dormitory-owned runtime modules are declared in Dormitory `faculty.config.js` and not hard-coded in `src/main.js`.
- [ ] 4.4 Ensure shared runtime modules still initialize header, footer, search, stats, news, and partners for the Dormitory site.
- [ ] 4.5 Search active source for accidental Dormitory references to `src/faculties/health-science` or Health Science-only assets.

## 5. Verification And Documentation

- [ ] 5.1 Run `FACULTY=dormitory-management npm.cmd run build` and confirm the build succeeds.
- [ ] 5.2 Inspect Dormitory output for home, contact, selected data, shared assets, and Dormitory-owned assets.
- [ ] 5.3 Verify Dormitory search modal uses Dormitory search data.
- [ ] 5.4 Run `FACULTY=health-science npm.cmd run build` and confirm the existing Health Science build still succeeds.
- [ ] 5.5 Run `openspec validate add-dormitory-management-faculty --strict`.
- [ ] 5.6 Update README and/or `docs/source-overview.md` with the new `dormitory-management` faculty id and build command.
