## 1. Agent Instruction Bridge

- [x] 1.1 Create canonical `.agents/skills` and `.agents/prompts` directories for shared instructions.
- [x] 1.2 Migrate existing shared skills and prompts into the canonical `.agents` directories without duplicating content.
- [x] 1.3 Create per-item symlink views from `.codex/skills` and `.github/skills` into `.agents/skills`.
- [x] 1.4 Create per-item symlink views from `.github/prompts` into `.agents/prompts`.
- [x] 1.5 Drop the `.agents/codex/skills`, `.agents/github/skills`, and `.agents/github/prompts` compatibility views (no consumer reads them) and gate `.github/instructions/` sync on the optional `.agents/instructions/` source.
- [x] 1.6 Add a documented local sync command that regenerates the per-item symlink views after new `.agents` entries are added.
- [x] 1.7 Confirm no top-level `.agents`, `.codex`, or `.github` symlink replaces an entire source tree.
- [x] 1.8 Decide whether `.codex`, `.github`, `.agents`, and `openspec` should be tracked, then update ignore/version-control state only as explicitly required.

## 2. Tooling and Documentation

- [x] 2.1 Document the canonical Node/Yarn command path for local build and OpenSpec usage.
- [x] 2.2 Update README build instructions so unsupported `npm run build` is not presented as equivalent while Yarn PnP is active.
- [x] 2.3 Add or document the Yarn/PnP configuration needed for contributors to reproduce the working install/build environment.
- [x] 2.4 Remove unused dependencies or imports identified by the audit, including unused Firebase dependency if no source usage is introduced.
- [x] 2.5 Update README component architecture notes to match the current lazy selector-based initialization in `src/main.js`.

## 3. Runtime Behavior Fixes

- [x] 3.1 Re-enable search modal event binding and verify input, Enter, clear button, result state, and empty state behavior.
- [x] 3.2 Remove duplicate `{{pageScript}}` injection from `src/layouts/default.html`.
- [x] 3.3 Remove or guard unguarded component auto-initialization so components initialized by `src/main.js` do not double-bind listeners or observers.
- [x] 3.4 Verify header/footer/search/global widget initialization still works after initialization cleanup.

## 4. Base Path and Asset/Data URL Handling

- [x] 4.1 Introduce or reuse a shared helper for runtime data URLs based on `import.meta.env.BASE_URL`.
- [x] 4.2 Update search data fetching to use the base-path-safe data URL helper.
- [x] 4.3 Update major quiz data fetching to use the base-path-safe data URL helper.
- [x] 4.4 Audit generated HTML for root-relative internal links and asset references under a non-root `VITE_BASE_PATH`.
- [x] 4.5 Update Vite include/path transforms or component markup so supported subpath builds do not emit broken root-only paths.
- [x] 4.6 If full subpath navigation is not in scope, document root-only deployment assumptions explicitly and keep root deployment behavior unchanged.

## 5. Content and Navigation Cleanup

- [x] 5.1 Replace `public/data/search-data.json` with IUH health-science relevant search entries.
- [x] 5.2 Replace visible `Lorem ipsum` text in news cards and carousels with domain-relevant copy.
- [x] 5.3 Replace misleading `href="#"` and `data-link="#"` placeholders with existing routes, disabled states, or explicitly non-final placeholders.
- [x] 5.4 Correct breadcrumb parent/current labels that were copied from news-detail context onto unrelated pages.
- [x] 5.5 Review major-card routes that point to non-existent detail pages and route them to existing pages or document the missing-page scope.
- [x] 5.6 Move or document the PDF asset location so non-image assets are not treated as images by convention.

## 6. Verification

- [x] 6.1 Run production build with the canonical Node/Yarn setup and confirm it succeeds.
- [x] 6.2 Run a non-root `VITE_BASE_PATH` build and inspect generated HTML/JS for required base-path-safe URLs.
- [x] 6.3 Run OpenSpec status for `stabilize-site-runtime-tooling` and confirm tasks are tracked.
- [x] 6.4 Record any remaining warnings that are intentionally deferred before archive.
