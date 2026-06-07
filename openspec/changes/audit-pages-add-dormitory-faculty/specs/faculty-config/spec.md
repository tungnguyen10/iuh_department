## ADDED Requirements

### Requirement: Optional excludePages field
`faculty.json` SHALL hỗ trợ field optional `excludePages` (array of string) liệt kê page filenames mà faculty này không muốn build vào dist của mình.

Mỗi entry là tên file (vd `"majors.html"`), match với file trong `src/pages/` hoặc `src/faculties/{id}/pages/`. Khi `excludePages` không được khai báo, mặc định là array rỗng (build mọi page).

#### Scenario: Faculty exclude page không thuộc nội dung mình
- **WHEN** `faculty.json` của Ký túc xá có `"excludePages": ["majors.html", "major-detail.html"]`
- **THEN** `dist/dormitory-management/` không chứa 2 file này

#### Scenario: Field thiếu mặc định không exclude
- **WHEN** `faculty.json` không có field `excludePages`
- **THEN** build include mọi page như cũ (backward compat)

#### Scenario: excludePages có entry trỏ tới file không tồn tại được warning
- **WHEN** `excludePages` chứa `"nonexistent.html"` mà không có file nào tên đó
- **THEN** build log warning nhưng vẫn thành công

### Requirement: Nav links không trỏ tới page bị exclude
`loadFaculty` validation SHALL kiểm tra mọi URL trong `nav` (kể cả nested children) không trỏ tới page nằm trong `excludePages`. Vi phạm SHALL fail build với error rõ ràng.

#### Scenario: Nav link trỏ tới excluded page gây build fail
- **WHEN** `excludePages: ["majors.html"]` và `nav` có item với `url: "/majors.html"`
- **THEN** build fail: "Faculty 'dormitory-management' nav links to excluded page: /majors.html"

#### Scenario: Nav links hợp lệ build thành công
- **WHEN** `excludePages: ["majors.html"]` và `nav` không có URL `/majors.html` (hoặc không có item nào)
- **THEN** validation pass, build tiếp

## MODIFIED Requirements

### Requirement: Faculty JSON schema
Mỗi khoa SHALL có file `src/faculties/{faculty-id}/faculty.json` tuân theo schema cố định. File này là nguồn duy nhất cho faculty identity.

Required fields: `id` (kebab-case string), `name` (string), `shortName` (string), `email` (string), `phone` (string), `nav` (array), `topBar` (array), `social` (object), `colors` (object với keys: `brand-primary`, `brand-accent`, `brand-tint`, `brand-surface`).

Optional fields: `excludePages` (array of string).

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

#### Scenario: Optional excludePages parse được
- **WHEN** `faculty.json` có field `"excludePages": ["majors.html"]`
- **THEN** field được load thành array, không throw error
