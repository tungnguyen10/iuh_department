## 1. Baseline Inventory And Guardrails

- [x] 1.1 Record current git status before implementation and identify unrelated pre-existing changes that must not be reverted.
- [x] 1.2 Run the current canonical build with the existing source layout and record the result as the Health Science baseline.
- [x] 1.3 List all current pages from `src/pages` and confirm the expected 13-page baseline.
- [x] 1.4 Inventory current runtime data files from `public/data` and document which features consume each file.
- [x] 1.5 Inventory current document files from `public/assets/documents` and document expected public output URLs.
- [x] 1.6 Create a component classification table with initial `shared`, `health-science faculty`, and `defer/needs decision` groups.
- [x] 1.7 Create an asset classification table with initial `shared`, `health-science faculty`, and `defer/needs decision` groups.
- [x] 1.8 Define the temporary compatibility policy for this change, including which aliases may exist, why, and when each must be removed.
- [x] 1.9 Verify no source files are moved in this baseline phase.

## 2. Faculty-Aware Build Foundation

- [x] 2.1 Add selected faculty resolution for `FACULTY=health-science` in the Vite build configuration.
- [x] 2.2 Add path helpers for repository root, shared root, selected faculty root, selected faculty pages root, selected faculty data root, and selected faculty assets root.
- [x] 2.3 Make the build fail with a clear error when `FACULTY` points to a missing faculty directory.
- [x] 2.4 Keep existing build behavior compatible while `health-science` has not yet been physically moved.
- [x] 2.5 Add temporary resolver support only where needed and document every temporary resolver in the compatibility policy.
- [x] 2.6 Run the original build command and confirm it still succeeds.
- [x] 2.7 Run `FACULTY=health-science yarn build` and confirm it succeeds or is equivalent to the current baseline during this phase.
- [x] 2.8 Search for accidental references to future non-existent roots and clean or defer them before proceeding.

## 3. Move Pages Into Health Science Faculty

- [x] 3.1 Create `src/faculties/health-science/pages`.
- [x] 3.2 Move every current page from `src/pages` into `src/faculties/health-science/pages`.
- [x] 3.3 Update Vite HTML input discovery to read pages from the selected faculty pages root.
- [x] 3.4 Update dev and preview URL-to-file mapping if page movement changes local serving behavior.
- [x] 3.5 Preserve generated route names and page output paths for the current Health Science site.
- [x] 3.6 Search for references to `src/pages` in source, docs, build config, and scripts.
- [x] 3.7 Remove `src/pages` if empty, or replace it only with a documented temporary compatibility stub.
- [x] 3.8 Run `FACULTY=health-science yarn build` and confirm all 13 baseline pages are generated.
- [x] 3.9 Clean stale page migration notes before starting the next phase.

## 4. Move Faculty Data And Documents

- [x] 4.1 Create `src/faculties/health-science/data`.
- [x] 4.2 Move `public/data/search-data.json` into `src/faculties/health-science/data`.
- [x] 4.3 Move `public/data/quiz-data.json` into `src/faculties/health-science/data`.
- [x] 4.4 Move `public/data/messages-vi.json` and `public/data/messages-en.json` into `src/faculties/health-science/data` or explicitly classify them as shared if they are platform messages.
- [x] 4.5 Create `src/faculties/health-science/assets/documents`.
- [x] 4.6 Move `public/assets/documents/TB-1856-2025.pdf` into the Health Science faculty documents source.
- [x] 4.7 Update Vite copy plugins so selected faculty data is emitted to the expected runtime `/data/` output path.
- [x] 4.8 Update Vite copy plugins so selected faculty documents are emitted to the expected `/assets/documents/` output path.
- [x] 4.9 Verify search modal and major quiz still use base-path-safe data URLs after the source move.
- [x] 4.10 Search for `public/data` and `public/assets/documents` as canonical source references and clean them.
- [x] 4.11 Remove old public data/document source files once selected-faculty copy output is verified.
- [x] 4.12 Run `FACULTY=health-science yarn build` and inspect generated output for `data/search-data.json`, `data/quiz-data.json`, and the PDF document.

## 5. Move Shared Platform Roots

- [x] 5.1 Create `src/shared/components`, `src/shared/layouts`, `src/shared/styles`, `src/shared/js`, and `src/shared/assets`.
- [x] 5.2 Move `src/layouts/default.html` into `src/shared/layouts/default.html`.
- [x] 5.3 Move shared JavaScript utilities from `src/js` into `src/shared/js`.
- [x] 5.4 Move shared styles from `src/styles` into `src/shared/styles`.
- [x] 5.5 Move shared fonts into `src/shared/assets/fonts`.
- [x] 5.6 Move shared/global components such as header, footer, loading, search, modal, tabs, button, and common components into `src/shared/components`.
- [x] 5.7 Update `src/main.js`, Vite config, and component imports to use the new shared paths.
- [x] 5.8 Update `data-include` resolution to support `@shared/components/...`.
- [x] 5.9 Migrate includes for moved shared components from `@components/...` to `@shared/components/...`.
- [x] 5.10 Search for stale imports/includes that point to moved shared files.
- [x] 5.11 Remove old shared component/style/js/layout copies from legacy roots after imports are migrated.
- [x] 5.12 Run `FACULTY=health-science yarn build` and verify header, footer, search modal, loading, modal, tabs, and common includes still render.

## 6. Move Health Science Faculty Components

- [x] 6.1 Create `src/faculties/health-science/components`.
- [x] 6.2 Move Health Science homepage modules into `src/faculties/health-science/components/home` according to the classification table.
- [x] 6.3 Move Health Science-specific feature modules such as major quiz and domain-specific sections into faculty component roots.
- [x] 6.4 Decide whether leadership components are shared or Health Science-specific and record the decision before moving them.
- [x] 6.5 Update `data-include` usage for faculty-owned components to use `@faculty/components/...`.
- [x] 6.6 Update runtime imports for moved faculty components, keeping temporary compatibility only if the current phase cannot remove it safely.
- [x] 6.7 Search for stale `@components/<moved-faculty-component>` references and clean them.
- [x] 6.8 Remove old faculty component copies from legacy roots after includes/imports are migrated.
- [x] 6.9 Run `FACULTY=health-science yarn build` and verify homepage modules, major pages, leadership pages, research, infrastructure, partners, and industry-careers still render.

## 7. Move And Classify Assets

- [x] 7.1 Create `src/faculties/health-science/assets/images` and `src/faculties/health-science/assets/svgs`.
- [x] 7.2 Move faculty-owned images such as banners, intro image, activities, partner logos, major backgrounds, and research backgrounds into the Health Science faculty asset root.
- [x] 7.3 Move faculty-owned SVGs such as major/domain icons into the Health Science faculty asset root when they are not shared platform icons.
- [x] 7.4 Keep generic system icons, IUH logos, fonts, favicons, social icons, and true defaults under `src/shared/assets`.
- [x] 7.5 Update Vite copy plugins to copy selected faculty assets and shared assets into the expected output asset paths.
- [x] 7.6 Update HTML/component asset references where needed while preserving public output URLs unless a URL change is explicitly documented.
- [x] 7.7 Update JavaScript hard-coded asset paths such as default avatar/image fallbacks to use shared or faculty-aware helpers.
- [x] 7.8 Search for stale source asset references under old `src/assets` roots.
- [x] 7.9 Remove old asset copies from legacy roots once output and references are verified.
- [x] 7.10 Run `FACULTY=health-science yarn build` and inspect generated output for images, SVGs, favicons, social icons, and document assets.

## 8. Faculty Runtime Configuration

- [x] 8.1 Create `src/faculties/health-science/faculty.config.js`.
- [x] 8.2 Add Health Science faculty metadata and source/output path configuration to `faculty.config.js`.
- [x] 8.3 Move Health Science-specific runtime module declarations from `src/main.js` into `faculty.config.js`.
- [x] 8.4 Keep shared/global initializers in shared runtime code.
- [x] 8.5 Update `src/main.js` to load selected faculty config and initialize faculty modules from config.
- [x] 8.6 Ensure component initialization uses one path per component and does not double-bind.
- [x] 8.7 Search `src/main.js` for hard-coded Health Science component import paths and remove them.
- [x] 8.8 Run `FACULTY=health-science yarn build`.
- [x] 8.9 Preview or otherwise verify header, footer, mobile menu, search modal, carousels, major quiz, tabs, SVG inlining, article actions, PDF fallback, and global widgets.

## 9. Compatibility Cleanup And Drift Removal

- [x] 9.1 Search for remaining `@components` include usage and classify each finding as removed, intentionally long-term, or still temporary.
- [x] 9.2 Remove temporary `@components` resolver support if no longer required.
- [x] 9.3 Search for legacy roots `src/pages`, `src/components`, `src/assets`, `src/layouts`, `src/styles`, and `src/js` as canonical paths.
- [x] 9.4 Remove empty or obsolete legacy directories after all references are migrated.
- [x] 9.5 Remove temporary fallback copy paths for `public/data` and `public/assets/documents` if no longer required.
- [x] 9.6 Confirm no migrated source category has two undocumented canonical locations.
- [x] 9.7 Record any compatibility alias intentionally kept as long-term API in documentation.
- [x] 9.8 Run `FACULTY=health-science yarn build` after cleanup.
- [x] 9.9 Run stale-reference searches again and fix or document every remaining finding before proceeding.

## 10. Documentation Updates

- [x] 10.1 Update README to describe the final `Shared Platform + Faculty Modules` architecture.
- [x] 10.2 Update README build commands to include `FACULTY=health-science yarn build`.
- [x] 10.3 Update docs to explain how to add a new faculty module.
- [x] 10.4 Update docs to explain page, data, document, asset, component, style, and JavaScript ownership rules.
- [x] 10.5 Add or update a classification table for shared vs Health Science component ownership.
- [x] 10.6 Add or update a classification table for shared vs Health Science asset ownership.
- [x] 10.7 Update `docs/source-overview.md` so it reflects the final architecture rather than the pre-refactor snapshot.
- [x] 10.8 Document any intentional long-term compatibility aliases or confirm they were removed.

## 11. Final Verification

- [x] 11.1 Run `openspec status --change introduce-multi-faculty-architecture` and confirm artifacts/tasks are recognized.
- [x] 11.2 Run `FACULTY=health-science yarn build` and confirm it succeeds.
- [x] 11.3 Run the existing root build path and confirm compatibility or document the new required command.
- [x] 11.4 Verify generated output includes the current Health Science page set.
- [x] 11.5 Verify generated output includes selected faculty data and documents.
- [x] 11.6 Verify generated output includes expected shared and faculty assets.
- [x] 11.7 Verify search modal loads selected faculty search data.
- [x] 11.8 Verify major quiz loads selected faculty quiz data.
- [x] 11.9 Verify document detail PDF loads or falls back correctly.
- [x] 11.10 Verify no duplicate event listeners or visible double initialization occur in header, footer, search, carousels, tabs, or global widgets.
- [x] 11.11 Run stale-reference searches for old roots and temporary aliases, then clean or document every remaining finding.
- [x] 11.12 Confirm existing `site-runtime-stability` requirements remain satisfied.
