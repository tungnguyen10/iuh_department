## Context

The multi-faculty architecture currently keeps reusable assets in `src/shared/assets` and selected-faculty assets in `src/faculties/<faculty>/assets`. SVGs are a special case: the dev server resolves `/assets/svgs/*` by checking the selected faculty first and shared second, while the production build copies every SVG from both roots into `dist_iuh/assets/svgs`.

Health Science still has four faculty-local SVG icons:

- `icon-traditional-medicine.svg`
- `icon-nutrition.svg`
- `icon-nursing.svg`
- `icon-food-science.svg`

Dormitory has no faculty-local SVG files. The current override model creates avoidable drift because two faculties can silently serve different files from the same public `/assets/svgs/<name>.svg` URL, and production output includes SVGs that are not used by the selected faculty build.

## Goals / Non-Goals

**Goals:**

- Make `src/shared/assets/svgs` the only canonical SVG source root.
- Preserve existing public SVG URL shapes such as `/assets/svgs/foo.svg` and `assets/svgs/foo.svg`.
- Remove faculty-level SVG override behavior from dev resolution.
- Copy only SVG files referenced by the selected faculty source graph and shared platform sources included in that build.
- Fail clearly when a referenced SVG does not exist in `src/shared/assets/svgs`.
- Verify both Health Science and Dormitory builds.

**Non-Goals:**

- Do not change image, document, font, or data ownership rules.
- Do not optimize or rename SVG file contents beyond moving the four Health Science SVG files.
- Do not change runtime asset URLs or require source files to import SVGs as JavaScript modules.
- Do not remove unused shared SVG source files; pruning applies to generated build output.

## Decisions

### Centralize SVG Source Ownership

`src/shared/assets/svgs` becomes the only supported source root for SVG files. The four remaining Health Science SVG files should be moved there unchanged, and faculty `assets/svgs` directories should be removed when empty or retained only as non-canonical placeholders if required by tooling.

Alternative considered: keep faculty SVG roots but make copy usage-based. That would reduce output size, but it would preserve override ambiguity and allow two faculties to serve different files at the same public URL.

### Dev Resolver Uses Shared SVGs Only

The Vite middleware that resolves `/assets/svgs/*` should map directly to `src/shared/assets/svgs/*`. It should not check `src/faculties/<faculty>/assets/svgs`.

Alternative considered: shared-first with faculty fallback. That would reduce accidental overrides but still keeps two canonical locations and makes missing shared files harder to detect.

### Build Copies SVGs By Reference

The existing full-directory `copyAssetRootsPlugin(..., 'svgs', ...)` should be replaced for SVGs with a usage-based plugin. The plugin should scan source files included by the selected faculty build:

- selected faculty pages, components, styles, JavaScript, and config
- shared layouts, components, styles, JavaScript, and config used by the build
- any generated or transformed source content available to the plugin if needed for coverage

The scanner should recognize these reference shapes:

- `src="/assets/svgs/x.svg"`
- `src="assets/svgs/x.svg"`
- `data-icon="/assets/svgs/x.svg"`
- `data-pattern="/assets/svgs/x.svg"`
- CSS `url('../assets/svgs/x.svg')`
- JavaScript string `'/assets/svgs/x.svg'`

The implementation can use a small path-extraction helper instead of a full HTML/CSS/JS parser because the supported public contract is limited to static SVG file references. The helper should normalize extracted paths to an `assets/svgs/<file>.svg` key and reject traversal outside the SVG root.

Alternative considered: use Rollup emitted assets only. That misses the current static HTML/data-attribute pattern because many SVG references are plain public URLs rather than module imports.

### Missing References Fail The Build

If a scanned SVG reference does not exist under `src/shared/assets/svgs`, the build should fail with a message that names the missing SVG and at least one source file that referenced it. Silent skip is not acceptable because it produces broken runtime UI.

Alternative considered: warn and continue. That preserves build completion but hides broken assets until manual preview.

## Risks / Trade-offs

- Scanner misses a supported reference shape -> Add focused tests or verification commands that compare references against output for Health Science and Dormitory.
- Scanner copies SVGs referenced in dead code or unused shared components -> Acceptable if the reference is in source included by the configured scan roots; the goal is to avoid copying the entire shared SVG directory, not perfect tree-shaking.
- Existing faculty-local SVG references break after resolver change -> Move all known faculty-local SVGs to shared before changing the resolver, then verify builds.
- Removing faculty SVG roots may affect future contributors' expectations -> Update architecture docs or tasks so new faculties use shared SVGs and faculty-owned imagery remains under `assets/images`.

## Migration Plan

1. Move the four Health Science SVG files into `src/shared/assets/svgs`.
2. Remove or de-canonicalize faculty `assets/svgs` directories.
3. Change dev resolution for `/assets/svgs/*` to shared-only.
4. Replace SVG full-directory copy with usage-based copy and missing-file validation.
5. Build Health Science and Dormitory and inspect `dist_iuh/assets/svgs`.
6. Search source for remaining `src/faculties/*/assets/svgs` dependencies.

Rollback is straightforward: restore the moved SVG files to the faculty root and restore the previous resolver/copy plugin. No public URL migration is required.
