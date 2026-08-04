import gsap from "gsap";

export function initCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const cursor = document.querySelector(".cursor");
  const ring = document.querySelector(".cursor__ring");
  const label = document.querySelector(".cursor__label");

  if (!cursor || !ring || !label) return;

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  // Позиция самой точки (dot) — следует почти мгновенно, без
  // задержки; лерпится только внешнее кольцо (ring), чтобы
  // сохранить мягкость, но убрать ощущение "курсор не успевает".
  let dotX = mouseX;
  let dotY = mouseY;

  // Логика "Затухание при выходе за пределы окна"
  document.addEventListener("mouseleave", () => {
    gsap.to(cursor, { opacity: 0, duration: 0.3 });
  });
  document.addEventListener("mouseenter", () => {
    gsap.to(cursor, { opacity: 1, duration: 0.3 });
  });

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const dot = cursor.querySelector(".cursor__dot");

  function render() {
    if (!document.hidden) {
      // ИСПРАВЛЕНО: 0.12 давало заметный лаг — курсор "не успевал"
      // за настоящей мышью на быстрых движениях. Внешнее кольцо
      // (ring) теперь лерпится быстрее (0.32), а маленькая точка
      // (dot) следует за реальной позицией мыши практически без
      // задержки — так пропадает ощущение отставания, но
      // сохраняется мягкое, "живое" движение кольца.
      currentX += (mouseX - currentX) * 0.32;
      currentY += (mouseY - currentY) * 0.32;
      gsap.set(cursor, { x: currentX, y: currentY });

      if (dot) {
        gsap.set(dot, {
          xPercent: -50,
          yPercent: -50,
          x: mouseX - currentX,
          y: mouseY - currentY,
        });
      }
    }
    requestAnimationFrame(render);
  }
  render();

  const interactiveSelector = "a, button, [data-cursor]";

  document.addEventListener("mouseover", (event) => {
    const element = event.target.closest(interactiveSelector);
    if (!element) return;

    const text = element.dataset.cursor || "";
    label.textContent = text;

    // Анимация кольца: масштабирование для разных типов кнопок
    if (text === "OPEN" || text === "EXPLORE") {
      gsap.to(ring, { scale: 1.8, borderColor: "#d7ff3f", duration: 0.4, ease: "power3.out" });
      gsap.to(label, { opacity: 1, scale: 1, y: -25, duration: 0.4, ease: "power3.out" });
    } else if (text === "START") {
      gsap.to(ring, { scale: 2.5, borderColor: "#d7ff3f", opacity: 0.3, duration: 0.6, ease: "power3.out", repeat: 1, yoyo: true });
    } else {
      gsap.to(ring, { scale: 1.5, duration: 0.4, ease: "power3.out" });
      gsap.to(label, { opacity: 1, scale: 1, duration: 0.3 });
    }
  });

  document.addEventListener("mouseout", (event) => {
    const element = event.target.closest(interactiveSelector);
    if (!element) return;
    gsap.to(ring, { scale: 0.6, borderColor: "rgba(255, 255, 255, 0.7)", opacity: 1, duration: 0.4, ease: "power3.out" });
    gsap.to(label, { opacity: 0, scale: 0.7, y: 0, duration: 0.3 });
  });
}