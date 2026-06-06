## Why

The project has working static-site output, but the agent instruction files, local tooling, runtime initialization, base-path behavior, and placeholder content are inconsistent enough that future fixes can regress or be applied outside the intended workflow.

This change establishes a stable instruction bridge and defines the contract for cleaning up the audited runtime/tooling issues before application code is modified.

## What Changes

- Make `.agents` the canonical shared instruction surface and expose it through stable per-item symlinks in `.codex` and `.github`.
- Fix local tooling expectations so build and OpenSpec commands run with the supported Node/Yarn setup.
- Restore search modal interactivity and keep search data loading portable across deployment base paths.
- Make quiz/data fetches and generated/internal links compatible with configured Vite base paths.
- Remove duplicate latent page-script injection and inconsistent component auto-initialization.
- Align README/developer instructions with the actual Vite/component architecture.
- Clean placeholder content and obvious domain mismatches in public data and reusable components.

## Capabilities

### New Capabilities

- `agent-instruction-bridge`: Stable symlink-based access to shared agent skills, prompts, and instruction directories with `.agents` as the canonical source.
- `site-runtime-stability`: Runtime, build, documentation, base-path, and content cleanup requirements for the static IUH site.

### Modified Capabilities

- None.

## Impact

- Affected instruction paths: `.agents/skills/`, `.agents/prompts/`, `.agents/instructions/` (optional), `.codex/skills/`, `.github/skills/`, `.github/prompts/`, `.github/instructions/` (optional).
- Affected build/tooling files: `package.json`, lockfiles/tooling docs, `README.md`, `vite.config.js`, environment expectations.
- Affected runtime files: `src/main.js`, `src/layouts/default.html`, `src/components/search/search-modal.js`, `src/components/major/major-quiz.js`, component auto-init modules, public data JSON, and placeholder-heavy components/pages.
- Deployment behavior must remain valid for the current root Firebase hosting configuration while making subpath behavior explicit and testable.
