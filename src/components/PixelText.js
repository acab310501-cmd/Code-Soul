import gsap from "gsap";

export function initPixelText() {
  const elements =
    document.querySelectorAll(
      "[data-pixel-text]"
    );

  elements.forEach((element) => {

    element.addEventListener(
      "mouseenter",
      () => {

        gsap.to(element, {
          x: 3,
          duration: 0.08,
          repeat: 3,
          yoyo: true,
          ease: "none",
        });

      }
    );

  });
}