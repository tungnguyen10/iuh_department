## Context

The Vite dev server uses a generated workspace at `.tmp/faculty-build/<facultyId>/pages/` as its `root`. The `mapSrcRequests` middleware rewrites asset URLs like `/assets/foo.svg` to `/@fs/<absolute-path-to-src/assets/foo.svg>`. However, `server.fs.allow` is set to `['..']` (relative to root), which only permits `.tmp/faculty-build/<facultyId>/` — the project's `src/assets/` directory is outside this boundary, causing 403 on every asset request.

Separately, 18 HTML references across 3 component files use bare `assets/...` (no leading `/`). These bypass the `transformDataInclude` regex patterns which only match `/assets/...`, leaving them as relative paths that resolve incorrectly depending on the page URL.

## Goals / Non-Goals

**Goals:**
- All assets load correctly in both dev server and production build
- Consistent `/assets/...` convention across all source HTML
- Pipeline catches both `/assets/...` and bare `assets/...` as defense-in-depth

**Non-Goals:**
- Restructuring the `.tmp/faculty-build/` workspace layout
- Changing how SCSS `url()` references work (those use Vite's CSS pipeline and resolve correctly)
- Faculty-specific asset override logic (already works once paths resolve)

## Decisions

### 1. Expand `fs.allow` to project root

Add `resolve(__dirname)` to `server.fs.allow` so all project files (including `src/assets/`) are accessible to the dev server.

**Alternative considered**: Adding only `resolve(__dirname, 'src/assets')` — rejected because other middleware rewrites (`/js/`, `/components/`) also resolve to `src/` and would face the same issue.

### 2. Normalize source to `/assets/...` (not expand regex alone)

Fix the 18 bare `assets/...` references to `/assets/...` in source HTML.

**Alternative considered**: Only expanding the regex to catch both patterns — rejected because it hides the inconsistency, making it unclear which convention future authors should follow.

### 3. Also expand `transformDataInclude` regex as safety net

Update the 6 regex patterns to match both `/assets/...` and `assets/...`. This prevents future regressions if someone adds a bare path.

**Alternative considered**: Relying solely on source normalization — rejected because a single missed path is hard to debug in production.

## Risks / Trade-offs

- [Regex false positive on legitimate relative `assets/` paths] → Low risk: all asset references in this project target `src/assets/`; no component has a local `assets/` subdirectory.
- [Broader `fs.allow` exposes more filesystem] → Acceptable: dev-only setting, and `['..']` was already permissive in intent, just miscalculated relative to the `.tmp` root.
