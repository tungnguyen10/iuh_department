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

test('organization administration retained pages use the approved vocabulary', async () => {
  const [about, leadership, detail, contact, news, newsDetail] = await Promise.all([
    readFacultyFile('pages/about.html'),
    readFacultyFile('pages/leadership.html'),
    readFacultyFile('pages/leadership-detail.html'),
    readFacultyFile('pages/contact.html'),
    readFacultyFile('pages/news.html'),
    readFacultyFile('pages/news-detail.html'),
  ])

  assert.match(about, /href=["']\/functions-duties\.html["']/)
  assert.match(about, />Xem chức năng – nhiệm vụ<\/a>/)
  assert.match(about, /href=["']\/contact\.html["']/)
  assert.equal((about.match(/<section\b/g) ?? []).length, 2)
  for (const label of ['Tổ chức – Cán bộ', 'Hành chính – Tổng hợp', 'Văn thư – Lưu trữ', 'Chính sách – Thi đua', 'Lễ tân – Khánh tiết']) {
    for (const page of [about, leadership, detail, contact]) assert.ok(page.includes(label), `missing ${label}`)
  }
  assert.equal((leadership.match(/@shared\/components\/leadership\/leader-board\.html/g) ?? []).length, 3)
  assert.match(detail, /data-leader-detail/)
  assert.match(detail, /data-leader-name/)
  assert.match(detail, /href=["']\/functions-duties\.html["']/)
  assert.match(news, /Tin tức – Thông báo/)
  assert.match(newsDetail, /Tin tức – Thông báo/)
  assert.doesNotMatch(`${about}\n${leadership}\n${detail}\n${contact}`, /tư tưởng|truyền thông|kết nối nguồn lực|nguồn lực hỗ trợ/i)
})

test('organization administration contact routes to exactly the five approved areas', async () => {
  const contact = await readFacultyFile('pages/contact.html')
  const options = [...contact.matchAll(/data-option\d+-value="([^"]+)" data-option\d+-text="([^"]+)"/g)]

  assert.deepEqual(options.map(([, value, label]) => [value, label]), [
    ['organization-personnel', 'Tổ chức – Cán bộ'],
    ['administration-general', 'Hành chính – Tổng hợp'],
    ['records-archives', 'Văn thư – Lưu trữ'],
    ['policy-emulation', 'Chính sách – Thi đua'],
    ['reception-protocol', 'Lễ tân – Khánh tiết'],
  ])
  assert.match(contact, /ptchc@iuh\.edu\.vn/)
  assert.match(contact, /0283 8940 390 - 100/)
  assert.match(contact, /Nhà E - 12 Nguyễn Văn Bảo/)
  assert.match(contact, /<form[^>]+action="mailto:ptchc@iuh\.edu\.vn" method="post" enctype="text\/plain"/)
})

test('organization administration news metadata and navigation use the en-dash label', async () => {
  const [news, detail] = await Promise.all([
    readFacultyFile('pages/news.html'),
    readFacultyFile('pages/news-detail.html'),
  ])

  assert.match(news, /LAYOUT: title="Tin tức – Thông báo"/)
  assert.match(news, /data-current-page="Tin tức – Thông báo"/)
  assert.match(news, /data-title="Tin tức – Thông báo"/)
  assert.match(detail, /data-parent-page1="Tin tức – Thông báo" data-parent-link1="\/news\.html"/)
  assert.doesNotMatch(`${news}\n${detail}`, /tin tức và thông báo/i)
})

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
  assert.doesNotMatch(source, /minh họa|example@iuh\.edu\.vn|0000 0000/i)
})

test('organization administration data is valid and routes only to built pages', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))
  const news = JSON.parse(await readFacultyFile('data/news.json'))
  const search = JSON.parse(await readFacultyFile('data/search-data.json'))
  const builtRoutes = new Set(['/', ...expectedPages.filter((page) => page !== 'index.html').map((page) => `/${page}`)])
  const linkedRoutes = JSON.stringify(site).match(/"href":"(\/[^"#?]*)"/g) ?? []

  assert.equal(site.identity.unitName, 'Phòng Tổ chức – Hành chính')
  assert.equal(site.identity.email, 'ptchc@iuh.edu.vn')
  assert.deepEqual(site.identity.phone, { text: '0283 8940 390 - 100', href: '02838940390' })
  assert.match(site.identity.address, /Nhà E/)
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
  assert.match(documentsPage, /Cổng E-Office IUH/)
  assert.doesNotMatch(documentsPage, /href=[\"']#[\"']/)
  assert.match(recruitmentPage, /Tuyển dụng IUH/)
  assert.doesNotMatch(`${functionsPage}\n${documentsPage}\n${recruitmentPage}`, /minh họa|đang cập nhật/i)
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
  const recruitmentLinks = noticeHub.match(/href=["']\/recruitment\.html["']/g) ?? []
  assert.equal(recruitmentLinks.length, 4, 'all three recruitment rows and the footer link to recruitment')
  assert.match(noticeHub, /Thông tin tuyển dụng/)

  const formRows = noticeHub.split('<div class="grid grid-cols-[1fr_auto]').slice(1)
  assert.equal(formRows.length, 12, 'every visible and filtered form row is represented')
  assert.equal((noticeHub.match(/href=["']\/documents-forms\.html["']/g) ?? []).length, 13)
  assert.equal((noticeHub.match(/>Xem<\/span>/g) ?? []).length, 12)
})

test('organization administration leadership uses published IUH personnel', async () => {
  const [leadership, detail] = await Promise.all([
    readFacultyFile('pages/leadership.html'),
    readFacultyFile('pages/leadership-detail.html'),
  ])

  for (const name of ['Phạm Trung Kiên', 'Nguyễn Thị Thu Hà', 'Đỗ Khoa Thúy Kha']) {
    assert.match(leadership, new RegExp(name))
  }
  assert.match(detail, /Phạm Trung Kiên/)
  assert.match(`${leadership}\n${detail}`, /ptchc@iuh\.edu\.vn/)
})
