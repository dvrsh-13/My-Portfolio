import Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let isScrollLocked = false;

export function initSmoothScroll(startLocked = false): Lenis {
  if (lenisInstance) {
    lenisInstance.destroy();
  }

  isScrollLocked = startLocked;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });

  if (isScrollLocked) {
    lenisInstance.stop();
  }

  function raf(time: number) {
    lenisInstance?.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

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
