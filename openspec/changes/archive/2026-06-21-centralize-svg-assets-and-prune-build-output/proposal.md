## Why

SVG handling currently has two sources of truth: shared SVG assets and selected-faculty SVG assets. The dev resolver also lets faculty SVGs override shared SVGs, while the production build copies every SVG from both roots, which keeps stale or faculty-specific icon copies in output even when they are not referenced.

This change centralizes SVG ownership under shared assets and makes production output reflect actual usage so future faculty builds do not accumulate unused icon files.

## What Changes

- Move the remaining Health Science-only SVG files into `src/shared/assets/svgs`.
- Stop treating `src/faculties/*/assets/svgs` as a supported SVG source.
- **BREAKING**: `/assets/svgs/<file>.svg` will resolve only from `src/shared/assets/svgs`; faculty-level SVG override is no longer supported.
- Replace full-directory SVG copying with usage-based SVG copying for the selected faculty build.
- Fail the build with a clear error when source references point at a missing SVG.
- Verify Health Science and Dormitory builds copy only referenced SVGs into `dist_iuh/assets/svgs`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `multi-faculty-architecture`: tighten SVG asset ownership, dev resolution, and build output pruning rules for selected-faculty builds.

## Impact

- Affected build code: `vite.config.js` asset resolver and SVG copy plugin behavior.
- Affected sources: `src/shared/assets/svgs` and remaining `src/faculties/*/assets/svgs` directories.
- Affected outputs: `dist_iuh/assets/svgs` should contain only SVG files referenced by the selected faculty source, shared layout/components, shared styles, and shared/faculty JavaScript included in that build.
- Runtime public URLs remain `/assets/svgs/<file>.svg` and relative `assets/svgs/<file>.svg`.
