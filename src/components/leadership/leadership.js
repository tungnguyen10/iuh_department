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
  constructor(element) {
    this.element = element
    this.avatar = element.querySelector('.avatar-teacher')
    this.nameElement = element.querySelector('h2')
    
    // Mark as initialized
    if (initializedCards.has(element)) {
      console.warn('[LeaderCard] Card already initialized, skipping')
      return
    }
    initializedCards.set(element, this)
    
    this.init()
  }

  init() {
    if (!this.avatar || !this.nameElement) {
      console.warn('[LeaderCard] Missing avatar or name element')
      return
    }
     
    // Check if card has photo image
    const photoContainer = this.element.querySelector('.avatar-photo')
    const photoImg = photoContainer?.querySelector('img')
    const hasValidImage = photoImg && photoImg.src && !photoImg.src.includes('{{image}}')
    
    if (hasValidImage) {
      // Hide avatar-teacher, show photo
      this.avatar.classList.add('hidden')
      photoContainer.classList.remove('hidden')
      return // Skip initials generation
    }
    
    // No valid image, use avatar with initials
    if (photoContainer) {
      photoContainer.classList.add('hidden')
    }
    
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
    initializedCards.delete(this.element)
    this.element = null
    this.avatar = null
    this.nameElement = null
  }
}

export const initLeadership = (container = document) => {
  const cards = container.querySelectorAll('article:has(.avatar-teacher)')
  const instances = []
  
  cards.forEach(card => {
    // Skip if already initialized
    if (!initializedCards.has(card)) {
      instances.push(new LeaderCard(card))
    }
  })
  
  return instances
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeadership)
} else {
  initLeadership()
}
