import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;
let isScrollLocked = false;
let rafId: number | null = null;

export function initSmoothScroll(startLocked = false): Lenis {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
  }

  isScrollLocked = startLocked;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  lenisInstance = new Lenis({
    duration: prefersReducedMotion ? 0.05 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: !prefersReducedMotion,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    prevent: (node) => {
      const el = node instanceof Element ? node : (node as Node)?.parentElement;
      return Boolean(el?.closest?.("[data-lenis-prevent]"));
    },
  });

  // Keep GSAP ScrollTrigger in sync with Lenis virtual scroll
  lenisInstance.on("scroll", () => {
    ScrollTrigger.update();
  });

  if (isScrollLocked) {
    lenisInstance.stop();
  }

  function raf(time: number) {
    lenisInstance?.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);

  return lenisInstance;
}

export function lockScroll(locked: boolean) {
  isScrollLocked = locked;
  if (!lenisInstance) return;

  if (locked) {
    lenisInstance.stop();
    document.documentElement.classList.add("lenis-stopped");
  } else {
    lenisInstance.start();
    document.documentElement.classList.remove("lenis-stopped");
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
