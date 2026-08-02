import gsap from "gsap";

export function initCursor() {
  if (
    window.matchMedia("(pointer: coarse)").matches
  ) {
    return;
  }

  const cursor =
    document.querySelector(".cursor");

  const dot =
    document.querySelector(".cursor__dot");

  const ring =
    document.querySelector(".cursor__ring");

  const label =
    document.querySelector(".cursor__label");

  if (!cursor || !dot || !ring || !label) {
    return;
  }

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;

  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    },
    { passive: true }
  );

  function render() {
    currentX +=
      (mouseX - currentX) * 0.16;

    currentY +=
      (mouseY - currentY) * 0.16;

    gsap.set(cursor, {
      x: currentX,
      y: currentY,
    });

    requestAnimationFrame(render);
  }

  render();

  const interactiveSelector =
    "a, button, [data-cursor]";

  document.addEventListener(
    "mouseover",
    (event) => {
      const element =
        event.target.closest(interactiveSelector);

      if (!element) return;

      if (
        event.relatedTarget &&
        element.contains(event.relatedTarget)
      ) return;

      label.textContent =
        element.dataset.cursor || "";

      gsap.to(ring, {
        scale: 1.7,
        duration: 0.45,
        ease: "power3.out",
      });

      gsap.to(dot, {
        scale: 0.5,
        duration: 0.35,
      });

      gsap.to(label, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
      });
    },
    { passive: true }
  );

  document.addEventListener(
    "mouseout",
    (event) => {
      const element =
        event.target.closest(interactiveSelector);

      if (!element) return;

      if (
        event.relatedTarget &&
        element.contains(event.relatedTarget)
      ) return;

      gsap.to(ring, {
        scale: 0.6,
        duration: 0.45,
        ease: "power3.out",
      });

      gsap.to(dot, {
        scale: 1,
        duration: 0.35,
      });

      gsap.to(label, {
        opacity: 0,
        scale: 0.7,
        duration: 0.3,
      });
    },
    { passive: true }
  );
}