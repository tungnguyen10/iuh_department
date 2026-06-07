## ADDED Requirements

### Requirement: Multi-faculty smoke test khi thêm khoa mới
Khi thêm faculty mới vào codebase, một smoke test SHALL được chạy để verify:

1. Build thành công: `yarn build:{new-faculty}` exit code 0.
2. Dist output tồn tại: `dist/{new-faculty}/index.html` và các page không bị exclude đều có file.
3. Identity render đúng: HTML chứa `name` của faculty (không phải tên khoa khác).
4. Brand colors render đúng: `<style>` injected có `--color-brand-primary` đúng giá trị từ `faculty.json`.
5. Nav render đúng: số lượng nav items và labels match `faculty.json` nav array.
6. Shared pages không có content cứng của faculty khác: pages tier `shared-template` hoặc `shared-with-vars` không chứa text identity của khoa khác (vd Ký túc xá build không thấy "Khoa Khoa học Sức khoẻ" hardcode).

#### Scenario: Khoa mới build thành công lần đầu
- **WHEN** `src/faculties/dormitory-management/faculty.json` được tạo đầy đủ và chạy `yarn build:dormitory-management`
- **THEN** build exit code 0, `dist/dormitory-management/` tồn tại với pages

#### Scenario: Khoa mới render đúng identity
- **WHEN** mở `dist/dormitory-management/index.html` (hoặc serve qua HTTP)
- **THEN** HTML chứa `"Phòng Quản Lý Ký Túc Xá"` ở nav/header/footer; không chứa text "Khoa Khoa học Sức khoẻ" ở vị trí identity

#### Scenario: Brand colors không bị leak từ khoa khác
- **WHEN** build `dormitory-management` với colors khác KKSK
- **THEN** `<style>` block trong HTML chứa giá trị RGB của Ký túc xá, không phải giá trị KKSK

## MODIFIED Requirements

### Requirement: Canonical Local Toolchain
The project SHALL document and support a single canonical local toolchain that can run OpenSpec and Vite builds with the supported Node version and package manager. Per-faculty build commands (`VITE_FACULTY={id} yarn build`) SHALL be documented alongside the standard build command.

Documented faculties SHALL match `src/faculties/` directory list. Khi thêm faculty mới, README và `multi-faculty.instructions.md` SHALL được cập nhật cùng commit.

#### Scenario: Build command uses supported runtime
- **WHEN** a developer follows the documented build instructions
- **THEN** the build SHALL run with Node 20.19+ or Node 22.12+ and SHALL complete successfully

#### Scenario: Unsupported npm path is not presented as equivalent
- **WHEN** the repository uses Yarn PnP artifacts without package binaries in `node_modules`
- **THEN** README instructions MUST NOT present `npm run build` as an equally supported command unless npm support is restored

#### Scenario: Per-faculty build documented
- **WHEN** a developer wants to build a specific faculty
- **THEN** README SHALL document `VITE_FACULTY={faculty-id} yarn build` or equivalent `yarn build:{faculty-id}` script syntax

#### Scenario: Documented faculty list matches source
- **WHEN** a faculty is added or removed in `src/faculties/`
- **THEN** README và `.agents/instructions/multi-faculty.instructions.md` SHALL reflect the change trong cùng commit
