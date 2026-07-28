# IUH Lookup Addon Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the dormitory lookup sidebar as the approved, responsive student dossier without changing lookup content or behaviour.

**Architecture:** Keep the static addon in `tra-cuu.html` and use its existing BEM classes. Modify the matching SCSS rules in `lookup.scss`; the surrounding tab and profile-panel components remain untouched.

**Tech Stack:** Vite, Tailwind CSS utility application in SCSS, Sass, static HTML includes.

## Global Constraints

- Do not alter the lookup values, tabs, registration variants, or data contracts.
- Reuse the existing `iuh-lookup-addon` elements and BEM class namespace.
- Maintain responsive content wrapping and semantic markup.
- Validate with `yarn build`.

---

### Task 1: Recompose addon markup for the dossier hierarchy

**Files:**
- Modify: `src/faculties/dormitory-management/pages/tra-cuu.html`

**Interfaces:**
- Consumes: Existing static values in `.iuh-lookup-addon__meta-item`.
- Produces: The same content wrapped by the existing addon class names, with a text initials avatar and grouped personal/accommodation rows.

- [ ] **Step 1: Add a failing structural assertion**

Run:

```bash
node --input-type=module -e "import { readFileSync } from 'node:fs'; const source = readFileSync('src/faculties/dormitory-management/pages/tra-cuu.html', 'utf8'); if (!source.includes('iuh-lookup-addon__avatar-initials') || !source.includes('iuh-lookup-addon__meta-item--student')) throw new Error('Dossier hooks are missing');"
```

Expected: The command exits non-zero because the redesign hooks do not yet exist.

- [ ] **Step 2: Add the minimal markup hooks**

Replace the empty avatar contents with `NNH` inside `.iuh-lookup-addon__avatar-initials`, mark the name row with `iuh-lookup-addon__meta-item--student`, and keep the two existing `--highlight` accommodation rows unchanged.

- [ ] **Step 3: Re-run the structural assertion**

Run the command from Step 1.

Expected: Exit code 0.

### Task 2: Apply the approved dossier visual system

**Files:**
- Modify: `src/faculties/dormitory-management/components/lookup/lookup.scss`

**Interfaces:**
- Consumes: `.iuh-lookup-addon` classes rendered in `tra-cuu.html`.
- Produces: Desktop and mobile styles for the addon card.

- [ ] **Step 1: Add a failing style assertion**

Run:

```bash
node --input-type=module -e "import { readFileSync } from 'node:fs'; const source = readFileSync('src/faculties/dormitory-management/components/lookup/lookup.scss', 'utf8'); for (const token of ['iuh-lookup-addon__avatar-initials', 'iuh-lookup-addon__meta-item--student', 'grid-cols-[7.5rem_1fr]']) if (!source.includes(token)) throw new Error('Approved dossier styling is missing: ' + token);"
```

Expected: The command exits non-zero because the new dossier styles are not yet present.

- [ ] **Step 2: Implement the SCSS redesign**

Update the existing addon rules to create a 320px desktop sidebar, a white inset profile card, a 112px magenta initials avatar, a blue display-scale name, individually bordered metadata rows, and pale-blue accommodation rows. At small widths, reduce padding/type size and stack metadata label/value content.

- [ ] **Step 3: Re-run the style assertion**

Run the command from Step 1.

Expected: Exit code 0.

### Task 3: Build and inspect the production output

**Files:**
- Verify: `dist/`

**Interfaces:**
- Consumes: The modified page markup and Sass.
- Produces: Compiled static assets that include the redesigned addon.

- [ ] **Step 1: Build the site**

Run:

```bash
yarn build
```

Expected: Exit code 0 and Vite reports the build completed.

- [ ] **Step 2: Inspect generated lookup output**

Run:

```bash
rg -n "iuh-lookup-addon__avatar-initials|iuh-lookup-addon__meta-item--student" dist
```

Expected: Both hooks appear in the generated lookup page.
