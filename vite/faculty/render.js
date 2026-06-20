import { resolve } from 'path'
import { existsSync } from 'fs'
import { FACULTY_COLOR_KEYS, SOCIAL_CONFIG } from '../constants.js'
import { escapeHtml, hexToRgbSpace, withBaseFactory } from '../utils.js'

export const buildFacultyCssVars = (faculty) => {
  const declarations = FACULTY_COLOR_KEYS
    .map((key) => `--color-${key}: ${hexToRgbSpace(faculty.colors[key])};`)
    .join('')
  return `<style>:root{${declarations}}</style>`
}

export const generateNavHtml = (navArray, base) => {
  const withBase = withBaseFactory(base)
  const baseItemClass =
    'flex items-center justify-center px-3 h-full text-primary-white font-medium text-[16px] xl:hover:bg-white/10 xl:hover:text-primary-yellow transition-all duration-200 relative before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary-yellow before:scale-x-0 xl:hover:before:scale-x-100 before:transition-transform before:duration-300'
  const dropdownItemClass =
    'block px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 border-b border-gray-100 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-yellow before:scale-y-0 xl:hover:before:scale-y-100 before:transition-transform'
  const dropdownItemLastClass =
    'block px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-yellow before:scale-y-0 xl:hover:before:scale-y-100 before:transition-transform'

  const renderTrigger = (item, extraClass = '') => {
    const classes = `${baseItemClass}${extraClass ? ` ${extraClass}` : ''}`
    const label = escapeHtml(item.label)
    if (item.url) {
      return `<a href="${escapeHtml(withBase(item.url))}" class="${classes}">${label}</a>`
    }
    return `<span class="${classes} cursor-pointer">${label}</span>`
  }

  const renderLevelThree = (items = []) =>
    items
      .map((item, index) => {
        const itemClass = index === items.length - 1 ? dropdownItemLastClass : dropdownItemClass
        return `<a href="${escapeHtml(withBase(item.url || '#'))}" class="${itemClass}"><span class="font-medium">${escapeHtml(item.label)}</span></a>`
      })
      .join('')

  const renderLevelTwo = (items = []) =>
    items
      .map((item, index) => {
        if (Array.isArray(item.children) && item.children.length > 0) {
          return `<div class="relative group/sub" data-subdropdown>
  <span class="flex items-center justify-between px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 ${index === items.length - 1 ? '' : 'border-b border-gray-100 '}relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-yellow before:scale-y-0 xl:hover:before:scale-y-100 before:transition-transform cursor-pointer">
    <span class="font-medium">${escapeHtml(item.label)}</span>
    <img src="/assets/svgs/chevron-right.svg" alt="" class="chevron-icon w-4 h-4 transition-transform duration-200 xl:group-hover/sub:translate-x-1" />
  </span>
  <div class="sub-dropdown absolute top-0 left-full min-w-[220px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-r-lg opacity-0 invisible pointer-events-none xl:group-hover/sub:opacity-100 xl:group-hover/sub:visible xl:group-hover/sub:pointer-events-auto transition-all duration-300 overflow-hidden z-50" data-subdropdown-menu>
    <div class="border-t-2 border-primary-yellow"></div>
    ${renderLevelThree(item.children)}
  </div>
</div>`
        }

        const itemClass = index === items.length - 1 ? dropdownItemLastClass : dropdownItemClass
        return `<a href="${escapeHtml(withBase(item.url || '#'))}" class="${itemClass}"><span class="font-medium">${escapeHtml(item.label)}</span></a>`
      })
      .join('')

  return navArray
    .map((item) => {
      if (Array.isArray(item.children) && item.children.length > 0) {
        return `<div class="nav-item-dropdown relative group h-full" data-dropdown>
  ${renderTrigger(item, 'cursor-pointer')}
  <div class="dropdown-menu absolute top-full min-w-[250px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-b-lg opacity-0 invisible translate-y-2 xl:group-hover:opacity-100 xl:group-hover:visible xl:group-hover:translate-y-0 transition-all duration-300 z-50" data-dropdown-menu>
    <div class="border-t-2 border-primary-yellow"></div>
    ${renderLevelTwo(item.children)}
  </div>
</div>`
      }

      return `<div class="nav-item-dropdown relative group h-full" data-dropdown>${renderTrigger(item)}</div>`
    })
    .join('')
}

export const generateTopBarHtml = (topBarArray, base) => {
  const withBase = withBaseFactory(base)
  return topBarArray
    .map(
      (item, index) =>
        `${index > 0 ? '<span class="h-full w-auto border-l-[1px] border-stroke relative"></span>' : ''}<a href="${escapeHtml(withBase(item.url || '#'))}" class="flex items-center gap-2.5 px-1.5 py-0.5 font-medium text-sm text-primary-dark-blue rounded-[5px] hover:text-primary-yellow transition-colors">${escapeHtml(item.label)}</a>`
    )
    .join('')
}

export const generateMobileTopBarHtml = (topBarArray, faculty, base) => {
  const withBase = withBaseFactory(base)
  const quickLinks = topBarArray.slice(0, 3).map((item, index) => {
    const icons = [
      '/assets/svgs/icon-briefcase.svg',
      '/assets/svgs/icon-graduation-cap.svg',
      '/assets/svgs/icon-building.svg',
    ]
    return `<a href="${escapeHtml(withBase(item.url || '#'))}" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="${icons[index]}" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">${escapeHtml(item.label)}</span>
</a>`
  })

  return `${quickLinks.join('')}
<a href="#" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="/assets/svgs/icon-article.svg" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">E-OFFICE</span>
</a>
<a href="mailto:${escapeHtml(faculty.email)}" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="/assets/svgs/icon-mail-outline.svg" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">Email</span>
</a>
<a href="tel:${escapeHtml(faculty.phone.replace(/[^\d+]/g, ''))}" class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
  <div class="w-9 h-9 flex items-center justify-center">
    <img src="/assets/svgs/icon-phone.svg" alt="" class="w-6 h-6 text-primary-dark-blue" />
  </div>
  <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">Hotline</span>
</a>`
}

export const generateSocialHtml = (social = {}) =>
  Object.entries(SOCIAL_CONFIG)
    .filter(([key]) => Boolean(social[key]))
    .map(
      ([key, config]) => `<li>
  <a href="${escapeHtml(social[key])}" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-2 md:gap-2.5 text-sm md:text-base text-gray-700 ${config.hoverClass} font-roboto transition-colors duration-200">
    <img src="${config.icon}" alt="" class="w-5 h-5 md:w-6 md:h-6">
    <span>${config.label}</span>
  </a>
</li>`
    )
    .join('')

export const applyFacultyTemplateVars = (html, faculty, base) => {
  const replacements = {
    '{{faculty.id}}': escapeHtml(faculty.id),
    '{{faculty.name}}': escapeHtml(faculty.name),
    '{{faculty.shortName}}': escapeHtml(faculty.shortName),
    '{{faculty.email}}': escapeHtml(faculty.email),
    '{{faculty.phone}}': escapeHtml(faculty.phone),
    '{{faculty.navHtml}}': generateNavHtml(faculty.nav, base),
    '{{faculty.topBarHtml}}': generateTopBarHtml(faculty.topBar, base),
    '{{faculty.mobileTopBarHtml}}': generateMobileTopBarHtml(faculty.topBar, faculty, base),
    '{{faculty.socialHtml}}': generateSocialHtml(faculty.social),
  }

  let result = html
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.split(placeholder).join(value)
  }
  return result
}

export const resolveIncludePath = (rootDir, htmlPath, facultyId) => {
  if (htmlPath.startsWith('@faculty/')) {
    const relativePath = htmlPath.slice('@faculty/'.length)
    const facultyComponentPath = resolve(rootDir, 'src/faculties', facultyId, 'components', relativePath)
    if (existsSync(facultyComponentPath)) {
      return facultyComponentPath
    }
    return resolve(rootDir, 'src/components', relativePath)
  }

  let componentPath = htmlPath
  if (htmlPath.startsWith('@components/')) {
    componentPath = htmlPath.replace('@components/', 'components/')
  } else if (htmlPath.startsWith('@/')) {
    componentPath = htmlPath.substring(2)
  } else if (htmlPath.startsWith('../')) {
    componentPath = htmlPath.replace(/^\.\.\//, '')
  } else if (htmlPath.startsWith('./')) {
    componentPath = `pages/${htmlPath.slice(2)}`
  } else if (htmlPath.startsWith('/')) {
    componentPath = htmlPath.substring(1)
  }

  return resolve(rootDir, 'src', componentPath)
}
