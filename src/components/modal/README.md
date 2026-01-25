# Modal Component System

## Tổng quan

Hệ thống Modal có thể tái sử dụng, cho phép mở rộng dễ dàng cho nhiều use cases khác nhau.

**Tech Stack:** Tailwind CSS + SCSS (chỉ cho animations và custom logic)

## Cấu trúc Files

```
src/components/
├── modal/
│   ├── modal.html          # Base modal structure (Tailwind classes)
│   ├── modal.scss          # Minimal SCSS (animations only)
│   └── modal.js            # Modal manager class
└── search/
    ├── search-modal.html   # Search-specific content (Tailwind classes)
    ├── search-modal.scss   # Minimal SCSS (animations, mark tags)
    └── search-modal.js     # Search logic
```

## Cách sử dụng

### 1. Base Modal (Reusable)

```javascript
import Modal from './components/modal/modal.js';

// Tạo modal đơn giản
const myModal = new Modal({
  id: 'my-modal',
  content: '<h1>Hello World</h1>',
  size: 'default', // 'small', 'default', 'large', 'fullscreen'
  onOpen: () => console.log('Opened'),
  onClose: () => console.log('Closed')
});

// Mở/đóng modal
myModal.open();
myModal.close();
myModal.toggle();

// Update content động
myModal.setContent('<h2>New Content</h2>');

// Thay đổi size
myModal.setSize('large');

// Destroy modal
myModal.destroy();
```

### 2. Search Modal (Example Implementation)

```javascript
import { openSearchModal } from './components/search/search-modal.js';

// Mở search modal
document.getElementById('search-btn').addEventListener('click', () => {
  openSearchModal();
});
```

## Modal Options

```javascript
{
  id: string,              // Unique modal ID
  content: string,         // HTML content
  size: string,            // 'small' | 'default' | 'large' | 'fullscreen'
  closeOnBackdrop: bool,   // Click backdrop to close (default: true)
  closeOnEsc: bool,        // Press ESC to close (default: true)
  onOpen: function,        // Callback when opened
  onClose: function        // Callback when closed
}
```

## Modal Sizes

- **small**: 400px max-width
- **default**: 600px max-width
- **large**: 900px max-width
- **fullscreen**: 100% viewport

## Features

✅ Smooth animations (fade + scale)
✅ Backdrop blur effect
✅ ESC key to close
✅ Click outside to close
✅ Body scroll lock khi modal open
✅ Custom events (modal:open, modal:close)
✅ Fully responsive
✅ Customizable size
✅ Dynamic content update
✅ Multiple instances support

## Search Modal Features

✅ Auto-focus input khi mở
✅ Debounced search (300ms)
✅ Clear button
✅ Popular searches suggestions
✅ Category shortcuts
✅ Loading state
✅ Results with highlighting
✅ Empty state
✅ Keyboard navigation ready

## Mở rộng cho use cases khác

### Example: Confirmation Modal

```javascript
import Modal from './components/modal/modal.js';

const confirmModal = new Modal({
  id: 'confirm-modal',
  size: 'small',
  content: `
    <div style="text-align: center; padding: 20px;">
      <h2>Xác nhận</h2>
      <p>Bạn có chắc chắn muốn thực hiện hành động này?</p>
      <button id="confirm-yes">Có</button>
      <button id="confirm-no">Không</button>
    </div>
  `,
  onOpen: (modal) => {
    modal.contentEl.querySelector('#confirm-yes').onclick = () => {
      console.log('Confirmed!');
      modal.close();
    };
    modal.contentEl.querySelector('#confirm-no').onclick = () => {
      modal.close();
    };
  }
});
```

### Example: Image Gallery Modal

```javascript
const galleryModal = new Modal({
  id: 'gallery-modal',
  size: 'large',
  content: '<img src="image.jpg" style="width: 100%;" />',
  closeOnBackdrop: true
});
```

### Example: Form Modal

```javascript
const formModal = new Modal({
  id: 'form-modal',
  size: 'default',
  content: `
    <form id="my-form">
      <h2>Đăng ký</h2>
      <input type="text" placeholder="Họ tên" />
      <input type="email" placeholder="Email" />
      <button type="submit">Gửi</button>
    </form>
  `,
  onOpen: (modal) => {
    const form = modal.contentEl.querySelector('#my-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      // Handle form submission
      modal.close();
    };
  }
});
```

## Integration với Header

Import trong `header.js`:

```javascript
import { openSearchModal } from '../search/search-modal.js';

// Bind to search buttons
document.querySelectorAll('[data-search-trigger]').forEach(btn => {
  btn.addEventListener('click', () => openSearchModal());
});

// Optional: Keyboard shortcut (Ctrl/Cmd + K)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearchModal();
  }
});
```

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- IE11: ❌ (requires polyfills)
