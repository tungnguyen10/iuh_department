/**
 * i18n System - Load messages from JSON files
 */

let messages = {}
let currentLang = 'vi'

// Helper to get data path with base path support
const basePath = import.meta.env.BASE_URL || '/'
const getDataPath = (path) => path.startsWith('/data/') 
  ? (basePath === '/' ? path : `${basePath}${path.slice(1)}`) 
  : path

/**
 * Load messages from JSON file
 */
export async function loadMessages(lang = 'vi') {
  try {
    const response = await fetch(getDataPath(`/data/messages-${lang}.json`))
    if (!response.ok) throw new Error(`Failed to load messages-${lang}.json`)
    messages = await response.json()
    currentLang = lang
    localStorage.setItem('app-lang', lang)
    document.documentElement.lang = lang
    
    // Dispatch event for components to react
    document.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang } }))
    
    return true
  } catch (error) {
    console.error(`[i18n] Failed to load language "${lang}":`, error)
    return false
  }
}

/**
 * Get current language
 */
export function getCurrentLang() {
  return currentLang
}

/**
 * Change language
 */
export async function setCurrentLang(lang) {
  return await loadMessages(lang)
}

/**
 * Translate message by key
 */
export function t(key, fallback) {
  return messages[key] || fallback || key
}

/**
 * Initialize i18n on page load
 */
export async function initI18n() {
  const savedLang = localStorage.getItem('app-lang') || 'vi'
  await loadMessages(savedLang)
}
