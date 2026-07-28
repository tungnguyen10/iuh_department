import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('lookup profile groups identity fields into a responsive two-column grid', async () => {
  const profile = await readSource('src/faculties/dormitory-management/components/lookup/profile-panel/index.html')
  const styles = await readSource('src/faculties/dormitory-management/components/lookup/lookup.scss')

  assert.match(profile, /iuh-lookup-panel__identity-grid/)
  assert.match(profile, /data-label="Tình trạng"[\s\S]*data-row-class="iuh-lookup-panel__full-row"/)
  assert.match(styles, /\.iuh-lookup-panel__identity-grid[\s\S]*md:grid-cols-2/)
})

test('lookup page defaults to the KTX history tab and supplies empty tab panels', async () => {
  const page = await readSource('src/faculties/dormitory-management/pages/tra-cuu.html')

  for (const tab of ['attendance', 'discipline', 'commendation', 'stay-history']) {
    assert.match(page, new RegExp(`data-tab="${tab}"`))
    assert.match(page, new RegExp(`data-tab-panel="${tab}"`))
  }

  assert.match(page, /class="tab-btn active[^"]*"[\s\S]*data-tab="stay-history"/)
  assert.equal((page.match(/Chưa có dữ liệu/g) ?? []).length, 3)
})

test('KTX history contains occupancy and registration history tables', async () => {
  const history = await readSource('src/faculties/dormitory-management/components/lookup/stay-history/index.html')

  assert.match(history, /Từ 24-07-2026 đến Hiện nay/)
  assert.match(history, /Lịch sử đăng ký/)
  assert.match(history, /KTX Năm học 2026-2027 \(Đợt 2\)/)
  assert.match(history, /Đã xếp phòng/)
})
