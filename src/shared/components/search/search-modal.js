/**
 * SearchModal - Search-specific modal logic
 * Extends BaseModal for open/close behaviors
 */
import BaseModal from '../modal/modal.js';
import { dataUrl } from '../../js/utils.js';
import facultyConfig from '@faculty/faculty.config.js';

const quickLinkClass = 'px-4 py-2 text-sm font-medium text-primary-dark-blue bg-slate-100 hover:bg-primary-yellow hover:text-primary-white rounded-lg no-underline transition-all duration-200 hover:-translate-y-0.5';
const categoryClass = 'search-category-item flex items-center gap-3 p-4 bg-slate-50 hover:bg-primary-yellow rounded-xl no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(253,185,19,0.3)]';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linkHref(value = '#') {
  return value || '#';
}

function quickLinkMarkup(item) {
  return `<a href="${linkHref(item.href)}" class="${quickLinkClass}">${escapeHtml(item.text)}</a>`;
}

function categoryMarkup(item) {
  return `
    <a href="${linkHref(item.href)}" class="${categoryClass}">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 text-xs font-semibold text-primary-dark-blue">${escapeHtml(item.icon || '')}</span>
      <span class="text-[15px] font-medium text-primary-dark-blue transition-colors duration-200">${escapeHtml(item.text)}</span>
    </a>
  `;
}

class SearchModal extends BaseModal {
  constructor() {
    super('search-modal');
    
    if (!this.modal) return;
    
    this.searchInput = null;
    this.clearBtn = null;
    this.states = {};
    this.resultsContainer = null;
    this.quickLinksContainer = null;
    this.categoriesContainer = null;
    this.debounceTimer = null;
    this.currentQuery = '';
    
    this.getReferences();
    this.renderConfiguredContent();
    this.bindSearchEvents();
  }

  getReferences() {
    const content = this.modal.querySelector('[data-modal-content]');
    
    this.searchInput = content.querySelector('#search-input');
    this.clearBtn = content.querySelector('#search-clear');
    this.resultsContainer = content.querySelector('#search-results-list');
    this.resultsCount = content.querySelector('#search-results-count');
    this.queryText = content.querySelector('#search-query-text');
    this.emptyQuery = content.querySelector('#search-empty-query');
    this.quickLinksContainer = content.querySelector('[data-search-quick-links]');
    this.categoriesContainer = content.querySelector('[data-search-categories]');
    
    this.states = {
      initial: content.querySelector('[data-search-state="initial"]'),
      loading: content.querySelector('[data-search-state="loading"]'),
      results: content.querySelector('[data-search-state="results"]'),
      empty: content.querySelector('[data-search-state="empty"]')
    };
  }

  renderConfiguredContent() {
    const searchConfig = facultyConfig.search || {};

    if (this.quickLinksContainer) {
      this.quickLinksContainer.innerHTML = (searchConfig.quickLinks || [])
        .map(quickLinkMarkup)
        .join('');
    }

    if (this.categoriesContainer) {
      this.categoriesContainer.innerHTML = (searchConfig.categories || [])
        .map(categoryMarkup)
        .join('');
    }
  }

  bindSearchEvents() {
    // Search input
    this.searchInput?.addEventListener('input', (e) => this.handleInput(e));
    this.searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.performSearch(e.target.value.trim());
    });
    
    // Clear button
    this.clearBtn?.addEventListener('click', () => this.clearSearch());
  }

  onOpen() {
    setTimeout(() => this.searchInput?.focus(), 100);
    this.showState('initial');
  }

  onClose() {
    this.clearSearch();
  }

  handleInput(e) {
    const value = e.target.value.trim();
    
    this.clearBtn?.classList.toggle('is-visible', value.length > 0);
    
    if (!value) {
      this.showState('initial');
      return;
    }
    
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.performSearch(value), 300);
  }

  async performSearch(query) {
    if (!query) return;
    
    this.currentQuery = query;
    this.showState('loading');
    
    try {
      const results = await this.simulateAPICall(query);
      results.length > 0 ? this.displayResults(results) : this.showState('empty');
      if (this.emptyQuery) this.emptyQuery.textContent = query;
    } catch (error) {
      console.error('Search error:', error);
      this.showState('initial');
    }
  }

  async simulateAPICall(query) {
    try {
      const response = await fetch(dataUrl('data/search-data.json'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allData = await response.json();
      
      // Filter results based on query
      const results = allData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return results;
    } catch (error) {
      console.error('Failed to load search data:', error);
      return [];
    }
  }

  displayResults(results) {
    if (this.queryText) this.queryText.textContent = this.currentQuery;
    if (this.resultsCount) this.resultsCount.textContent = `${results.length} kết quả`;
    
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = results.map(result => `
        <a href="${result.url}" class="search-result-item">
          <h4 class="search-result-item__title">
            ${this.highlightQuery(result.title)}
          </h4>
          <p class="search-result-item__excerpt">
            ${this.highlightQuery(result.excerpt)}
          </p>
          <div class="search-result-item__meta">
            <span>${result.category}</span>
            <span>•</span>
            <span>${result.date}</span>
          </div>
        </a>
      `).join('');
    }
    
    this.showState('results');
  }

  highlightQuery(text) {
    if (!this.currentQuery) return text;
    const regex = new RegExp(`(${this.currentQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  clearSearch() {
    if (this.searchInput) this.searchInput.value = '';
    this.clearBtn?.classList.remove('is-visible');
    this.currentQuery = '';
    this.showState('initial');
  }

  showState(stateName) {
    Object.values(this.states).forEach(state => {
      if (state) state.style.display = 'none';
    });
    
    if (this.states[stateName]) {
      this.states[stateName].style.display = 'block';
    }
  }
}

// Singleton instance
let searchModalInstance = null;

export function initSearchModal() {
  if (!searchModalInstance) {
    searchModalInstance = new SearchModal();
  }
  return searchModalInstance;
}

export function openSearchModal() {
  if (!searchModalInstance) {
    searchModalInstance = initSearchModal();
  }
  searchModalInstance.open();
}

export function closeSearchModal() {
  searchModalInstance?.close();
}

export default SearchModal;
