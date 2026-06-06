## 1. Agent Instruction Bridge

- [x] 1.1 Create canonical `.agents/skills` and `.agents/prompts` directories for shared instructions.
- [x] 1.2 Migrate existing shared skills and prompts into the canonical `.agents` directories without duplicating content.
- [x] 1.3 Create per-item symlink views from `.codex/skills` and `.github/skills` into `.agents/skills`.
- [x] 1.4 Create per-item symlink views from `.github/prompts` into `.agents/prompts`.
- [x] 1.5 Keep compatibility bridge paths under `.agents/codex/skills`, `.agents/github/skills`, and `.agents/github/prompts`.
- [x] 1.6 Add a documented local sync command that regenerates the per-item symlink views after new `.agents` entries are added.
- [x] 1.7 Confirm no top-level `.agents`, `.codex`, or `.github` symlink replaces an entire source tree.
- [ ] 1.8 Decide whether `.codex`, `.github`, `.agents`, and `openspec` should be tracked, then update ignore/version-control state only as explicitly required.

## 2. Tooling and Documentation

- [ ] 2.1 Document the canonical Node/Yarn command path for local build and OpenSpec usage.
- [ ] 2.2 Update README build instructions so unsupported `npm run build` is not presented as equivalent while Yarn PnP is active.
- [ ] 2.3 Add or document the Yarn/PnP configuration needed for contributors to reproduce the working install/build environment.
- [ ] 2.4 Remove unused dependencies or imports identified by the audit, including unused Firebase dependency if no source usage is introduced.
- [ ] 2.5 Update README component architecture notes to match the current lazy selector-based initialization in `src/main.js`.

## 3. Runtime Behavior Fixes

- [ ] 3.1 Re-enable search modal event binding and verify input, Enter, clear button, result state, and empty state behavior.
- [ ] 3.2 Remove duplicate `{{pageScript}}` injection from `src/layouts/default.html`.
- [ ] 3.3 Remove or guard unguarded component auto-initialization so components initialized by `src/main.js` do not double-bind listeners or observers.
- [ ] 3.4 Verify header/footer/search/global widget initialization still works after initialization cleanup.

## 4. Base Path and Asset/Data URL Handling

- [ ] 4.1 Introduce or reuse a shared helper for runtime data URLs based on `import.meta.env.BASE_URL`.
- [ ] 4.2 Update search data fetching to use the base-path-safe data URL helper.
- [ ] 4.3 Update major quiz data fetching to use the base-path-safe data URL helper.
- [ ] 4.4 Audit generated HTML for root-relative internal links and asset references under a non-root `VITE_BASE_PATH`.
- [ ] 4.5 Update Vite include/path transforms or component markup so supported subpath builds do not emit broken root-only paths.
- [ ] 4.6 If full subpath navigation is not in scope, document root-only deployment assumptions explicitly and keep root deployment behavior unchanged.

## 5. Content and Navigation Cleanup

- [ ] 5.1 Replace `public/data/search-data.json` with IUH health-science relevant search entries.
- [ ] 5.2 Replace visible `Lorem ipsum` text in news cards and carousels with domain-relevant copy.
- [ ] 5.3 Replace misleading `href="#"` and `data-link="#"` placeholders with existing routes, disabled states, or explicitly non-final placeholders.
- [ ] 5.4 Correct breadcrumb parent/current labels that were copied from news-detail context onto unrelated pages.
- [ ] 5.5 Review major-card routes that point to non-existent detail pages and route them to existing pages or document the missing-page scope.
- [ ] 5.6 Move or document the PDF asset location so non-image assets are not treated as images by convention.

## 6. Verification

- [ ] 6.1 Run production build with the canonical Node/Yarn setup and confirm it succeeds.
- [ ] 6.2 Run a non-root `VITE_BASE_PATH` build and inspect generated HTML/JS for required base-path-safe URLs.
- [x] 6.3 Run OpenSpec status for `stabilize-site-runtime-tooling` and confirm tasks are tracked.
- [ ] 6.4 Record any remaining warnings that are intentionally deferred before archive.
