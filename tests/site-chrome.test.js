import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const rendererUrl = new URL('../src/shared/components/site-chrome/site-chrome-renderer.js', import.meta.url)
const loaderUrl = new URL('../src/shared/components/site-chrome/site-data.js', import.meta.url)

const fixture = {
  version: 1,
  identity: {
    unitName: 'Phòng <Hỗ trợ>',
    organizationName: 'Trường Đại học Công nghiệp TP.HCM',
    email: 'support@iuh.edu.vn',
    phone: { text: '(028) 1234 5678', href: '02812345678' },
    address: '12 Nguyễn Văn Bảo',
    mapAddress: '12 Nguyễn Văn Bảo, TP.HCM',
  },
  quickLinks: [
    { text: 'Giới thiệu', href: '/about.html', icon: 'icon-article.svg' },
    { text: 'Email', href: 'mailto:support@iuh.edu.vn', icon: 'icon-mail-outline.svg' },
    { text: 'CDN', href: '//cdn.example.test/page', icon: 'icon-building.svg' },
  ],
  navigation: [
    { text: 'Trang chủ', href: '/' },
    {
      text: 'Thông tin',
      children: [
        { text: 'Tin tức', href: '/news.html' },
        {
          text: 'Chuyên mục',
          children: [{ text: 'Chi tiết', href: '/news-detail.html' }],
        },
      ],
    },
  ],
  footer: {
    columns: [{ title: 'Hỗ trợ', links: [{ text: 'Liên hệ', href: '/contact.html' }] }],
    socialLinks: [
      { text: 'Facebook', href: 'https://www.facebook.com/iuh.official', icon: 'icon-facebook.svg' },
      { text: 'Youtube', href: '#', icon: 'icon-youtube.svg' },
    ],
  },
  search: {
    quickLinks: [{ text: 'Tin tức', href: '/news.html' }],
    categories: [{ text: 'Liên hệ', href: '/contact.html', icon: 'LH' }],
  },
}

const routes = ['/', '/about.html', '/contact.html', '/news.html', '/news-detail.html']

test('site chrome modules exist', () => {
  assert.equal(existsSync(rendererUrl), true)
  assert.equal(existsSync(loaderUrl), true)
})

test('site renderer renders escaped identity, recursive navigation, links and footer', async () => {
  const { createSiteChromeRenderer } = await import(rendererUrl)
  const render = createSiteChromeRenderer({ base: '/faculty/', site: fixture, pageRoutes: routes })
  const html = render(`
    <div data-site-quick-links></div>
    <div data-site-unit-name></div>
    <div data-site-email></div>
    <div data-site-phone></div>
    <div class="keep-primary-nav-layout" data-site-primary-nav></div>
    <div data-site-mobile-quick-links></div>
    <div data-site-footer-identity></div>
    <div data-site-footer-columns></div>
    <div data-site-social-links></div>
    <a href="/" data-site-home-link>Home</a>
  `)

  assert.match(html, /Phòng &lt;Hỗ trợ&gt;/)
  assert.match(html, /href="\/faculty\/about\.html"/)
  assert.match(html, /href="\/faculty\/news-detail\.html"/)
  assert.match(html, /href="mailto:support@iuh\.edu\.vn"/)
  assert.match(html, /href="https:\/\/www\.facebook\.com\/iuh\.official"/)
  assert.match(html, /href="#"/)
  assert.match(html, /href="\/\/cdn\.example\.test\/page"/)
  assert.match(html, /href="\/faculty\/"[^>]*>Home</)
  assert.match(html, /Chuyên mục/)
  assert.match(html, /Hỗ trợ/)
  assert.match(html, /class="keep-primary-nav-layout"/)
  assert.doesNotMatch(html, /data-site-/)
  assert.doesNotMatch(html, /\{\{[^}]+\}\}/)
})

test('site data validator reports faculty-aware errors', async () => {
  const { validateSiteData } = await import(loaderUrl)

  assert.throws(
    () => validateSiteData({ ...fixture, version: 2 }, { facultyId: 'broken-faculty', pageRoutes: routes }),
    /broken-faculty.*version/i,
  )
  assert.throws(
    () => validateSiteData({ ...fixture, navigation: [{ text: 'Thiếu đích' }] }, { facultyId: 'broken-faculty', pageRoutes: routes }),
    /broken-faculty.*href.*children/i,
  )
  assert.throws(
    () => validateSiteData({ ...fixture, navigation: [{ text: 'Hai đích', href: '/', children: [] }] }, { facultyId: 'broken-faculty', pageRoutes: routes }),
    /broken-faculty.*href.*children/i,
  )
  assert.throws(
    () => validateSiteData({ ...fixture, quickLinks: [{ text: 'Sai route', href: '/missing.html', icon: 'icon-article.svg' }] }, { facultyId: 'broken-faculty', pageRoutes: routes }),
    /broken-faculty.*missing\.html/i,
  )
})

test('site data loader fails clearly for missing and malformed JSON', async () => {
  const { loadFacultySiteData } = await import(loaderUrl)
  const root = await mkdtemp(join(tmpdir(), 'iuh-site-data-'))

  try {
    assert.throws(
      () => loadFacultySiteData({ facultyId: 'missing-faculty', facultyDataRoot: root, pageRoutes: routes }),
      /missing-faculty.*site\.json/i,
    )
    await writeFile(join(root, 'site.json'), '{invalid json', 'utf8')
    assert.throws(
      () => loadFacultySiteData({ facultyId: 'malformed-faculty', facultyDataRoot: root, pageRoutes: routes }),
      /malformed-faculty.*site\.json/i,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('all faculty site configs use one schema and shared chrome wrappers', async () => {
  for (const facultyId of ['health-science', 'dormitory-management', 'political-student-affairs']) {
    const root = new URL(`../src/faculties/${facultyId}/`, import.meta.url)
    const [siteSource, config, header, footer] = await Promise.all([
      readFile(new URL('data/site.json', root), 'utf8'),
      readFile(new URL('faculty.config.js', root), 'utf8'),
      readFile(new URL('components/header/header.html', root), 'utf8'),
      readFile(new URL('components/footer/footer.html', root), 'utf8'),
    ])
    const site = JSON.parse(siteSource)
    const pages = (await readdir(new URL('pages/', root))).filter((file) => file.endsWith('.html'))
    const routesForFaculty = new Set(['/', ...pages.filter((page) => page !== 'index.html').map((page) => `/${page}`)])

    assert.equal(site.version, 1)
    assert.match(config, /import site from ["']\.\/data\/site\.json["']/)
    assert.match(config, /search:\s*site\.search/)
    assert.equal(header.trim(), '<div data-include="@shared/components/header/department.html"></div>')
    assert.equal(footer.trim(), '<div data-include="@shared/components/footer/department.html"></div>')

    const internalLinks = JSON.stringify(site).match(/"href":"\/(?:[^"?#]*)/g) || []
    for (const match of internalLinks) {
      const href = `${match.slice('"href":"'.length)}`
      assert.ok(routesForFaculty.has(href), `${facultyId} has an unbuilt route: ${href}`)
    }
  }
})

test('legacy faculty-specific shared chrome is removed', () => {
  assert.equal(existsSync(new URL('../src/shared/components/header/header.html', import.meta.url)), false)
  assert.equal(existsSync(new URL('../src/shared/components/footer/footer.html', import.meta.url)), false)
})

test('include pipeline performs final unresolved-output checks after all renderers', async () => {
  const viteConfig = await readFile(new URL('../vite.config.js', import.meta.url), 'utf8')

  const activitiesPosition = viteConfig.indexOf('transformed = createActivitiesRenderer')
  assert.ok(activitiesPosition > 0)
  assert.ok(viteConfig.indexOf('Unresolved site marker', activitiesPosition) > activitiesPosition)
  assert.ok(viteConfig.indexOf('Unresolved placeholder', activitiesPosition) > activitiesPosition)
})

test('dev entry uses an fs URL while production keeps a relative module path', async () => {
  const { resolveMainScript } = await import(new URL('../vite.config.js', import.meta.url))
  const pagesRoot = '/repo/src/faculties/example/pages'
  const mainFile = '/repo/src/main.js'

  assert.equal(resolveMainScript('serve', pagesRoot, mainFile), '/@fs//repo/src/main.js')
  assert.equal(resolveMainScript('build', pagesRoot, mainFile), '../../../main.js')
})
