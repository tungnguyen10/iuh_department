/**
 * Infrastructure Component
 * Handles the infrastructure section with image gallery
 */

export function initInfrastructure() {
  const infrastructureCards = document.querySelectorAll('.infrastructure-card');
  
  if (infrastructureCards.length === 0) return;

  // Handle conditional link: hide <a> if no valid link
  infrastructureCards.forEach((card) => {
    const linkElement = card.querySelector('a[href]');
    
    if (linkElement) {
      const href = linkElement.getAttribute('href');
      // Hide the <a> if no valid link
      if (!href || href === '' || href === '#' || href === 'undefined') {
        linkElement.style.display = 'none';
        card.style.cursor = 'default';
      }
    }

    const img = card.querySelector('img');
    
    if (img) {
      // Add loading state
      img.style.opacity = '0';
      img.style.transition = 'opacity 500ms ease-in-out';
      
      // Remove loading state when image is loaded
      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', () => {
          img.style.opacity = '1';
        });
        
        // Handle error
        img.addEventListener('error', () => {
          console.error(`Failed to load image: ${img.src}`);
          img.style.opacity = '1';
        });
      }
    }
  });

  // Optional: Add intersection observer for lazy loading animation
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('infrastructure-card--visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    infrastructureCards.forEach((card) => {
      observer.observe(card);
    });
  }
}

export default {
  initInfrastructure
};
