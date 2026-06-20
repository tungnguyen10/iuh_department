## Context

The repository is currently a single Health Science faculty website built with Vite, static HTML pages, build-time component injection, SCSS/Tailwind, and Vanilla JavaScript runtime initialization from `src/main.js`.

Current source shape:

```text
src/
|-- pages/
|-- components/
|-- assets/
|-- layouts/
|-- styles/
|-- js/
`-- main.js
public/
|-- data/
`-- assets/documents/
```

Target architecture from `docs/iUH Faculty Website Architecture Stand.md`:

```text
src/
|-- shared/
|   |-- components/
|   |-- assets/
|   |-- layouts/
|   |-- styles/
|   `-- js/
|-- faculties/
|   `-- health-science/
|       |-- faculty.config.js
|       |-- pages/
|       |-- data/
|       |-- assets/
|       |-- components/
|       |-- styles/
|       `-- js/
`-- main.js
```

The migration touches build input discovery, component include resolution, runtime imports, asset copying, public data paths, page ownership, and documentation. It must therefore be phased. The current site must remain buildable at the end of every phase.

The most important implementation principle is: **clean as you go**. Temporary compatibility is allowed only to make a phase safe. It must have an owner, a removal condition, and a cleanup task in the same phase or the immediately following phase.

## Goals / Non-Goals

**Goals:**

- Create a multi-faculty architecture without changing the current HTML + component + SCSS + Vanilla JS stack.
- Make `health-science` the first faculty module by migrating the current site into `src/faculties/health-science`.
- Move reusable platform code into `src/shared`.
- Keep shared components in one canonical location.
- Make faculty-specific pages, data, documents, images, styles, JavaScript, and modules owned by the faculty.
- Support a faculty-aware build command such as `FACULTY=health-science yarn build`.
- Ensure each completed phase leaves no stale duplicate source of truth.
- Preserve existing root deployment behavior and current runtime functionality.
- Keep existing `site-runtime-stability` behavior as a regression boundary.

**Non-Goals:**

- No React/Vue/Next migration.
- No redesign of UI or visual language.
- No backend, CMS, or API migration.
- No new faculty website content beyond `health-science`.
- No full data-model conversion of all static HTML content unless needed for the architecture.
- No permanent dual architecture where old `src/pages` and new `src/faculties/<faculty>/pages` both remain canonical.

## Decisions

### Decision 1: Use `src/shared` and `src/faculties/<faculty>` as canonical roots

The final architecture will have two primary ownership roots:

- `src/shared`: reusable platform code and assets.
- `src/faculties/<faculty>`: faculty-owned content and faculty-specific modules.

Alternative considered: keep `src/components`, `src/pages`, and `src/assets` as the long-term shared roots and add `src/faculties` only for overrides.

Decision: reject that approach because it blurs ownership. The architecture standard explicitly frames the repo as `Shared Platform + Faculty Modules`. The filesystem should make that obvious.

### Decision 2: Migrate pages before deep component classification

The first structural move should be pages:

```text
src/pages/*
-> src/faculties/health-science/pages/*
```

This establishes content ownership early while keeping most component and asset paths temporarily stable.

Alternative considered: move all shared/faculty components first.

Decision: reject as first step because component classification is higher risk. Pages have simpler ownership: pages always belong to a faculty.

### Decision 3: Introduce compatibility aliases only as temporary migration rails

During migration, Vite include resolution may support:

- `@shared/...`
- `@faculty/...`
- existing `@components/...` temporarily

Each temporary alias or path fallback MUST be documented in tasks with a removal checkpoint. It MUST NOT remain after the related files have been migrated.

Compatibility examples:

```text
@components/common/section-title.html
  temporary -> src/shared/components/common/section-title.html

@faculty/components/home/intro/index.html
  final -> src/faculties/health-science/components/home/intro/index.html
```

Cleanup rule:

- A phase may add a temporary resolver.
- The same phase or next phase must remove the old include pattern from migrated files.
- A verification task must search for stale patterns before marking the phase done.

### Decision 4: Use a faculty manifest/config rather than hard-code faculty modules in `main.js`

`src/main.js` currently imports component modules directly from `./components/...`. The multi-faculty architecture should avoid encoding Health Science-specific modules in the shared runtime.

Introduce a faculty config shape similar to:

```javascript
export default {
  id: 'health-science',
  name: 'Khoa Khoa hoc Suc khoe',
  pagesDir: './pages',
  dataDir: './data',
  modules: [
    {
      name: 'Hero Carousel',
      selector: '.hero-swiper',
      import: () => import('./components/home/carousel/carousel.js'),
      init: 'initHeroCarousel'
    }
  ]
}
```

Shared runtime remains responsible for:

- loading shared styles
- loading shared widgets
- loading shared component initializers
- reading the selected faculty config
- initializing faculty modules declared by config

Alternative considered: keep all dynamic imports in `src/main.js`.

Decision: reject long-term because it would make `main.js` grow with every faculty.

### Decision 5: Build must select exactly one faculty

The build command must select a faculty through environment/config:

```bash
FACULTY=health-science yarn build
```

Default behavior MAY select `health-science` for backward compatibility during migration, but the final documented command must make faculty selection explicit.

Build scope:

```text
src/shared/*
+
src/faculties/<selected-faculty>/*
```

The build MUST NOT include pages/data/assets/components from non-selected faculties.

### Decision 6: Preserve output URLs before optimizing source paths

Internal source ownership changes should not automatically force public URL changes. For the migrated Health Science baseline, output paths should remain compatible unless there is an explicit route change.

Examples:

- faculty data can live under `src/faculties/health-science/data/search-data.json`
- build output can still copy it to `/data/search-data.json` for the selected faculty
- document source can move to `src/faculties/health-science/assets/documents/...`
- output can still expose it under `/assets/documents/...`

This reduces breakage while still cleaning source ownership.

### Decision 7: Classify components in batches with a decision log

Component classification should use this rule:

```text
Shared by default
Faculty only if clearly faculty-specific
Promote to shared when reused by a second faculty
```

Initial classification:

Shared candidates:

- `button`
- `common`
- `modal`
- `tabs`
- `search`
- `loading`
- `header`
- `footer`
- generic `news-card`, event cards, sidebar cards if copy/config can vary by data

Health Science faculty candidates:

- `carousel`
- `intro`
- `admission`
- `major`
- `major-quiz`
- `infrastructure`
- `research`
- `industry-careers`
- `industry-partnerships`
- potentially `leadership` until another faculty proves same structure

The implementation should create a small classification table in documentation, not just move files. This prevents future contributors from guessing.

### Decision 8: Asset migration follows public role, not current folder

Initial classification:

Shared assets:

- fonts
- IUH/global logo assets
- generic system icons
- social icons
- generic defaults and favicon assets when used across all faculties

Health Science faculty assets:

- banners
- activity/lab images
- partner logos
- intro image
- major backgrounds
- documents
- faculty-specific language/social bitmap images if only used by this faculty shell

If an asset is ambiguous, keep it shared temporarily only when it is genuinely generic. Otherwise place it under faculty and let later faculties promote it.

### Decision 9: Cleanup gates are mandatory, not optional

Every phase MUST include:

1. A migration step.
2. A path/import/include update step.
3. A stale reference search.
4. A build or targeted verification step.
5. A cleanup step that removes obsolete duplicate directories, compatibility aliases, or documented temporary exceptions when no longer needed.

Example gate:

```text
After moving pages:
- no HTML page remains in src/pages except an intentional compatibility stub
- vite input reads from src/faculties/health-science/pages
- build succeeds
- rg "src/pages|../components|@components" findings are either migrated or listed as temporary
```

Do not mark a phase complete when it only "works" but leaves two canonical places for the same thing.

## Migration Plan

### Phase 0: Baseline and inventory

- Run the current canonical build.
- Record current pages, component groups, data files, document files, and public output assumptions.
- Record current dirty worktree state before implementation begins.
- Create an inventory table for:
  - shared component candidates
  - faculty component candidates
  - shared asset candidates
  - faculty asset candidates
- No structural moves in this phase.

Exit gate:

- baseline build result is known
- inventory exists
- no source moves yet

### Phase 1: Faculty-aware build foundation

- Add selected-faculty resolution to Vite config.
- Support `FACULTY=health-science`.
- Keep default behavior compatible with the existing Health Science site while docs move toward explicit faculty selection.
- Prepare path helpers for:
  - selected faculty root
  - shared root
  - faculty pages root
  - faculty data root
  - faculty assets root
- Do not move pages yet unless build input can be verified immediately.

Exit gate:

- old build still succeeds
- `FACULTY=health-science yarn build` succeeds or is explicitly equivalent
- no permanent no-op code remains undocumented

### Phase 2: Move pages into faculty ownership

- Move `src/pages/*` to `src/faculties/health-science/pages/*`.
- Update Vite HTML input discovery to read selected faculty pages.
- Update dev/preview request mapping if needed.
- Keep route output stable.

Exit gate:

- `src/pages` is removed or contains only a documented temporary compatibility stub
- build succeeds
- all 13 current pages are still included in build
- docs mention pages always belong to faculty

### Phase 3: Move data and documents

- Move `public/data/*` to `src/faculties/health-science/data/*`.
- Move `public/assets/documents/*` to `src/faculties/health-science/assets/documents/*`.
- Update copy plugins to copy selected faculty data/documents to the current expected output paths.
- Keep runtime URLs stable unless explicitly changed.

Exit gate:

- no canonical runtime data remains in `public/data`
- no canonical faculty document remains in `public/assets/documents`
- search and major quiz still fetch selected faculty data
- document-detail PDF still works

### Phase 4: Move shared platform code

- Move shared layouts, styles, utilities, and global components into `src/shared`.
- Update imports and build-time reads.
- Introduce final shared aliases such as `@shared/components/...`.
- Keep old aliases only for files not yet migrated.

Exit gate:

- shared components have canonical paths under `src/shared/components`
- global runtime imports point at shared paths
- stale `src/components/<shared>` copies are removed
- build succeeds

### Phase 5: Move faculty-specific modules and assets

- Move Health Science-specific homepage modules and feature modules into `src/faculties/health-science/components`.
- Move faculty-owned images and SVGs into `src/faculties/health-science/assets`.
- Update includes and runtime module imports to use `@faculty/...` or the faculty config.
- Keep shared assets only for genuinely shared assets.

Exit gate:

- no Health Science-specific component remains under shared roots
- no Health Science-specific asset remains under shared roots
- stale `@components` include usage is eliminated or explicitly queued for the next cleanup
- build succeeds

### Phase 6: Faculty config and runtime decoupling

- Add `src/faculties/health-science/faculty.config.js`.
- Move faculty module selector/import declarations out of `src/main.js`.
- Keep shared runtime responsible for global/shared initializers.
- Keep faculty runtime responsible for faculty module initializers.

Exit gate:

- `src/main.js` has no Health Science-specific module import paths
- faculty module imports are declared by selected faculty config
- component initialization still occurs once
- search/header/footer/global widgets still work

### Phase 7: Remove compatibility rails and finalize docs

- Remove temporary aliases and fallback path support that are no longer needed.
- Remove old directories that are no longer canonical.
- Update README and docs to show the final architecture and commands.
- Add developer notes for adding a new faculty.

Exit gate:

- no stale `src/pages` canonical content
- no stale `src/components` canonical content unless intentionally retained as a documented transitional alias root
- no `@components` usage unless explicitly preserved as a backward-compatible public alias with a stated policy
- `FACULTY=health-science yarn build` succeeds
- OpenSpec verification succeeds

## Risks / Trade-offs

- Large file moves can hide regressions -> Use phased migration with build verification and stale reference search after each phase.
- Temporary aliases can become permanent clutter -> Every alias must have a cleanup task and removal gate.
- Moving assets can break root-relative URLs -> Preserve output paths first; change public URLs only in a separate explicit change.
- Faculty config can overcomplicate the first faculty -> Keep the config small and focused on paths/module initialization; do not invent a CMS.
- Component classification can become subjective -> Use the architecture standard and maintain a classification table.
- `main.js` decoupling can break dynamic imports -> Move one module group at a time and verify selectors still initialize.
- Public data moving from `public/` can break Vite copy behavior -> Add selected-faculty copy plugins before removing old public data.
- Search/quiz/document pages depend on runtime paths -> Verify those pages specifically in each data/asset phase.
- Worktree may contain unrelated lockfile changes -> Do not revert or mix unrelated changes into this refactor.

## Open Questions

- Should `health-science` remain the default `FACULTY` when `FACULTY` is omitted, or should build fail without explicit selection after migration?
- Should output remain `dist_iuh/` for all faculty builds, or should output become `dist/<faculty>` later?
- Should `@components` be completely removed, or kept as a documented alias to `@shared/components` for developer ergonomics?
- Should generated public URLs include a faculty prefix in a later change, or should each faculty deployment remain root-scoped?
