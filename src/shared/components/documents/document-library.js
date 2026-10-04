export const normalizeDocumentSearch = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

export const filterDocumentRecords = (records = [], filters = {}) => {
  const query = normalizeDocumentSearch(filters.query)
  const type = filters.type && filters.type !== 'all' ? filters.type : ''
  const area = filters.area && filters.area !== 'all' ? filters.area : ''
  const year = filters.year && filters.year !== 'all' ? String(filters.year) : ''

  return records.filter((record) => {
    const matchesQuery = !query || normalizeDocumentSearch(record.search).includes(query)
    const matchesType = !type || record.type === type
    const matchesArea = !area || record.area === area
    const matchesYear = !year || String(record.year) === year

    return matchesQuery && matchesType && matchesArea && matchesYear
  })
}

const getRecordFromElement = (element) => ({
  id: element.id,
  search: element.dataset.documentSearch || element.textContent || '',
  type: element.dataset.documentType || '',
  area: element.dataset.documentArea || '',
  year: element.dataset.documentYear || '',
  element,
})

export const initDocumentLibrary = (root = document) => {
  const libraries = Array.from(root.querySelectorAll('[data-document-library]'))

  return libraries.map((library) => {
    const queryInput = library.querySelector('[data-document-query]')
    const typeButtons = Array.from(library.querySelectorAll('[data-document-type-filter]'))
    const areaSelect = library.querySelector('[data-document-area-filter]')
    const yearSelect = library.querySelector('[data-document-year-filter]')
    const resetButtons = Array.from(library.querySelectorAll('[data-document-reset]'))
    const count = library.querySelector('[data-document-count]')
    const emptyState = library.querySelector('[data-document-empty]')
    const records = Array.from(library.querySelectorAll('[data-document-item]')).map(getRecordFromElement)
    const listeners = []
    let activeType = typeButtons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.documentTypeFilter || 'all'

    const getFilters = () => ({
      query: queryInput?.value || '',
      type: activeType,
      area: areaSelect?.value || '',
      year: yearSelect?.value || '',
    })

    const render = () => {
      const visible = new Set(filterDocumentRecords(records, getFilters()))

      records.forEach((record) => {
        record.element.hidden = !visible.has(record)
      })

      if (count) count.textContent = `${visible.size} tài liệu`
      if (emptyState) emptyState.hidden = visible.size !== 0
    }

    const listen = (element, eventName, handler) => {
      if (!element) return
      element.addEventListener(eventName, handler)
      listeners.push(() => element.removeEventListener(eventName, handler))
    }

    listen(queryInput, 'input', render)
    listen(areaSelect, 'change', render)
    listen(yearSelect, 'change', render)

    typeButtons.forEach((button) => {
      listen(button, 'click', () => {
        activeType = button.dataset.documentTypeFilter || 'all'
        typeButtons.forEach((typeButton) => {
          typeButton.setAttribute('aria-pressed', String(typeButton === button))
        })
        render()
      })
    })

    resetButtons.forEach((button) => {
      listen(button, 'click', () => {
        if (queryInput) queryInput.value = ''
        if (areaSelect) areaSelect.value = ''
        if (yearSelect) yearSelect.value = ''
        activeType = 'all'
        typeButtons.forEach((typeButton) => {
          typeButton.setAttribute('aria-pressed', String(typeButton.dataset.documentTypeFilter === 'all'))
        })
        render()
        queryInput?.focus()
      })
    })

    render()

    return {
      destroy: () => listeners.splice(0).forEach((removeListener) => removeListener()),
      render,
    }
  })
}
