## ADDED Requirements

### Requirement: Build outputs không nằm trong source tree
Build outputs (Vite dist, faculty workspace tmp) SHALL không được commit vào source tree dưới bất kỳ thư mục nào của `src/`. `.gitignore` SHALL chứa patterns chặn các đường dẫn build output có thể vô tình tạo ra.

`.gitignore` patterns bắt buộc:
- `src/**/dist/`
- `src/dist/`
- `.tmp/`
- `dist/`
- `dist_*/`

#### Scenario: Build output sai chỗ bị gitignore bỏ qua
- **WHEN** developer chạy build với cwd hoặc OUT_DIR sai khiến output ghi vào `src/dist/`
- **THEN** thư mục mới tạo được gitignore tự động, không bị `git add` hay commit

#### Scenario: Source tree không chứa thư mục dist
- **WHEN** chạy `git ls-files | grep -E "src/.+/dist/"` trên repo
- **THEN** không có file nào được tracked dưới đường dẫn `src/**/dist/`

### Requirement: Faculty workspace temp folder isolated
Faculty build workspace (`.tmp/faculty-build/{id}/`) SHALL nằm ở repo root, không nằm trong `src/`, và SHALL được gitignore.

#### Scenario: Workspace tmp ở root
- **WHEN** build pipeline chuẩn bị faculty workspace
- **THEN** files được tạo dưới `.tmp/faculty-build/{id}/`, KHÔNG dưới `src/.tmp/` hay tương tự

#### Scenario: Workspace tmp không bị tracked
- **WHEN** chạy `git status` sau build
- **THEN** `.tmp/` không xuất hiện trong untracked hay modified files
