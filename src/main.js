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
//  Performance optimisation:
//  All animation loops now check document.hidden
//  to pause when tab is not visible.
// =============================================

// 1. Patch ParticleSystem.render()
const origParticleSystemRender = ParticleSystem.prototype.render;
ParticleSystem.prototype.render = function(time) {
  if (!document.hidden) {
    origParticleSystemRender.call(this, time);
  } else {
    // Keep the loop alive but skip drawing
    requestAnimationFrame(this.render.bind(this));
  }
};

// 2. Patch SoulParticles.animate()
const origSoulParticlesAnimate = SoulParticles.prototype.animate;
SoulParticles.prototype.animate = function() {
  if (!document.hidden && this.isLoaded) {
    this.update();
    this.draw();
  }
  this.animationFrame = requestAnimationFrame(() => this.animate());
};

// 3. Patch ParticleText.animate() – we'll override per instance later

document.addEventListener(
  "DOMContentLoaded",
  () => {
    // 1. Запускаем лоадер
    initLoader();

    // 2. Остальные компоненты
    initSmoothScroll();
    initCursor();
    initLanguage();
    initTheme();
    initPixelText();
    initParticleSystem();
    initParticleText();
    initContactAnimation();

    initWork();
    initSoulParticles();
    initAboutAnimation();
    initAboutDepth();         
    initAboutMagneticDots();
    initServicesBlob(); 
    initJournalAnimation();

    initHeader();
    initHeroAnimation();
    initHeader();
    initHeroAnimation();
    initHeroGridKinetics(); 
  }
);
/* ========================================
   HEADER
======================================== */

function initHeader() {
  const header =
    document.querySelector(
      "[data-header]"
    );

  if (!header) return;

  function update() {
    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 50
    );
  }

  window.addEventListener(
    "scroll",
    update,
    { passive: true }
  );

  update();
}

/* ========================================
   HERO INTRO (исправлено)
======================================== */

/* ========================================
   HERO — 3D KINETIC GRID & PARALLAX
======================================== */

function initHeroGridKinetics() {
  const grid = document.querySelector('.hero__grid');
  const particleCanvas = document.querySelector('#particleCanvas');
  
  if (!grid && !particleCanvas) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  // Следим за движением мыши
  window.addEventListener('mousemove', (e) => {
    // Нормализуем координаты от -1 до 1 (где 0 — центр экрана)
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Плавное обновление через GSAP ticker (работает при 60fps)
  gsap.ticker.add(() => {
    // Интерполяция для плавного "прилипания" к курсору
    mouseX += (targetX - mouseX) * 0.08;
    mouseY += (targetY - mouseY) * 0.08;

    if (grid) {
      // Сетка "убегает" от курсора (создаёт объём)
      const rotateY = mouseX * 6;   // Максимальный наклон по Y
      const rotateX = -mouseY * 6;  // Максимальный наклон по X
      
      grid.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    if (particleCanvas) {
      // Частицы двигаются синхронно, но чуть меньше (эффект параллакса слоев)
      const translateX = mouseX * -30;
      const translateY = mouseY * -30;
      
      particleCanvas.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
  });
}

function initHeroAnimation() {
  const pretitle =
    document.querySelector(
      ".hero__pretitle"
    );

  const meta =
    document.querySelector(
      ".hero__meta--left"
    );

  const manifesto =
    document.querySelector(
      ".hero__manifesto"
    );

  const scroll =
    document.querySelector(
      ".hero__scroll"
    );

  const sideWord =
    document.querySelector(
      ".hero__side-word"
    );

  gsap.set(
    [
      pretitle,
      meta,
      manifesto,
      scroll,
      sideWord,
    ],
    {
      opacity: 0,
    }
  );

  const tl =
    gsap.timeline({
      defaults: {
        ease: "power4.out",
      },
    });

  tl.to(
    pretitle,
    {
      opacity: 1,
      duration: 0.8,
    }
  )
  .to(
    meta,
    {
      opacity: 1,
      duration: 0.8,
    },
    "-=0.3"
  )
  .to(
    manifesto,
    {
      opacity: 1,
      duration: 0.8,
    },
    "-=0.5"
  )
  .to(
    scroll,
    {
      opacity: 1,
      duration: 0.8,
    },
    "-=0.5"
  )
  .to(
    sideWord,
    {
      opacity: 0.5,
      duration: 0.8,
    },
    "-=0.7"
  );

  // subtle breathing
  gsap.to(
    ".hero__glow",
    {
      scale: 1.12,
      opacity: 0.7,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    }
  );
}

/* ========================================
   DEV
======================================== */

console.log(
  "%cCODE & SOUL",
  "font-size: 24px; font-weight: 700;"
);

console.log(
  "%cTechnology with a soul.",
  "font-size: 12px;"
);

/* ========================================
   PARTICLE TEXT
======================================== */

function initParticleText() {
  const canvases =
    document.querySelectorAll(
      "[data-particle-text]"
    );

  const systems = [];

  canvases.forEach((canvas) => {
    const text =
      canvas.dataset.particleText;

    const system =
      new ParticleText({
        canvas,
        text,
        fontSize:
          window.innerWidth < 700
            ? 70
            : 150,
        color:
          canvas.classList.contains(
            "particle-title__canvas--accent"
          )
            ? "#d7ff3f"
            : "#f1f0eb",
      });

    systems.push(system);
  });

  window.__codeSoulParticles =
    systems;

  // ---- Patch each instance's animate method ----
  systems.forEach((system) => {
    const origAnimate = system.animate;
    system.animate = function() {
      if (!document.hidden && this.running) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = 1;
        this.particles.forEach((p) => {
          this.updateParticle(p);
          this.drawParticle(p);
        });
        this.ctx.globalAlpha = 1;
      }
      requestAnimationFrame(this.animate);
    };
  });
}

/* ========================================
   SOUL PARTICLE ENGINE (TRANSITION SYSTEM)
======================================== */

function initSoulParticles() {
  const canvases = document.querySelectorAll("[data-soul-particles]");
  if (!canvases.length) return;

  // Получаем пути к картинкам (динамически через Vite)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const getAsset = (path) => {
    const clean = path.replace(/^\/+/, '');
    return `${baseUrl}${clean}`;
  };

  // Массив этапов эволюции: HUMAN -> CODE -> VISION -> SOUL -> DIGITAL WORLD
  const images = [
    getAsset('images/halftone/01-hand.webp'),
    getAsset('images/halftone/02-code.webp'),
    getAsset('images/halftone/03-eye.webp'),
    getAsset('images/halftone/04-heart.webp'),
    getAsset('images/halftone/05-digital-world.webp')
  ];

  canvases.forEach((canvas) => {
    const system = new SoulParticles({
      canvas,
      images: images, // Передаём массив
      density: window.innerWidth < 700 ? 6 : 5,
      maxParticles: window.innerWidth < 700 ? 7000 : 16000,
      mouseRadius: window.innerWidth < 700 ? 100 : 150,
      mouseForce: window.innerWidth < 700 ? 4 : 7,
      transitionSpeed: 0.035 // Скорость перетекания (0.035 = плавно, 0.06 = быстрее)
    });

    canvas.__soulParticles = system;

    /* ========================================
       SCROLL TRIGGER ИНТЕГРАЦИЯ
       Переключение этапов при скролле секции
    ======================================== */

    const section = canvas.closest('.soul-section');
    if (!section) return;

    // Создаём триггер на всю секцию, который двигает индекс от 0 до 4
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom top",
      scrub: 0.5, // Плавный скролл-связыватель
      onUpdate: (self) => {
        // Получаем прогресс от 0 до 1
        const progress = self.progress;
        
        // Вычисляем, на каком мы этапе (0, 1, 2, 3, 4)
        // Мы хотим переключать этапы, когда прогресс пересекает 20%, 40%, 60%, 80%
        const totalStages = images.length; // 5
        const targetIndex = Math.min(
          Math.floor(progress * totalStages),
          totalStages - 1
        );

        // Если индекс изменился, запускаем переход
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
  const section =
    document.querySelector(
      ".about-section"
    );

  if (!section) return;

  const lines =
    section.querySelectorAll(
      "[data-about-reveal]"
    );

  gsap.set(lines, {
    opacity: 0,
    yPercent: 100,
  });

  const values =
    section.querySelectorAll(
      ".about-value"
    );

  gsap.set(values, {
    opacity: 0,
    y: 40,
  });

  const statement =
    section.querySelector(
      ".about__statement"
    );

  gsap.set(statement, {
    opacity: 0,
    y: 50,
  });

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting)
            return;

          gsap.to(lines, {
            opacity: 1,
            yPercent: 0,
            duration: 1.15,
            stagger: .12,
            ease: "power4.out",
          });

          gsap.to(values, {
            opacity: 1,
            y: 0,
            duration: .9,
            stagger: .1,
            delay: .3,
            ease: "power3.out",
          });

          gsap.to(statement, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: .55,
            ease: "power3.out",
          });

          observer.unobserve(
            section
          );
        });
      },
      {
        threshold: .15,
      }
    );

  observer.observe(section);
}

/* ========================================
   SERVICES MAGNETIC BLOB
======================================== */

function initServicesBlob() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    // Если мышь покинула карточку, сбрасываем позицию
    card.addEventListener("mouseleave", () => {
      card.style.setProperty('--blob-x', '50%');
      card.style.setProperty('--blob-y', '50%');
    });

    // Отслеживаем движение мыши внутри карточки
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      
      // Вычисляем процентное положение курсора внутри карточки (0% - 100%)
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      // Передаем значения в CSS переменные (без использования GSAP — это максимально легко для производительности)
      card.style.setProperty('--blob-x', `${x}%`);
      card.style.setProperty('--blob-y', `${y}%`);
    });
  });
}

/* ========================================
   ABOUT — MANIFESTO DEPTH & MAGNETIC DOTS
======================================== */

// Эффект "Всплытие из глубины" для текстов Манифеста
function initAboutDepth() {
  const section = document.querySelector(".about-section");
  if (!section) return;

  // Целевые элементы: заголовки и главный оффер (lead)
  const targets = section.querySelectorAll(
    ".about__title-line, .about__manifesto p, .about__lead"
  );

  // Скрываем и добавляем размытие изначально
  gsap.set(targets, {
    opacity: 0,
    y: 80,
    filter: "blur(12px)",
  });

  // Запускаем по скроллу
  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    once: true,
    onEnter: () => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.4,
        stagger: 0.12, // Строки выходят одна за другой с небольшой задержкой
        ease: "power4.out",
        // Настройка для разных строк: если это about__lead, делаем его чуть медленнее
        overwrite: "auto",
      });
    },
  });
}

// Эффект "Магнитные точки" для блока CODE & SOUL
function initAboutMagneticDots() {
  const container = document.querySelector(".about__philosophy");
  if (!container) return;

  const dot1 = container.querySelector(".about__dot:first-child");
  const dot2 = container.querySelector(".about__dot:last-child");
  const amp = container.querySelector(".about__ampersand");
  
  if (!dot1 || !dot2) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    // Нормализуем от -1 до 1 относительно центра контейнера
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
  });

  // Анимируем через GSAP Ticker
  gsap.ticker.add(() => {
    // Плавное сглаживание
    mouseX += (targetX - mouseX) * 0.12;
    mouseY += (targetY - mouseY) * 0.12;

    const dist = Math.min(1, Math.abs(mouseX) + Math.abs(mouseY));
    
    // Точки "разбегаются" от курсора (или притягиваются, тут эффект разбегания)
    // Направление движения: от центра в разные стороны
    const force = dist * 30; 

    // Левая точка
    gsap.set(dot1, {
      x: mouseX * -force,
      y: mouseY * -force,
    });

    // Правая точка
    gsap.set(dot2, {
      x: mouseX * -force,
      y: mouseY * -force,
    });

    // Амперсанд слегка "дрожит" и двигается в сторону мыши
    if (amp) {
       gsap.set(amp, {
         x: mouseX * 10,
         y: mouseY * 5,
         rotate: mouseX * 5,
       });
    }
  });
}

/* ========================================
   JOURNAL ANIMATION
======================================== */

function initJournalAnimation() {
  const section =
    document.querySelector(
      ".journal-section"
    );

  if (!section) return;

  const revealElements =
    section.querySelectorAll(
      "[data-journal-reveal]"
    );

  const cards =
    section.querySelectorAll(
      "[data-journal-card]"
    );

  const footer =
    section.querySelector(
      ".journal__footer"
    );

  gsap.set(
    revealElements,
    {
      opacity: 0,
      y: 80,
    }
  );

  gsap.set(
    cards,
    {
      opacity: 0,
      y: 60,
    }
  );

  gsap.set(
    footer,
    {
      opacity: 0,
      y: 30,
    }
  );

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) => {
            if (!entry.isIntersecting)
              return;

            const timeline =
              gsap.timeline();

            timeline.to(
              revealElements,
              {
                opacity: 1,
                y: 0,
                duration: 1.1,
                stagger: .12,
                ease: "power4.out",
              }
            );

            timeline.to(
              cards,
              {
                opacity: 1,
                y: 0,
                duration: .9,
                stagger: .12,
                ease: "power3.out",
              },
              "-=.55"
            );

            timeline.to(
              footer,
              {
                opacity: 1,
                y: 0,
                duration: .8,
                ease: "power3.out",
              },
              "-=.45"
            );

            observer.unobserve(
              section
            );
          }
        );
      },
      {
        threshold: .12,
      }
    );

  observer.observe(section);

  // Card mouse parallax
  cards.forEach(
    (card) => {
      const visual =
        card.querySelector(
          ".journal-card__visual"
        );

      const symbol =
        card.querySelector(
          ".journal-card__visual-code, .journal-card__visual-symbol"
        );

      if (!visual) return;

      card.addEventListener(
        "mousemove",
        (event) => {
          const rect =
            card.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left;

          const y =
            event.clientY -
            rect.top;

          const rotateX =
            ((y / rect.height) - .5) * -5;

          const rotateY =
            ((x / rect.width) - .5) * 5;

          gsap.to(
            visual,
            {
              rotateX,
              rotateY,
              duration: .5,
              ease: "power2.out",
              transformPerspective:
                900,
            }
          );

          if (symbol) {
            gsap.to(
              symbol,
              {
                x:
                  ((x / rect.width) - .5) * 12,
                y:
                  ((y / rect.height) - .5) * 12,
                duration: .5,
                ease: "power2.out",
              }
            );
          }
        }
      );

      card.addEventListener(
        "mouseleave",
        () => {
          gsap.to(
            visual,
            {
              rotateX: 0,
              rotateY: 0,
              duration: .8,
              ease: "power3.out",
            }
          );

          if (symbol) {
            gsap.to(
              symbol,
              {
                x: 0,
                y: 0,
                duration: .8,
                ease: "power3.out",
              }
            );
          }
        }
      );
    }
  );
}

function initContactAnimation() {
  const section = document.querySelector('#contact');

  if (!section) return;

  const elements = section.querySelectorAll('.reveal-contact');

  // Initial state
  gsap.set(elements, {
    opacity: 0,
    y: 35
  });

  // Scroll reveal
  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out'
      });
    }
  });

  // Floating orbs
  const orbOne = section.querySelector('.contact__orb--one');
  const orbTwo = section.querySelector('.contact__orb--two');

  if (orbOne) {
    gsap.to(orbOne, {
      y: -80,
      x: -30,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  if (orbTwo) {
    gsap.to(orbTwo, {
      y: 70,
      x: 35,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // Project option interaction
  const options = section.querySelectorAll('.contact__option');

  options.forEach((option) => {
    option.addEventListener('mouseenter', () => {
      gsap.to(option, {
        y: -2,
        duration: 0.25,
        ease: 'power2.out'
      });
    });

    option.addEventListener('mouseleave', () => {
      gsap.to(option, {
        y: 0,
        duration: 0.25,
        ease: 'power2.out'
      });
    });
  });

  // Form
  const form = section.querySelector('#contactForm');
  const success = section.querySelector('#contactSuccess');

  if (!form || !success) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const button = form.querySelector('.contact__button');

    if (!button) return;

    gsap.to(form.querySelectorAll('.contact__step, .contact__submit'), {
      opacity: 0,
      y: -20,
      duration: 0.45,
      stagger: 0.05,
      ease: 'power2.in',
      onComplete: () => {
        form.querySelectorAll('.contact__step, .contact__submit')
          .forEach((element) => {
            element.style.display = 'none';
          });

        success.classList.add('is-visible');
        success.setAttribute('aria-hidden', 'false');

        gsap.to(success, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    });
  });
}