const parseDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RangeError(`Invalid schedule date: ${value}`)
  }
  return date
}
const pad = (value) => String(value).padStart(2, '0')

export const addScheduleDays = (value, days) => {
  const date = parseDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export const scheduleWeekday = (value) => {
  const day = parseDate(value).getUTCDay()
  return day === 0 ? 'CN' : `Th${day + 1}`
}

export const formatScheduleWeek = (start) => {
  const first = parseDate(start)
  const last = parseDate(addScheduleDays(start, 6))
  const shortDate = (date) => `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}`
  if (first.getUTCFullYear() !== last.getUTCFullYear()) {
    return `${shortDate(first)}/${first.getUTCFullYear()} – ${shortDate(last)}/${last.getUTCFullYear()}`
  }
  if (first.getUTCMonth() !== last.getUTCMonth()) {
    return `${shortDate(first)} – ${shortDate(last)}/${last.getUTCFullYear()}`
  }
  return `${pad(first.getUTCDate())} – ${pad(last.getUTCDate())} Tháng ${first.getUTCMonth() + 1}, ${first.getUTCFullYear()}`
}

export const filterScheduleRecords = (records, start, filter = 'all') => {
  const end = addScheduleDays(start, 7)
  return records.filter(record => record.date >= start && record.date < end
    && (filter === 'all' || (filter === 'deadline' && record.type === 'deadline') || (filter === 'room' && record.room)))
    .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`))
}

const instances = new WeakMap()

export const initWeeklyCalendar = (root = document) => Array.from(root.querySelectorAll('[data-weekly-calendar]')).map(calendar => {
  if (instances.has(calendar)) return instances.get(calendar)
  const records = Array.from(calendar.querySelectorAll('[data-schedule-event]')).map(element => ({
    date: element.dataset.scheduleDate,
    start: element.dataset.scheduleStart,
    type: element.dataset.scheduleType,
    room: element.dataset.scheduleRoom === 'true',
    element,
  }))
  const list = calendar.querySelector('[data-schedule-list]')
  const weekLabel = calendar.querySelector('[data-schedule-week]')
  const empty = calendar.querySelector('[data-schedule-empty]')
  const status = calendar.querySelector('[data-schedule-status]')
  const filters = Array.from(calendar.querySelectorAll('[data-schedule-filter]'))
  let start = calendar.dataset.initialWeek
  let filter = 'all'
  const listeners = []

  records.forEach(record => {
    record.element.querySelector('[data-schedule-weekday]').textContent = scheduleWeekday(record.date)
  })

  const render = () => {
    const visible = filterScheduleRecords(records, start, filter)
    const visibleSet = new Set(visible)
    records.forEach(record => {
      record.element.hidden = !visibleSet.has(record)
      record.element.classList.toggle('hidden', !visibleSet.has(record))
    })
    // Move existing nodes rather than injecting HTML; no duplicate IDs or SVG reloads.
    visible.forEach((record, index) => {
      record.element.querySelector('[data-schedule-line]').classList.toggle('hidden', index === visible.length - 1)
      list.append(record.element)
    })
    weekLabel.textContent = formatScheduleWeek(start)
    weekLabel.dateTime = start
    empty.hidden = visible.length > 0
    empty.classList.toggle('hidden', visible.length > 0)
    const label = filters.find(button => button.dataset.scheduleFilter === filter)?.textContent.trim() || ''
    status.textContent = `${label}: ${visible.length} mục. ${formatScheduleWeek(start)}.`
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scheduleFilter === filter)))
  }

  const listen = (element, eventName, callback) => {
    element.addEventListener(eventName, callback)
    listeners.push(() => element.removeEventListener(eventName, callback))
  }
  filters.forEach(button => listen(button, 'click', () => { filter = button.dataset.scheduleFilter; render() }))
  calendar.querySelectorAll('[data-schedule-shift]').forEach(button => listen(button, 'click', () => {
    start = addScheduleDays(start, Number(button.dataset.scheduleShift) * 7)
    render()
  }))
  const instance = {
    render,
    destroy: () => { listeners.forEach(remove => remove()); instances.delete(calendar) },
  }
  instances.set(calendar, instance)
  render()
  return instance
})
