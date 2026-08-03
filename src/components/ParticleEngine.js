export class ParticleEngine {

  constructor(canvas, count = 1200) {

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.count = count;

    this.x = new Float32Array(count);
    this.y = new Float32Array(count);

    this.tx = new Float32Array(count);
    this.ty = new Float32Array(count);

    this.vx = new Float32Array(count);
    this.vy = new Float32Array(count);

    this.size = new Float32Array(count);
    this.alpha = new Float32Array(count);

    this.color = new Uint8Array(count);

    this.resize();

    window.addEventListener(
      "resize",
      () => this.resize()
    );

    this.randomize();
  }

  resize() {

    this.width =
      this.canvas.width =
      window.innerWidth;

    this.height =
      this.canvas.height =
      window.innerHeight;

  }

  randomize() {

    for (
      let i = 0;
      i < this.count;
      i++
    ) {

      this.x[i] =
        Math.random() * this.width;

      this.y[i] =
        Math.random() * this.height;

      this.tx[i] = this.x[i];
      this.ty[i] = this.y[i];

      this.size[i] =
        Math.random() * 1.8 + .8;

      this.alpha[i] = 0;

      this.color[i] =
        Math.random() > .15
          ? 0
          : 1;

    }

  }

  fadeIn(speed = .04) {

    for (
      let i = 0;
      i < this.count;
      i++
    ) {

      if (
        this.alpha[i] < 1
      ) {

        this.alpha[i] += speed;

      }

    }

  }

  update() {

    for (
      let i = 0;
      i < this.count;
      i++
    ) {

      this.vx[i] +=
        (this.tx[i] - this.x[i])
        * .025;

      this.vy[i] +=
        (this.ty[i] - this.y[i])
        * .025;

      this.vx[i] *= .88;
      this.vy[i] *= .88;

      this.x[i] +=
        this.vx[i];

      this.y[i] +=
        this.vy[i];

    }

  }

  draw() {

    const ctx = this.ctx;

    ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    for (
      let i = 0;
      i < this.count;
      i++
    ) {

      ctx.globalAlpha =
        this.alpha[i];

      ctx.fillStyle =
        this.color[i]
          ? "#D7FF3F"
          : "#F1F0EB";

      ctx.beginPath();

      ctx.arc(

        this.x[i],

        this.y[i],

        this.size[i],

        0,

        Math.PI * 2

      );

      ctx.fill();

    }

  }

  setTargets(points) {

  const offsetX =
    (this.width - 1600) / 2;

  const offsetY =
    (this.height - 600) / 2;

  for (
    let i = 0;
    i < this.count;
    i++
  ) {

    const p =
      points[
        i % points.length
      ];

    this.tx[i] =
      p.x + offsetX;

    this.ty[i] =
      p.y + offsetY;

  }

}
}

