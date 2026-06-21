## 1. Source Asset Migration

- [x] 1.1 Move `icon-traditional-medicine.svg`, `icon-nutrition.svg`, `icon-nursing.svg`, and `icon-food-science.svg` from `src/faculties/health-science/assets/svgs` to `src/shared/assets/svgs`.
- [x] 1.2 Remove or de-canonicalize empty `src/faculties/*/assets/svgs` directories so faculty SVG roots are no longer used as source locations.
- [x] 1.3 Search for code, docs, or config that still treats `src/faculties/*/assets/svgs` as a supported SVG source.

## 2. Development Resolver

- [x] 2.1 Update the Vite `/assets/svgs/*` dev resolver to resolve only from `src/shared/assets/svgs`.
- [x] 2.2 Ensure faculty-local SVG files cannot override shared SVG files during dev server resolution.

## 3. Usage-Based SVG Copy

- [x] 3.1 Replace the full-directory SVG copy call with a dedicated usage-based SVG copy plugin.
- [x] 3.2 Implement SVG reference extraction for absolute `/assets/svgs/x.svg` and relative `assets/svgs/x.svg` references in HTML-like source.
- [x] 3.3 Implement SVG reference extraction for supported data attributes such as `data-icon="/assets/svgs/x.svg"` and `data-pattern="/assets/svgs/x.svg"`.
- [x] 3.4 Implement SVG reference extraction for CSS `url('../assets/svgs/x.svg')` references.
- [x] 3.5 Implement SVG reference extraction for JavaScript string references such as `'/assets/svgs/x.svg'`.
- [x] 3.6 Normalize extracted SVG paths, reject traversal outside `src/shared/assets/svgs`, and copy matched files to `dist_iuh/assets/svgs`.
- [x] 3.7 Fail the build with a clear error that names missing SVG references and at least one referencing source file.

## 4. Verification

- [x] 4.1 Build Health Science and verify referenced SVGs, including the four moved major icons, exist in `dist_iuh/assets/svgs`.
- [x] 4.2 Build Dormitory and verify its referenced SVGs exist in `dist_iuh/assets/svgs`.
- [x] 4.3 Verify `dist_iuh/assets/svgs` is not a full copy of `src/shared/assets/svgs` for each selected faculty build.
- [x] 4.4 Add and run unit tests for SVG reference extraction, path normalization, missing-reference errors, and usage-based copying.
- [x] 4.5 Run OpenSpec validation for `centralize-svg-assets-and-prune-build-output`.
