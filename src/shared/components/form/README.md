# Shared Form Primitives

Use these primitives to keep form UI consistent across faculties.

- `form.scss` defines the canonical classes for `form`, `label`, `input`, `textarea`, `select`, `option`, `optgroup`, `datalist`, `fieldset`, `legend`, `radio`, `checkbox`, `output`, `meter`, `progress`, helper/error text, action rows, and form buttons.
- `field.html` provides include variants for common input, textarea, and select fields.
- `choice.html` provides radio group and checkbox primitives.
- Use `@shared/components/button/button.html` for form actions so buttons stay centralized in the existing shared button component.

Pass extra native attributes through `data-attrs` without quotes, for example `data-attrs="required autocomplete=name minlength=2"`.
