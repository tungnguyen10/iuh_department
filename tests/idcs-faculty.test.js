import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const facultyRoot = new URL('../src/faculties/idcs/', import.meta.url)
const expectedPages = [
  'about.html',
  'consulting.html',
  'contact.html',
  'document-detail.html',
  'index.html',
  'industrial-support.html',
  'leadership-detail.html',
  'leadership.html',
  'legal-documents.html',
  'news-detail.html',
  'news.html',
  'partners.html',
  'services.html',
  'technology-transfer.html',
  'training.html',
]
const homeBlocks = [
  'hero',
  'training',
  'service-explorer',
  'consulting-process',
  'technology-transfer',
  'industrial-support',
  'capabilities',
  'updates',
]
const readFacultyFile = (path) => readFile(new URL(path, facultyRoot), 'utf8')

test('idcs faculty config exposes the selected-faculty contract', async () => {
  const config = await readFacultyFile('faculty.config.js')

  assert.match(config, /id:\s*["']idcs["']/)
  assert.match(config, /name:\s*["']Trung tâm IDCS["']/)
  assert.match(config, /root:\s*["']src\/faculties\/idcs["']/)
  assert.match(config, /search:\s*site\.search/)
  assert.match(config, /selector: "\.hero-swiper"/)
  assert.match(config, /components\/home\/carousel\/carousel\.js/)
  assert.match(config, /init: "initHeroCarousel"/)
})

test('idcs faculty provides the planned pages', async () => {
  const pages = (await readdir(new URL('pages/', facultyRoot))).filter((file) => file.endsWith('.html')).sort()

  assert.deepEqual(pages, expectedPages)
})

test('idcs homepage composes every brief block in order', async () => {
  const home = await readFacultyFile('pages/index.html')
  const includes = [...home.matchAll(/data-include="([^"]+)"/g)].map((match) => match[1])

  assert.deepEqual(includes, [
    '@faculty/components/home/carousel/carousel.html',
    ...homeBlocks.map((block) => `@faculty/components/home/${block}/index.html`),
  ])
})

test('idcs injects shared partners before the footer except on the partners page', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))
  const partnersPage = await readFacultyFile('pages/partners.html')

  assert.deepEqual(site.layout.beforeFooter, [
    { include: '@shared/components/partners/index.html', class: 'nttFade' },
  ])
  assert.match(partnersPage, /<!--\s*LAYOUT:\s*beforeFooter="off"\s*-->/)

  for (const page of expectedPages.filter((file) => file !== 'partners.html')) {
    const source = await readFacultyFile(`pages/${page}`)
    assert.doesNotMatch(source, /@shared\/components\/partners\/index\.html/, `${page} must rely on the layout injection`)
  }
})

test('idcs service pages share hero, related services and keep their anchors', async () => {
  const servicePages = {
    'training.html': { hide: 'training', anchors: ['programs', 'register', 'schedule'] },
    'services.html': { hide: 'services', anchors: ['catalogue', 'equipment', 'request'] },
    'consulting.html': { hide: 'consulting', anchors: ['process', 'topics'] },
    'technology-transfer.html': { hide: 'transfer', anchors: ['pipeline', 'focus-areas'] },
    'industrial-support.html': { hide: 'industrial', anchors: ['pillars', 'needs'] },
  }

  for (const [page, { hide, anchors }] of Object.entries(servicePages)) {
    const source = await readFacultyFile(`pages/${page}`)
    assert.match(source, /data-include="@faculty\/components\/service\/hero\.html"/, `${page} must use the service hero`)
    assert.match(source, new RegExp(`data-include="@faculty/components/service/related-services\\.html" data-${hide}-class="hidden"`), `${page} must hide itself in related services`)
    assert.doesNotMatch(source, /data-parent-page1="Trang chủ"/, `${page} must not duplicate the home breadcrumb`)
    for (const anchor of anchors) {
      assert.match(source, new RegExp(`id="${anchor}"|data-id="${anchor}"`), `${page} is missing #${anchor}`)
    }
  }
})

test('idcs breadcrumbs never repeat home and hide empty parent levels', async () => {
  for (const page of expectedPages) {
    const source = await readFacultyFile(`pages/${page}`)
    const crumbs = [...source.matchAll(/<div data-include="@shared\/components\/common\/breadcrumb\.html"([^>]*)>/g)]
    if (page === 'index.html' || page === 'partners.html') {
      assert.equal(crumbs.length, 0, `${page} must not declare its own breadcrumb`)
      continue
    }
    assert.equal(crumbs.length, 1, `${page} must have exactly one breadcrumb`)
    const attrs = Object.fromEntries([...crumbs[0][1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]))
    assert.ok(attrs['current-page'], `${page} breadcrumb needs a current page`)
    for (const level of ['1', '2']) {
      assert.notEqual(attrs[`parent-page${level}`], 'Trang chủ', `${page} repeats home in the breadcrumb`)
      assert.ok(`parent-page${level}-class` in attrs, `${page} must set parent-page${level}-class`)
      if (!attrs[`parent-page${level}`]) assert.match(attrs[`parent-page${level}-class`], /\bhidden\b/, `${page} shows an empty breadcrumb level ${level}`)
    }
  }
})

test('idcs hero carousel owns its markup and labels the correct centre', async () => {
  const carousel = await readFacultyFile('components/home/carousel/carousel.html')
  const slides = [...carousel.matchAll(/<div class="swiper-slide">/g)]
  const alts = [...carousel.matchAll(/alt="([^"]+)"/g)].map((match) => match[1])

  assert.equal(slides.length, 3)
  assert.equal(alts.length, 3)
  assert.ok(alts.every((alt) => alt.includes('IDCS')))
  // Brief §1.3: IDCS must never be labelled as IDC or as the product-design centre.
  assert.ok(alts.every((alt) => !/Thiết kế và Phát triển sản phẩm/.test(alt)))
  assert.doesNotMatch(carousel, /data-shared-carousel|data-carousel-image/)
  assert.match(carousel, /class="swiper hero-swiper"/)
})

test('idcs site data links resolve to real pages and homepage sections', async () => {
  const home = await Promise.all(homeBlocks.map((block) => readFacultyFile(`components/home/${block}/index.html`)))
  const sectionIds = new Set(home.flatMap((source) => [...source.matchAll(/<section id="([\w-]+)"/g)].map((match) => match[1])))
  const site = JSON.parse(await readFacultyFile('data/site.json'))
  const serialized = JSON.stringify(site)

  const homeAnchors = [...serialized.matchAll(/"href":"\/#([\w-]+)"/g)].map((match) => match[1])
  for (const anchor of homeAnchors) assert.ok(sectionIds.has(anchor), `homepage is missing section #${anchor}`)

  const pageLinks = [...serialized.matchAll(/"href":"\/([\w-]+\.html)/g)].map((match) => match[1])
  assert.ok(pageLinks.length > 0)
  for (const page of new Set(pageLinks)) assert.ok(expectedPages.includes(page), `site data links to missing page ${page}`)
})

test('idcs site chrome data only links to built HTML pages', async () => {
  const chrome = JSON.stringify(JSON.parse(await readFacultyFile('data/site.json')))
  const builtRoutes = new Set(['/', ...expectedPages.filter((page) => page !== 'index.html').map((page) => `/${page}`)])
  const linkedRoutes = [...chrome.matchAll(/"href":"(\/[^"#?]*)/g)].map((match) => match[1]).filter(Boolean)

  assert.ok(linkedRoutes.length > 0)
  for (const route of linkedRoutes) assert.ok(builtRoutes.has(route), `Unexpected internal route: ${route}`)
})

test('idcs news and search data are valid and populated', async () => {
  const news = JSON.parse(await readFacultyFile('data/news.json'))
  const search = JSON.parse(await readFacultyFile('data/search-data.json'))

  assert.equal(news.items.length, 4)
  assert.ok(news.items.every((item) => item.slug && item.title && item.excerpt && item.content.length > 0))
  assert.ok(Array.isArray(search))
  assert.ok(search.length >= expectedPages.length + news.items.length)
  for (const item of news.items) {
    assert.equal(new URL(item.sourceUrl).hostname, 'idccenter.gov.vn')
    assert.match(item.dateISO, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(search.some((entry) => entry.url === `/news-detail.html?slug=${item.slug}` && entry.title === item.title))
    await access(new URL(item.image.replace(/^\//, ''), facultyRoot))
  }
})

test('idcs delegates header, footer, documents and news to shared components', async () => {
  const [header, footer, legalDocuments, updates] = await Promise.all([
    readFacultyFile('components/header/header.html'),
    readFacultyFile('components/footer/footer.html'),
    readFacultyFile('pages/legal-documents.html'),
    readFacultyFile('components/home/updates/index.html'),
  ])

  assert.match(header, /data-include="@shared\/components\/header\/department\.html"/)
  assert.match(footer, /data-include="@shared\/components\/footer\/department\.html"/)
  assert.match(legalDocuments, /data-document-library/)
  assert.match(legalDocuments, /@shared\/components\/documents\/document-item\.html/)
  assert.doesNotMatch(legalDocuments, /@faculty\/components\/documents\//)
  assert.match(updates, /data-news-sidebar-items data-limit="3"/)
  assert.equal((updates.match(/@shared\/components\/documents\/document-item\.html/g) ?? []).length, 4)
})

test('idcs includes are transformer-compatible and free of other faculty content', async () => {
  const pages = await Promise.all(expectedPages.map((page) => readFacultyFile(`pages/${page}`)))
  const components = await Promise.all(homeBlocks.map((block) => readFacultyFile(`components/home/${block}/index.html`)))
  const source = [...pages, ...components].join('\n')

  assert.doesNotMatch(source, /<div (?!data-include)[^>]*data-include=/)
  assert.doesNotMatch(source, /Ký túc xá|Khoa Khoa học Sức khỏe|Phòng Tổ chức|Hỗ trợ sinh viên|\/documents-forms\.html/i)
})

test('idcs keeps service explorer tabs and shows both updates blocks without tabs', async () => {
  const [explorer, updates] = await Promise.all([
    readFacultyFile('components/home/service-explorer/index.html'),
    readFacultyFile('components/home/updates/index.html'),
  ])

  const tabs = [...explorer.matchAll(/role="tab"/g)].length
  const panels = [...explorer.matchAll(/role="tabpanel"/g)].length

  assert.match(explorer, /role="tablist"/)
  assert.ok(tabs > 1)
  assert.equal(tabs, panels)
  assert.equal([...explorer.matchAll(/class="tab-btn active/g)].length, 1)
  assert.match(updates, /<section[^>]+aria-labelledby="updates-news-title"/)
  assert.match(updates, /<section[^>]+aria-labelledby="updates-documents-title"/)
  assert.doesNotMatch(updates, /role="tab(?:list|panel)?"|data-tab(?:-panel)?=|\btab-panel\b|\shidden(?:\s|>)/)
})
