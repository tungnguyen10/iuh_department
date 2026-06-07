## ADDED Requirements

### Requirement: Page tier classification
Mỗi file HTML trong `src/pages/` và `src/faculties/{id}/pages/` SHALL được gắn 1 tier qua HTML comment header ở đầu file: `<!-- TIER: shared-template | shared-with-vars | faculty-content | dev-only -->`.

Tier xác định cách file được build và override:

| Tier | Vị trí lưu | Override | Render |
|---|---|---|---|
| `shared-template` | `src/pages/` | Không cần — content render từ data | Frame chung, content từ JSON |
| `shared-with-vars` | `src/pages/` | Không cần — biến từ `faculty.json` | Frame chung, dùng `{{faculty.*}}` |
| `faculty-content` | `src/faculties/{id}/pages/` | Bắt buộc mỗi faculty có file | Content khác hoàn toàn giữa các khoa |
| `dev-only` | `src/pages/_dev/` | N/A | Không build vào production dist |

#### Scenario: Page có tier comment hợp lệ
- **WHEN** một file `src/pages/news.html` có comment `<!-- TIER: shared-template -->` ở đầu file
- **THEN** build pipeline parse được tier và xử lý theo rule tương ứng

#### Scenario: Page không có tier comment vẫn build được
- **WHEN** một file HTML trong `src/pages/` không có TIER comment
- **THEN** build vẫn thành công (backward compat), nhưng warning được log: "Page <name> chưa được phân loại tier"

#### Scenario: Page tier dev-only nằm trong `_dev/` không build vào dist
- **WHEN** `src/pages/_dev/form.html` tồn tại với tier `dev-only`
- **AND** chạy `yarn build:health-science`
- **THEN** `dist/health-science/form.html` KHÔNG tồn tại; nhưng dev server vẫn serve được tại `/_dev/form.html`

### Requirement: Faculty-content pages bắt buộc override mỗi khoa
Pages tier `faculty-content` SHALL có file tương ứng trong `src/faculties/{id}/pages/` cho mọi khoa, TRỪ KHI page name nằm trong `excludePages` của `faculty.json`.

#### Scenario: Faculty thiếu file faculty-content gây build error
- **WHEN** `src/pages/about.html` có tier `faculty-content`
- **AND** `src/faculties/dormitory-management/pages/about.html` không tồn tại
- **AND** `excludePages` không chứa `"about.html"`
- **THEN** build fail với error: "Faculty 'dormitory-management' missing required faculty-content page: about.html"

#### Scenario: Page bị exclude không yêu cầu override
- **WHEN** `faculty.json` của Ký túc xá có `excludePages: ["majors.html"]`
- **AND** `src/faculties/dormitory-management/pages/majors.html` không tồn tại
- **THEN** build thành công, dist không có `majors.html`

### Requirement: Pages tier shared-template và shared-with-vars dùng được cho mọi khoa
Pages tier `shared-template` hoặc `shared-with-vars` SHALL render đúng cho mọi khoa mà không cần override file. Faculty chỉ cần cung cấp data/biến cần thiết qua `data/*.json` hoặc `faculty.json`.

#### Scenario: Khoa thứ 2 dùng news.html từ shared
- **WHEN** `src/pages/news.html` có tier `shared-template`
- **AND** `src/faculties/dormitory-management/pages/news.html` không tồn tại
- **THEN** dist của Ký túc xá vẫn có `news.html` với frame giống KKSK
