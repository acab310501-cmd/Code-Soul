import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { projects } from "../data/projects.js";

gsap.registerPlugin(ScrollTrigger);

const baseUrl = import.meta.env.BASE_URL || "/";

const getAssetPath = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.replace(/^\/+/, "");
  return `${baseUrl}${clean}`;
};

let activeCase = null;
// Единый контекст для всех GSAP-анимаций и слушателей секции WORK
let workGsapContext = null;

export function initWork() {
  // 1. КРИТИЧНО: Перед перерисовкой уничтожаем старый контекст. 
  // Это убивает ВСЕ твины, ScrollTrigger и слушатели, висящие на старых DOM-элементах.
  if (workGsapContext) {
    workGsapContext.revert();
    workGsapContext = null;
  }

  const container = document.querySelector("[data-projects]");
  if (!container) return;

  const language = localStorage.getItem("code-soul-language") || "ru";
  renderProjects(container, language);

  // При смене языка — безопасно перезапускаем инициализацию (старый контекст уже убит выше)
  window.addEventListener("code-soul:language", (event) => {
    activeCase = null;
    initWork();
  });

  animateProjects();
}

function renderProjects(container, language) {
  container.innerHTML = projects
    .map((project, index) => {
      const category = project.category[language];
      const description = project.description[language];
      const hasCase = Boolean(project.case);

      return `
        <article
          class="
            work-project
            ${project.featured ? "work-project--featured" : ""}
            ${hasCase ? "work-project--has-case" : ""}
          "
          data-project
          data-project-id="${project.id}"
          data-index="${index}"
          style="--project-accent:${project.accent}"
        >
          <div class="work-project__visual" data-case-trigger ${hasCase ? `role="button" tabindex="0" aria-expanded="false"` : ""}>
            <div class="work-project__image-wrap">
              <img src="${getAssetPath(project.image)}" alt="${project.title}" class="work-project__image" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" />
              <div class="work-project__halftone" aria-hidden="true"></div>
            </div>
            <div class="work-project__number">${project.number}</div>
            ${hasCase ? `<div class="work-project__open" aria-hidden="true">↘</div>` : `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="work-project__open" data-cursor="OPEN" aria-label="Open ${project.title}">↗</a>`}
          </div>
          <div class="work-project__info">
            <div class="work-project__name">
              <h3>${project.title}</h3>
              <span>${category}</span>
            </div>
            <div class="work-project__details">
              <p>${description}</p>
              <span>${project.technologies}</span>
            </div>
          </div>
          ${hasCase ? renderCaseStudy(project, language) : ""}
        </article>
      `;
    })
    .join("");

  initCaseInteractions(container, language);
}

function renderCaseStudy(project, language) {
  const data = project.case[language];
  if (!data) return "";
  const gallery = project.gallery || [];

  return `
    <div class="work-case" data-case="${project.id}" aria-hidden="true">
      <div class="work-case__top">
        <span class="work-case__eyebrow">${data.eyebrow}</span>
        <button class="work-case__close" type="button" data-case-close aria-label="${data.close}">
          <span>${data.close}</span><strong>×</strong>
        </button>
      </div>
      <div class="work-case__hero">
        <div class="work-case__hero-label">${project.number} / ${project.title}</div>
        <h4 class="work-case__hero-title">${data.introTitle}</h4>
        <p class="work-case__intro">${data.intro}</p>
      </div>
      <div class="work-case__story">
        <div class="work-case__chapter">
          <div class="work-case__chapter-index">01</div>
          <div><span class="work-case__chapter-label">${data.challengeTitle}</span><p>${data.challenge}</p></div>
        </div>
        <div class="work-case__chapter">
          <div class="work-case__chapter-index">02</div>
          <div><span class="work-case__chapter-label">${data.solutionTitle}</span><p>${data.solution}</p></div>
        </div>
      </div>
      <div class="work-case__gallery">
        <div class="work-case__gallery-header"><span>${data.galleryLabel}</span><span>${String(gallery.length).padStart(2, "0")} / IMAGES</span></div>
        <div class="work-case__images">
          ${gallery.map((image, index) => `
            <figure class="work-case__image ${index === 0 ? "work-case__image--large" : ""}">
              <img src="${getAssetPath(image)}" alt="${project.title} — ${index + 1}" loading="${index < 2 ? "eager" : "lazy"}" decoding="async" />
              <figcaption>${String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          `).join("")}
        </div>
      </div>
      <div class="work-case__story work-case__story--second">
        <div class="work-case__chapter">
          <div class="work-case__chapter-index">03</div>
          <div><span class="work-case__chapter-label">${data.experienceTitle}</span><p>${data.experience}</p></div>
        </div>
        <div class="work-case__chapter">
          <div class="work-case__chapter-index">04</div>
          <div><span class="work-case__chapter-label">${data.buildTitle}</span><p>${data.build}</p></div>
        </div>
      </div>
      <div class="work-case__result">
        <span class="work-case__result-label">${data.resultTitle}</span>
        <p>${data.result}</p>
      </div>
      <div class="work-case__footer">
        <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="work-case__live" data-cursor="OPEN">
          <span>${data.live}</span><strong>↗</strong>
        </a>
      </div>
    </div>
  `;
}

function initCaseInteractions(container, language) {
  const triggers = container.querySelectorAll("[data-case-trigger]");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (event.target.closest(".work-project__open a")) return;
      const project = trigger.closest("[data-project]");
      if (!project) return;
      toggleCase(project, project.dataset.projectId);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const project = trigger.closest("[data-project]");
      if (!project) return;
      toggleCase(project, project.dataset.projectId);
    });
  });

  const closeButtons = container.querySelectorAll("[data-case-close]");
  closeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const project = button.closest("[data-project]");
      if (!project) return;
      closeCase(project);
    });
  });
}

function toggleCase(project, id) {
  if (activeCase === id) {
    closeCase(project);
    return;
  }
  if (activeCase) {
    const previous = document.querySelector(`[data-project-id="${activeCase}"]`);
    if (previous) closeCase(previous, false);
  }
  openCase(project);
  activeCase = id;
}

function openCase(project) {
  const trigger = project.querySelector("[data-case-trigger]");
  const caseElement = project.querySelector(".work-case");
  if (!trigger || !caseElement) return;

  trigger.setAttribute("aria-expanded", "true");
  caseElement.setAttribute("aria-hidden", "false");
  project.classList.add("is-case-open");

  // Используем отдельную анимацию, не привязанную к основному контексту (чтобы не убить при смене языка)
  gsap.killTweensOf(caseElement);
  gsap.set(caseElement, { display: "block", height: 0, opacity: 0, overflow: "hidden" });

  const targetHeight = caseElement.scrollHeight;
  gsap.to(caseElement, {
    height: targetHeight, opacity: 1, duration: 1.15, ease: "power4.inOut",
    onComplete() {
      caseElement.style.height = "auto";
      caseElement.style.overflow = "visible";
      ScrollTrigger.refresh();
    }
  });

  gsap.fromTo(
    caseElement.querySelectorAll(".work-case__hero > *, .work-case__chapter, .work-case__result, .work-case__live"),
    { opacity: 0, y: 35 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, delay: 0.15, ease: "power3.out" }
  );

  setTimeout(() => {
    project.querySelector(".work-case")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 180);
}

function closeCase(project, scrollBack = true) {
  const trigger = project.querySelector("[data-case-trigger]");
  const caseElement = project.querySelector(".work-case");
  if (!trigger || !caseElement) return;

  trigger.setAttribute("aria-expanded", "false");
  caseElement.setAttribute("aria-hidden", "true");

  gsap.to(caseElement, {
    height: 0, opacity: 0, duration: 0.8, ease: "power4.inOut",
    onComplete() {
      caseElement.style.display = "none";
      project.classList.remove("is-case-open");
      ScrollTrigger.refresh();
    }
  });

  if (scrollBack) {
    setTimeout(() => { project.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100);
  }
  activeCase = null;
}

function animateProjects() {
  const items = document.querySelectorAll("[data-project]");
  if (!items.length) return;

  // Все анимации и слушатели помещаем в единый контекст GSAP. 
  // Это позволит полностью убить их при .revert()
  workGsapContext = gsap.context(() => {
    gsap.set(items, { opacity: 0, y: 80 });
    items.forEach((item) => {
      gsap.to(item, {
        opacity: 1, y: 0, duration: 1.15, ease: "power4.out",
        scrollTrigger: { trigger: item, start: "top 88%", once: true }
      });
    });

    initProjectHover();
  }, document.querySelector("[data-projects]")); // явно связываем контекст с контейнером
}

function initProjectHover() {
  const projectElements = document.querySelectorAll(".work-project");

  projectElements.forEach((project) => {
    const image = project.querySelector(".work-project__image");
    const halftone = project.querySelector(".work-project__halftone");
    if (!image) return;

    project.addEventListener("mousemove", (event) => {
      if (window.matchMedia("(hover: none)").matches) return;
      const rect = project.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(project, { rotateX: -y * 5, rotateY: x * 5, duration: 0.5, ease: "power3.out", transformPerspective: 1200, overwrite: "auto" });
      gsap.to(image, { x: x * 18, y: y * 12, scale: 1.035, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      if (halftone) gsap.to(halftone, { opacity: 0.3, duration: 0.4, overwrite: "auto" });
    });

    project.addEventListener("mouseleave", () => {
      gsap.to(project, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "power3.out" });
      gsap.to(image, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power3.out" });
      if (halftone) gsap.to(halftone, { opacity: 0, duration: 0.5 });
    });
  });
}