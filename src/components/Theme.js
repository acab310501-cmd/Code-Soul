import gsap from "gsap";
import { THEME_COLORS } from "../theme-colors.js";

/**
 * Тема — это не Dark/Light. Это две личности одного цифрового организма:
 * CODE (тёмный мир структуры) и SOUL (светящийся мир энергии).
 * Переключение — не fade, а трансформация материи: круг света расходится
 * из точки клика и "перекрашивает" организм изнутри.
 */
export function initTheme() {
  const button = document.querySelector("[data-theme-switcher]");
  const text = document.querySelector(".theme-switcher__text");

  if (!button || !text) return;

  let theme = localStorage.getItem("code-soul-theme") || "dark";
  let overlay = null;
  let isAnimating = false;

  function getOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    return overlay;
  }

  function applyTheme(value) {
    const isLight = value === "light";

    document.documentElement.dataset.theme = isLight ? "light" : "dark";
    text.textContent = isLight ? "SOUL" : "CODE";
    button.setAttribute(
      "aria-label",
      isLight ? "Переключить на CODE" : "Переключить на SOUL"
    );

    localStorage.setItem("code-soul-theme", value);

    // Уведомляем canvas-based эффекты (SoulParticles, Organism, ParticleText),
    // у которых цвет частиц не читается из CSS-переменных — их
    // нужно перекрасить явно при смене темы.
    window.dispatchEvent(
      new CustomEvent("code-soul:theme", {
        detail: { theme: isLight ? "light" : "dark" },
      })
    );
  }

  function transformInto(value) {
    if (isAnimating) return;
    isAnimating = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      applyTheme(value);
      isAnimating = false;
      return;
    }

    const el = getOverlay();
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius =
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ) * 1.05;

    const nextVoid = value === "light" ? THEME_COLORS.light.void : THEME_COLORS.dark.void;

    gsap.set(el, {
      backgroundColor: nextVoid,
      opacity: 1,
      clipPath: `circle(0px at ${x}px ${y}px)`,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      },
    });

    tl.to(el, {
      duration: 0.85,
      ease: "power3.inOut",
      clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
      onStart: () => applyTheme(value),
    }).to(
      el,
      {
        duration: 0.45,
        opacity: 0,
        ease: "power1.out",
        onComplete: () => gsap.set(el, { clipPath: `circle(0px at ${x}px ${y}px)` }),
      },
      "-=0.05"
    );
  }

  button.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    transformInto(theme);
  });

  applyTheme(theme);
}
