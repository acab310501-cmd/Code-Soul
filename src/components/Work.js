import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { projects } from "../data/projects.js";

gsap.registerPlugin(ScrollTrigger);


export function initWork() {

  const container =
    document.querySelector("[data-projects]");

  if (!container) return;


  const language =
    localStorage.getItem(
      "code-soul-language"
    ) || "ru";


  renderProjects(
    container,
    language
  );


  window.addEventListener(
    "code-soul:language",
    (event) => {

      renderProjects(
        container,
        event.detail.language
      );

      animateProjects();

    }
  );


  animateProjects();

}


function renderProjects(
  container,
  language
) {

  container.innerHTML =
    projects
      .map(
        (project, index) => {

          const category =
            project.category[language];

          const description =
            project.description[language];


          return `
            <article
              class="
                work-project
                ${project.featured
                  ? "work-project--featured"
                  : ""}
              "
              data-project
              data-index="${index}"
              style="--project-accent:${project.accent}"
            >

              <a
                href="${project.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="work-project__link"
                data-cursor="OPEN"
              >

                <div class="work-project__visual">

                  <div class="work-project__image-wrap">

                    <img
                      src="${project.image}"
                      alt="${project.title}"
                      class="work-project__image"
                      loading="${index === 0 ? "eager" : "lazy"}"
                    />

                    <div
                      class="work-project__halftone"
                      aria-hidden="true"
                    ></div>

                  </div>


                  <div
                    class="work-project__number"
                  >
                    ${project.number}
                  </div>


                  <div
                    class="work-project__open"
                  >
                    ↗
                  </div>

                </div>


                <div class="work-project__info">

                  <div class="work-project__name">

                    <h3>
                      ${project.title}
                    </h3>

                    <span>
                      ${category}
                    </span>

                  </div>


                  <div class="work-project__details">

                    <p>
                      ${description}
                    </p>

                    <span>
                      ${project.technologies}
                    </span>

                  </div>

                </div>

              </a>

            </article>
          `;
        }
      )
      .join("");
}


function animateProjects() {

  const items =
    document.querySelectorAll(
      "[data-project]"
    );


  if (!items.length) return;


  gsap.set(items, {
    opacity: 0,
    y: 80,
  });


  items.forEach((item) => {

    gsap.to(item, {

      opacity: 1,

      y: 0,

      duration: 1.15,

      ease: "power4.out",

      scrollTrigger: {
        trigger: item,

        start: "top 88%",

        once: true,
      },

    });

  });


  initProjectHover();

}


function initProjectHover() {

  const projects =
    document.querySelectorAll(
      ".work-project"
    );


  projects.forEach((project) => {

    const image =
      project.querySelector(
        ".work-project__image"
      );

    const halftone =
      project.querySelector(
        ".work-project__halftone"
      );


    if (!image) return;


    project.addEventListener(
      "mousemove",
      (event) => {

        const rect =
          project.getBoundingClientRect();


        const x =
          (event.clientX - rect.left) /
          rect.width;


        const y =
          (event.clientY - rect.top) /
          rect.height;


        const moveX =
          (x - 0.5) * 18;


        const moveY =
          (y - 0.5) * 12;


        gsap.to(image, {

          x: moveX,

          y: moveY,

          scale: 1.035,

          duration: 0.6,

          ease: "power3.out",

        });


        gsap.to(halftone, {

          opacity: 0.35,

          duration: 0.4,

        });

      }
    );


    project.addEventListener(
      "mouseleave",
      () => {

        gsap.to(image, {

          x: 0,

          y: 0,

          scale: 1,

          duration: 0.8,

          ease: "power3.out",

        });


        gsap.to(halftone, {

          opacity: 0,

          duration: 0.5,

        });

      }
    );

  });

}