# Tasks - Stabilize Faculty Dev

## 1. Cross-env cho npm scripts

- [ ] 1.1 Cài cross-env: `yarn add -D cross-env@^7.0.3`
- [ ] 1.2 Update `package.json` scripts dùng `cross-env`:
  - `dev`, `dev:health-science`, `dev:dormitory-management`
  - `build`, `build:health-science`, `build:dormitory-management`
- [ ] 1.3 Verify `build:all` không cần đổi (chỉ chain `&&`)
- [ ] 1.4 Test trên Windows PowerShell: `yarn dev:health-science` start clean, không lỗi "VITE_FACULTY is not recognized"
- [ ] 1.5 Test trên Windows PowerShell: `yarn dev:dormitory-management` start clean, browser render đúng dormitory faculty
- [ ] 1.6 Test build: `yarn build:health-science` exit 0, `dist/health-science/` có content KKSK
- [ ] 1.7 Test build: `yarn build:dormitory-management` exit 0, `dist/dormitory-management/` có content "Phòng Quản Lý Ký Túc Xá"

## 2. Xoá duplicate intro override health-science

- [ ] 2.1 Verify hash trùng: `Get-FileHash src/components/intro/index.html, src/faculties/health-science/components/intro/index.html` → cùng SHA256
- [ ] 2.2 Xoá file: `Remove-Item src/faculties/health-science/components/intro/index.html`
- [ ] 2.3 Nếu folder `src/faculties/health-science/components/intro/` empty sau xoá → xoá luôn folder
- [ ] 2.4 Xoá Vite cache: `Remove-Item -Recurse -Force .tmp` (nếu tồn tại)
- [ ] 2.5 Test: `yarn dev:health-science` start, browser /index.html render intro section bình thường (cascade fallback shared)
- [ ] 2.6 Test: `yarn build:health-science` exit 0, `dist/health-science/index.html` vẫn chứa intro section (verify bằng grep "Khoa Khoa học Sức khoẻ")

## 3. Document quy ước "no duplicate-of-shared override"

- [ ] 3.1 Update `.github/instructions/multi-faculty.instructions.md`: thêm rule "Faculty override file SHALL NOT trùng byte-for-byte với shared. Nếu giống, xoá để cascade fallback."
- [ ] 3.2 Update `multi-faculty.instructions.md` checklist khi tạo override: thêm step "compare hash với shared trước khi commit"
- [ ] 3.3 Sync agent links: `bash scripts/sync-agent-links.sh` (nếu instruction file ở `.agents/`)

## 4. Fix industry-partnerships wrapper

- [ ] 4.1 Đọc `src/components/industry-partnerships/industry-partnerships.js` — note selector mà JS đang query (Swiper init, scroll bind, ...)
- [ ] 4.2 Update `src/components/industry-partnerships/index.html` root wrapper:
  - Đổi từ `<div class="industry-partnerships-section flex flex-col gap-4 md:gap-6 w-full">` 
  - Sang `<section data-module="industry-partnerships" class="w-full py-8 md:py-14 {{class}}"><div class="container mx-auto px-4"><div class="industry-partnerships-section flex flex-col gap-4 md:gap-6">`
  - Đóng đủ `</div></div></section>` ở cuối
- [ ] 4.3 Nếu JS query `.industry-partnerships-section`: không đụng (class vẫn còn ở `<div>` con).
- [ ] 4.4 Nếu JS query selector khác bị ảnh hưởng: update JS cho khớp.
- [ ] 4.5 Test trên dormitory: `yarn dev:dormitory-management`, mở `/`, scroll đến section "Kết nối doanh nghiệp"
  - Section có vertical padding tách khỏi section liền trên (news)
  - Heading "Kết nối doanh nghiệp" căn theo container width, không tràn full viewport
  - Swiper carousel partnership cards vẫn slide được
- [ ] 4.6 Test trên health-science (regression): `yarn dev:health-science`, kiểm tra page nào include industry-partnerships (nếu có) vẫn render đúng. Nếu health-science không include component này, skip.

## 5. Validation & archive

- [ ] 5.1 Run `npx openspec validate stabilize-faculty-dev --strict` — passes
- [ ] 5.2 Visual smoke test cả 2 faculty (dev mode): logo, brand colors, content đúng faculty
- [ ] 5.3 Build smoke test: `yarn build:all` exit 0
- [ ] 5.4 Verify Windows-friendly: chạy lại trên fresh PowerShell window (đóng terminal cũ rồi mở mới) → tất cả script work
- [ ] 5.5 Archive: `npx openspec archive stabilize-faculty-dev`
