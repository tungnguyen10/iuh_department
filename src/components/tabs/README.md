# Tabs Component

Generic reusable tabs component for switching between content panels.

## Usage

### Method 1: Manual HTML (Recommended)

```html
<div class="tabs-container">
  <!-- Tab Navigation -->
  <div class="tabs-nav flex gap-2 border-b border-stroke">
    <button class="tab-btn active" data-tab="tab1">
      <svg>...</svg>
      Tab 1
    </button>
    <button class="tab-btn" data-tab="tab2">Tab 2</button>
  </div>

  <!-- Tab Content -->
  <div class="tabs-content mt-6">
    <div class="tab-panel" data-tab-panel="tab1">Content 1</div>
    <div class="tab-panel hidden" data-tab-panel="tab2">Content 2</div>
  </div>
</div>
```

### Method 2: JSON Config (Auto-generate)

```html
<div data-tabs='{"tabs":[
  {"id":"tab1","label":"Tab 1","icon":"bell"},
  {"id":"tab2","label":"Tab 2","icon":"lightbulb"}
]}'>
  <div data-tab-panel="tab1">Content 1</div>
  <div data-tab-panel="tab2">Content 2</div>
</div>
```

## Available Icons

- `bell` - Notification icon
- `lightbulb` - Ideas/activities icon
- `document` - Document/CV icon
- `user` - User profile icon
- `info` - Information icon

## Events

Listen to tab changes:

```javascript
const tabsContainer = document.querySelector('.tabs-container')
tabsContainer.addEventListener('tabchange', (e) => {
  console.log('Tab changed to:', e.detail.tabId)
})
```

## Styling

The component uses Tailwind CSS classes. Customize via:
- `.tab-btn` - Tab button styles
- `.tab-btn.active` - Active tab styles
- `.tab-panel` - Panel container styles

## Features

✅ Responsive design with horizontal scroll on mobile
✅ Smooth fade-in animation when switching tabs
✅ Keyboard navigation support
✅ Custom event dispatching
✅ Auto-initialization
