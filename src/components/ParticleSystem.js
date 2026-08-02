export function initParticleSystem() {
  const canvas =
    document.querySelector(
      "#particleCanvas"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) return;


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if (reducedMotion) return;


  let width = 0;
  let height = 0;

  let particles = [];


  const getCount = () =>
    window.innerWidth < 700
      ? 55
      : 130;


  function resize() {
    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    width =
      canvas.clientWidth;

    height =
      canvas.clientHeight;

    canvas.width =
      width * dpr;

    canvas.height =
      height * dpr;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }


  function createParticles() {
    particles =
      Array.from(
        {
          length: getCount(),
        },
        () => ({
          x:
            Math.random() * width,

          y:
            Math.random() * height,

          size:
            Math.random() * 1.4 + 0.35,

          speed:
            Math.random() * 0.16 + 0.035,

          alpha:
            Math.random() * 0.35 + 0.08,

          phase:
            Math.random() *
            Math.PI *
            2,
        })
      );
  }


  function render(time) {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    particles.forEach((particle) => {

      particle.y -=
        particle.speed;


      if (particle.y < -10) {
        particle.y =
          height + 10;

        particle.x =
          Math.random() * width;
      }


      const wave =
        Math.sin(
          time * 0.00045 +
          particle.phase
        ) * 4;


      ctx.beginPath();

      ctx.arc(
        particle.x + wave,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );


      ctx.fillStyle =
        `rgba(215,255,63,${particle.alpha})`;

      ctx.fill();
    });


    requestAnimationFrame(render);
  }


  resize();
  createParticles();


  window.addEventListener(
    "resize",
    () => {
      resize();
      createParticles();
    },
    { passive: true }
  );


  requestAnimationFrame(render);
}