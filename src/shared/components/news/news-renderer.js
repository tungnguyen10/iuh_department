import { escapeHtml } from '../../js/escape-html.js'

export const createNewsRenderer = ({ base, items, sectionMeta }) => {
  const withBase = (path) => {
    if (!path || path.startsWith('http') || path.startsWith('//')) return path
    const normalized = path.startsWith('/') ? path : `/${path}`
    return base === '/' ? normalized : `${base}${normalized.slice(1)}`
  }
  const newsLink = (item) => {
    const detailPath = withBase('/news-detail.html')
    return item?.slug ? `${detailPath}?slug=${encodeURIComponent(item.slug)}` : detailPath
  }
  const icon = (name) => withBase(`/assets/svgs/${name}`)
  const image = (item) => withBase(item.image || '/assets/images/default.jpg')

  const card = (item) => `
    <article class="group relative bg-primary-white hover:rounded-[10px] overflow-hidden w-full h-full flex flex-col p-2 md:p-2.5 pb-3 md:pb-4 hover:shadow-[2px_2px_15px_0_rgba(21,56,152,0.2)] transition-all duration-300 cursor-pointer">
      <a href="${newsLink(item)}" class="absolute inset-0 z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-inset" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
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
      <a href="${newsLink(item)}" class="absolute inset-0 z-30 rounded-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-inset md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
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
      <a href="${newsLink(item)}" class="absolute inset-0 z-30 rounded-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-inset md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
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
        <a href="${newsLink(item)}" class="absolute inset-0 z-30 rounded-[5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-inset md:rounded-[8px] group-hover:rounded-[8px] md:group-hover:rounded-lg" aria-label="${escapeHtml(item.title)}"><span class="sr-only">${escapeHtml(item.title)}</span></a>
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

  const appointmentBadgeClass = (type = '') => {
    const normalized = type.toLowerCase()
    if (normalized.includes('bổ nhiệm lại')) return 'bg-[#EDE9FE] text-[#6D28D9]'
    if (normalized.includes('điều động')) return 'bg-[#DDF6EA] text-[#087A55]'
    return 'bg-secondary-blue-light text-primary-dark-blue'
  }

  const appointmentSection = (limit = 4) => {
    const appointments = items.filter((item) => item.kind === 'appointment').slice(0, limit)
    const [featured, ...recent] = appointments

    if (!featured) {
      return `
        <div class="flex min-h-72 w-full flex-col items-center justify-center px-6 text-center">
          <p class="font-inter text-base font-semibold text-title">Chưa có hoạt động bổ nhiệm</p>
          <p class="mt-2 font-roboto text-sm leading-6 text-gray-700">Các quyết định mới sẽ được cập nhật tại đây.</p>
        </div>`
    }

    const featuredType = featured.appointmentType || featured.category || 'Bổ nhiệm'
    const recentItems = recent.map((item, index) => {
      const type = item.appointmentType || item.category || 'Bổ nhiệm'
      const isLast = index === recent.length - 1
      return `
        <li class="group relative grid grid-cols-[4.5rem_0.75rem_minmax(0,1fr)] gap-x-3 py-4 first:pt-2 last:pb-1">
          <time class="pt-0.5 font-roboto text-xs font-semibold leading-5 text-primary-dark-blue">${escapeHtml(item.date || '')}</time>
          <span class="relative flex justify-center" aria-hidden="true">
            <span class="relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full bg-primary-dark-blue ring-4 ring-[#F8FAFE]"></span>
            ${isLast ? '' : '<span class="absolute bottom-[-1rem] top-3 w-px bg-primary-dark-blue/15"></span>'}
          </span>
          <div class="min-w-0 pb-3">
            <span class="inline-flex rounded-md px-2 py-1 font-roboto text-[11px] font-bold uppercase tracking-wide ${appointmentBadgeClass(type)}">${escapeHtml(type)}</span>
            <h3 class="mt-2 font-inter text-sm font-bold leading-5 text-title transition-colors duration-200 group-hover:text-primary-dark-blue sm:text-[15px]">
              <a href="${newsLink(item)}" class="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow">${escapeHtml(item.title)}</a>
            </h3>
            <p class="mt-1 font-roboto text-xs leading-5 text-gray-700 line-clamp-2">${escapeHtml(item.excerpt || '')}</p>
          </div>
        </li>`
    }).join('')

    return `
      <div class="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article class="group relative min-h-[390px] overflow-hidden rounded-xl bg-primary-dark-blue shadow-[0_14px_32px_rgba(21,56,152,0.16)] md:min-h-[430px]">
          <a href="${newsLink(featured)}" class="absolute inset-0 z-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-inset" aria-label="${escapeHtml(featured.title)}"><span class="sr-only">${escapeHtml(featured.title)}</span></a>
          <img src="${image(featured)}" alt="${escapeHtml(featured.imageAlt || featured.title)}" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0B1F59] via-primary-dark-blue/55 to-transparent"></div>
          <div class="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex rounded-md bg-primary-white px-2.5 py-1 font-roboto text-[11px] font-bold uppercase tracking-wide text-primary-dark-blue">Mới nhất</span>
              <span class="inline-flex rounded-md px-2.5 py-1 font-roboto text-[11px] font-bold uppercase tracking-wide ${appointmentBadgeClass(featuredType)}">${escapeHtml(featuredType)}</span>
            </div>
            <time class="mt-4 block font-roboto text-sm font-medium text-primary-white/85">${escapeHtml(featured.date || '')}</time>
            <h3 class="mt-2 font-inter text-xl font-bold leading-tight text-primary-white sm:text-2xl">${escapeHtml(featured.title)}</h3>
            <p class="mt-3 font-roboto text-sm leading-6 text-primary-white/85 line-clamp-3">${escapeHtml(featured.excerpt || '')}</p>
            <span class="mt-5 inline-flex items-center gap-2 font-roboto text-sm font-semibold text-primary-white">
              Xem chi tiết
              <img src="${icon('icon-arrow-up-right.svg')}" alt="" class="h-4 w-4 brightness-0 invert transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
            </span>
          </div>
        </article>

        <div class="min-w-0 rounded-xl bg-primary-white px-4 py-3 shadow-[0_8px_24px_rgba(21,56,152,0.08)] sm:px-5">
          <p class="border-b border-stroke pb-3 font-inter text-xs font-bold uppercase tracking-[0.12em] text-primary-dark-blue">Quyết định gần đây</p>
          <ol>${recentItems}</ol>
        </div>
      </div>`
  }

  const detailArticle = (item, index) => `
      <article data-news-detail-article data-news-slug="${escapeHtml(item.slug || '')}" ${index === 0 ? '' : 'hidden'} class="${index === 0 ? '' : 'hidden '}bg-white rounded-2xl border border-stroke shadow-sm p-4 md:p-6">
        <div class="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
          ${item.kind === 'appointment' ? `<span class="self-start rounded-md px-2.5 py-1 font-roboto text-xs font-bold uppercase tracking-wide ${appointmentBadgeClass(item.appointmentType || item.category)}">${escapeHtml(item.appointmentType || item.category || 'Bổ nhiệm')}</span>` : ''}
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
        ${item.sourceUrl ? `<div class="mt-8 border-t border-stroke pt-4 font-roboto text-sm text-gray-700">Nguồn: <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-dark-blue underline decoration-primary-dark-blue/30 underline-offset-4 hover:decoration-primary-dark-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow">${escapeHtml(item.sourceName || 'Website chính thức')}</a></div>` : ''}
      </article>`

  const detail = () => {
    if (!items.length) return '<p class="font-roboto text-gray-700">Chưa có nội dung tin tức.</p>'
    return `
      <div data-news-detail-view>
        <div data-news-detail-not-found hidden class="hidden rounded-2xl border border-stroke bg-white px-5 py-14 text-center shadow-sm md:px-8">
          <h1 class="font-inter text-xl font-bold text-primary-dark-blue md:text-2xl">Không tìm thấy bài viết</h1>
          <p class="mt-3 font-roboto text-sm leading-6 text-gray-700 md:text-base">Bài viết có thể đã được đổi địa chỉ hoặc không còn tồn tại.</p>
          <a href="${withBase('/news.html')}" class="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-primary-dark-blue px-6 font-roboto text-sm font-semibold text-primary-dark-blue transition-colors hover:bg-primary-dark-blue hover:text-primary-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-offset-2">Về trang tin tức</a>
        </div>
        ${items.map(detailArticle).join('')}
      </div>`
  }

  const stripNewsAttrs = (openTag) =>
    openTag
      .replace(/\sdata-news-[\w-]+(?:=["'][^"']*["'])?/g, '')
      .replace(/\sdata-limit=["'][^"']*["']/g, '')

  const replaceInner = (html, attr, render) => {
    const elementPattern = new RegExp(`(<([a-z][\\w-]*)[^>]*\\s${attr}(?:\\s[^>]*)?>)[\\s\\S]*?(<\\/\\2>)`, 'gi')
    return html.replace(elementPattern, (match, open, _tag, close) => `${stripNewsAttrs(open)}${render(match)}${close}`)
  }

  return (html) => {
    let result = html
    result = result.replace(/(<section[^>]*\sdata-news-section(?:\s[^>]*)?>)[\s\S]*?(<\/section>)/g, (match, open, close) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 5)
      return `${stripNewsAttrs(open)}${section(limit)}${close}`
    })
    result = result.replace(/(<div[^>]*\sdata-news-appointment-section(?:\s[^>]*)?>)[\s\S]*?(<\/div>)/g, (match, open, close) => {
      const limit = Number(match.match(/data-limit=["']([^"']+)["']/)?.[1] || 4)
      return `${stripNewsAttrs(open)}${appointmentSection(limit)}${close}`
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
