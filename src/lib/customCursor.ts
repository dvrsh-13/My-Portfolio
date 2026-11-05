import gsap from "gsap";

export function initCustomCursor() {
  const container = document.querySelector<HTMLElement>("#folio-cursor");
  const dot = document.querySelector<HTMLElement>("#cursor-dot");
  const ring = document.querySelector<HTMLElement>("#cursor-ring");

  if (!container || !dot || !ring) return;

  // Only enable on devices with a mouse / precise pointer, and if motion is acceptable
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!hasFinePointer || prefersReducedMotion) {
    container.style.display = "none";
    return;
  }

  let isHovered = false;
  let isVisible = false;
  let isLightScreen = false;

  // Optimized GSAP quickTo setters for 60-120fps tracking
  const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });

  const ringX = gsap.quickTo(ring, "x", { duration: 0.26, ease: "power2.out" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.26, ease: "power2.out" });

  const checkIsLightScreen = (clientX: number, clientY: number): boolean => {
    // Check if any full-screen vertical modal view is open (archives and articles have dark backgrounds)
    const archiveView = document.querySelector<HTMLElement>("#vertical-archive-view");
    const articleView = document.querySelector<HTMLElement>("#vertical-article-view");
    const projectView = document.querySelector<HTMLElement>("#vertical-project-view");

    if (
      (archiveView && archiveView.style.visibility !== "hidden" && archiveView.classList.contains("opacity-100")) ||
      (articleView && articleView.style.visibility !== "hidden" && articleView.classList.contains("opacity-100")) ||
      (projectView && projectView.style.visibility !== "hidden" && projectView.classList.contains("opacity-100"))
    ) {
      return false;
    }

    // Check if hovering on an inverted dark element (e.g. pill button or black card) on a white screen
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (el) {
      if (el.closest(".bg-black, .bg-[#080808], .bg-[#0a0a0a], .bg-[#121214], .bg-[#161616], [data-header-bg='#000000']")) {
        const parentPanel = el.closest<HTMLElement>("[data-horizontal-panel]");
        if (parentPanel?.dataset.headerBg?.toLowerCase() === "#ffffff") {
          // If specific element has dark background, adapt to dark
          return false;
        }
      }
    }

    // Check horizontal panel underlying the pointer
    const panels = document.querySelectorAll<HTMLElement>("[data-horizontal-panel]");
    for (const p of panels) {
      const rect = p.getBoundingClientRect();
      if (rect.left <= clientX && rect.right > clientX) {
        const bg = (p.dataset.headerBg || "").toLowerCase();
        return bg === "#ffffff" || bg === "#fff";
      }
    }

    // Check left rail header if pointer is over rail
    if (clientX < 64) {
      const rail = document.querySelector<HTMLElement>("[data-intro-header]");
      if (rail) {
        const railBg = rail.style.getPropertyValue("--header-bg").toLowerCase();
        return railBg === "#ffffff" || railBg === "#fff";
      }
    }

    return false;
  };

  const updateCursorColors = (light: boolean) => {
    isLightScreen = light;
    if (light) {
      // Crisp black on white panels
      gsap.to(dot, {
        backgroundColor: "#000000",
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(ring, {
        borderColor: isHovered ? "#000000" : "rgba(0, 0, 0, 0.65)",
        backgroundColor: isHovered ? "rgba(0, 0, 0, 0.12)" : "transparent",
        duration: 0.2,
        ease: "power2.out",
      });
    } else {
      // Crisp white on dark panels
      gsap.to(dot, {
        backgroundColor: "#ffffff",
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(ring, {
        borderColor: isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
        backgroundColor: isHovered ? "rgba(255, 255, 255, 0.16)" : "transparent",
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    // Ignore touch interactions on hybrid touchscreen devices
    if (e.pointerType === "touch") return;

    if (!isVisible) {
      // Snap position immediately on first move to prevent fly-in from (0, 0)
      gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
      container.classList.remove("opacity-0");
      container.classList.add("opacity-100");
      isVisible = true;
    }

    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);

    // Dynamic contrast adaptation between light and dark panels
    const currentIsLight = checkIsLightScreen(e.clientX, e.clientY);
    if (currentIsLight !== isLightScreen) {
      updateCursorColors(currentIsLight);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    gsap.to(ring, {
      scale: isHovered ? 1.4 : 0.82,
      duration: 0.15,
      ease: "power2.out",
    });
  };

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    gsap.to(ring, {
      scale: isHovered ? 1.75 : 1.0,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const hideCursor = () => {
    container.classList.add("opacity-0");
    container.classList.remove("opacity-100");
    isVisible = false;
  };

  // Delegate interactive hover detection across all current and dynamically injected elements
  const isInteractiveTarget = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    return Boolean(
      el.closest(
        'a, button, input, textarea, select, [role="button"], [data-open-project], [data-open-post], [data-open-view], [data-nav-link], .work-item, .cursor-pointer'
      )
    );
  };

  const onMouseOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (isInteractiveTarget(target)) {
      if (!isHovered) {
        isHovered = true;
        gsap.to(ring, {
          scale: 1.75,
          borderColor: isLightScreen ? "#000000" : "#ffffff",
          backgroundColor: isLightScreen ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.16)",
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 0.45,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    } else {
      if (isHovered) {
        isHovered = false;
        gsap.to(ring, {
          scale: 1.0,
          borderColor: isLightScreen ? "rgba(0, 0, 0, 0.65)" : "rgba(255, 255, 255, 0.65)",
          backgroundColor: "transparent",
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 1.0,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });

  // Hide custom cursor immediately when pointer leaves document / window
  document.documentElement.addEventListener("mouseleave", hideCursor, { passive: true });
  window.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget && !(e as unknown as { toElement?: unknown }).toElement) {
      hideCursor();
    }
  }, { passive: true });

  document.addEventListener("mouseover", onMouseOver, { passive: true });
}
