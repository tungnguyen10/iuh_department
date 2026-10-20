const DEBOUNCE_MS = 150
const MAX_QUERY_LENGTH = 120
const URL_KEYS = ['q', 'type', 'area', 'year']

export const normalizeDocumentSearch = (value = '') => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

export const tokenizeDocumentQuery = (value = '') => normalizeDocumentSearch(value).split(' ').filter(Boolean)

const keyCache = new WeakMap()

const getKeys = (record) => {
  let keys = keyCache.get(record)
  if (!keys) {
    const title = normalizeDocumentSearch(record.title)
    const code = normalizeDocumentSearch(record.code)
    const search = normalizeDocumentSearch(record.search)
    keys = { title, code, all: `${search} ${title} ${code}` }
    keyCache.set(record, keys)
  }
  return keys
}

const hasWordStart = (key, token) => key.startsWith(token) || key.includes(` ${token}`)

// Returns -1 when any token is missing; otherwise higher means a closer match.
export const scoreDocumentRecord = (record, tokens) => {
  if (!tokens.length) return 0

  const { title, code, all } = getKeys(record)
  let score = 0

  for (const token of tokens) {
    if (!all.includes(token)) return -1
    score += title.includes(token) ? 3 : code.includes(token) ? 2 : 1
    if (hasWordStart(all, token)) score += 1
  }

  if (tokens.length > 1) {
    const phrase = tokens.join(' ')
    if (title.includes(phrase)) score += 4
    else if (all.includes(phrase)) score += 2
  }

  return score
}

export const filterDocumentRecords = (records = [], filters = {}) => {
  const tokens = tokenizeDocumentQuery(filters.query)
  const type = filters.type && filters.type !== 'all' ? filters.type : ''
  const area = filters.area && filters.area !== 'all' ? filters.area : ''
  const year = filters.year && filters.year !== 'all' ? String(filters.year) : ''

  return records.filter((record) => {
    const matchesQuery = !tokens.length || scoreDocumentRecord(record, tokens) >= 0
    const matchesType = !type || record.type === type
    const matchesArea = !area || record.area === area
    const matchesYear = !year || String(record.year) === year

    return matchesQuery && matchesType && matchesArea && matchesYear
  })
}

export const rankDocumentRecords = (records = [], query = '') => {
  const tokens = tokenizeDocumentQuery(query)
  if (!tokens.length) return [...records]

  return records
    .map((record, index) => ({ record, index, score: scoreDocumentRecord(record, tokens) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ record }) => record)
}

export const countDocumentsByType = (records = [], filters = {}) => {
  const matching = filterDocumentRecords(records, { ...filters, type: 'all' })
  const counts = { all: matching.length }

  matching.forEach(({ type }) => {
    counts[type] = (counts[type] ?? 0) + 1
  })

  return counts
}

const pickAllowed = (value, allowed = []) => (value && allowed.includes(value) ? value : '')

export const readDocumentFilters = (params, allowed = {}) => ({
  query: (params.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH),
  type: pickAllowed(params.get('type'), allowed.types) || 'all',
  area: pickAllowed(params.get('area'), allowed.areas),
  year: pickAllowed(params.get('year'), allowed.years),
})

export const writeDocumentFilters = (filters = {}) => {
  const params = new URLSearchParams()
  const query = (filters.query ?? '').trim().slice(0, MAX_QUERY_LENGTH)

  if (query) params.set('q', query)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.area) params.set('area', filters.area)
  if (filters.year) params.set('year', filters.year)

  return params
}

const getRecordFromElement = (element) => ({
  id: element.id,
  search: element.dataset.documentSearch || element.textContent || '',
  title: element.querySelector('h3')?.textContent || '',
  code: element.querySelector('strong')?.textContent || '',
  type: element.dataset.documentType || '',
  area: element.dataset.documentArea || '',
  year: element.dataset.documentYear || '',
  element,
})

const CHIP_CLASS = 'inline-flex items-center gap-2 rounded-full border border-primary-dark-blue/20 bg-secondary-blue-light px-3 py-1.5 font-roboto text-xs font-semibold text-primary-dark-blue transition hover:border-primary-dark-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-yellow motion-reduce:transition-none'
const COUNT_CLASS = 'ml-2 text-xs font-bold tabular-nums opacity-70'

export const initDocumentLibrary = (root = document) => {
  const libraries = Array.from(root.querySelectorAll('[data-document-library]'))

  return libraries.map((library) => {
    const doc = library.ownerDocument
    const queryInput = library.querySelector('[data-document-query]')
    const typeButtons = Array.from(library.querySelectorAll('[data-document-type-filter]'))
    const areaSelect = library.querySelector('[data-document-area-filter]')
    const yearSelect = library.querySelector('[data-document-year-filter]')
    const resetButtons = Array.from(library.querySelectorAll('[data-document-reset]'))
    const count = library.querySelector('[data-document-count]')
    const emptyState = library.querySelector('[data-document-empty]')
    const chipsContainer = library.querySelector('[data-document-active-filters]')
    const records = Array.from(library.querySelectorAll('[data-document-item]')).map(getRecordFromElement)
    const listParent = records[0]?.element.parentElement
    const canReorder = Boolean(listParent) && records.every(({ element }) => element.parentElement === listParent)
    const syncUrlEnabled = library.hasAttribute('data-document-sync-url') && libraries.length === 1
    const typeLabels = new Map(typeButtons.map((button) => [button.dataset.documentTypeFilter, button.textContent.trim()]))
    const listeners = []
    let activeType = typeButtons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.documentTypeFilter || 'all'
    let renderedOrder = [...records]
    let timer = 0

    queryInput?.setAttribute('enterkeyhint', 'search')
    queryInput?.setAttribute('autocomplete', 'off')

    if (listParent) {
      listParent.id ||= `document-list-${Math.random().toString(36).slice(2, 8)}`
      ;[queryInput, areaSelect, yearSelect, ...typeButtons].forEach((control) => {
        control?.setAttribute('aria-controls', listParent.id)
      })
    }

    typeButtons.forEach((button) => {
      if (button.querySelector('[data-document-type-count]')) return
      const badge = doc.createElement('span')
      badge.dataset.documentTypeCount = ''
      badge.className = COUNT_CLASS
      button.append(badge)
    })

    const getFilters = () => ({
      query: queryInput?.value || '',
      type: activeType,
      area: areaSelect?.value || '',
      year: yearSelect?.value || '',
    })

    const setActiveType = (type) => {
      activeType = type
      typeButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.documentTypeFilter === type))
      })
    }

    const updateUrl = (filters) => {
      if (!syncUrlEnabled) return
      const win = doc.defaultView
      const url = new URL(win.location.href)
      const before = url.search

      URL_KEYS.forEach((key) => url.searchParams.delete(key))
      writeDocumentFilters(filters).forEach((value, key) => url.searchParams.append(key, value))

      if (url.search !== before) win.history.replaceState(win.history.state, '', url)
    }

    const applyOrder = (rankedVisible, visible, hasQuery) => {
      if (!canReorder) return
      const desired = hasQuery
        ? [...rankedVisible, ...records.filter((record) => !visible.has(record))]
        : records

      if (desired.every((record, index) => record === renderedOrder[index])) return
      listParent.append(...desired.map(({ element }) => element))
      renderedOrder = [...desired]
    }

    const getActiveChips = (filters) => {
      const chips = []
      const query = filters.query.trim()

      if (query) chips.push({ key: 'q', label: `Từ khóa: “${query}”` })
      if (filters.type !== 'all') chips.push({ key: 'type', label: typeLabels.get(filters.type) || filters.type })
      if (filters.area) chips.push({ key: 'area', label: areaSelect?.selectedOptions[0]?.textContent.trim() || filters.area })
      if (filters.year) chips.push({ key: 'year', label: `Năm ${filters.year}` })

      return chips
    }

    const renderChips = (chips) => {
      if (!chipsContainer) return

      chipsContainer.replaceChildren(...chips.map(({ key, label }) => {
        const chip = doc.createElement('button')
        const text = doc.createElement('span')
        const mark = doc.createElement('span')

        chip.type = 'button'
        chip.className = CHIP_CLASS
        chip.dataset.documentChip = key
        chip.setAttribute('aria-label', `Bỏ lọc ${label}`)
        text.textContent = label
        mark.setAttribute('aria-hidden', 'true')
        mark.textContent = '×'
        chip.append(text, mark)

        return chip
      }))
      chipsContainer.hidden = chips.length === 0
    }

    const render = ({ syncUrl = true } = {}) => {
      const filters = getFilters()
      const matched = filterDocumentRecords(records, filters)
      const visible = new Set(matched)
      const hasQuery = tokenizeDocumentQuery(filters.query).length > 0
      const chips = getActiveChips(filters)
      const typeCounts = countDocumentsByType(records, filters)

      records.forEach((record) => {
        const shouldHide = !visible.has(record)
        if (record.element.hidden !== shouldHide) record.element.hidden = shouldHide
      })

      applyOrder(rankDocumentRecords(matched, filters.query), visible, hasQuery)

      typeButtons.forEach((button) => {
        const badge = button.querySelector('[data-document-type-count]')
        if (badge) badge.textContent = String(typeCounts[button.dataset.documentTypeFilter] ?? 0)
      })

      renderChips(chips)

      if (count) count.textContent = chips.length ? `${visible.size} / ${records.length} tài liệu` : `${visible.size} tài liệu`
      if (emptyState) emptyState.hidden = visible.size !== 0
      if (syncUrl) updateUrl(filters)
    }

    const listen = (element, eventName, handler) => {
      if (!element) return
      element.addEventListener(eventName, handler)
      listeners.push(() => element.removeEventListener(eventName, handler))
    }

    const renderNow = () => {
      window.clearTimeout(timer)
      render()
    }

    listen(queryInput, 'input', () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(render, DEBOUNCE_MS)
    })
    listen(queryInput, 'search', renderNow)
    listen(areaSelect, 'change', renderNow)
    listen(yearSelect, 'change', renderNow)

    typeButtons.forEach((button) => {
      listen(button, 'click', () => {
        setActiveType(button.dataset.documentTypeFilter || 'all')
        renderNow()
      })
    })

    listen(chipsContainer, 'click', (event) => {
      const chip = event.target.closest('[data-document-chip]')
      if (!chip) return

      const focusTarget = {
        q: queryInput,
        type: typeButtons.find((button) => button.dataset.documentTypeFilter === 'all'),
        area: areaSelect,
        year: yearSelect,
      }[chip.dataset.documentChip]

      if (chip.dataset.documentChip === 'q' && queryInput) queryInput.value = ''
      if (chip.dataset.documentChip === 'type') setActiveType('all')
      if (chip.dataset.documentChip === 'area' && areaSelect) areaSelect.value = ''
      if (chip.dataset.documentChip === 'year' && yearSelect) yearSelect.value = ''

      renderNow()
      focusTarget?.focus()
    })

    resetButtons.forEach((button) => {
      listen(button, 'click', () => {
        if (queryInput) queryInput.value = ''
        if (areaSelect) areaSelect.value = ''
        if (yearSelect) yearSelect.value = ''
        setActiveType('all')
        renderNow()
        queryInput?.focus()
      })
    })

    if (syncUrlEnabled) {
      const fromUrl = readDocumentFilters(new URLSearchParams(doc.defaultView.location.search), {
        types: typeButtons.map((button) => button.dataset.documentTypeFilter),
        areas: Array.from(areaSelect?.options ?? []).map((option) => option.value).filter(Boolean),
        years: Array.from(yearSelect?.options ?? []).map((option) => option.value).filter(Boolean),
      })

      if (queryInput) queryInput.value = fromUrl.query
      if (areaSelect) areaSelect.value = fromUrl.area
      if (yearSelect) yearSelect.value = fromUrl.year
      setActiveType(fromUrl.type)
    }

    render({ syncUrl: false })

    return {
      destroy: () => {
        window.clearTimeout(timer)
        listeners.splice(0).forEach((removeListener) => removeListener())
      },
      render,
    }
  })
}
