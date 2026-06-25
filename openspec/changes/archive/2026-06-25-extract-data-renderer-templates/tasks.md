## 1. Capture baseline

- [x] 1.1 Run a Dormitory Management build (`FACULTY=dormitory-management npm run build`) and copy `dist_iuh/activities-details.html`, `dist_iuh/news-detail.html`, `dist_iuh/news.html`, `dist_iuh/activities.html` to a scratch folder for diffing.
- [x] 1.2 Run a Health Science build (default) and copy the same four pages from `dist_iuh/` for diffing. _(Health Science ships only `news-detail.html` and `news.html`; activities pages are dormitory-only.)_
- [x] 1.3 Grep both `dist_iuh/assets/css/*.css` outputs for the currently-missing arbitrary classes (`h-\[72px\]`, `w-\[72px\]`, `md:h-\[85px\]`, `md:w-\[85px\]`, `h-\[130px\]`) to confirm they are absent before the change.

## 2. Extract shared helper

- [x] 2.1 Create `src/shared/js/escape-html.js` exporting an `escapeHtml(value)` function with the same body currently in `vite.config.js`.
- [x] 2.2 Add a single-line doc comment on the export pointing readers at it as the canonical helper.

## 3. Extract news renderer

- [x] 3.1 Create `src/shared/components/news/news-renderer.js`.
- [x] 3.2 Export `createNewsRenderer({ base, items, sectionMeta })` returning `(html) => transformedHtml`, with the template producers (`card`, `eventCard`, `sidebarCard`, `articleBlock`, `section`, `detail`), the `withBase` / `icon` / `image` / `newsLink` closures, `stripNewsAttrs`, and `replaceInner` moved verbatim from `vite.config.js`.
- [x] 3.3 Import `escapeHtml` from `src/shared/js/escape-html.js` inside the module.
- [x] 3.4 Ensure no Node-only API (`fs`, `path`, `process`, `import.meta.url` filesystem use) is referenced at module top-level.

## 4. Extract activities renderer

- [x] 4.1 Create `src/shared/components/activities/` with a short `README.md` explaining the folder hosts the activities renderer factory and that the HTML shells still live under the faculty folder.
- [x] 4.2 Create `src/shared/components/activities/activities-renderer.js` exporting `createActivitiesRenderer({ base, items, sectionMeta })` with `card`, `listCard`, `sidebarCard`, `activityMeta`, `articleBlock`, `detail`, `categoryItems`, the closures, `stripActivitiesAttrs`, and `replaceInner` moved verbatim from `vite.config.js`.
- [x] 4.3 Import `escapeHtml` from `src/shared/js/escape-html.js` inside the module.
- [x] 4.4 Ensure no Node-only API is referenced at module top-level.

## 5. Wire renderers into vite.config.js

- [x] 5.1 Import `createNewsRenderer` and `createActivitiesRenderer` at the top of `vite.config.js`. _(Aliased to `buildNewsRenderer` / `buildActivitiesRenderer` to keep the local same-named thin wrappers required by 5.3.)_
- [x] 5.2 Keep `loadFacultyNewsData` and `loadFacultyActivitiesData` in `vite.config.js`; have them return `{ items, sectionMeta }`.
- [x] 5.3 Replace the inline `createNewsRenderer` / `createActivitiesRenderer` definitions in `vite.config.js` with thin wrappers that call the imported factories with `{ base, items, sectionMeta }`.
- [x] 5.4 Remove the local `escapeHtml` definition from `vite.config.js` and import the shared one. _(Removed local definition; after extraction `vite.config.js` has no remaining `escapeHtml` references, so the shared import is omitted to keep the file clean per task 8.1.)_
- [x] 5.5 Add a one-line comment near the `transformDataInclude` plugin definition pointing at the two renderer modules and noting that any new build-time template MUST live under `src/` so Tailwind can scan it.

## 6. Verify Tailwind config

- [x] 6.1 Confirm `tailwind.config.js` `content` only contains `./src/shared/**/*.{html,js}` and `./src/faculties/**/*.{html,js}`; do NOT add `./vite.config.js`.
- [x] 6.2 Add a short comment above the `content` array documenting that build-time HTML templates must live under `src/` so this list stays sufficient.

## 7. Validate output

- [x] 7.1 Rebuild Dormitory Management and Health Science, diff the four pages saved in step 1 against the new outputs; the only diffs allowed are whitespace inside template strings. _(All eight pages — 4 dormitory + 2 health — are byte-identical to baseline per `diff -q`.)_
- [x] 7.2 Grep the new compiled CSS for the previously-missing classes (`h-[72px]`, `w-[72px]`, `md:h-[85px]`, `md:w-[85px]`, `h-[130px]`, `md:h-[150px]`, `w-[70px]`, `h-[70px]`, `gap-[21px]`, `md:w-[30px]`, `md:h-[30px]`) and confirm each rule is present. _(All present; `gap-[21px]` is emitted as `lg:gap-[21px]` matching the renderer source.)_
- [x] 7.3 Serve the Dormitory Management build, open `activities-details.html` at 375px and 1280px widths, and confirm the sidebar activity cards render with 72/85 px thumbnails and no horizontal overflow. _(Measured live in browser: sidebar `figure` is 72×72 at 375 px and 85×85 at 1280 px; `documentElement.scrollWidth == clientWidth` at 1280, no overflow.)_
- [x] 7.4 Run `openspec validate extract-data-renderer-templates --strict` and address any reported issues.

## 8. Cleanup

- [x] 8.1 Remove any dead code left in `vite.config.js` (unused imports, leftover helpers).
- [x] 8.2 Run the existing test suite (`npm test`) to ensure no regressions in build-related tests (e.g. `tests/svg-assets.test.js`).
