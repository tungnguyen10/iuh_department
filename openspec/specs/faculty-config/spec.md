# faculty-config Specification

## Purpose
Defines the faculty identity schema and build-time injection of faculty data into layout templates.

## Requirements
### Requirement: Faculty JSON schema
Each faculty SHALL have `src/faculties/{faculty-id}/faculty.json` as the single source of faculty identity.

Required fields: `id`, `name`, `shortName`, `email`, `phone`, `nav`, `topBar`, `social`, and `colors` with keys `brand-primary`, `brand-accent`, `brand-tint`, `brand-surface`.

Optional fields: `excludePages` (array of strings).

`colors` values SHALL be hex strings such as `#153898`.

#### Scenario: Valid faculty.json duoc load thanh cong
- **WHEN** `VITE_FACULTY=health-science` and `src/faculties/health-science/faculty.json` exists with all required fields
- **THEN** the build reads the file without throwing and exposes faculty data to layout injection

#### Scenario: Missing required field gay build error
- **WHEN** `faculty.json` is missing `colors.brand-primary`
- **THEN** the build throws a clear error naming the missing field

#### Scenario: Invalid VITE_FACULTY gay build error
- **WHEN** `VITE_FACULTY=nonexistent-faculty` and `src/faculties/nonexistent-faculty/faculty.json` does not exist
- **THEN** the build throws `Faculty 'nonexistent-faculty' not found at src/faculties/nonexistent-faculty/`

#### Scenario: Optional excludePages parse duoc
- **WHEN** `faculty.json` contains `"excludePages": ["majors.html"]`
- **THEN** the field is loaded as an array without error

### Requirement: Optional excludePages field
`faculty.json` SHALL support an optional `excludePages` field listing page filenames that a faculty does not want emitted into its dist output.

Each entry matches a page file in either `src/pages/` or `src/faculties/{id}/pages/`. If the field is omitted, the default is an empty array.

#### Scenario: Faculty exclude page khong thuoc noi dung minh
- **WHEN** Dormitory Management sets `"excludePages": ["majors.html", "major-detail.html"]`
- **THEN** `dist/dormitory-management/` does not contain those files

#### Scenario: Field thieu mac dinh khong exclude
- **WHEN** `faculty.json` omits `excludePages`
- **THEN** the build includes all pages as before

#### Scenario: excludePages co entry tro toi file khong ton tai duoc warning
- **WHEN** `excludePages` contains `"nonexistent.html"` and no page by that name exists
- **THEN** the build logs a warning and still succeeds

### Requirement: Nav links khong tro toi page bi exclude
Build-time faculty validation SHALL ensure every `nav` URL, including nested child items, does not point to a page named in `excludePages`.

#### Scenario: Nav link tro toi excluded page gay build fail
- **WHEN** `excludePages: ["majors.html"]` and `nav` contains `url: "/majors.html"`
- **THEN** the build fails with a clear excluded-page nav error

#### Scenario: Nav links hop le build thanh cong
- **WHEN** `excludePages: ["majors.html"]` and `nav` contains no `/majors.html` link
- **THEN** validation passes and the build continues

### Requirement: Faculty identity injected vao layout
Build system SHALL inject faculty data from `faculty.json` into `default.html` layout templates through template variables.

Available variables: `{{faculty.name}}`, `{{faculty.shortName}}`, `{{faculty.email}}`, `{{faculty.phone}}`, `{{faculty.id}}`.

#### Scenario: Faculty name hien thi dung trong header
- **WHEN** `VITE_FACULTY=information-tech` and `faculty.json` contains `"name": "Khoa Cong nghe Thong tin"`
- **THEN** built HTML shows that faculty name instead of Health Science text

#### Scenario: Nav links generated tu faculty.json
- **WHEN** `faculty.json` contains a `nav` array with 6 items
- **THEN** the header HTML contains those 6 nav items with matching labels and URLs

#### Scenario: TopBar links generated tu faculty.json
- **WHEN** `faculty.json` contains a `topBar` array with 3 items
- **THEN** the header top bar contains those 3 links

### Requirement: VITE_FACULTY mac dinh khi khong set
If `VITE_FACULTY` is not set, the build SHALL default to `health-science` for backward compatibility.

#### Scenario: Build khong co VITE_FACULTY env var
- **WHEN** `vite build` or `vite dev` runs without `VITE_FACULTY`
- **THEN** the build succeeds using `src/faculties/health-science/faculty.json`
