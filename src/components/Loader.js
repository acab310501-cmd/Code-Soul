import gsap from "gsap";

export function initLoader() {
  const loader = document.querySelector("[data-loader]");
  const canvas = document.getElementById("loaderCanvas");

  if (!loader || !canvas) return;

  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const particles = [];

  const COUNT =
    window.innerWidth < 768
      ? 450
      : 900;

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,

      tx: width / 2,
      ty: height / 2,

      size:
        Math.random() * 2 + 1,

      alpha: 0,

      color:
        Math.random() > 0.15
          ? "#f1f0eb"
          : "#d7ff3f",
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;

      ctx.globalAlpha = p.alpha;

      ctx.beginPath();
      ctx.fillStyle = p.color;

      ctx.arc(
        p.x,
        p.y,
        p.size,
        0,
        Math.PI * 2
      );

      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();

  gsap.to(particles, {
    alpha: 1,
    duration: 1.1,
    stagger: {
      each: 0.001,
      from: "random",
    },
  });

  gsap.delayedCall(2.2, () => {
    particles.forEach((p) => {
      p.tx =
        Math.random() * width;

      p.ty =
        Math.random() * height;
    });

    gsap.to(loader, {
      opacity: 0,
      duration: 1,
      ease: "power3.out",

      onComplete() {
        loader.classList.add(
          "is-hidden"
        );
      },
    });
  });
}