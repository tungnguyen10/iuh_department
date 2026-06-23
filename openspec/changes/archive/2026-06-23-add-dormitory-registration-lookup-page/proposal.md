## Why

After signing in via `pages/login.html`, students currently have nowhere to land - the Dormitory module does not yet expose the post-login "Đăng ký nội trú / Tra cứu" surface where students can:

- See their own profile information returned by the lookup (MSSV, khoa, lớp, năm nhập học, giới tính, tình trạng ở KTX).
- See the current state of their dormitory registration (no eligible round, can register, pending approval, approved with pending payment proof, active).
- Upload payment-proof images when an approval requires it.
- Review their KTX stay history (or see the empty state when none exists).
- Switch between the lookup view, the stay-history view, and log out.

This is the natural target of the login flow and is the most-requested surface for students. Building it requires a chromeless layout variant (no public site header/footer because the screenshots show only an in-page action bar) and uses the shared form primitives delivered by the `standardize-shared-form-primitives` change.

## What Changes

- Add a Dormitory-owned post-login lookup page (`pages/tra-cuu.html`) that renders the "THÔNG TIN TRA CỨU" profile panel and the "Lịch sử ở KTX" table inside the standard public chrome (same header/footer as the rest of the public site).
- Add a chromeless layout mode to the shared layout plugin so the login surface can suppress the public header, footer, search modal, and scroll-to-top widgets while keeping shared loading, meta, and global runtime concerns; the new lookup page does NOT use this mode.
- Add a Dormitory-owned registration-status section that renders each defined state (no eligible round, can register, pending approval, approved + payment-proof upload, active) stacked vertically as a static showcase - no state toggle, no JavaScript wiring.
- Add a Dormitory-owned stay-history section that renders the empty state and exposes a populated variant for the future.
- Wire the login form's submit action so the prototype "submits" to `/tra-cuu.html`.
- Add mock student data and mock registration/history fixtures under `src/faculties/dormitory-management/data/` (no backend) so the page composition is data-driven.
- Update Dormitory faculty configuration so the new page is reachable from the login flow; do NOT expose the lookup page in the public navigation or search modal (it is post-login only).
- Preserve all existing public Dormitory and Health Science behavior, including the current login page UI.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dormitory-management-faculty`: adds the post-login lookup page, its registration-status state model, its stay-history section, and the related discoverability / data isolation rules.
- `multi-faculty-architecture`: adds the chromeless layout mode (used by the existing `login.html`) so other faculties can build focused pre-login surfaces with the same shell behavior.

## Impact

- Affected source:
  - `vite.config.js` (`layoutPlugin` chromeless flag handling)
  - `src/shared/layouts/default.html` (chromeless conditional rendering)
  - `src/faculties/dormitory-management/pages/tra-cuu.html` (new, uses standard chrome)
  - `src/faculties/dormitory-management/pages/login.html` (form action wiring + `chrome="off"`)
  - `src/faculties/dormitory-management/components/lookup/profile-panel/` (new)
  - `src/faculties/dormitory-management/components/lookup/registration-row/` (new, with per-state variants)
  - `src/faculties/dormitory-management/components/lookup/stay-history/` (new, with empty and populated variants)
  - `src/faculties/dormitory-management/data/lookup-mock.json` (new)
  - `src/faculties/dormitory-management/faculty.config.js` (no public nav additions)
- No backend, API, authentication, or session-management dependency changes. This is a static prototype that demonstrates the surface.
- Verification:
  - OpenSpec validation for `add-dormitory-registration-lookup-page`.
  - Selected build for `FACULTY=dormitory-management` produces `tra-cuu.html`.
  - Manual visual review against the reference screenshots; confirm all five registration states render simultaneously on the page.
  - Audit that the public site header and footer do NOT render on `login.html` or `tra-cuu.html`, and that `tra-cuu.html` is NOT linked from the public header, quick links, or search modal.
- Hard dependency: this change consumes the shared form primitives that the `standardize-shared-form-primitives` change adds (display row, file upload, data table, inline group). Order the two changes accordingly.
