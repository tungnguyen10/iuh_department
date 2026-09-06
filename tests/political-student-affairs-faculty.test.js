import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const facultyRoot = new URL('../src/faculties/political-student-affairs/', import.meta.url)
const expectedPages = [
  'about.html',
  'contact.html',
  'index.html',
  'leadership-detail.html',
  'leadership.html',
  'news-detail.html',
  'news.html',
  'partners.html',
]
const readFacultyFile = (path) => readFile(new URL(path, facultyRoot), 'utf8')

test('political student affairs faculty config exposes the selected-faculty contract', async () => {
  const config = await readFacultyFile('faculty.config.js')

  assert.match(config, /id:\s*["']political-student-affairs["']/)
  assert.match(config, /name:\s*["']Phòng Công tác chính trị và Hỗ trợ sinh viên["']/)
  assert.match(config, /root:\s*["']src\/faculties\/political-student-affairs["']/)
  assert.match(config, /runtimeModules:\s*\[\]/)
})

test('political student affairs faculty provides the planned pages without demo notices', async () => {
  const pages = (await readdir(new URL('pages/', facultyRoot))).filter((file) => file.endsWith('.html')).sort()

  assert.deepEqual(pages, expectedPages)
  for (const page of pages) {
    assert.doesNotMatch(await readFacultyFile(`pages/${page}`), /demo-notice|Dữ liệu minh họa/)
  }
  assert.match(await readFacultyFile('pages/index.html'), /@faculty\/components\/home\/carousel\/carousel\.html/)
})

test('political student affairs content does not retain dormitory or health-science links and copy', async () => {
  const sourceFiles = [
    'faculty.config.js',
    ...expectedPages.filter((page) => page !== 'partners.html').map((page) => `pages/${page}`),
    'components/header/header.html',
    'components/footer/footer.html',
  ]
  const source = (await Promise.all(sourceFiles.map(readFacultyFile))).join('\n')

  assert.doesNotMatch(source, /Ký túc xá|Khoa Khoa học Sức khỏe|kytucxa@|\/login\.html|\/tra-cuu\.html/i)
})

test('political student affairs site chrome data only links to built HTML pages', async () => {
  const chrome = JSON.stringify(JSON.parse(await readFacultyFile('data/site.json')))
  const builtRoutes = new Set(['/', ...expectedPages.filter((page) => page !== 'index.html').map((page) => `/${page}`)])
  const linkedRoutes = [...chrome.matchAll(/"href":"(\/[^"#?]*)"/g)].map((match) => match[1])

  assert.ok(linkedRoutes.length > 0)
  for (const route of linkedRoutes) assert.ok(builtRoutes.has(route), `Unexpected internal route: ${route}`)
})

test('political student affairs news and search data are valid and populated', async () => {
  const news = JSON.parse(await readFacultyFile('data/news.json'))
  const search = JSON.parse(await readFacultyFile('data/search-data.json'))

  assert.equal(news.items.length, 4)
  assert.ok(news.items.every((item) => item.slug && item.title && item.excerpt && item.content.length > 0))
  assert.ok(Array.isArray(search))
  assert.ok(search.length >= expectedPages.length + news.items.length)
})

test('political student affairs shared includes use transformer-compatible parameters', async () => {
  const detail = await readFacultyFile('pages/leadership-detail.html')

  assert.match(detail, /data-include="@shared\/components\/common\/divider\.html" data-class="mt-8"/)
  assert.doesNotMatch(detail, /class="mt-8" data-include=/)
})

test('department faculties delegate header and footer markup to shared components', async () => {
  const politicalHeader = await readFacultyFile('components/header/header.html')
  const politicalFooter = await readFacultyFile('components/footer/footer.html')
  const dormitoryHeader = await readFile(new URL('../src/faculties/dormitory-management/components/header/header.html', import.meta.url), 'utf8')
  const dormitoryFooter = await readFile(new URL('../src/faculties/dormitory-management/components/footer/footer.html', import.meta.url), 'utf8')
  const sharedHeader = await readFile(new URL('../src/shared/components/header/department.html', import.meta.url), 'utf8')
  const sharedFooter = await readFile(new URL('../src/shared/components/footer/department.html', import.meta.url), 'utf8')

  for (const header of [politicalHeader, dormitoryHeader]) {
    assert.match(header, /data-include="@shared\/components\/header\/department\.html"/)
    assert.doesNotMatch(header, /<header\b/)
  }
  for (const footer of [politicalFooter, dormitoryFooter]) {
    assert.match(footer, /data-include="@shared\/components\/footer\/department\.html"/)
    assert.doesNotMatch(footer, /<footer\b/)
  }

  assert.match(sharedHeader, /data-site-unit-name/)
  assert.match(sharedHeader, /data-site-primary-nav/)
  assert.match(sharedFooter, /<footer\b/)
  assert.match(sharedFooter, /id="footer-year"/)
  assert.doesNotMatch(`${sharedHeader}\n${sharedFooter}`, /\{\{[^}]+\}\}/)
})
