# Organization Administration Activity Gallery Images

## Goal

Replace the five placeholder images in the `organization-administration` home-page activity gallery with the five newest activity images published on the Phòng Tổ chức – Hành chính website. Each card must use the source article's title and link.

## Source

Use the five newest entries, in their existing newest-first order, from:

`https://ptchc.iuh.edu.vn/category/hinh-anh-hoat-dong/`

The selected entries and their local destinations are:

| Order | Source article | Local image |
| --- | --- | --- |
| 1 | [IUH long trọng tổ chức Lễ Khai giảng năm học 2020-2021](https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/iuh-long-trong-to-chuc-le-khai-giang-nam-hoc-2020-2021/) | `activity-khai-giang-2020-2021.jpg` |
| 2 | [Đại hội Đại biểu Đảng bộ Trường Đại học Công nghiệp Thành phố Hồ Chí Minh lần thứ XIII, nhiệm kỳ 2020–2025: Dân chủ – Sáng tạo – Đoàn kết – Hội nhập](https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/dai-hoi-dai-bieu-dang-bo-truong-dai-hoc-cong-nghiep-thanh-pho-ho-chi-minh-lan-thu-xiii-nhiem-ky-2020-2025-dan-chu-sang-tao-doan-ket-hoi-nhap-2/) | `activity-dai-hoi-dang-bo-2020-2025.jpg` |
| 3 | [Lễ công bố quyết định bổ nhiệm và bàn giao chức vụ Hiệu trưởng IUH](https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/le-cong-bo-quyet-dinh-bo-nhiem-va-ban-giao-chuc-vu-hieu-truong-iuh-2/) | `activity-bo-nhiem-hieu-truong.jpg` |
| 4 | [Hội nghị cán bộ – viên chức IUH năm 2020](https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/hoi-nghi-can-bo-vien-chuc-iuh-nam-2020-2/) | `activity-hoi-nghi-can-bo-vien-chuc-2020.jpg` |
| 5 | [Lễ công bố quyết định bổ nhiệm chức danh giáo sư, phó giáo sư và trao Huân chương Lao động, Bằng khen của Thủ tướng Chính phủ năm 2019](https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/le-cong-bo-quyet-dinh-bo-nhiem-chuc-danh-giao-su-pho-giao-su-va-trao-huan-chuong-lao-dong-bang-khen-cua-thu-tuong-chinh-phu-nam-2019-2/) | `activity-bo-nhiem-giao-su-khen-thuong-2019.jpg` |

## Asset Strategy

Download the original-resolution image for each selected entry and store it under `src/faculties/organization-administration/assets/images/` using the names listed above.

The site must serve these local copies through `/assets/images/...`; it must not hotlink the WordPress upload URLs. No image compression or resizing is included in this change because the user explicitly chose the original images for maximum quality.

## Gallery Changes

Keep the existing gallery component, five-card layout, styling, animation, and responsive behavior unchanged. For each card in `components/home/activity-gallery/index.html`:

- replace `/assets/images/default.jpg` with the corresponding local image;
- set `data-alt` and `data-title` to the source article title;
- set `data-link` to the canonical source article URL.

Links to the external PTCHC articles continue to use the gallery card's current anchor behavior. This change does not add a new tab or alter the shared card template.

## Error Handling

The images are committed local assets, so the gallery does not depend on the source website at runtime. Existing gallery image-error handling remains unchanged. A failed or incomplete download must be detected before the component is updated.

## Verification

Add a focused contract test that checks:

- the gallery contains exactly five cards;
- no gallery card uses `default.jpg`;
- all five expected local image paths, titles, and source article URLs are present;
- all referenced image files exist and are non-empty.

Run the focused organization-administration tests, the full test suite, and a production build for `FACULTY=organization-administration`.

## Out of Scope

- Redesigning the gallery layout or hover treatment
- Editing the source images
- Importing more than the five newest entries
- Replacing images elsewhere in the site
- Mirroring the source articles as local news pages
