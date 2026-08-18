import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const repoRoot = new URL('../', import.meta.url)
const facultyIds = ['health-science', 'dormitory-management', 'political-student-affairs']
const canonicalBodyHash = 'eefd8a0a0ad11cf3f3c432471a372bcb3a51f7a0bdb68556b4160aa7939fcb60'
const imageHashes = [
  'a974527c59f5f776669508aaba96c35246ad50589f8dc2aa0add78e446cfeeee',
  '66918f7c7aed99fbf61cdd89515423b04c1f1b66e53cdf88b2ea1c1e3e1c38ef',
  'ca677f21c3421589652ed41c935ecde87549867191940a8ae321bad69ffb9ab1',
  'ac91b626a33b7daca17316a0693a568dde4c44bad1e8e8f8005a4c40652216b2',
  'ded186ea45f6e294cd7d328788ad5e2df2f3efd6a15ca109128be1dc7e14e4d7',
  '7b2d7e3f4cc372164736ec5654eb56fadf28a7222cb5de80cb4159cdf57ea6a3',
]
const wrapper = `<!-- LAYOUT: title="Đối tác hợp tác" -->
<!-- LAYOUT: description="Danh sách các đối tác chiến lược, công ty công nghệ và doanh nghiệp hợp tác cùng Khoa Khoa học Sức khỏe - Trường Đại học Công nghiệp TP.HCM." -->
<!-- LAYOUT: keywords="đối tác, hợp tác doanh nghiệp, công ty đối tác, IUH partners, đại học công nghiệp" -->
<!-- LAYOUT: url="https://iuh.edu.vn/partners" -->
<!-- LAYOUT: ogImage="/assets/images/default.jpg" -->

<div data-include="@shared/components/partners/page.html"></div>
`

const pathUrl = (path) => new URL(path, repoRoot)
const sha256 = (value) => createHash('sha256').update(value).digest('hex')

test('all faculty homepages and partner routes delegate to shared canonical partners', async () => {
  for (const facultyId of facultyIds) {
    const [home, partners] = await Promise.all([
      readFile(pathUrl(`src/faculties/${facultyId}/pages/index.html`), 'utf8'),
      readFile(pathUrl(`src/faculties/${facultyId}/pages/partners.html`), 'utf8'),
    ])

    assert.match(home, /data-include="@shared\/components\/partners\/index\.html"/)
    assert.doesNotMatch(home, /@faculty\/components\/home\/partners/)
    assert.equal(partners, wrapper)
  }

  assert.equal(existsSync(pathUrl('src/faculties/dormitory-management/components/home/partners')), false)
})

test('no faculty page references the removed dormitory partners component', async () => {
  for (const facultyId of facultyIds) {
    const pagesRoot = pathUrl(`src/faculties/${facultyId}/pages/`)
    for (const page of (await readdir(pagesRoot)).filter((file) => file.endsWith('.html'))) {
      assert.doesNotMatch(
        await readFile(new URL(page, pagesRoot), 'utf8'),
        /@faculty\/components\/home\/partners/,
        `${facultyId}/${page}`,
      )
    }
  }
})

test('shared partners page preserves the complete Health Science body', async () => {
  const body = (await readFile(pathUrl('src/shared/components/partners/page.html'), 'utf8')).trim()

  assert.equal(sha256(body), canonicalBodyHash)
  assert.match(body, /\/assets\/documents\/partnership-info\.pdf/)
  assert.equal([...body.matchAll(/partner-[1-6]\.jpg/g)].length > 0, true)
})

test('canonical partner images exist only in shared assets', async () => {
  const sharedDirectory = pathUrl('src/shared/assets/images/partners/')
  const images = (await readdir(sharedDirectory)).filter((file) => /^partner-[1-6]\.jpg$/.test(file)).sort()
  assert.deepEqual(images, imageHashes.map((_, index) => `partner-${index + 1}.jpg`))

  for (const [index, image] of images.entries()) {
    assert.equal(sha256(await readFile(new URL(image, sharedDirectory))), imageHashes[index])
  }

  for (const facultyId of ['health-science', 'dormitory-management']) {
    for (const image of images) {
      assert.equal(existsSync(pathUrl(`src/faculties/${facultyId}/assets/images/partners/${image}`)), false)
    }
  }
})

test('department site chrome exposes the shared partners route', async () => {
  for (const facultyId of ['dormitory-management', 'political-student-affairs']) {
    const site = JSON.parse(await readFile(pathUrl(`src/faculties/${facultyId}/data/site.json`), 'utf8'))
    assert.deepEqual(
      site.navigation.slice(-2),
      [{ text: 'ĐỐI TÁC', href: '/partners.html' }, { text: 'LIÊN HỆ', href: '/contact.html' }],
    )
    assert.ok(site.footer.columns.some((column) => column.links.some((link) => link.text === 'Đối tác hợp tác' && link.href === '/partners.html')))
    assert.ok(site.search.quickLinks.some((link) => link.text === 'Đối tác hợp tác' && link.href === '/partners.html'))
  }
})
