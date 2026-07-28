# IUH Lookup Addon Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the dormitory lookup sidebar as the approved, responsive dark Option B identity card without changing lookup content or behaviour.

**Architecture:** Keep the static addon in `tra-cuu.html` and use its existing BEM classes. Modify the matching SCSS rules in `lookup.scss`; the surrounding tab and profile-panel components remain untouched.

**Tech Stack:** Vite, Tailwind CSS utility application in SCSS, Sass, static HTML includes.

## Global Constraints

- Do not alter the lookup values, tabs, registration variants, or data contracts.
- Reuse the existing `iuh-lookup-addon` BEM namespace and add only identity-chip/residence-footer modifiers needed for Option B.
- Use only the reference palette: `#20211F`, `#2B2C2A`, `#F7F7F5`, `#A4A39E`, `#EA3D91`, `#073D75`, and `#2E86E7`.
- Maintain responsive content wrapping and semantic markup.
- Validate with `yarn build`.

---

### Task 1: Recompose addon markup for the dossier hierarchy

**Files:**
- Modify: `src/faculties/dormitory-management/pages/tra-cuu.html`

**Interfaces:**
- Consumes: Existing static values in `.iuh-lookup-addon__meta-item`.
- Produces: Centered identity content, an academic-only list, and a grouped accommodation footer.

- [ ] **Step 1: Add a failing structural assertion**

Run:

```bash
node --input-type=module -e "import { readFileSync } from 'node:fs'; const source = readFileSync('src/faculties/dormitory-management/pages/tra-cuu.html', 'utf8'); if (!source.includes('iuh-lookup-addon__avatar-initials') || !source.includes('iuh-lookup-addon__meta-item--student')) throw new Error('Dossier hooks are missing');"
```

Expected: The command exits non-zero because the redesign hooks do not yet exist.

- [ ] **Step 2: Add the minimal markup hooks**

Keep the initials avatar, add a `.iuh-lookup-addon__student-id` chip below the name, remove the duplicate student row, and move room/status content into `.iuh-lookup-addon__residence`.

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

Update the existing addon rules to create a charcoal card, 112px magenta rounded-square initials avatar, centered white identity, divider-only academic rows, and a cobalt accommodation footer with a bright-blue status pill. At small widths, reduce padding/type size and allow footer content to stack.

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
