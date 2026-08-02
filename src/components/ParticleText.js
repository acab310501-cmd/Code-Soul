import gsap from "gsap";

export class ParticleText {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.text = options.text || "";
    this.fontSize = options.fontSize || 120;

    this.color = options.color || "#f1f0eb";

    this.mouse = {
      x: -9999,
      y: -9999,
      radius: 100,
    };

    this.particles = [];
    this.targets = [];

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
      requestAnimationFrame(() => this.start());
      return;
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

    const size =
      Math.min(
        this.fontSize,
        this.width * 0.85
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
        ? 5
        : 4;


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

    this.particles =
      Array.from(
        { length: count },
        (_, index) => {

          const target =
            this.targets[index];

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
          };
        }
      );
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
      particle.x -
      this.mouse.x;

    const dy =
      particle.y -
      this.mouse.y;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance <
      this.mouse.radius
    ) {

      const force =
        (1 -
          distance /
            this.mouse.radius) *
        2.8;

      particle.vx +=
        (dx / (distance || 1)) *
        force;

      particle.vy +=
        (dy / (distance || 1)) *
        force;
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
  }


  drawParticle(particle) {

    this.ctx.beginPath();

    this.ctx.arc(
      particle.x,
      particle.y,
      particle.size,
      0,
      Math.PI * 2
    );

    this.ctx.fillStyle =
      this.color;

    this.ctx.globalAlpha =
      particle.alpha;

    this.ctx.fill();
  }


  animate = () => {

    this.ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );


    this.ctx.globalAlpha = 1;


    this.particles.forEach(
      (particle) => {

        this.updateParticle(
          particle
        );

        this.drawParticle(
          particle
        );
      }
    );


    this.ctx.globalAlpha = 1;

    requestAnimationFrame(
      this.animate
    );
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


  destroy() {

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