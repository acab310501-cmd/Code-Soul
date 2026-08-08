/**
 * Organism — главный герой Hero и символ бренда Code & Soul.
 *
 * Визуальный язык: не контур, не многоугольник, не залитая клякса.
 * Это облако светящихся нитей и пыли — как долгая выдержка нейронного
 * разряда или плазмы. Тонкие лаймовые нити (SOUL — энергия, жизнь)
 * веером расходятся из ядра к невидимому каркасу опорных точек
 * (CODE — структура, которая держит форму, но сама не видна как линия).
 * Нити рисуются аддитивным блендингом — там, где они пересекаются,
 * свечение само нарастает.
 *
 * Метаморфоза: организм никогда не застывает в одной форме. У каждой
 * опорной точки и нити есть собственный "внутренний таймер" — раз в
 * 6–16 секунд (у каждой точки свой, вразнобой) она плавно "передумывает"
 * свою амплитуду/кривизну и медленно, за несколько секунд, перетекает
 * к новому значению. Это не рестарт и не дискретная смена кадра — форма
 * непрерывно перетекает из одного состояния в другое, как будто
 * постоянно пересобирается из той же материи в новую.
 *
 * Генеративность: стартовые параметры и последовательность метаморфоз
 * каждый раз новые (без seed), но алгоритм и цвет неизменны — поэтому
 * это всегда узнаваемо Code & Soul.
 *
 * Рождение: организм начинает расти немедленно при создании (никогда
 * не остаётся невидимым в ожидании внешнего события/таймера — это
 * критично для мобильных браузеров, которые придерживают JS-таймеры
 * фоновых вкладок). Если рядом успевает сработать событие открытия
 * лоадера, рождение аккуратно переигрывается синхронно с ним;
 * если нет — организм всё равно уже на экране.
 *
 * Реагирует на курсор, никогда не останавливается, но экономна:
 * пауза вне вьюпорта/на скрытой вкладке, DPR ограничен, без тяжёлых
 * per-frame фильтров на весь canvas.
 */

const TAU = Math.PI * 2;

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// Плавающее значение, которое раз в случайный интервал "передумывает"
// свою цель и не спеша перетекает к ней — источник непрерывной
// метаморфозы формы (не шум, а осознанный редкий дрейф).
class DriftingValue {
  constructor(min, max, { minInterval = 6, maxInterval = 16, morphTime = 3.5 } = {}) {
    this.min = min;
    this.max = max;
    this.minInterval = minInterval;
    this.maxInterval = maxInterval;
    this.morphTime = morphTime;
    this.value = rand(min, max);
    this.from = this.value;
    this.to = this.value;
    this.t = 1;
    this.nextAt = rand(0, maxInterval); // рассинхронизировано с самого начала
  }
  update(time, dt) {
    if (time >= this.nextAt && this.t >= 1) {
      this.from = this.value;
      this.to = rand(this.min, this.max);
      this.t = 0;
      this.nextAt = time + rand(this.minInterval, this.maxInterval);
    }
    if (this.t < 1) {
      this.t = Math.min(1, this.t + dt / this.morphTime);
      this.value = this.from + (this.to - this.from) * easeInOutSine(this.t);
    }
  }
}

export class Organism {
  constructor({ canvas, minAnchors = 8, maxAnchors = 12 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.wrap = canvas.parentElement;

    const isSmall = window.innerWidth < 700;
    const lo = isSmall ? Math.max(6, minAnchors - 2) : minAnchors;
    const hi = isSmall ? Math.max(7, maxAnchors - 3) : maxAnchors;

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ГЕНЕРАТИВНОСТЬ — у каждой загрузки своя особь, но тот же вид.
    this.anchorCount = Math.round(rand(lo, hi));
    this.rotation = Math.random() * TAU;
    this.radiusJitter = rand(0.9, 1.08);

    // Медленно "передумывающиеся" параметры общей формы — метаморфоза.
    this.squishDrift = new DriftingValue(0.74, 1.15, { minInterval: 7, maxInterval: 15, morphTime: 5 });
    this.rotationDriftSpeed = rand(0.01, 0.025) * (Math.random() < 0.5 ? -1 : 1);

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.time = 0;
    this.raf = null;
    this.visible = true;
    this.lastFrame = 0;

    // Рождение начинается сразу — без ожидания внешних событий,
    // это гарантирует видимость даже если вкладка была фоновой при
    // загрузке (частый случай для встроенных браузеров вроде Telegram).
    this.birth = this.reducedMotion ? 1 : 0;
    this.birthStartTime = null;
    this.birthDuration = 2.2;

    this.pointer = { x: 0, y: 0, active: false, tx: 0, ty: 0 };

    this.colors = { soul: "215, 255, 63", code: "241, 240, 235" };

    // Опорные точки каркаса (CODE) — не рисуются линиями, но управляют
    // тем, куда "дует" энергия (SOUL). У каждой — своя дрейфующая
    // амплитуда радиуса, поэтому со временем точки то тянутся дальше,
    // то стягиваются ближе, будто форма пересобирается заново.
    this.anchors = Array.from({ length: this.anchorCount }, (_, i) => ({
      angle: (i / this.anchorCount) * TAU + this.rotation,
      seedA: Math.random() * TAU,
      seedB: Math.random() * TAU,
      seedC: Math.random() * TAU,
      pulse: Math.random() * TAU,
      radiusMix: new DriftingValue(0.7, 1.35, {
        minInterval: rand(5, 9),
        maxInterval: rand(11, 18),
        morphTime: rand(3, 6),
      }),
      x: 0,
      y: 0,
    }));

    // Нити — рисуются от точки у ядра к одному из якорей, с органичным
    // изгибом. Количество пропорционально числу якорей — форма остаётся
    // узнаваемой, но кривизна и охват каждой нити тоже медленно дрейфуют.
    const filamentCount = Math.round(this.anchorCount * rand(2.6, 3.4));
    this.filaments = Array.from({ length: filamentCount }, () => ({
      anchorIndex: Math.floor(Math.random() * this.anchorCount),
      startAngle: Math.random() * TAU,
      startRadiusFrac: rand(0.02, 0.22),
      endRadiusFrac: new DriftingValue(0.7, 1.3, {
        minInterval: rand(6, 10),
        maxInterval: rand(12, 20),
        morphTime: rand(3, 6),
      }),
      endAngleJitter: rand(-0.22, 0.22),
      curl: rand(-1, 1) * rand(0.15, 0.45),
      curlFreq: rand(0.15, 0.4),
      phase: Math.random() * TAU,
      widthMix: rand(0.5, 1.4),
      alphaMix: rand(0.5, 1.2),
    }));

    // Несколько нитей "вырываются" за пределы формы — тонкие усы,
    // ускользающие за основной силуэт; их длина тоже дышит.
    this.tendrils = Array.from({ length: Math.round(this.anchorCount * 0.5) }, () => ({
      anchorIndex: Math.floor(Math.random() * this.anchorCount),
      reach: new DriftingValue(1.15, 1.85, {
        minInterval: rand(5, 9),
        maxInterval: rand(10, 16),
        morphTime: rand(2.5, 5),
      }),
      angleJitter: rand(-0.3, 0.3),
      curl: rand(-1, 1) * rand(0.2, 0.5),
      phase: Math.random() * TAU,
    }));

    // Пыль — искры, разбросанные по объёму формы.
    const dustCount = isSmall ? 40 : 70;
    this.dust = Array.from({ length: dustCount }, () => ({
      angle: Math.random() * TAU,
      radiusFrac: rand(0.05, 1.25),
      driftSpeed: rand(-0.06, 0.06),
      size: rand(0.5, 1.8),
      phase: Math.random() * TAU,
      twinkleSpeed: rand(0.6, 1.8),
    }));

    this.resize = this.resize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.tick = this.tick.bind(this);
    this.replayBirth = this.replayBirth.bind(this);

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

    // Если лоадер успевает открыть сцену синхронно — красиво переигрываем
    // рождение день в день с ним. Но это бонус, а не условие видимости.
    window.addEventListener("code-soul:genesis", this.replayBirth, { once: true });

    if (this.reducedMotion) {
      this.computeAnchors();
      this.drawFrame();
      this.slowInterval = setInterval(() => this.drawFrame(), 2600);
    } else {
      this.start();
    }
  }

  replayBirth() {
    // Не запускаем рождение (оно уже идёт с t=0 конструктора), а лишь
    // синхронизируем момент вспышки с открытием сцены, если успели вовремя.
    if (this.birth < 0.9) {
      this.birthStartTime = null;
      this.birth = 0;
    }
  }

  setTheme(theme) {
    this.colors.code = theme === "light" ? "225, 255, 205" : "241, 240, 235";
  }

  resize() {
    const rect = this.wrap.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // Держим форму заметно меньше самого canvas — так свечение и нити
    // естественно затухают, не упираясь в квадратные границы холста.
    this.baseRadius = Math.min(this.width, this.height) * 0.33 * this.radiusJitter;
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

    if (this.birth < 1) {
      if (this.birthStartTime === null) this.birthStartTime = now;
      const elapsed = (now - this.birthStartTime) / 1000;
      this.birth = Math.min(1, elapsed / this.birthDuration);
    }

    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.06;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.06;

    this.updateDrift(dt);
    this.computeAnchors();
    this.drawFrame();
    this.raf = requestAnimationFrame(this.tick);
  }

  updateDrift(dt) {
    this.squishDrift.update(this.time, dt);
    this.anchors.forEach((a) => a.radiusMix.update(this.time, dt));
    this.filaments.forEach((f) => f.endRadiusFrac.update(this.time, dt));
    this.tendrils.forEach((t) => t.reach.update(this.time, dt));
  }

  anchorRadius(anchor) {
    const t = this.time;
    const breathe =
      1 +
      0.14 * Math.sin(t * 0.5 + anchor.seedA) +
      0.07 * Math.sin(t * 1.2 + anchor.seedB) +
      0.04 * Math.sin(t * 2.1 + anchor.seedC);
    return this.baseRadius * breathe * anchor.radiusMix.value;
  }

  computeAnchors() {
    const { cx, cy } = this;
    const lifeScale = this.reducedMotion ? 1 : easeOutExpo(Math.min(1, this.birth * 1.3));
    const squish = this.reducedMotion ? 1 : this.squishDrift.value;
    const slowSpin = this.reducedMotion ? 0 : this.time * this.rotationDriftSpeed;

    this.anchors.forEach((anchor) => {
      let r = this.anchorRadius(anchor) * lifeScale;
      let angle = anchor.angle + slowSpin + Math.sin(this.time * 0.1 + anchor.seedA) * 0.06;
      let x = cx + Math.cos(angle) * r;
      let y = cy + Math.sin(angle) * r * squish;

      if (this.pointer.active) {
        const dx = x - this.pointer.x;
        const dy = y - this.pointer.y;
        const dist = Math.hypot(dx, dy) || 1;
        const influence = Math.max(0, 1 - dist / (this.baseRadius * 1.5));
        if (influence > 0) {
          const push = influence * this.baseRadius * 0.2;
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
      }

      anchor.x = x;
      anchor.y = y;
    });
  }

  drawFrame() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const structureAlpha = this.reducedMotion ? 1 : Math.min(1, this.birth * 2.6);
    const lifeAlpha = this.reducedMotion
      ? 1
      : easeOutExpo(Math.max(0, (this.birth - 0.12) / 0.88));
    const spark = this.reducedMotion
      ? 0
      : Math.max(0, 1 - Math.abs(this.birth - 0.4) * 5) * 0.7;

    if (lifeAlpha <= 0 && structureAlpha <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    this.drawFilaments(ctx, lifeAlpha, spark);
    this.drawDust(ctx, lifeAlpha);
    this.drawCore(ctx, lifeAlpha, spark);
    ctx.restore();

    this.drawAnchorMarks(ctx, structureAlpha);
  }

  // Мягкий органичный изгиб точки на кривой — не случайный дребезг,
  // а плавное "дыхание" нити во времени.
  curlOffset(seedFreq, phase, amount) {
    return Math.sin(this.time * seedFreq + phase) * amount;
  }

  drawFilaments(ctx, lifeAlpha, spark) {
    if (lifeAlpha <= 0) return;
    const { cx, cy, baseRadius } = this;
    const squish = this.reducedMotion ? 1 : this.squishDrift.value;

    this.filaments.forEach((f) => {
      const anchor = this.anchors[f.anchorIndex];
      if (!anchor) return;

      const startR = baseRadius * f.startRadiusFrac;
      const sx = cx + Math.cos(f.startAngle) * startR;
      const sy = cy + Math.sin(f.startAngle) * startR * squish;

      const anchorAngle = Math.atan2(anchor.y - cy, (anchor.x - cx) || 1);
      const anchorDist = Math.hypot(anchor.x - cx, anchor.y - cy);
      const endAngle = anchorAngle + f.endAngleJitter;
      const endR = anchorDist * f.endRadiusFrac.value;
      const ex = cx + Math.cos(endAngle) * endR;
      const ey = cy + Math.sin(endAngle) * endR;

      const midX = (sx + ex) / 2;
      const midY = (sy + ey) / 2;
      const dx = ex - sx;
      const dy = ey - sy;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const wobble = this.curlOffset(f.curlFreq, f.phase, len * f.curl);
      const cxp = midX + nx * wobble;
      const cyp = midY + ny * wobble;

      const alpha = 0.09 * f.alphaMix * lifeAlpha + spark * 0.05;
      ctx.strokeStyle = `rgba(${this.colors.soul}, ${alpha})`;
      ctx.lineWidth = 0.6 * f.widthMix;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cxp, cyp, ex, ey);
      ctx.stroke();
    });

    this.tendrils.forEach((t) => {
      const anchor = this.anchors[t.anchorIndex];
      if (!anchor) return;
      const angle = Math.atan2(anchor.y - cy, (anchor.x - cx) || 1) + t.angleJitter;
      const dist = Math.hypot(anchor.x - cx, anchor.y - cy);
      const ex = cx + Math.cos(angle) * dist * t.reach.value;
      const ey = cy + Math.sin(angle) * dist * t.reach.value;
      const midX = (anchor.x + ex) / 2;
      const midY = (anchor.y + ey) / 2;
      const wobble = this.curlOffset(0.3, t.phase, 14 * t.curl);

      const grad = ctx.createLinearGradient(anchor.x, anchor.y, ex, ey);
      grad.addColorStop(0, `rgba(${this.colors.soul}, ${0.16 * lifeAlpha})`);
      grad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.quadraticCurveTo(midX + wobble, midY - wobble, ex, ey);
      ctx.stroke();
    });
  }

  drawDust(ctx, lifeAlpha) {
    if (lifeAlpha <= 0) return;
    const { cx, cy, baseRadius } = this;
    const squish = this.reducedMotion ? 1 : this.squishDrift.value;

    this.dust.forEach((d) => {
      const angle = d.angle + this.time * d.driftSpeed;
      const r = baseRadius * d.radiusFrac;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * squish;
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(this.time * d.twinkleSpeed + d.phase));
      const edgeFalloff = 1 - Math.min(1, d.radiusFrac / 1.3) * 0.6;

      ctx.fillStyle = `rgba(${this.colors.soul}, ${0.5 * twinkle * edgeFalloff * lifeAlpha})`;
      ctx.beginPath();
      ctx.arc(x, y, d.size, 0, TAU);
      ctx.fill();
    });
  }

  drawCore(ctx, lifeAlpha, spark) {
    if (lifeAlpha <= 0) return;
    const { cx, cy, baseRadius } = this;
    const coreR = baseRadius * (0.22 + spark * 0.08);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    grad.addColorStop(0, `rgba(${this.colors.soul}, ${(0.85 + spark * 0.15) * lifeAlpha})`);
    grad.addColorStop(0.5, `rgba(${this.colors.soul}, ${0.35 * lifeAlpha})`);
    grad.addColorStop(1, `rgba(${this.colors.soul}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, TAU);
    ctx.fill();
  }

  // Едва заметные узлы каркаса — структура, которая держит форму,
  // но не спорит с ней визуально (никаких прямых линий-«звёзд»).
  drawAnchorMarks(ctx, structureAlpha) {
    if (structureAlpha <= 0) return;
    ctx.save();
    this.anchors.forEach((anchor, i) => {
      const pulse = 0.3 + 0.3 * Math.abs(Math.sin(this.time * 0.8 + anchor.pulse + i));
      ctx.fillStyle = `rgba(${this.colors.code}, ${pulse * 0.4 * structureAlpha})`;
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.1, 0, TAU);
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
    window.removeEventListener("code-soul:genesis", this.replayBirth);
    if (this.observer) this.observer.disconnect();
  }
}

export function initOrganism() {
  const canvas = document.querySelector("[data-organism]");
  if (!canvas) return;
  window.__codeSoulOrganism = new Organism({ canvas });
}
