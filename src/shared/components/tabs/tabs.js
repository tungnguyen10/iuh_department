/**
 * Generic Reusable Tabs Component
 * Usage 1 - Manual HTML (Recommended):
 * <div class="tabs-container">
 *   <div class="tabs-nav">
 *     <button class="tab-btn active" data-tab="tab1">Tab 1</button>
 *     <button class="tab-btn" data-tab="tab2">Tab 2</button>
 *   </div>
 *   <div class="tabs-content">
 *     <div class="tab-panel" data-tab-panel="tab1">Content 1</div>
 *     <div class="tab-panel hidden" data-tab-panel="tab2">Content 2</div>
 *   </div>
 * </div>
 * 
 * Usage 2 - JSON Config (Auto-generate):
 * <div data-tabs='{"tabs":[...]}'>
 *   <div data-tab-panel="tab1">Content 1</div>
 * </div>
 */

export class Tabs {
  constructor(element) {
    this.element = element
    this.activeIndex = 0
    
    // Check if using manual HTML or JSON config
    if (element.dataset.tabs) {
      this.initFromJSON()
    } else {
      this.initFromHTML()
    }
  }

  initFromHTML() {
    // Find existing buttons and panels
    this.buttons = Array.from(this.element.querySelectorAll('.tab-btn[data-tab]'))
    this.panels = Array.from(this.element.querySelectorAll('.tab-panel[data-tab-panel]'))
    
    if (!this.buttons.length || !this.panels.length) {
      console.warn('[Tabs] No tab buttons or panels found')
      return
    }
    
    // Find active index
    this.activeIndex = this.buttons.findIndex(btn => btn.classList.contains('active'))
    if (this.activeIndex === -1) this.activeIndex = 0
    
    // Attach click handlers
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.showTab(index))
    })
  }

  initFromJSON() {
    // Original JSON-based initialization
    const config = JSON.parse(this.element.dataset.tabs)
    
    if (!config.tabs || !config.tabs.length) {
      console.warn('[Tabs] No tabs configuration found')
      return
    }
    
    this.tabs = config.tabs
    this.panels = Array.from(this.element.querySelectorAll('[data-tab-panel]'))
    
    // Create tab navigation
    this.createTabNav()
    this.activeIndex = 0
    this.showTab(0)
  }

  createTabNav() {
    const ICONS = {
      bell: 'M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z',
      lightbulb: 'M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z',
      document: 'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z',
      user: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z',
      info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
    }
    
    const nav = document.createElement('div')
    nav.className = 'flex gap-2 border-b border-stroke overflow-x-auto'
    
    this.buttons = []
    
    this.tabs.forEach((tab, index) => {
      const button = document.createElement('button')
      button.className = `tab-btn flex items-center gap-2 px-4 md:px-6 py-3 font-medium text-sm md:text-base transition-colors duration-200 whitespace-nowrap ${
        index === 0 ? 'active border-b-2 border-primary-dark-blue text-primary-dark-blue' : 'text-gray border-b-2 border-transparent'
      }`
      button.dataset.tab = tab.id
      
      // Add icon if specified
      if (tab.icon) {
        const iconPath = ICONS[tab.icon] || ICONS.info
        button.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="${iconPath}" clip-rule="evenodd"/>
          </svg>
          ${tab.label}
        `
      } else {
        button.textContent = tab.label
      }
      
      button.addEventListener('click', () => this.showTab(index))
      this.buttons.push(button)
      nav.appendChild(button)
    })
    
    this.element.insertBefore(nav, this.element.firstChild)
  }

  showTab(index) {
    if (index < 0 || index >= (this.buttons?.length || 0)) return
    
    this.activeIndex = index
    const button = this.buttons[index]
    const tabId = button.dataset.tab
    
    // Update buttons
    this.buttons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active', 'border-b-2', 'border-primary-dark-blue', 'text-primary-dark-blue')
        btn.classList.remove('text-gray', 'border-transparent')
      } else {
        btn.classList.remove('active', 'border-primary-dark-blue', 'text-primary-dark-blue')
        btn.classList.add('text-gray', 'border-transparent')
      }
    })
    
    // Update panels
    this.panels.forEach((panel) => {
      if (panel.dataset.tabPanel === tabId) {
        panel.classList.remove('hidden')
      } else {
        panel.classList.add('hidden')
      }
    })
    
    // Dispatch custom event
    this.element.dispatchEvent(new CustomEvent('tabchange', {
      detail: { index, tabId }
    }))
  }

  destroy() {
    this.element = null
    this.buttons = []
    this.panels = []
  }
}

/**
 * Auto-initialize tabs on elements with class or data attribute
 */
export function initTabs(container = document) {
  const tabElements = container.querySelectorAll('.tabs-container, [data-tabs]')
  const instances = []
  
  tabElements.forEach(element => {
    instances.push(new Tabs(element))
  })
  
  return instances
}

// Auto-init disabled - initialized via main.js on demand
// if (typeof window !== 'undefined') {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => initTabs())
//   } else {
//     initTabs()
//   }
// }
