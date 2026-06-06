## Why

Dev server returns 403 on every asset (images, SVGs) because `fs.allow` is too narrow for the `.tmp/faculty-build/` workspace layout. Additionally, 18 component files use bare `assets/...` paths (no leading `/`) which bypass the `transformDataInclude` rewrite pipeline, producing wrong paths when a faculty base path is active.

## What Changes

- Fix Vite `server.fs.allow` to include the project root so `/@fs/` rewrites to `src/assets/` are permitted
- Normalize all 18 bare `assets/...` references in 3 component files to `/assets/...` so they are caught by the existing `transformDataInclude` regex rewriting
- Expand `transformDataInclude` regex patterns to also catch bare `assets/...` as a safety net against future regressions

## Capabilities

### New Capabilities

- `asset-path-resolution`: Consistent asset path convention and pipeline handling for both root and faculty subpath builds

### Modified Capabilities

- `site-runtime-stability`: Dev server asset serving must not 403 when Vite root points to a generated workspace directory

## Impact

- `vite.config.js` — `server.fs.allow` expansion + regex pattern update in `transformDataInclude`
- `src/components/footer/footer.html` — 11 path normalizations
- `src/components/partners/index.html` — 6 path normalizations
- `src/components/common/child-title.html` — 1 path normalization
