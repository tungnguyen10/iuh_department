import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const facultyRoot = new URL('../src/faculties/mechanical-engineering/', import.meta.url)
const expectedPages = [
  'about.html',
  'contact.html',
  'document-detail.html',
  'form.html',
  'index.html',
  'leadership-detail.html',
  'leadership.html',
  'major-detail.html',
  'majors.html',
  'news-detail.html',
  'news.html',
  'partners.html',
  'students.html',
]
const readFacultyFile = (path) => readFile(new URL(path, facultyRoot), 'utf8')

const collectFiles = async (directory) => {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.isDirectory() ? `${entry.name}/` : entry.name, directory)
    if (entry.isDirectory()) files.push(...await collectFiles(url))
    else if (/\.(?:html|json|js)$/.test(entry.name)) files.push(url)
  }
  return files
}

test('mechanical-engineering faculty config exposes the selected-faculty contract', async () => {
  const config = await readFacultyFile('faculty.config.js')

  assert.match(config, /id:\s*["']mechanical-engineering["']/)
  assert.match(config, /name:\s*["']Khoa Công nghệ Cơ khí["']/)
  assert.match(config, /root:\s*["']src\/faculties\/mechanical-engineering["']/)
  assert.match(config, /search:\s*site\.search/)
  assert.match(config, /init: "initHeroCarousel"/)
})

test('mechanical-engineering faculty keeps the health-science page set', async () => {
  const pages = (await readdir(new URL('pages/', facultyRoot))).filter((file) => file.endsWith('.html')).sort()

  assert.deepEqual(pages, expectedPages)
})

test('mechanical-engineering identity points to the faculty office', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))

  assert.equal(site.identity.unitName, 'Khoa Công nghệ Cơ khí')
  assert.equal(site.identity.email, 'fme@iuh.edu.vn')
})

test('mechanical-engineering has no home menu item and no quiz', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))
  const majors = await readFacultyFile('pages/majors.html')

  assert.deepEqual(site.navigation.map((item) => item.text), [
    'GIỚI THIỆU', 'TỔ CHỨC', 'TUYỂN SINH', 'ĐÀO TẠO', 'NGHIÊN CỨU', 'HOẠT ĐỘNG', 'SINH VIÊN',
  ])
  assert.doesNotMatch(majors, /majorQuiz/)
  assert.doesNotMatch(majors, /major-list\.html|department-list\.html/)
})

test('mechanical-engineering breadcrumbs never repeat home and hide empty levels', async () => {
  for (const page of expectedPages.filter((file) => !['index.html', 'partners.html'].includes(file))) {
    const source = await readFacultyFile(`pages/${page}`)
    const crumbs = [...source.matchAll(/<div data-include="@shared\/components\/common\/breadcrumb\.html"([^>]*)>/g)]
    assert.equal(crumbs.length, 1, `${page} must have exactly one breadcrumb`)
    const attrs = Object.fromEntries([...crumbs[0][1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]))
    assert.ok(attrs['current-page'], `${page} needs a current page`)
    for (const level of ['1', '2']) {
      assert.notEqual(attrs[`parent-page${level}`], 'Trang chủ', `${page} repeats home`)
      assert.ok(`parent-page${level}-class` in attrs, `${page} must set parent-page${level}-class`)
      if (!attrs[`parent-page${level}`]) assert.match(attrs[`parent-page${level}-class`], /\bhidden\b/, `${page} shows an empty level ${level}`)
    }
  }
})

test('mechanical-engineering local images referenced by news exist', async () => {
  const news = JSON.parse(await readFacultyFile('data/news.json'))

  for (const item of news.items) {
    assert.match(item.image, /^\/assets\/images\//)
    await access(new URL(`assets${item.image.slice('/assets'.length)}`, facultyRoot))
  }
})

test('mechanical-engineering content does not retain health-science copy', async () => {
  for (const file of await collectFiles(facultyRoot)) {
    const source = await readFile(file, 'utf8')
    assert.doesNotMatch(source, /Khoa học Sức khỏe|Sức khoẻ|health-science|Điều dưỡng|Y học cổ truyền|bệnh viện/i, file.pathname)
  }
})
