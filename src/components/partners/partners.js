/**
 * Partners Background Canvas Animation
 * Dynamic particles with connecting lines and mouse interaction
 */
import './partners.scss'

export function initPartnersCanvas() {
  const canvas = document.querySelector('.partners-canvas');
  const logoCanvas = document.querySelector('.partners-logo-canvas');
  const section = document.querySelector('.partners-section');
  if (!canvas || !logoCanvas || !section) return;
  
  const ctx = canvas.getContext('2d');
  const logoCtx = logoCanvas.getContext('2d');
  let animationId;
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };
  
  // SVG Logo animation
  const svgLogo = new Image();
  const svgData = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="40" viewBox="0 0 72 40" fill="none">
      <g clip-path="url(#clip0_881_6033)">
        <path d="M71.84 20.1199V39.9999L53.88 30.0299L35.92 39.9999L17.96 30.0299L0 39.9999V20.1199L17.96 10.1299L35.92 20.1199L53.88 10.1299L71.84 20.1199Z" fill="#153898"/>
        <path d="M71.84 0V20.11L53.88 30.08L35.92 20.11L17.96 30.08L0 20.11V0L17.96 9.98L35.92 0L53.88 9.98L71.84 0Z" fill="#F9B200"/>
        <path d="M53.8799 10.1299L35.9299 20.1099L53.8799 30.0799L71.8299 20.1099L53.8799 10.1299Z" fill="white"/>
        <path d="M17.96 10.1299L0.0100098 20.1099L17.96 30.0799L35.91 20.1099L17.96 10.1299Z" fill="#8ED8F8"/>
      </g>
      <defs>
        <clipPath id="clip0_881_6033">
          <rect width="71.84" height="40" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  `)}`;
  svgLogo.src = svgData;
  
  let logoX = 0;
  const logoWidth = 72;
  const logoHeight = 40;
  const logoSpeed = 1;
  const logoSpacing = -0.90; // Overlap logos slightly
  
  // Configuration
  const config = {
    particleCount: 120,
    particleColor: 'rgba(255, 255, 255, 0.8)', // primary-dark-blue
    lineColor: 'rgba(255, 255, 255, 0.4)',
    connectionDistance: 180,
    mouseConnectionDistance: 150,
    particleSpeed: 0.5,
    particleRadius: { min: 1, max: 3 },
    enableGlow: true,
    enableMouseAttract: true,
    attractDistance: 150,
    attractForce: 0.8
  };
  
  // Resize canvas to match container
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Resize logo canvas to match viewport width
    logoCanvas.width = rect.width;
    logoCanvas.height = logoHeight;
    
    // Reinitialize particles if canvas was resized significantly
    if (particles.length === 0 || Math.abs(rect.width - canvas.width) > 100) {
      initParticles();
    }
  };
  
  // Particle class
  class Particle {
    constructor(x, y) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.size = Math.random() * (config.particleRadius.max - config.particleRadius.min) + config.particleRadius.min;
      this.speedX = (Math.random() - 0.5) * config.particleSpeed;
      this.speedY = (Math.random() - 0.5) * config.particleSpeed;
      this.baseSpeedX = this.speedX;
      this.baseSpeedY = this.speedY;
    }
    
    // Update particle position
    update() {
      // Mouse attract effect - particles move toward cursor
      if (config.enableMouseAttract && mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < config.attractDistance) {
          const angle = Math.atan2(dy, dx);
          const force = (config.attractDistance - distance) / config.attractDistance * config.attractForce;
          this.speedX = this.baseSpeedX + Math.cos(angle) * force;
          this.speedY = this.baseSpeedY + Math.sin(angle) * force;
        } else {
          // Gradually return to base speed
          this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
          this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
        }
      }
      
      // Move particle
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Bounce off edges
      if (this.x > canvas.width || this.x < 0) {
        this.speedX = -this.speedX;
        this.baseSpeedX = -this.baseSpeedX;
        this.x = Math.max(0, Math.min(canvas.width, this.x));
      }
      if (this.y > canvas.height || this.y < 0) {
        this.speedY = -this.speedY;
        this.baseSpeedY = -this.baseSpeedY;
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }
    }
    
    // Draw particle
    draw() {
      ctx.fillStyle = config.particleColor;
      
      // Glow effect
      if (config.enableGlow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = config.particleColor;
      }
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      if (config.enableGlow) {
        ctx.shadowBlur = 0;
      }
    }
  }
  
  // Initialize particles
  const initParticles = () => {
    particles = [];
    const particleCount = Math.min(config.particleCount, Math.floor((canvas.width * canvas.height) / 5000));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  };
  
  // Connect particles with lines
  const connectParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < config.connectionDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - (distance / config.connectionDistance);
          ctx.strokeStyle = config.lineColor.replace('0.4', opacity * 0.4);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };
  
  // Connect mouse to nearby particles
  const connectMouse = () => {
    if (!mouse.x || !mouse.y) return;
    
    particles.forEach(particle => {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < config.mouseConnectionDistance) {
        const opacity = 1 - (distance / config.mouseConnectionDistance);
        ctx.strokeStyle = `rgba(255, 193, 7, ${opacity * 0.9})`; // primary-yellow
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    });
  };
  
  // Draw SVG logo scrolling across top
  const drawLogo = () => {
    if (!svgLogo.complete) return;
    
    // Clear logo canvas
    logoCtx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
    
    // Update logo position
    logoX += logoSpeed;
    const totalWidth = logoWidth + logoSpacing;
    
    // Reset when one full cycle completes
    if (logoX >= totalWidth) {
      logoX = 0;
    }
    
    // Calculate how many logos needed to fill canvas width
    const logosCount = Math.ceil(logoCanvas.width / totalWidth) + 1;
    
    // Draw multiple logos to fill entire width
    for (let i = 0; i < logosCount; i++) {
      const x = (i * totalWidth) - logoX;
      logoCtx.drawImage(svgLogo, x, 0, logoWidth, logoHeight);
    }
  };
  
  // Animation loop
  const animate = () => {
    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    // Draw connections
    connectParticles();
    connectMouse();
    
    // Draw scrolling logo on separate canvas
    drawLogo();
    
    animationId = requestAnimationFrame(animate);
  };
  
  // Mouse move event
  const handleMouseMove = (e) => {
    const rect = section.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };
  
  // Mouse leave event
  const handleMouseLeave = () => {
    mouse.x = null;
    mouse.y = null;
  };
  
  // Click to spawn particles
  const handleClick = (e) => {
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Spawn 3-5 particles at click position
    const spawnCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < spawnCount; i++) {
      particles.push(new Particle(x, y));
    }
    
    // Limit total particles
    if (particles.length > config.particleCount * 1.5) {
      particles = particles.slice(-config.particleCount);
    }
  };
  
  // Event listeners
  section.addEventListener('mousemove', handleMouseMove);
  section.addEventListener('mouseleave', handleMouseLeave);
  section.addEventListener('click', handleClick);
  window.addEventListener('resize', resizeCanvas);
  
  // Initialize
  resizeCanvas();
  animate();
  
  // Cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    section.removeEventListener('mousemove', handleMouseMove);
    section.removeEventListener('mouseleave', handleMouseLeave);
    section.removeEventListener('click', handleClick);
    window.removeEventListener('resize', resizeCanvas);
  };
}
