/**
 * Module Manager - Dev Tool for toggling homepage modules with UI
 * Usage:
 * - Press Ctrl+Shift+M to toggle UI panel
 * - Or use console: SUGI.toggleModule('news', false)
 */

const STORAGE_KEY = 'sugi_module_states'
const ORDER_KEY = 'sugi_module_order'
const ORDER_SOURCE_KEY = 'sugi_module_order_source'

const DEFAULT_ORDER = [
  'carousel',
  'intro',
  'major',
  'admission',
  'stats',
  'rules-guide',
  'activities',
  'news',
  'career-support',
  'infrastructure',
  'research',
  'industry-careers',
  'partners'
]

const DEFAULT_MODULES = {
  carousel: true,
  intro: true,
  major: true,
  admission: true,
  stats: true,
  'rules-guide': true,
  activities: true,
  news: true,
  infrastructure: true,
  'career-support': true,
  research: true,
  'industry-careers': true,
  partners: true
}

const MODULE_LABELS = {
  carousel: 'Hero Carousel',
  intro: 'Giới Thiệu Khoa',
  major: 'Chuyên Ngành',
  admission: 'Tuyển Sinh',
  stats: 'Thống Kê',
  news: 'Tin Tức - Sự Kiện',
  'rules-guide': 'Nội Quy & Hướng Dẫn',
  activities: 'Hoạt Động & Phong Trào',
  'career-support': 'Hỗ Trợ Nghề Nghiệp',
  infrastructure: 'Cơ Sở Vật Chất',
  research: 'Nghiên Cứu',
  'industry-careers': 'Hợp Tác & Nghề Nghiệp',
  partners: 'Đối Tác'
}

class ModuleManager {
  constructor() {
    this.modules = this.loadState()
    this.moduleOrder = this.loadOrder()
    this.draggedItem = null
    this.panel = null
    this.isVisible = false
    this.initModules()
    this.createUI()
    this.bindKeyboard()
    
    // Apply saved order on page load
    setTimeout(() => this.applyModuleOrder(), 50)
  }

  /**
   * Create UI Panel
   */
  createUI() {
    // Create panel container
    this.panel = document.createElement('div')
    this.panel.id = 'sugi-module-panel'
    this.panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 320px;
      max-height: 80vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: 'Inter', system-ui, sans-serif;
      overflow: hidden;
      display: none;
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = `
      padding: 16px 20px;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `
    header.innerHTML = `
      <div>
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 2px;">SUGI Module Manager</div>
        <div style="font-size: 11px; opacity: 0.9;">Drag items to reorder • Click checkbox to toggle</div>
      </div>
      <button id="sugi-close-btn" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        transition: background 0.2s;
      ">×</button>
    `

    // Content container
    const content = document.createElement('div')
    content.style.cssText = `
      max-height: calc(80vh - 140px);
      overflow-y: auto;
      padding: 16px 20px;
    `

    // Module checkboxes with drag & drop
    this.moduleOrder.forEach((moduleName, index) => {
      const item = document.createElement('div')
      item.draggable = true
      item.dataset.module = moduleName
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 10px 8px 10px 12px;
        margin-bottom: 6px;
        border-radius: 8px;
        cursor: grab;
        transition: all 0.2s;
        background: #f8fafc;
        border: 2px solid transparent;
      `
      item.onmouseenter = () => item.style.background = '#e0f2fe'
      item.onmouseleave = () => item.style.background = '#f8fafc'

      // Order number indicator
      const orderNum = document.createElement('span')
      orderNum.className = 'order-indicator'
      orderNum.textContent = (index + 1).toString()
      orderNum.style.cssText = `
        display: inline-block;
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        background: #e0f2fe;
        color: #1e40af;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        margin-right: 8px;
        flex-shrink: 0;
      `

      // Checkbox wrapper
      const label = document.createElement('label')
      label.style.cssText = 'display: flex; align-items: center; flex: 1; cursor: pointer;'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.dataset.module = moduleName
      checkbox.checked = this.modules[moduleName]
      checkbox.style.cssText = `
        width: 18px;
        height: 18px;
        margin-right: 12px;
        cursor: pointer;
        accent-color: #1e40af;
      `
      checkbox.onchange = (e) => this.toggleModule(moduleName, e.target.checked)

      const labelText = document.createElement('span')
      labelText.textContent = MODULE_LABELS[moduleName] || moduleName
      labelText.style.cssText = `
        font-size: 14px;
        color: #1e293b;
        font-weight: 500;
        flex: 1;
      `

      label.appendChild(checkbox)
      label.appendChild(labelText)

      item.appendChild(orderNum)
      item.appendChild(label)

      // Bind drag events
      this.bindDragEvents(item)

      content.appendChild(item)
    })

    // Footer buttons
    const footer = document.createElement('div')
    footer.style.cssText = `
      padding: 12px 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    `

    const btnStyle = `
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `

    const enableAllBtn = document.createElement('button')
    enableAllBtn.textContent = 'Enable All'
    enableAllBtn.style.cssText = btnStyle + 'background: #059669; color: white;'
    enableAllBtn.onmouseenter = () => enableAllBtn.style.background = '#047857'
    enableAllBtn.onmouseleave = () => enableAllBtn.style.background = '#059669'
    enableAllBtn.onclick = () => this.enableAll()

    const disableAllBtn = document.createElement('button')
    disableAllBtn.textContent = 'Disable All'
    disableAllBtn.style.cssText = btnStyle + 'background: #dc2626; color: white;'
    disableAllBtn.onmouseenter = () => disableAllBtn.style.background = '#b91c1c'
    disableAllBtn.onmouseleave = () => disableAllBtn.style.background = '#dc2626'
    disableAllBtn.onclick = () => this.disableAll()

    const resetBtn = document.createElement('button')
    resetBtn.textContent = 'Reset'
    resetBtn.style.cssText = btnStyle + 'background: #64748b; color: white;'
    resetBtn.onmouseenter = () => resetBtn.style.background = '#475569'
    resetBtn.onmouseleave = () => resetBtn.style.background = '#64748b'
    resetBtn.onclick = () => this.resetDefault()

    footer.appendChild(enableAllBtn)
    footer.appendChild(disableAllBtn)
    footer.appendChild(resetBtn)

    // Assemble panel
    this.panel.appendChild(header)
    this.panel.appendChild(content)
    this.panel.appendChild(footer)
    document.body.appendChild(this.panel)

    // Bind close button
    document.getElementById('sugi-close-btn').onclick = () => this.hideUI()
  }

  /**
   * Bind keyboard shortcut (Ctrl+Shift+M)
   */
  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault()
        this.toggleUI()
      }
    })
  }

  /**
   * Show UI Panel
   */
  showUI() {
    if (this.panel) {
      this.panel.style.display = 'block'
      this.isVisible = true
    }
  }

  /**
   * Hide UI Panel
   */
  hideUI() {
    if (this.panel) {
      this.panel.style.display = 'none'
      this.isVisible = false
    }
  }

  /**
   * Toggle UI Panel visibility
   */
  toggleUI() {
    if (this.isVisible) {
      this.hideUI()
    } else {
      this.showUI()
    }
  }

  /**
   * Update checkbox state in UI
   */
  updateCheckbox(moduleName, enabled) {
    const checkbox = this.panel?.querySelector(`input[type="checkbox"][data-module="${moduleName}"]`)
    if (checkbox) {
      checkbox.checked = enabled
    }
  }

  /**
   * Bind drag & drop events to item
   */
  bindDragEvents(item) {
    item.addEventListener('dragstart', (e) => {
      this.draggedItem = item
      item.style.opacity = '0.5'
      item.style.cursor = 'grabbing'
      item.style.transform = 'scale(0.98)'
      item.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
      e.dataTransfer.effectAllowed = 'move'
    })

    item.addEventListener('dragend', () => {
      item.style.opacity = '1'
      item.style.cursor = 'grab'
      item.style.transform = 'scale(1)'
      item.style.boxShadow = 'none'
      
      // Clean all drop indicators
      const allItems = this.panel.querySelectorAll('[data-module]')
      allItems.forEach(i => {
        i.style.borderTop = '2px solid transparent'
        i.style.borderBottom = '2px solid transparent'
      })
      
      this.draggedItem = null
    })

    item.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      if (this.draggedItem && item !== this.draggedItem) {
        const rect = item.getBoundingClientRect()
        const midpoint = rect.top + rect.height / 2

        // Show drop zone indicator
        const allItems = this.panel.querySelectorAll('[data-module]')
        allItems.forEach(i => {
          i.style.borderTop = '2px solid transparent'
          i.style.borderBottom = '2px solid transparent'
        })

        if (e.clientY < midpoint) {
          item.style.borderTop = '2px solid #1e40af'
          item.parentNode.insertBefore(this.draggedItem, item)
        } else {
          item.style.borderBottom = '2px solid #1e40af'
          item.parentNode.insertBefore(this.draggedItem, item.nextSibling)
        }
      }
    })

    item.addEventListener('drop', (e) => {
      e.preventDefault()
      this.updateOrderFromDOM()
      this.applyModuleOrder()
      this.updateOrderIndicators()
    })
  }

  /**
   * Update module order from DOM structure
   */
  updateOrderFromDOM() {
    const items = this.panel.querySelectorAll('[data-module]')
    this.moduleOrder = Array.from(items).map(item => item.dataset.module)
    this.saveOrder()
    console.log('✓ Module order updated:', this.moduleOrder)
  }

  /**
   * Update order number indicators in UI
   */
  updateOrderIndicators() {
    const items = this.panel.querySelectorAll('[data-module]')
    items.forEach((item, index) => {
      const indicator = item.querySelector('.order-indicator')
      if (indicator) {
        indicator.textContent = (index + 1).toString()
      }
    })
  }

  /**
   * Apply module order to DOM
   */
  applyModuleOrder() {
    // Find the section container in index.html
    const container = document.querySelector('section.mx-auto') 
      || document.querySelector('main')
      || document.body

    const moduleElements = new Map(
      Array.from(container.children)
        .filter(element => element.dataset?.module)
        .map(element => [element.dataset.module, element])
    )
    const desiredModules = this.moduleOrder.filter(moduleName => moduleElements.has(moduleName))
    const currentModules = Array.from(container.children)
      .filter(element => this.moduleOrder.includes(element.dataset?.module))
      .map(element => element.dataset.module)

    const alreadyOrdered =
      desiredModules.length === currentModules.length
      && desiredModules.every((moduleName, index) => moduleName === currentModules[index])

    if (alreadyOrdered) {
      console.log('✓ Modules already in saved order')
      return
    }

    desiredModules.forEach(moduleName => {
      container.appendChild(moduleElements.get(moduleName))
    })

    console.log('✓ Modules reordered in DOM')
  }

  /**
   * Load module states from localStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_MODULES, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load module states:', error)
    }
    return { ...DEFAULT_MODULES }
  }

  /**
   * Save module states to localStorage
   */
  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.modules))
    } catch (error) {
      console.error('Failed to save module states:', error)
    }
  }

  /**
   * Load module order from localStorage
   */
  loadOrder() {
    const sourceOrder = this.getSourceModuleOrder()
    const sourceSignature = this.getOrderSignature(sourceOrder)

    try {
      const saved = localStorage.getItem(ORDER_KEY)
      const savedSource = localStorage.getItem(ORDER_SOURCE_KEY)

      if (saved && savedSource === sourceSignature) {
        return this.normalizeOrder(JSON.parse(saved))
      }

      if (saved && savedSource !== sourceSignature) {
        localStorage.removeItem(ORDER_KEY)
        localStorage.removeItem(ORDER_SOURCE_KEY)
        console.info('Source module order changed; using pages/index.html order')
      }
    } catch (error) {
      console.warn('Failed to load module order:', error)
    }

    return sourceOrder
  }

  /**
   * Use the HTML source order as the default so editing pages/index.html is
   * reflected immediately unless the dev tool has a saved custom order.
   */
  getSourceModuleOrder() {
    const container = document.querySelector('section.mx-auto')
      || document.querySelector('main')
      || document.body

    if (!container) return [...DEFAULT_ORDER]

    const sourceOrder = Array.from(container.children)
      .map(element => element.dataset?.module)
      .filter(Boolean)

    if (sourceOrder.length === 0) return [...DEFAULT_ORDER]

    const included = new Set(sourceOrder)
    DEFAULT_ORDER.forEach(moduleName => {
      if (!included.has(moduleName)) {
        sourceOrder.push(moduleName)
      }
    })

    return sourceOrder
  }

  /**
   * Store saved drag order against the current source order. When the source
   * order changes, the stale saved order is ignored automatically.
   */
  getOrderSignature(order = this.getSourceModuleOrder()) {
    return JSON.stringify(order)
  }

  /**
   * Keep saved order stable while inserting newly added modules at their
   * default neighbor position. This prevents new modules from being stranded
   * in the wrong place when localStorage still has an older order.
   */
  normalizeOrder(order) {
    const knownModules = new Set(DEFAULT_ORDER)
    const normalized = Array.isArray(order)
      ? order.filter(moduleName => knownModules.has(moduleName))
      : []
    const included = new Set(normalized)

    DEFAULT_ORDER.forEach((moduleName, defaultIndex) => {
      if (included.has(moduleName)) return

      let insertAt = normalized.length
      for (let index = defaultIndex + 1; index < DEFAULT_ORDER.length; index += 1) {
        const nextKnownModule = DEFAULT_ORDER[index]
        const nextCurrentIndex = normalized.indexOf(nextKnownModule)
        if (nextCurrentIndex !== -1) {
          insertAt = nextCurrentIndex
          break
        }
      }

      normalized.splice(insertAt, 0, moduleName)
      included.add(moduleName)
    })

    return normalized
  }

  /**
   * Save module order to localStorage
   */
  saveOrder() {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(this.moduleOrder))
      localStorage.setItem(ORDER_SOURCE_KEY, this.getOrderSignature())
    } catch (error) {
      console.error('Failed to save module order:', error)
    }
  }

  /**
   * Initialize modules - apply saved states to DOM
   */
  initModules() {
    Object.keys(this.modules).forEach(moduleName => {
      this.applyModuleState(moduleName, this.modules[moduleName])
    })
  }

  /**
   * Apply module state to DOM
   */
  applyModuleState(moduleName, enabled) {
    const element = document.querySelector(`[data-module="${moduleName}"]`)
    if (element) {
      if (enabled) {
        element.classList.remove('hidden')
      } else {
        element.classList.add('hidden')
      }
    }
  }

  /**
   * Toggle a single module
   */
  toggleModule(moduleName, enabled) {
    if (!(moduleName in this.modules)) {
      console.warn(`Module "${moduleName}" not found. Available modules:`, Object.keys(this.modules))
      return false
    }

    this.modules[moduleName] = enabled
    this.applyModuleState(moduleName, enabled)
    this.updateCheckbox(moduleName, enabled)
    this.saveState()

    console.log(`✓ Module "${moduleName}" ${enabled ? 'enabled' : 'disabled'}`)
    return true
  }

  /**
   * Enable all modules
   */
  enableAll() {
    Object.keys(this.modules).forEach(moduleName => {
      this.modules[moduleName] = true
      this.applyModuleState(moduleName, true)
      this.updateCheckbox(moduleName, true)
    })
    this.saveState()
    console.log('✓ All modules enabled')
  }

  /**
   * Disable all modules
   */
  disableAll() {
    Object.keys(this.modules).forEach(moduleName => {
      this.modules[moduleName] = false
      this.applyModuleState(moduleName, false)
      this.updateCheckbox(moduleName, false)
    })
    this.saveState()
    console.log('✓ All modules disabled')
  }

  /**
   * Get current module states
   */
  getModules() {
    const states = { ...this.modules }
    console.table(states)
    return states
  }

  /**
   * Reset to default state
   */
  resetDefault() {
    this.modules = { ...DEFAULT_MODULES }
    this.moduleOrder = this.getSourceModuleOrder()
    this.initModules()
    this.applyModuleOrder()
    
    // Recreate UI to reflect new order
    const content = this.panel.querySelector('div:nth-child(2)')
    if (content) {
      content.innerHTML = ''
      this.moduleOrder.forEach(moduleName => {
        // Recreate items (simplified - reuse createUI logic)
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = this.modules[moduleName]
        this.updateCheckbox(moduleName, this.modules[moduleName])
      })
    }
    
    this.saveState()
    this.saveOrder()
    console.log('✓ Reset to default configuration (state + order)')
    this.getModules()
    
    // Refresh UI
    this.hideUI()
    setTimeout(() => this.showUI(), 100)
  }
}

// Initialize and expose global API
const manager = new ModuleManager()

window.SUGI = {
  toggleModule: (name, enabled) => manager.toggleModule(name, enabled),
  enableAll: () => manager.enableAll(),
  disableAll: () => manager.disableAll(),
  getModules: () => manager.getModules(),
  getOrder: () => manager.moduleOrder,
  resetDefault: () => manager.resetDefault(),
  showUI: () => manager.showUI(),
  hideUI: () => manager.hideUI(),
  toggleUI: () => manager.toggleUI(),
  applyOrder: () => manager.applyModuleOrder()
}

// Dev mode info
if (import.meta.env.DEV) {
  console.log('%c🎨 SUGI Module Manager', 'color: #1e40af; font-size: 16px; font-weight: bold')
  console.log('%cPress Ctrl+Shift+M to toggle UI panel', 'color: #059669; font-size: 13px; font-weight: bold')
  console.log('%cDrag items to reorder modules', 'color: #f59e0b; font-size: 13px; font-weight: bold')
  console.log('%cOr use console commands:', 'color: #666; font-size: 12px')
  console.log('%c  SUGI.toggleUI()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.toggleModule(name, enabled)', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.getOrder()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.applyOrder()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.enableAll()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.disableAll()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.resetDefault()', 'color: #3b82f6; font-size: 12px')
}

export { manager as moduleManager }
