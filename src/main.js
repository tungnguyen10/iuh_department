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
  
  // 4. Dynamic init components based on DOM presence (performance optimized)
  await initComponentsOnDemand()
  
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
 * Initialize components only if their DOM elements exist (performance optimized)
 */
async function initComponentsOnDemand() {
  // Hero Carousel (homepage)
  if (document.querySelector('.hero-swiper')) {
    const { initHeroCarousel } = await import('./components/carousel/carousel.js')
    initHeroCarousel()
  }

  // News Swiper (homepage - different from news-carousel)
  if (document.querySelector('.news-swiper')) {
    const { initNewsSwiper } = await import('./components/news/news.js')
    initNewsSwiper()
  }

  // Major Swiper
  if (document.querySelector('.major-swiper')) {
    const { initMajorSwiper } = await import('./components/major/major.js')
    initMajorSwiper()
  }

  // Admission Swiper
  if (document.querySelector('.admission-swiper')) {
    const { initAdmissionSwiper } = await import('./components/admission/admission.js')
    initAdmissionSwiper()
  }

  // Stats Cards Animation
  if (document.querySelector('.stats-card')) {
    const { initStatsCards } = await import('./components/stats/stats-card.js')
    initStatsCards()
  }

  // Intro Section
  if (document.querySelector('.intro-section')) {
    const { initIntro } = await import('./components/intro/intro.js')
    initIntro()
  }

  // Infrastructure
  if (document.querySelector('.infrastructure-swiper')) {
    const { initInfrastructure } = await import('./components/infrastructure/infrastructure.js')
    initInfrastructure()
  }

  // Partners Canvas
  if (document.querySelector('#partners-canvas')) {
    const { initPartnersCanvas } = await import('./components/partners/partners.js')
    initPartnersCanvas()
  }

  // Careers/Business Connection
  if (document.querySelector('.business-connection-swiper')) {
    const { initBusinessConnectionSwiper } = await import('./components/careers/careers.js')
    initBusinessConnectionSwiper()
  }

  // Leadership - Auto-generate avatar initials
  if (document.querySelector('.avatar-teacher')) {
    const { initLeadership } = await import('./components/leadership/leadership.js')
    initLeadership()
  }

  // Industry Partnerships
  if (document.querySelector('.industry-partnerships-swiper')) {
    const { initIndustryPartnershipSwiper } = await import('./components/industry-partnerships/industry-partnerships.js')
    initIndustryPartnershipSwiper()
  }

  // Research Pattern Canvas
  if (document.querySelector('#pattern-canvas')) {
    const { initPatternCanvas } = await import('./components/research/research-background-canvas.js')
    initPatternCanvas()
  }

  // News Carousel (used in news, about pages)
  if (document.querySelector('.news-carousel-wrapper')) {
    const { initAllNewsCarousels } = await import('./components/news/news-carousel.js')
    initAllNewsCarousels()
  }

  // Header & Footer are always present, so load them
  const { init: initHeader } = await import('./components/header/header.js')
  const { init: initFooter } = await import('./components/footer/footer.js')
  initHeader()
  initFooter()
}

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
