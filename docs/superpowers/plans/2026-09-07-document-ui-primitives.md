# Document UI Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the “Văn bản – Biểu mẫu” listing and detail pages to consume every suitable IUH shared UI primitive while preserving the approved document-led visual identity and behavior.

**Architecture:** Shared primitives remain the source of truth for form controls, buttons, download actions, section headings, and metadata rows. Document-specific repeated patterns become focused faculty components; the segmented filter, PDF reader, attachment row, and archival layout remain custom because no compatible shared primitive exists.

**Tech Stack:** Vite HTML include pipeline, TailwindCSS, vanilla JavaScript, Node test runner.

## Global Constraints

- Work directly on `develop` as requested.
- Do not add dependencies or change other faculties.
- Preserve the existing document-library DOM contract and filtering behavior.
- Preserve responsive behavior, focus visibility, `aria-live`, and reduced-motion support.

---

### Task 1: Primitive usage contract

**Files:**
- Modify: `tests/document-library.test.js`

**Interfaces:**
- Consumes: source HTML for both document pages.
- Produces: regression checks for shared primitive includes and document-specific components.

- [x] Add failing assertions requiring shared form fields, shared buttons/download buttons, shared section titles, shared display rows, and faculty document item/card components.
- [x] Run `node --test tests/document-library.test.js` and confirm the primitive contract fails against the current hard-coded markup.

### Task 2: Document listing composition

**Files:**
- Create: `src/faculties/organization-administration/components/documents/document-item.html`
- Modify: `src/faculties/organization-administration/pages/documents-forms.html`

**Interfaces:**
- Consumes: `@shared/components/form/field.html`, `@shared/components/button/button.html`, and `@shared/components/button/button-download.html`.
- Produces: twelve rendered `[data-document-item]` records with unchanged dataset attributes and actions.

- [x] Replace the search input and selects with shared form-field variants, passing existing data hooks through `data-attrs`.
- [x] Extract the repeated desktop/mobile document row into a two-variant faculty include for documents and forms.
- [x] Replace reset/row actions with shared button primitives while preserving the square archival visual through caller classes.

### Task 3: Document detail composition

**Files:**
- Create: `src/faculties/organization-administration/components/documents/related-document-card.html`
- Modify: `src/faculties/organization-administration/pages/document-detail.html`

**Interfaces:**
- Consumes: shared button, download-button, section-title, and display-row primitives.
- Produces: the same PDF viewer/fallback and metadata content with primitive-backed surrounding actions.

- [x] Replace compatible download and navigation actions with shared button primitives.
- [x] Replace metadata rows and reusable section headings with shared primitives.
- [x] Extract the related-document cards into a faculty component.
- [x] Keep the PDF surface, attachment row, and document-specific header custom.

### Task 4: Verification

**Files:**
- Verify: `tests/document-library.test.js`
- Verify: `tests/organization-administration-faculty.test.js`
- Verify: `tests/site-chrome-build.test.js`

**Interfaces:**
- Consumes: refactored templates.
- Produces: test and production-build evidence.

- [x] Run document contract tests and the relevant faculty/build tests.
- [x] Run the organization-administration production build.
- [x] Inspect the rendered listing and detail pages at mobile and desktop widths.
- [x] Run `git diff --check` and report the two previously accepted unrelated baseline failures separately.
