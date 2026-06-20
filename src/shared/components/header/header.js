/**
 * Header Component JS
 * Handle mobile menu toggle and dynamic dropdown positioning
 */

import { openSearchModal } from '../search/search-modal.js'
import facultyConfig from '@faculty/faculty.config.js'

const universityName = 'ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH'

function navItemMarkup(item) {
  const baseClass = 'flex items-center justify-center px-3 h-full text-primary-white font-medium text-[16px] xl:hover:bg-white/10 xl:hover:text-primary-yellow transition-all duration-200 relative before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary-yellow before:scale-x-0 xl:hover:before:scale-x-100 before:transition-transform before:duration-300'

  if (!item.children?.length) {
    return `
      <div class="nav-item-dropdown relative group h-full" data-dropdown>
        <a href="${item.href || '#'}" class="${baseClass}">
          ${item.text}
        </a>
      </div>
    `
  }

  const children = item.children.map((child) => `
    <a href="${child.href || '#'}"
      class="block px-5 py-3.5 text-black xl:hover:bg-primary-dark-blue/5 xl:hover:text-primary-dark-blue transition-all duration-200 border-b border-gray-100 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-yellow before:scale-y-0 xl:hover:before:scale-y-100 before:transition-transform">
      <span class="font-medium">${child.text}</span>
    </a>
  `).join('')

  return `
    <div class="nav-item-dropdown relative group h-full" data-dropdown>
      <span class="${baseClass} cursor-pointer">
        ${item.text}
      </span>
      <div class="dropdown-menu absolute top-full min-w-[250px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-b-lg opacity-0 invisible translate-y-2 xl:group-hover:opacity-100 xl:group-hover:visible xl:group-hover:translate-y-0 transition-all duration-300 z-50" data-dropdown-menu>
        <div class="border-t-2 border-primary-yellow"></div>
        ${children}
      </div>
    </div>
  `
}

function mobileQuickLinkMarkup(item) {
  return `
    <a href="${item.href || '#'}"
      class="flex flex-col items-center gap-2 p-2.5 bg-primary-dark-blue/5 rounded-lg transition-all duration-300">
      <div class="w-9 h-9 flex items-center justify-center">
        <img src="/assets/svgs/icon-help-circle.svg" alt="" class="w-6 h-6 text-primary-dark-blue" />
      </div>
      <span class="text-[11px] font-medium text-primary-dark-blue text-center leading-tight">${item.text}</span>
    </a>
  `
}

function applyFacultyHeader() {
  const header = document.querySelector('.header-wrapper')
  const headerConfig = facultyConfig.header
  if (!header || !headerConfig) return

  const logoTexts = header.querySelectorAll('a[href="/"] p')
  logoTexts.forEach((element, index) => {
    element.textContent = index % 2 === 0 ? universityName : headerConfig.unitName
  })

  const emailHref = `mailto:${headerConfig.email}`
  header.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = emailHref
    const label = link.querySelector('span')
    if (label) label.textContent = headerConfig.email
  })

  const phoneHref = `tel:${headerConfig.phone.replace(/\s+/g, '')}`
  header.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.href = phoneHref
    const label = link.querySelector('span')
    if (label) label.textContent = headerConfig.phone
  })

  const topBar = header.querySelector(':scope > .bg-white')
  const quickLinksWrap = topBar?.querySelector('[class*="flex-row"]')
  if (quickLinksWrap && headerConfig.quickLinks?.length) {
    quickLinksWrap.innerHTML = headerConfig.quickLinks.map((item, index) => `
      ${index === 0 ? '' : '<span class="h-full w-auto border-l-[1px] border-stroke relative"></span>'}
      <a href="${item.href || '#'}"
        class="flex items-center gap-2.5 px-1.5 py-0.5 font-medium text-sm text-primary-dark-blue rounded-[5px] hover:text-primary-yellow transition-colors">
        ${item.text}
      </a>
    `).join('')
  }

  const navContainer = header.querySelector('.main-nav-container')
  if (navContainer && headerConfig.navItems?.length) {
    navContainer.innerHTML = headerConfig.navItems.map(navItemMarkup).join('')
  }

  const mobileQuickSection = header.querySelector('.xl\\:hidden.w-full.px-4')
  const mobileQuickGrid = mobileQuickSection?.querySelector('.grid')
  if (mobileQuickGrid && headerConfig.quickLinks?.length) {
    mobileQuickGrid.innerHTML = headerConfig.quickLinks.map(mobileQuickLinkMarkup).join('')
  }
}

/**
 * Calculate and set dropdown position dynamically
 * Prevents overflow on small viewports
 */
function adjustDropdownPosition(dropdown, menu) {
  const dropdownRect = dropdown.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const menuWidth = 250 // min-w-[250px]
  const buffer = 20 // Thêm buffer để tránh sát mép
  
  // Reset classes
  menu.classList.remove('left-0', 'right-0')
  
  // Kiểm tra nếu dropdown sẽ overflow bên phải
  const wouldOverflow = (dropdownRect.left + menuWidth + buffer) > viewportWidth
  
  if (wouldOverflow) {
    menu.classList.add('right-0')
  } else {
    menu.classList.add('left-0')
  }
}

/**
 * Adjust subdropdown position (level 3)
 */
function adjustSubdropdownPosition(subdropdown, submenu) {
  const parentRect = subdropdown.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const submenuWidth = 220 // min-w-[220px]
  const buffer = 20 // Thêm buffer để tránh sát mép
  
  // Reset classes
  submenu.classList.remove('left-full', 'right-full', 'rounded-r-lg', 'rounded-l-lg')
  const chevron = subdropdown.querySelector('.chevron-icon')
  
  // Kiểm tra nếu subdropdown sẽ overflow bên phải
  const wouldOverflow = (parentRect.right + submenuWidth + buffer) > viewportWidth
  
  if (wouldOverflow) {
    // Mở sang trái
    submenu.classList.add('right-full', 'rounded-l-lg')
    if (chevron) chevron.classList.add('rotate-180')
  } else {
    // Mở sang phải
    submenu.classList.add('left-full', 'rounded-r-lg')
    if (chevron) chevron.classList.remove('rotate-180')
  }
}

/**
 * Initialize dropdown position detection
 */
function initDropdowns() {
  const dropdowns = document.querySelectorAll('[data-dropdown]')
  const isMobile = () => window.innerWidth < 1120
  
  dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('[data-dropdown-menu]')
    if (!menu) return
    
    // Desktop: Adjust position on hover
    if (!isMobile()) {
      // Set initial position on page load
      adjustDropdownPosition(dropdown, menu)
      
      dropdown.addEventListener('mouseenter', () => {
        adjustDropdownPosition(dropdown, menu)
        
        // Also check all subdropdowns when parent is hovered
        const subdropdowns = dropdown.querySelectorAll('[data-subdropdown]')
        subdropdowns.forEach(subdropdown => {
          const submenu = subdropdown.querySelector('[data-subdropdown-menu]')
          if (submenu) {
            adjustSubdropdownPosition(subdropdown, submenu)
          }
        })
      })
    }
    
    // Handle subdropdowns (level 3) with their own hover
    const subdropdowns = dropdown.querySelectorAll('[data-subdropdown]')
    subdropdowns.forEach(subdropdown => {
      const submenu = subdropdown.querySelector('[data-subdropdown-menu]')
      if (!submenu) return
      
      // Desktop: Adjust position on hover
      if (!isMobile()) {
        // Set initial position on page load
        adjustSubdropdownPosition(subdropdown, submenu)
        
        subdropdown.addEventListener('mouseenter', () => {
          adjustSubdropdownPosition(subdropdown, submenu)
        })
      }
    })
  })
  
  // Recalculate on window resize
  let resizeTimer
  let lastWidth = window.innerWidth
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const currentWidth = window.innerWidth
      const isMobileNow = currentWidth < 1120
      
      // Only recalculate if still in desktop mode and width changed significantly
      if (!isMobileNow && Math.abs(currentWidth - lastWidth) > 50) {
        dropdowns.forEach(dropdown => {
          const menu = dropdown.querySelector('[data-dropdown-menu]')
          if (menu) adjustDropdownPosition(dropdown, menu)
          
          // Also recalculate subdropdowns
          const subdropdowns = dropdown.querySelectorAll('[data-subdropdown]')
          subdropdowns.forEach(subdropdown => {
            const submenu = subdropdown.querySelector('[data-subdropdown-menu]')
            if (submenu) adjustSubdropdownPosition(subdropdown, submenu)
          })
        })
        lastWidth = currentWidth
      }
    }, 150)
  })
}

export function init() {
  applyFacultyHeader()

  // Language switcher
  const languageSwitcher = document.querySelector(".language-switcher");
  const languageText = languageSwitcher?.querySelector(".language-switcher__text");
  const languageImg = languageSwitcher?.querySelector(".language-switcher_img");
  const isPageLoad = languageSwitcher?.dataset.openLink;
  
  if (languageSwitcher && languageText && languageImg) {
    // Get base path from Vite config
    const basePath = import.meta.env.BASE_URL || '/';
    const getAssetPath = (path) => {
      if (path.startsWith('/assets/')) {
        return basePath === '/' ? path : `${basePath}${path.slice(1)}`;
      }
      return path;
    };
    
    const updateLanguage = () => {
      const isEnglish = languageSwitcher.dataset.openLink === "en/";
      if (isEnglish) languageSwitcher.classList.add("active");
      languageText.textContent = !isEnglish ? "ENG" : "VNI";
      languageImg.style.background = !isEnglish
        ? `url("${getAssetPath('/assets/images/eng.webp')}") no-repeat center center/cover`
        : `url("${getAssetPath('/assets/images/vietnam.png')}") no-repeat center center/cover`;
    };
    
    updateLanguage();

    languageSwitcher.addEventListener("click", (e) => {
      e.preventDefault();
      languageSwitcher.dataset.openLink =
        languageSwitcher.dataset.openLink === "en/" ? "vi/" : "en/";
      languageSwitcher.classList.toggle("active");
      updateLanguage();
      setTimeout(() => {
        window.location.assign(isPageLoad);
      }, 400);
    });
  }
  
  // Mobile menu elements
  const hamburger = document.getElementById('hamburger-menu')
  const closeBtn = document.getElementById('close-menu')
  const mainNav = document.getElementById('main-nav')
  const overlay = document.getElementById('nav-overlay')
  
  // Open mobile menu
  function openMenu() {
    mainNav?.classList.add('menu-active')
    overlay?.classList.add('active')
    document.body.style.overflow = 'hidden'
  }
  
  // Close mobile menu
  function closeMenu() {
    mainNav?.classList.remove('menu-active')
    overlay?.classList.remove('active')
    document.body.style.overflow = ''
    
    // Close all submenus
    document.querySelectorAll('.submenu-active').forEach(menu => {
      menu.classList.remove('submenu-active')
    })
    document.querySelectorAll('.rotate-active').forEach(icon => {
      icon.classList.remove('rotate-active')
    })
  }
  
  // Hamburger click
  hamburger?.addEventListener('click', openMenu)
  
  // Close button click
  closeBtn?.addEventListener('click', closeMenu)
  
  // Overlay click
  overlay?.addEventListener('click', closeMenu)
  
  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu()
  })
  
  // Mobile submenu toggles
  function initMobileSubmenus() {
    const isMobile = () => window.innerWidth < 1120
    
    document.querySelectorAll('[data-dropdown] > a, [data-dropdown] > span, [data-subdropdown] > a, [data-subdropdown] > span').forEach(trigger => {
      // Prevent duplicate listeners
      if (trigger.dataset.listenerAdded) return
      trigger.dataset.listenerAdded = 'true'
      
      trigger.addEventListener('click', (e) => {
        if (isMobile()) {
          const submenu = trigger.nextElementSibling
          const hasSubmenu = submenu?.classList.contains('dropdown-menu') || submenu?.classList.contains('sub-dropdown')
          
          if (!hasSubmenu) return true
          
          e.preventDefault()
          
          const arrow = trigger.querySelector('svg.chevron-icon')
          
          // Close siblings
          const parent = trigger.closest('ul') || trigger.parentElement
          parent?.querySelectorAll('.dropdown-menu, .sub-dropdown').forEach(menu => {
            if (menu !== submenu) {
              menu.classList.remove('submenu-active')
              const otherArrow = menu.previousElementSibling?.querySelector('svg.chevron-icon')
              otherArrow?.classList.remove('rotate-active')
            }
          })
          
          // Toggle current
          submenu.classList.toggle('submenu-active')
          arrow?.classList.toggle('rotate-active')
          trigger.classList.toggle('submenu-open')
          
          // Close children when closing parent
          if (!submenu.classList.contains('submenu-active')) {
            submenu.querySelectorAll('.submenu-active').forEach(child => {
              child.classList.remove('submenu-active')
              const childArrow = child.previousElementSibling?.querySelector('svg.chevron-icon')
              childArrow?.classList.remove('rotate-active')
            })
          }
        }
      })
    })
  }
  
  initMobileSubmenus()
  
  // Initialize desktop dropdowns
  initDropdowns()
  
  // Search buttons - bind to modal
  const searchButtons = document.querySelectorAll('[data-search-trigger]')
  searchButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      openSearchModal()
    })
  })
  
  // Optional: Keyboard shortcut (Ctrl/Cmd + K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      openSearchModal()
    }
  })
  
  // Close mobile menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1120) {
      closeMenu()
    }
  })
}
