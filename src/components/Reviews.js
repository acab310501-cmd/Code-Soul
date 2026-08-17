import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { openProjectCase } from "./Work.js";

gsap.registerPlugin(ScrollTrigger);

let reviewsGsapContext = null;

export function initReviews() {
  if (reviewsGsapContext) {
    reviewsGsapContext.revert();
    reviewsGsapContext = null;
  }

  const section = document.querySelector(".reviews-section");
  if (!section) return;

  const cards = section.querySelectorAll(".review-card");

  reviewsGsapContext = gsap.context(() => {
    gsap.set(cards, { opacity: 0, y: 60 });
    cards.forEach((card) => {
      gsap.to(card, {
        opacity: 1, y: 0, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: card, start: "top 90%", once: true }
      });
    });
  }, section);

  initReviewCaseLinks(section);
}

function initReviewCaseLinks(section) {
  const links = section.querySelectorAll("[data-review-case]");

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.dataset.reviewCase;
      if (!id) return;

      const goToWork = () => {
        window.removeEventListener("code-soul:page", onPageChange);
        // Небольшая задержка — даём роутеру показать секцию Work и
        // пересчитать layout (ScrollTrigger.refresh внутри Router),
        // прежде чем раскрывать кейс и скроллить к нему.
        setTimeout(() => openProjectCase(id), 120);
      };

      function onPageChange(evt) {
        if (evt.detail?.page === "work") goToWork();
      }

      if (location.hash === "#/work") {
        // Уже на странице Work — открываем кейс сразу, hashchange не сработает.
        openProjectCase(id);
      } else {
        window.addEventListener("code-soul:page", onPageChange);
        location.hash = "#/work";
      }
    });
  });
}
