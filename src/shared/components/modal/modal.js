/**
 * BaseModal - Reusable modal controller
 * Handles common modal behaviors: open, close, ESC, backdrop click
 */
class BaseModal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    
    if (!this.modal) {
      console.error(`Modal with id "${modalId}" not found`);
      return;
    }
    
    this.backdrop = this.modal.querySelector('[data-modal-backdrop]');
    this.closeBtn = this.modal.querySelector('[data-modal-close]');
    
    this.bindEvents();
  }

  bindEvents() {
    // Close button click
    this.closeBtn?.addEventListener('click', () => this.close());
    
    // Backdrop click
    this.backdrop?.addEventListener('click', () => this.close());
    
    // ESC key
    this.handleEsc = (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEsc);
  }

  open() {
    if (!this.modal || this.isOpen()) return;
    
    this.modal.classList.add('is-active');
    document.body.classList.add('modal-open');
    
    this.onOpen?.();
  }

  close() {
    if (!this.modal || !this.isOpen()) return;
    
    this.modal.classList.remove('is-active');
    document.body.classList.remove('modal-open');
    
    this.onClose?.();
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  isOpen() {
    return this.modal?.classList.contains('is-active');
  }

  destroy() {
    document.removeEventListener('keydown', this.handleEsc);
  }
}

export default BaseModal;
