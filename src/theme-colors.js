/**
 * Единая точка правды для цветов темы, которые нужны из JS (canvas-рендер,
 * GSAP-tweens). CSS-переменные из variables.css не читаются напрямую в canvas,
 * поэтому эти значения дублируют variables.css осознанно — но теперь в одном
 * месте, а не разбросаны магическими строками по main.js/ParticleText.js/Cursor.js.
 *
 * При смене палитры бренда меняются оба места: variables.css (для DOM/CSS)
 * и этот файл (для canvas/GSAP).
 */
export const THEME_COLORS = {
  acid: "#d7ff3f",
  dark: {
    text: "#f1f0eb",
    accent: "#d7ff3f",
    void: "#050505",
  },
};
