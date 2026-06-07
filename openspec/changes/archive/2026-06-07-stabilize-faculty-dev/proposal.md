## Why

Workflow dev của khoa thứ 2 (`dormitory-management`) đang gãy: chạy `yarn dev:dormitory-management` trên Windows PowerShell ra exit 1 vì cú pháp `VITE_FACULTY=value vite` chỉ work trên POSIX shell. Đồng thời intro component của health-science đang là bản copy byte-for-byte của shared (file dư thừa, gây nhầm lẫn về cascade), và `industry-partnerships` thiếu wrapper section/container chuẩn nên trên trang dormitory hiển thị "đè" lên section liền trên (heading rộng full viewport, không có vertical padding). Ba vấn đề độc lập về nguyên nhân nhưng cùng chặn việc dùng faculty thứ 2 ở môi trường dev hằng ngày — nên gom vào một change "stabilize multi-faculty dev".

## What Changes

- **Cross-platform npm scripts**: Thêm `cross-env` vào `devDependencies`. Update `dev`, `dev:health-science`, `dev:dormitory-management`, `build`, `build:health-science`, `build:dormitory-management` trong `package.json` dùng `cross-env VITE_FACULTY=...`. Sau update, scripts chạy được trên cả PowerShell, cmd, bash, zsh.
- **Loại bỏ duplicate intro override của health-science**: Xoá `src/faculties/health-science/components/intro/index.html` (file trùng byte-for-byte với `src/components/intro/index.html`). Cascade tự fallback về shared. Giữ `src/faculties/dormitory-management/components/intro/index.html` (đã có nội dung riêng).
- **Quy ước "no duplicate-of-shared override"**: Thêm requirement vào `component-override-cascade` spec: faculty override file SHALL NOT trùng byte-for-byte với shared component — nếu giống, xoá để cascade fallback. Document trong `multi-faculty.instructions.md`.
- **Sửa wrapper `industry-partnerships`**: `src/components/industry-partnerships/index.html` đang chỉ có `<div class="industry-partnerships-section flex flex-col gap-4 ...">` — thiếu `<section>` boundary, vertical padding `py-8 md:py-14`, và `container mx-auto px-4`. Update để khớp pattern các section khác (intro, news, partners, research...). Thêm `data-module="industry-partnerships"` và `{{class}}` placeholder để consume `data-class` từ page.
- **Verify dormitory dev workflow boot được**: Sau khi fix, `yarn dev:dormitory-management` start clean trên Windows, browser hiển thị faculty đúng (logo dormitory, brand colors dormitory, content "Phòng Quản Lý Ký Túc Xá").

## Capabilities

### New Capabilities

(Không có)

### Modified Capabilities

- `faculty-build-pipeline`: Bổ sung requirement "build/dev scripts SHALL chạy được trên Windows PowerShell, Windows cmd, macOS/Linux bash mà không cần shell-specific syntax". Cụ thể hoá qua việc dùng `cross-env`.
- `component-override-cascade`: Bổ sung requirement "faculty override component SHALL NOT trùng byte-for-byte với shared". Faculty muốn dùng identical với shared thì SHALL xoá file faculty và để cascade fallback.

## Impact

- **Code**:
  - `package.json` — thêm `cross-env` devDependency, update 6 scripts.
  - `src/faculties/health-science/components/intro/index.html` — xoá.
  - `src/components/industry-partnerships/index.html` — wrap thêm `<section>` với padding + container.
- **Behavior**:
  - Build output không đổi cho health-science (intro vẫn render shared via cascade).
  - Build output có thay đổi nhỏ cho mọi faculty dùng `industry-partnerships`: section giờ có `<section data-module="industry-partnerships" class="w-full py-8 md:py-14 ...">` wrapper, content bên trong giữ nguyên. JS `industry-partnerships.js` cần verify vẫn query đúng selector.
- **Documentation**:
  - `.github/instructions/multi-faculty.instructions.md` — thêm rule "no duplicate override".
  - `README.md` — note Windows users chỉ cần `yarn install` rồi chạy script, không cần Git Bash.
- **Risks**:
  - **JS selector breakage**: `src/components/industry-partnerships/industry-partnerships.js` có thể đang query bằng `.industry-partnerships-section` hoặc `data-module`. Verify trước khi đổi wrapper.
  - **Yarn version**: cross-env phải compatible với Yarn 1.x/Berry hiện tại. cross-env 7.x không có vấn đề.
  - **Cache**: Sau khi xoá faculty intro override, Vite cache `.tmp/faculty-build/health-science/` cần xoá để rebuild sạch.
- **Out of scope** (tách change khác):
  - Refactor `vite.config.js` thành module — `refactor-vite-config` change.
  - Audit toàn bộ component shared khác xem có hardcode tên/màu KKSK không.
  - Đổi shared intro thành template + `intro` field trong `faculty.json` (cân nhắc sau).
