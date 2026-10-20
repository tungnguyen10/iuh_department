const DEBOUNCE_MS = 150
const MAX_QUERY_LENGTH = 120
const DEFAULT_PAGE_SIZE = 20
const URL_KEYS = ['q', 'type', 'area', 'year', 'page']

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

const toPositiveInt = (value, fallback) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

export const paginateDocumentRecords = (records = [], page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const size = toPositiveInt(pageSize, DEFAULT_PAGE_SIZE)
  const total = records.length
  const pageCount = Math.max(1, Math.ceil(total / size))
  const current = Math.min(toPositiveInt(page, 1), pageCount)
  const offset = (current - 1) * size

  return {
    items: records.slice(offset, offset + size),
    page: current,
    pageCount,
    total,
    start: total ? offset + 1 : 0,
    end: Math.min(offset + size, total),
  }
}

// Always returns 7 slots when there are more than 7 pages so the bar width stays stable.
export const getPaginationItems = (page, pageCount) => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis', pageCount]
  if (page >= pageCount - 3) return [1, 'ellipsis', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount]
}

export const pageForRecord = (records = [], id = '', pageSize = DEFAULT_PAGE_SIZE) => {
  const index = records.findIndex((record) => record.id === id)
  return index < 0 ? 0 : Math.floor(index / toPositiveInt(pageSize, DEFAULT_PAGE_SIZE)) + 1
}

export const readDocumentFilters = (params, allowed = {}) => ({
  query: (params.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH),
  type: pickAllowed(params.get('type'), allowed.types) || 'all',
  area: pickAllowed(params.get('area'), allowed.areas),
  year: pickAllowed(params.get('year'), allowed.years),
  page: /^\d{1,6}$/.test(params.get('page') ?? '') ? toPositiveInt(params.get('page'), 1) : 1,
})

export const writeDocumentFilters = (filters = {}) => {
  const params = new URLSearchParams()
  const query = (filters.query ?? '').trim().slice(0, MAX_QUERY_LENGTH)

  if (query) params.set('q', query)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.area) params.set('area', filters.area)
  if (filters.year) params.set('year', filters.year)
  if (toPositiveInt(filters.page, 1) > 1) params.set('page', String(toPositiveInt(filters.page, 1)))

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
const PAGE_BUTTON_CLASS = 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-stroke bg-primary-white px-3 font-roboto text-sm font-semibold text-gray transition hover:border-primary-dark-blue/40 hover:text-primary-dark-blue focus:outline-none focus:ring-2 focus:ring-primary-yellow disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none aria-[current=page]:border-primary-dark-blue aria-[current=page]:bg-primary-dark-blue aria-[current=page]:text-primary-white'

const readHashId = (win) => {
  try {
    return decodeURIComponent(win.location.hash.slice(1))
  } catch {
    return ''
  }
}

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
    const paginationNav = library.querySelector('[data-document-pagination]')
    const pageSize = toPositiveInt(library.dataset.documentPageSize, DEFAULT_PAGE_SIZE)
    const records = Array.from(library.querySelectorAll('[data-document-item]')).map(getRecordFromElement)
    const listParent = records[0]?.element.parentElement
    const canReorder = Boolean(listParent) && records.every(({ element }) => element.parentElement === listParent)
    const syncUrlEnabled = library.hasAttribute('data-document-sync-url') && libraries.length === 1
    const typeLabels = new Map(typeButtons.map((button) => [button.dataset.documentTypeFilter, button.textContent.trim()]))
    const listeners = []
    let activeType = typeButtons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.documentTypeFilter || 'all'
    let renderedOrder = [...records]
    let currentPage = 1
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
      page: currentPage,
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

    const renderPagination = ({ page, pageCount }) => {
      if (!paginationNav) return

      paginationNav.hidden = pageCount <= 1
      if (pageCount <= 1) {
        paginationNav.replaceChildren()
        return
      }

      const makeButton = (label, target, { current = false, disabled = false, ariaLabel = '' } = {}) => {
        const button = doc.createElement('button')

        button.type = 'button'
        button.className = PAGE_BUTTON_CLASS
        button.textContent = label
        button.dataset.documentPage = String(target)
        button.disabled = disabled
        if (ariaLabel) button.setAttribute('aria-label', ariaLabel)
        if (current) button.setAttribute('aria-current', 'page')

        return button
      }

      const makeGap = () => {
        const gap = doc.createElement('span')

        gap.setAttribute('aria-hidden', 'true')
        gap.className = 'px-1 font-roboto text-sm text-gray'
        gap.textContent = '…'

        return gap
      }

      paginationNav.replaceChildren(
        makeButton('Trước', page - 1, { disabled: page === 1, ariaLabel: 'Trang trước' }),
        ...getPaginationItems(page, pageCount).map((item) => (item === 'ellipsis'
          ? makeGap()
          : makeButton(String(item), item, { current: item === page, ariaLabel: `Trang ${item}` }))),
        makeButton('Sau', page + 1, { disabled: page === pageCount, ariaLabel: 'Trang sau' }),
      )
    }

    const render = ({ syncUrl = true } = {}) => {
      const filters = getFilters()
      const matched = filterDocumentRecords(records, filters)
      const matchedSet = new Set(matched)
      const ranked = rankDocumentRecords(matched, filters.query)
      const pageInfo = paginateDocumentRecords(ranked, currentPage, pageSize)
      const onPage = new Set(pageInfo.items)
      const hasQuery = tokenizeDocumentQuery(filters.query).length > 0
      const chips = getActiveChips(filters)
      const typeCounts = countDocumentsByType(records, filters)

      currentPage = pageInfo.page
      filters.page = currentPage

      records.forEach((record) => {
        const shouldHide = !onPage.has(record)
        if (record.element.hidden !== shouldHide) record.element.hidden = shouldHide
      })

      applyOrder(ranked, matchedSet, hasQuery)

      typeButtons.forEach((button) => {
        const badge = button.querySelector('[data-document-type-count]')
        if (badge) badge.textContent = String(typeCounts[button.dataset.documentTypeFilter] ?? 0)
      })

      renderChips(chips)
      renderPagination(pageInfo)

      if (count) {
        const summary = chips.length ? `${matched.length} / ${records.length} tài liệu` : `${matched.length} tài liệu`
        count.textContent = pageInfo.pageCount > 1 ? `${summary} · hiển thị ${pageInfo.start}–${pageInfo.end}` : summary
      }
      if (emptyState) emptyState.hidden = matched.length !== 0
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
      currentPage = 1
      window.clearTimeout(timer)
      timer = window.setTimeout(render, DEBOUNCE_MS)
    })
    listen(queryInput, 'search', () => {
      currentPage = 1
      renderNow()
    })
    listen(areaSelect, 'change', () => {
      currentPage = 1
      renderNow()
    })
    listen(yearSelect, 'change', () => {
      currentPage = 1
      renderNow()
    })

    typeButtons.forEach((button) => {
      listen(button, 'click', () => {
        currentPage = 1
        setActiveType(button.dataset.documentTypeFilter || 'all')
        renderNow()
      })
    })

    listen(paginationNav, 'click', (event) => {
      const button = event.target.closest('[data-document-page]')
      if (!button || button.disabled) return

      currentPage = toPositiveInt(button.dataset.documentPage, 1)
      renderNow()
      paginationNav.querySelector('[aria-current="page"]')?.focus()

      if (library.getBoundingClientRect().top < 0) {
        const reduceMotion = doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches
        library.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
      }
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

      currentPage = 1
      renderNow()
      focusTarget?.focus()
    })

    resetButtons.forEach((button) => {
      listen(button, 'click', () => {
        if (queryInput) queryInput.value = ''
        if (areaSelect) areaSelect.value = ''
        if (yearSelect) yearSelect.value = ''
        setActiveType('all')
        currentPage = 1
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
      currentPage = fromUrl.page
    }

    const hashId = readHashId(doc.defaultView)
    const hashRecord = hashId ? records.find((record) => record.id === hashId) : null

    if (hashRecord) {
      const hashPage = pageForRecord(rankDocumentRecords(filterDocumentRecords(records, getFilters()), getFilters().query), hashId, pageSize)
      if (hashPage) currentPage = hashPage
    }

    render({ syncUrl: false })

    if (hashRecord && !hashRecord.element.hidden && paginationNav && !paginationNav.hidden) {
      hashRecord.element.scrollIntoView({ block: 'start' })
    }

    return {
      destroy: () => {
        window.clearTimeout(timer)
        listeners.splice(0).forEach((removeListener) => removeListener())
      },
      render,
    }
  })
}
