import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  ЛЁГКИЙ ХЭШ-РОУТЕР ДЛЯ МНОГОСТРАНИЧНОГО САЙТА
  ==============================================
  Сайт остаётся одним index.html (это статический GitHub Pages
  хостинг без серверных rewrite-правил — обычный History API
  роутинг сломал бы прямые ссылки и обновление страницы), но
  каждая секция теперь получает свой собственный маршрут вида
  "#/work", "#/services" и т.д. и показывается ОДНА за раз, без
  длинного скролла через весь сайт.

  Разметка: каждая "страница" — это один или несколько элементов
  с одинаковым data-page="home|work|services|about|journal|contact".
  Роутер просто скрывает все, кроме активной группы.
*/

const PAGES = ["home", "work", "services", "about", "journal", "contact"];
const DEFAULT_PAGE = "home";

function parsePage() {
  const raw = (location.hash || "").replace(/^#\/?/, "").trim();
  return PAGES.includes(raw) ? raw : DEFAULT_PAGE;
}

export function initRouter() {
  const allPageEls = () => document.querySelectorAll("[data-page]");
  const navLinks = () => document.querySelectorAll('a[href^="#/"]');

  function applyPage(page, { isFirstLoad = false } = {}) {
    allPageEls().forEach((el) => {
      el.classList.toggle("is-active-page", el.dataset.page === page);
    });

    navLinks().forEach((link) => {
      const linkPage = link.getAttribute("href").replace(/^#\/?/, "") || "home";
      link.classList.toggle("is-current", linkPage === page);
    });

    document.body.dataset.page = page;

    if (!isFirstLoad) {
      // Сброс скролла на новую "страницу" — и обычного, и
      // виртуального (Lenis), если он уже инициализирован.
      if (window.__codeSoulLenis) {
        window.__codeSoulLenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }

    // Скрытые (display:none) секции меняют высоту документа —
    // пересчитываем позиции ScrollTrigger, иначе реакции на
    // скролл (About/Journal/Contact reveal-анимации) будут
    // целиться в старые, уже неверные координаты.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    window.dispatchEvent(
      new CustomEvent("code-soul:page", { detail: { page } })
    );
  }

  let currentPage = parsePage();

  window.addEventListener("hashchange", () => {
    // Не каждый хэш — это маршрут: например, кнопка "Листайте
    // вниз" на Hero ведёт на #soul (обычный якорь внутри той же
    // страницы), а не на отдельную "страницу". Реагируем только
    // на настоящие маршруты вида "#/work", и только когда
    // страница реально меняется — иначе клик по обычному якорю
    // сбрасывал бы скролл обратно наверх сразу после перехода.
    if (!location.hash.startsWith("#/")) return;

    const nextPage = parsePage();
    if (nextPage === currentPage) return;

    currentPage = nextPage;
    applyPage(nextPage);
  });

  // Первое применение — максимально рано, ДО того как остальные
  // модули (ScrollTrigger, IntersectionObserver и т.д.) успеют
  // измерить макет полностью развёрнутой страницы.
  applyPage(parsePage(), { isFirstLoad: true });
}
