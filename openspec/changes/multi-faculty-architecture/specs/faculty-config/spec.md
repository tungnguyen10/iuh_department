## ADDED Requirements

### Requirement: Faculty JSON schema
Mỗi khoa SHALL có file `src/faculties/{faculty-id}/faculty.json` tuân theo schema cố định. File này là nguồn duy nhất cho faculty identity.

Required fields: `id` (kebab-case string), `name` (string), `shortName` (string), `email` (string), `phone` (string), `nav` (array), `topBar` (array), `social` (object), `colors` (object với keys: `brand-primary`, `brand-accent`, `brand-tint`, `brand-surface`).

`colors` values SHALL là hex strings (ví dụ `"#153898"`).

#### Scenario: Valid faculty.json được load thành công
- **WHEN** `VITE_FACULTY=health-science` được set và `src/faculties/health-science/faculty.json` tồn tại với đủ required fields
- **THEN** build system đọc file, không throw error, faculty data available cho layout injection

#### Scenario: Missing required field gây build error
- **WHEN** `faculty.json` thiếu field `colors.brand-primary`
- **THEN** build system throw error với message rõ ràng chỉ ra field nào thiếu

#### Scenario: Invalid VITE_FACULTY gây build error
- **WHEN** `VITE_FACULTY=nonexistent-faculty` được set nhưng `src/faculties/nonexistent-faculty/faculty.json` không tồn tại
- **THEN** build system throw error: "Faculty 'nonexistent-faculty' not found at src/faculties/nonexistent-faculty/"

### Requirement: Faculty identity injected vào layout
Build system SHALL inject faculty data từ `faculty.json` vào `default.html` layout template dưới dạng template variables.

Template variables available: `{{faculty.name}}`, `{{faculty.shortName}}`, `{{faculty.email}}`, `{{faculty.phone}}`, `{{faculty.id}}`.

#### Scenario: Faculty name hiển thị đúng trong header
- **WHEN** `VITE_FACULTY=information-tech` và `faculty.json` có `"name": "Khoa Công nghệ Thông tin"`
- **THEN** built HTML có "Khoa Công nghệ Thông tin" thay cho text KKSK

#### Scenario: Nav links generated từ faculty.json
- **WHEN** `faculty.json` có `nav` array với 6 items
- **THEN** header HTML chứa đúng 6 nav items với đúng labels và URLs

#### Scenario: TopBar links generated từ faculty.json
- **WHEN** `faculty.json` có `topBar` array với 3 items
- **THEN** header top bar chứa đúng 3 links

### Requirement: VITE_FACULTY mặc định khi không set
Khi `VITE_FACULTY` env var không được set, build system SHALL dùng `health-science` làm default để đảm bảo backward compatibility.

#### Scenario: Build không có VITE_FACULTY env var
- **WHEN** chạy `vite build` hoặc `vite dev` mà không set `VITE_FACULTY`
- **THEN** build thành công dùng `src/faculties/health-science/faculty.json`
