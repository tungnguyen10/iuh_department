# Tong quan source IUH Department

Ngay cap nhat: 2026-06-16

Tai lieu nay mo ta source hien tai cua website `lab-iuh` sau khi chuyen sang kien truc `Shared Platform + Faculty Modules`.

## 1. Tom tat nhanh

Website hien tai la site tinh cho Khoa Khoa hoc Suc khoe IUH, xay bang Vite, Vanilla JavaScript, TailwindCSS, SCSS va Swiper. Source khong dung framework SPA. Moi page HTML cua faculty duoc viet trong `src/faculties/<faculty>/pages`; Vite boc layout, inject component HTML, bundle CSS/JS, va copy data/assets cua selected faculty ra `dist_iuh`.

Stack hien tai:

| Hang muc | Dang dung |
| --- | --- |
| Build tool | Vite 7 |
| Package manager | Yarn 4 / Corepack, Yarn PnP |
| UI | HTML tinh, TailwindCSS, SCSS |
| JS | Vanilla ES modules |
| Carousel | Swiper 11 |
| Output | `dist_iuh/`, cau hinh boi `VITE_OUT_DIR` |
| Faculty mac dinh | `health-science` |

## 2. Source tree

```text
src/
|-- config/
|   `-- env.js
|-- faculties/
|   `-- health-science/
|       |-- assets/
|       |   |-- documents/
|       |   |-- images/
|       |   `-- svgs/
|       |-- components/
|       |   |-- home/
|       |   |-- careers/
|       |   |-- industry-partnerships/
|       |   |-- leadership/
|       |   `-- major/
|       |-- data/
|       |-- faculty.config.js
|       `-- pages/
|-- shared/
|   |-- assets/
|   |   |-- fonts/
|   |   |-- images/
|   |   `-- svgs/
|   |-- components/
|   |-- js/
|   |-- layouts/
|   `-- styles/
`-- main.js
```

Legacy roots khong con la source canonical:

```text
src/pages
src/components
src/assets
src/layouts
src/styles
src/js
public
```

## 3. Ownership rules

| Source | So huu |
| --- | --- |
| `src/shared/components` | Component dung chung giua cac faculty: header, footer, loading, search, tabs, button, common, sidebar, news, partners, stats |
| `src/shared/js` | Runtime/helper dung chung: loading, svg-loader, utils, widgets, i18n, module manager |
| `src/shared/layouts` | Layout HTML dung chung |
| `src/shared/styles` | Tailwind entry, global SCSS, font declarations |
| `src/shared/assets` | Fonts, IUH logos, system icons, favicons, social/language images, default images |
| `src/faculties/<faculty>/pages` | Page HTML cua faculty |
| `src/faculties/<faculty>/components` | Module/feature rieng cua faculty |
| `src/faculties/<faculty>/data` | JSON runtime cua faculty, output thanh `/data` |
| `src/faculties/<faculty>/assets` | Anh, SVG, documents cua faculty, output thanh `/assets/...` |

Quy tac phan loai: neu component/asset chua co nhu cau tai su dung giua nhieu faculty, giu no trong faculty module. Chi dua vao `src/shared` khi co reuse ro rang hoac no la platform UI/system asset.

## 4. Pages

Khoa Health Science hien co 13 page:

| Page | Muc dich |
| --- | --- |
| `index.html` | Trang chu: carousel, intro, nganh dao tao, tuyen sinh, stats, tin tuc, co so vat chat, nghien cuu, hop tac, doi tac |
| `about.html` | Gioi thieu khoa |
| `majors.html` | Danh sach nganh va quiz chon nganh |
| `major-detail.html` | Chi tiet nganh |
| `news.html` | Tin tuc, su kien |
| `news-detail.html` | Chi tiet bai viet |
| `leadership.html` | Co cau to chuc va nhan su |
| `leadership-detail.html` | Chi tiet nhan su |
| `partners.html` | Doi tac |
| `students.html` | Thong tin sinh vien |
| `contact.html` | Lien he |
| `document-detail.html` | Xem/tai PDF |
| `form.html` | Demo form controls/style |

Moi page dung metadata `LAYOUT`:

```html
<!-- LAYOUT: title="Trang moi" -->
<!-- LAYOUT: description="Mo ta trang moi" -->
<!-- LAYOUT: keywords="iuh, khoa hoc suc khoe" -->
<!-- LAYOUT: url="https://iuh.edu.vn/trang-moi" -->
<!-- LAYOUT: ogImage="/assets/images/default.jpg" -->
```

## 5. Component system

HTML components duoc inject luc build qua `data-include`.

```html
<div data-include="@shared/components/common/section-title.html" data-title="Tin tuc"></div>
<div data-include="@faculty/components/home/intro/index.html"></div>
```

Include aliases:

| Alias | Muc dich |
| --- | --- |
| `@shared/components/...` | Shared component HTML |
| `@faculty/components/...` | Component HTML cua selected faculty |

Khong dung `@components`; alias nay da duoc go bo.

Component ownership hien tai:

| Nhom | Canonical source |
| --- | --- |
| Header/footer/loading/search/modal/tabs/buttons/common/sidebar/news/partners/stats | `src/shared/components` |
| Home carousel/intro/admission/infrastructure/research/industry-careers | `src/faculties/health-science/components/home` |
| Major, major quiz | `src/faculties/health-science/components/major` |
| Leadership | `src/faculties/health-science/components/leadership` |
| Careers/business connection | `src/faculties/health-science/components/careers` |
| Industry partnerships | `src/faculties/health-science/components/industry-partnerships` |

## 6. Runtime interactivity

`src/main.js` giu shared/global runtime:

```text
DOMContentLoaded
  -> loadingManager.init()
  -> initComponentsOnDemand()
       -> faculty runtime modules from @faculty/faculty.config.js
       -> shared runtime modules from src/main.js
  -> inlineSVGs()
  -> initSearchModal()
  -> initFadeInOnScroll()
  -> dispatch "components-loaded"
  -> hide loading
```

Faculty-specific runtime declarations nam trong:

```text
src/faculties/health-science/faculty.config.js
```

Vi du:

```javascript
{
  selector: ".hero-swiper",
  load: () => import("./components/home/carousel/carousel.js"),
  init: "initHeroCarousel",
  name: "Hero Carousel",
}
```

Runtime features:

| Chuc nang | File chinh |
| --- | --- |
| Loading global | `src/shared/js/loading.js` |
| Search modal | `src/shared/components/search/search-modal.js` |
| Modal base | `src/shared/components/modal/modal.js` |
| Header/mobile menu | `src/shared/components/header/header.js` |
| Footer accordion | `src/shared/components/footer/footer.js` |
| Scroll/social widgets | `src/shared/js/global-widgets.js` |
| SVG inline | `src/shared/js/svg-loader.js` |
| Article share / PDF fallback / dataUrl | `src/shared/js/utils.js` |
| Major quiz | `src/faculties/health-science/components/major/major-quiz.js` |
| Tabs | `src/shared/components/tabs/tabs.js` |
| Dev homepage module manager | `src/shared/js/module-manager.js` |

## 7. Build tooling

Build flow:

```text
src/faculties/<faculty>/pages/*.html
  -> layoutPlugin
     -> read LAYOUT metadata
     -> wrap with src/shared/layouts/default.html
     -> inject loading/header/footer/search/global widgets
  -> transformDataInclude
     -> resolve @shared/components and @faculty/components
     -> inject component HTML
     -> replace {{placeholder}} from data-* attrs
     -> process nested includes
  -> Vite build
     -> bundle shared runtime and faculty runtime chunks
     -> copy selected faculty data/documents
     -> copy shared + faculty images/SVGs
  -> dist_iuh/
```

Build commands:

```bash
FACULTY=health-science corepack yarn dev
FACULTY=health-science corepack yarn build
FACULTY=health-science corepack yarn preview
```

`FACULTY` defaults to `health-science`, but explicit commands are preferred in docs and CI.

## 8. Aliases

| Alias | Target |
| --- | --- |
| `@` | `src` |
| `@shared` | `src/shared` |
| `@faculty` | selected faculty root |
| `@js` | `src/shared/js` |
| `@styles` | `src/shared/styles` |
| `@assets` | `src/shared/assets` |

`@shared` and `@faculty` are the primary architecture aliases. `@js`, `@styles`, and `@assets` are kept as long-term convenience aliases for shared platform code/assets.

## 9. Data, documents, and assets

Health Science data:

| Source | Output |
| --- | --- |
| `src/faculties/health-science/data/search-data.json` | `/data/search-data.json` |
| `src/faculties/health-science/data/quiz-data.json` | `/data/quiz-data.json` |
| `src/faculties/health-science/data/messages-vi.json` | `/data/messages-vi.json` |
| `src/faculties/health-science/data/messages-en.json` | `/data/messages-en.json` |

Assets:

| Source | Output |
| --- | --- |
| `src/shared/assets/images` | `/assets/images` |
| `src/faculties/health-science/assets/images` | `/assets/images` |
| `src/shared/assets/svgs` | `/assets/svgs` |
| `src/faculties/health-science/assets/svgs` | `/assets/svgs` |
| `src/shared/assets/fonts` | `/assets/fonts` |
| `src/faculties/health-science/assets/documents` | `/assets/documents` |

Data fetch trong JS nen dung:

```javascript
import { dataUrl } from "@js/utils.js";

fetch(dataUrl("data/search-data.json"));
```

## 10. Them page/component/faculty

Them page:

1. Tao file trong `src/faculties/health-science/pages`.
2. Them `LAYOUT` metadata.
3. Dung `@shared/components/...` hoac `@faculty/components/...` cho `data-include`.

Them shared component:

```text
src/shared/components/<name>/
```

Them Health Science component:

```text
src/faculties/health-science/components/<name>/
```

Neu component co JS, export ham `init*` va dang ky:

- shared module: `src/main.js`
- faculty module: `src/faculties/health-science/faculty.config.js`

Them faculty moi:

```text
src/faculties/<faculty-id>/
|-- assets/
|   |-- documents/
|   |-- images/
|   `-- svgs/
|-- components/
|-- data/
|-- faculty.config.js
`-- pages/
```

Build:

```bash
FACULTY=<faculty-id> corepack yarn build
```

## 11. OpenSpec / agent workflow

Agent instructions:

```text
.agents/
  prompts/
  skills/
.codex/skills/      -> symlink view
.github/skills/     -> symlink view
.github/prompts/    -> symlink view
```

Sync:

```bash
corepack yarn agents:sync
```

OpenSpec commands:

```bash
openspec list --json
openspec status --change <change-id>
openspec validate <change-id> --strict
```

## 12. Diem can luu y

| Diem | Ghi chu |
| --- | --- |
| Root deployment | Firebase Hosting domain root (`/`) la cau hinh supported |
| `VITE_BASE_PATH` | Co rewrite HTML/data URLs, nhung subpath navigation chua duoc test day du |
| `publicDir` | Da tat; data/documents/assets phai di qua selected faculty/shared copy plugins |
| i18n | `src/shared/js/i18n.js` ton tai, nhung `initI18n()` chua duoc bat trong `src/main.js` |
| Content | Nhieu noi dung con static trong HTML/component, chua co CMS/API |
| Form page | `form.html` la demo style/form controls, khong co backend submit |
| Module manager | Dev/demo homepage module manager dang duoc import trong runtime |
