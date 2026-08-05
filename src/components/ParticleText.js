import gsap from "gsap";

export class ParticleText {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.text = options.text || "";
    this.fontSize = options.fontSize || 120;

    this.color = options.color || "#f1f0eb";

    // "Кислотный градиент": нижняя часть текста плавно
    // переходит в акцентный #d7ff3f со свечением, верх
    // остаётся в базовом цвете. Управляется опцией, чтобы
    // лоадер (где эффект не нужен) оставался нейтральным.
    this.acidGradient = options.acidGradient || false;
    this.acidColor = options.acidColor || "#d7ff3f";

    this.mouse = {
      x: -9999,
      y: -9999,
      radius: 100,
    };

    this.particles = [];
    this.targets = [];
    this.running = true;
    this.time = 0;
    this.startRaf = null;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.style.pointerEvents = "none";

    this.ctx = this.canvas.getContext("2d");

    this.start();
  }


  /*
    The canvas can report zero width/height if this runs
    before layout has settled (e.g. right at DOMContentLoaded).
    Reading image data from a zero-size canvas throws, so wait
    for a real size before building the particle target.
  */

  start() {
    this.resize();

    if (this.width <= 0 || this.height <= 0) {
this.startRaf = requestAnimationFrame(() => {
  this.startRaf = null;
  this.start();
});      return;
    }

    this.createTarget();
    this.createParticles();
    this.bindEvents();

    this.animate();
  }


  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.canvas.width =
      this.width * this.dpr;

    this.canvas.height =
      this.height * this.dpr;

    this.ctx.setTransform(
      this.dpr,
      0,
      0,
      this.dpr,
      0,
      0
    );
  }


  createTarget() {
    const offscreen =
      document.createElement("canvas");

    const ctx =
      offscreen.getContext("2d");

    /*
      ИСПРАВЛЕНО (мобильная нечитабельность заголовка Hero):
      fontSize раньше ограничивался только шириной канваса
      (this.width * 0.85). На мобильных высота каждой строки
      заголовка — это clamp(...)/15vw из hero.css, и она может
      быть заметно меньше, чем фиксированный fontSize (70px),
      который main.js передаёт для window.innerWidth < 700.
      Буквы обрезались сверху/снизу и соседние строки визуально
      сливались в нечитаемое пятно точек. Теперь размер шрифта
      дополнительно ограничен высотой самого канваса — на любом
      экране текст гарантированно помещается в свою строку.
    */
    const size =
      Math.min(
        this.fontSize,
        this.width * 0.85,
        this.height * 0.78
      );

    offscreen.width =
      this.width;

    offscreen.height =
      this.height;

    ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    ctx.fillStyle = "#fff";

    ctx.font =
      `700 ${size}px Arial, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      this.text,
      this.width / 2,
      this.height / 2
    );


    const imageData =
      ctx.getImageData(
        0,
        0,
        this.width,
        this.height
      );


    this.targets = [];

const step =
      window.innerWidth < 700
        ? 8
        : 7;

    for (
      let y = 0;
      y < this.height;
      y += step
    ) {
      for (
        let x = 0;
        x < this.width;
        x += step
      ) {

        const index =
          (y * this.width + x) * 4;

        const alpha =
          imageData.data[index + 3];


        if (alpha > 100) {
          this.targets.push({
            x,
            y,
          });
        }
      }
    }
  }


  createParticles() {
    const count =
      this.targets.length;

    const baseRgb = this.hexToRgb(this.color);
    const acidRgb = this.hexToRgb(this.acidColor);

    this.particles =
      Array.from(
        { length: count },
        (_, index) => {

          const target =
            this.targets[index];

          // 0 у верхнего края текста, 1 у нижнего —
          // используется для кислотного градиента.
          const mix =
            this.acidGradient && this.height > 0
              ? Math.min(1, Math.max(0, target.y / this.height))
              : 0;

          return {
            x:
              Math.random() *
              this.width,

            y:
              Math.random() *
              this.height,

            tx: target.x,
            ty: target.y,

            vx: 0,
            vy: 0,

            size:
              Math.random() *
              1.5 +
              0.45,

            alpha:
              Math.random() *
              0.55 +
              0.35,

            delay:
              Math.random() * 1.2,

            // Микро-дрейф: у каждой частицы своя фаза и
            // скорость, чтобы всё поле не "дышало" синхронно,
            // как единый организм, а выглядело органично.
            driftPhase:
              Math.random() * Math.PI * 2,

            driftSpeed:
              0.15 + Math.random() * 0.25,

            driftAmp:
              0.6 + Math.random() * 0.9,

            colorMix: mix,
            rgb: baseRgb,
          };
        }
      );

    if (this.acidGradient) {
      this._baseRgb = baseRgb;
      this._acidRgb = acidRgb;
    }
  }


  /*
    Все три canvas'а заголовка Hero создаются с acidGradient:true,
    из-за чего почти все частицы красятся через кэшированный
    this._baseRgb, а не через живое чтение this.color при отрисовке.
    При смене темы (VOID/PAPER) нужно обновить и то, и другое,
    иначе текст останется светлым и станет невидимым на светлом фоне.
  */
  setColor(hex) {
    this.color = hex;
    this._baseRgb = this.hexToRgb(hex);
  }

  hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(
      clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean,
      16
    );
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }


  bindEvents() {
    this.moveHandler =
      (event) => {

        const rect =
          this.canvas.getBoundingClientRect();

        this.mouse.x =
          event.clientX -
          rect.left;

        this.mouse.y =
          event.clientY -
          rect.top;
      };


    window.addEventListener(
      "mousemove",
      this.moveHandler,
      { passive: true }
    );


    this.resizeHandler =
      () => {

        this.resize();

        if (this.width <= 0 || this.height <= 0) return;

        this.createTarget();
        this.createParticles();
      };


    window.addEventListener(
      "resize",
      this.resizeHandler,
      { passive: true }
    );
  }


  updateParticle(particle) {

const dx =
  particle.x - this.mouse.x;

const dy =
  particle.y - this.mouse.y;

const distanceSq =
  dx * dx + dy * dy;

const radiusSq =
  this.mouse.radius * this.mouse.radius;

if (distanceSq < radiusSq) {

  const distance =
    Math.sqrt(distanceSq) || 1;

  const force =
    (1 - distance / this.mouse.radius) * 2.8;

  particle.vx +=
    (dx / distance) * force;

  particle.vy +=
    (dy / distance) * force;
}

    const spring =
      0.045;

    particle.vx +=
      (particle.tx -
        particle.x) *
      spring;

    particle.vy +=
      (particle.ty -
        particle.y) *
      spring;


    particle.vx *= 0.82;
    particle.vy *= 0.82;


    particle.x +=
      particle.vx;

    particle.y +=
      particle.vy;

    // Микро-дрейф поверх пружинной физики: едва заметное
    // "плавание" даже когда частица уже осела в точке —
    // текст выглядит живым, а не замёрзшим кадром.
    particle.driftX =
      Math.sin(this.time * particle.driftSpeed + particle.driftPhase) *
      particle.driftAmp;

    particle.driftY =
      Math.cos(this.time * particle.driftSpeed * 0.8 + particle.driftPhase) *
      particle.driftAmp;
  }


  drawParticle(particle) {

    const drawX = particle.x + (particle.driftX || 0);
    const drawY = particle.y + (particle.driftY || 0);
    
  if (
  drawX < -10 ||
  drawY < -10 ||
  drawX > this.width + 10 ||
  drawY > this.height + 10
) {
  return;
}

    this.ctx.beginPath();

    this.ctx.arc(
      drawX,
      drawY,
      particle.size,
      0,
      Math.PI * 2
    );

    if (this.acidGradient && particle.colorMix > 0) {
      const t = particle.colorMix;
      const r = Math.round(this._baseRgb.r + (this._acidRgb.r - this._baseRgb.r) * t);
      const g = Math.round(this._baseRgb.g + (this._acidRgb.g - this._baseRgb.g) * t);
      const b = Math.round(this._baseRgb.b + (this._acidRgb.b - this._baseRgb.b) * t);
      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      // Свечение только для нижней, наиболее "кислотной"
      // трети текста — дешевле по производительности, чем
      // shadowBlur на каждой частице поля.
      if (t > 0.6) {
        this.ctx.shadowColor = this.acidColor;
        this.ctx.shadowBlur = 6 * ((t - 0.6) / 0.4);
      } else {
        this.ctx.shadowBlur = 0;
      }
    } else {
      this.ctx.fillStyle =
        this.color;
    }

    this.ctx.globalAlpha =
      particle.alpha;

    this.ctx.fill();

    if (this.acidGradient) {
      this.ctx.shadowBlur = 0;
    }
  }


animate = () => {
  if (!this.running) return;

  if (!document.hidden) {
    this.time += 0.016;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.globalAlpha = 1;

for (let i = 0; i < this.particles.length; i++) {
  const particle = this.particles[i];

  this.updateParticle(particle);
  this.drawParticle(particle);
}
    this.ctx.globalAlpha = 1;
  }

  this.rafId = requestAnimationFrame(this.animate);
};
  scatter(power = 15) {

    this.particles.forEach(
      (particle) => {

        const angle =
          Math.random() *
          Math.PI *
          2;

        const force =
          Math.random() *
          power;

        particle.vx +=
          Math.cos(angle) *
          force;

        particle.vy +=
          Math.sin(angle) *
          force;
      }
    );
  }

stop() {

  this.destroy();

  this.ctx.clearRect(
    0,
    0,
    this.width,
    this.height
  );

}

destroy() {

  this.running = false;
  if (this.startRaf) {
  cancelAnimationFrame(this.startRaf);
  this.startRaf = null;
}

  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  window.removeEventListener(
    "mousemove",
    this.moveHandler
  );

  window.removeEventListener(
    "resize",
    this.resizeHandler
  );
}

}