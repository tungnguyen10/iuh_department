import { escapeHtml } from '../../js/escape-html.js'

export const createActivitiesRenderer = ({ base, items, sectionMeta: _sectionMeta }) => {
  const withBase = (path) => {
    if (!path || path.startsWith('http') || path.startsWith('//')) return path
    const normalized = path.startsWith('/') ? path : `/${path}`
    return base === '/' ? normalized : `${base}${normalized.slice(1)}`
  }
  const detailLink = () => withBase('/activities-details.html')
  const icon = (name) => withBase(`/assets/svgs/${name}`)
  const image = (item) => withBase(item.image || '/assets/images/default.jpg')

  const activityMeta = (item, compact = false) => `
    <div class="flex flex-wrap items-center gap-2">
      <span class="inline-flex rounded-md bg-secondary-blue-light px-2 py-1 font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
      <span class="inline-flex items-center gap-1 font-roboto text-xs font-medium text-gray-700">
        <img src="${icon('icon-calendar-check.svg')}" alt="" class="${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}" />
        ${escapeHtml(item.date || '')}
      </span>
    </div>`

  const card = (item) => `
    <article class="group relative flex h-full flex-col overflow-hidden rounded-lg border border-stroke bg-primary-white p-2 shadow-[1px_1px_10px_0_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-secondary-blue hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.18)]">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <figure class="relative aspect-video overflow-hidden rounded-md bg-secondary-blue-light">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </figure>
      <div class="flex flex-1 flex-col gap-2.5 p-2.5">
        ${activityMeta(item, true)}
        <h3 class="font-roboto text-base font-medium leading-normal text-title line-clamp-2 transition-colors duration-300 group-hover:text-primary-dark-blue">${escapeHtml(item.title)}</h3>
        <p class="font-roboto text-sm leading-relaxed text-gray-700 line-clamp-3">${escapeHtml(item.excerpt || '')}</p>
      </div>
    </article>`

  const listCard = (item) => `
    <article class="group relative bg-white border border-stroke rounded-[5px] md:rounded-[8px] shadow-[1px_1px_10px_0_rgba(0,0,0,0.1)] p-2 md:p-2.5 w-full hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="flex flex-col md:flex-row gap-2 md:gap-2.5 h-full">
        <div class="relative shrink-0 w-full md:w-[240px] lg:w-[280px] h-[180px] md:h-[150px] lg:h-[170px] rounded-[5px] overflow-hidden">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge absolute top-3 right-3 md:left-3 md:right-auto">new</div>
        <div class="flex-1 flex flex-col justify-between py-0 md:py-1.5 min-w-0">
          <div class="flex flex-col gap-2 md:gap-2.5">
            <span class="inline-flex rounded-md bg-secondary-blue-light px-2 py-1 font-roboto text-xs font-bold text-primary-dark-blue self-start">${escapeHtml(item.category || 'Hoạt động')}</span>
            <h3 class="font-roboto font-medium text-base md:text-lg leading-normal text-gray-900 line-clamp-2 group-hover:text-primary-dark-blue transition-colors duration-200">${escapeHtml(item.title)}</h3>
            <p class="font-roboto font-normal text-sm md:text-base leading-normal text-gray-700 line-clamp-2">${escapeHtml(item.excerpt || '')}</p>
          </div>
          <div class="flex flex-col gap-2 md:gap-2.5 mt-2 md:mt-0">
            <div class="w-full h-px bg-stroke"></div>
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center gap-1 md:gap-1.5 px-1.5 py-0.5 bg-white border border-danger rounded-[5px]">
                <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 shrink-0 text-danger" />
                <span class="font-roboto font-medium text-xs md:text-sm leading-normal text-danger">${escapeHtml(item.date || '')}</span>
              </div>
              <span class="font-roboto font-medium text-sm md:text-base leading-normal text-gray-600 group-hover:text-primary-dark-blue transition-colors duration-200">Xem thêm</span>
            </div>
          </div>
        </div>
      </div>
    </article>`

  const sidebarCard = (item, featured = false) => featured ? `
    <article class="group relative flex flex-col gap-2 rounded-lg border border-stroke bg-[#FAFAFA] p-2 transition-all duration-300 hover:border-secondary-blue hover:bg-white hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.16)]">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <figure class="h-[130px] overflow-hidden rounded-md bg-secondary-blue-light md:h-[150px]">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </figure>
      <div class="flex flex-col gap-2">
        <span class="self-start rounded-md bg-secondary-blue-light px-2 py-1 font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
        <h3 class="font-roboto text-sm font-medium leading-normal text-gray-900 line-clamp-3 transition-colors duration-300 group-hover:text-primary-dark-blue md:text-base">${escapeHtml(item.title)}</h3>
      </div>
    </article>` : `
    <article class="group relative flex gap-2 rounded-lg border border-stroke bg-[#FAFAFA] p-2 transition-all duration-300 hover:border-secondary-blue hover:bg-white hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.16)]">
      <a href="${detailLink()}" class="absolute inset-0 z-30 rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <figure class="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md bg-secondary-blue-light md:h-[85px] md:w-[85px]">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </figure>
      <div class="min-w-0 flex-1">
        <span class="font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
        <h3 class="mt-1 font-roboto text-sm font-medium leading-normal text-gray-900 line-clamp-2 transition-colors duration-300 group-hover:text-primary-dark-blue md:text-base">${escapeHtml(item.title)}</h3>
      </div>
    </article>`

  const articleBlock = (block) => {
    if (!block) return ''
    if (block.type === 'heading') {
      const tag = block.level === 3 ? 'h3' : 'h2'
      return `<${tag}>${escapeHtml(block.text)}</${tag}>`
    }
    if (block.type === 'list') {
      return `<ul>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    }
    if (block.type === 'notice') {
      return `<div class="my-6 rounded-lg border-l-4 border-danger bg-danger-light p-4 md:p-6"><h3 class="mb-2 font-bold text-danger">${escapeHtml(block.title || '')}</h3><p class="text-sm text-gray">${escapeHtml(block.text || '')}</p></div>`
    }
    if (block.type === 'info') {
      return `<div class="my-6 rounded-lg border-l-4 border-secondary-blue bg-secondary-blue-light p-4 md:p-6"><h3 class="mb-2 font-bold text-primary-dark-blue">${escapeHtml(block.title || '')}</h3><p class="text-sm text-gray">${escapeHtml(block.text || '')}</p></div>`
    }
    return `<p>${escapeHtml(block.text || '')}</p>`
  }

  const detail = () => {
    const item = items[0]
    if (!item) return '<p class="font-roboto text-gray-700">Chưa có nội dung hoạt động.</p>'
    return `
      <article class="rounded-2xl border border-stroke bg-white p-4 shadow-sm md:p-6">
        <div class="mb-6 flex flex-col gap-3 md:mb-8 md:gap-4">
          <span class="self-start rounded-md bg-secondary-blue-light px-2.5 py-1 font-roboto text-xs font-bold text-primary-dark-blue">${escapeHtml(item.category || 'Hoạt động')}</span>
          <h1 class="font-inter text-xl font-bold leading-tight text-primary-dark-blue md:text-3xl">${escapeHtml(item.title)}</h1>
          <div class="h-px w-full bg-stroke"></div>
          <div class="inline-flex items-center gap-1.5 self-start rounded-md bg-primary-white px-1.5 py-[3px] font-roboto text-xs font-medium text-gray-700 md:text-sm">
            <img src="${icon('icon-calendar-check.svg')}" alt="" class="h-4 w-4 md:h-5 md:w-5" />
            ${escapeHtml(item.date || '')}
          </div>
        </div>
        <figure class="relative mb-6 aspect-video overflow-hidden rounded-xl bg-secondary-blue-light md:mb-8">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="h-full w-full object-cover" />
          ${item.caption ? `<figcaption class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-4 text-sm text-primary-white">${escapeHtml(item.caption)}</figcaption>` : ''}
        </figure>
        <div class="article-content">${(item.content || []).map(articleBlock).join('')}</div>
      </article>`
  }

  const categoryItems = () => {
    const counts = items.reduce((acc, item) => {
      const category = item.category || 'Hoạt động'
      acc.set(category, (acc.get(category) || 0) + 1)
      return acc
    }, new Map())

    return `<div class="flex flex-col gap-2">${Array.from(counts.entries()).map(([category, count]) => `
      <a href="${withBase('/activities.html')}" class="flex items-center justify-between rounded-md border border-stroke bg-[#FAFAFA] px-3 py-2 font-roboto text-sm transition-all duration-300 hover:border-primary-dark-blue hover:bg-secondary-blue-light hover:text-primary-dark-blue">
        <span class="font-medium text-gray-700">${escapeHtml(category)}</span>
        <span class="rounded bg-primary-white px-2 py-0.5 text-xs font-bold text-primary-dark-blue">${count}</span>
      </a>`).join('')}</div>`
  }

  const stripActivitiesAttrs = (openTag) =>
    openTag
      .replace(/\sdata-activities-[\w-]+(?:=["'][^"']*["'])?/g, '')
      .replace(/\sdata-limit=["'][^"']*["']/g, '')

  const replaceInner = (html, attr, render) =>
    html.replace(new RegExp(`(<[^>]+\\s${attr}(?:\\s[^>]*)?>)[\\s\\S]*?(<\\/[^>]+>)`, 'g'), (match, open, close) => `${stripActivitiesAttrs(open)}${render(match)}${close}`)

  return (html) => {
    let result = html
    result = replaceInner(result, 'data-activities-list', () => items.map(listCard).join(''))
    result = replaceInner(result, 'data-activities-detail', detail)
    result = replaceInner(result, 'data-activities-sidebar-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 4)
      return items.slice(0, limit).map((item, index) => sidebarCard(item, index === 0)).join('')
    })
    result = replaceInner(result, 'data-activities-carousel-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 5)
      return items.slice(0, limit).map((item) => `<div class="swiper-slide !h-auto">${card(item)}</div>`).join('')
    })
    result = replaceInner(result, 'data-activities-category-items', categoryItems)
    return result
  }
}
