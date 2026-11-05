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

  // Optimized GSAP quickTo setters for 60-120fps tracking
  const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });

  const ringX = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power2.out" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power2.out" });

  const onPointerMove = (e: PointerEvent) => {
    // Ignore touch interactions on hybrid laptop/tablet devices
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
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    gsap.to(ring, {
      scale: isHovered ? 1.4 : 0.8,
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

  const onMouseLeaveDoc = () => {
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
          borderColor: "rgba(255, 255, 255, 0.95)",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 0.4,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    } else {
      if (isHovered) {
        isHovered = false;
        gsap.to(ring, {
          scale: 1.0,
          borderColor: "rgba(255, 255, 255, 0.5)",
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
  document.documentElement.addEventListener("mouseleave", onMouseLeaveDoc, { passive: true });
  document.addEventListener("mouseover", onMouseOver, { passive: true });
}
