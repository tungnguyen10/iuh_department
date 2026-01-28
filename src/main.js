/**
 * Vite Entry Point
 * Import Tailwind CSS và khởi tạo components
 */

import './styles/main.scss'
import { appEnv } from './config/env.js'
import { inlineSVGs } from './js/svg-loader.js'
import { loadingManager } from './js/loading.js'
import { delay } from './js/utils.js'
import { initSearchModal } from './components/search/search-modal.js'

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
}

// Khởi tạo tất cả components khi DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Init loading manager
  loadingManager.init()
  
  // Show loading cho từng operation
  loadingManager.show('Loading...')
  await delay(500) // Test delay 1s
  
  // Auto-init all components that have init() function
  Object.values(componentModules).forEach(module => {
    if (module.init && typeof module.init === 'function') {
      module.init()
    }
  })
  await delay(500) // Test delay 1s
  await inlineSVGs()
  
  // Initialize search modal
  initSearchModal()
  
  loadingManager.hide()
  
  // Dispatch event để các page-specific JS biết components đã load xong
  document.dispatchEvent(new Event('components-loaded'))
  
  // Final hide để show content
  await loadingManager.forceHide()
})


