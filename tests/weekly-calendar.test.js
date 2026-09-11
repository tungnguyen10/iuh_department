import assert from 'node:assert/strict'
import test from 'node:test'
import { addScheduleDays, formatScheduleWeek, scheduleWeekday, filterScheduleRecords } from '../src/faculties/organization-administration/components/calendar/weekly-calendar.js'

const records = [
  { date: '2026-09-12', start: '09:00', type: 'training', room: true },
  { date: '2026-09-09', start: '08:00', type: 'meeting', room: true },
  { date: '2026-09-10', start: '17:00', type: 'deadline', room: false },
  { date: '2026-09-11', start: '13:30', type: 'conference', room: true },
]

test('weekly calendar shows all events chronologically and does not mutate source', () => {
  assert.deepEqual(filterScheduleRecords(records, '2026-09-08', 'all').map(r => r.date), ['2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'])
  assert.equal(records[0].date, '2026-09-12')
})
test('deadline and room filters represent distinct user views', () => {
  assert.deepEqual(filterScheduleRecords(records, '2026-09-08', 'deadline').map(r => r.type), ['deadline'])
  assert.equal(filterScheduleRecords(records, '2026-09-08', 'room').length, 3)
  assert.equal(filterScheduleRecords(records, '2026-09-15', 'all').length, 0)
})
test('week interval includes both boundary days and excludes the following day', () => {
  const edgeRecords = ['2026-09-07', '2026-09-08', '2026-09-14', '2026-09-15'].map(date => ({ date, start: '08:00', type: 'meeting', room: true }))
  assert.deepEqual(filterScheduleRecords(edgeRecords, '2026-09-08').map(r => r.date), ['2026-09-08', '2026-09-14'])
})
test('week navigation crosses month, year and leap-day boundaries without timezone drift', () => {
  assert.equal(addScheduleDays('2026-09-08', -7), '2026-09-01')
  assert.equal(addScheduleDays('2026-12-29', 7), '2027-01-05')
  assert.equal(addScheduleDays('2028-02-28', 1), '2028-02-29')
})
test('week label preserves the brief and disambiguates month and year changes', () => {
  assert.equal(formatScheduleWeek('2026-09-08'), '08 – 14 Tháng 9, 2026')
  assert.equal(formatScheduleWeek('2026-09-29'), '29/09 – 05/10/2026')
  assert.equal(formatScheduleWeek('2026-12-29'), '29/12/2026 – 04/01/2027')
})
test('weekday labels reflect actual dates, not the incorrect screenshot labels', () => {
  assert.equal(scheduleWeekday('2026-09-09'), 'Th4')
  assert.equal(scheduleWeekday('2026-09-12'), 'Th7')
  assert.equal(scheduleWeekday('2026-09-13'), 'CN')
})
test('invalid calendar dates are rejected instead of silently rolling over', () => {
  assert.throws(() => addScheduleDays('2026-02-30', 7), RangeError)
})
