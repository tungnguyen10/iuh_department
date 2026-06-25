import { escapeHtml } from '../../js/escape-html.js'

export const createNewsRenderer = ({ base, items, sectionMeta }) => {
  const withBase = (path) => {
    if (!path || path.startsWith('http') || path.startsWith('//')) return path
    const normalized = path.startsWith('/') ? path : `/${path}`
    return base === '/' ? normalized : `${base}${normalized.slice(1)}`
  }
  const newsLink = () => withBase('/news-detail.html')
  const icon = (name) => withBase(`/assets/svgs/${name}`)
  const image = (item) => withBase(item.image || '/assets/images/default.jpg')

  const card = (item) => `
    <article class="group relative bg-primary-white hover:rounded-[10px] overflow-hidden w-full h-full flex flex-col p-2 md:p-2.5 pb-3 md:pb-4 hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${newsLink()}" class="absolute inset-0 z-30" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="block relative w-full aspect-video rounded-[5px] overflow-hidden mb-2 md:mb-2.5">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge absolute top-3 right-3">new</div>
      <div class="flex flex-col flex-1 justify-between w-full">
        <div class="flex flex-col gap-2 md:gap-2.5">
          <h3 class="font-roboto font-medium text-base md:text-lg leading-normal text-title group-hover:text-primary-dark-blue overflow-hidden line-clamp-2 transition-colors duration-300">${escapeHtml(item.title)}</h3>
          <p class="font-roboto font-normal text-sm md:text-base leading-normal text-black overflow-hidden line-clamp-3">${escapeHtml(item.excerpt || '')}</p>
        </div>
        <div class="flex flex-col gap-3 md:gap-4 mt-auto">
          <div class="w-full h-0 border-t border-stroke transition-colors duration-300"></div>
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-[3px] bg-primary-white border border-danger rounded-[5px] group-hover:bg-danger-light transition-all duration-300">
              <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 text-danger shrink-0 transition-all duration-300" />
              <span class="font-roboto font-medium text-xs md:text-sm leading-normal text-danger transition-colors duration-300">${escapeHtml(item.date || '')}</span>
            </div>
            <span class="inline-flex items-center gap-[2px] font-roboto font-medium text-sm md:text-base leading-normal text-gray group-hover:text-primary-dark-blue transition-colors duration-300">Xem thêm</span>
          </div>
        </div>
      </div>
    </article>`

  const eventCard = (item) => `
    <article class="group relative bg-white border border-stroke rounded-[5px] md:rounded-[8px] shadow-[1px_1px_10px_0_rgba(0,0,0,0.1)] p-2 md:p-2.5 w-full hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${newsLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="flex flex-col md:flex-row gap-2 md:gap-2.5 h-full">
        <div class="relative shrink-0 w-full md:w-[240px] lg:w-[280px] h-[180px] md:h-[150px] lg:h-[170px] rounded-[5px] overflow-hidden">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge absolute top-3 right-3 md:left-3 md:right-auto">new</div>
        <div class="flex-1 flex flex-col justify-between py-0 md:py-1.5 min-w-0">
          <div class="flex flex-col gap-2 md:gap-2.5">
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
    <article class="group relative flex flex-col gap-2 md:gap-2.5 w-full bg-[#FAFAFA] border border-stroke rounded-[5px] md:rounded-[8px] p-2 md:p-2.5 hover:bg-white hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${newsLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
      <div class="relative w-full h-[130px] md:h-[150px] rounded-[5px] overflow-hidden">
        <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      </div>
      <div class="flex flex-col gap-2 md:gap-2.5">
        <h3 class="font-roboto font-medium text-sm md:text-base leading-normal text-gray-900 group-hover:text-primary-dark-blue transition-colors duration-200 line-clamp-3">${escapeHtml(item.title)}</h3>
        <div class="flex gap-2.5 items-center">
          <div class="inline-flex items-center gap-1 md:gap-1.5 bg-danger-light rounded-[5px] px-1.5 py-[3px] self-start">
            <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 text-danger">
            <span class="font-roboto font-medium text-xs md:text-sm text-danger">${escapeHtml(item.date || '')}</span>
          </div>
          <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge">new</div>
        </div>
      </div>
    </article>` : `
    <article class="group flex flex-col gap-1 md:gap-1.5 w-full">
      <div class="w-full h-px bg-stroke"></div>
      <div class="relative flex gap-2 md:gap-2.5 bg-[#FAFAFA] border border-stroke rounded-[5px] md:rounded-[8px] p-2 md:p-2.5 hover:bg-white hover:border-secondary-blue hover:rounded-[8px] md:hover:rounded-lg hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
        <a href="${newsLink()}" class="absolute inset-0 z-30 rounded-[5px] md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
        <div class="relative shrink-0 w-[70px] h-[70px] md:w-[85px] md:h-[85px] rounded-[5px] overflow-hidden">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="flex-1 flex flex-col gap-2 md:gap-2.5 min-w-0">
          <h3 class="font-roboto font-medium text-sm md:text-base leading-normal text-gray-900 group-hover:text-primary-dark-blue transition-colors duration-200 line-clamp-2 overflow-hidden text-ellipsis">${escapeHtml(item.title)}</h3>
          <div class="flex gap-2.5 items-center">
            <div class="inline-flex items-center gap-1 md:gap-1.5 bg-danger-light rounded-[5px] px-1.5 py-[3px] self-start">
              <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 text-danger" />
              <span class="font-roboto font-medium text-xs md:text-sm text-danger">${escapeHtml(item.date || '')}</span>
            </div>
            <div class="px-3 py-1 rounded-md text-xs text-danger bg-danger-light capitalize animate-flash-badge">new</div>
          </div>
        </div>
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
    if (block.type === 'notice' || block.type === 'info') {
      const color = block.type === 'notice' ? 'danger' : 'primary-dark-blue'
      const bg = block.type === 'notice' ? 'bg-danger-light border-danger' : 'bg-secondary-blue-light border-secondary-blue'
      return `<div class="${bg} border-l-4 p-4 md:p-6 rounded-lg my-6"><h3 class="font-bold text-${color} mb-2">${escapeHtml(block.title || '')}</h3><p class="text-sm text-gray">${escapeHtml(block.text || '')}</p></div>`
    }
    return `<p>${escapeHtml(block.text || '')}</p>`
  }

  const section = (limit = 5) => `
    <div class="container mx-auto px-4 flex flex-col items-center">
      <div class="max-w-3xl text-center">
        ${sectionMeta?.eyebrow ? `<span class="font-roboto font-normal text-base md:text-lg text-secondary-blue block mb-2">${escapeHtml(sectionMeta.eyebrow)}</span>` : ''}
        <h2 class="font-inter font-bold text-title text-center text-2xl md:text-4xl leading-tight mb-3">${escapeHtml(sectionMeta?.title || 'Tin tức')}</h2>
        <p class="font-roboto text-gray-700">${escapeHtml(sectionMeta?.description || '')}</p>
      </div>
      <div class="w-full relative">
        <div class="news-swiper py-4 md:py-6 lg:py-8"><div class="swiper-wrapper">${items.slice(0, limit).map((item) => `<div class="swiper-slide">${card(item)}</div>`).join('')}</div></div>
      </div>
      <div class="flex items-center gap-4 md:gap-5 lg:gap-[21px]">
        <button class="news-nav-prev bg-primary-white border border-stroke rounded-full p-2 md:p-2.5 hover:border-primary-dark-blue hover:bg-primary-dark-blue/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous news"><img src="${icon('icon-chevron-left.svg')}" alt="" class="w-6 h-6 md:w-[30px] md:h-[30px]" /></button>
        <button class="news-nav-next bg-primary-white border border-stroke rounded-full p-2 md:p-2.5 hover:border-primary-dark-blue hover:bg-primary-dark-blue/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next news"><img src="${icon('icon-chevron-right.svg')}" alt="" class="w-6 h-6 md:w-[30px] md:h-[30px]" /></button>
      </div>
    </div>`

  const detail = () => {
    const item = items[0]
    if (!item) return '<p class="font-roboto text-gray-700">Chưa có nội dung tin tức.</p>'
    return `
      <article class="bg-white rounded-2xl border border-stroke shadow-sm p-4 md:p-6">
        <div class="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
          <h1 class="font-inter font-bold text-lg md:text-2xl leading-normal text-primary-dark-blue">${escapeHtml(item.title)}</h1>
          <div class="w-full h-px bg-stroke"></div>
          <div class="inline-flex items-center gap-1.5 bg-danger-light rounded-[5px] px-1.5 py-[3px] self-start">
            <img src="${icon('icon-calendar-check.svg')}" alt="" class="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
            <span class="font-roboto font-medium text-xs sm:text-sm text-danger">${escapeHtml(item.date || '')}</span>
          </div>
        </div>
        <figure class="relative w-full aspect-video rounded-xl overflow-hidden mb-6 md:mb-8">
          <img src="${image(item)}" alt="${escapeHtml(item.imageAlt || item.title)}" class="w-full h-full object-cover" />
          ${item.caption ? `<figcaption class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-primary-white text-sm">${escapeHtml(item.caption)}</figcaption>` : ''}
        </figure>
        <div class="article-content">${(item.content || []).map(articleBlock).join('')}</div>
      </article>`
  }

  const stripNewsAttrs = (openTag) =>
    openTag
      .replace(/\sdata-news-[\w-]+(?:=["'][^"']*["'])?/g, '')
      .replace(/\sdata-limit=["'][^"']*["']/g, '')

  const replaceInner = (html, attr, render) =>
    html.replace(new RegExp(`(<[^>]+\\s${attr}(?:\\s[^>]*)?>)[\\s\\S]*?(<\\/[^>]+>)`, 'g'), (match, open, close) => `${stripNewsAttrs(open)}${render(match)}${close}`)

  return (html) => {
    let result = html
    result = result.replace(/(<section[^>]*\sdata-news-section(?:\s[^>]*)?>)[\s\S]*?(<\/section>)/g, (match, open, close) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 5)
      return `${stripNewsAttrs(open)}${section(limit)}${close}`
    })
    result = replaceInner(result, 'data-news-list', () => items.map(eventCard).join(''))
    result = replaceInner(result, 'data-news-detail', detail)
    result = replaceInner(result, 'data-news-carousel-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 5)
      return items.slice(0, limit).map((item) => `<div class="swiper-slide !h-auto">${card(item)}</div>`).join('')
    })
    result = replaceInner(result, 'data-news-sidebar-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 4)
      return items.slice(0, limit).map((item, index) => sidebarCard(item, index === 0)).join('')
    })
    result = replaceInner(result, 'data-news-announcement-items', (match) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 3)
      const selected = items.filter((item) => item.category?.toLowerCase().includes('thông báo')).slice(0, limit)
      const fallback = selected.length ? selected : items.slice(0, limit)
      return fallback.map((item, index) => sidebarCard(item, index === 0)).join('')
    })
    return result
  }
}
