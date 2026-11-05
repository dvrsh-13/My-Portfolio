import gsap from "gsap";

export function initFolioLoader(onComplete?: () => void) {
  const loader = document.querySelector<HTMLElement>("#folio-loader");
  const bar = document.querySelector<HTMLElement>("#loader-progress-bar");

  if (!loader) {
    onComplete?.();
    return;
  }

  // Bypass immediately if deep linking or testing with ?noload or ?panel=
  if (window.location.search.includes("noload") || window.location.search.includes("panel=")) {
    loader.style.display = "none";
    loader.setAttribute("aria-hidden", "true");
    onComplete?.();
    return;
  }

  // Expand hairline progress bar
  if (bar) {
    bar.style.width = "100%";
  }

  // Fade out loader smoothly after brief minimal display
  setTimeout(() => {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        loader.style.display = "none";
        loader.setAttribute("aria-hidden", "true");
        onComplete?.();
      },
    });

    // Gentle hero entrance
    gsap.from("[data-section='hero'] h1", {
      y: 20,
      opacity: 0,
      duration: 1.0,
      ease: "power3.out",
      delay: 0.1,
    });
    gsap.from("[data-section='hero'] .hero-sub", {
      y: 14,
      opacity: 0,
      duration: 1.0,
      ease: "power3.out",
      delay: 0.25,
    });
  }, 600);
}
