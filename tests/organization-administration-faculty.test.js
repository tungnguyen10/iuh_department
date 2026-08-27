import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const facultyRoot = new URL('../src/faculties/organization-administration/', import.meta.url)
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

test('organization administration faculty exposes the selected-faculty contract', async () => {
  const config = await readFacultyFile('faculty.config.js')

  assert.match(config, /id:\s*["']organization-administration["']/)
  assert.match(config, /name:\s*["']Phòng Tổ chức – Hành chính["']/)
  assert.match(config, /root:\s*["']src\/faculties\/organization-administration["']/)
  assert.match(config, /runtimeModules:\s*\[\]/)
})

test('organization administration faculty provides eight clean pages', async () => {
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
  assert.doesNotMatch(source, /sinh-vien|học bổng|BHYT|ĐRL|điểm rèn luyện|thực tập|tuyển dụng/i)
})

test('organization administration data is valid and routes only to built pages', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))
  const news = JSON.parse(await readFacultyFile('data/news.json'))
  const search = JSON.parse(await readFacultyFile('data/search-data.json'))
  const builtRoutes = new Set(['/', ...expectedPages.filter((page) => page !== 'index.html').map((page) => `/${page}`)])
  const linkedRoutes = JSON.stringify(site).match(/"href":"(\/[^"#?]*)"/g) ?? []

  assert.equal(site.identity.unitName, 'Phòng Tổ chức – Hành chính')
  assert.equal(news.items.length, 4)
  assert.ok(news.items.every((item) => item.slug && item.title && item.excerpt && item.content.length > 0))
  assert.ok(search.length >= expectedPages.length + news.items.length)
  for (const link of linkedRoutes) assert.ok(builtRoutes.has(link.match(/"(\/[^"#?]*)"/)[1]))
})
