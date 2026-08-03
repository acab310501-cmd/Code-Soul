import gsap from "gsap";
import { ParticleText } from "./ParticleText.js";

export function initLoader() {
  const loader = document.querySelector("[data-loader]");

  if (!loader) return;

  const canvas = document.getElementById("loaderCanvas");

  const logo = loader.querySelector(".loader__logo");
  const lines = loader.querySelectorAll(".loader__line");

  if (!canvas) return;


  const particleText = new ParticleText({
    canvas,
    text: "CODE & SOUL",
    fontSize: window.innerWidth < 768 ? 70 : 120,
    color: "#f5f5f0",
  });


  const tl = gsap.timeline();


  /*
    Initial state
  */

  gsap.set(
    [logo, lines],
    {
      opacity: 0,
      y: 20,
    }
  );


  /*
    Boot sequence
  */

  tl.to(lines[0], {
    opacity: 1,
    y: 0,
    duration: .6,
    ease: "power3.out",
  })

  .to(lines[1], {
    opacity: 1,
    y: 0,
    duration: .6,
    ease: "power3.out",
  },
  "-=.25")

  .to(lines[2], {
    opacity: 1,
    y: 0,
    duration: .6,
    ease: "power3.out",
  },
  "-=.25")

  .to(lines[3], {
    opacity: 1,
    y: 0,
    duration: .6,
    ease: "power3.out",
  },
  "-=.25")


  /*
    Show real logo
  */

  .to(logo, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
  },
  "-=.2")


  /*
    Hold
  */

  .to({}, {
    duration: .8
  })


  /*
    Exit
  */

.call(() => {

  particleText.scatter(30);

})


.to(loader, {

  opacity:0,

  duration:1,

  delay:0.5,

  ease:"power3.inOut",

  onComplete(){

    particleText.stop();

    loader.style.display = "none";

    document.body.classList.add(
      "loaded"
    );

  }

});

}