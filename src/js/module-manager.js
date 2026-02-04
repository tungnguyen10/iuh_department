/**
 * Module Manager - Dev Tool for toggling homepage modules with UI
 * Usage:
 * - Press Ctrl+Shift+M to toggle UI panel
 * - Or use console: SUGI.toggleModule('news', false)
 */

const STORAGE_KEY = 'sugi_module_states'

const DEFAULT_MODULES = {
  carousel: true,
  intro: true,
  major: true,
  admission: true,
  stats: true,
  news: true,
  infrastructure: true,
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
  infrastructure: 'Cơ Sở Vật Chất',
  research: 'Nghiên Cứu',
  'industry-careers': 'Hợp Tác & Nghề Nghiệp',
  partners: 'Đối Tác'
}

class ModuleManager {
  constructor() {
    this.modules = this.loadState()
    this.panel = null
    this.isVisible = false
    this.initModules()
    this.createUI()
    this.bindKeyboard()
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
        <div style="font-size: 11px; opacity: 0.9;">Toggle homepage modules</div>
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

    // Module checkboxes
    Object.keys(this.modules).forEach(moduleName => {
      const item = document.createElement('label')
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 10px 12px;
        margin-bottom: 6px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        background: #f8fafc;
      `
      item.onmouseenter = () => item.style.background = '#e0f2fe'
      item.onmouseleave = () => item.style.background = '#f8fafc'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = this.modules[moduleName]
      checkbox.dataset.module = moduleName
      checkbox.style.cssText = `
        width: 18px;
        height: 18px;
        margin-right: 12px;
        cursor: pointer;
        accent-color: #1e40af;
      `
      checkbox.onchange = (e) => this.toggleModule(moduleName, e.target.checked)

      const label = document.createElement('span')
      label.textContent = MODULE_LABELS[moduleName] || moduleName
      label.style.cssText = `
        font-size: 14px;
        color: #1e293b;
        font-weight: 500;
        flex: 1;
      `

      item.appendChild(checkbox)
      item.appendChild(label)
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
    const checkbox = this.panel?.querySelector(`input[data-module="${moduleName}"]`)
    if (checkbox) {
      checkbox.checked = enabled
    }
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
    this.initModules()
    Object.keys(this.modules).forEach(moduleName => {
      this.updateCheckbox(moduleName, this.modules[moduleName])
    })
    this.saveState()
    console.log('✓ Reset to default configuration')
    this.getModules()
  }
}

// Initialize and expose global API
const manager = new ModuleManager()

window.SUGI = {
  toggleModule: (name, enabled) => manager.toggleModule(name, enabled),
  enableAll: () => manager.enableAll(),
  disableAll: () => manager.disableAll(),
  getModules: () => manager.getModules(),
  resetDefault: () => manager.resetDefault(),
  showUI: () => manager.showUI(),
  hideUI: () => manager.hideUI(),
  toggleUI: () => manager.toggleUI()
}

// Dev mode info
if (import.meta.env.DEV) {
  console.log('%c🎨 SUGI Module Manager', 'color: #1e40af; font-size: 16px; font-weight: bold')
  console.log('%cPress Ctrl+Shift+M to toggle UI panel', 'color: #059669; font-size: 13px; font-weight: bold')
  console.log('%cOr use console commands:', 'color: #666; font-size: 12px')
  console.log('%c  SUGI.toggleUI()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.toggleModule(name, enabled)', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.enableAll()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.disableAll()', 'color: #3b82f6; font-size: 12px')
  console.log('%c  SUGI.resetDefault()', 'color: #3b82f6; font-size: 12px')
}

export { manager as moduleManager }
