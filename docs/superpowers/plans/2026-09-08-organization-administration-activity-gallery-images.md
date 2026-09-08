# Organization Administration Activity Gallery Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the five organization-administration activity-gallery placeholders with locally stored original-resolution images and exact metadata from the five newest PTCHC activity posts.

**Architecture:** Keep the current HTML include and gallery-card renderer unchanged. Store the five downloaded JPEGs in the faculty-specific image directory, reference them through the existing `/assets/images/...` resolver, and protect the mapping with a source-level contract test.

**Tech Stack:** Static HTML includes, Node.js built-in test runner, Vite 7, local JPEG assets

## Global Constraints

- Use the five newest entries in their existing newest-first order from `https://ptchc.iuh.edu.vn/category/hinh-anh-hoat-dong/`.
- Download original-resolution images without compression or resizing.
- Store local copies under `src/faculties/organization-administration/assets/images/`; do not hotlink WordPress image URLs.
- Keep the five-card layout, styling, animation, responsive behavior, and shared card template unchanged.
- Use each source article's exact title and canonical URL.

---

### Task 1: Pin the activity gallery content contract

**Files:**
- Modify: `tests/organization-administration-faculty.test.js`

**Interfaces:**
- Consumes: `readFacultyFile(path)` and `facultyRoot` from the existing test module.
- Produces: A contract covering five ordered gallery cards and five non-empty local image files.

- [ ] **Step 1: Write the failing test**

Add this test to `tests/organization-administration-faculty.test.js`:

```js
test('organization administration activity gallery uses the five newest PTCHC posts', async () => {
  const gallery = await readFacultyFile('components/home/activity-gallery/index.html')
  const expectedCards = [
    {
      image: '/assets/images/activity-khai-giang-2020-2021.jpg',
      title: 'IUH long trọng tổ chức Lễ Khai giảng năm học 2020-2021',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/iuh-long-trong-to-chuc-le-khai-giang-nam-hoc-2020-2021/',
    },
    {
      image: '/assets/images/activity-dai-hoi-dang-bo-2020-2025.jpg',
      title: 'Đại hội Đại biểu Đảng bộ Trường Đại học Công nghiệp Thành phố Hồ Chí Minh lần thứ XIII, nhiệm kỳ 2020 – 2025: Dân chủ – Sáng tạo – Đoàn kết – Hội nhập',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/dai-hoi-dai-bieu-dang-bo-truong-dai-hoc-cong-nghiep-thanh-pho-ho-chi-minh-lan-thu-xiii-nhiem-ky-2020-2025-dan-chu-sang-tao-doan-ket-hoi-nhap-2/',
    },
    {
      image: '/assets/images/activity-bo-nhiem-hieu-truong.jpg',
      title: 'Lễ công bố quyết định bổ nhiệm và bàn giao chức vụ Hiệu trưởng IUH',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/le-cong-bo-quyet-dinh-bo-nhiem-va-ban-giao-chuc-vu-hieu-truong-iuh-2/',
    },
    {
      image: '/assets/images/activity-hoi-nghi-can-bo-vien-chuc-2020.jpg',
      title: 'Hội nghị cán bộ – viên chức IUH năm 2020',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/hoi-nghi-can-bo-vien-chuc-iuh-nam-2020-2/',
    },
    {
      image: '/assets/images/activity-bo-nhiem-giao-su-khen-thuong-2019.jpg',
      title: 'Lễ công bố quyết định bổ nhiệm chức danh giáo sư, phó giáo sư và trao Huân chương Lao động, Bằng khen của Thủ tướng Chính phủ năm 2019',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/le-cong-bo-quyet-dinh-bo-nhiem-chuc-danh-giao-su-pho-giao-su-va-trao-huan-chuong-lao-dong-bang-khen-cua-thu-tuong-chinh-phu-nam-2019-2/',
    },
  ]
  const cards = [...gallery.matchAll(/data-image="([^"]+)"\s+data-alt="([^"]+)"\s+data-title="([^"]+)"\s+data-link="([^"]+)"/g)]

  assert.equal(cards.length, 5)
  assert.deepEqual(
    cards.map(([, image, alt, title, link]) => ({ image, alt, title, link })),
    expectedCards.map(({ image, title, link }) => ({ image, alt: title, title, link })),
  )
  assert.doesNotMatch(gallery, /default\.jpg/)

  for (const { image } of expectedCards) {
    const asset = await readFile(new URL(`assets/images/${image.split('/').at(-1)}`, facultyRoot))
    assert.ok(asset.length > 0, `${image} must be a non-empty local image`)
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test --test-name-pattern="activity gallery uses" tests/organization-administration-faculty.test.js
```

Expected: FAIL because the component still references `/assets/images/default.jpg` and the local files do not exist.

### Task 2: Download originals and update the five cards

**Files:**
- Create: `src/faculties/organization-administration/assets/images/activity-khai-giang-2020-2021.jpg`
- Create: `src/faculties/organization-administration/assets/images/activity-dai-hoi-dang-bo-2020-2025.jpg`
- Create: `src/faculties/organization-administration/assets/images/activity-bo-nhiem-hieu-truong.jpg`
- Create: `src/faculties/organization-administration/assets/images/activity-hoi-nghi-can-bo-vien-chuc-2020.jpg`
- Create: `src/faculties/organization-administration/assets/images/activity-bo-nhiem-giao-su-khen-thuong-2019.jpg`
- Modify: `src/faculties/organization-administration/components/home/activity-gallery/index.html`
- Test: `tests/organization-administration-faculty.test.js`

**Interfaces:**
- Consumes: The exact image paths, titles, URLs, and order asserted by Task 1.
- Produces: Five local image assets served through `/assets/images/...` and five gallery-card include records.

- [ ] **Step 1: Download each original image to its exact local path**

Use `curl -L --fail --show-error` with these source-to-destination mappings:

```text
https://ptchc.iuh.edu.vn/wp-content/uploads/2020/10/122153978_1060158917749019_7992197650384893283_o.jpg
  -> src/faculties/organization-administration/assets/images/activity-khai-giang-2020-2021.jpg
https://ptchc.iuh.edu.vn/wp-content/uploads/2020/06/dh-dang-hinh-6.jpg
  -> src/faculties/organization-administration/assets/images/activity-dai-hoi-dang-bo-2020-2025.jpg
https://ptchc.iuh.edu.vn/wp-content/uploads/2020/04/IMG_0850-1.jpg
  -> src/faculties/organization-administration/assets/images/activity-bo-nhiem-hieu-truong.jpg
https://ptchc.iuh.edu.vn/wp-content/uploads/2020/04/IMG_0065.jpg
  -> src/faculties/organization-administration/assets/images/activity-hoi-nghi-can-bo-vien-chuc-2020.jpg
https://ptchc.iuh.edu.vn/wp-content/uploads/2020/04/IMG_0013-1.jpg
  -> src/faculties/organization-administration/assets/images/activity-bo-nhiem-giao-su-khen-thuong-2019.jpg
```

- [ ] **Step 2: Verify the downloads are JPEG images with the source dimensions**

Run:

```bash
file src/faculties/organization-administration/assets/images/activity-*.jpg
sips -g pixelWidth -g pixelHeight src/faculties/organization-administration/assets/images/activity-*.jpg
```

Expected: all five files report JPEG data; dimensions are respectively `1000x667`, `1024x683`, `1263x842`, `1372x915`, and `1372x915`.

- [ ] **Step 3: Replace all five gallery include attributes**

Update `src/faculties/organization-administration/components/home/activity-gallery/index.html` so its five cards match the `expectedCards` array from Task 1. Set `data-alt` equal to `data-title` for every card. Do not change `data-class`, card order, surrounding copy, or layout markup.

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
node --test --test-name-pattern="activity gallery uses" tests/organization-administration-faculty.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit the gallery change**

```bash
git add tests/organization-administration-faculty.test.js src/faculties/organization-administration/components/home/activity-gallery/index.html src/faculties/organization-administration/assets/images/activity-*.jpg
git commit -m "feat: add organization activity gallery images"
```

### Task 3: Verify the faculty build and regression suite

**Files:**
- Verify: `tests/organization-administration-faculty.test.js`
- Verify: `src/faculties/organization-administration/components/home/activity-gallery/index.html`
- Verify: `src/faculties/organization-administration/assets/images/activity-*.jpg`

**Interfaces:**
- Consumes: The completed local image and gallery mapping from Task 2.
- Produces: Test and build evidence that the change is ready.

- [ ] **Step 1: Run the complete organization-administration test file**

```bash
node --test tests/organization-administration-faculty.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Run the full repository test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Run the faculty production build**

```bash
FACULTY=organization-administration VITE_OUT_DIR=/tmp/iuh-organization-administration-build npm run build
```

Expected: Vite exits with code 0 and emits the organization-administration pages and image assets.

- [ ] **Step 4: Check the final diff**

```bash
git diff --check HEAD~1..HEAD
git status --short
```

Expected: no whitespace errors and no uncommitted implementation changes.

## Execution Results

- Focused gallery contract: passed (1/1).
- Five downloads: verified as non-empty JPEG originals at `1000x667`, `1024x683`, `1263x842`, `1372x915`, and `1372x915`.
- Organization-administration test file: gallery test passed; 2 unrelated baseline assertions remained failing (`about.html` direct link vocabulary and `contact.html` address formatting).
- Full suite: 59 passed, the same 2 baseline assertions failed.
- Organization-administration production build: passed.
