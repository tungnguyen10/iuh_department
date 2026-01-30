/**
 * Research Background Pattern Canvas Animation
 * Performant animation using Canvas API
 */

class PatternCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.patterns = [];
    this.animationId = null;
    this.scrollOffset = 0;
    this.patternImage = null;
    
    this.loadPattern().then(() => {
      this.init();
    });
  }

  async loadPattern() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.patternImage = img;
        resolve();
      };
      // Đọc từ data attribute hoặc dùng mặc định
      const patternPath = this.canvas.dataset.pattern || '/assets/svgs/pattern-cog.svg';
      img.src = patternPath;
    });
  }

  init() {
    this.setupCanvas();
    this.createPatterns();
    this.animate();
    
    // Handle resize
    window.addEventListener('resize', () => this.setupCanvas());
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  createPatterns() {
    const patternSize = 200; // Size x2
    const horizontalSpacing = 400; // Spacing ngang rộng hơn
    const rows = 4; // Chỉ 3 hàng thôi
    const verticalSpacing = this.canvas.height / (rows + 1); // Chia đều chiều cao cho 3 row
    
    const cols = Math.ceil(this.canvas.width / horizontalSpacing) + 1;
    
    this.patterns = [];
    
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      // So le theo hàng: hàng lẻ lệch sang phải một nửa spacing
      const offsetX = (row % 2 === 1) ? horizontalSpacing / 2 : 0;
      
      this.patterns.push({
        x: col * horizontalSpacing + offsetX,
        y: row * verticalSpacing,
        size: patternSize,
        rotation: Math.random() * 360,
        opacity: 0.25 + Math.random() * 0.3,
        rotationSpeed: 0.5 + Math.random() * 0.5,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  drawCogPattern(x, y, size, rotation, scale, opacity) {
    if (!this.patternImage) return;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.scale(scale, scale); // Uncomment để pulse hoạt động
    this.ctx.globalAlpha = opacity;
    
    // Draw SVG pattern centered - giữ tỷ lệ vuông để không méo
    const width = size;
    const height = size; // Dùng size vuông thay vì tính theo aspect ratio
    
    this.ctx.drawImage(
      this.patternImage,
      -width / 2,
      -height / 2,
      width,
      height
    );
    
    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Scroll animation
    this.scrollOffset += 0.3;
    if (this.scrollOffset > 400) { // Match với horizontalSpacing
      this.scrollOffset = 0;
    }
    
    // Draw all patterns
    this.patterns.forEach((pattern) => {
      // Update rotation
      pattern.rotation += pattern.rotationSpeed;
      if (pattern.rotation > 360) pattern.rotation -= 360;
      
      // Update pulse - uniform scale (không bóp méo)
      pattern.pulsePhase += pattern.pulseSpeed;
      const pulseScale = 0.75 + Math.sin(pattern.pulsePhase) * 0.25; // Range: 0.5 - 1.0
      
      // Calculate position with scroll
      const x = pattern.x - this.scrollOffset;
      
      // Draw pattern
      this.drawCogPattern(
        x,
        pattern.y,
        pattern.size,
        pattern.rotation,
        pulseScale, // Uniform scale - giữ tỷ lệ
        pattern.opacity
      );
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.setupCanvas);
  }
}

// Initialize when component loads
export function initPatternCanvas() {
  const canvas = document.querySelector('.research-pattern-canvas');
  if (canvas) {
    return new PatternCanvas(canvas);
  }
}
