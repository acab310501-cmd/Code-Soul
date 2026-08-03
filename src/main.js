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
    initJournalAnimation();

    initHeader();
    initHeroAnimation();
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
}

/* ========================================
   SOUL PARTICLE ENGINE
======================================== */

function initSoulParticles() {
  const canvases =
    document.querySelectorAll(
      "[data-soul-particles]"
    );

  if (!canvases.length) return;

  canvases.forEach((canvas) => {
    const image =
      canvas.dataset.soulImage;

    if (!image) return;

    const system =
      new SoulParticles({
        canvas,
        image,
        density:
          window.innerWidth < 700
            ? 6
            : 5,
        maxParticles:
          window.innerWidth < 700
            ? 7000
            : 16000,
        mouseRadius:
          window.innerWidth < 700
            ? 100
            : 150,
        mouseForce:
          window.innerWidth < 700
            ? 4
            : 7,
      });

    canvas.__soulParticles =
      system;
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