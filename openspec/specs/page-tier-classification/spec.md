# page-tier-classification Specification

## Purpose
Defines page tier labels and the build and override rules for shared, faculty-specific, and dev-only HTML pages.

## Requirements
### Requirement: Page tier classification
Each HTML file in `src/pages/` and `src/faculties/{id}/pages/` SHALL declare a tier at the top of the file using:

`<!-- TIER: shared-template | shared-with-vars | faculty-content | dev-only -->`

| Tier | Storage | Override | Render model |
|---|---|---|---|
| `shared-template` | `src/pages/` | Not required | Shared frame, data-driven content |
| `shared-with-vars` | `src/pages/` | Not required | Shared frame using `{{faculty.*}}` |
| `faculty-content` | `src/faculties/{id}/pages/` | Required per faculty | Faculty-specific content |
| `dev-only` | `src/pages/_dev/` | N/A | Not emitted to production dist |

#### Scenario: Page co tier comment hop le
- **WHEN** `src/pages/news.html` starts with `<!-- TIER: shared-template -->`
- **THEN** the build pipeline parses the tier and applies the matching rule

#### Scenario: Page khong co tier comment van build duoc
- **WHEN** a page in `src/pages/` has no tier comment
- **THEN** the build still succeeds for backward compatibility, but logs a warning

#### Scenario: Page tier dev-only nam trong _dev/ khong build vao dist
- **WHEN** `src/pages/_dev/form.html` exists with tier `dev-only`
- **AND** `yarn build:health-science` runs
- **THEN** `dist/health-science/form.html` does not exist, but the dev server can still serve `/_dev/form.html`

### Requirement: Faculty-content pages bat buoc override moi khoa
Pages marked `faculty-content` SHALL have a corresponding page in `src/faculties/{id}/pages/` for every faculty unless the page name is explicitly listed in that faculty's `excludePages`.

#### Scenario: Faculty thieu file faculty-content gay build error
- **WHEN** `src/pages/about.html` is marked `faculty-content`
- **AND** `src/faculties/dormitory-management/pages/about.html` does not exist
- **AND** `excludePages` does not contain `about.html`
- **THEN** the build fails with a missing required faculty-content page error

#### Scenario: Page bi exclude khong yeu cau override
- **WHEN** Dormitory Management has `excludePages: ["majors.html"]`
- **AND** `src/faculties/dormitory-management/pages/majors.html` does not exist
- **THEN** the build succeeds and `dist/dormitory-management/majors.html` is not emitted

### Requirement: Pages tier shared-template va shared-with-vars dung duoc cho moi khoa
Pages marked `shared-template` or `shared-with-vars` SHALL render for any faculty without requiring a page override.

#### Scenario: Khoa thu 2 dung news.html tu shared
- **WHEN** `src/pages/news.html` is marked `shared-template`
- **AND** `src/faculties/dormitory-management/pages/news.html` does not exist
- **THEN** Dormitory Management still gets a built `news.html` from the shared source
