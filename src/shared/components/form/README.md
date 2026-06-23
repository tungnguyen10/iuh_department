# Shared Form Primitives

Canonical primitives for every form surface in IUH faculty pages. **Do not hand-roll `<input>`, `<select>`, `<textarea>`, or labeled rows** inside `src/faculties/**/pages/**` — consume one of the includes below.

## Files

| File | Purpose |
|---|---|
| `form.scss` | Canonical CSS classes for every primitive. All classes use the `iuh-form-*` namespace. |
| `field.html` | Labeled input, textarea, or select (4 variants). |
| `choice.html` | Radio group, single checkbox, single radio (5 variants). |
| `display-row.html` | Read-only label/value rows (4 variants). |
| `file.html` | Labeled file input — plain, with side button, or dropzone (3 variants). |
| `table.html` | Header row, body row, empty row, or full table shell (4 variants). |
| `inline-group.html` | Label + control + side widget (image, captcha) (3 variants). |
| `label-icon.html` | Sub-include: one strip-friendly label icon. |
| `option.html` | Sub-include: one `<option>` row. |
| `choice-option.html` | Sub-include: one radio/checkbox `<label>` row. |

## Engine constraints (read first)

The include engine in `vite.config.js` (`transformDataInclude`) has narrow semantics. Every primitive in this folder is shaped around them.

1. **Only empty `<div data-include>` is supported.** The directive must be `<div data-include="path" data-key="value"></div>` with no children. You cannot pass HTML as a slot.
2. **`{{key}}` placeholders** are replaced by the matching `data-key` attribute (camelCased from hyphens: `data-icon-class` → `{{iconClass}}`).
3. **Variant selection** uses `<!-- option N -->` markers. Pass `data-variant="3"` to pick variant 3. Default is `1`. If the variant is missing, the engine falls back to `1`.
4. **Line-strip rule.** After substitution, the engine strips any whole line matching the `<tag …>{{x}}</tag>` shape (the body is exactly an unresolved placeholder). This is the only way optional slots disappear.
5. **Attribute placeholders are NOT stripped.** An empty `src="{{icon}}"` becomes `src=""` and triggers a broken asset request. To make an optional `src` / `href` disappear, the primitive must put it on its own line with a placeholder body (see indirection pattern below).
6. **No loops, no conditionals.** Variadic content uses one of two patterns: an inlined arity variant (e.g. 3 options) or a "shell" variant where the caller nests per-row sub-includes.
7. **Recursion depth is 10.** Sub-includes inside primitives are processed in a second pass.

### Indirection pattern for optional `src` / `href`

Place the attribute placeholder on a strip-friendly line — the body uses the same placeholder so the entire line vanishes when the value is empty:

```html
<!-- icon slot: line strips when data-icon is empty -->
<span class="iuh-form-label__icon {{iconClass}}" style="background-image:url({{icon}})">{{icon}}</span>
```

When the caller omits `data-icon`, the body `{{icon}}` triggers the strip regex and the whole line disappears — no broken `background-image`, no empty span. When the caller provides `data-icon="/path.svg"`, the body becomes `/path.svg` (hidden visually by `font-size: 0; color: transparent` on `.iuh-form-label__icon`) and the CSS background renders the icon.

### Variadic pattern (any number of options)

Two approaches:

- **Inlined arity variants.** For up to 5 select options or 3 radio options use the default field/choice variants. Unused slots strip automatically because each option line matches the strip regex.
- **Shell + per-row sub-includes.** Compose the wrapper manually with `iuh-form-*` classes and nest `option.html` / `choice-option.html` directives as siblings. The engine processes them in the recursion pass.

```html
<select id="major" name="major" class="iuh-form-control iuh-form-select">
  <option value="">-- Chọn ngành --</option>
  <div data-include="@shared/components/form/option.html" data-value="cntt" data-text="Công nghệ thông tin"></div>
  <div data-include="@shared/components/form/option.html" data-value="ais" data-text="Hệ thống thông tin"></div>
  <div data-include="@shared/components/form/option.html" data-value="dsa" data-text="Khoa học dữ liệu"></div>
</select>
```

Note: the `<div data-include="option.html">` directive is replaced inline. Browsers tolerate it inside `<select>` for the brief moment before Vite rewrites it; the rendered output is valid `<option>` rows.

## Class namespaces

All shared form classes live under `iuh-form-*`:

- `iuh-form` — top-level `<form>` spacing.
- `iuh-form-grid` — two-column responsive grid for adjacent fields.
- `iuh-form-field` — wrapper around one label+control unit.
- `iuh-form-label`, `iuh-form-label__icon`, `iuh-form-required` — label parts.
- `iuh-form-control`, `iuh-form-control--lg`, `iuh-form-control--fixed` — input/select/textarea shell.
- `iuh-form-select`, `iuh-form-option`, `iuh-form-optgroup`, `iuh-form-datalist`, `iuh-form-textarea` — type-specific overrides.
- `iuh-form-helper`, `iuh-form-error` — sub-text below the control.
- `iuh-form-fieldset`, `iuh-form-legend`, `iuh-form-choice-grid`, `iuh-form-choice`, `iuh-form-choice__control` — radio/checkbox groups. Default layout is `flex flex-wrap` (chips sized to their content) so short labels do not stretch awkwardly at wide viewports.
- `iuh-form-choice-grid--stacked|--two|--four` — switch the grid to an explicit column layout (full-width stack, 2 columns, or 4 columns) when fixed alignment is required.
- `iuh-form-output`, `iuh-form-meter`, `iuh-form-progress` — output controls.
- `iuh-form-actions`, `iuh-form-note` — submit row and form-level notes.
- `iuh-form-display`, `iuh-form-display-row`, `iuh-form-display-row--full`, `iuh-form-display-label`, `iuh-form-display-value`, `iuh-form-display-value--emphasis|--success|--danger` — read-only display rows.
- `iuh-form-file`, `iuh-form-file-input`, `iuh-form-file-trigger`, `iuh-form-file-status`, `iuh-form-file--dropzone` — file upload widget.
- `iuh-form-table-wrap`, `iuh-form-table`, `iuh-form-table-head-row`, `iuh-form-table-head-cell`, `iuh-form-table-body-row`, `iuh-form-table-cell`, `iuh-form-table-cell--strong|--center`, `iuh-form-table-empty` — data tables.
- `iuh-form-inline`, `iuh-form-inline__body`, `iuh-form-inline__body--widget-leading`, `iuh-form-inline__widget` — inline-group layout.
- `iuh-form-captcha`, `iuh-form-captcha__noise`, `iuh-form-captcha__code`, `iuh-form-captcha__line` (`--a` / `--b`) — captcha widget.

Pass extra native attributes through `data-attrs` **unquoted** to avoid the engine's quote-aware regex:

```html
data-attrs="required autocomplete=name minlength=2"
```

## Usage snippets

### Field — input (variant 1, default)

```html
<div data-include="@shared/components/form/field.html"
  data-id="fullName"
  data-name="full_name"
  data-type="text"
  data-label="Họ và tên"
  data-required-text="*"
  data-icon="/assets/svgs/icon-user.svg"
  data-placeholder="Nguyễn Văn A"
  data-attrs="required autocomplete=name"
  data-helper-id="fullName-helper"
  data-helper-text="Như trên CCCD.">
</div>
```

Omit any of `data-icon`, `data-required-text`, `data-helper-text`, `data-helper-id`, `data-error-text`, `data-error-id` and the slot emits zero DOM.

### Field — textarea (variant 2)

```html
<div data-include="@shared/components/form/field.html"
  data-variant="2"
  data-id="message"
  data-name="message"
  data-rows="4"
  data-label="Nội dung"
  data-placeholder="Nội dung tin nhắn..."
  data-attrs="required maxlength=500">
</div>
```

### Field — select with placeholder + up to 5 inlined options (variant 3)

```html
<div data-include="@shared/components/form/field.html"
  data-variant="3"
  data-id="faculty"
  data-name="faculty"
  data-label="Khoa"
  data-required-text="*"
  data-placeholder-value=""
  data-placeholder-text="-- Chọn khoa --"
  data-option1-value="khsk" data-option1-text="Khoa học Sức khỏe"
  data-option2-value="qktx" data-option2-text="Quản lý ký túc xá"
  data-option3-value="cntt" data-option3-text="Công nghệ thông tin"
  data-option4-value="cokhi" data-option4-text="Cơ khí"
  data-option5-value="dien" data-option5-text="Điện">
</div>
```

Unused option slots (`data-option4`, `data-option5`, …) strip automatically.

### Field — select shell for >5 options (variant 4)

```html
<div data-include="@shared/components/form/field.html"
  data-variant="4"
  data-id="major"
  data-name="major"
  data-label="Ngành học">
</div>
```

For more than 5 options or for `<optgroup>` support, build the `<select>` shell directly and nest option sub-includes:

```html
<div class="iuh-form-field">
  <label for="major" class="iuh-form-label"><span>Ngành học</span></label>
  <select id="major" name="major" class="iuh-form-control iuh-form-select">
    <option value="">-- Chọn ngành --</option>
    <div data-include="@shared/components/form/option.html" data-value="cntt" data-text="Công nghệ thông tin"></div>
    <div data-include="@shared/components/form/option.html" data-value="ais" data-text="Hệ thống thông tin"></div>
    <div data-include="@shared/components/form/option.html" data-value="dsa" data-text="Khoa học dữ liệu"></div>
  </select>
</div>
```

### Choice — 3 radio options (variant 1, default)

```html
<div data-include="@shared/components/form/choice.html"
  data-legend="Mức độ ưu tiên"
  data-name="priority"
  data-option1-value="normal" data-option1-text="Thông thường" data-option1-attrs="checked"
  data-option2-value="soon" data-option2-text="Cần phản hồi sớm"
  data-option3-value="urgent" data-option3-text="Khẩn cấp">
</div>
```

### Choice — single checkbox (variant 2)

```html
<div data-include="@shared/components/form/choice.html"
  data-variant="2"
  data-name="agree"
  data-value="1"
  data-text="Tôi đồng ý với các điều khoản"
  data-attrs="required">
</div>
```

### Choice — 2 radio options (variant 3)

```html
<div data-include="@shared/components/form/choice.html"
  data-variant="3"
  data-legend="Hình thức học"
  data-name="study_mode"
  data-option1-value="fulltime" data-option1-text="Chính quy" data-option1-attrs="checked"
  data-option2-value="parttime" data-option2-text="Vừa làm vừa học">
</div>
```

### Choice — radio/checkbox shell for >3 options (variant 4 + per-row sub-includes)

```html
<fieldset class="iuh-form-fieldset">
  <legend class="iuh-form-legend">Sở thích</legend>
  <div class="iuh-form-choice-grid iuh-form-choice-grid--two">
    <div data-include="@shared/components/form/choice-option.html" data-type="checkbox" data-name="interests" data-value="sport" data-text="Thể thao"></div>
    <div data-include="@shared/components/form/choice-option.html" data-type="checkbox" data-name="interests" data-value="music" data-text="Âm nhạc"></div>
    <div data-include="@shared/components/form/choice-option.html" data-type="checkbox" data-name="interests" data-value="travel" data-text="Du lịch"></div>
  </div>
</fieldset>
```

### Display row

```html
<div class="iuh-form-display">
  <div data-include="@shared/components/form/display-row.html"
    data-label="Họ tên"
    data-value="Nguyễn Văn A">
  </div>
  <div data-include="@shared/components/form/display-row.html"
    data-variant="3"
    data-label="Trạng thái"
    data-value="Đã đăng ký">
  </div>
</div>
```

### File — plain (variant 1)

```html
<div data-include="@shared/components/form/file.html"
  data-id="resume"
  data-name="resume"
  data-label="Hồ sơ"
  data-accept=".pdf,.doc,.docx"
  data-attrs="required"
  data-helper-text="PDF, DOC tối đa 5MB">
</div>
```

### File — dropzone (variant 3)

```html
<div data-include="@shared/components/form/file.html"
  data-variant="3"
  data-id="images"
  data-name="images"
  data-label="Hình ảnh"
  data-accept="image/*"
  data-attrs="multiple"
  data-dropzone-icon="/assets/svgs/icon-image.svg"
  data-dropzone-primary-text="Kéo & thả ảnh vào đây"
  data-dropzone-secondary-text="Hoặc bấm để chọn — tối đa 10 ảnh">
</div>
```

### Table — full shell with empty state (variant 4)

```html
<div data-include="@shared/components/form/table.html"
  data-variant="4"
  data-col1="MSSV"
  data-col2="Họ tên"
  data-col3="Phòng"
  data-col4="Hạn"
  data-colspan="4"
  data-empty-text="Chưa có dữ liệu đăng ký.">
</div>
```

### Inline group — captcha (variant 3)

```html
<div data-include="@shared/components/form/inline-group.html"
  data-variant="3"
  data-id="captcha-code"
  data-name="captcha_code"
  data-type="text"
  data-icon="/assets/svgs/icon-check-circle.svg"
  data-label="Mã xác nhận"
  data-placeholder="Nhập mã xác nhận"
  data-attrs="required"
  data-captcha-code="d6a39"
  data-captcha-aria="Mã xác nhận d6a39">
</div>
```

### Submit row

```html
<div class="iuh-form-actions">
  <div data-include="@shared/components/button/button.html"
    data-variant="7"
    data-type="submit"
    data-text="Gửi"
    data-icon="/assets/svgs/icon-send.svg">
  </div>
  <p class="iuh-form-note">Chúng tôi sẽ phản hồi trong 24 giờ.</p>
</div>
```

Use `@shared/components/button/button.html` for every form action — do not hand-roll `<button>` markup.
