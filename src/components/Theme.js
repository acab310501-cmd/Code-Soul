export function initTheme() {
  const button =
    document.querySelector(
      "[data-theme-switcher]"
    );

  const text =
    document.querySelector(
      ".theme-switcher__text"
    );

  if (!button || !text) return;


  let theme =
    localStorage.getItem(
      "code-soul-theme"
    ) || "dark";


  function applyTheme(value) {
    const isLight =
      value === "light";

    document.documentElement
      .dataset.theme =
      isLight ? "light" : "dark";

    text.textContent =
      isLight ? "PAPER" : "VOID";

    localStorage.setItem(
      "code-soul-theme",
      value
    );

    // Уведомляем canvas-based эффекты (SoulParticles, ParticleText),
    // у которых цвет частиц не читается из CSS-переменных — их
    // нужно перекрасить явно при смене темы.
    window.dispatchEvent(
      new CustomEvent("code-soul:theme", {
        detail: { theme: isLight ? "light" : "dark" },
      })
    );
  }


  button.addEventListener(
    "click",
    () => {
      theme =
        theme === "dark"
          ? "light"
          : "dark";

      applyTheme(theme);
    }
  );


  applyTheme(theme);
}