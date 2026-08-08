import gsap from "gsap";
import { ParticleText } from "./ParticleText.js";

export function initLoader() {
  const loader = document.querySelector("[data-loader]");

  if (!loader) return;

  let particleText = null;
  let forceRemoveTimer = null;

  // Мобильные встроенные браузеры (Telegram, соцсети) часто открывают
  // страницу фоновой вкладкой — requestAnimationFrame в этот момент не
  // тикает вообще, и анимация лоадера может "зависнуть" навсегда,
  // оставляя чёрный экран до тех пор, пока пользователь не взаимодействует
  // со страницей. Если вкладка изначально не видима — не тратим на неё
  // анимацию, просто открываем сцену сразу.
  function hardRemove() {
    if (forceRemoveTimer) clearTimeout(forceRemoveTimer);
    window.removeEventListener("visibilitychange", onVisible);
    if (!loader.isConnected) return;
    if (particleText) particleText.stop();
    window.dispatchEvent(new CustomEvent("code-soul:genesis"));
    loader.remove();
  }

  if (document.visibilityState === "hidden") {
    hardRemove();
    return;
  }

  const canvas = document.getElementById("loaderCanvas");

  const logo = loader.querySelector(".loader__logo");
  const lines = loader.querySelectorAll(".loader__line");

  if (!canvas) return;


  particleText = new ParticleText({
    canvas,
    text: "CODE & SOUL",
    fontSize: window.innerWidth < 768 ? 70 : 120,
    color: "#f5f5f0",
  });


  const tl = gsap.timeline();

  // Жёсткая страховка: даже если GSAP-таймлайн застрял (вкладка ушла
  // в фон посреди анимации), через 6.5с реального времени принудительно
  // открываем сцену. setTimeout продолжает срабатывать в фоне (пусть и с
  // задержкой), в отличие от requestAnimationFrame, который в фоне не
  // тикает вовсе — поэтому страховка именно на нём.
  forceRemoveTimer = setTimeout(() => {
    tl.kill();
    hardRemove();
  }, 6500);

  function onVisible() {
    if (document.visibilityState !== "visible") return;
    // Если вкладку открыли спустя долгое время после захода на сайт —
    // не проигрываем медленное интро с нуля, а сразу открываем сцену.
    if (performance.now() > 6500 && loader.isConnected) {
      tl.kill();
      hardRemove();
    }
  }
  window.addEventListener("visibilitychange", onVisible);


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

  particleText.stop();

})


.to(loader, {

  opacity:0,

  duration:1,

  ease:"power3.inOut",

  onStart(){
    // Организм Hero рождается ровно в тот момент, когда лоадер
    // открывает сцену — первый вдох синхронен с первым кадром.
    window.dispatchEvent(new CustomEvent("code-soul:genesis"));
  },

  onComplete(){

    clearTimeout(forceRemoveTimer);
    window.removeEventListener("visibilitychange", onVisible);

    loader.classList.add(
      "is-hidden"
    );

    loader.remove();

  }

});

}