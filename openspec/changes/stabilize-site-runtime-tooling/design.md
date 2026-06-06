## Context

The repository is a Vite static site with build-time HTML layout/component injection and runtime JavaScript initialization from `src/main.js`. The audit found that production build succeeds when run through Yarn with Node 22, but the default shell resolves Node 12 and `npm run build` cannot find `vite` because the workspace uses Yarn PnP artifacts rather than a populated `node_modules`.

Agent instructions currently exist in parallel surfaces: `.codex/skills`, `.github/skills`, and `.github/prompts`. The user-facing requirement is to manage future shared instructions from `.agents`, then expose them back into `.codex` and `.github` through auditable per-item symlinks.

## Goals / Non-Goals

**Goals:**

- Make `.agents/skills` and `.agents/prompts` the canonical shared instruction source while keeping `.codex` and `.github` readable at their expected paths.
- Make the project build instructions and local command expectations match the actual Yarn/Node setup.
- Restore broken runtime behavior such as search input events.
- Make data fetches and generated paths respect Vite `BASE_URL` where subpath deployment is claimed or supported.
- Remove latent duplicate page script injection and inconsistent component auto-initialization.
- Replace obvious placeholder/domain-mismatched content with project-relevant content or explicit non-navigating states.
- Preserve the current root Firebase deployment behavior.

**Non-Goals:**

- Redesign the site UI.
- Add backend search, CMS integration, or new Firebase application code.
- Create distinct detail pages for every placeholder route unless required to remove broken navigation.
- Change the OpenSpec workflow schema.

## Decisions

### Decision 1: Make `.agents` canonical and fan out with per-item symlinks

`.agents` will be the canonical source for shared instructions:

- `.agents/skills/<skill>` stores the real shared skill directory
- `.agents/prompts/<prompt>` stores the real shared prompt file

Consumer surfaces remain grouped directories with per-item symlinks:

- `.codex/skills/<skill> -> ../../.agents/skills/<skill>`
- `.github/skills/<skill> -> ../../.agents/skills/<skill>`
- `.github/prompts/<prompt> -> ../../.agents/prompts/<prompt>`

Compatibility views remain available inside `.agents` for discovery:

- `.agents/codex/skills/<skill> -> ../../skills/<skill>`
- `.agents/github/skills/<skill> -> ../../skills/<skill>`
- `.agents/github/prompts/<prompt> -> ../../prompts/<prompt>`

Rationale: this matches the requested workflow: add or edit shared instructions under `.agents`, then let `.codex` and `.github` resolve them without duplicating content or symlinking entire top-level trees.

### Decision 1a: Regenerate per-item symlinks with a local sync script

The repository will include a small local sync script that reconciles `.codex/skills`, `.github/skills`, `.github/prompts`, and the `.agents/{codex,github}` compatibility views from the canonical `.agents/{skills,prompts}` directories.

Rationale: per-item symlink fan-out cannot appear automatically when a new file or directory is created under `.agents`. A deterministic sync command keeps the structure reproducible and easy to verify.

### Decision 2: Treat Yarn with Node 22 as the canonical local toolchain

The implementation should document and enforce the working command path instead of leaving both npm and Yarn as equally valid. If npm support is desired later, it should be made real by installing dependencies conventionally and removing ambiguity.

Rationale: the current repository has `.pnp.cjs`, `.pnp.loader.mjs`, and `yarn.lock`; `node_modules` does not contain package binaries. Vite 7 requires Node 20.19+ or 22.12+.

### Decision 3: Centralize base-path URL handling

Runtime data paths should use `import.meta.env.BASE_URL` or a small shared helper. Build-time path transforms should cover common attributes consistently, and documentation should state whether subpath deployment is supported.

Rationale: Vite rewrites bundled assets, but custom HTML attributes, JSON URLs, and handwritten root-relative links are outside Vite's automatic handling.

### Decision 4: Prefer one initialization path per component

Components initialized by `src/main.js` should not auto-initialize on import unless they guard against duplicate work. Existing guarded auto-init may remain temporarily, but unguarded auto-init should be removed or guarded.

Rationale: dynamic imports make execution timing explicit. Auto-init plus manual init causes duplicate event listeners, observers, or image handlers.

### Decision 5: Keep content cleanup scoped to obvious placeholders

The first cleanup pass should replace mock copy and wrong-domain data discovered in the audit. It should not invent a full content model or CMS.

Rationale: placeholder content breaks polish and navigation confidence, but a larger content system is out of scope.

## Risks / Trade-offs

- Agent bridge migration changes where the real files live -> The sync script and compatibility views must preserve existing read paths.
- Node/Yarn cleanup may affect contributors using npm -> Document the canonical path and leave a clear migration note.
- Base-path normalization may touch many HTML components -> Prefer small helpers and focused transforms; verify with root and subpath builds.
- Removing auto-init can break pages that import modules directly -> Search current imports first and rely on `main.js` selectors.
- Replacing placeholder links with real routes may expose missing pages -> Use existing pages or non-navigating disabled states until real detail pages are specified.
