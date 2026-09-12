/**
 * Leadership Component - Auto-generate avatar initials from name
 * Performance optimized with WeakMap tracking and cached regex
 */

// Color palette for avatars (good contrast with white text)
const AVATAR_COLORS = [
  'bg-primary-yellow',
  'bg-primary-dark-blue',
  'bg-secondary-green',
  'bg-avatar-pink',
  'bg-avatar-purple',
  'bg-avatar-indigo',
  'bg-avatar-cyan',
  'bg-avatar-teal',
  'bg-avatar-deep-orange',
  'bg-avatar-brown',
]

// Cache regex for better performance (reuse instead of recreate)
const BG_CLASS_REGEX = /bg-\[?[^\s\]]+\]?/g

// WeakMap to track initialized cards (prevents double init)
const initializedCards = new WeakMap()
const initializedPanels = new WeakSet()

// Simple string hash function (cached for performance)
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

export class LeaderCard {
  constructor(avatarElement) {
    this.avatar = avatarElement
    this.element = avatarElement.closest('article, [data-leader-detail]')
    this.nameElement = this.element?.querySelector('[data-leader-name]')
    
    // Mark as initialized
    if (initializedCards.has(avatarElement)) {
      console.warn('[LeaderCard] Avatar already initialized, skipping')
      return
    }
    initializedCards.set(avatarElement, this)
    
    this.init()
  }

  init() {
    if (!this.avatar || !this.nameElement) {
      console.warn('[LeaderCard] Missing avatar or name element')
      return
    }
     
    // Check for data-photo-src attribute
    const photoSrc = this.avatar.dataset.photoSrc
    
    // If has data-photo-src, show image (or default placeholder)
    if (photoSrc && photoSrc.length > 0 && !photoSrc.includes('{{image}}')) {
      // Clear any existing text content first
      this.avatar.textContent = ''
      
      // Create img tag with default placeholder
      let img = this.avatar.querySelector('img')
      if (!img) {
        img = document.createElement('img')
        img.src = '/assets/images/default.jpg'
        img.alt = this.nameElement.textContent.trim()
        img.className = 'w-full h-full object-cover transition-all duration-500 ease-out'
        // Modern loading state: blur + scale + opacity
        img.style.cssText = 'opacity: 0.4; filter: blur(8px); transform: scale(1.05)'
        this.avatar.appendChild(img)
      }
      
      // Preload and modern fade+scale transition
      const tempImg = new Image()
      tempImg.onload = () => {
        // Modern reveal animation: blur out → swap → sharp reveal
        img.style.cssText = 'opacity: 0; filter: blur(12px); transform: scale(0.95)'
        setTimeout(() => {
          // Wait for actual img element to load before revealing
          img.onload = () => {
            img.style.cssText = 'opacity: 1; filter: blur(0); transform: scale(1)'
          }
          img.src = photoSrc
        }, 200)
      }
      tempImg.onerror = () => {
        console.warn('[LeaderCard] Failed to load image:', photoSrc)
        // Reveal default image smoothly
        img.style.cssText = 'opacity: 1; filter: blur(0); transform: scale(1)'
      }
      tempImg.src = photoSrc
      
      // Remove initials-specific classes
      this.avatar.classList.remove('bg-primary-dark-blue', ...AVATAR_COLORS)
      return // Skip initials generation
    }
    
    // No valid image - use initials mode
    // Check if avatar already has custom background color
    const hasCustomBg = this.avatar.classList.toString().match(BG_CLASS_REGEX)
    
    // Check if avatar already has content (not placeholder or empty)
    const currentContent = this.avatar.textContent.trim()
    if (currentContent && !currentContent.includes('{{')) {
      // Only apply color if no custom color exists
      if (!hasCustomBg) {
        const fullName = this.nameElement.textContent.trim()
        if (fullName) this.applyAvatarColor(fullName)
      }
      return // Already has initials, skip generation
    }
    
    const fullName = this.nameElement.textContent.trim()
    if (!fullName || fullName.includes('{{')) {
      console.warn('[LeaderCard] Invalid or placeholder name')
      return
    }
    
    // Apply default background if none exists
    if (!hasCustomBg) {
      this.avatar.classList.add('bg-primary-dark-blue')
    }
    
    // Generate initials and apply color
    this.generateInitials(fullName)
    if (!hasCustomBg) {
      this.applyAvatarColor(fullName)
    }
  }

  generateInitials(fullName) {
    // Remove title prefix (TS., PGS., GS., etc.)
    let nameWithoutTitle = fullName
    if (fullName.includes('.')) {
      const lastDotIndex = fullName.lastIndexOf('.')
      nameWithoutTitle = fullName.substring(lastDotIndex + 1).trim()
    }
    
    // Guard against empty name after removing prefix
    if (!nameWithoutTitle) {
      console.warn('[LeaderCard] Empty name after removing title prefix')
      return
    }
    
    // Generate initials: take first letter of each word (max 3)
    const initials = nameWithoutTitle
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 3)
      .join('')
    
    // Update avatar content
    if (initials) {
      this.avatar.textContent = initials
    }
  }

  // Generate consistent color from name (same name = same color)
  applyAvatarColor(fullName) {
    const hash = hashString(fullName)
    const colorIndex = hash % AVATAR_COLORS.length
    const colorClass = AVATAR_COLORS[colorIndex]
    
    // Remove existing bg-* classes and add new one
    // More efficient than regex.replace on full className string
    const classList = this.avatar.classList
    const bgClasses = Array.from(classList).filter(cls => 
      cls.startsWith('bg-') || cls.match(/^bg-\[/)
    )
    
    bgClasses.forEach(cls => classList.remove(cls))
    classList.add(colorClass)
  }

  // Update name and regenerate initials + color
  updateName(newName) {
    if (!this.nameElement || !newName) return
    
    this.nameElement.textContent = newName
    this.generateInitials(newName)
    this.applyAvatarColor(newName)
  }

  // Cleanup method for proper disposal
  destroy() {
    initializedCards.delete(this.avatar)
    this.element = null
    this.avatar = null
    this.nameElement = null
  }
}

export const initLeadership = (container = document) => {
  // Find all avatar-teacher elements
  const avatars = container.querySelectorAll('.avatar-teacher')
  const instances = []
  
  avatars.forEach(avatar => {
    // Skip if already initialized
    if (!initializedCards.has(avatar)) {
      instances.push(new LeaderCard(avatar))
    }
  })

  initLeaderWorkPanel(container)
  
  console.info(`[Leadership] Initialized ${instances.length} avatar elements`)
  
  return instances
}

function initLeaderWorkPanel(container) {
  const panel = container.querySelector?.('[data-leader-work-panel]')
    || document.querySelector('[data-leader-work-panel]')

  if (!panel || initializedPanels.has(panel)) return

  const panelName = panel.querySelector('[data-leader-work-name]')
  const panelPosition = panel.querySelector('[data-leader-work-position]')
  const panelContent = panel.querySelector('[data-leader-work-content]')
  const panelScroll = panel.querySelector('[data-leader-work-scroll]')
  const closeButton = panel.querySelector('[data-leader-work-close]')
  const triggers = document.querySelectorAll('[data-leader-work-trigger]')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const compactViewport = window.matchMedia('(max-width: 767px)')
  let activeTrigger = null

  const setCardActive = (trigger, isActive) => {
    const card = trigger?.closest('[data-leader-work-area]')
    if (!card) return

    card.classList.toggle('ring-2', isActive)
    card.classList.toggle('ring-primary-yellow', isActive)
    card.classList.toggle('ring-offset-2', isActive)
  }

  const placePanel = trigger => {
    const card = trigger?.closest('[data-leader-work-area]')
    if (!card) return

    const level = card.closest('[data-leader-level]')
    const node = card.closest('[data-leader-node]')
    const levelColumns = level && getComputedStyle(level).display === 'grid'
      ? getComputedStyle(level).gridTemplateColumns.split(' ').length
      : 0
    const levelIsStacked = levelColumns === 1
    const insertionTarget = compactViewport.matches || levelIsStacked
      ? (node || level || card)
      : (level || node || card)

    insertionTarget.insertAdjacentElement('afterend', panel)
  }

  const alignPanelAnchor = () => {
    if (panel.hidden || !activeTrigger) return

    const card = activeTrigger.closest('[data-leader-work-area]')
    const cardRect = card?.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    if (!cardRect || panelRect.width === 0) return

    const desiredX = cardRect.left + (cardRect.width / 2) - panelRect.left
    const anchorX = Math.max(28, Math.min(panelRect.width - 28, desiredX))
    panel.style.setProperty('--leader-panel-anchor-x', `${anchorX}px`)
  }

  const closePanel = ({ restoreFocus = true } = {}) => {
    if (panel.hidden) return

    panel.hidden = true
    activeTrigger?.setAttribute('aria-expanded', 'false')
    setCardActive(activeTrigger, false)
    if (restoreFocus) activeTrigger?.focus()
    activeTrigger = null
  }

  triggers.forEach(trigger => {
    const card = trigger.closest('[data-leader-work-area]')
    const workArea = card?.dataset.leaderWorkArea?.trim()
    if (!workArea) return

    trigger.setAttribute('aria-controls', panel.id)
    trigger.setAttribute('aria-expanded', 'false')

    const name = card.querySelector('[data-leader-name]')?.textContent.trim() || ''
    trigger.setAttribute('aria-label', `Xem mảng công việc phụ trách của ${name}`)

    trigger.addEventListener('click', event => {
      event.preventDefault()

      if (!panel.hidden && activeTrigger === trigger) {
        closePanel()
        return
      }

      activeTrigger?.setAttribute('aria-expanded', 'false')
      setCardActive(activeTrigger, false)
      activeTrigger = trigger
      trigger.setAttribute('aria-expanded', 'true')
      setCardActive(trigger, true)

      panelName.textContent = name
      panelPosition.textContent = card.querySelector('[data-leader-position]')?.textContent.trim() || ''
      const workItems = workArea.split('|').map(item => item.trim()).filter(Boolean)
      panelContent.replaceChildren(...workItems.map(item => {
        const listItem = document.createElement('li')
        listItem.textContent = item
        return listItem
      }))

      placePanel(trigger)
      panel.hidden = false
      if (panelScroll) panelScroll.scrollTop = 0
      requestAnimationFrame(() => {
        alignPanelAnchor()
        panel.scrollIntoView({
          block: 'nearest',
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
        })
      })
    })
  })

  closeButton?.addEventListener('click', closePanel)
  document.addEventListener('click', event => {
    if (panel.hidden) return
    if (panel.contains(event.target)) return
    if (event.target.closest?.('[data-leader-work-trigger]')) return

    closePanel({ restoreFocus: false })
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) closePanel()
  })
  window.addEventListener('resize', () => {
    if (panel.hidden || !activeTrigger) return

    placePanel(activeTrigger)
    requestAnimationFrame(alignPanelAnchor)
  })

  initializedPanels.add(panel)
}
