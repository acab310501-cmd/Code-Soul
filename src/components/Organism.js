/**
 * Organism — главный герой Hero и символ бренда Code & Soul.
 *
 * Не текст. Не сфера. Не частицы сами по себе.
 * Живая форма на стыке нейронной сети, магнитного поля и плазмы:
 * органическая мембрана SOUL (лаймовое свечение, дыхание, жидкая
 * пульсация — источник энергии всей страницы) и внутри неё —
 * угловатый каркас CODE (тонкие связи и узлы — структура, на
 * которой держится форма).
 *
 * Генеративность: каждый визит — новая, но узнаваемая особь. Число
 * узлов, асимметрия, ритм дыхания и рисунок связей пересчитываются
 * заново при каждой загрузке (без seed/localStorage — сознательно,
 * чтобы организм ощущался живым, а не кэшированным), но алгоритм и
 * цветовой язык неизменны — поэтому это всегда узнаваемо Code & Soul.
 *
 * Рождение: первые ~2.4с после снятия лоадера организм не «появляется»,
 * а рождается — из точки, которую сначала прорисовывает структура
 * (code), а затем в неё вливается жизнь (soul-энергия), со вспышкой
 * и лёгким перелётом (overshoot) — ощущение первого вдоха.
 *
 * Реагирует на курсор, никогда не останавливается, но сделана так,
 * чтобы не нагружать средние ноутбуки/мобильные: 2D canvas, без
 * тяжёлых фильтров per-frame, пауза вне вьюпорта и на скрытой вкладке.
 */

const TAU = Math.PI * 2;

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export class Organism {
  constructor({ canvas, minNodes = 9, maxNodes = 14 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.wrap = canvas.parentElement;

    const isSmall = window.innerWidth < 700;
    const lo = isSmall ? Math.max(6, minNodes - 3) : minNodes;
    const hi = isSmall ? Math.max(8, maxNodes - 4) : maxNodes;

    // ГЕНЕРАТИВНОСТЬ — каждая загрузка выращивает свою особь.
    this.nodeCount = Math.round(lo + Math.random() * (hi - lo));
    this.meshStep = 2 + Math.floor(Math.random() * 2); // 2 или 3 — разный рисунок каркаса
    this.squish = 0.76 + Math.random() * 0.22; // асимметрия формы (не идеальный круг)
    this.rotation = Math.random() * TAU;
    this.radiusJitter = 0.92 + Math.random() * 0.18;

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.time = 0;
    this.raf = null;
    this.visible = true;
    this.lastFrame = 0;

    // Рождение
    this.birth = this.reducedMotion ? 1 : 0;
    this.birthStarted = this.reducedMotion;
    this.birthDuration = 2.4;

    this.pointer = { x: 0, y: 0, active: false, tx: 0, ty: 0 };

    this.colors = {
      soul: "215, 255, 63",
      code: "241, 240, 235",
    };

    this.nodes = Array.from({ length: this.nodeCount }, (_, i) => ({
      angle: (i / this.nodeCount) * TAU + this.rotation,
      seedA: Math.random() * TAU,
      seedB: Math.random() * TAU,
      seedC: Math.random() * TAU,
      pulse: Math.random() * TAU,
      radiusMix: 0.85 + Math.random() * 0.3, // у каждого узла свой "характер"
      x: 0,
      y: 0,
    }));

    this.resize = this.resize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.tick = this.tick.bind(this);
    this.startBirth = this.startBirth.bind(this);

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

    // Организм рождается ровно в момент, когда лоадер открывает сцену —
    // первый вдох синхронен с первым кадром, который видит пользователь.
    window.addEventListener("code-soul:genesis", this.startBirth, { once: true });
    // Страховка: если лоадера нет/событие не пришло — не оставляем организм мёртвым.
    this.genesisFallback = setTimeout(this.startBirth, 4200);

    if (this.reducedMotion) {
      this.drawFrame();
      this.slowInterval = setInterval(() => this.drawFrame(), 2600);
    } else {
      this.start();
    }
  }

  startBirth() {
    if (this.birthStarted) return;
    this.birthStarted = true;
    this.birthStartTime = null;
    clearTimeout(this.genesisFallback);
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
    // Организм — главный герой композиции, а не декоративная деталь:
    // занимает почти весь свой контейнер, глоу выходит за его пределы.
    this.baseRadius = Math.min(this.width, this.height) * 0.42 * this.radiusJitter;
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

    if (this.birthStarted && this.birth < 1) {
      if (this.birthStartTime === null) this.birthStartTime = now;
      const elapsed = (now - this.birthStartTime) / 1000;
      this.birth = Math.min(1, elapsed / this.birthDuration);
    }

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
    return this.baseRadius * breathe * node.radiusMix;
  }

  computeNodes() {
    const { cx, cy } = this;
    // Структура (каркас) раскрывается первой и чуть быстрее, чем
    // разливается энергия мембраны — сперва скелет, потом жизнь в нём.
    const lifeScale = this.reducedMotion
      ? 1
      : easeOutBack(Math.min(1, this.birth * 1.15));

    this.nodes.forEach((node) => {
      let r = this.nodeRadius(node) * lifeScale;
      let angle = node.angle + Math.sin(this.time * 0.12 + node.seedA) * 0.05;
      let x = cx + Math.cos(angle) * r;
      let y = cy + Math.sin(angle) * r * this.squish;

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

    const structureAlpha = this.reducedMotion ? 1 : Math.min(1, this.birth * 2.4);
    const lifeAlpha = this.reducedMotion ? 1 : easeOutExpo(Math.max(0, (this.birth - 0.15) / 0.85));
    // Вспышка первого вдоха — короткий всплеск яркости, когда энергия входит в форму.
    const spark = this.reducedMotion
      ? 0
      : Math.max(0, 1 - Math.abs(this.birth - 0.42) * 5) * 0.6;

    this.drawCodeLattice(ctx, structureAlpha);
    this.drawSoulMembrane(ctx, lifeAlpha, spark);
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

  drawSoulMembrane(ctx, lifeAlpha, spark) {
    if (lifeAlpha <= 0) return;
    const { cx, cy, baseRadius } = this;

    // SOUL — источник света всей страницы: широкий эмбиент-глоу, который
    // выходит далеко за пределы формы и физически освещает сцену вокруг.
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 2.8);
    glowGrad.addColorStop(0, `rgba(${this.colors.soul}, ${0.2 * lifeAlpha + spark * 0.35})`);
    glowGrad.addColorStop(0.45, `rgba(${this.colors.soul}, ${0.07 * lifeAlpha})`);
    glowGrad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Мембрана — жидкая, живая, "дышащая" форма.
    this.smoothPath(ctx, this.nodes);
    const bodyGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, baseRadius * 1.4);
    bodyGrad.addColorStop(0, `rgba(${this.colors.soul}, ${0.24 * lifeAlpha})`);
    bodyGrad.addColorStop(0.7, `rgba(${this.colors.soul}, ${0.07 * lifeAlpha})`);
    bodyGrad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.save();
    ctx.shadowBlur = 26 + spark * 24;
    ctx.shadowColor = `rgba(${this.colors.soul}, ${0.85 * lifeAlpha})`;
    ctx.strokeStyle = `rgba(${this.colors.soul}, ${(0.75 + spark * 0.25) * lifeAlpha})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    // Ядро — источник энергии, вспыхивает ярче в момент рождения.
    const coreR = baseRadius * (0.32 + spark * 0.1);
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    coreGrad.addColorStop(0, `rgba(${this.colors.soul}, ${(0.9 + spark * 0.1) * lifeAlpha})`);
    coreGrad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, TAU);
    ctx.fill();
  }

  drawCodeLattice(ctx, structureAlpha) {
    if (structureAlpha <= 0) return;
    const nodes = this.nodes;
    const step = this.meshStep;

    ctx.save();
    ctx.strokeStyle = `rgba(${this.colors.code}, ${0.16 * structureAlpha})`;
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
      ctx.fillStyle = `rgba(${this.colors.code}, ${pulse * 0.65 * structureAlpha})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.6, 0, TAU);
      ctx.fill();
    });
    ctx.restore();
  }

  destroy() {
    this.stop();
    if (this.slowInterval) clearInterval(this.slowInterval);
    clearTimeout(this.genesisFallback);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("code-soul:genesis", this.startBirth);
    if (this.observer) this.observer.disconnect();
  }
}

export function initOrganism() {
  const canvas = document.querySelector("[data-organism]");
  if (!canvas) return;
  window.__codeSoulOrganism = new Organism({ canvas });
}
