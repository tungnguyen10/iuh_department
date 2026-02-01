/**
 * About Page JS
 * Chỉ chạy trên trang about
 */

import { initBreadcrumb } from '@components/common/breadcrumb.js'

document.addEventListener('components-loaded', () => {
  // Initialize breadcrumb
  initBreadcrumb()
  
  const counterBtn = document.getElementById('about-counter')
  
  if (counterBtn) {
    let count = 0
    
    counterBtn.addEventListener('click', () => {
      count++
      counterBtn.textContent = `Counter: ${count}`
    })
  }
})
