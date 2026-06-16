# Baseline Inventory

Change: `introduce-multi-faculty-architecture`
Date: 2026-06-16

This file records the Phase 0 baseline before any source files are moved.

## Git Status Before Implementation

Observed before migration edits:

```text
 M package-lock.json
 M yarn.lock
?? docs/
?? openspec/changes/introduce-multi-faculty-architecture/
```

Guardrail: these changes existed before implementation work in this session and must not be reverted as part of the migration. The lockfile changes, docs directory, and OpenSpec change directory are treated as pre-existing user/workflow state unless a later task intentionally edits them.

## Build Baseline

Canonical command attempted:

```bash
yarn build
```

Result: failed in this shell because `yarn` is not on `PATH`.

Equivalent command used through Corepack:

```bash
corepack yarn build
```

Result: passed.

Baseline output:

- Output directory: `dist_iuh/`
- HTML pages generated: 13
- Runtime data copied to `dist_iuh/data/`
- Images copied to `dist_iuh/assets/images/`
- SVGs copied to `dist_iuh/assets/svgs/`

Generated HTML page set:

```text
about.html
contact.html
document-detail.html
form.html
index.html
leadership-detail.html
leadership.html
major-detail.html
majors.html
news-detail.html
news.html
partners.html
students.html
```

## Page Baseline

Current source pages in `src/pages`:

| Page | Baseline role |
| --- | --- |
| `about.html` | About Health Science faculty |
| `contact.html` | Contact page |
| `document-detail.html` | PDF/document detail page |
| `form.html` | Form controls/style demo |
| `index.html` | Homepage |
| `leadership-detail.html` | Leadership/person detail |
| `leadership.html` | Leadership listing |
| `major-detail.html` | Major detail |
| `majors.html` | Major listing |
| `news-detail.html` | News detail |
| `news.html` | News listing |
| `partners.html` | Partners page |
| `students.html` | Student information page |

Confirmed expected baseline: 13 HTML pages.

## Runtime Data Inventory

Current runtime data source root: `public/data`.

| File | Current consumer | Baseline runtime URL |
| --- | --- | --- |
| `search-data.json` | `src/components/search/search-modal.js` via `dataUrl('data/search-data.json')` | `/data/search-data.json` |
| `quiz-data.json` | `src/components/major/major-quiz.js` via `import.meta.env.BASE_URL` default | `/data/quiz-data.json` |
| `messages-vi.json` | `src/js/i18n.js` when `initI18n()` is enabled | `/data/messages-vi.json` |
| `messages-en.json` | `src/js/i18n.js` when `initI18n()` is enabled | `/data/messages-en.json` |

Migration note: `search-data.json` and `quiz-data.json` are faculty content data. The message files are currently platform i18n messages, but task 4.4 will make the final ownership decision when data moves.

## Document Inventory

Current document source root: `public/assets/documents`.

| File | Current consumer | Expected public output URL |
| --- | --- | --- |
| `TB-1856-2025.pdf` | `src/pages/document-detail.html` PDF object/embed/download controls | `/assets/documents/TB-1856-2025.pdf` |

Additional note: `src/pages/partners.html` references `/assets/documents/partnership-info.pdf`, but that file is not present in the current document source inventory.

## Component Classification

Initial classification follows the architecture rule: shared by default, faculty-owned only when the module is clearly Health Science-specific, and defer when ownership depends on future content/config decisions.

| Group | Components | Rationale |
| --- | --- | --- |
| Shared | `button`, `common`, `footer`, `header`, `loading`, `modal`, `search`, `sidebar`, `tabs` | Platform UI, global shell, reusable cards/utilities, or cross-page widgets |
| Shared candidate | `news`, `partners`, `stats` | Reusable site sections/cards if future faculties can drive text/images by data or config |
| Health Science faculty | `admission`, `carousel`, `careers`, `industry-careers`, `industry-partnerships`, `infrastructure`, `intro`, `major`, `research` | Homepage composition, faculty/program content, or Health Science domain modules |
| Defer / needs decision | `leadership` | Could be shared if a generic people/organization model is introduced; keep as Health Science-specific until reuse is proven |

## Asset Classification

Initial classification follows the architecture rule: fonts, IUH/system identity, generic icons, favicons, social icons, and true defaults are shared; banners, lab/activity photos, partner logos, program visuals, and faculty documents are faculty-owned.

| Group | Assets | Rationale |
| --- | --- | --- |
| Shared | `src/assets/fonts/*`, `src/assets/images/favicons/*`, `src/assets/images/default.jpg`, `src/assets/images/default-1.jpg`, `src/assets/images/fb.png`, `src/assets/images/x.png`, `src/assets/images/zalo.png`, generic UI/system SVGs, IUH logos | Platform identity, defaults, fonts, social/system icons |
| Health Science faculty | `src/assets/images/banner.jpg`, `src/assets/images/bannerMB.jpg`, `src/assets/images/intro-image.png`, `src/assets/images/activities-*.jpg`, `src/assets/images/bg-major.jpg`, `src/assets/images/bg-research.jpg`, `src/assets/images/partners/*`, `public/assets/documents/TB-1856-2025.pdf`, major/domain SVGs such as `icon-nursing.svg`, `icon-nutrition.svg`, `icon-traditional-medicine.svg`, `icon-food-science.svg` | Faculty content, major visuals, partner imagery, and faculty document |
| Defer / needs decision | `src/assets/images/bg-cta.png`, `src/assets/images/eng.webp`, `src/assets/images/vietnam.png`, decorative SVGs such as `blob.svg`, `hexagon.svg`, `pattern-cog.svg`, `core-deco.svg`, `learning-grid.svg`, `rocket.svg` | May be platform decoration or current-site-specific visual language; classify during asset move after usage search |

## Temporary Compatibility Policy

Temporary compatibility is allowed only to keep each phase buildable.

| Compatibility rail | Current or future use | Owner phase | Removal condition |
| --- | --- | --- | --- |
| `@components/...` include alias | Current canonical include alias in pages/components; may bridge to `src/shared/components` during migration | Phases 4-9 | Remove after all migrated includes use `@shared/components/...` or `@faculty/components/...`, unless explicitly documented as a long-term public alias |
| Legacy `src/pages` root | Current page source root before page move | Phase 2 | Remove after pages move to `src/faculties/health-science/pages` and Vite input reads selected faculty pages |
| Legacy `public/data` copy source | Current runtime data source before faculty data move | Phase 3 | Remove after selected faculty data copies to `/data/` successfully |
| Legacy `public/assets/documents` source | Current PDF source before faculty document move | Phase 3 | Remove after selected faculty documents copy to `/assets/documents/` successfully |
| Legacy `src/assets` root | Current mixed shared/faculty asset source before classification | Phases 4-7 | Remove or narrow after shared/faculty assets have canonical roots and output paths are verified |
| Legacy `src/components`, `src/layouts`, `src/styles`, `src/js` roots | Current shared/faculty mixed roots before shared platform move | Phases 4-9 | Remove after imports/includes point to `src/shared` or selected faculty roots |

No compatibility rail may be added without a matching stale-reference search and cleanup task in the same or next phase.

## Baseline No-Move Verification

At the end of Phase 0, no source files have been moved. The working tree still reports only the pre-existing lockfile/docs/OpenSpec state plus this baseline inventory and task checkbox updates.

## Phase 1 Build Foundation Verification

Implemented in `vite.config.js`:

- `FACULTY` selection defaults to `health-science`.
- Source path helpers now resolve:
  - repository root
  - `src/shared`
  - selected faculty root
  - selected faculty pages root
  - selected faculty data root
  - selected faculty assets root
  - legacy `src/pages` root
- HTML input discovery now uses the selected faculty pages root when present.
- While `src/faculties/health-science/pages` has not been created yet, the `health-science` build uses legacy `src/pages` as a temporary compatibility page root.
- A non-`health-science` missing faculty fails with a clear error that names the missing directory.

Verification commands:

```bash
corepack yarn build
FACULTY=health-science corepack yarn build
FACULTY=unknown-faculty corepack yarn build
```

Results:

| Command | Result |
| --- | --- |
| `corepack yarn build` | Passed; generated the 13-page Health Science baseline |
| `FACULTY=health-science corepack yarn build` | Passed; currently equivalent to the legacy baseline |
| `FACULTY=unknown-faculty corepack yarn build` | Failed as expected with `FACULTY="unknown-faculty" does not match an existing faculty directory...` |

Temporary resolver/support added in this phase:

| Compatibility rail | Why it exists | Removal condition |
| --- | --- | --- |
| `health-science` legacy page-root fallback to `src/pages` | Allows the explicit faculty build to pass before task 3 moves pages into `src/faculties/health-science/pages` | Remove after page migration verifies that selected faculty pages are the canonical input |

Future-root search:

```bash
rg -n "src/faculties|src/shared|@shared|@faculty|selectedFaculty|FACULTY" vite.config.js src README.md docs openspec/changes/introduce-multi-faculty-architecture
```

Findings: source/runtime usage is limited to the new Vite faculty helpers. Other matches are architecture docs, the OpenSpec change artifacts, and task text. No accidental `@shared` or `@faculty` runtime/include usage was introduced before those roots exist.

## Phase 2 Page Migration Verification

Implemented:

- Created `src/faculties/health-science/pages`.
- Moved all 13 baseline HTML pages from `src/pages` to `src/faculties/health-science/pages`.
- Removed empty `src/pages`.
- Updated Vite HTML input discovery to use the selected faculty pages root.
- Updated dev/preview URL mapping so root page URLs still resolve to selected faculty pages.
- Replaced the layout's hard-coded `../main.js` assumption with a Vite-computed relative main script path.
- Removed the Phase 1 legacy `src/pages` fallback from active Vite page resolution.
- Updated README and `docs/source-overview.md` page-location notes so contributor docs no longer describe `src/pages` as the page source root.

Verification commands:

```bash
FACULTY=health-science corepack yarn build
corepack yarn build
find dist_iuh -maxdepth 1 -type f -name '*.html'
rg -n "src/pages" src vite.config.js scripts README.md docs openspec/changes/introduce-multi-faculty-architecture
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| `corepack yarn build` | Passed; default remains compatible with Health Science |
| Generated page output | 13 baseline pages are present at root-level output paths under `dist_iuh/` |
| `src/pages` directory | Removed |
| Stale `src/pages` search | No source, build config, script, README, or docs usage remains; remaining matches are OpenSpec history/task text and this baseline record |

Generated root-level page output:

```text
about.html
contact.html
document-detail.html
form.html
index.html
leadership-detail.html
leadership.html
major-detail.html
majors.html
news-detail.html
news.html
partners.html
students.html
```

## Phase 3 Data And Document Migration Verification

Implemented:

- Created `src/faculties/health-science/data`.
- Moved `search-data.json`, `quiz-data.json`, `messages-vi.json`, and `messages-en.json` into the Health Science data root.
- Classified the current message JSON files as Health Science faculty runtime data for this migration phase because they are emitted with the selected faculty build and consumed from `/data/messages-<lang>.json`.
- Created `src/faculties/health-science/assets/documents`.
- Moved `TB-1856-2025.pdf` into the Health Science documents source root.
- Removed the old `public` source tree after the selected-faculty copy output was verified.
- Replaced the old `public/data` copy plugin with selected-faculty data and document copy plugins.
- Updated README and `docs/source-overview.md` so `public/data` and `public/assets/documents` are no longer described as canonical source roots.

Runtime URL compatibility:

| Source file | Output URL |
| --- | --- |
| `src/faculties/health-science/data/search-data.json` | `/data/search-data.json` |
| `src/faculties/health-science/data/quiz-data.json` | `/data/quiz-data.json` |
| `src/faculties/health-science/data/messages-vi.json` | `/data/messages-vi.json` |
| `src/faculties/health-science/data/messages-en.json` | `/data/messages-en.json` |
| `src/faculties/health-science/assets/documents/TB-1856-2025.pdf` | `/assets/documents/TB-1856-2025.pdf` |

Verification commands:

```bash
FACULTY=health-science corepack yarn build
find dist_iuh/data -maxdepth 1 -type f
find dist_iuh/assets/documents -maxdepth 1 -type f
rg -n "public/data|public/assets/documents|copy-public-data|Copy public/data" src vite.config.js README.md docs openspec/changes/introduce-multi-faculty-architecture
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| Generated data output | `messages-en.json`, `messages-vi.json`, `quiz-data.json`, and `search-data.json` are present under `dist_iuh/data/` |
| Generated document output | `TB-1856-2025.pdf` is present under `dist_iuh/assets/documents/` |
| Runtime data URL safety | Search still uses `dataUrl('data/search-data.json')`; major quiz still derives `/data/quiz-data.json` from `import.meta.env.BASE_URL` |
| Old public source roots | Removed; no active source, build config, README, or docs references remain |

Known pre-existing content note: `src/faculties/health-science/pages/partners.html` references `/assets/documents/partnership-info.pdf`, but that source document was not present in the baseline inventory and remains outside this migration task.

## Phase 4 Shared Platform Migration Verification

Implemented:

- Created `src/shared/components`, `src/shared/layouts`, `src/shared/styles`, `src/shared/js`, and `src/shared/assets`.
- Moved `src/layouts/default.html` to `src/shared/layouts/default.html`.
- Moved shared runtime utilities from `src/js` to `src/shared/js`.
- Moved shared styles from `src/styles` to `src/shared/styles`.
- Moved shared fonts from `src/assets/fonts` to `src/shared/assets/fonts`.
- Moved shared/global component groups to `src/shared/components`: `button`, `common`, `footer`, `header`, `loading`, `modal`, `search`, `sidebar`, `tabs`, `news`, `partners`, and `stats`.
- Updated `src/main.js` to import shared styles, shared JS utilities, shared component styles, shared search, tabs, news, partners, stats, header, and footer from `src/shared`.
- Updated Vite layout and loading reads to `src/shared`.
- Added `@shared/components/...` include resolution and `@shared` alias support.
- Migrated includes for moved shared component groups from `@components/...` to `@shared/components/...`.
- Removed old `src/layouts`, `src/styles`, `src/js`, and `src/assets/fonts` roots.

Verification commands:

```bash
FACULTY=health-science corepack yarn build
rg -n "@components/(button|common|footer|header|loading|modal|search|sidebar|tabs|news|partners|stats)|@components/components|components/components|assets/images/components|src/(layouts|styles|js)" src vite.config.js README.md docs
rg -n "site-header|search-modal|loading|footer|tabs-container|section-title|news-carousel" dist_iuh/index.html dist_iuh/about.html dist_iuh/majors.html
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| Shared stale include/import search | No active source, config, README, or docs findings |
| Legacy shared roots | `src/layouts`, `src/styles`, `src/js`, and `src/assets/fonts` removed |
| Generated HTML spot check | Loading overlay, footer, search modal, shared news carousel, and common/shared includes are present in generated output |

Temporary compatibility remaining after this phase:

| Compatibility rail | Why it remains | Removal condition |
| --- | --- | --- |
| `@components/...` include alias | Still required for Health Science-specific component groups that have not yet moved from `src/components` | Remove after Phase 5 moves faculty components and no `@components` include usage remains |
| `src/components` root | Still contains not-yet-moved Health Science-specific components | Remove after Phase 5 moves those components into `src/faculties/health-science/components` |

## Phase 5 Faculty Component Migration Verification

Implemented:

- Created `src/faculties/health-science/components`.
- Moved remaining Health Science-specific component groups out of `src/components`.
- Created `src/faculties/health-science/components/home` for homepage composition modules.
- Moved homepage modules under `components/home`: `carousel`, `intro`, `admission`, `infrastructure`, `research`, and `industry-careers`.
- Kept feature/support groups at the faculty component root for now: `major`, `leadership`, `careers`, and `industry-partnerships`.
- Recorded leadership as Health Science-specific for this migration phase because no second-faculty reuse/data model exists yet.
- Updated faculty-owned includes to `@faculty/components/...`.
- Added `@faculty/components/...` include resolution and `@faculty` alias support.
- Updated `src/main.js` faculty component imports to `src/faculties/health-science/components/...`.
- Removed the old `src/components` root.
- Removed the temporary `@components` resolver and alias after all active includes were migrated.

Verification commands:

```bash
FACULTY=health-science corepack yarn build
test ! -e src/components
rg -n "@components|src/components|\\.\\/components|/components/" src vite.config.js README.md docs openspec/changes/introduce-multi-faculty-architecture
rg -n "hero-swiper|major-swiper|admission-swiper|infrastructure-swiper|business-connection-swiper|industry-partnership-swiper|pattern-canvas|avatar-teacher" dist_iuh/index.html dist_iuh/leadership.html
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| Legacy component root | `src/components` removed |
| Active `@components` include usage | Removed from active source/config |
| Faculty render spot check | Homepage module selectors and leadership avatar selectors are present in generated output |

Documentation note: README and `docs/source-overview.md` still need the broader final architecture rewrite covered by Phase 9 documentation tasks. Active source/config no longer uses `src/components` or `@components`.

## Phase 6 Asset Migration Verification

Implemented:

- Created `src/shared/assets/images`, `src/shared/assets/svgs`, `src/faculties/health-science/assets/images`, and `src/faculties/health-science/assets/svgs`.
- Kept shared defaults, favicons, social/language images, IUH logos, system icons, shared decorative SVGs, and fonts under `src/shared/assets`.
- Moved Health Science images into `src/faculties/health-science/assets/images`: banners, intro image, activity images, partner images, major background, and research background.
- Moved Health Science major/domain SVGs into `src/faculties/health-science/assets/svgs`.
- Updated shared SCSS asset URLs to resolve from `src/shared/styles` into `src/shared/assets`.
- Updated Vite asset copy plugins to merge shared and selected-faculty image/SVG roots into the existing public output URLs.
- Preserved runtime public paths such as `/assets/images/...`, `/assets/svgs/...`, `/assets/fonts/...`, and `/assets/documents/...`.
- Removed the old `src/assets` source root.
- Updated README and `docs/source-overview.md` asset-source references for the new shared/faculty roots.

Asset classification after migration:

| Classification | Source roots/files |
| --- | --- |
| Shared images | `src/shared/assets/images/default*.jpg`, `bg-cta.png`, favicons, `fb.png`, `x.png`, `zalo.png`, `eng.webp`, `vietnam.png` |
| Shared SVGs | `src/shared/assets/svgs/*` except Health Science domain icons |
| Shared fonts | `src/shared/assets/fonts/*` |
| Health Science images | `src/faculties/health-science/assets/images/*`, including `partners/*` |
| Health Science SVGs | `src/faculties/health-science/assets/svgs/icon-nursing.svg`, `icon-nutrition.svg`, `icon-traditional-medicine.svg`, `icon-food-science.svg` |
| Health Science documents | `src/faculties/health-science/assets/documents/TB-1856-2025.pdf` |

Verification commands:

```bash
FACULTY=health-science corepack yarn build
find dist_iuh/assets/images -maxdepth 2 -type f
find dist_iuh/assets/svgs -maxdepth 1 -type f
find dist_iuh/assets/fonts -maxdepth 1 -type f
find dist_iuh/assets/documents -maxdepth 1 -type f
find src/shared/assets src/faculties/health-science/assets -maxdepth 3 -type f
test ! -e src/assets
rg -n "src/assets|assets/images/components|\\.\\./\\.\\./assets|\\.\\./assets/(images|svgs|fonts)" src vite.config.js README.md docs openspec/changes/introduce-multi-faculty-architecture
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| Generated image assets | 33 files copied to `dist_iuh/assets/images`, including favicons, social/language images, default images, banners, activity images, and partners |
| Generated SVG assets | 83 files copied to `dist_iuh/assets/svgs`, including shared icons/logos and Health Science domain icons |
| Generated fonts | Roboto and Inter variable fonts emitted to `dist_iuh/assets/fonts` |
| Generated documents | `TB-1856-2025.pdf` emitted to `dist_iuh/assets/documents` |
| Legacy asset root | `src/assets` removed |
| Stale source asset references | No active source, build config, README, or docs references to the old `src/assets` canonical root remain |

Search note: the remaining `src/assets` matches are historical OpenSpec proposal/design/baseline text and task prompts. The remaining `../assets/...` matches are current relative SCSS URLs from `src/shared/styles` to `src/shared/assets`, not references to the removed legacy root.

## Phase 7 Faculty Runtime Configuration Verification

Implemented:

- Created `src/faculties/health-science/faculty.config.js`.
- Added Health Science metadata, source path declarations, output URL declarations, faculty component style glob, and faculty runtime module descriptors.
- Moved Health Science-specific runtime component imports out of `src/main.js` and into the faculty config.
- Kept shared/global runtime initializers in `src/main.js`: search modal, SVG inlining, fade-in behavior, article actions, PDF fallback, header/footer, global widgets, module manager, and shared component modules.
- Updated `src/main.js` to import the selected faculty config through the `@faculty/faculty.config.js` alias.
- Consolidated runtime module initialization through one safe initializer that supports optional `window` assignment for the major quiz.
- Removed the separate major quiz special import path from `src/main.js`; `majorQuizInstance` is now assigned through the faculty runtime descriptor.

Verification commands:

```bash
FACULTY=health-science corepack yarn build
rg -n "faculties/health-science|health-science/components|./components/(home|major|careers|leadership|industry-partnerships)" src/main.js
rg -n "site-header|hamburger-menu|search-modal|hero-swiper|majorQuiz|tabs-container|pdf-object|js-share-facebook|scrollToTop|socialToggle" dist_iuh/index.html dist_iuh/majors.html dist_iuh/news-detail.html dist_iuh/document-detail.html
find dist_iuh/assets/js -maxdepth 1 -type f
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| `src/main.js` hard-coded Health Science component imports | Removed; `src/main.js` imports only `@faculty/faculty.config.js` for faculty runtime declarations |
| Faculty runtime chunks | Faculty chunks still emitted for carousel, major, admission, intro, infrastructure, careers, leadership, industry partnerships, research pattern canvas, and major quiz |
| Shared runtime chunks | Header, footer, news, stats, partners, tabs, and shared runtime code still emitted |
| Generated hook spot check | Header/hamburger, search modal, homepage carousels, major quiz, article actions, PDF object, scroll-to-top, social widgets, and SVG references are present in generated output |

Selector ownership note: shared selectors and faculty selectors are now initialized from separate descriptor lists and passed through the same `safeInit` function once, which avoids duplicate module-specific code paths in `src/main.js`.

## Phase 8 Compatibility Cleanup Verification

Implemented:

- Confirmed active source/config no longer uses `@components`.
- Confirmed the temporary `@components` resolver and Vite alias were already removed after faculty component migration.
- Removed the remaining generic Vite `publicDir` fallback by setting `publicDir: false`; selected faculty copy plugins are now the only active data/document/static asset output path.
- Updated the shared modal component README so local examples refer to `src/shared/components` and `@shared/components/...`.
- Confirmed obsolete roots are absent: `src/pages`, `src/components`, `src/assets`, `src/layouts`, `src/styles`, `src/js`, and `public`.
- Confirmed migrated categories have one canonical source location each:
  - pages: `src/faculties/health-science/pages`
  - shared components: `src/shared/components`
  - faculty components: `src/faculties/health-science/components`
  - shared runtime JS: `src/shared/js`
  - shared styles: `src/shared/styles`
  - shared assets: `src/shared/assets`
  - faculty data/documents/assets: `src/faculties/health-science/{data,assets}`

Long-term aliases kept:

| Alias | Target | Policy |
| --- | --- | --- |
| `@shared` | `src/shared` | Long-term shared platform import alias |
| `@faculty` | selected faculty root | Long-term selected-faculty import alias |
| `@js` | `src/shared/js` | Existing convenience alias for shared JS |
| `@styles` | `src/shared/styles` | Existing convenience alias for shared styles |
| `@assets` | `src/shared/assets` | Existing convenience alias for shared assets |

Verification commands:

```bash
FACULTY=health-science corepack yarn build
test ! -e src/pages && test ! -e src/components && test ! -e src/assets && test ! -e src/layouts && test ! -e src/styles && test ! -e src/js && test ! -e public
rg -n "publicRoot|publicDir|public/data|public/assets/documents|src/components|@components|src/pages|src/assets|src/layouts|src/styles|src/js" vite.config.js src README.md docs openspec/changes/introduce-multi-faculty-architecture
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| Legacy directories | All removed |
| `@components` active source/config usage | None |
| Public fallback copy path | Removed; `publicDir` is explicitly disabled |
| Remaining stale-reference search findings | Historical OpenSpec text plus README and `docs/source-overview.md` sections queued for Phase 10 documentation rewrite |

## Phase 9 Documentation Update Verification

Implemented:

- Rewrote `README.md` around the final `Shared Platform + Faculty Modules` architecture.
- Added explicit `FACULTY=health-science corepack yarn build` documentation.
- Documented page, data, document, asset, component, style, and JavaScript ownership rules.
- Documented how to add pages, shared components, faculty components, and a new faculty module.
- Documented long-term aliases and confirmed `@components` is not retained.
- Rewrote `docs/source-overview.md` so it reflects the final source tree and ownership rules.
- Added shared vs Health Science component classification in `docs/source-overview.md`.
- Added shared vs Health Science asset/data/document classification in both docs.

Verification commands:

```bash
FACULTY=health-science corepack yarn build
rg -n "@components|src/components|src/pages|src/assets|src/layouts|src/styles|src/js|public/data|public/assets/documents|\\.\\/components|\\.\\/assets|\\.\\/js" README.md docs src vite.config.js
```

Results:

| Check | Result |
| --- | --- |
| `FACULTY=health-science corepack yarn build` | Passed |
| README architecture | Updated to final shared/faculty structure |
| Source overview | Updated to final shared/faculty structure |
| Intentional stale-search matches | README/docs explicitly saying old roots are not canonical, `@components` is removed, config-local relative imports in `faculty.config.js`, relative shared SCSS asset URLs, and a shared-relative import in `search-modal.js` |

## Phase 10 Final Verification

Commands run:

```bash
openspec status --change introduce-multi-faculty-architecture
openspec validate introduce-multi-faculty-architecture --strict
openspec validate site-runtime-stability --strict
FACULTY=health-science corepack yarn build
corepack yarn build
find dist_iuh -maxdepth 1 -type f -name '*.html' -exec basename {} \; | sort
find dist_iuh/data -maxdepth 1 -type f -exec basename {} \; | sort
find dist_iuh/assets/documents -maxdepth 1 -type f -exec basename {} \; | sort
find dist_iuh/assets/images -maxdepth 2 -type f | wc -l
find dist_iuh/assets/svgs -maxdepth 1 -type f | wc -l
find dist_iuh/assets/fonts -maxdepth 1 -type f | wc -l
rg -n "data/search-data.json|data/quiz-data.json|pdf-object|TB-1856-2025.pdf|initSearchModal|majorQuizInstance|initTabs|components-loaded|scrollToTop|socialToggle" src dist_iuh/majors.html dist_iuh/document-detail.html dist_iuh/assets/js/main.js
rg -n "@components|src/components|src/pages|src/assets|src/layouts|src/styles|src/js|public/data|public/assets/documents|health-science/components" src vite.config.js README.md docs openspec/changes/introduce-multi-faculty-architecture
```

Results:

| Check | Result |
| --- | --- |
| OpenSpec status | 4/4 artifacts complete |
| Change validation | Passed strict validation |
| Existing `site-runtime-stability` spec validation | Passed strict validation |
| Explicit selected-faculty build | Passed |
| Default/root build path | Passed; defaults to `health-science` |
| Generated page set | 13 pages: `about`, `contact`, `document-detail`, `form`, `index`, `leadership-detail`, `leadership`, `major-detail`, `majors`, `news-detail`, `news`, `partners`, `students` |
| Data output | `messages-en.json`, `messages-vi.json`, `quiz-data.json`, `search-data.json` |
| Document output | `TB-1856-2025.pdf` |
| Asset output | 33 images, 83 SVGs, 4 fonts |
| Search data hook | `search-modal.js` uses `dataUrl('data/search-data.json')`; generated bundle includes the selected-faculty data URL |
| Major quiz data hook | `major-quiz.js` resolves `/data/quiz-data.json`; faculty config assigns `majorQuizInstance` through a single runtime descriptor |
| PDF detail | Generated `document-detail.html` references `/assets/documents/TB-1856-2025.pdf` in object/embed/download controls and `initPDFViewer()` remains gated by `#pdf-object` |
| Initialization path review | Shared runtime modules and faculty runtime modules are merged once in `src/main.js`; header/footer/search/tabs/PDF/article/global widgets each have a single shared initialization path |
| Stale-reference search | Remaining matches are historical OpenSpec text, README/docs statements documenting removed roots/aliases, canonical Health Science component paths, or current relative paths inside their owning roots |

Note: final runtime double-initialization verification was performed by static code path review and generated-output hook checks, not by browser automation.
