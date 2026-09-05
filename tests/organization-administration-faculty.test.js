import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const facultyRoot = new URL('../src/faculties/organization-administration/', import.meta.url)
const expectedPages = [
  'about.html',
  'contact.html',
  'documents-forms.html',
  'functions-duties.html',
  'index.html',
  'leadership-detail.html',
  'leadership.html',
  'news-detail.html',
  'news.html',
  'partners.html',
  'recruitment.html',
]

const readFacultyFile = (path) => readFile(new URL(path, facultyRoot), 'utf8')

test('organization administration faculty exposes the selected-faculty contract', async () => {
  const config = await readFacultyFile('faculty.config.js')

  assert.match(config, /id:\s*["']organization-administration["']/)
  assert.match(config, /name:\s*["']Phòng Tổ chức – Hành chính["']/)
  assert.match(config, /root:\s*["']src\/faculties\/organization-administration["']/)
  assert.match(config, /components\/home\/carousel\/carousel\.js/)
  assert.match(config, /components\/home\/activity-gallery\/gallery\.js/)
})

test('organization administration faculty provides eleven clean pages', async () => {
  const pages = (await readdir(new URL('pages/', facultyRoot))).filter((file) => file.endsWith('.html')).sort()

  assert.deepEqual(pages, expectedPages)
  for (const page of pages) {
    assert.doesNotMatch(await readFacultyFile(`pages/${page}`), /Công tác chính trị|Hỗ trợ sinh viên|political-student-affairs/)
  }
})

test('organization administration source does not retain the sample faculty identity', async () => {
  const sourceFiles = await readdir(facultyRoot, { recursive: true })
  const source = (await Promise.all(
    sourceFiles
      .filter((file) => /\.(html|js|json)$/.test(file))
      .map((file) => readFacultyFile(file))
  )).join('\n')

  assert.doesNotMatch(source, /political-student-affairs|Công tác chính trị|Hỗ trợ sinh viên|dormitory-management/i)
  assert.doesNotMatch(source, /sinh-vien|học bổng|BHYT|ĐRL|điểm rèn luyện|thực tập/i)
})

test('organization administration data is valid and routes only to built pages', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))
  const news = JSON.parse(await readFacultyFile('data/news.json'))
  const search = JSON.parse(await readFacultyFile('data/search-data.json'))
  const builtRoutes = new Set(['/', ...expectedPages.filter((page) => page !== 'index.html').map((page) => `/${page}`)])
  const linkedRoutes = JSON.stringify(site).match(/"href":"(\/[^"#?]*)"/g) ?? []

  assert.equal(site.identity.unitName, 'Phòng Tổ chức – Hành chính')
  assert.equal(news.items.length, 6)
  assert.ok(news.items.every((item) => item.slug && item.title && item.excerpt && item.content.length > 0))
  assert.ok(search.length >= 12)
  for (const link of linkedRoutes) assert.ok(builtRoutes.has(link.match(/"(\/[^"#?]*)"/)[1]))
})

test('organization administration adds focused pages for index destinations', async () => {
  const [functionsPage, documentsPage, recruitmentPage] = await Promise.all([
    readFacultyFile('pages/functions-duties.html'),
    readFacultyFile('pages/documents-forms.html'),
    readFacultyFile('pages/recruitment.html'),
  ])

  for (const id of [
    'organization-personnel',
    'administration-general',
    'records-archives',
    'policy-emulation',
    'reception-protocol',
  ]) assert.match(functionsPage, new RegExp(`id=[\"']${id}[\"']`))

  assert.match(documentsPage, /Văn bản – Biểu mẫu/)
  assert.match(documentsPage, /Đang cập nhật/)
  assert.doesNotMatch(documentsPage, /href=[\"']#[\"']/)
  assert.match(recruitmentPage, /Tuyển dụng IUH/)
})

test('organization administration chrome follows the index information architecture', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))

  assert.deepEqual(site.navigation.map(({ text }) => text), [
    'TRANG CHỦ',
    'GIỚI THIỆU',
    'LĨNH VỰC PHỤ TRÁCH',
    'TIN TỨC – THÔNG BÁO',
    'VĂN BẢN – BIỂU MẪU',
    'TUYỂN DỤNG',
    'LIÊN HỆ',
  ])
  assert.deepEqual(site.navigation[1].children.map(({ href }) => href), [
    '/about.html',
    '/functions-duties.html',
    '/leadership.html',
  ])
  assert.deepEqual(site.navigation[2].children.map(({ href }) => href), [
    '/functions-duties.html#organization-personnel',
    '/functions-duties.html#administration-general',
    '/functions-duties.html#records-archives',
    '/functions-duties.html#policy-emulation',
    '/functions-duties.html#reception-protocol',
  ])
  assert.ok(site.footer.columns.flatMap(({ links }) => links).some(({ href }) => href === '/partners.html'))
  assert.ok(site.search.quickLinks.some(({ href }) => href === '/documents-forms.html'))
  assert.ok(site.search.quickLinks.some(({ href }) => href === '/recruitment.html'))
})

test('organization administration index modules link to focused destinations', async () => {
  const [responsibilities, noticeHub] = await Promise.all([
    readFacultyFile('components/home/responsibility-areas/index.html'),
    readFacultyFile('components/home/notice-hub/index.html'),
  ])

  for (const id of [
    'organization-personnel',
    'administration-general',
    'records-archives',
    'policy-emulation',
    'reception-protocol',
  ]) assert.match(responsibilities, new RegExp(`href=["']/functions-duties\\.html#${id}["']`))

  assert.match(noticeHub, /href=["']\/documents-forms\.html["']/)
  assert.match(noticeHub, /href=["']\/recruitment\.html["']/)
  assert.doesNotMatch(noticeHub, /<a[^>]*href=["']\/contact\.html["'][^>]*aria-label=["']Tải xuống/)
})
