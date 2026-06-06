## 1. Fix Dev Server fs.allow

- [x] 1.1 Expand `server.fs.allow` in `vite.config.js` to include `resolve(__dirname)` so the dev server can serve files from `src/assets/`
- [x] 1.2 Verify dev server no longer returns 403 for `/assets/` requests

## 2. Normalize Source Asset Paths

- [x] 2.1 Update `src/components/footer/footer.html`: change 11 bare `assets/...` to `/assets/...`
- [x] 2.2 Update `src/components/partners/index.html`: change 6 bare `data-image="assets/..."` to `data-image="/assets/..."`
- [x] 2.3 Update `src/components/common/child-title.html`: change 1 bare `assets/...` to `/assets/...`

## 3. Expand transformDataInclude Regex

- [x] 3.1 Update the 6 regex patterns in `transformDataInclude` to match both `/assets/...` and bare `assets/...` (change `\/assets\/` to `\/?assets\/` in each pattern)
- [x] 3.2 Ensure rewrite output produces `/assets/...` or `{base}assets/...` consistently for both input formats

## 4. Verify

- [x] 4.1 Dev server: confirm all images/SVGs load on `http://localhost:5173/health-science`
- [x] 4.2 Production build: confirm `dist_iuh/` output has no bare `assets/...` paths remaining
