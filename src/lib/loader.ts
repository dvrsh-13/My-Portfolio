import gsap from "gsap";
import { lockScroll } from "./smoothScroll";

export function initFolioLoader(onComplete?: () => void) {
  const loader = document.querySelector<HTMLElement>("#folio-loader");
  const content = document.querySelector<HTMLElement>("#loader-content");
  const bar = document.querySelector<HTMLElement>("#loader-progress-bar");

  if (!loader) {
    onComplete?.();
    return;
  }

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Immediate bypass if testing with ?noload, deep-linking with ?panel= or ?project=, or reduced motion
  if (
    window.location.search.includes("noload") ||
    window.location.search.includes("panel=") ||
    window.location.search.includes("project=") ||
    window.location.search.includes("post=") ||
    window.location.search.includes("view=") ||
    prefersReducedMotion
  ) {
    loader.style.display = "none";
    loader.setAttribute("aria-hidden", "true");
    onComplete?.();
    return;
  }

  // Lock scrolling during intro sequence
  lockScroll(true);

  // Initial states for smooth entrance reveal
  gsap.set("[data-intro-header]", { opacity: 0, x: -24 });
  gsap.set(".hero-headline", { opacity: 0, y: 36, filter: "blur(8px)" });
  gsap.set(".hero-sub", { opacity: 0, y: 20 });
  gsap.set(".hero-meta-top", { opacity: 0, y: -12 });
  gsap.set(".hero-meta-bottom", { opacity: 0, y: 12 });

  // 1. Animate loader hairline progress bar across 1.4 seconds
  if (bar) {
    gsap.fromTo(
      bar,
      { width: "0%" },
      {
        width: "100%",
        duration: 1.4,
        ease: "power2.inOut",
      }
    );
  }

  // 2. Fluid, impactful, and minimalist reveal transition at 1.75 - 1.8 seconds
  const exitTimeline = gsap.timeline({
    delay: 1.7,
    onStart: () => {
      // Release scroll lock and prevent loader from blocking user clicks as soon as fade begins
      lockScroll(false);
      loader.style.pointerEvents = "none";
    },
    onComplete: () => {
      loader.style.display = "none";
      loader.setAttribute("aria-hidden", "true");
      onComplete?.();
    },
  });

  // Fade and elevate loader content
  if (content) {
    exitTimeline.to(
      content,
      {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
      },
      0
    );
  }

  // Fade out dark loader curtain
  exitTimeline.to(
    loader,
    {
      opacity: 0,
      duration: 0.7,
      ease: "power2.inOut",
    },
    0.2
  );

  // Orchestrated main page entrance
  exitTimeline.to(
    "[data-intro-header]",
    {
      opacity: 1,
      x: 0,
      duration: 1.1,
      ease: "power3.out",
    },
    0.35
  );

  exitTimeline.to(
    ".hero-headline",
    {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.4,
      ease: "power3.out",
    },
    0.3
  );

  exitTimeline.to(
    ".hero-sub",
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
    },
    0.45
  );

  exitTimeline.to(
    ".hero-meta-top, .hero-meta-bottom",
    {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.1,
    },
    0.4
  );
}
