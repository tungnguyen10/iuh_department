# Dormitory Management Form Demo Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Dormitory Management form-component demo page that preserves Health Science coverage and includes KTX-specific example fields.

**Architecture:** Create one faculty page by using the Health Science demo as the structural baseline, then adapt only faculty-facing copy and add a self-contained Dormitory information field group. The page continues to consume shared form/button/breadcrumb primitives and relies on Vite's existing HTML-page discovery, so no shared component or build configuration changes are required.

**Tech Stack:** HTML includes, Tailwind CSS utility classes, shared IUH form primitives, vanilla browser JavaScript, Vite 7.

## Global Constraints

- Preserve the complete form-component and table-style coverage from `src/faculties/health-science/pages/form.html`.
- Add one clearly separated “Thông tin nội trú” example section using existing shared form primitives.
- Submission remains client-side; add no API, persistence, shared CSS, shared component, or faculty-wide configuration changes.
- Keep native browser validation and the existing demo submit handler.

---

### Task 1: Create and adapt the Dormitory form demo page

**Files:**
- Reference: `src/faculties/health-science/pages/form.html`
- Create: `src/faculties/dormitory-management/pages/form.html`

**Interfaces:**
- Consumes: `@shared/components/common/breadcrumb.html`, `@shared/components/form/field.html`, `@shared/components/form/choice.html`, `@shared/components/form/choice-option.html`, `@shared/components/form/file.html`, `@shared/components/form/option.html`, and `@shared/components/button/button.html`.
- Produces: `/form.html` in the Dormitory Management build, with `#demoForm`, `#message`, `#messageCharCount`, and the existing inline demo script intact.

- [ ] **Step 1: Verify the page is initially absent**

Run:

```bash
test ! -e src/faculties/dormitory-management/pages/form.html
```

Expected: exit code 0.

- [ ] **Step 2: Create the page from the complete Health Science baseline**

Use `apply_patch` to add `src/faculties/dormitory-management/pages/form.html` with the complete contents of `src/faculties/health-science/pages/form.html`. This preserves all form sections, three table examples, character counting, and client-side demo submission before focused adaptation.

- [ ] **Step 3: Adapt faculty-facing copy**

Use `apply_patch` to make these exact replacements in the new file only:

```text
title: "Form Components - Phòng Quản lý Ký túc xá"
description: "Bộ sưu tập đầy đủ các form components dùng cho các nghiệp vụ nội trú IUH"
keywords: "form, input, components, ký túc xá, nội trú, IUH"
breadcrumb current page: "Form Components Ký túc xá"
hero badge: "Dormitory Form Components"
hero accent line: "cho nghiệp vụ nội trú"
hero description: "Các loại form input dùng chung, kèm ví dụ thông tin sinh viên và yêu cầu nội trú"
form heading: "Form Components Ký túc xá"
form subheading: "Bộ input dùng chung và các trường thông tin nội trú mẫu"
support email: "kytucxa@iuh.edu.vn"
support phone: "0283 8940 390"
```

Retain `url="https://iuh.edu.vn/form"` and use `ogImage="/assets/images/dormitory-campus.jpg"`.

- [ ] **Step 4: Add the Dormitory information group**

Insert the group immediately after the opening `<form id="demoForm" class="iuh-form space-y-8">`. Use shared field primitives and unique identifiers:

```html
<div class="space-y-6">
  <h3 class="font-inter font-bold text-base sm:text-lg text-primary-dark-blue flex items-center gap-2">
    <div class="w-1 h-5 sm:h-6 bg-primary-yellow rounded-full"></div>
    Thông tin nội trú
  </h3>

  <div class="iuh-form-grid">
    <div data-include="@shared/components/form/field.html"
      data-id="studentId"
      data-name="studentId"
      data-type="text"
      data-label="Mã số sinh viên"
      data-required-text="*"
      data-icon="/assets/svgs/icon-user.svg"
      data-placeholder="20012345"
      data-attrs="required inputmode=numeric pattern=[0-9]{8,12}"
      data-helper-text="Nhập từ 8 đến 12 chữ số">
    </div>

    <div data-include="@shared/components/form/field.html"
      data-id="roomNumber"
      data-name="roomNumber"
      data-type="text"
      data-label="Số phòng"
      data-icon="/assets/svgs/icon-building.svg"
      data-placeholder="Ví dụ: A2-305">
    </div>
  </div>

  <div class="iuh-form-grid">
    <div data-include="@shared/components/form/field.html"
      data-variant="3"
      data-id="dormitoryArea"
      data-name="dormitoryArea"
      data-label="Khu / tòa ký túc xá"
      data-required-text="*"
      data-icon="/assets/svgs/icon-building.svg"
      data-placeholder-value=""
      data-placeholder-text="Chọn khu / tòa"
      data-attrs="required"
      data-option1-value="a" data-option1-text="Khu A"
      data-option2-value="b" data-option2-text="Khu B"
      data-option3-value="c" data-option3-text="Khu C">
    </div>

    <div data-include="@shared/components/form/field.html"
      data-variant="3"
      data-id="dormitoryRequestType"
      data-name="dormitoryRequestType"
      data-label="Loại yêu cầu"
      data-required-text="*"
      data-icon="/assets/svgs/icon-message.svg"
      data-placeholder-value=""
      data-placeholder-text="Chọn loại yêu cầu"
      data-attrs="required"
      data-option1-value="registration" data-option1-text="Đăng ký nội trú"
      data-option2-value="maintenance" data-option2-text="Báo bảo trì"
      data-option3-value="security" data-option3-text="An ninh trật tự"
      data-option4-value="other" data-option4-text="Hỗ trợ khác">
    </div>
  </div>
</div>
```

- [ ] **Step 5: Run structural assertions**

Run:

```bash
test -f src/faculties/dormitory-management/pages/form.html
rg -n 'Thông tin nội trú|data-id="studentId"|data-id="dormitoryArea"|data-id="roomNumber"|data-id="dormitoryRequestType"|id="demoForm"|id="message"|data-helper-id="messageCharCount"' src/faculties/dormitory-management/pages/form.html
```

Expected: all eight required strings are printed from the new file.

- [ ] **Step 6: Compare baseline coverage**

Run:

```bash
for marker in 'Text Inputs' 'Number & Date Inputs' 'Select & Dropdown' 'Radio Buttons' 'Checkboxes' 'File Upload' 'Textarea' 'Style 1: Simple Table' 'Style 2: Striped Table' 'Style 3: Card Table'; do rg -q "$marker" src/faculties/dormitory-management/pages/form.html || exit 1; done
```

Expected: exit code 0, confirming every source demo section remains present.

- [ ] **Step 7: Build the Dormitory faculty site**

Run:

```bash
FACULTY=dormitory-management npm run build
```

Expected: Vite exits with code 0 and emits `form.html` among the built pages.

- [ ] **Step 8: Check the diff and commit implementation**

Run:

```bash
git diff --check
git diff -- src/faculties/dormitory-management/pages/form.html
git add src/faculties/dormitory-management/pages/form.html
git commit -m "feat(dormitory): add form components page"
```

Expected: no whitespace errors; the commit contains only the new Dormitory page.

