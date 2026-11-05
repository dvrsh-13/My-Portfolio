import gsap from "gsap";

let syncCursorThemeExternal: (() => void) | null = null;

export function updateCursorThemeExternal() {
  syncCursorThemeExternal?.();
}

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

  // Progressive enhancement: only suppress native OS cursor after custom cursor successfully initializes
  document.body.classList.add("has-custom-cursor");

  // Cache static element lookups to avoid forced reflows on high-frequency pointer ticks
  const archiveView = document.querySelector<HTMLElement>("#vertical-archive-view");
  const articleView = document.querySelector<HTMLElement>("#vertical-article-view");
  const projectView = document.querySelector<HTMLElement>("#vertical-project-view");
  const menu = document.querySelector<HTMLElement>("#fullscreen-menu");
  const rail = document.querySelector<HTMLElement>("[data-intro-header]");
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-horizontal-panel]"));

  let isHovered = false;
  let isVisible = false;
  let isLightScreen = false;
  let lastClientX = -1;
  let lastClientY = -1;

  // Set initial state
  container.classList.add("theme-dark");

  // Optimized GSAP quickTo setters for 60-120fps tracking
  const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });

  const ringX = gsap.quickTo(ring, "x", { duration: 0.24, ease: "power2.out" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.24, ease: "power2.out" });

  const isModalActive = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    return el.style.display !== "none" && el.getAttribute("aria-hidden") !== "true";
  };

  const isMenuVisible = (): boolean => {
    if (!menu) return false;
    return !menu.classList.contains("opacity-0") && menu.style.display !== "none";
  };

  const checkIsLightScreen = (clientX: number, clientY: number): boolean => {
    if (clientX < 0 || clientY < 0) return false;

    // Any active fullscreen overlay (archives, articles, projects, menu) has a dark obsidian canvas
    if (
      isModalActive(archiveView) ||
      isModalActive(articleView) ||
      isModalActive(projectView) ||
      isMenuVisible()
    ) {
      return false;
    }

    // Check left rail header if pointer is over the 64px rail on desktop
    if (clientX < 64 && window.innerWidth >= 768 && rail) {
      const railBg = (rail.style.getPropertyValue("--header-bg") || "").toLowerCase().trim();
      return railBg === "#ffffff" || railBg === "#fff";
    }

    // Check horizontal panel underlying the pointer position
    for (let i = 0; i < panels.length; i++) {
      const p = panels[i];
      const rect = p.getBoundingClientRect();
      if (rect.left <= clientX && rect.right > clientX) {
        const bg = (p.dataset.headerBg || "").toLowerCase().trim();
        return bg === "#ffffff" || bg === "#fff";
      }
    }

    return false;
  };

  const syncThemeInstantly = () => {
    if (!isVisible || lastClientX < 0) return;
    const light = checkIsLightScreen(lastClientX, lastClientY);
    if (light !== isLightScreen) {
      isLightScreen = light;
      container.classList.toggle("theme-light", light);
      container.classList.toggle("theme-dark", !light);
    }
  };

  syncCursorThemeExternal = syncThemeInstantly;

  const onPointerMove = (e: PointerEvent) => {
    // Ignore touch interactions on hybrid touchscreen devices
    if (e.pointerType === "touch") return;

    lastClientX = e.clientX;
    lastClientY = e.clientY;

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

    syncThemeInstantly();
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
        container.classList.add("is-hovered");
        gsap.to(ring, {
          scale: 1.75,
          duration: 0.22,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 0.45,
          duration: 0.18,
          ease: "power2.out",
        });
      }
    } else {
      if (isHovered) {
        isHovered = false;
        container.classList.remove("is-hovered");
        gsap.to(ring, {
          scale: 1.0,
          duration: 0.22,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 1.0,
          duration: 0.18,
          ease: "power2.out",
        });
      }
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });

  // Update theme when scrolling even if pointer is stationary
  window.addEventListener("scroll", syncThemeInstantly, { passive: true });

  // Hide custom cursor immediately when pointer leaves document / window
  document.documentElement.addEventListener("mouseleave", hideCursor, { passive: true });
  window.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget && !(e as unknown as { toElement?: unknown }).toElement) {
      hideCursor();
    }
  }, { passive: true });

  document.addEventListener("mouseover", onMouseOver, { passive: true });
}
