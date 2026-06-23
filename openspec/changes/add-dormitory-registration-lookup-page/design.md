## Context

The Dormitory Management module exposes a public site (home, about, news, news detail, contact) plus an unauthenticated `pages/login.html`. The login form is presently a dead-end - submitting it has no destination. The two reference screenshots provided by the product owner show the expected post-login experience:

- A page titled "Đăng ký nội trú" with a top-right action bar containing Tra cứu, Lịch sử ở KTX, and Đăng xuất.
- A "THÔNG TIN TRA CỨU" panel laying out the signed-in student's profile in a two-column key/value grid (Sinh viên, MSSV, Khoa, Lớp, Giới tính, Năm nhập học, Tình trạng, Đăng ký).
- A "Lịch sử ở KTX" data table with columns TT / Thời gian / Trạng thái and an explicit empty state ("Không có thông tin").
- Two state variants of the same page: one where the "Đăng ký" row says "Chưa có đợt ĐK phù hợp!", and one where it says "Đã duyệt hồ sơ - Tải phiếu" and a new row appears allowing the student to upload payment-proof images.

The screenshots show no public IUH site header or footer - only the in-page action bar - so the page needs a chromeless layout. The shared layout plugin in `vite.config.js` currently wraps every page that includes a `<!-- LAYOUT: title -->` marker with the full public chrome. Pages without the marker bypass the layout entirely, but doing that for an authenticated page would also lose shared meta tags, the loading overlay, and the global script wiring.

The form primitives this page needs (read-only display rows, file upload + side action, data table with empty state, inline groups) come from the `standardize-shared-form-primitives` change. This change depends on those primitives being available.

The page is post-login and SHOULD NOT appear in the public site header, quick links, or search modal.

## Goals / Non-Goals

**Goals:**

- Provide a Dormitory-owned `pages/tra-cuu.html` that visually matches the reference screenshots.
- Render every defined registration state and every defined stay-history state so reviewers can validate the design end to end.
- Suppress the public header, footer, search modal, and scroll-to-top widgets on the lookup page and on the existing `pages/login.html` (consistent post-login / pre-login chrome).
- Keep shared layout responsibilities intact (meta tags, favicons, theme color, loading overlay, main script, page script slot, global module manager).
- Provide a shared auth action bar component so the action bar can be reused by future authenticated surfaces.
- Wire the login form so submitting it lands the user on `/tra-cuu.html`; wire the Đăng xuất link so it returns the user to `/login.html`.
- Drive the lookup data from a mock JSON file under the Dormitory data directory so the page is data-shaped and not a static text dump.

**Non-Goals:**

- No real authentication, session storage, cookie handling, CSRF protection, or password verification.
- No backend integration, real student lookup, real registration submission, or real file upload handling.
- No image processing for the uploaded payment proof.
- No PDF generation for "Tải phiếu".
- No production-grade route guard for the lookup page. The chromeless layout is purely visual; the page is publicly accessible at the URL like every other page in this static site.
- No translation work beyond Vietnamese copy already in the screenshots.
- No changes to the Health Science module.

## Decisions

### Decision 1: Add a chromeless layout mode via a layout marker flag

Extend the shared layout plugin in `vite.config.js` to recognise a new layout marker `<!-- LAYOUT: chrome="off" -->` (default `"on"`). When `chrome="off"`:

- The wrapping layout SHALL skip rendering the public header include, the footer include, the search modal include, the scroll-to-top button, and any other public-only chrome.
- The wrapping layout SHALL still render the `<html>`, `<head>`, meta tags, favicons, theme color, body wrapper, loading overlay, page content, main script tag, and page script slot.

Rationale: the existing layout plugin already supports flag-style markers (title, description, script, ogImage). Adding one more flag keeps a single layout template and avoids template-template branching across faculties. Pages stay authored against a single canonical shell.

Alternatives considered:

- A second layout template (`auth.html`). Rejected - duplicates the meta/loading wiring and requires every consumer to remember which layout to point at. Keeping one shell is simpler.
- Skipping the layout entirely (no marker). Rejected - loses the shared meta tags, favicons, loading overlay, and main script injection, which would diverge from every other page in the site.

### Decision 2: Lookup page uses the standard public chrome

The lookup page renders inside the standard shared layout - public header, public footer, search modal, and scroll-to-top widget all on. The only chromeless surface is `pages/login.html`.

Rationale: removing the chrome on the lookup page would require a separate in-page navigation primitive (an "auth action bar") to replace the public header. For a static prototype with no real authentication, that adds a component, styles, and a discoverability rule for a fixture that has no real session boundary. Reusing the public chrome keeps the lookup page consistent with every other content page in the site and avoids inventing a redundant navigation surface.

Alternative considered: chromeless lookup page plus a shared `auth/action-bar` component. Rejected - duplicates navigation that the public header already provides, and the prototype has no session state to gate behind the auth chrome.

### Decision 3: Define the registration row as a finite state set

The "Đăng ký" row in the profile panel has five well-defined states. Each state is implemented as a separate variant of a Dormitory-owned `lookup/registration-row` component:

| State | Visible text | Extra section |
|---|---|---|
| `no_round` | "Chưa có đợt ĐK phù hợp!" (gray, centered) | none |
| `can_register` | "Đăng ký nội trú" CTA button | none |
| `pending` | "Đang chờ duyệt hồ sơ" (yellow status) | none |
| `approved` | "Đã duyệt hồ sơ - Tải phiếu" (orange link to phiếu download) | "Upload hình biên lai chuyển khoản" row using the shared file primitive |
| `active` | "Đang ở KTX" (green status) | none |

The page renders all five state variants stacked vertically as a static showcase. There is no JavaScript toggle, URL query parameter, or runtime state selection - the page is a landing surface that demonstrates every state at once.

Rationale: states are visible product behavior worth pinning in the spec. Listing them in the component variants prevents drift and gives the future backend a clear contract. Rendering them all at once keeps the page free of throwaway prototype JavaScript and lets reviewers see the whole state space without URL gymnastics.

Alternative considered: a URL query param (`?state=approved`) plus CSS toggling. Rejected - it introduced a JavaScript wiring layer for a static prototype that has no backend, and reviewers preferred seeing every state on one screen. The component still exposes each state as a discrete variant so a future authenticated page can opt into single-state rendering.

### Decision 4: Stay-history is its own component with empty and populated variants

The "Lịch sử ở KTX" table lives in `lookup/stay-history` and uses the shared `table` primitive. It exposes two variants: empty-state ("Không có thông tin") and populated (with row data fed from the mock JSON).

Rationale: the empty state is visually distinct from the populated state and needs to be documented as a first-class case.

### Decision 5: Mock data lives in the Dormitory data directory

A single `src/faculties/dormitory-management/data/lookup-mock.json` holds:

- The student profile (name, MSSV, khoa, lớp, giới tính, năm nhập học, tình trạng).
- The registration state and supporting copy.
- The stay-history rows (or empty array).

The page reads this mock through the same path the Dormitory module already uses for `news.json` and `search-data.json`.

Rationale: parity with existing patterns; lets a future backend swap the mock for a real fetch without restructuring the page.

Alternative considered: hardcode the profile in the HTML. Rejected - reviewers would need to edit HTML to preview different student fixtures.

### Decision 6: Lookup page is post-login - not in public navigation

The new page MUST NOT be added to Dormitory `faculty.config.js` header navigation, quick links, search categories, or search-data fixtures. Discoverability happens only through the login form's submit action.

Rationale: the screenshots show a post-login workflow; surfacing the lookup in the public site would mislead unauthenticated visitors. The page still renders with the public chrome, but the chrome's navigation does not link to it.

### Decision 7: Login form wiring is prototype-only

The login form's `action` attribute is repointed to `/tra-cuu.html` for prototype purposes only. No authentication or validation is added.

Rationale: keeps the change scope honest. Real auth belongs in a follow-up change with its own backend.

## Risks / Trade-offs

- Chromeless layout flag mishandled by future pages -> Default is `"on"`, only explicit `"off"` strips chrome; documented in the layout template.
- Reviewers unsure which registration state they are seeing -> Render every state stacked with its native visual treatment (gray copy, CTA button, yellow pending badge, orange download link plus upload, green active badge) so the differences are visible on the same screen.
- File upload appears interactive but does nothing -> Add a helper paragraph clarifying the prototype scope and disable the upload button until a file is chosen; submission is a no-op.
- Public discoverability leakage -> Add an explicit grep check during verification that `tra-cuu` does NOT appear in `faculty.config.js`, `search-data.json`, or public page links.
- Layout plugin change risks regressing other pages -> Default behavior is identical when `chrome="off"` is absent; verify by rebuilding both faculties and diffing output.
- The lookup page depends on primitives that ship with `standardize-shared-form-primitives` -> Sequence: standardize first, then add this page.

## Migration Plan

1. Land `standardize-shared-form-primitives` so the file, display-row, table, and inline-group primitives exist.
2. Extend the shared layout plugin and `default.html` for the `chrome="off"` flag.
3. Apply `chrome="off"` to the existing `pages/login.html` and verify no visual regression on the public chrome of other pages.
4. Add `data/lookup-mock.json` with the reference student profile, registration state, and stay-history rows.
5. Add Dormitory `components/lookup/profile-panel`, `components/lookup/registration-row` (all five state variants), and `components/lookup/stay-history` (empty and populated variants).
6. Add `pages/tra-cuu.html` composing those components with the standard public chrome.
7. Repoint `pages/login.html` form submit to `/tra-cuu.html`.
8. Run OpenSpec validation and selected Dormitory build.
9. Manual visual check against the reference screenshots; confirm every registration state renders simultaneously.

Rollback: revert the new page, components, mock data, layout flag, and login wiring.

## Open Questions

- ~~Should the prototype use a URL query parameter (`?state=approved`) to switch states for review, or render all states stacked in the same page for review purposes?~~ Resolved: render every state stacked. Decision 3 captures the rationale.
- Long-term, does Tra cứu live at `/tra-cuu.html` (matches the menu label) or under a different route? Default for this change: `/tra-cuu.html`. Promote / rename when real auth ships.
- Should the page surface an explicit prototype banner ("Đây là bản demo, dữ liệu mô phỏng")? Default: yes, a small `iuh-form-note` at the bottom so reviewers understand the data is fixed.
