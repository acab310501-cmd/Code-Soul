import "./styles/loader.css";
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
import { ParticleText } from "./components/ParticleText.js";
import { initSmoothScroll } from "./components/SmoothScroll.js";
import { initCursor } from "./components/Cursor.js";
import { initTheme } from "./components/Theme.js";
import { initLanguage } from "./components/Language.js";
import { initWork } from "./components/Work.js"; 
import { initPixelText } from "./components/PixelText.js";
import { initParticleSystem } from "./components/ParticleSystem.js";

import { initLoader } from "./components/Loader.js";

gsap.registerPlugin(ScrollTrigger);

// =============================================
//  Performance optimisation (БЕЗОПАСНО):
//  Все проверки document.hidden теперь
//  находятся внутри самих классов компонентов.
// =============================================

/*
  ВАЖНО: раньше все init*-функции вызывались подряд одним
  блоком. Если хотя бы одна из них бросала исключение
  (например, из-за отсутствующего DOM-узла на конкретной
  странице/вьюпорте), выполнение обработчика обрывалось и
  все инициализации ПОСЛЕ неё — включая Work и Soul —
  просто не запускались, без единой ошибки в консоли,
  которую было бы легко связать с причиной. Оборачиваем
  каждый вызов отдельно, чтобы сбой одного модуля никогда
  не "гасил" остальные, и чтобы ошибка была явно видна
  в консоли с указанием, какой именно модуль упал.
*/

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
    // 1. Запускаем лоадер
    safeInit("loader", initLoader);

    // 2. Остальные компоненты
    safeInit("smoothScroll", initSmoothScroll);
    safeInit("cursor", initCursor);
    safeInit("language", initLanguage);
    safeInit("theme", initTheme);
    safeInit("pixelText", initPixelText);
    safeInit("particleSystem", initParticleSystem);
    safeInit("particleText", initParticleText);
    safeInit("contactAnimation", initContactAnimation);
    safeInit("contactMagic", initContactMagic);

    safeInit("work", initWork); // Запускает секцию проектов
    safeInit("soulParticles", initSoulParticles); // Запускает анимацию SOUL
    safeInit("aboutAnimation", initAboutAnimation);
    safeInit("aboutDepth", initAboutDepth);
    safeInit("aboutMagneticDots", initAboutMagneticDots);
    safeInit("servicesBlob", initServicesBlob);
    safeInit("journalAnimation", initJournalAnimation);
    safeInit("journalCinematicFocus", initJournalCinematicFocus);

    // 3. Header и Hero
    safeInit("header", initHeader);
    safeInit("heroAnimation", initHeroAnimation);
    safeInit("heroGridKinetics", initHeroGridKinetics);
    safeInit("heroTitlePulse", initHeroTitlePulse);
  }
);

/* ========================================
   HEADER
======================================== */

function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  function update() {
    header.classList.toggle("is-scrolled", window.scrollY > 50);
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ========================================
   HERO — 3D KINETIC GRID & PARALLAX
======================================== */

function initHeroGridKinetics() {
  const grid = document.querySelector('.hero__grid');
  const particleCanvas = document.querySelector('#particleCanvas');
  if (!grid && !particleCanvas) return;

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  gsap.ticker.add(() => {
    mouseX += (targetX - mouseX) * 0.08;
    mouseY += (targetY - mouseY) * 0.08;

    if (grid) {
      const rotateY = mouseX * 6;   
      const rotateX = -mouseY * 6;  
      grid.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    if (particleCanvas) {
      const translateX = mouseX * -30;
      const translateY = mouseY * -30;      
      particleCanvas.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
  });
}

function initHeroAnimation() {
  const pretitle = document.querySelector(".hero__pretitle");
  const meta = document.querySelector(".hero__meta--left");
  const manifesto = document.querySelector(".hero__manifesto");
  const scroll = document.querySelector(".hero__scroll");
  const sideWord = document.querySelector(".hero__side-word");

  gsap.set([ pretitle, meta, manifesto, scroll, sideWord ], { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

  tl.to(pretitle, { opacity: 1, duration: 0.8 })
    .to(meta, { opacity: 1, duration: 0.8 }, "-=0.3")
    .to(manifesto, { opacity: 1, duration: 0.8 }, "-=0.5")
    .to(scroll, { opacity: 1, duration: 0.8 }, "-=0.5")
    .to(sideWord, { opacity: 0.5, duration: 0.8 }, "-=0.7");

  gsap.to(".hero__glow", {
    scale: 1.12, opacity: 0.7, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut"
  });
}

console.log("%cCODE & SOUL", "font-size: 24px; font-weight: 700;");
console.log("%cTechnology with a soul.", "font-size: 12px;");

/* ========================================
   PARTICLE TEXT
======================================== */

function initParticleText() {
  const canvases = document.querySelectorAll("[data-particle-text]");
  const systems = [];

  canvases.forEach((canvas) => {
    const text = canvas.dataset.particleText;
    const system = new ParticleText({
      canvas, text,
      fontSize: window.innerWidth < 700 ? 70 : 150,
      color: canvas.classList.contains("particle-title__canvas--accent") ? "#d7ff3f" : "#f1f0eb",
      // Кислотный градиент + свечение снизу — только для
      // заголовка Hero, не для лоадера (у него свой инстанс).
      acidGradient: true,
    });
    systems.push(system);
  });

  window.__codeSoulParticles = systems;
}

/* ========================================
   HERO — "ДЫХАНИЕ ВСЕЛЕННОЙ" (МЕДЛЕННЫЙ ПУЛЬС)
   Едва заметный scale-пульс всего блока с заголовком:
   1.0 → 1.01 → 1.0 каждые ~7с. Настолько тонкий, что
   не читается как "анимация", но добавляет ощущение
   живого, дышащего объекта, а не статичной картинки.
======================================== */

function initHeroTitlePulse() {
  const title = document.querySelector(".particle-title");
  if (!title) return;

  gsap.set(title, { transformOrigin: "center center" });

  gsap.to(title, {
    scale: 1.01,
    duration: 3.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

/* ========================================
   SOUL PARTICLE ENGINE (TRANSITION SYSTEM)
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

  canvases.forEach((canvas) => {
    const system = new SoulParticles({
      canvas, images: images,
      density: window.innerWidth < 700 ? 6 : 5,
      maxParticles: window.innerWidth < 700 ? 7000 : 16000,
      mouseRadius: window.innerWidth < 700 ? 100 : 150,
      mouseForce: window.innerWidth < 700 ? 4 : 7,
      // Было 0.035. Увеличено по вашему запросу — частицы
      // догоняют новую цель заметно быстрее при скролле.
      // Технический нюанс: чем БОЛЬШЕ это число, тем БЫСТРЕЕ
      // (не медленнее) частицы долетают до цели, т.к. это
      // коэффициент lerp-сближения за кадр. Если на практике
      // 0.05 покажется резче, а не "тягучей" — попробуйте
      // 0.02–0.025, это даст более вязкое, медленное перетекание.
      transitionSpeed: 0.05
    });

    canvas.__soulParticles = system;
    const section = canvas.closest('.soul-section');
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top center", end: "bottom top", scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalStages = images.length;
        const targetIndex = Math.min(Math.floor(progress * totalStages), totalStages - 1);
        if (system.currentIndex !== targetIndex) {
          system.transitionTo(targetIndex);
        }
      }
    });
  });
}

/* ========================================
   ABOUT ANIMATION
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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        gsap.to(lines, { opacity: 1, yPercent: 0, duration: 1.15, stagger: .12, delay: .1, ease: "power4.out" });
        gsap.to(values, { opacity: 1, y: 0, duration: .9, stagger: .1, delay: .45, ease: "power3.out" });
        gsap.to(statement, { opacity: 1, y: 0, duration: 1, delay: .75, ease: "power3.out" });
        observer.unobserve(section);
      });
    }, { threshold: .15 }
  );
  observer.observe(section);
}

/* ========================================
   JOURNAL — CINEMATIC READING ROOM (FOCUS EFFECT)
======================================== */

function initJournalCinematicFocus() {
  const articles = document.querySelectorAll("[data-journal-card]");
  if (!articles.length) return;

  articles.forEach((card) => {
    const content = card.querySelector(".journal-card__content h3");
    const visual = card.querySelector(".journal-card__visual");

    card.addEventListener("mouseenter", () => {
      gsap.to(card, { scale: 1.02, y: -12, zIndex: 10, duration: 0.5, ease: "power3.out" });
      if (content) gsap.to(content, { x: 6, color: "#d7ff3f", duration: 0.4, ease: "power2.out" });
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

/* ========================================
   SERVICES MAGNETIC BLOB
======================================== */

function initServicesBlob() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mouseleave", () => {
      card.style.setProperty('--blob-x', '50%');
      card.style.setProperty('--blob-y', '50%');
    });

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--blob-x', `${x}%`);
      card.style.setProperty('--blob-y', `${y}%`);
    });
  });
}

/* ========================================
   ABOUT — MANIFESTO DEPTH & MAGNETIC DOTS
======================================== */

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

function initAboutMagneticDots() {
  const container = document.querySelector(".about__philosophy");
  if (!container) return;

  const dot1 = container.querySelector(".about__dot:first-child");
  const dot2 = container.querySelector(".about__dot:last-child");
  const amp = container.querySelector(".about__ampersand");
  if (!dot1 || !dot2) return;

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
  });

  gsap.ticker.add(() => {
    mouseX += (targetX - mouseX) * 0.12;
    mouseY += (targetY - mouseY) * 0.12;
    const dist = Math.min(1, Math.abs(mouseX) + Math.abs(mouseY));
    const force = dist * 30; 

    gsap.set(dot1, { x: mouseX * -force, y: mouseY * -force });
    gsap.set(dot2, { x: mouseX * -force, y: mouseY * -force });
    if (amp) {
       gsap.set(amp, { x: mouseX * 10, y: mouseY * 5, rotate: mouseX * 5 });
    }
  });
}

/* ========================================
   JOURNAL ANIMATION
======================================== */

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

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('.contact__button');
    if (!button) return;

    gsap.to(form.querySelectorAll('.contact__step, .contact__submit'), {
      opacity: 0, y: -20, duration: 0.45, stagger: 0.05, ease: 'power2.in',
      onComplete: () => {
        form.querySelectorAll('.contact__step, .contact__submit').forEach(el => el.style.display = 'none');
        success.classList.add('is-visible');
        success.setAttribute('aria-hidden', 'false');
        gsap.to(success, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      }
    });
  });
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
  }

  const allInputs = form.querySelectorAll("input, textarea");
  allInputs.forEach((input) => {
    gsap.set(input, { borderBottomColor: "rgba(255, 255, 255, 0.2)" });
    input.addEventListener("focus", () => {
      if (input.classList.contains("contact__option") || input.classList.contains("contact__budget-option")) return;
      gsap.to(input, { borderBottomColor: "#d7ff3f", duration: 0.6, ease: "power3.out" });
      gsap.to(input, { boxShadow: "0 4px 20px rgba(215, 255, 63, 0.1)", duration: 0.4 });
    });
    input.addEventListener("blur", () => {
      if (input.classList.contains("contact__option") || input.classList.contains("contact__budget-option")) return;
      gsap.to(input, { borderBottomColor: "rgba(255, 255, 255, 0.2)", duration: 0.6, ease: "power3.out" });
      gsap.to(input, { boxShadow: "none", duration: 0.4 });
    });
  });
}