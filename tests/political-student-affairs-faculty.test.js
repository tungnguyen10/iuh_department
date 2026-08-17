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
]
const demoNotice = '@faculty/components/common/demo-notice.html'

const readFacultyFile = (path) => readFile(new URL(path, facultyRoot), 'utf8')

test('political student affairs faculty config exposes the selected-faculty contract', async () => {
  const config = await readFacultyFile('faculty.config.js')

  assert.match(config, /id:\s*["']political-student-affairs["']/)
  assert.match(config, /name:\s*["']Phòng Công tác chính trị và Hỗ trợ sinh viên["']/)
  assert.match(config, /root:\s*["']src\/faculties\/political-student-affairs["']/)
  assert.match(config, /runtimeModules:\s*\[\]/)
})

test('political student affairs faculty provides exactly the planned pages with a demo notice', async () => {
  const pages = (await readdir(new URL('pages/', facultyRoot))).filter((file) => file.endsWith('.html')).sort()

  assert.deepEqual(pages, expectedPages)
  for (const page of pages) {
    assert.match(await readFacultyFile(`pages/${page}`), new RegExp(demoNotice.replaceAll('/', '\\/')))
  }
})

test('political student affairs content does not retain dormitory or health-science links and copy', async () => {
  const sourceFiles = [
    'faculty.config.js',
    ...expectedPages.map((page) => `pages/${page}`),
    'components/header/header.html',
    'components/footer/footer.html',
  ]
  const source = (await Promise.all(sourceFiles.map(readFacultyFile))).join('\n')

  assert.doesNotMatch(source, /Ký túc xá|Khoa Khoa học Sức khỏe|kytucxa@|\/login\.html|\/tra-cuu\.html/i)
})

test('political student affairs header and footer only link to built HTML pages', async () => {
  const chrome = [
    await readFacultyFile('components/header/header.html'),
    await readFacultyFile('components/footer/footer.html'),
  ].join('\n')
  const builtRoutes = new Set(['/', ...expectedPages.filter((page) => page !== 'index.html').map((page) => `/${page}`)])
  const linkedRoutes = [...chrome.matchAll(/href="(\/[^"#?]*)"/g)].map((match) => match[1])

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
