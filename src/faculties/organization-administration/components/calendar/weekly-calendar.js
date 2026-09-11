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

// data-schedule-date / data-initial-week are authored as dd/mm/yyyy; convert to the yyyy-mm-dd used internally.
const parseAttrDate = (value) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) throw new RangeError(`Invalid schedule date: ${value}`)
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

const TYPE_META = {
  meeting: { label: 'Họp', dot: 'bg-primary-dark-blue' },
  deadline: { label: 'Hạn xử lý', dot: 'bg-danger' },
  conference: { label: 'Hội nghị', dot: 'bg-secondary-green' },
  training: { label: 'Đào tạo', dot: 'bg-primary-yellow' },
}

// Builds the full <li> body from data-schedule-* attributes; markup lives only in JS so the source HTML stays data-only.
const renderEventElement = (li, record) => {
  const meta = TYPE_META[record.type] ?? { label: record.type, dot: 'bg-primary-dark-blue' }
  li.innerHTML = `
    <time class="flex flex-col text-center text-primary-dark-blue">
      <span class="font-inter text-[28px] font-bold leading-none tabular-nums"></span>
      <span data-schedule-weekday class="mt-1.5 text-xs font-semibold"></span>
    </time>
    <span aria-hidden="true" class="relative flex justify-center">
      <span data-schedule-line class="absolute -bottom-11 top-3 w-px bg-primary-dark-blue/15"></span>
      <span data-schedule-dot class="relative mt-1.5 h-3 w-3 shrink-0 rounded-full"></span>
    </span>
    <div class="min-w-0">
      <h3 class="font-inter text-sm font-semibold leading-6 text-title sm:text-base"></h3>
      <span class="sr-only"></span>
      <p class="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm leading-6 text-black">
        <span data-schedule-time></span><span aria-hidden="true">·</span><span data-schedule-location></span>
      </p>
    </div>
  `
  const dayTime = li.querySelector('time')
  dayTime.dateTime = record.date
  dayTime.querySelector('span').textContent = record.date.slice(8, 10)
  dayTime.querySelector('[data-schedule-weekday]').textContent = scheduleWeekday(record.date)
  li.querySelector('[data-schedule-dot]').classList.add(...meta.dot.split(' '))
  li.querySelector('h3').textContent = record.title
  li.querySelector('.sr-only').textContent = `Loại: ${meta.label}.`
  const timeSlot = li.querySelector('[data-schedule-time]')
  const startTime = document.createElement('time')
  startTime.dateTime = `${record.date}T${record.start}:00+07:00`
  startTime.textContent = record.start
  timeSlot.append(startTime)
  if (record.end) {
    timeSlot.append(' – ')
    const endTime = document.createElement('time')
    endTime.dateTime = `${record.date}T${record.end}:00+07:00`
    endTime.textContent = record.end
    timeSlot.append(endTime)
  }
  li.querySelector('[data-schedule-location]').textContent = record.location
}

export const initWeeklyCalendar = (root = document) => Array.from(root.querySelectorAll('[data-weekly-calendar]')).map(calendar => {
  if (instances.has(calendar)) return instances.get(calendar)
  const records = Array.from(calendar.querySelectorAll('[data-schedule-event]')).map(element => ({
    date: parseAttrDate(element.dataset.scheduleDate),
    start: element.dataset.scheduleStart,
    end: element.dataset.scheduleEnd || '',
    type: element.dataset.scheduleType,
    room: element.dataset.scheduleRoom === 'true',
    title: element.dataset.scheduleTitle,
    location: element.dataset.scheduleLocation,
    element,
  }))
  const list = calendar.querySelector('[data-schedule-list]')
  const weekLabel = calendar.querySelector('[data-schedule-week]')
  const empty = calendar.querySelector('[data-schedule-empty]')
  const status = calendar.querySelector('[data-schedule-status]')
  const filters = Array.from(calendar.querySelectorAll('[data-schedule-filter]'))
  let start = parseAttrDate(calendar.dataset.initialWeek)
  let filter = 'all'
  const listeners = []

  records.forEach(record => renderEventElement(record.element, record))

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
