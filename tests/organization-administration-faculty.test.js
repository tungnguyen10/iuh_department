import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'

const facultyRoot = new URL('../src/faculties/organization-administration/', import.meta.url)
const expectedPages = [
  'about.html',
  'contact.html',
  'document-detail.html',
  'documents-forms.html',
  'functions-duties.html',
  'index.html',
  'leadership-detail.html',
  'leadership.html',
  'news-detail.html',
  'news.html',
  'partners.html',
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
  assert.match(config, /components\/documents\/document-library\.js/)
  assert.doesNotMatch(config, /weekly-calendar|Weekly Calendar/)
})

test('weekly calendar is shared and no longer used by organization administration', async () => {
  const [sharedConfig, sharedCalendar, sharedCalendarRuntime, facultyIndex, staffServices] = await Promise.all([
    readFile(new URL('../src/shared/shared.config.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/shared/components/calendar/weekly-calendar.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/shared/components/calendar/weekly-calendar.js', import.meta.url), 'utf8'),
    readFacultyFile('pages/index.html'),
    readFacultyFile('components/home/staff-services/index.html'),
  ])

  assert.match(sharedConfig, /selector:\s*['"]\[data-weekly-calendar\]['"]/)
  assert.match(sharedCalendar, /data-weekly-calendar/)
  assert.match(sharedCalendarRuntime, /export const initWeeklyCalendar/)
  assert.doesNotMatch(`${facultyIndex}\n${staffServices}`, /data-weekly-calendar|weekly-schedule|Lịch công tác/)
})

test('organization administration activity gallery uses the five newest PTCHC posts', async () => {
  const gallery = await readFacultyFile('components/home/activity-gallery/index.html')
  const expectedCards = [
    {
      image: '/assets/images/activity-khai-giang-2020-2021.jpg',
      title: 'IUH long trọng tổ chức Lễ Khai giảng năm học 2020-2021',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/iuh-long-trong-to-chuc-le-khai-giang-nam-hoc-2020-2021/',
    },
    {
      image: '/assets/images/activity-dai-hoi-dang-bo-2020-2025.jpg',
      title: 'Đại hội Đại biểu Đảng bộ Trường Đại học Công nghiệp Thành phố Hồ Chí Minh lần thứ XIII, nhiệm kỳ 2020 – 2025: Dân chủ – Sáng tạo – Đoàn kết – Hội nhập',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/dai-hoi-dai-bieu-dang-bo-truong-dai-hoc-cong-nghiep-thanh-pho-ho-chi-minh-lan-thu-xiii-nhiem-ky-2020-2025-dan-chu-sang-tao-doan-ket-hoi-nhap-2/',
    },
    {
      image: '/assets/images/activity-bo-nhiem-hieu-truong.jpg',
      title: 'Lễ công bố quyết định bổ nhiệm và bàn giao chức vụ Hiệu trưởng IUH',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/le-cong-bo-quyet-dinh-bo-nhiem-va-ban-giao-chuc-vu-hieu-truong-iuh-2/',
    },
    {
      image: '/assets/images/activity-hoi-nghi-can-bo-vien-chuc-2020.jpg',
      title: 'Hội nghị cán bộ – viên chức IUH năm 2020',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/hoi-nghi-can-bo-vien-chuc-iuh-nam-2020-2/',
    },
    {
      image: '/assets/images/activity-bo-nhiem-giao-su-khen-thuong-2019.jpg',
      title: 'Lễ công bố quyết định bổ nhiệm chức danh giáo sư, phó giáo sư và trao Huân chương Lao động, Bằng khen của Thủ tướng Chính phủ năm 2019',
      link: 'https://ptchc.iuh.edu.vn/hinh-anh-hoat-dong/le-cong-bo-quyet-dinh-bo-nhiem-chuc-danh-giao-su-pho-giao-su-va-trao-huan-chuong-lao-dong-bang-khen-cua-thu-tuong-chinh-phu-nam-2019-2/',
    },
  ]
  const cards = [...gallery.matchAll(/data-image="([^"]+)"\s+data-alt="([^"]+)"\s+data-title="([^"]+)"\s+data-link="([^"]+)"/g)]

  assert.equal(cards.length, 5)
  assert.deepEqual(
    cards.map(([, image, alt, title, link]) => ({ image, alt, title, link })),
    expectedCards.map(({ image, title, link }) => ({ image, alt: title, title, link })),
  )
  assert.doesNotMatch(gallery, /default\.jpg/)

  for (const { image } of expectedCards) {
    const asset = await readFile(new URL(`assets/images/${image.split('/').at(-1)}`, facultyRoot))
    assert.ok(asset.length > 0, `${image} must be a non-empty local image`)
  }
})

test('organization administration faculty provides the expected clean pages', async () => {
  const pages = (await readdir(new URL('pages/', facultyRoot))).filter((file) => file.endsWith('.html')).sort()

  assert.deepEqual(pages, expectedPages)
  for (const page of pages) {
    assert.doesNotMatch(await readFacultyFile(`pages/${page}`), /Công tác chính trị|Hỗ trợ sinh viên|political-student-affairs/)
  }
})

test('organization administration pages end with the shared partners section before the footer', async () => {
  const contentPages = expectedPages.filter((page) => page !== 'partners.html')

  for (const page of contentPages) {
    const source = await readFacultyFile(`pages/${page}`)
    const includes = [...source.matchAll(/data-include="([^"]+)"/g)].map((match) => match[1])
    const partnersInclude = '<div data-include="@shared/components/partners/index.html" data-class="nttFade"></div>'

    assert.equal(
      includes.at(-1),
      '@shared/components/partners/index.html',
      `${page} must end with the compact partners include`,
    )
    assert.equal(
      includes.filter((include) => include === '@shared/components/partners/index.html').length,
      1,
      `${page} must include the compact partners section exactly once`,
    )
    assert.ok(source.trimEnd().endsWith(partnersInclude), `${page} must place partners after all page content`)
  }

  const partnersPage = await readFacultyFile('pages/partners.html')
  assert.match(partnersPage, /data-include="@shared\/components\/partners\/page\.html"/)

  const sharedPartnersPage = await readFile(
    new URL('../src/shared/components/partners/page.html', import.meta.url),
    'utf8',
  )
  const sharedIncludes = [...sharedPartnersPage.matchAll(/data-include="([^"]+)"/g)].map((match) => match[1])
  assert.equal(sharedIncludes.at(-1), '@shared/components/partners/index.html')
  assert.ok(
    sharedPartnersPage.trimEnd().endsWith('<div data-include="@shared/components/partners/index.html"></div>'),
    'the dedicated partners page must also end with the compact partners section',
  )
})

test('organization administration source does not retain the sample faculty identity', async () => {
  const sourceFiles = await readdir(facultyRoot, { recursive: true })
  const source = (await Promise.all(
    sourceFiles
      .filter((file) => /\.(html|js|json)$/.test(file))
      .map((file) => readFacultyFile(file))
  )).join('\n')

  assert.doesNotMatch(source, /political-student-affairs|Công tác chính trị|Hỗ trợ sinh viên|dormitory-management/i)
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
  assert.equal(news.items.length, 10)
  assert.ok(news.items.every((item) => item.slug && item.title && item.excerpt && item.content.length > 0))
  assert.equal(news.items.filter(({ kind }) => kind === 'news').length, 6)
  assert.equal(news.items.filter(({ kind }) => kind === 'appointment').length, 4)
  assert.equal(new Set(news.items.map(({ slug }) => slug)).size, news.items.length)
  assert.ok(news.items.every((item) => item.sourceName && /^https:\/\//.test(item.sourceUrl)))
  assert.ok(news.items.filter(({ kind }) => kind === 'appointment').every((item) => item.appointmentType))
  for (const { image } of news.items) {
    assert.match(image, /^\/assets\/images\/(?:news|appointment)-/)
    const asset = await readFile(new URL(`assets/images/${image.split('/').at(-1)}`, facultyRoot))
    assert.ok(asset.length > 0, `${image} must be a non-empty local image`)
  }
  assert.ok(search.length >= expectedPages.length + news.items.length)
  assert.ok(search.some(({ url }) => url === '/document-detail.html'))
  for (const link of linkedRoutes) assert.ok(builtRoutes.has(link.match(/"(\/[^"#?]*)"/)[1]))
})

test('organization administration adds focused pages for index destinations', async () => {
  const [functionsPage, documentsPage] = await Promise.all([
    readFacultyFile('pages/functions-duties.html'),
    readFacultyFile('pages/documents-forms.html'),
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
  assert.doesNotMatch(`${functionsPage}\n${documentsPage}`, /minh họa|đang cập nhật/i)
})

test('organization administration chrome follows the index information architecture', async () => {
  const site = JSON.parse(await readFacultyFile('data/site.json'))

  assert.deepEqual(site.navigation.map(({ text }) => text), [
    'GIỚI THIỆU',
    'LĨNH VỰC PHỤ TRÁCH',
    'TIN TỨC – THÔNG BÁO',
    'VĂN BẢN – BIỂU MẪU',
  ])
  assert.deepEqual(site.navigation[0].children.map(({ href }) => href), [
    '/about.html',
    '/functions-duties.html',
    '/leadership.html',
  ])
  assert.deepEqual(site.navigation[1].children.map(({ href }) => href), [
    '/functions-duties.html#organization-personnel',
    '/functions-duties.html#administration-general',
    '/functions-duties.html#records-archives',
    '/functions-duties.html#policy-emulation',
    '/functions-duties.html#reception-protocol',
  ])
  assert.ok(site.footer.columns.flatMap(({ links }) => links).some(({ href }) => href === '/partners.html'))
  assert.ok(site.search.quickLinks.some(({ href }) => href === '/documents-forms.html'))
})

test('organization administration index modules link to focused destinations', async () => {
  const [facultyIndex, stats, staffServices, noticeHub, workUpdates] = await Promise.all([
    readFacultyFile('pages/index.html'),
    readFacultyFile('components/home/stats/index.html'),
    readFacultyFile('components/home/staff-services/index.html'),
    readFacultyFile('components/home/notice-hub/index.html'),
    readFacultyFile('components/home/work-updates/index.html'),
  ])

  assert.doesNotMatch(`${facultyIndex}\n${stats}\n${staffServices}`, /Tôi cần\.\.\./)
  assert.match(facultyIndex, /components\/home\/stats\/index\.html/)
  assert.doesNotMatch(facultyIndex, /components\/home\/staff-services\/index\.html/)
  assert.match(stats, /components\/home\/staff-services\/index\.html/)
  assert.ok(
    stats.indexOf('components/home/staff-services/index.html') < stats.indexOf('components/home/stats/stat-item.html'),
    'staff services should render above the stats grid',
  )
  assert.match(stats, /components\/home\/stats\/stat-item\.html/)
  assert.doesNotMatch(stats, /@shared\/components\/stats\/stats-card\.html|default\.jpg|banner\.jpg/)
  assert.match(staffServices, /Hệ thống dành cho cán bộ, viên chức/)
  assert.match(staffServices, /data-url=["']\/documents-forms\.html["']/)
  assert.doesNotMatch(staffServices, /weekly-schedule|Lịch công tác/)
  assert.match(staffServices, /lg:grid-cols-3/)

  assert.match(workUpdates, /Công tác cán bộ/)
  assert.match(workUpdates, /data-news-appointment-section data-limit="10"/)
  assert.match(workUpdates, /lg:grid-cols-\[minmax\(0,5fr\)_minmax\(0,7fr\)\]/)
  assert.doesNotMatch(workUpdates, /weekly-calendar|Tuần này tại IUH/)

  assert.match(noticeHub, /data-url=["']\/documents-forms\.html["']/)
  assert.doesNotMatch(noticeHub, /recruitment\.html/)

  // Form categories are rendered via form-link-item.html includes, one data-title per category.
  const formLinks = [...noticeHub.matchAll(/data-include="@faculty\/components\/home\/notice-hub\/form-link-item\.html"[^>]*data-title="([^"]+)"/g)]
  for (const category of [
    'Quản lý cấp phòng', 'Đi nước ngoài', 'Bảo hiểm xã hội',
    'Chế độ - Chính sách', 'Đào tạo - Bồi dưỡng', 'Nâng bậc lương',
  ]) {
    assert.equal(formLinks.filter(([, title]) => title === category).length, 1,
      `${category} must be directly accessible without switching tabs`)
  }
  assert.doesNotMatch(noticeHub, /tab-panel|data-tab=/)
  for (const title of [
    'Thông báo tuyển dụng viên chức',
    'Hướng dẫn chuẩn bị hồ sơ dự tuyển',
    'Tiếp nhận và theo dõi hồ sơ',
  ]) assert.ok(noticeHub.includes(title), `preserve recruitment content: ${title}`)
})

test('organization administration leadership uses published IUH personnel', async () => {
  const [leadership, detail, staffList, leaderCard] = await Promise.all([
    readFacultyFile('pages/leadership.html'),
    readFacultyFile('pages/leadership-detail.html'),
    readFacultyFile('components/leadership/staff-list.html'),
    readFile(new URL('../src/shared/components/leadership/leader-card.html', import.meta.url), 'utf8'),
  ])

  for (const name of ['Phạm Trung Kiên', 'Nguyễn Thị Thu Hà', 'Đỗ Khoa Thúy Kha']) {
    assert.match(leadership, new RegExp(name))
  }
  assert.equal((leadership.match(/@shared\/components\/leadership\/leader-board\.html/g) ?? []).length, 0)
  assert.equal((leadership.match(/data-work-area=/g) ?? []).length, 3)
  assert.equal((leadership.match(/data-leader-level/g) ?? []).length, 2)
  assert.equal((leadership.match(/data-leader-node/g) ?? []).length, 3)
  assert.match(leadership, /xl:grid-cols-2/)
  assert.match(leadership, /@shared\/components\/leadership\/leader-work-panel\.html/)
  assert.match(leadership, /@faculty\/components\/leadership\/staff-list\.html/)
  for (const email of ['phamtrungkien@iuh.edu.vn', 'hanguyen@iuh.edu.vn', 'dokhoathuykha@iuh.edu.vn']) {
    assert.match(leadership, new RegExp(email.replace('.', '\\.')))
  }
  assert.doesNotMatch(leadership, /Trần Văn Nam|Lê Thị Hồng|Phạm Quốc Bảo|Nguyễn Hoàng An/)
  assert.match(detail, /Phạm Trung Kiên/)
  assert.match(`${leadership}\n${detail}`, /ptchc@iuh\.edu\.vn/)

  assert.equal((staffList.match(/@shared\/components\/leadership\/leader-card\.html/g) ?? []).length, 16)
  assert.equal((staffList.match(/data-social-class="hidden"/g) ?? []).length, 16)
  assert.equal((staffList.match(/data-link-class="hidden"/g) ?? []).length, 16)
  assert.equal((staffList.match(/data-image="\/assets\/images\/staff-/g) ?? []).length, 14)
  for (const group of [
    'Tổ Hành chính – Tổng hợp',
    'Tổng Chế độ – Chính sách',
    'Tổ Lưu trữ hồ sơ CB-VC',
    'Tổ Thanh tra – Pháp chế',
    'Tổ Lái xe',
    'Tổ Vệ sinh – Dịch vụ',
  ]) assert.match(staffList, new RegExp(group))
  for (const name of [
    'Nguyễn Thị Duy Anh', 'Nguyễn Thị Cúc', 'Nguyễn Thị Tuyền', 'Lê Thị Thanh Hoa', 'Nguyễn Thị Hạnh Uyên',
    'Đặng Tiểu Mỹ', 'Ông Mỹ Linh', 'Nguyễn Thị Thúy Hiền', 'Nguyễn Thị Thu Hằng',
    'Đào Thị Hồng Hạnh', 'Trần Thắng Lợi', 'Lê Nguyễn Thanh Trúc', 'Lê Thanh Bình',
    'Phan Hoài Hận', 'Nguyễn Thị Bích Liễu', 'Nguyễn Thị Thu',
  ]) assert.match(staffList, new RegExp(name))
  assert.match(staffList, /nguyenthituyen@iuh\.edu\.vn/)
  assert.match(leaderCard, /\{\{socialClass\}\}/)
  assert.match(leaderCard, /\{\{linkClass\}\}/)
  assert.match(leaderCard, /\{\{emailClass\}\}/)
})
