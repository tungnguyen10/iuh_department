/**
 * Global Widgets - Scroll to Top & Social Icons
 * These widgets are available on all pages
 */

class GlobalWidgets {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initScrollToTop();
        this.initSocialIcons();
      });
    } else {
      this.initScrollToTop();
      this.initSocialIcons();
    }
  }

  /**
   * Scroll to Top Button
   */
  initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;

    const toggleScrollButton = () => {
      const scrolled = window.scrollY;
      if (scrolled > 200) {
        scrollToTopBtn.classList.remove('opacity-0', 'invisible');
        scrollToTopBtn.classList.add('opacity-100', 'visible');
      } else {
        scrollToTopBtn.classList.add('opacity-0', 'invisible');
        scrollToTopBtn.classList.remove('opacity-100', 'visible');
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Show/hide button based on scroll position
    window.addEventListener('scroll', toggleScrollButton);

    // Scroll to top when clicked
    scrollToTopBtn.addEventListener('click', scrollToTop);

    // Initial check
    toggleScrollButton();
  }

  /**
   * Social Icons Toggle Animation
   */
  initSocialIcons() {
    const socialToggle = document.getElementById('socialToggle');
    const socialList = document.getElementById('socialList');
    const socialIcons = document.querySelectorAll('.social-icon');
    
    if (!socialToggle || !socialList) return;

    let isOpen = false;

    socialToggle.addEventListener('click', () => {
      isOpen = !isOpen;

      if (isOpen) {
        // Show the list
        socialList.classList.remove('invisible', 'opacity-0');
        socialList.classList.add('visible', 'opacity-100');

        // Animate each icon with delay
        socialIcons.forEach((icon, index) => {
          setTimeout(() => {
            icon.classList.add('translate-y-0', 'opacity-100');
            icon.classList.remove('-translate-y-4', 'opacity-0');
          }, index * 100);
        });
      } else {
        // Hide the list
        socialList.classList.remove('visible', 'opacity-100');
        socialList.classList.add('invisible', 'opacity-0');

        // Reset icons
        socialIcons.forEach(icon => {
          icon.classList.remove('translate-y-0', 'opacity-100');
          icon.classList.add('-translate-y-4', 'opacity-0');
        });
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (isOpen && !socialToggle.contains(e.target) && !socialList.contains(e.target)) {
        socialToggle.click();
      }
    });
  }
}

// Initialize Global Widgets
new GlobalWidgets();
