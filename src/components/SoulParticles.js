/* ========================================
   CODE & SOUL
   SOUL PARTICLE ENGINE
======================================== */

export class SoulParticles {
  constructor({
    canvas,
    image,
    density = 5,
    maxParticles = 18000,
    mouseRadius = 140,
    mouseForce = 7,
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.imageSrc = image;

    this.density = density;
    this.maxParticles = maxParticles;

    this.mouseRadius = mouseRadius;
    this.mouseForce = mouseForce;

    this.particles = [];

    this.mouse = {
      x: -9999,
      y: -9999,
      active: false,
    };

    this.time = 0;

    this.resize();

    this.loadImage();
  }


  /* ========================================
     RESIZE
  ======================================== */

  resize() {
    const rect =
      this.canvas.getBoundingClientRect();

    const dpr =
      Math.min(window.devicePixelRatio || 1, 2);

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width =
      this.width * dpr;

    this.canvas.height =
      this.height * dpr;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    if (this.image) {
      this.createParticles();
    }
  }


  /* ========================================
     IMAGE
  ======================================== */

  loadImage() {
    this.image = new Image();

    this.image.crossOrigin = "anonymous";

    this.image.onload = () => {
      this.createParticles();
      this.bindEvents();
      this.animate();
    };

    this.image.onerror = () => {
      console.warn(
        "SoulParticles: image failed to load:",
        this.imageSrc
      );
    };

    this.image.src = this.imageSrc;
  }


  /* ========================================
     PARTICLE CREATION
  ======================================== */

  createParticles() {
    if (!this.image) return;
    if (this.width <= 0 || this.height <= 0) return;

    const sourceCanvas =
      document.createElement("canvas");

    const sourceCtx =
      sourceCanvas.getContext("2d", {
        willReadFrequently: true,
      });


    /* Image aspect ratio */

    const imageRatio =
      this.image.naturalWidth /
      this.image.naturalHeight;

    const canvasRatio =
      this.width / this.height;


    let drawWidth;
    let drawHeight;
    let offsetX = 0;
    let offsetY = 0;


    if (imageRatio > canvasRatio) {

      drawHeight = this.height;

      drawWidth =
        drawHeight * imageRatio;

      offsetX =
        (this.width - drawWidth) / 2;

    } else {

      drawWidth = this.width;

      drawHeight =
        drawWidth / imageRatio;

      offsetY =
        (this.height - drawHeight) / 2;
    }


    /*
      Reduce source resolution.
      We don't need to analyse
      thousands of pixels.
    */

    const sampleWidth =
      Math.max(
        1,
        Math.floor(this.width / this.density)
      );

    const sampleHeight =
      Math.max(
        1,
        Math.floor(this.height / this.density)
      );


    sourceCanvas.width =
      sampleWidth;

    sourceCanvas.height =
      sampleHeight;


    sourceCtx.drawImage(
      this.image,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );


    const imageData =
      sourceCtx.getImageData(
        0,
        0,
        sampleWidth,
        sampleHeight
      );


    const pixels =
      imageData.data;


    this.particles = [];


    for (
      let y = 0;
      y < sampleHeight;
      y++
    ) {

      for (
        let x = 0;
        x < sampleWidth;
        x++
      ) {

        const index =
          (y * sampleWidth + x) * 4;


        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];


        if (a < 30) continue;


        /*
          Perceived luminance
        */

        const brightness =
          (
            r * 0.299 +
            g * 0.587 +
            b * 0.114
          ) / 255;


        /*
          Dark areas = stronger particles.
          This creates the halftone feeling.
        */

        const darkness =
          1 - brightness;


        /*
          Don't completely remove
          bright areas — otherwise
          the image becomes too fragmented.
        */

        if (
          darkness < 0.08 &&
          Math.random() > 0.12
        ) {
          continue;
        }


        const px =
          x * this.density;

        const py =
          y * this.density;


        const size =
          0.45 +
          darkness * 2.8;


        const particle = {

          x: px,
          y: py,

          homeX: px,
          homeY: py,

          vx: 0,
          vy: 0,

          size,

          alpha:
            0.12 +
            darkness * 0.88,

          brightness,

          phase:
            Math.random() * Math.PI * 2,

          drift:
            0.15 +
            Math.random() * 0.4,
        };


        this.particles.push(
          particle
        );


        if (
          this.particles.length >=
          this.maxParticles
        ) {
          break;
        }
      }


      if (
        this.particles.length >=
        this.maxParticles
      ) {
        break;
      }
    }
  }


  /* ========================================
     EVENTS
  ======================================== */

  bindEvents() {

    this.onMouseMove =
      (event) => {

        const rect =
          this.canvas.getBoundingClientRect();

        this.mouse.x =
          event.clientX - rect.left;

        this.mouse.y =
          event.clientY - rect.top;

        this.mouse.active = true;
      };


    this.onMouseLeave =
      () => {

        this.mouse.active = false;

        this.mouse.x = -9999;
        this.mouse.y = -9999;
      };


    this.canvas.addEventListener(
      "mousemove",
      this.onMouseMove
    );

    this.canvas.addEventListener(
      "mouseleave",
      this.onMouseLeave
    );


    this.onResize =
      () => this.resize();


    window.addEventListener(
      "resize",
      this.onResize
    );
  }


  /* ========================================
     UPDATE
  ======================================== */

  update() {

    this.time += 0.016;


    for (
      const particle of this.particles
    ) {

      /*
        Organic micro movement
      */

      const driftX =
        Math.sin(
          this.time *
            particle.drift +
            particle.phase
        ) * 0.12;

      const driftY =
        Math.cos(
          this.time *
            particle.drift * 0.8 +
            particle.phase
        ) * 0.12;


      /*
        Return to original position
      */

      const dx =
        particle.homeX -
        particle.x;

      const dy =
        particle.homeY -
        particle.y;


      particle.vx +=
        dx * 0.018;

      particle.vy +=
        dy * 0.018;


      /*
        Mouse interaction
      */

      if (this.mouse.active) {

        const mx =
          particle.x -
          this.mouse.x;

        const my =
          particle.y -
          this.mouse.y;

        const distance =
          Math.sqrt(
            mx * mx +
            my * my
          );


        if (
          distance <
          this.mouseRadius
        ) {

          const force =
            (
              1 -
              distance /
                this.mouseRadius
            );


          const angle =
            Math.atan2(
              my,
              mx
            );


          particle.vx +=
            Math.cos(angle) *
            force *
            this.mouseForce;

          particle.vy +=
            Math.sin(angle) *
            force *
            this.mouseForce;
        }
      }


      /*
        Apply velocity
      */

      particle.x +=
        particle.vx +
        driftX;

      particle.y +=
        particle.vy +
        driftY;


      /*
        Friction
      */

      particle.vx *= 0.82;
      particle.vy *= 0.82;
    }
  }


  /* ========================================
     DRAW
  ======================================== */

  draw() {

    this.ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );


    /*
      Subtle paper-like atmosphere
    */

    for (
      const particle of this.particles
    ) {

      const distance =
        Math.hypot(
          particle.x -
            this.mouse.x,

          particle.y -
            this.mouse.y
        );


      let alpha =
        particle.alpha;


      /*
        Mouse makes particles brighter
      */

      if (
        distance <
        this.mouseRadius
      ) {

        alpha +=
          (
            1 -
            distance /
              this.mouseRadius
          ) * 0.35;
      }


      this.ctx.beginPath();


      this.ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );


      /*
        Acid-green soul particles
      */

      this.ctx.fillStyle =
        `rgba(198, 255, 0, ${Math.min(
          alpha,
          1
        )})`;


      this.ctx.fill();
    }
  }


  /* ========================================
     LOOP
  ======================================== */

  animate() {

    this.update();

    this.draw();


    this.animationFrame =
      requestAnimationFrame(
        () => this.animate()
      );
  }


  /* ========================================
     DESTROY
  ======================================== */

  destroy() {

    cancelAnimationFrame(
      this.animationFrame
    );


    this.canvas.removeEventListener(
      "mousemove",
      this.onMouseMove
    );

    this.canvas.removeEventListener(
      "mouseleave",
      this.onMouseLeave
    );

    window.removeEventListener(
      "resize",
      this.onResize
    );
  }
}