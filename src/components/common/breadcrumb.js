/**
 * Breadcrumb Component JavaScript
 * Handles dynamic breadcrumb rendering
 */

export function initBreadcrumb() {
  const breadcrumbs = document.querySelectorAll('[data-breadcrumb]')
  
  breadcrumbs.forEach(breadcrumb => {
    const itemsData = breadcrumb.getAttribute('data-breadcrumb')
    if (!itemsData) return
    
    try {
      const items = JSON.parse(itemsData)
      const container = breadcrumb.querySelector('ol')
      if (!container) return
      
      container.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1
        
        if (isLast) {
          // Last item - active state (dark blue, no link)
          return `
            <li class="flex items-center gap-5">
              <span class="font-roboto font-normal text-primary-dark-blue">${item.text}</span>
            </li>
          `
        } else {
          // Regular item with separator
          return `
            <li class="flex items-center gap-5">
              <a href="${item.link}" class="font-roboto font-normal text-gray-700 hover:text-primary-dark-blue transition-colors">
                ${item.text}
              </a>
              <span class="font-roboto font-medium text-gray-700">/</span>
            </li>
          `
        }
      }).join('')
      
    } catch (error) {
      console.error('Failed to parse breadcrumb items:', error)
    }
  })
}
