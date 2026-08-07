/**
 * Organism — главный визуальный символ бренда Code & Soul.
 *
 * Не текст. Не сфера. Не частицы сами по себе.
 * Живая форма на стыке нейронной сети, магнитного поля и плазмы:
 * органическая мембрана SOUL (лаймовое свечение, дыхание, жидкая
 * пульсация) и внутри неё — угловатый каркас CODE (тонкие белые/
 * графитовые связи и узлы, инженерная точность).
 *
 * Реагирует на курсор, никогда не останавливается, но сделана так,
 * чтобы не нагружать средние ноутбуки/мобильные: 2D canvas, без
 * тяжёлых фильтров per-frame, пауза вне вьюпорта и на скрытой вкладке.
 */
export class Organism {
  constructor({ canvas, nodeCount = 11, meshDensity = 2 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.wrap = canvas.parentElement;

    this.nodeCount = window.innerWidth < 700 ? Math.max(7, nodeCount - 3) : nodeCount;
    this.meshDensity = meshDensity;

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.time = 0;
    this.raf = null;
    this.visible = true;
    this.lastFrame = 0;

    this.pointer = { x: 0, y: 0, active: false, tx: 0, ty: 0 };

    this.colors = {
      soul: "215, 255, 63",
      code: "241, 240, 235",
    };

    this.nodes = Array.from({ length: this.nodeCount }, (_, i) => ({
      angle: (i / this.nodeCount) * Math.PI * 2,
      seedA: Math.random() * Math.PI * 2,
      seedB: Math.random() * Math.PI * 2,
      seedC: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2,
      x: 0,
      y: 0,
    }));

    this.resize = this.resize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.tick = this.tick.bind(this);

    this.resize();
    window.addEventListener("resize", this.resize);

    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", this.onPointerMove, { passive: true });
      window.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.visible = entry.isIntersecting;
          if (this.visible) this.start();
          else this.stop();
        });
      },
      { threshold: 0.05 }
    );
    this.observer.observe(canvas);

    window.addEventListener("code-soul:theme", (event) => this.setTheme(event.detail.theme));
    this.setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");

    // Даже при reduced-motion форма остаётся — рисуем один тихо дышащий кадр
    // редким интервалом вместо requestAnimationFrame.
    if (this.reducedMotion) {
      this.drawFrame();
      this.slowInterval = setInterval(() => this.drawFrame(), 2600);
    } else {
      this.start();
    }
  }

  setTheme(theme) {
    this.colors.code = theme === "light" ? "20, 21, 15" : "241, 240, 235";
  }

  resize() {
    const rect = this.wrap.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.baseRadius = Math.min(this.width, this.height) * 0.34;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
  }

  onPointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const margin = rect.width * 0.6;
    if (x < -margin || x > rect.width + margin || y < -margin || y > rect.height + margin) {
      this.pointer.active = false;
      return;
    }
    this.pointer.active = true;
    this.pointer.tx = x;
    this.pointer.ty = y;
  }

  onPointerLeave() {
    this.pointer.active = false;
  }

  start() {
    if (this.reducedMotion || this.raf) return;
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  tick(now) {
    if (document.hidden) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    if (!this.lastFrame) this.lastFrame = now;
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.time += dt;

    // Плавный лерп указателя — инерция, а не мгновенный отклик.
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.06;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.06;

    this.drawFrame();
    this.raf = requestAnimationFrame(this.tick);
  }

  nodeRadius(node) {
    const t = this.time;
    const breathe =
      1 +
      0.16 * Math.sin(t * 0.55 + node.seedA) +
      0.08 * Math.sin(t * 1.35 + node.seedB) +
      0.05 * Math.sin(t * 2.4 + node.seedC);
    return this.baseRadius * breathe;
  }

  computeNodes() {
    const { cx, cy } = this;
    this.nodes.forEach((node) => {
      let r = this.nodeRadius(node);
      let angle = node.angle + Math.sin(this.time * 0.12 + node.seedA) * 0.05;
      let x = cx + Math.cos(angle) * r;
      let y = cy + Math.sin(angle) * r * 0.86;

      if (this.pointer.active) {
        const dx = x - this.pointer.x;
        const dy = y - this.pointer.y;
        const dist = Math.hypot(dx, dy) || 1;
        const influence = Math.max(0, 1 - dist / (this.baseRadius * 1.5));
        if (influence > 0) {
          const push = influence * this.baseRadius * 0.22;
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
      }

      node.x = x;
      node.y = y;
    });
  }

  drawFrame() {
    if (!this.ctx) return;
    if (!this.reducedMotion) this.computeNodes();
    else if (!this.nodes[0].x) this.computeNodes();

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawSoulMembrane(ctx);
    this.drawCodeLattice(ctx);
  }

  smoothPath(ctx, points, close = true) {
    if (points.length < 3) return;
    ctx.beginPath();
    const first = points[0];
    const last = points[points.length - 1];
    const start = { x: (last.x + first.x) / 2, y: (last.y + first.y) / 2 };
    ctx.moveTo(start.x, start.y);
    for (let i = 0; i < points.length; i++) {
      const p0 = points[i];
      const p1 = points[(i + 1) % points.length];
      const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      ctx.quadraticCurveTo(p0.x, p0.y, mid.x, mid.y);
    }
    if (close) ctx.closePath();
  }

  drawSoulMembrane(ctx) {
    const { cx, cy, baseRadius } = this;

    // Внешнее дыхание — мягкое лаймовое свечение (soul = энергия/свет).
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 2.1);
    glowGrad.addColorStop(0, `rgba(${this.colors.soul}, 0.16)`);
    glowGrad.addColorStop(0.5, `rgba(${this.colors.soul}, 0.05)`);
    glowGrad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Мембрана — жидкая, живая, "дышащая" форма.
    this.smoothPath(ctx, this.nodes);
    const bodyGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, baseRadius * 1.4);
    bodyGrad.addColorStop(0, `rgba(${this.colors.soul}, 0.22)`);
    bodyGrad.addColorStop(0.7, `rgba(${this.colors.soul}, 0.06)`);
    bodyGrad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.save();
    ctx.shadowBlur = 26;
    ctx.shadowColor = `rgba(${this.colors.soul}, 0.85)`;
    ctx.strokeStyle = `rgba(${this.colors.soul}, 0.75)`;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    // Ядро — источник энергии.
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.32);
    coreGrad.addColorStop(0, `rgba(${this.colors.soul}, 0.9)`);
    coreGrad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCodeLattice(ctx) {
    const nodes = this.nodes;
    const step = this.meshDensity + 1;

    ctx.save();
    ctx.strokeStyle = `rgba(${this.colors.code}, 0.16)`;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const b = nodes[(i + step) % nodes.length];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    nodes.forEach((node, i) => {
      const pulse = 0.35 + 0.35 * Math.abs(Math.sin(this.time * 0.9 + node.pulse));
      ctx.fillStyle = `rgba(${this.colors.code}, ${pulse * 0.65})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  destroy() {
    this.stop();
    if (this.slowInterval) clearInterval(this.slowInterval);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerleave", this.onPointerLeave);
    if (this.observer) this.observer.disconnect();
  }
}

export function initOrganism() {
  const canvas = document.querySelector("[data-organism]");
  if (!canvas) return;
  window.__codeSoulOrganism = new Organism({ canvas });
}
