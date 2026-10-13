# IDCS Training Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the IDCS homepage training section lead visitors to request registration for the featured productivity improvement course.

**Architecture:** The homepage section composes shared heading and button primitives with faculty course-card variants. A `mailto:` link handles the registration request because the repository's contact form is illustrative. Existing training-page card variants remain available.

**Tech Stack:** Vite, HTML include transformer, Tailwind CSS.

## Global Constraints

- Primary course: “Nâng cao năng suất & cải tiến quy trình sản xuất”.
- Registration requests go to `idcs@iuh.edu.vn`; do not claim enrollment is complete.
- Preserve the three other training directions and their existing program facts.
- Use existing IUH colors, typography, shared heading/button primitives, and training image.

---

### Task 1: Adapt faculty course-card variants for the sales layout

**Files:**
- Modify: `src/faculties/idcs/components/home/training/course-card.html`

**Interfaces:**
- Consumes: `data-category`, `data-title`, `data-description`, `data-duration`, `data-format`, `data-audience`, `data-image`, `data-image-alt`, and `data-url` from include attributes.
- Produces: variant 3 as the featured offer and variant 4 as a compact supporting program card.

- [x] Make variant 3 a dark-blue two-column image and content panel on desktop. Put content first in source order for mobile. Include the three existing training topics, program facts, and a shared button variant 2 labeled “Gửi yêu cầu đăng ký khóa”.
- [x] Make variant 4 a compact supporting row with category, title, program facts, and a keyboard-focusable full-row link to `/training.html#programs`.
- [x] Keep variants 1 and 2 intact for `/training.html`.

### Task 2: Compose the homepage section

**Files:**
- Modify: `src/faculties/idcs/components/home/training/index.html`

**Interfaces:**
- Consumes: course-card variants 3 and 4; shared `section-title` and `button` templates.
- Produces: a featured-course registration request and three supporting program rows.

- [x] Keep the section heading and rewrite its introduction to state the offer in concrete terms.
- [x] Supply the featured card with the existing image, an accurate professional-event caption, course facts, and a `mailto:idcs@iuh.edu.vn` URL whose subject names the course.
- [x] Place the three remaining programs beneath it and add one secondary link to `/training.html#programs`.
- [x] State that details and scheduling are agreed with the company.
- [x] Give the section a pale-yellow background and blue feature panel to create a clear transition between the adjacent light-gray sections.

### Task 3: Verify the rendered result

**Files:**
- Inspect: `src/faculties/idcs/components/home/training/index.html`
- Inspect: `src/faculties/idcs/components/home/training/course-card.html`

- [x] Run `git diff --check` and `node --test tests/idcs-faculty.test.js`; expect zero failures.
- [x] Run `FACULTY=idcs VITE_OUT_DIR=/tmp/iuh-idcs-training-sales-build corepack yarn build`; expect exit code 0.
- [x] Inspect built `index.html` for four program cards, a single featured registration `mailto:` link, a secondary link to `/training.html#programs`, and no unresolved includes.
- [x] Inspect desktop and mobile screenshots of the built section; correct overflow or hierarchy issues, then repeat the relevant checks.

### Task 4: Reconcile the homepage opening with the IDCS offer

**Files:**
- Modify: `src/faculties/idcs/components/home/carousel/carousel.html`
- Modify: `src/faculties/idcs/components/home/carousel/carousel.js`
- Modify: `src/faculties/idcs/components/home/carousel/carousel.scss`

- [x] Replace the three repeated dormitory banners with distinct IDCS training, technical-service, and technology-transfer slides using the existing IUH images.
- [x] Use shared button links to the matching homepage sections and preserve three carousel slides.
- [x] Remove the coverflow rotation and hide navigation arrows at mobile widths where they overlap the copy.
- [x] Review the opening, Training section, and adjacent sections in desktop and mobile previews; rerun the IDCS tests and production build.
