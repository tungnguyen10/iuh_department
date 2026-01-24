/**
 * Header Component JS
 * Handle mobile menu toggle and dynamic dropdown positioning
 */

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
  // Language switcher
  const languageSwitcher = document.querySelector(".language-switcher");
  const languageText = languageSwitcher?.querySelector(".language-switcher__text");
  const languageImg = languageSwitcher?.querySelector(".language-switcher_img");
  const isPageLoad = languageSwitcher?.dataset.openLink;
  
  if (languageSwitcher && languageText && languageImg) {
    const updateLanguage = () => {
      const isEnglish = languageSwitcher.dataset.openLink === "en/";
      if (isEnglish) languageSwitcher.classList.add("active");
      languageText.textContent = !isEnglish ? "ENG" : "VNI";
      languageImg.style.background = !isEnglish
        ? 'url("/assets/images/eng.webp") no-repeat center center/cover'
        : 'url("/assets/images/vietnam.png") no-repeat center center/cover';
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
    
    document.querySelectorAll('[data-dropdown] > a, [data-subdropdown] > a').forEach(trigger => {
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
  
  // Close mobile menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1120) {
      closeMenu()
    }
  })
}
