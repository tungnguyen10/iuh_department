/**
 * Vite Entry Point
 * Import Tailwind CSS và khởi tạo components
 */

import './styles/main.scss'
import { appEnv } from './config/env.js'
import { inlineSVGs } from './js/svg-loader.js'
import { loadingManager } from './js/loading.js'
import { delay, shareContent, copyToClipboard, initFadeInOnScroll } from './js/utils.js'
import { initSearchModal } from './components/search/search-modal.js'
import './js/global-widgets.js'
import './js/module-manager.js' // Module toggle dev tool

// Swiper CSS (imported once for all carousels)
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'

// Auto-import tất cả component SCSS files
const componentStyles = import.meta.glob('./components/**/*.scss', { eager: true })

// Surface the current environment for debugging/styling hooks
document.documentElement.dataset.appEnv = appEnv
if (import.meta.env.DEV) {
  console.info(`Running in ${appEnv} mode`)
  
  // Expose utility functions to global window for DEV testing only
  window.shareContent = shareContent
  window.copyToClipboard = copyToClipboard
}

// Expose build info globally
if (typeof __BUILD_SIGNATURE__ !== 'undefined') {
  window.BUILD_SIGNATURE = __BUILD_SIGNATURE__
}
if (typeof __APP_VERSION__ !== 'undefined') {
  window.APP_VERSION = __APP_VERSION__
}
if (typeof __BUILD_MODE__ !== 'undefined') {
  window.BUILD_MODE = __BUILD_MODE__
}

// Display version banner in console
const displayVersionBanner = () => {
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
  const mode = typeof __BUILD_MODE__ !== 'undefined' ? __BUILD_MODE__ : 'development'
  
  const bannerStyle = 'background: linear-gradient(135deg, #153898 0%, #1e4bb8 100%); color: #F9B200; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 13px;'
  
  console.log('%c🎓 IUH | Version: ' + version + ' | Mode: ' + mode, bannerStyle)
}

// Call banner after DOM 
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayVersionBanner)
} else {
  displayVersionBanner()
}

// Khởi tạo tất cả components khi DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // 1. CRITICAL: Init loading manager và show ngay lập tức
  loadingManager.init()
  loadingManager.show('Loading...')
  
  // 2. Load i18n messages (async)
  // await initI18n()
  
  // 3. Dynamic init components based on DOM presence (performance optimized)
  await initComponentsOnDemand()
  
  await inlineSVGs()
  
  // 4. Initialize global features (always present)
  if (document.querySelector('#search-modal')) {
    initSearchModal()
  }
  
  // 5. Initialize fade-in on scroll animations (global)
  initFadeInOnScroll({
    threshold: 0.1,           // Trigger when 10% visible
    rootMargin: '0px 0px -50px 0px',  // Trigger 50px before entering viewport
    once: true                // Animate only once
  })
  await delay(150)
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
  if (document.querySelector('.partners-canvas')) {
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
  if (document.querySelector('.industry-partnership-swiper')) {
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

  // Major Quiz (majors page)
  if (document.querySelector('#majorQuiz')) {
    const { initMajorQuiz } = await import('./components/major/major-quiz.js')
    window.majorQuizInstance = initMajorQuiz()
  }

  // Tabs (pages with tab components)
  if (document.querySelector('.tabs-container, [data-tabs]')) {
    initTabs()
  }

  // Article actions (share/copy buttons)
  if (document.querySelector('.js-share-btn, .js-copy-link-btn')) {
    initArticleActions()
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
  // Share buttons
  const shareBtns = document.querySelectorAll('.js-share-btn')
  shareBtns.forEach(shareBtn => {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: document.querySelector('h1')?.textContent || document.title,
        url: window.location.href
      }
      
      const success = await shareContent(shareData)
      if (success) {
        shareBtn.classList.add('animate-pop')
        setTimeout(() => shareBtn.classList.remove('animate-pop'), 300)
      }
    })
  })

  // Copy link buttons
  const copyBtns = document.querySelectorAll('.js-copy-link-btn')
  copyBtns.forEach(copyBtn => {
    copyBtn.addEventListener('click', async () => {
      const text = copyBtn.querySelector('span')
      const originalText = text?.textContent
      const success = await copyToClipboard(window.location.href)
      
      if (success) {
        // Success state
        copyBtn.classList.add('!bg-green-500', 'animate-success-pulse')
        text?.classList.add('!text-white')
        if (text) text.textContent = 'Copied!'
        
        setTimeout(() => {
          copyBtn.classList.remove('!bg-green-500', 'animate-success-pulse')
          text?.classList.remove('!text-white')
          if (text) text.textContent = originalText
        }, 2000)
      } else {
        // Error shake
        copyBtn.classList.add('animate-shake')
        setTimeout(() => copyBtn.classList.remove('animate-shake'), 500)
      }
    })
  })
}
