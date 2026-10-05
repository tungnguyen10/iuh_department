import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
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
  'fields',
  'service-explorer',
  'training',
  'capabilities',
  'consulting-process',
  'technology-transfer',
  'industrial-support',
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
    '@shared/components/partners/index.html',
  ])
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
})

test('idcs delegates header, footer, documents and tabs to shared components', async () => {
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
  assert.match(updates, /class="tabs-container/)
  assert.match(updates, /data-news-list/)
})

test('idcs includes are transformer-compatible and free of other faculty content', async () => {
  const pages = await Promise.all(expectedPages.map((page) => readFacultyFile(`pages/${page}`)))
  const components = await Promise.all(homeBlocks.map((block) => readFacultyFile(`components/home/${block}/index.html`)))
  const source = [...pages, ...components].join('\n')

  assert.doesNotMatch(source, /<div (?!data-include)[^>]*data-include=/)
  assert.doesNotMatch(source, /Ký túc xá|Khoa Khoa học Sức khỏe|Phòng Tổ chức|Hỗ trợ sinh viên|\/documents-forms\.html/i)
})

test('idcs service explorer and updates tabs expose tab semantics', async () => {
  const [explorer, updates] = await Promise.all([
    readFacultyFile('components/home/service-explorer/index.html'),
    readFacultyFile('components/home/updates/index.html'),
  ])

  for (const source of [explorer, updates]) {
    const tabs = [...source.matchAll(/role="tab"/g)].length
    const panels = [...source.matchAll(/role="tabpanel"/g)].length

    assert.match(source, /role="tablist"/)
    assert.ok(tabs > 1)
    assert.equal(tabs, panels)
    assert.equal([...source.matchAll(/class="tab-btn active/g)].length, 1)
  }
})
