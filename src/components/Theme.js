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