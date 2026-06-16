/**
 * Vite Entry Point
 * Import Tailwind CSS và khởi tạo components
 */

import "./shared/styles/main.scss";
import { appEnv } from "./config/env.js";
import { inlineSVGs } from "./shared/js/svg-loader.js";
import { loadingManager } from "./shared/js/loading.js";
import {
  delay,
  shareContent,
  copyToClipboard,
  initFadeInOnScroll,
  initArticleActions,
  initPDFViewer,
} from "./shared/js/utils.js";
import { initSearchModal } from "./shared/components/search/search-modal.js";
import facultyConfig from "@faculty/faculty.config.js";
import "./shared/js/global-widgets.js";
import "./shared/js/module-manager.js"; // Module toggle dev tool

// Swiper CSS (imported once for all carousels)
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

// Auto-import tất cả component SCSS files
const sharedComponentStyles = import.meta.glob("./shared/components/**/*.scss", {
  eager: true,
});

// Surface the current environment for debugging/styling hooks
document.documentElement.dataset.appEnv = appEnv;
if (import.meta.env.DEV) {
  console.info(`Running in ${appEnv} mode`);

  // Expose utility functions to global window for DEV testing only
  window.shareContent = shareContent;
  window.copyToClipboard = copyToClipboard;
}

// Expose build info globally
if (typeof __BUILD_SIGNATURE__ !== "undefined") {
  window.BUILD_SIGNATURE = __BUILD_SIGNATURE__;
}
if (typeof __APP_VERSION__ !== "undefined") {
  window.APP_VERSION = __APP_VERSION__;
}
if (typeof __BUILD_MODE__ !== "undefined") {
  window.BUILD_MODE = __BUILD_MODE__;
}

// Display version banner in console
const displayVersionBanner = () => {
  const version =
    typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
  const mode =
    typeof __BUILD_MODE__ !== "undefined" ? __BUILD_MODE__ : "development";

  const bannerStyle =
    "background: linear-gradient(135deg, #153898 0%, #1e4bb8 100%); color: #F9B200; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 13px;";

  console.log(
    "%c🎓 IUH | Version: " + version + " | Mode: " + mode,
    bannerStyle,
  );
};

// Call banner after DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", displayVersionBanner);
} else {
  displayVersionBanner();
}

// Khởi tạo tất cả components khi DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  performance.mark('app-init-start')
  
  // 1. CRITICAL: Init loading manager và show ngay lập tức
  loadingManager.init();
  loadingManager.show("Loading...");

  try {
    // 2. Load i18n messages (async)
    // await initI18n()

    // 3. Dynamic init components based on DOM presence (performance optimized)
    performance.mark('components-init-start')
    await initComponentsOnDemand();
    performance.mark('components-init-end')
    performance.measure('Components Init', 'components-init-start', 'components-init-end')

    performance.mark('svg-load-start')
    await inlineSVGs();
    performance.mark('svg-load-end')
    performance.measure('SVG Loading', 'svg-load-start', 'svg-load-end')

    // 4. Initialize global features (always present)
    if (document.querySelector("#search-modal")) {
      initSearchModal();
    }

    // 5. Initialize fade-in on scroll animations (global)
    initFadeInOnScroll({
      threshold: 0.1, // Trigger when 10% visible
      rootMargin: "0px 0px -50px 0px", // Trigger 50px before entering viewport
      once: true, // Animate only once
    });

    await delay(150);

    // 6. Dispatch events
    document.dispatchEvent(new Event("components-loaded"));
    
    performance.mark('app-init-end')
    performance.measure('Total App Init', 'app-init-start', 'app-init-end')
    
    // Log performance metrics
    if (import.meta.env.DEV) {
      const measures = performance.getEntriesByType('measure')
      console.group('⏱️ Performance Metrics')
      measures.forEach(measure => {
        console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`)
      })
      console.groupEnd()
    }
    
  } catch (error) {
    console.error("❌ Error initializing components:", error);

    // Show user-friendly error message
    if (import.meta.env.DEV) {
      document.body.insertAdjacentHTML(
        "beforeend",
        `
        <div style="position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:16px;border-radius:8px;max-width:400px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3)">
          <strong>⚠️ Initialization Error</strong>
          <p style="margin:8px 0 0;font-size:14px">${error.message}</p>
        </div>
      `,
      );
    }
  } finally {
    // ALWAYS hide loading, even if there's an error
    loadingManager.hide();
    await loadingManager.forceHide();
  }
});

/**
 * Initialize components only if their DOM elements exist (performance optimized)
 */
async function initComponentsOnDemand() {
  // Helper: safe init - if one fails, others continue
  const safeInit = async ({
    selector,
    load,
    init: initFn,
    name: componentName,
    assignToWindow,
  }) => {
    if (!document.querySelector(selector)) return;
    
    const startTime = performance.now()
    if (import.meta.env.DEV) {
      console.log(`🔄 Loading ${componentName}...`);
    }

    try {
      const module = await load();
      const init = module[initFn];

      if (!init) {
        console.error(
          `❌ Failed to init ${componentName}: Function "${initFn}" not found in module`,
        );
        return;
      }

      if (typeof init !== "function") {
        console.error(
          `❌ Failed to init ${componentName}: "${initFn}" is not a function (type: ${typeof init})`,
        );
        return;
      }

      const result = init();
      if (assignToWindow) {
        window[assignToWindow] = result;
      }
      if (import.meta.env.DEV) {
        const duration = (performance.now() - startTime).toFixed(2)
        console.log(`✅ ${componentName} initialized in ${duration}ms`);
      }

      if (result) return result;
    } catch (error) {
      console.error(`❌ Failed to init ${componentName}:`, error);
    }
  };

  const sharedRuntimeModules = [
    {
      selector: ".news-swiper",
      load: () => import("./shared/components/news/news.js"),
      init: "initNewsSwiper",
      name: "News Swiper",
    },
    {
      selector: ".stats-card",
      load: () => import("./shared/components/stats/stats-card.js"),
      init: "initStatsCards",
      name: "Stats Cards",
    },
    {
      selector: ".partners-canvas",
      load: () => import("./shared/components/partners/partners.js"),
      init: "initPartnersCanvas",
      name: "Partners Canvas",
    },
    {
      selector: ".news-carousel-wrapper",
      load: () => import("./shared/components/news/news-carousel.js"),
      init: "initAllNewsCarousels",
      name: "News Carousel",
    },
    {
      selector: ".tabs-container, [data-tabs]",
      load: () => import("./shared/components/tabs/tabs.js"),
      init: "initTabs",
      name: "Tabs",
    },
  ];

  // Load all independent components in parallel for better performance.
  await Promise.allSettled([
    ...facultyConfig.runtimeModules,
    ...sharedRuntimeModules,
  ].map((runtimeModule) => safeInit(runtimeModule)));

  // Article actions (social media share)
  if (
    document.querySelector(
      ".js-share-facebook, .js-share-x, .js-share-linkedin",
    )
  ) {
    try {
      initArticleActions();
    } catch (error) {
      console.error("Failed to init Article Actions:", error);
    }
  }

  // PDF Viewer (document detail pages)
  if (document.getElementById("pdf-object")) {
    try {
      initPDFViewer();
    } catch (error) {
      console.error("Failed to init PDF Viewer:", error);
    }
  }

  // Header & Footer are always present, so load them in parallel
  try {
    const [headerModule, footerModule] = await Promise.all([
      import("./shared/components/header/header.js"),
      import("./shared/components/footer/footer.js"),
    ]);
    
    headerModule.init();
    footerModule.init();
  } catch (error) {
    console.error("Failed to init Header/Footer:", error);
  }
}
