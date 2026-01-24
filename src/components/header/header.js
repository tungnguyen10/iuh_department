/**
 * Header Component JS
 * Handle mobile menu toggle and dynamic dropdown positioning
 */

/**
 * Calculate and set dropdown position dynamically
 * Prevents overflow on small viewports
 */
function adjustDropdownPosition(dropdown, menu) {
  const rect = menu.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const spaceRight = viewportWidth - rect.left
  const spaceLeft = rect.left
  
  // Reset classes
  menu.classList.remove('left-0', 'right-0')
  
  // Check if dropdown would overflow on the right
  if (spaceRight < rect.width && spaceLeft > spaceRight) {
    menu.classList.add('right-0')
  } else {
    menu.classList.add('left-0')
  }
}

/**
 * Adjust subdropdown position (level 3)
 */
function adjustSubdropdownPosition(subdropdown, submenu) {
  const rect = submenu.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const parentRect = subdropdown.getBoundingClientRect()
  const spaceRight = viewportWidth - parentRect.right
  const spaceLeft = parentRect.left
  
  // Reset classes
  submenu.classList.remove('left-full', 'right-full', 'rounded-r-lg', 'rounded-l-lg')
  const chevron = subdropdown.querySelector('.chevron-icon')
  
  // Check if subdropdown would overflow on the right
  if (spaceRight < 220 && spaceLeft > spaceRight) {
    submenu.classList.add('right-full', 'rounded-l-lg')
    if (chevron) chevron.classList.add('rotate-180')
  } else {
    submenu.classList.add('left-full', 'rounded-r-lg')
    if (chevron) chevron.classList.remove('rotate-180')
  }
}

/**
 * Initialize dropdown position detection
 */
function initDropdowns() {
  const dropdowns = document.querySelectorAll('[data-dropdown]')
  
  dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('[data-dropdown-menu]')
    if (!menu) return
    
    // Adjust position on hover
    dropdown.addEventListener('mouseenter', () => {
      adjustDropdownPosition(dropdown, menu)
    })
    
    // Handle subdropdowns (level 3)
    const subdropdowns = dropdown.querySelectorAll('[data-subdropdown]')
    subdropdowns.forEach(subdropdown => {
      const submenu = subdropdown.querySelector('[data-subdropdown-menu]')
      if (!submenu) return
      
      subdropdown.addEventListener('mouseenter', () => {
        adjustSubdropdownPosition(subdropdown, submenu)
      })
    })
  })
  
  // Recalculate on window resize
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector('[data-dropdown-menu]')
        if (menu) adjustDropdownPosition(dropdown, menu)
      })
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
    
    updateLanguage(); // Cập nhật UI ban đầu

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
  
  // Mobile menu toggle
  const toggleBtn = document.getElementById('mobile-menu-toggle')
  const mobileMenu = document.getElementById('mobile-menu')
  
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden')
    })
  }
  
  // Initialize dynamic dropdowns
  initDropdowns()
}
