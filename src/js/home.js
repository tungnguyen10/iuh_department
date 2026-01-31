/**
 * Home Page JS
 * Chỉ chạy trên trang home
 */

import { initMajorSwiper } from '@components/major/major.js'
import { initAdmissionSwiper } from '@components/admission/admission.js'
import { initStatsCards } from '@components/stats/stats-card.js'
import { initNewsSwiper } from '@components/news/news.js'
import { initPatternCanvas } from '@components/research/research-background-canvas.js'
import { initInfrastructure } from '@components/infrastructure/infrastructure.js'
import { initBusinessConnectionSwiper } from '@components/careers/careers.js'
import { initIndustryPartnershipSwiper } from '@components/industry-partnerships/industry-partnerships.js'
import { initPartnersCanvas } from '@components/partners/partners.js'
import { initIntro } from '@components/intro/intro.js'

document.addEventListener('components-loaded', () => {

  // Initialize intro section height equalization
  initIntro()
  
  // Initialize pattern canvas animation
  initPatternCanvas()
  
  // Initialize partners canvas animation
  initPartnersCanvas()
  
  // Initialize infrastructure section
  initInfrastructure()

  // Initialize major cards Swiper carousel (desktop only)
  initMajorSwiper()
  
  // Initialize admission cards Swiper carousel
  initAdmissionSwiper()

  // Initialize stats cards with counting animation
  initStatsCards()

  // Initialize news carousel
  initNewsSwiper()

  // Initialize business connection events carousel (vertical)
  initBusinessConnectionSwiper()

  // Initialize industry partnership events carousel (vertical)
  initIndustryPartnershipSwiper()
})
