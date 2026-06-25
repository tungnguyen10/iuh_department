## Why

The build-time renderer templates for news and activities cards live as string literals inside `vite.config.js`. Tailwind's `content` glob only scans `src/shared/**/*.{html,js}` and `src/faculties/**/*.{html,js}`, so arbitrary-value classes used inside those templates (e.g. `h-[72px]`, `w-[70px]`, `gap-[21px]`, `md:h-[85px]`) are never seen by the JIT and never emitted. The most recent symptom is the activities sidebar card on `activities-details.html`: its `<figure>` loses `h-[72px] w-[72px] md:h-[85px] md:w-[85px]`, so the natural-resolution image stretches the column and breaks the mobile layout. Beyond the bug, locating presentational markup in build config also blocks designers and component owners from discovering/editing card visuals next to the components they belong to.

## What Changes

- Extract the news renderer templates (`card`, `eventCard`, `sidebarCard`, `articleBlock`, `section`, `detail`) from `vite.config.js` into a dedicated module under `src/shared/components/news/` (e.g. `news-renderer.js`) that exports a `createNewsRenderer(base, facultyDataRoot)` function.
- Extract the activities renderer templates (`card`, `listCard`, `sidebarCard`, `activityMeta`, `articleBlock`, `detail`, `categoryItems`) from `vite.config.js` into a dedicated module under the activities feature folder (e.g. `src/shared/components/activities/activities-renderer.js`, or `src/faculties/_template/...` if the activities pattern is faculty-scoped) that exports `createActivitiesRenderer(base, facultyDataRoot)`.
- Update `vite.config.js` to import the two renderer factories instead of defining them inline. The build plugin keeps owning data loading and the `transformIndexHtml` wiring; only the HTML-producing templates move out.
- Keep helper utilities that are clearly build-only (`escapeHtml`, `withBase`, attribute strippers, JSON loaders) in `vite.config.js` or move them to a tiny shared util module — whichever keeps the renderer modules free of Node-only APIs.
- Verify that every arbitrary-value Tailwind class previously living in the inlined templates is preserved and now correctly emitted by the build.
- **BREAKING (internal only)**: The signature of the templates does not change publicly (none was exported), but build authors who patched `vite.config.js` to tweak card markup must now edit the new renderer modules.

## Capabilities

### New Capabilities
<!-- None: this change is a structural refactor of an existing capability's implementation. -->

### Modified Capabilities
- `shared-news-content`: News presentation templates SHALL live inside files scanned by Tailwind's `content` config so JIT class generation works for every class used by the rendered output.
- `site-runtime-stability`: The Vite build plugin SHALL compose news and activities renderers from modules under `src/`, so presentational class names used at build time remain inside Tailwind's scan paths.

## Impact

- Affected source: `vite.config.js`, new modules under `src/shared/components/news/` and (for activities) `src/shared/components/activities/` or the faculty activities components folder, plus any existing entry that re-exports renderer helpers.
- Build/runtime: no change to the data shape or the `data-news-*` / `data-activities-*` HTML contracts; output HTML SHOULD be byte-equivalent except for previously missing class effects. Tailwind generates additional CSS rules (the arbitrary-value classes that were missing).
- Tooling: no new dependencies. `tailwind.config.js` does not need a `vite.config.js` entry in `content` after this refactor.
- Verification: run a Dormitory Management build and inspect the compiled CSS for `h-[72px]`, `w-[70px]`, `h-[130px]`, `md:h-[85px]`, `gap-[21px]`, `md:w-[30px]` etc.; spot-check `activities-details.html`, `news-detail.html`, and the news/activities list pages at mobile and desktop breakpoints.
