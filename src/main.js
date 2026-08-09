import "./styles/loader.css";
import "./styles/home-teaser.css";
import "./styles/services.css";
import "./styles/soul.css";
import "./styles/about.css";
import "./styles/journal.css";
import "./styles/work.css";
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/header.css";
import "./styles/hero.css";
import './styles/contact.css';

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SoulParticles } from "./components/SoulParticles.js";
import { initSmoothScroll } from "./components/SmoothScroll.js";
import { initCursor } from "./components/Cursor.js";
import { initLanguage, translations } from "./components/Language.js";
import { initWork } from "./components/Work.js";
import { initRouter } from "./components/Router.js";
import { initPixelText } from "./components/PixelText.js";
import { initParticleSystem } from "./components/ParticleSystem.js";
import { initLoader } from "./components/Loader.js";
import { initOrganism } from "./components/Organism.js";
import { THEME_COLORS } from "./theme-colors.js";

gsap.registerPlugin(ScrollTrigger);

function safeInit(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Code & Soul] Ошибка инициализации "${name}":`, error);
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    safeInit("router", initRouter);
    safeInit("loader", initLoader);

    safeInit("smoothScroll", initSmoothScroll);
    safeInit("cursor", initCursor);
    safeInit("language", initLanguage);
    safeInit("pixelText", initPixelText);
    safeInit("particleSystem", initParticleSystem);
    safeInit("organism", initOrganism);
    safeInit("contactAnimation", initContactAnimation);
    safeInit("contactMagic", initContactMagic);
    safeInit("mobileMenu", initMobileMenu);

    safeInit("work", initWork);
    safeInit("servicesV2", initServicesV2);
    safeInit("soulParticles", initSoulParticles);
    safeInit("aboutAnimation", initAboutAnimation);
    safeInit("aboutDepth", initAboutDepth);
    safeInit("journalAnimation", initJournalAnimation);
    safeInit("journalCinematicFocus", initJournalCinematicFocus);

    safeInit("header", initHeader);
    safeInit("heroAnimation", initHeroAnimation);
  }
);

/* ========================================
   HEADER
======================================== */

function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  function update() { header.classList.toggle("is-scrolled", window.scrollY > 50); }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ========================================
   HERO (Обновлённая анимация появления)
======================================== */

function initHeroAnimation() {
  const meta = document.querySelector(".hero__meta--left");
  const manifesto = document.querySelector(".hero__manifesto");
  const scroll = document.querySelector(".hero__scroll");
  const sideWord = document.querySelector(".hero__side-word");
  const status = document.querySelector(".hero__status");
  const organism = document.querySelector(".hero__organism-wrap");
  const coordinates = document.querySelector(".hero__coordinates");

  const peripheral = [meta, manifesto, scroll, status, coordinates].filter(el => el !== null);

  if (peripheral.length > 0) {
    gsap.set(peripheral, { opacity: 0, y: 24 });
  }
  if (sideWord) gsap.set(sideWord, { opacity: 0, y: 24 });
  // hero__organism-wrap уже "дышит" через CSS-анимацию transform (heroOrganismDrift),
  // поэтому вход анимируем только по opacity — иначе GSAP и keyframes спорят за transform.
  if (organism) gsap.set(organism, { opacity: 0 });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let played = false;

  function play() {
    if (played) return;
    played = true;

    if (reducedMotion) {
      if (organism) gsap.set(organism, { opacity: 1 });
      if (peripheral.length) gsap.set(peripheral, { opacity: 1, y: 0 });
      if (sideWord) gsap.set(sideWord, { opacity: 0.5, y: 0 });
      return;
    }

    // Первые секунды принадлежат только организму — рождение читается
    // без конкуренции с интерфейсным шумом. Остальной Hero проступает
    // следом, как контекст вокруг уже ожившей формы.
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    if (organism) tl.to(organism, { opacity: 1, duration: 1.3, ease: "power3.out" });
    if (peripheral.length) {
      tl.to(peripheral, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 1.1);
    }
    if (sideWord) {
      tl.to(sideWord, { opacity: 0.5, y: 0, duration: 0.9 }, 1.1);
    }
  }

  // Играем немедленно, синхронно с выполнением скрипта — никогда не
  // ждём внешних событий/таймеров для показа контента. Фоновые вкладки
  // (например, встроенный браузер Telegram) придерживают JS-таймеры,
  // и любое ожидание здесь означало бы "невидимый Hero, пока не
  // затронуть страницу" — этот баг был именно из-за такого ожидания.
  play();

  // Если лоадер успевает закрыться синхронно — не мешаем, он просто
  // перекрывает уже готовую сцену и красиво открывает её сверху.

  const glow = document.querySelector(".hero__glow");
  if (glow && !reducedMotion) {
    gsap.to(glow, { scale: 1.16, opacity: 0.85, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }
}

console.log("%cCODE & SOUL", "font-size: 24px; font-weight: 700;");
console.log("%cTechnology with a soul.", "font-size: 12px;");

/* ========================================
   SOUL PARTICLE ENGINE
======================================== */

function initSoulParticles() {
  const canvases = document.querySelectorAll("[data-soul-particles]");
  if (!canvases.length) return;

  const baseUrl = import.meta.env.BASE_URL || '/';
  const getAsset = (path) => {
    const clean = path.replace(/^\/+/, '');
    return `${baseUrl}${clean}`;
  };

  const images = [
    getAsset('images/halftone/01-hand.webp'),
    getAsset('images/halftone/02-code.webp'),
    getAsset('images/halftone/03-eye.webp'),
    getAsset('images/halftone/04-heart.webp'),
    getAsset('images/halftone/05-digital-world.webp')
  ];

  let currentSystem = null;
  let currentSection = null;

  canvases.forEach((canvas) => {
    const system = new SoulParticles({
      canvas, images: images,
      density: window.innerWidth < 700 ? 6 : 5,
      maxParticles: window.innerWidth < 700 ? 7000 : 16000,
      mouseRadius: window.innerWidth < 700 ? 100 : 150,
      mouseForce: window.innerWidth < 700 ? 4 : 7,
      transitionSpeed: 0.05
    });

    canvas.__soulParticles = system;
    currentSystem = system;

    system.setTheme(document.documentElement.dataset.theme === "light" || document.documentElement.dataset.theme === "paper" ? "paper" : "dark");
    window.addEventListener("code-soul:theme", (event) => { system.setTheme(event.detail.theme); });

    const section = canvas.closest('.soul-section');
    if (!section) return;
    currentSection = section;

    const stageDuration = 4200;
    let cycleTimer = null;

    const startCycle = () => {
      if (cycleTimer) return;
      cycleTimer = setInterval(() => {
        const next = (system.currentIndex + 1) % images.length;
        system.transitionTo(next);
      }, stageDuration);
    };

    const stopCycle = () => {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
    };

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCycle();
          } else {
            stopCycle();
          }
        });
      },
      { threshold: 0.2 }
    );
    visibilityObserver.observe(section);

    window.addEventListener("code-soul:page", (event) => {
      if (event.detail.page !== 'home') {
        stopCycle();
      } else {
        if (section && section.getBoundingClientRect().top < window.innerHeight) {
          startCycle();
        }
      }
    });
  });
}

/* ========================================
   ABOUT
======================================== */

function initAboutAnimation() {
  const section = document.querySelector(".about-section");
  if (!section) return;
  const lines = section.querySelectorAll("[data-about-reveal]");
  gsap.set(lines, { opacity: 0, yPercent: 100 });
  const values = section.querySelectorAll(".about-value");
  gsap.set(values, { opacity: 0, y: 40 });
  const statement = section.querySelector(".about__statement");
  gsap.set(statement, { opacity: 0, y: 50 });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      gsap.to(lines, { opacity: 1, yPercent: 0, duration: 1.15, stagger: .12, delay: .1, ease: "power4.out" });
      gsap.to(values, { opacity: 1, y: 0, duration: .9, stagger: .1, delay: .45, ease: "power3.out" });
      gsap.to(statement, { opacity: 1, y: 0, duration: 1, delay: .75, ease: "power3.out" });
      observer.unobserve(section);
    });
  }, { threshold: .15 });
  observer.observe(section);
}

function initAboutDepth() {
  const section = document.querySelector(".about-section");
  if (!section) return;
  const targets = section.querySelectorAll(".about__title-line, .about__manifesto p, .about__lead");
  gsap.set(targets, { opacity: 0, y: 80, filter: "blur(12px)" });
  ScrollTrigger.create({
    trigger: section, start: "top 80%", once: true,
    onEnter: () => {
      gsap.to(targets, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, stagger: 0.12, ease: "power4.out", overwrite: "auto"
      });
    }
  });
}

/* ========================================
   JOURNAL
======================================== */

function initJournalCinematicFocus() {
  const articles = document.querySelectorAll("[data-journal-card]");
  if (!articles.length) return;
  articles.forEach((card) => {
    const content = card.querySelector(".journal-card__content h3");
    const visual = card.querySelector(".journal-card__visual");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, { scale: 1.02, y: -12, zIndex: 10, duration: 0.5, ease: "power3.out" });
      if (content) gsap.to(content, { x: 6, color: THEME_COLORS.acid, duration: 0.4, ease: "power2.out" });
      if (visual) gsap.to(visual, { scale: 1.05, boxShadow: "0 20px 60px rgba(215, 255, 63, 0.15)", duration: 0.6, ease: "power3.out" });
      articles.forEach((other) => {
        if (other !== card) {
          gsap.to(other, { filter: "brightness(0.45) grayscale(0.6)", scale: 0.97, opacity: 0.6, duration: 0.5, ease: "power2.out" });
        }
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, { scale: 1, y: 0, zIndex: 1, duration: 0.5, ease: "power3.out" });
      if (content) gsap.to(content, { x: 0, color: "", duration: 0.4, ease: "power2.out" });
      if (visual) gsap.to(visual, { scale: 1, boxShadow: "none", duration: 0.6, ease: "power3.out" });
      articles.forEach((other) => {
        if (other !== card) {
          gsap.to(other, { filter: "brightness(1) grayscale(0)", scale: 1, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 });
        }
      });
    });
  });
}

function initJournalAnimation() {
  const section = document.querySelector(".journal-section");
  if (!section) return;
  const revealElements = section.querySelectorAll("[data-journal-reveal]");
  const cards = section.querySelectorAll("[data-journal-card]");
  const footer = section.querySelector(".journal__footer");

  gsap.set(revealElements, { opacity: 0, y: 80 });
  gsap.set(cards, { opacity: 0, y: 60 });
  gsap.set(footer, { opacity: 0, y: 30 });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const timeline = gsap.timeline({ delay: 0.15 });
      timeline.to(revealElements, { opacity: 1, y: 0, duration: 1.1, stagger: .12, ease: "power4.out" })
        .to(cards, { opacity: 1, y: 0, duration: .9, stagger: .12, ease: "power3.out" }, "-=.5")
        .to(footer, { opacity: 1, y: 0, duration: .8, ease: "power3.out" }, "-=.4");
      observer.unobserve(section);
    });
  }, { threshold: .12 });
  observer.observe(section);

  cards.forEach((card) => {
    const visual = card.querySelector(".journal-card__visual");
    const symbol = card.querySelector(".journal-card__visual-code, .journal-card__visual-symbol");
    if (!visual) return;

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      gsap.to(visual, { rotateX: ((y / rect.height) - .5) * -5, rotateY: ((x / rect.width) - .5) * 5, duration: .5, ease: "power2.out", transformPerspective: 900 });
      if (symbol) {
        gsap.to(symbol, { x: ((x / rect.width) - .5) * 12, y: ((y / rect.height) - .5) * 12, duration: .5, ease: "power2.out" });
      }
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(visual, { rotateX: 0, rotateY: 0, duration: .8, ease: "power3.out" });
      if (symbol) gsap.to(symbol, { x: 0, y: 0, duration: .8, ease: "power3.out" });
    });
  });
}

/* ========================================
   SERVICES — Magnetic Blob (оптимизированный)
======================================== */

const blobStates = new Map();

function initServicesBlob() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const state = { x: 50, y: 50, targetX: 50, targetY: 50 };
    blobStates.set(card, state);

    card.addEventListener("mouseleave", () => {
      state.targetX = 50;
      state.targetY = 50;
    });

    let rafId = null;
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      state.targetX = ((event.clientX - rect.left) / rect.width) * 100;
      state.targetY = ((event.clientY - rect.top) / rect.height) * 100;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          state.x += (state.targetX - state.x) * 0.1;
          state.y += (state.targetY - state.y) * 0.1;
          card.style.setProperty('--blob-x', `${state.x}%`);
          card.style.setProperty('--blob-y', `${state.y}%`);
          rafId = null;
        });
      }
    });
  });
}

/* ========================================
   SERVICES 2.0 (исправленная версия)
======================================== */

let servicesContext = null;

function initServicesV2() {
  // Уничтожаем предыдущий контекст, если есть
  if (servicesContext) {
    servicesContext.revert();
    servicesContext = null;
  }

  const grid = document.querySelector('[data-services-grid]');
  if (!grid) return;

  // Чистим состояние блоба и обработчик смены языка от предыдущего рендера,
  // иначе при каждом переключении языка обработчики дублируются, а карточки
  // из предыдущего рендера продолжают занимать память.
  grid.querySelectorAll('.service-card').forEach((card) => blobStates.delete(card));
  if (window.__servicesLanguageHandler) {
    window.removeEventListener('code-soul:language', window.__servicesLanguageHandler);
    window.__servicesLanguageHandler = null;
  }

  const language = localStorage.getItem('code-soul-language') || 'ru';
  const data = translations[language]?.services;
  if (!data) return;

  const cardKeys = ['card1', 'card2', 'card3', 'card4'];
  let html = '';

  cardKeys.forEach((key) => {
    const card = data[key];
    if (!card) return;
    const itemsHtml = card.items.map(item => `<span>${item}</span>`).join('');

    html += `
      <article class="service-card" data-service-id="${key}">
        <div class="service-card__top" data-service-trigger>
          <span class="service-card__number">${card.number}</span>
          <h3 class="service-card__title">${card.title}</h3>
          <span class="service-card__label">${card.price}</span>
          <div class="service-card__indicator" aria-hidden="true">↘</div>
        </div>
        <div class="service-card__body" data-service-body>
          <div class="service-card__desc">${card.desc}</div>
          <div class="service-card__details">
            <span class="service-card__details-label" data-i18n="services.included">ЧТО ВХОДИТ</span>
            <div class="service-card__details-list">
              ${itemsHtml}
            </div>
          </div>
          <div class="service-card__meta">
            <span class="service-card__price">${card.price}</span>
            <span class="service-card__timeline">${card.timeline}</span>
            <a href="#contact" class="service-card__cta" data-cursor="OPEN">
              ${card.cta} <span style="font-size:1.2em;">↗</span>
            </a>
          </div>
        </div>
      </article>
    `;
  });

  grid.innerHTML = html;

  // Создаём контекст для управления анимациями и событиями
  servicesContext = gsap.context(() => {
    const cards = grid.querySelectorAll('.service-card');
    cards.forEach((card) => {
      const trigger = card.querySelector('[data-service-trigger]');
      const body = card.querySelector('[data-service-body]');
      const indicator = card.querySelector('.service-card__indicator');

      if (!trigger || !body) return;

      trigger.addEventListener('click', () => {
        const isOpen = body.classList.contains('service-card__body--open');

        cards.forEach((c) => {
          const b = c.querySelector('[data-service-body]');
          const ind = c.querySelector('.service-card__indicator');
          if (b && b !== body) {
            b.classList.remove('service-card__body--open');
            if (ind) ind.classList.remove('service-card__indicator--open');
          }
        });

        if (isOpen) {
          body.classList.remove('service-card__body--open');
          if (indicator) indicator.classList.remove('service-card__indicator--open');
        } else {
          body.classList.add('service-card__body--open');
          if (indicator) indicator.classList.add('service-card__indicator--open');
        }
      });

      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });

      const observer = new MutationObserver(() => {
        const isOpen = body.classList.contains('service-card__body--open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      observer.observe(body, { attributes: true, attributeFilter: ['class'] });

      const cta = card.querySelector('.service-card__cta');
      if (cta) {
        cta.addEventListener('click', (e) => {
          e.preventDefault();
          const contactSection = document.querySelector('#contact');
          if (contactSection) {
            if (window.__codeSoulLenis) {
              window.__codeSoulLenis.scrollTo(contactSection.offsetTop, { duration: 1.2 });
            } else {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      }
    });

    // Анимация появления карточек
    const items = grid.querySelectorAll('.service-card');
    gsap.set(items, { opacity: 0, y: 60 });

    items.forEach((item) => {
      gsap.to(item, {
        opacity: 1, y: 0, duration: 1.15, ease: 'power4.out',
        scrollTrigger: { trigger: item, start: 'top 88%', once: true }
      });
    });
  }, grid); // контекст привязан к grid

  // Карточки — новые DOM-элементы, поэтому magnetic-blob эффект нужно
  // переинициализировать заново, иначе после смены языка hover перестаёт работать.
  initServicesBlob();

  // Обработчик смены языка (предыдущий уже снят выше)
  const onLanguageChange = (event) => {
    const newLang = event.detail.language;
    const newData = translations[newLang]?.services;
    if (newData) initServicesV2();
  };
  window.addEventListener('code-soul:language', onLanguageChange);
  window.__servicesLanguageHandler = onLanguageChange;
}

/* ========================================
   CONTACT ANIMATION
======================================== */

function initContactAnimation() {
  const section = document.querySelector('#contact');
  if (!section) return;

  const elements = section.querySelectorAll('.reveal-contact');
  gsap.set(elements, { opacity: 0, y: 35 });

  ScrollTrigger.create({
    trigger: section, start: 'top 75%', once: true,
    onEnter: () => {
      gsap.to(elements, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out' });
    }
  });

  const orbOne = section.querySelector('.contact__orb--one');
  const orbTwo = section.querySelector('.contact__orb--two');
  if (orbOne) gsap.to(orbOne, { y: -80, x: -30, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  if (orbTwo) gsap.to(orbTwo, { y: 70, x: 35, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  const options = section.querySelectorAll('.contact__option');
  options.forEach((option) => {
    option.addEventListener('mouseenter', () => gsap.to(option, { y: -2, duration: 0.25, ease: 'power2.out' }));
    option.addEventListener('mouseleave', () => gsap.to(option, { y: 0, duration: 0.25, ease: 'power2.out' }));
  });

  const form = section.querySelector('#contactForm');
  const success = section.querySelector('#contactSuccess');
  if (!form || !success) return;

  // ПРОКСИ-URL для отправки (Cloudflare Worker)
  const TELEGRAM_PROXY_URL = 'https://code-soul-telegram.workers.dev'; // замените на ваш реальный URL

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (window.__clearTypewriter) {
      window.__clearTypewriter();
    }

    const button = form.querySelector('.contact__button');
    if (!button) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const telegramInput = document.getElementById('contactTelegram');
    const messageInput = document.getElementById('contactMessage');
    const projectCheckboxes = form.querySelectorAll('input[name="project"]:checked');
    const budgetRadio = form.querySelector('input[name="budget"]:checked');

    const name = nameInput?.value?.trim() || 'Не указано';
    const email = emailInput?.value?.trim() || 'Не указано';
    const telegram = telegramInput?.value?.trim() || 'Не указано';
    const message = messageInput?.value?.trim() || 'Не указано';
    const projects = Array.from(projectCheckboxes).map(cb => cb.value).join(', ') || 'Не выбрано';
    const budget = budgetRadio?.value || 'Не указан';

    const payload = { name, email, telegram, projects, budget, message };

    const originalText = button.innerHTML;
    button.innerHTML = '<span style="opacity:0.6;">Отправка...</span><span class="contact__button-arrow" aria-hidden="true">↗</span>';
    button.style.pointerEvents = 'none';

    try {
      const response = await fetch(TELEGRAM_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Proxy error: ${response.status}`);

      // Успешная отправка
      gsap.to(form.querySelectorAll('.contact__step, .contact__submit'), {
        opacity: 0, y: -20, duration: 0.45, stagger: 0.05, ease: 'power2.in',
        onComplete: () => {
          form.querySelectorAll('.contact__step, .contact__submit').forEach(el => el.style.display = 'none');
          success.classList.add('is-visible');
          success.setAttribute('aria-hidden', 'false');
          gsap.to(success, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        }
      });

    } catch (error) {
      console.error('[Code & Soul] Failed to send message:', error);
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #ff4444; color: white; padding: 16px 24px; border-radius: 12px;
        font-family: var(--font-mono); font-size: 14px; z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; max-width: 90%;
      `;
      errorMsg.textContent = '❌ Ошибка отправки. Попробуйте позже или напишите нам в Telegram @codeandsoul.';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.style.opacity = '0';
        errorMsg.style.transition = 'opacity 0.5s ease';
        setTimeout(() => errorMsg.remove(), 500);
      }, 5000);

      button.innerHTML = originalText;
      button.style.pointerEvents = 'auto';
    }
  });

  window.__contactTypewriterTimer = null;
}

/* ========================================
   CONTACT — TYPEWRITER & FLUID BORDERS
======================================== */

function initContactMagic() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const textarea = document.getElementById("contactMessage");
  const inputs = form.querySelectorAll('input[type="text"], input[type="email"]');

  if (textarea) {
    const placeholderText = textarea.getAttribute("placeholder");
    let typewriterInterval = null;
    let currentText = "";

    const startTypewriter = () => {
      if (typewriterInterval) return;
      if (textarea.value === "") {
        currentText = "";
        textarea.setAttribute("placeholder", "");
        let charIndex = 0;
        typewriterInterval = setInterval(() => {
          if (charIndex < placeholderText.length) {
            currentText += placeholderText[charIndex];
            textarea.setAttribute("placeholder", currentText);
            charIndex++;
          } else {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
            setTimeout(() => {
              if (textarea.value === "" && document.activeElement !== textarea) {
                textarea.setAttribute("placeholder", "");
              }
            }, 1500);
          }
        }, 50);
      }
    };

    textarea.addEventListener("focus", startTypewriter);
    textarea.addEventListener("input", () => {
      if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        textarea.setAttribute("placeholder", placeholderText);
      }
    });
    textarea.addEventListener("blur", () => {
      if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
      }
      if (textarea.value === "") {
        textarea.setAttribute("placeholder", placeholderText);
      }
    });

    window.__clearTypewriter = () => {
      if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
      }
    };
  }

  const allInputs = form.querySelectorAll("input, textarea");
  allInputs.forEach((input) => {
    gsap.set(input, { borderBottomColor: "rgba(255, 255, 255, 0.2)" });
    input.addEventListener("focus", () => {
      if (input.classList.contains("contact__option") || input.classList.contains("contact__budget-option")) return;
      gsap.to(input, { borderBottomColor: THEME_COLORS.acid, duration: 0.6, ease: "power3.out" });
      gsap.to(input, { boxShadow: "0 4px 20px rgba(215, 255, 63, 0.1)", duration: 0.4 });
    });
    input.addEventListener("blur", () => {
      if (input.classList.contains("contact__option") || input.classList.contains("contact__budget-option")) return;
      gsap.to(input, { borderBottomColor: "rgba(255, 255, 255, 0.2)", duration: 0.6, ease: "power3.out" });
      gsap.to(input, { boxShadow: "none", duration: 0.4 });
    });
  });
}

/* ========================================
   MOBILE MENU (NEW)
======================================== */

function initMobileMenu() {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const navLinks = mobileMenu?.querySelectorAll('a');

  if (!menuButton || !mobileMenu) return;

  let isOpen = false;
  let menuContext = null;

  // Явно фиксируем закрытое состояние в момент инициализации — не
  // полагаемся только на CSS-дефолты (хотя они теперь тоже верны).
  gsap.set(mobileMenu, { x: '100%' });
  if (overlay) gsap.set(overlay, { opacity: 0, pointerEvents: 'none' });

  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    if (menuContext) menuContext.revert();
    menuContext = gsap.context(() => {
      gsap.set(mobileMenu, { x: '100%' });
      gsap.set(overlay, { opacity: 0, pointerEvents: 'none' });
      gsap.to(overlay, { opacity: 1, pointerEvents: 'auto', duration: 0.3, ease: 'power2.out' });
      gsap.to(mobileMenu, { x: '0%', duration: 0.5, ease: 'power4.out' });
    });
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    if (menuContext) {
      menuContext.revert();
      menuContext = null;
    }
    // Сброс стилей
    gsap.set(mobileMenu, { x: '100%' });
    gsap.set(overlay, { opacity: 0, pointerEvents: 'none' });
  };

  menuButton.addEventListener('click', () => {
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Клик по оверлею или пунктам меню
  overlay?.addEventListener('click', closeMenu);

  navLinks?.forEach(link => {
    link.addEventListener('click', (e) => {
      // Если ссылка ведёт на якорь внутри той же страницы (не маршрут), не закрываем меню?
      // По умолчанию закрываем после любого клика.
      closeMenu();
      // Переход обрабатывается роутером
    });
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}