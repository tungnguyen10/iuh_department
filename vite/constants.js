export const DEFAULT_FACULTY_ID = 'health-science'

export const FACULTY_REQUIRED_FIELDS = ['id', 'name', 'shortName', 'email', 'phone', 'nav', 'topBar', 'social', 'colors']

export const FACULTY_COLOR_KEYS = ['brand-primary', 'brand-accent', 'brand-tint', 'brand-surface']

export const VALID_PAGE_TIERS = new Set(['shared-template', 'shared-with-vars', 'faculty-content', 'dev-only'])

export const SOCIAL_CONFIG = {
  facebook: {
    label: 'Facebook',
    icon: 'assets/svgs/icon-facebook.svg',
    hoverClass: 'hover:text-[#1877F2]',
  },
  instagram: {
    label: 'Instagram',
    icon: 'assets/svgs/icon-instagram.svg',
    hoverClass: 'hover:text-[#E4405F]',
  },
  youtube: {
    label: 'Youtube',
    icon: 'assets/svgs/icon-youtube.svg',
    hoverClass: 'hover:text-[#FF0000]',
  },
}
