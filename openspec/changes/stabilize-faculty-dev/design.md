## Context

Sau khi `audit-pages-add-dormitory-faculty` thêm khoa thứ 2 (`dormitory-management`), workflow dev hằng ngày phát sinh 3 issue độc lập nhưng chặn việc dùng faculty thứ 2:

1. **Windows shell incompat**: `package.json` dùng cú pháp `VITE_FACULTY=value vite` (POSIX). Trên PowerShell/cmd, đoạn `VITE_FACULTY=...` được hiểu như tên lệnh → exit 1.

2. **Duplicate intro override**: `src/faculties/health-science/components/intro/index.html` byte-for-byte giống `src/components/intro/index.html` (verified bằng `Get-FileHash`: cùng `E2375ECD…` SHA256). File dư thừa, gây nhầm lẫn về cascade resolution.

3. **Industry-partnerships layout broken**: Trên dormitory homepage, section "Kết nối doanh nghiệp" đè lên section trên (heading rộng full-viewport 1525px, không có vertical padding). Root: `src/components/industry-partnerships/index.html` thiếu `<section>` wrapper với `py-* container mx-auto px-4` mà các component cùng cấp đều có (intro, news, partners, research, industry-careers, infrastructure).

Cả 3 đều phải fix mới có dev experience usable cho faculty thứ 2.

## Goals / Non-Goals

**Goals:**
- `yarn dev:dormitory-management` boot được trên Windows PowerShell, render đúng faculty (logo dormitory, brand colors, content "Phòng Quản Lý Ký Túc Xá").
- Loại bỏ duplicate-of-shared override của health-science intro; cascade tự fallback về shared.
- `industry-partnerships` section render với spacing/container đúng, không đè section liền kề.
- Document quy ước "no duplicate-of-shared override" để tránh tái diễn.

**Non-Goals:**
- Không tách shared intro thành template + JSON config (cân nhắc sau, không thuộc change này).
- Không refactor `vite.config.js` (đã có change `refactor-vite-config` riêng).
- Không audit toàn bộ shared component khác xem có hardcode KKSK content (out of scope; có thể tạo change riêng nếu cần).
- Không đổi schema `faculty.json` hay logic `@faculty/` cascade — chỉ thêm rule về override hợp lệ.

## Decisions

### Decision 1: cross-env cho Windows scripts

```json
// package.json devDependencies
"cross-env": "^7.0.3"

// scripts (sau update)
"dev": "cross-env VITE_FACULTY=health-science vite",
"dev:health-science": "cross-env VITE_FACULTY=health-science vite",
"dev:dormitory-management": "cross-env VITE_FACULTY=dormitory-management vite",
"build": "cross-env VITE_FACULTY=health-science VITE_OUT_DIR=dist_iuh vite build",
"build:health-science": "cross-env VITE_FACULTY=health-science VITE_OUT_DIR=dist/health-science vite build",
"build:dormitory-management": "cross-env VITE_FACULTY=dormitory-management VITE_OUT_DIR=dist/dormitory-management vite build"
```

**Alternatives considered:**
- `dotenv-cli` + `.env.<faculty>` files: Phải thêm file `.env.health-science`, `.env.dormitory-management`, dễ leak khi commit.
- Pre-script JS wrapper: Thêm 1 lớp Node spawn, slow start dev.
- Yêu cầu Git Bash trên Windows: User-hostile, không phải dev nào cũng cài.
- → cross-env: standard, ngắn gọn, không thêm file config.

### Decision 2: Xoá duplicate intro health-science (không giữ scaffold)

```
src/faculties/health-science/components/intro/
├── index.html  ❌ XOÁ (byte-for-byte = src/components/intro/index.html)
```

Cascade resolution (`@faculty/intro/index.html` từ `health-science/pages/index.html`) sẽ tự fallback về `src/components/intro/index.html`. Hành vi giống hệt trước, code sạch hơn.

**Alternatives considered:**
- Giữ + comment "scaffold for future override": Code dead, comment khó enforce.
- Đổi shared intro thành template + `intro.title/description` field trong `faculty.json`: Intro là content-heavy section (paragraph dài, nhiều element) → JSON sẽ phình; markup HTML khó maintain qua JSON. Cân nhắc sau khi có 3+ faculty.
- → Xoá, áp quy ước "no duplicate override".

### Decision 3: Quy ước "no duplicate-of-shared override"

Document trong:
- `openspec/specs/component-override-cascade/spec.md` — thêm requirement "Faculty override file SHALL NOT trùng byte-for-byte với shared. Nếu giống, xoá để cascade fallback."
- `.github/instructions/multi-faculty.instructions.md` — bullet thêm vào checklist khi tạo override.

Không enforce bằng build (build không check hash). Chỉ là quy ước review.

**Alternatives considered:**
- Build-time check: hash compare faculty override vs shared, fail nếu giống. → Phức tạp cho edge case (ví dụ: cố ý giữ override để tránh accidental shared change). Bỏ qua.
- Pre-commit hook: Out of scope, chưa có hook infrastructure.
- → Document-only convention.

### Decision 4: Industry-partnerships wrapper pattern

Trước:
```html
<div class="industry-partnerships-section flex flex-col gap-4 md:gap-6 w-full">
  <!-- content -->
</div>
```

Sau:
```html
<section data-module="industry-partnerships" class="w-full py-8 md:py-14 {{class}}">
  <div class="container mx-auto px-4">
    <div class="industry-partnerships-section flex flex-col gap-4 md:gap-6">
      <!-- content (giữ nguyên) -->
    </div>
  </div>
</section>
```

Khớp pattern với `intro`, `news`, `industry-careers`, `partners`, `research` (tất cả đều `<section data-module="..." class="... py-8 md:py-14 {{class}}">` rồi `<div class="container mx-auto px-4">`).

**Alternatives considered:**
- Chỉ thêm `py-8 md:py-14`, không thêm container: section sẽ có spacing nhưng content vẫn full-width, không khớp grid của các section khác.
- Đổi page wrapper `<section class="mx-auto">` thành `<section class="container mx-auto px-4">` (apply global): Tác động đến mọi section đã có `container mx-auto` riêng → double wrap. Không scale.
- → Sửa tại component để consistent với pattern hiện có.

### Decision 5: Verify JS không bị break bởi wrapper change

`src/components/industry-partnerships/industry-partnerships.js` có thể đang query bằng `.industry-partnerships-section` hoặc `[data-module]`. Trước khi commit:
1. `grep -n "industry-partnerships" src/components/industry-partnerships/industry-partnerships.js`
2. Nếu query class `.industry-partnerships-section`: không sao, class vẫn còn ở `<div>` con.
3. Nếu query `[data-module="industry-partnerships"]`: không sao, mới thêm vào.
4. Nếu query Swiper container `.industry-partnership-swiper`: không sao, không đụng.

## Risks / Trade-offs

- **[cross-env có conflict với Yarn 1/Berry?]** → Mitigation: cross-env 7.x compatible cả 2. Test bằng `yarn install` + `yarn dev:health-science` trước khi commit.
- **[Vite cache stale sau khi xoá faculty intro override]** Workspace mirror `.tmp/faculty-build/health-science/components/intro/index.html` có thể vẫn tồn tại nếu chỉ Ctrl+C dev server. → Mitigation: test bằng `Remove-Item -Recurse .tmp` rồi `yarn dev:health-science` để verify rebuild sạch.
- **[Industry-partnerships wrapper change ảnh hưởng JS]** Swiper init, scroll listener có thể bind vào root `<div>` cũ. → Mitigation: trước khi merge, kiểm tra `industry-partnerships.js` query selector; nếu cần, update để dùng class trên `<div>` con (vẫn còn).
- **[Spacing visual change cho health-science]** Health-science build hiện không dùng `industry-partnerships` (kiểm tra `src/pages/index.html`: không có `data-include="@components/industry-partnerships/index.html"`). → Mitigation: chỉ dormitory build affected; verify health-science visual không đổi.
- **[Dev server đang chạy với typo cũ]** User báo dev server đã sửa typo và chạy được. Nhưng terminal log shows exit 1 cho `dev:health-science` — khả năng do chưa cài cross-env nên POSIX syntax vẫn fail trên Windows. → Mitigation: cross-env install + script update trong cùng commit, test ngay.
