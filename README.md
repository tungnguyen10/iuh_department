# Lab IUH - Static Faculty Website

Static IUH faculty website built with Vite, Vanilla JavaScript, TailwindCSS, SCSS, and Swiper. The source is organized as a shared platform plus selected faculty modules. Runnable faculty modules include `health-science` and `dormitory-management`.

## Project Structure

```text
src/
├─ config/
│  └─ env.js
├─ faculties/
│  ├─ health-science/
│  ├─ dormitory-management/
│  └─ _template/
│     ├─ assets/
│     │  ├─ documents/
│     │  ├─ images/
│     │  └─ svgs/
│     ├─ components/
│     │  ├─ home/
│     │  ├─ careers/
│     │  ├─ industry-partnerships/
│     │  ├─ leadership/
│     │  └─ major/
│     ├─ data/
│     ├─ faculty.config.js
│     └─ pages/
├─ shared/
│  ├─ assets/
│  │  ├─ fonts/
│  │  ├─ images/
│  │  └─ svgs/
│  ├─ components/
│  ├─ js/
│  ├─ layouts/
│  └─ styles/
└─ main.js
```

Canonical ownership:

| Source | Owner |
| --- | --- |
| `src/shared/components` | Cross-faculty UI, layout chrome, search, tabs, common content blocks |
| `src/shared/js` | Cross-faculty runtime helpers and global widgets |
| `src/shared/styles` | Global Tailwind/SCSS entry and font declarations |
| `src/shared/assets` | Fonts, IUH logos, system icons, favicons, social/language images, true defaults |
| `src/faculties/<faculty>/pages` | Faculty HTML pages |
| `src/faculties/<faculty>/components` | Faculty-specific modules and feature components |
| `src/faculties/<faculty>/data` | Faculty JSON data. Runtime data is copied to `/data`; build-time content data such as `news.json` is read during HTML transform |
| `src/faculties/<faculty>/assets` | Faculty images, SVGs, and documents copied to `/assets/...` |

The old roots `src/pages`, `src/components`, `src/assets`, `src/layouts`, `src/styles`, `src/js`, and `public` are not canonical source locations.

## Quick Start

This project uses Yarn PnP and Vite 7. Use Yarn through Corepack for install, dev, build, and preview.

### Install

Requirements:

- Node.js 22.12+ or 20.19+
- Corepack enabled

Install dependencies:

```powershell
corepack enable
corepack yarn install
```

### Run Development

Run Dormitory Management on Windows PowerShell:

```powershell
$env:FACULTY='dormitory-management'
corepack yarn dev --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/contact.html
```

Run Health Science instead:

```powershell
$env:FACULTY='health-science'
corepack yarn dev --host 127.0.0.1 --port 5173
```

If port `5173` is already busy, use another port:

```powershell
corepack yarn dev --host 127.0.0.1 --port 5174
```

### Build

Build Dormitory Management:

```powershell
$env:FACULTY='dormitory-management'
corepack yarn build
```

Build Health Science:

```powershell
$env:FACULTY='health-science'
corepack yarn build
```

Build output is written to `dist_iuh/` through `VITE_OUT_DIR`.

### Preview

Preview the last build:

```powershell
$env:FACULTY='dormitory-management'
corepack yarn preview --host 127.0.0.1 --port 4173
```

Open:

```text
http://127.0.0.1:4173/
```

### macOS/Linux

Use inline environment variable syntax:

```bash
FACULTY=dormitory-management corepack yarn dev --host 127.0.0.1 --port 5173
FACULTY=dormitory-management corepack yarn build
FACULTY=dormitory-management corepack yarn preview --host 127.0.0.1 --port 4173
```

FACULTY=health-science corepack yarn dev --host 127.0.0.1 --port 5174

### Faculty IDs

`FACULTY` defaults to `health-science`, but explicit `FACULTY=<faculty-id>` commands are preferred so the selected module is unambiguous.

Current runnable ids:

| Faculty id | Display name |
| --- | --- |
| `health-science` | Khoa Khoa học Sức khỏe |
| `dormitory-management` | Phòng Quản lý Ký túc xá |
| `political-student-affairs` | Phòng Công tác chính trị và Hỗ trợ sinh viên |
| `organization-administration` | Phòng Tổ chức – Hành chính |

Build the Political and Student Affairs module with:

```bash
FACULTY=political-student-affairs corepack yarn build
```

## Architecture

### Selected Faculty Build

`vite.config.js` reads `FACULTY`, defaults to `health-science`, and builds from:

```text
src/faculties/<faculty>/pages
src/faculties/<faculty>/data
src/faculties/<faculty>/assets
src/faculties/<faculty>/faculty.config.js
```

The Vite root is the selected faculty page directory so generated HTML stays at the output root (`dist_iuh/index.html`, `dist_iuh/about.html`, etc.).

### Build-Time Component Injection

Pages are content-only HTML with `LAYOUT` metadata and `data-include` markers:

```html
<!-- src/faculties/health-science/pages/index.html -->
<!-- LAYOUT: title="Khoa Khoa học Sức khỏe" -->
<!-- LAYOUT: description="Khoa Khoa học Sức khỏe IUH" -->
<!-- LAYOUT: keywords="iuh, khoa hoc suc khoe" -->

<section>
  <div data-include="@shared/components/common/section-title.html" data-title="Tin tức"></div>
  <div data-include="@faculty/components/home/intro/index.html"></div>
</section>
```

`layoutPlugin` wraps pages with `src/shared/layouts/default.html`. `transformDataInclude` resolves includes and injects HTML at build time.

Include aliases:

| Alias | Use |
| --- | --- |
| `@shared/components/...` | Shared component HTML |
| `@faculty/components/...` | Selected faculty component HTML |

There is no long-term `@components` include alias.

### Shared Content Components

When a component is shared across faculties and only its content differs, keep the UI in `src/shared/components` and put selected-faculty content in `src/faculties/<faculty>/data`.

For static content that does not need runtime personalization, prefer build-time HTML injection. The news feature is the reference pattern:

```text
src/shared/components/news/              # shared UI shells
src/faculties/<faculty>/data/news.json   # faculty-owned source content
vite.config.js                           # reads news.json and injects static HTML
```

`news.json` is a build-time source file. It is not fetched by the browser and is intentionally skipped when copying faculty data to `dist_iuh/data`.

Use runtime JSON only when browser-side behavior genuinely needs to fetch data, such as search or quiz data.

### Runtime Initialization

`src/main.js` owns shared/global bootstrapping:

- shared styles
- loading manager
- SVG inlining
- search modal
- fade-in behavior
- article share actions
- PDF fallback
- header/footer
- global widgets
- shared runtime modules

Faculty-specific runtime modules live in `src/faculties/health-science/faculty.config.js`:

```javascript
export default {
  id: "health-science",
  runtimeModules: [
    {
      selector: ".hero-swiper",
      load: () => import("./components/home/carousel/carousel.js"),
      init: "initHeroCarousel",
      name: "Hero Carousel",
    },
  ],
};
```

Modules export named `init*` functions and do not auto-bind on import.

### Import Aliases

| Alias | Target |
| --- | --- |
| `@` | `src` |
| `@shared` | `src/shared` |
| `@faculty` | selected faculty root |
| `@js` | `src/shared/js` |
| `@styles` | `src/shared/styles` |
| `@assets` | `src/shared/assets` |

### Assets And Public URLs

Internal ownership changed, but public output URLs are preserved:

| Source | Output |
| --- | --- |
| `src/shared/assets/images` + `src/faculties/<faculty>/assets/images` | `/assets/images` |
| `src/shared/assets/svgs` | `/assets/svgs` |
| `src/shared/assets/fonts` | `/assets/fonts` |
| `src/faculties/<faculty>/assets/documents` | `/assets/documents` |
| `src/faculties/<faculty>/data` | `/data` for runtime JSON; build-time source files such as `news.json` are not copied |

Use root public URLs in HTML when referencing generated files, for example `/assets/images/default.jpg`.

For JavaScript data fetches, use `dataUrl()` from `src/shared/js/utils.js` so `VITE_BASE_PATH` is respected. Do this only for runtime data; build-time content such as news should already be injected into HTML.

```javascript
import { dataUrl } from "@js/utils.js";

const response = await fetch(dataUrl("data/search-data.json"));
```

## Adding Pages

Add pages to the selected faculty:

```text
src/faculties/health-science/pages/new-page.html
```

Minimum page shape:

```html
<!-- LAYOUT: title="Trang mới" -->
<!-- LAYOUT: description="Mô tả trang mới" -->
<!-- LAYOUT: keywords="iuh, khoa hoc suc khoe" -->
<!-- LAYOUT: url="https://iuh.edu.vn/trang-moi" -->
<!-- LAYOUT: ogImage="/assets/images/default.jpg" -->

<section class="container mx-auto px-4 py-8">
  <div data-include="@shared/components/common/section-title.html" data-title="Trang mới"></div>
</section>
```

Vite auto-discovers `*.html` under the selected faculty pages directory.

## Adding Components

Shared component:

```text
src/shared/components/example/
├─ index.html
├─ example.scss
└─ example.js
```

Faculty component:

```text
src/faculties/health-science/components/example/
├─ index.html
├─ example.scss
└─ example.js
```

Use shared components with `@shared/components/...` and faculty components with `@faculty/components/...`.

For JS, export a named init function:

```javascript
export function initExample() {
  const root = document.querySelector(".example");
  if (!root) return;
}
```

Register shared modules in `src/shared/shared.config.js`; register faculty modules in `src/faculties/<faculty-id>/faculty.config.js`.

## Adding A New Faculty

Create:

```text
src/faculties/<faculty-id>/
├─ assets/
│  ├─ documents/
│  ├─ images/
│  └─ svgs/
├─ components/
├─ data/
├─ faculty.config.js
└─ pages/
```

You can start from the minimal scaffold at `src/faculties/_template`. Copy it to `src/faculties/<faculty-id>`, then update `faculty.config.js` id/name/source paths and replace `pages/index.html`.

Then build with:

```bash
FACULTY=<faculty-id> corepack yarn build
```

Shared assets/components should move into `src/shared` only after there is real cross-faculty reuse. Faculty-specific content should stay in the faculty module.

Current runnable faculty ids:

| Faculty id | Display name | Notes |
| --- | --- | --- |
| `health-science` | Khoa Khoa hoc Suc khoe | Existing full Health Science module |
| `dormitory-management` | Phòng Quản lý Ký túc xá | Home, contact, Dormitory-owned content, assets, and search data |
| `political-student-affairs` | Phòng Công tác chính trị và Hỗ trợ sinh viên | Minimal home plus about, contact, news, and leadership pages with illustrative content |
| `organization-administration` | Phòng Tổ chức – Hành chính | Minimal home plus about, contact, news, and leadership pages with illustrative content |

## Build Output

```text
dist_iuh/
├─ index.html
├─ about.html
├─ ...
├─ assets/
│  ├─ css/
│  ├─ documents/
│  ├─ fonts/
│  ├─ images/
│  ├─ js/
│  └─ svgs/
└─ data/
   ├─ messages-en.json
   ├─ messages-vi.json
   ├─ quiz-data.json
   └─ search-data.json
```

`news.json` does not appear in `dist_iuh/data`; news content is already injected into `news.html`, `news-detail.html`, home news sections, sidebars, and related carousels during the HTML transform.

## Deployment

The supported deployment is Firebase Hosting at the domain root (`/`).

Use `--project` when deploying so `.firebaserc` does not need to be changed between sites.

Windows PowerShell:

```powershell
$env:FACULTY='health-science'
corepack yarn build
firebase deploy --only hosting --project iuh-khsk
```

```powershell
$env:FACULTY='dormitory-management'
corepack yarn build
firebase deploy --only hosting --project iuh-ktx
```

macOS/Linux:

```bash
FACULTY=health-science corepack yarn build
firebase deploy --only hosting --project iuh-khsk
```

```bash
FACULTY=dormitory-management corepack yarn build
firebase deploy --only hosting --project iuh-ktx
```

Current Firebase targets:

| Faculty | Firebase project | Hosting URL |
| --- | --- | --- |
| `health-science` | `iuh-khsk` | `https://iuh-khsk.web.app` |
| `dormitory-management` | `iuh-ktx` | `https://iuh-ktx.web.app` |

`VITE_BASE_PATH` exists for generated HTML/data URL rewriting, but subpath navigation is not fully tested.

```bash
VITE_BASE_PATH=/iuh/test/ FACULTY=health-science corepack yarn build
```

## Common Commands

```powershell
corepack yarn install

$env:FACULTY='dormitory-management'
corepack yarn dev --host 127.0.0.1 --port 5173
corepack yarn build
corepack yarn preview --host 127.0.0.1 --port 4173

$env:FACULTY='health-science'
corepack yarn build

corepack yarn agents:sync
openspec list --json
```

Version scripts:

```bash
corepack yarn version:patch
corepack yarn version:minor
corepack yarn version:major
corepack yarn build:patch
corepack yarn build:minor
corepack yarn build:major
```

## Agent Instruction Surfaces

Shared agent instructions live in:

- `.agents/skills/`
- `.agents/prompts/`

Generated consumer views:

- `.codex/skills/*`
- `.github/skills/*`
- `.github/prompts/*`

After adding or renaming anything under `.agents`, run:

```bash
corepack yarn agents:sync
```

## Troubleshooting

Build cannot find a faculty:

- Check `FACULTY=<faculty-id>`.
- Confirm `src/faculties/<faculty-id>/pages` exists.

Assets are missing after build:

- Check source ownership in `src/shared/assets` or `src/faculties/<faculty>/assets`.
- Check public references use `/assets/...`.
- Check the selected faculty build output in `dist_iuh/assets`.

Data fetch fails:

- Put faculty JSON in `src/faculties/<faculty>/data`.
- Fetch with `dataUrl("data/file.json")`.
- Do not fetch build-time content files such as `news.json`; check generated HTML instead.

Dependency commands fail:

- Use Corepack/Yarn 4.
- Do not rely on `node_modules`; this workspace uses Yarn PnP.
