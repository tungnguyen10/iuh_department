# Dormitory mock data

| File | Purpose |
|---|---|
| `news.json` | News listing used by the public news pages. |
| `activities.json` | Activities listing used by the public activities pages. |
| `search-data.json` | Static index for the global search modal. |
| `lookup-mock.json` | Fixture for the post-login lookup page (`pages/tra-cuu.html`). |

## `lookup-mock.json`

Drives the post-login lookup surface. Shape:

```jsonc
{
  "student": {
    "fullName": "NGUYỄN VĂN A",       // display name shown in "Sinh viên"
    "studentId": "20012345",          // MSSV
    "faculty": "Khoa ...",            // Khoa
    "className": "DHKTPM16A",         // Lớp
    "gender": "Nam",                  // Giới tính
    "enrollmentYear": "2020",         // Năm nhập học
    "status": "Đang học"              // Tình trạng
  },
  "registration": {
    "state": "no_round",              // Default state for the page
    "states": {                       // Copy used per state by the registration row
      "no_round":     { "message": "Chưa có đợt ĐK phù hợp!" },
      "can_register": { "ctaText": "Đăng ký nội trú", "ctaHref": "#" },
      "pending":      { "message": "Đang chờ duyệt hồ sơ" },
      "approved":     { "message": "Đã duyệt hồ sơ",
                        "downloadHref": "#",
                        "uploadHref": "#payment-proof",
                        "cancelHref": "#",
                        "receiptHref": "#",
                        "uploadHelper": "..." },
      "active":       { "message": "Đang ở KTX" }
    }
  },
  "stayHistory": {
    "variant": "empty",               // "empty" | "populated"
    "rows": [                         // Used when variant === "populated"
      { "term": "HK1 2024-2025", "status": "Đã kết thúc" }
    ]
  }
}
```

The include engine cannot read JSON at build time. Values from this fixture are
inlined into `pages/tra-cuu.html` via `data-*` attributes on the component
includes; this file documents the canonical shape so a future backend can swap
the fixture for a real fetch without restructuring the page.
