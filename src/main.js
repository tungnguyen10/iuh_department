/**
 * Vite Entry Point
 * Import Tailwind CSS và khởi tạo components
 */

import './styles/main.scss'
import { appEnv } from './config/env.js'
import { inlineSVGs } from './js/svg-loader.js'
import { loadingManager } from './js/loading.js'
import { delay, showNotification, shareContent, copyToClipboard, createToast } from './js/utils.js'
import { initSearchModal } from './components/search/search-modal.js'
import { initI18n, t, getCurrentLang, setCurrentLang } from './js/i18n.js'
import './js/global-widgets.js'

// Swiper CSS (imported once for all carousels)
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'

// Auto-import tất cả component SCSS files
const componentStyles = import.meta.glob('./components/**/*.scss', { eager: true })

// Auto-import tất cả component JS files (eager import để bundle vào main.js)
const componentModules = import.meta.glob('./components/**/*.js', { eager: true })

// Auto-import tất cả SVG files để Vite bundle chúng
const svgModules = import.meta.glob('./assets/svgs/*.svg', { eager: true, query: '?url' })

// Surface the current environment for debugging/styling hooks
document.documentElement.dataset.appEnv = appEnv
if (import.meta.env.DEV) {
  console.info(`[lab-iuh] Running in ${appEnv} mode`)
  console.info(`[lab-iuh] Loaded ${Object.keys(svgModules).length} SVG assets`)
  
  // Expose utility functions to global window for DEV testing only
  window.showNotification = showNotification
  window.shareContent = shareContent
  window.copyToClipboard = copyToClipboard
  window.t = t
  window.getCurrentLang = getCurrentLang
  window.setCurrentLang = setCurrentLang
}

// Khởi tạo tất cả components khi DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // 1. CRITICAL: Init loading manager và show ngay lập tức
  loadingManager.init()
  loadingManager.show('Loading...')
  
  // 2. Create toast element (sync, fast)
  createToast()
  
  // 3. Load i18n messages (async)
  await initI18n()
  
  await delay(500) // Test delay
  
  // 4. Auto-init all components that have init() function
  Object.values(componentModules).forEach(module => {
    if (module.init && typeof module.init === 'function') {
      module.init()
    }
  })
  
  await delay(500) // Test delay
  await inlineSVGs()
  
  // 5. Initialize global features
  initSearchModal()
  initArticleActions()
  
  // 6. Hide loading và dispatch events
  loadingManager.hide()
  document.dispatchEvent(new Event('components-loaded'))
  
  // Final hide để show content
  await loadingManager.forceHide()
})

/**
 * Initialize article share and copy link buttons (global)
 */
function initArticleActions() {
  // Share button
  const shareBtn = document.querySelector('.js-share-btn')
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: document.querySelector('h1')?.textContent || document.title,
        // text: 'Xem bài viết này từ Khoa CNTT - IUH',
        url: window.location.href
      }
      
      const success = await shareContent(shareData)
      if (success) {
        showNotification(t('shareSuccess'), 'success')
      }
    })
  }

  // Copy link button
  const copyBtn = document.querySelector('.js-copy-link-btn')
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const success = await copyToClipboard(window.location.href)
      if (success) {
        showNotification(t('copySuccess'), 'success')
      } else {
        showNotification(t('copyError'), 'error')
      }
    })
  }
}
