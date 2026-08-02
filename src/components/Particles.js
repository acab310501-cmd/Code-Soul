export function initParticles() {

  const canvas =
    document.querySelector("#particleCanvas");

  if (!canvas) return;


  const context =
    canvas.getContext("2d");


  if (!context) return;


  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (reduceMotion) return;


  let width = 0;
  let height = 0;

  let particles = [];


  const PARTICLE_COUNT =
    window.innerWidth < 768
      ? 80
      : 150;


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


    context.setTransform(
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
        { length: PARTICLE_COUNT },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,

          size:
            Math.random() * 1.5 + 0.4,

          speed:
            Math.random() * 0.18 + 0.04,

          alpha:
            Math.random() * 0.45 + 0.1,

          phase:
            Math.random() * Math.PI * 2,
        })
      );

  }


  function render(time) {

    context.clearRect(
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
          time * 0.0004 +
          particle.phase
        ) * 3;


      context.beginPath();


      context.arc(
        particle.x + wave,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );


      context.fillStyle =
        `rgba(215,255,63,${particle.alpha})`;


      context.fill();

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