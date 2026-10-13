# IDCS Updates Two-Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the IDCS homepage Updates tabs with a news-led two-column section that shows news and documents together.

**Architecture:** Keep the section in `src/faculties/idcs/components/home/updates/index.html`. Reuse the shared news renderer's `data-news-sidebar-items` marker with its editorial layout, shared `document-item` variant 6, and shared title/button includes. No runtime JavaScript behavior is required for the section.

**Tech Stack:** Static HTML includes, Tailwind utilities, Node test runner, Vite build.

## Global Constraints

- Desktop: news roughly 7/12 left, four documents roughly 5/12 right.
- Mobile: news before documents; no tabs or hidden panels.
- Preserve document destinations and shared component usage; synchronize imported news slugs with detail pages and search.
- Preserve unrelated uncommitted IDCS Training and carousel work.

---

### Task 1: Updates section and contract

**Files:**
- Modify: `tests/idcs-faculty.test.js`
- Modify: `src/faculties/idcs/components/home/updates/index.html`

**Interfaces:**
- Consumes: `data-news-sidebar-items data-limit="3"` processed by `createNewsRenderer`; shared document includes.
- Produces: static `<section aria-labelledby="updates-news-title">` and `<section aria-labelledby="updates-documents-title">` blocks with independent archive links.

- [x] **Step 1: Write the failing test.** Replace Updates tab assertions with checks for the shared sidebar news marker, two named sections, four document includes, and absence of tab roles or hidden panels. Keep Service Explorer tab assertions.
- [x] **Step 2: Run the focused test.** `node --test tests/idcs-faculty.test.js` failed on the old tab markup.
- [x] **Step 3: Implement the section.** Removed `.tabs-container`, tab buttons and panels. The left block renders `data-news-sidebar-items data-limit="3"`; the right block keeps four compact document includes. Each block has its own shared archive button.
- [x] **Step 4: Verify.** Focused tests, IDCS build and `git diff --check` passed. Built HTML contains 3 news links, 4 document links and no tab roles or unresolved includes. Desktop and mobile screenshots were inspected.

No commit in this task: the working tree contains the user's other uncommitted IDCS changes.

### Task 2: Visual correction and IDC content import

- [x] Remove nested card frames and flashing labels; make the lead image and headline prominent using an opt-in editorial news variant.
- [x] Add publication-style rows to the existing shared document primitive with type/date, title and document code.
- [x] Correct archive button include parameters so the generated HTML preserves the button classes and inline arrow.
- [x] Import four sourced IDC news summaries and images; update search destinations and source links.
- [x] Verify focused news, IDCS and document tests and the IDCS production build.
- [x] Inspect desktop, tablet and mobile renders at 1440, 1024, 768 and 375px, plus the section between its neighboring homepage blocks.
- [x] Verify all four detail routes and archive button alignment in the browser. Each route displays its own title and IDC source link; both archive buttons keep text and arrow aligned at 375px and 1440px. Focused tests: 28 passed.
