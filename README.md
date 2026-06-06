# Lab IUH - Static Website

Modern static website built with Vite + Vanilla JS + TailwindCSS, featuring build-time optimization and component bundling.

## 📁 Project Structure

```
src/
├─ pages/              # HTML pages (content-only)
│  ├─ index.html
│  ├─ about.html
│  └─ contact.html
├─ layouts/            # Layout templates
│  └─ default.html     # Default layout with SEO
├─ components/         # Components (HTML + JS + CSS)
│  ├─ header/
│  │  ├─ header.html
│  │  ├─ header.js
│  │  └─ header.css
│  ├─ footer/
│  │  ├─ footer.html
│  │  └─ footer.css
│  └─ loading/
│     └─ loading.html  # Global loading overlay
├─ js/
│  ├─ loading.js       # LoadingManager (global loading API)
│  ├─ svg-loader.js    # Auto SVG inlining
│  ├─ utils.js         # Utility functions (delay, etc)
│  ├─ home.js          # Home page specific JS
│  └─ about.js         # About page specific JS
├─ styles/
│  └─ main.css         # Tailwind entry + custom components
├─ assets/
│  ├─ images/
│  └─ svg/             # SVG icons (auto-loaded)
├─ config/
│  └─ env.js           # Environment config
└─ main.js             # Vite entry point

vite.config.js         # Vite config with custom plugins
dist_iuh/              # Build output folder
```

### Agent Instruction Surfaces

Shared agent instructions live in:

- `.agents/skills/`
- `.agents/prompts/`

Consumer-specific paths stay readable through generated per-item symlinks:

- `.codex/skills/*`
- `.github/skills/*`
- `.github/prompts/*`
- `.agents/codex/skills/*`
- `.agents/github/skills/*`
- `.agents/github/prompts/*`

After adding or renaming anything under `.agents`, regenerate those views with:

```bash
yarn agents:sync
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Development Mode

```bash
npm run dev
# or
yarn dev
```

Opens http://localhost:5173

### 3. Build for Production

```bash
npm run build
# or
yarn build
```

Output: `dist_iuh/` folder (configured via VITE_OUT_DIR)

#### Build with Auto Version Bump

```bash
# Tăng PATCH version (0.0.1 → 0.0.2) và build
yarn build:patch

# Tăng MINOR version (0.1.0 → 0.2.0) và build
yarn build:minor

# Tăng MAJOR version (1.0.0 → 2.0.0) và build
yarn build:major
```

Version được lưu trong `package.json` và hiển thị trong console:
```
🎓 IUH | Version: 0.0.1 | Mode: development
```

#### Manual Version Management

```bash
# Chỉ bump version không build
yarn version:patch
yarn version:minor
yarn version:major
```

### 4. Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 🎯 Architecture Overview

### Build-Time Component Injection

Components are **injected at build time** (not runtime) using custom Vite plugin:

```html
<!-- In page HTML -->
<div data-include="../../components/header/header.html"></div>
```

During build, the plugin reads `header.html` and injects its content directly, eliminating HTTP requests.

### Layout Template System

Pages use a **content-only format** with metadata markers:

```html
<!-- src/pages/index.html -->
<!-- LAYOUT: title="Home - Lab IUH" -->
<!-- LAYOUT: description="Welcome to Lab IUH" -->
<!-- LAYOUT: keywords="vite, tailwind, lab" -->
<!-- LAYOUT: script="../js/home.js" -->

<section class="hero">
  <!-- Your content -->
</section>
```

The `layoutPlugin` wraps this content with `src/layouts/default.html`, which includes:
- Full SEO meta tags (OG, Twitter Card, keywords)
- Header/Footer structure
- Global loading overlay
- Page-specific script injection

### Auto Component Bundling

All component JavaScript is **automatically bundled** into main.js:

```javascript
// src/main.js
const componentModules = import.meta.glob('./components/**/*.js', { eager: true })

// Auto-init all components
Object.values(componentModules).forEach(module => {
  if (module.init && typeof module.init === 'function') {
    module.init()
  }
})
```

No need to manually import each component - just export an `init()` function:

```javascript
// src/components/header/header.js
export function init() {
  // Component initialization logic
}
```

### Auto SVG Loading

SVGs are **auto-imported and inlined** for better styling:

```javascript
// src/main.js
const svgModules = import.meta.glob('./assets/svgs/*.svg', { eager: true, query: '?url' })
await inlineSVGs() // Inlines all SVGs with data-svg attribute
```

Usage in HTML:
```html
<img data-svg="logo" alt="Logo">
<!-- Becomes inline SVG at runtime for CSS styling -->
```

### Global Loading System

**LoadingManager** provides a global loading API with counter pattern:

```javascript
import { loadingManager } from './js/loading.js'

// Manual control
loadingManager.show('Loading data...')
await fetchData()
loadingManager.hide()

// Or wrap async functions
const fetchData = loadingManager.wrap(
  async () => {
    const res = await fetch('/api/data')
    return res.json()
  },
  'Loading data...'
)

// Force hide (reset counter)
loadingManager.forceHide()
```

The counter pattern tracks multiple concurrent operations - loading only hides when all operations complete.

### Page Lifecycle

```javascript
document.addEventListener('components-loaded', () => {
  // Your page-specific logic
  // All components initialized, SVGs loaded
})
```

## 🔧 Custom Vite Plugins

### layoutPlugin

- **Order**: `pre` (runs before other transforms)
- **Purpose**: Wraps page content with layout template
- **Features**:
  - Extracts metadata from `<!-- LAYOUT: key="value" -->` comments
  - Injects loading component
  - Replaces placeholders: `{{title}}`, `{{content}}`, `{{pageScript}}`, etc.

### transformDataInclude

- **Purpose**: Build-time component HTML injection
- **Features**:
  - Finds `<div data-include="path">` tags
  - Reads component HTML files
  - Replaces tags with actual HTML content
  - No runtime overhead

## 📦 Tech Stack

- **Vite 7.3.1** - Lightning-fast build tool & dev server
- **Vanilla JavaScript** - No frameworks, pure web standards
- **TailwindCSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Swiper** - Touch slider for carousels

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
# Build production
yarn build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy specific site
firebase deploy --only hosting:iuh-department
```

### Firebase Configuration

```json
{
  "hosting": {
    "public": "dist_iuh",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

### Build Output Structure

```
dist_iuh/
├── index.html
├── about.html
├── leadership.html
├── news.html
├── assets/
│   ├── css/
│   │   ├── main-[hash].css      # Main styles
│   │   └── vendor-[hash].css    # Vendor styles
│   ├── js/
│   │   ├── main-[hash].js       # Core functionality
│   │   ├── vendor-[hash].js     # Third-party libs
│   │   └── [component]-[hash].js # Component bundles
│   ├── images/                   # Optimized images
│   ├── fonts/                    # Web fonts
│   └── svgs/                     # SVG icons
└── data/
    ├── messages-en.json
    ├── messages-vi.json
    └── search-data.json
```

### Build Features

- **Code Splitting**: Main, vendor, và component bundles
- **Asset Optimization**: Minified CSS/JS, optimized images
- **Cache Strategy**: Hash-based filenames cho long-term caching
- **Build Metadata**: Inject version, mode, build signature

```javascript
// Available at runtime
__APP_VERSION__      // từ package.json
__BUILD_MODE__       // 'production' | 'development'
__BUILD_SIGNATURE__  // Git hash + timestamp
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear và reinstall dependencies
rm -rf node_modules
yarn install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Version Not Updated

```bash
# Check current version
cat package.json | grep version

# Manual version update
yarn version <new-version>
```

### Assets Not Found After Build

- Check paths sử dụng `/assets/...` (absolute)
- Verify files tồn tại trong `src/assets/` hoặc `public/`
- Check `vite.config.js` copy plugins

### Performance Optimization

```bash
# Analyze bundle size
yarn build

# Check output trong terminal
# Hoặc add rollup-plugin-visualizer
```

**Tips:**
- Use WebP images
- Lazy load components khi có thể
- Optimize images trước khi add vào project
- Monitor bundle sizes trong build output

## ✨ Key Features

✅ **Build-time component injection** - Zero runtime overhead  
✅ **Layout template system** - DRY HTML structure  
✅ **Auto component bundling** - import.meta.glob  
✅ **Auto SVG inlining** - Better CSS styling  
✅ **Global loading system** - Counter pattern for async ops  
✅ **SEO optimized** - OG tags, Twitter Card, meta tags  
✅ **Content-only pages** - Metadata marker pattern  
✅ **Fast HMR** - Instant updates in dev mode  
✅ **Production-ready** - Optimized static output  
✅ **No complex frameworks** - Simple, maintainable code  

## 🎨 Adding New Pages

1. Create content-only HTML in `src/pages/`:

```html
<!-- src/pages/services.html -->
<!-- LAYOUT: title="Services - Lab IUH" -->
<!-- LAYOUT: description="Our services" -->
<!-- LAYOUT: keywords="services, web, design" -->
<!-- LAYOUT: script="../js/services.js" -->

<section class="container mx-auto py-12">
  <h1>Our Services</h1>
  <!-- Your content -->
</section>
```

2. Create page-specific JS (optional):

```javascript
// src/js/services.js
document.addEventListener('components-loaded', () => {
  // Page initialization
})
```

Vite auto-detects and builds the new page!

## 🔧 Adding New Components

1. Create component folder in `src/components/`:

```
src/components/card/
├─ card.html
├─ card.js (optional)
└─ card.css (optional)
```

2. Use in pages:

```html
<div data-include="../../components/card/card.html"></div>
```

3. Add JS if needed:

```javascript
// src/components/card/card.js
export function init() {
  // Component logic
}
```

The component is auto-imported and initialized!

## 🛠️ Utility Functions

```javascript
import { delay } from './js/utils.js'

// Delay execution
await delay(1000) // Wait 1 second
```

## 🌍 Environment Configuration

```javascript
// src/config/env.js
export const appEnv = import.meta.env.MODE // 'development' | 'production'
export const basePath = import.meta.env.VITE_BASE_PATH // '/iuh/test/'
```

Usage in code:
```javascript
import { appEnv, basePath } from './config/env.js'

if (appEnv === 'development') {
  console.log('Dev mode')
}
```

## 📝 License

MIT
