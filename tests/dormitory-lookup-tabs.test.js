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

test('lookup page defaults to the lookup tab and exposes the current lookup panels', async () => {
  const page = await readSource('src/faculties/dormitory-management/pages/tra-cuu.html')

  for (const tab of ['lookup', 'attendance', 'discipline', 'utilities', 'stay-history']) {
    assert.match(page, new RegExp(`data-tab="${tab}"`))
    assert.match(page, new RegExp(`data-tab-panel="${tab}"`))
  }

  assert.match(page, /class="tab-btn active" data-tab="lookup"/)
  assert.match(page, /data-tab-panel="discipline"[\s\S]*Chưa có thông tin kỷ luật/)
  assert.doesNotMatch(page, /data-tab="reward"|data-tab-panel="reward"|khen thưởng/)
  assert.match(page, /data-tab-panel="utilities"[\s\S]*electricity-water\/index\.html/)
})

test('electricity-water lookup panel merges electric and water entry into one card and covers all round states', async () => {
  const utilities = await readSource('src/faculties/dormitory-management/components/lookup/electricity-water/index.html')

  for (const state of ['no_round', 'open', 'pending', 'confirmed']) {
    assert.match(utilities, new RegExp(`data-utilities-state="${state}"`))
  }

  // One merged entry-card per state, not two side-by-side cards.
  assert.match(utilities, /Lưu chỉ số điện & nước/)
  assert.doesNotMatch(utilities, /iuh-utilities__entry-grid/)

  assert.match(utilities, /Danh sách chỉ số điện nước hàng tháng/)

  for (const column of ['Đợt', 'Định mức điện', 'Chỉ số điện cũ', 'Chỉ số điện mới', 'Định mức nước', 'Chỉ số nước cũ', 'Chỉ số nước mới', 'Tổng tiền', 'Thao tác']) {
    assert.match(utilities, new RegExp(column))
  }

  assert.match(utilities, /disabled/)
  assert.match(utilities, /Xem[\s\S]*Sửa[\s\S]*Biên lai/)
})

test('KTX history contains occupancy and registration history tables', async () => {
  const history = await readSource('src/faculties/dormitory-management/components/lookup/stay-history/index.html')

  assert.match(history, /Từ 24-07-2026 đến Hiện nay/)
  assert.match(history, /Lịch sử đăng ký/)
  assert.match(history, /KTX Năm học 2026-2027 \(Đợt 2\)/)
  assert.match(history, /Đã xếp phòng/)
})
