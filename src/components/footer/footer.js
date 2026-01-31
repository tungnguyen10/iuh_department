/**
 * Footer Component JS
 * Handle footer accordion for location toggles
 */

export function init() {
  class FooterAccordion {
    constructor(containerSelector = '[data-footer-accordion]') {
      this.container = document.querySelector(containerSelector);
      if (!this.container) return;

      this.toggleButtons = this.container.querySelectorAll('[data-footer-toggle]');
      this.setupEventListeners();
      this.openFirstItem();
    }

    setupEventListeners() {
      this.toggleButtons.forEach((button) => {
        button.addEventListener('click', () => this.handleToggle(button));
      });
    }

    handleToggle(clickedButton) {
      const content = document.getElementById(clickedButton.getAttribute('aria-controls'));
      const chevron = clickedButton.querySelector('[data-footer-chevron]');
      if (!content || !chevron) return;

      const isOpen = clickedButton.getAttribute('aria-expanded') === 'true';

      // Close all first
      this.closeAll();

      // Open clicked if was closed
      if (!isOpen) {
        this.toggleItem(clickedButton, content, chevron, true);
      }
    }

    closeAll() {
      this.toggleButtons.forEach((button) => {
        const content = document.getElementById(button.getAttribute('aria-controls'));
        const chevron = button.querySelector('[data-footer-chevron]');
        if (content && chevron) {
          this.toggleItem(button, content, chevron, false);
        }
      });
    }

    toggleItem(button, content, chevron, isOpen) {
      content.classList.toggle('hidden', !isOpen);
      chevron.classList.toggle('rotate-90', isOpen);
      button.setAttribute('aria-expanded', isOpen);
    }

    openFirstItem() {
      const firstButton = this.toggleButtons[0];
      if (firstButton) {
        const content = document.getElementById(firstButton.getAttribute('aria-controls'));
        const chevron = firstButton.querySelector('[data-footer-chevron]');
        if (content && chevron) {
          this.toggleItem(firstButton, content, chevron, true);
        }
      }
    }
  }

  new FooterAccordion();
}
