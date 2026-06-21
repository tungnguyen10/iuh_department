/**
 * Shared platform runtime configuration.
 *
 * Declares every shared-platform module that the runtime should consider
 * initializing. Each entry follows the same shape as faculty runtime modules
 * so `main.js` can iterate uniformly across shared + faculty pipelines.
 *
 * Entry shape:
 *   - selector: CSS selector probed before loading (string).
 *               Use `always: true` to skip the DOM probe.
 *   - load:     dynamic import returning the module.
 *   - init:     exported function name to invoke after import.
 *               When omitted, the module is treated as side-effect only.
 *   - name:     human label used for logs.
 *   - assignToWindow: optional global property name to expose result on window.
 */

import * as utils from './js/utils.js'

export const sharedRuntimeModules = [
  {
    selector: '.news-swiper',
    load: () => import('./components/news/news.js'),
    init: 'initNewsSwiper',
    name: 'News Swiper',
  },
  {
    selector: '.stats-card',
    load: () => import('./components/stats/stats-card.js'),
    init: 'initStatsCards',
    name: 'Stats Cards',
  },
  {
    selector: '.partners-canvas',
    load: () => import('./components/partners/partners.js'),
    init: 'initPartnersCanvas',
    name: 'Partners Canvas',
  },
  {
    selector: '.news-carousel-wrapper',
    load: () => import('./components/news/news-carousel.js'),
    init: 'initAllNewsCarousels',
    name: 'News Carousel',
  },
  {
    selector: '.tabs-container, [data-tabs]',
    load: () => import('./components/tabs/tabs.js'),
    init: 'initTabs',
    name: 'Tabs',
  },
  {
    selector: '#search-modal',
    load: () => import('./components/search/search-modal.js'),
    init: 'initSearchModal',
    name: 'Search Modal',
  },
  {
    selector: '.js-share-facebook, .js-share-x, .js-share-linkedin',
    load: () => Promise.resolve(utils),
    init: 'initArticleActions',
    name: 'Article Actions',
  },
  {
    selector: '#pdf-object',
    load: () => Promise.resolve(utils),
    init: 'initPDFViewer',
    name: 'PDF Viewer',
  },
  {
    always: true,
    load: () => import('./components/header/header.js'),
    init: 'init',
    name: 'Header',
  },
  {
    always: true,
    load: () => import('./components/footer/footer.js'),
    init: 'init',
    name: 'Footer',
  },
]

export default { runtimeModules: sharedRuntimeModules }
