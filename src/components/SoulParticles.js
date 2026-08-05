/* ========================================
   CODE & SOUL — HALFTONE PARTICLE ENGINE (TRANSITION READY)
======================================== */

export class SoulParticles {
  constructor(options = {}) {
    this.canvas = typeof options.canvas === 'string' 
      ? document.querySelector(options.canvas) 
      : options.canvas;

    if (!this.canvas) {
      console.error("SoulParticles: Canvas element not found!");
      return;
    }

    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

    this.imageSources = options.images || [];

    // Динамический лимит частиц на основе производительности устройства
    let maxParticles = options.maxParticles || 2800;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;

    // Адаптивное снижение:
    if (dpr <= 1 || width < 480) {
      maxParticles = 3000;
    } else if (dpr <= 1.5 || width < 768) {
      maxParticles = 5000;
    } else if (width < 1024) {
      maxParticles = 8000;
    } else {
      maxParticles = 12000; // было 16000
    }

    this.maxParticles = maxParticles;
    this.mouseRadius = options.mouseRadius || 100;
    this.mouseForce = options.mouseForce || 8;
    this.theme = options.theme || 'dark';
    this.transitionSpeed = options.transitionSpeed || 0.035;

    this.currentIndex = 0;
    this.cachedTargets = [];
    this.particles = [];
    
    this.mouse = { x: -9999, y: -9999, active: false };
    this.time = 0;
    this.isLoaded = false;
    this.animationFrame = null;

    this.init();
  }

  async init() {
    this.resize();
    this.bindEvents();

    await this.preloadAndSampleAllImages();
    this.initParticlePool();
    
    this.isLoaded = true;
    this.animate();
  }

  resize() {
    if (!this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Пересчёт плотности с учётом адаптивного лимита
    if (this.width < 480) {
      this.sampleStep = 7;
      this.maxParticles = 3000;
    } else if (this.width < 768) {
      this.sampleStep = 6;
      this.maxParticles = 5000;
    } else if (this.width < 1024) {
      this.sampleStep = 5;
      this.maxParticles = 8000;
    } else {
      this.sampleStep = 4;
      this.maxParticles = 12000;
    }

    if (this.isLoaded) {
      this.preloadAndSampleAllImages().then(() => {
        this.transitionTo(this.currentIndex, true);
      });
    }
  }

  async preloadAndSampleAllImages() {
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
    this.cachedTargets = [];

    for (let i = 0; i < this.imageSources.length; i++) {
      try {
        const img = await this.loadImage(this.imageSources[i]);
        const targets = this.extractTargetsFromImage(img, offscreen, offCtx);
        this.cachedTargets.push(targets);
      } catch (err) {
        console.warn(err);
        const fallbackTargets = [];
        for (let y = 0; y < this.height; y += 15) {
          for (let x = 0; x < this.width; x += 15) {
            fallbackTargets.push({ x: x, y: y, size: 1.5, alpha: 0.4 });
          }
        }
        this.cachedTargets.push(fallbackTargets.slice(0, this.maxParticles));
      }
    }
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`SoulParticles: Failed to load ${src}`));
      img.src = src;
    });
  }

  findContentBounds(imgData, w, h) {
    const threshold = 14;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;
    const scanStep = Math.max(1, Math.floor(Math.min(w, h) / 200));

    for (let y = 0; y < h; y += scanStep) {
      for (let x = 0; x < w; x += scanStep) {
        const index = (y * w + x) * 4;
        const r = imgData[index];
        const g = imgData[index + 1];
        const b = imgData[index + 2];
        const a = imgData[index + 3];
        if (a < 40) continue;

        const luminance = r * 0.299 + g * 0.587 + b * 0.114;
        if (luminance > threshold) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) return { x: 0, y: 0, w, h };

    const padX = (maxX - minX) * 0.06;
    const padY = (maxY - minY) * 0.06;
    minX = Math.max(0, minX - padX);
    minY = Math.max(0, minY - padY);
    maxX = Math.min(w, maxX + padX);
    maxY = Math.min(h, maxY + padY);

    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  extractTargetsFromImage(img, offCanvas, offCtx) {
    offCanvas.width = img.naturalWidth;
    offCanvas.height = img.naturalHeight;
    offCtx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
    offCtx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    const fullData = offCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
    const bounds = this.findContentBounds(fullData, img.naturalWidth, img.naturalHeight);
    if (bounds.w <= 0 || bounds.h <= 0) return [];

    const scale = Math.min((this.width * 0.62) / bounds.w, (this.height * 0.62) / bounds.h);
    const w = Math.max(1, Math.floor(bounds.w * scale));
    const h = Math.max(1, Math.floor(bounds.h * scale));

    offCanvas.width = w;
    offCanvas.height = h;
    offCtx.clearRect(0, 0, w, h);
    offCtx.drawImage(
      img,
      bounds.x, bounds.y, bounds.w, bounds.h,
      0, 0, w, h
    );

    const imgData = offCtx.getImageData(0, 0, w, h).data;
    const targets = [];
    const offsetX = (this.width - w) / 2;
    const offsetY = (this.height - h) / 2;

    for (let y = 0; y < h; y += this.sampleStep) {
      for (let x = 0; x < w; x += this.sampleStep) {
        const index = (y * w + x) * 4;
        const r = imgData[index];
        const g = imgData[index + 1];
        const b = imgData[index + 2];
        const a = imgData[index + 3];

        if (a < 40) continue;
        const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        if (luminance < 0.05) continue;

        targets.push({
          x: offsetX + x,
          y: offsetY + y,
          size: 0.8 + luminance * 2.6,
          alpha: Math.min(1.0, luminance + 0.2)
        });
      }
    }
    return targets.slice(0, this.maxParticles);
  }

  initParticlePool() {
    const initialTargets = this.cachedTargets[0] || [];
    this.particles = [];

    for (let i = 0; i < this.maxParticles; i++) {
      const target = initialTargets[i % initialTargets.length] || { x: this.width/2, y: this.height/2, size: 2, alpha: 0.8 };

      this.particles.push({
        x: target.x + (Math.random() - 0.5) * 100,
        y: target.y + (Math.random() - 0.5) * 100,
        originX: target.x,
        originY: target.y,
        targetX: target.x,
        targetY: target.y,
        vx: 0, vy: 0,
        size: target.size,
        targetSize: target.size,
        alpha: target.alpha,
        targetAlpha: target.alpha,
        phase: Math.random() * Math.PI * 2,
        drift: 0.1 + Math.random() * 0.3
      });
    }
  }

  transitionTo(index, immediate = false) {
    if (index < 0 || index >= this.cachedTargets.length) return;
    
    this.currentIndex = index;
    const nextTargets = this.cachedTargets[index];

    if (!nextTargets || nextTargets.length === 0) return;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const target = nextTargets[i % nextTargets.length];

      p.targetX = target.x;
      p.targetY = target.y;
      p.targetSize = target.size;
      p.targetAlpha = target.alpha;

      if (immediate) {
        p.originX = target.x;
        p.originY = target.y;
        p.x = target.x;
        p.y = target.y;
        p.size = target.size;
        p.alpha = target.alpha;
      }
    }
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  bindEvents() {
    this.onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    };

    this.onMouseLeave = () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    };

    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseleave", this.onMouseLeave);
    this.onResize = () => this.resize();
    window.addEventListener("resize", this.onResize);
  }

  update() {
    this.time += 0.016;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.originX += (p.targetX - p.originX) * this.transitionSpeed;
      p.originY += (p.targetY - p.originY) * this.transitionSpeed;
      p.size += (p.targetSize - p.size) * this.transitionSpeed;
      p.alpha += (p.targetAlpha - p.alpha) * this.transitionSpeed;

      const driftX = Math.sin(this.time * p.drift + p.phase) * 0.22;
      const driftY = Math.cos(this.time * p.drift * 0.8 + p.phase) * 0.22;

      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouseRadius && dist > 0) {
          const force = (1 - dist / this.mouseRadius) * this.mouseForce;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      p.vx *= 0.82;
      p.vy *= 0.82;

      p.x = p.originX + p.vx + driftX;
      p.y = p.originY + p.vy + driftY;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isPaper = this.theme === 'paper' || this.theme === 'light';
    const rgb = isPaper ? [18, 19, 22] : [240, 242, 255];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      if (p.alpha < 0.01) continue;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${p.alpha * (isPaper ? 0.85 : 0.9)})`;
      this.ctx.fill();
    }
  }

  animate() {
    if (!document.hidden && this.isLoaded) {
      this.update();
      this.draw();
    }
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
    window.removeEventListener("resize", this.onResize);
  }
}