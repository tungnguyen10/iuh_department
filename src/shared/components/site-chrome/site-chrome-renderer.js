import { escapeHtml } from '../../js/escape-html.js'

const INTERNAL_HREF_RE = /^\//
const MARKER_RE = (name) => new RegExp(`<([a-z][\\w-]*)([^>]*?)\\sdata-site-${name}(?:=["'][^"']*["'])?([^>]*)>\\s*</\\1>`, 'gi')

const normalizeBase = (base) => {
  if (!base || base === '/') return '/'
  return `/${base.replace(/^\/+|\/+$/g, '')}/`
}

export const createSiteChromeRenderer = ({ base, site }) => {
  const normalizedBase = normalizeBase(base)
  const withBase = (href) => {
    if (href.startsWith('//')) return href
    if (!INTERNAL_HREF_RE.test(href)) return href
    if (normalizedBase === '/') return href
    return `${normalizedBase}${href.slice(1)}`
  }
  const href = (value) => escapeHtml(withBase(value))
  const asset = (name) => href(`/assets/svgs/${name}`)
  const linkAttrs = (value) => /^https?:\/\//i.test(value) ? ' target="_blank" rel="noopener noreferrer"' : ''

  const quickLinks = () => site.quickLinks.map((item, index) => `
    ${index ? '<span class="h-full w-auto border-l-[1px] border-stroke relative"></span>' : ''}
    <a href="${href(item.href)}"${linkAttrs(item.href)} class="flex items-center gap-2.5 px-1.5 py-0.5 font-medium text-sm text-primary-dark-blue rounded-[5px] hover:text-primary-yellow transition-colors">${escapeHtml(item.text)}</a>`).join('')

  const mobileQuickLinks = () => site.quickLinks.map((item) => `
    <a href="${href(item.href)}"${linkAttrs(item.href)} class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
      <div class="w-9 h-9 flex items-center justify-center"><img src="${asset(item.icon)}" alt="" class="w-6 h-6 text-primary-dark-blue" /></div>
      <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">${escapeHtml(item.text)}</span>
    </a>`).join('')

  const submenu = (items) => items.map((item) => {
    if (item.href) {
      return `<a href="${href(item.href)}"${linkAttrs(item.href)} class="block px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 border-b border-gray-100"><span class="font-medium">${escapeHtml(item.text)}</span></a>`
    }
    return `<div class="relative group/sub" data-subdropdown>
      <span class="flex items-center justify-between px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 border-b border-gray-100 cursor-pointer"><span class="font-medium">${escapeHtml(item.text)}</span><img src="${asset('chevron-right.svg')}" alt="" class="chevron-icon w-4 h-4" /></span>
      <div class="sub-dropdown absolute top-0 left-full min-w-[220px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-r-lg opacity-0 invisible pointer-events-none xl:group-hover/sub:opacity-100 xl:group-hover/sub:visible xl:group-hover/sub:pointer-events-auto transition-all duration-300 overflow-hidden z-50" data-subdropdown-menu>
        <div class="border-t-2 border-primary-yellow"></div>${submenu(item.children)}
      </div>
    </div>`
  }).join('')

  const navigation = () => site.navigation.map((item) => {
    const topClass = 'flex items-center justify-center px-3 h-full text-primary-white font-medium text-[16px] xl:hover:bg-white/10 xl:hover:text-primary-yellow transition-all duration-200 relative before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary-yellow before:scale-x-0 xl:hover:before:scale-x-100 before:transition-transform before:duration-300'
    if (item.href) return `<div class="nav-item-dropdown relative group h-full" data-dropdown><a href="${href(item.href)}" class="${topClass}">${escapeHtml(item.text)}</a></div>`
    return `<div class="nav-item-dropdown relative group h-full" data-dropdown>
      <span class="${topClass} cursor-pointer">${escapeHtml(item.text)}</span>
      <div class="dropdown-menu absolute top-full min-w-[250px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-b-lg opacity-0 invisible translate-y-2 xl:group-hover:opacity-100 xl:group-hover:visible xl:group-hover:translate-y-0 transition-all duration-300 z-50" data-dropdown-menu>
        <div class="border-t-2 border-primary-yellow"></div>${submenu(item.children)}
      </div>
    </div>`
  }).join('')

  const footerIdentity = () => `<h3 class="text-lg md:text-xl font-inter font-bold text-primary-dark-blue">${escapeHtml(site.identity.unitName)} - IUH</h3>
    <div class="flex flex-col gap-2.5 text-sm md:text-base text-primary-dark-blue">
      <div class="flex items-start gap-2"><img src="${asset('icon-user-location.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 mt-0.5 shrink-0"><span class="text-title">Địa chỉ: ${escapeHtml(site.identity.address)}</span></div>
      <div class="flex items-center gap-2"><img src="${asset('icon-phone-dial.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 shrink-0"><a href="tel:${escapeHtml(site.identity.phone.href)}" class="text-title">Điện thoại: ${escapeHtml(site.identity.phone.text)}</a></div>
      <div class="flex items-center gap-2"><img src="${asset('icon-mail-forward.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5 shrink-0"><a href="mailto:${escapeHtml(site.identity.email)}" class="text-title">Email: ${escapeHtml(site.identity.email)}</a></div>
    </div>`

  const footerColumns = () => site.footer.columns.map((column) => `<div class="flex flex-col gap-3 md:gap-5">
    <div class="flex items-center gap-1.5"><img src="${asset('icon-iuh-small.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5"><h3 class="text-base md:text-lg font-medium text-primary-dark-blue font-roboto">${escapeHtml(column.title)}</h3></div>
    <ul class="flex flex-col gap-2 md:gap-2.5">${column.links.map((item) => `<li><a href="${href(item.href)}"${linkAttrs(item.href)} class="group flex items-center gap-1.5 text-sm md:text-base text-gray-900 font-roboto hover:text-primary-dark-blue transition-colors duration-200"><img src="${asset('icon-arrow-right.svg')}" alt="" class="w-0 group-hover:w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"><span>${escapeHtml(item.text)}</span></a></li>`).join('')}</ul>
  </div>`).join('')

  const socialHoverClasses = {
    'icon-facebook.svg': 'hover:text-[#1877F2]',
    'icon-instagram.svg': 'hover:text-[#E4405F]',
    'icon-youtube.svg': 'hover:text-[#FF0000]',
  }
  const socialLinks = () => `<div class="flex flex-col gap-3 md:gap-5">
    <div class="flex items-center gap-1.5"><img src="${asset('icon-iuh-small.svg')}" alt="" class="w-4 h-4 md:w-5 md:h-5"><h3 class="text-base md:text-lg font-medium text-primary-dark-blue font-roboto">Mạng xã hội</h3></div>
    <ul class="flex flex-col gap-2 md:gap-2.5">${site.footer.socialLinks.map((item) => `<li><a href="${href(item.href)}"${linkAttrs(item.href)} class="group flex items-center gap-2 md:gap-2.5 text-sm md:text-base text-gray-700 ${socialHoverClasses[item.icon] || 'hover:text-primary-dark-blue'} font-roboto transition-colors duration-200"><img src="${asset(item.icon)}" alt="" class="w-5 h-5 md:w-6 md:h-6"><span>${escapeHtml(item.text)}</span></a></li>`).join('')}</ul>
  </div>`

  const replacements = {
    'quick-links': quickLinks,
    'unit-name': () => escapeHtml(site.identity.unitName),
    'organization-name': () => escapeHtml(site.identity.organizationName),
    email: () => `<img src="${asset('icon-mail-forward.svg')}" alt="" class="w-6 h-6 shrink-0"><a href="mailto:${escapeHtml(site.identity.email)}" class="font-medium text-[14px] text-black group-hover:text-primary-yellow">${escapeHtml(site.identity.email)}</a>`,
    phone: () => `<img src="${asset('icon-phone-dial.svg')}" alt="" class="w-6 h-6 shrink-0"><a href="tel:${escapeHtml(site.identity.phone.href)}" class="font-medium text-[14px] text-black group-hover:text-primary-yellow">${escapeHtml(site.identity.phone.text)}</a>`,
    'primary-nav': navigation,
    'mobile-quick-links': mobileQuickLinks,
    'footer-identity': footerIdentity,
    'map-address': () => escapeHtml(site.identity.mapAddress),
    'footer-columns': footerColumns,
    'social-links': socialLinks,
    copyright: () => `${escapeHtml(site.identity.unitName)} - ${escapeHtml(site.identity.organizationName)}`,
  }

  return (html) => {
    let rendered = html
    for (const [marker, render] of Object.entries(replacements)) {
      rendered = rendered.replace(
        MARKER_RE(marker),
        (_match, tag, attributesBefore, attributesAfter) => `<${tag}${attributesBefore}${attributesAfter}>${render()}</${tag}>`,
      )
    }
    rendered = rendered.replace(/<a\b([^>]*?)\sdata-site-home-link([^>]*)>/gi, (_match, before, after) => {
      const attributes = `${before}${after}`.replace(/\s+href=["'][^"']*["']/i, '')
      return `<a${attributes} href="${href('/')}">`
    })
    if (/data-site-[\w-]+/.test(rendered)) throw new Error('Site chrome rendering left unresolved data-site markers')
    if (/\{\{[^}]+\}\}/.test(rendered)) throw new Error('Site chrome rendering left unresolved placeholders')
    return rendered
  }
}
