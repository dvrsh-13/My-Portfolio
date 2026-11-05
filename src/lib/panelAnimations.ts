import gsap from "gsap";

export function initPanelAnimations() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) return;

  const panels = document.querySelectorAll<HTMLElement>("[data-horizontal-panel]");

  panels.forEach((panel) => {
    const section = panel.dataset.section;
    // Hero and transition ("THE SYSTEMS") are excluded
    if (section === "hero" || section === "transition") return;

    // Set initial hidden states for content inside each panel
    const headerBar = panel.querySelector<HTMLElement>(".border-b");
    const footerBar = panel.querySelector<HTMLElement>(".border-t:last-child");
    const mainContent = panel.querySelector<HTMLElement>(".my-auto");

    if (headerBar) gsap.set(headerBar, { opacity: 0, y: -12 });
    if (footerBar) gsap.set(footerBar, { opacity: 0, y: 12 });

    if (mainContent) {
      if (section === "about") {
        const headline = mainContent.querySelector("h2");
        const bio = mainContent.querySelector("[data-setting-bio]");
        const buttons = mainContent.querySelector(".border-t");
        const focusItems = mainContent.querySelectorAll(".md\\:border-l > div");

        if (headline) gsap.set(headline, { opacity: 0, y: 32, filter: "blur(6px)" });
        if (bio) gsap.set(bio, { opacity: 0, y: 20 });
        if (buttons) gsap.set(buttons, { opacity: 0, y: 16 });
        if (focusItems.length) gsap.set(focusItems, { opacity: 0, y: 20 });
      } else if (section === "education") {
        const eduContainer = mainContent.querySelector("[data-dynamic-education]");
        const comps = mainContent.querySelectorAll(".grid > div");

        if (eduContainer) gsap.set(eduContainer, { opacity: 0, y: 24, filter: "blur(4px)" });
        if (comps.length) gsap.set(comps, { opacity: 0, y: 18 });
      } else if (section === "projects") {
        const items = mainContent.querySelectorAll(".work-item");
        const viewAllBtn = mainContent.querySelector("button[data-open-view]");
        const hoverFrame = mainContent.querySelector("#project-hover-frame");

        if (items.length) gsap.set(items, { opacity: 0, x: -24, filter: "blur(4px)" });
        if (viewAllBtn) gsap.set(viewAllBtn, { opacity: 0, y: 14 });
        if (hoverFrame) gsap.set(hoverFrame, { scale: 0.96 });
      } else if (section === "blog") {
        const blogItems = mainContent.querySelectorAll("[data-dynamic-blogs] > *");
        const viewAllBtn = mainContent.querySelector("button[data-open-view]");

        if (blogItems.length) gsap.set(blogItems, { opacity: 0, y: 24, filter: "blur(4px)" });
        if (viewAllBtn) gsap.set(viewAllBtn, { opacity: 0, y: 14 });
      } else if (section === "experience") {
        const expItems = mainContent.querySelectorAll("[data-dynamic-experience] > *");
        const viewAllBtn = mainContent.querySelector("button[data-open-view]");

        if (expItems.length) gsap.set(expItems, { opacity: 0, y: 24, filter: "blur(4px)" });
        if (viewAllBtn) gsap.set(viewAllBtn, { opacity: 0, y: 14 });
      } else if (section === "contact") {
        const headline = mainContent.querySelector("h2");
        const contactLinks = mainContent.querySelectorAll("a, .font-mono");

        if (headline) gsap.set(headline, { opacity: 0, y: 36, filter: "blur(8px)" });
        if (contactLinks.length) gsap.set(contactLinks, { opacity: 0, y: 18 });
      } else {
        gsap.set(mainContent, { opacity: 0, y: 24 });
      }
    }
  });

  // Check initial visibility in case first panels are in view
  checkPanelEntrances();
}

export function checkPanelEntrances() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) return;

  const isDesktop = window.innerWidth >= 768;
  const panels = document.querySelectorAll<HTMLElement>("[data-horizontal-panel]");

  panels.forEach((panel) => {
    const section = panel.dataset.section;
    if (section === "hero" || section === "transition") return;
    if (panel.dataset.animated === "true") return;

    const rect = panel.getBoundingClientRect();
    const inView = isDesktop
      ? rect.left <= window.innerWidth * 0.75 && rect.right >= window.innerWidth * 0.25
      : rect.top <= window.innerHeight * 0.8 && rect.bottom >= window.innerHeight * 0.2;

    if (inView) {
      panel.dataset.animated = "true";
      playPanelEntrance(panel, section);
    }
  });
}

function playPanelEntrance(panel: HTMLElement, section?: string) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  const headerBar = panel.querySelector<HTMLElement>(".border-b");
  const footerBar = panel.querySelector<HTMLElement>(".border-t:last-child");
  const mainContent = panel.querySelector<HTMLElement>(".my-auto");

  // Subtle header & footer hairline reveal
  if (headerBar) {
    tl.to(headerBar, { opacity: 1, y: 0, duration: 0.9 }, 0);
  }
  if (footerBar) {
    tl.to(footerBar, { opacity: 1, y: 0, duration: 0.9 }, 0.15);
  }

  if (!mainContent) return;

  if (section === "about") {
    const headline = mainContent.querySelector("h2");
    const bio = mainContent.querySelector("[data-setting-bio]");
    const buttons = mainContent.querySelector(".border-t");
    const focusItems = mainContent.querySelectorAll(".md\\:border-l > div");

    if (headline) {
      tl.to(headline, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1 }, 0.1);
    }
    if (bio) {
      tl.to(bio, { opacity: 1, y: 0, duration: 1.0 }, 0.25);
    }
    if (buttons) {
      tl.to(buttons, { opacity: 1, y: 0, duration: 0.9 }, 0.35);
    }
    if (focusItems.length) {
      tl.to(focusItems, { opacity: 1, y: 0, duration: 0.95, stagger: 0.1 }, 0.2);
    }
  } else if (section === "education") {
    const eduContainer = mainContent.querySelector("[data-dynamic-education]");
    const comps = mainContent.querySelectorAll(".grid > div");

    if (eduContainer) {
      tl.to(eduContainer, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1 }, 0.1);
    }
    if (comps.length) {
      tl.to(comps, { opacity: 1, y: 0, duration: 0.95, stagger: 0.12 }, 0.3);
    }
  } else if (section === "projects") {
    const items = mainContent.querySelectorAll(".work-item");
    const viewAllBtn = mainContent.querySelector("button[data-open-view]");
    const hoverFrame = mainContent.querySelector("#project-hover-frame");

    if (items.length) {
      tl.to(items, { opacity: 1, x: 0, filter: "blur(0px)", duration: 1.0, stagger: 0.08 }, 0.1);
    }
    if (viewAllBtn) {
      tl.to(viewAllBtn, { opacity: 1, y: 0, duration: 0.9 }, 0.35);
    }
    if (hoverFrame) {
      tl.to(hoverFrame, { scale: 1, duration: 1.0 }, 0.2);
    }
  } else if (section === "blog") {
    const blogItems = mainContent.querySelectorAll("[data-dynamic-blogs] > *");
    const viewAllBtn = mainContent.querySelector("button[data-open-view]");

    if (blogItems.length) {
      tl.to(blogItems, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.0, stagger: 0.09 }, 0.1);
    }
    if (viewAllBtn) {
      tl.to(viewAllBtn, { opacity: 1, y: 0, duration: 0.9 }, 0.35);
    }
  } else if (section === "experience") {
    const expItems = mainContent.querySelectorAll("[data-dynamic-experience] > *");
    const viewAllBtn = mainContent.querySelector("button[data-open-view]");

    if (expItems.length) {
      tl.to(expItems, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.0, stagger: 0.09 }, 0.1);
    }
    if (viewAllBtn) {
      tl.to(viewAllBtn, { opacity: 1, y: 0, duration: 0.9 }, 0.35);
    }
  } else if (section === "contact") {
    const headline = mainContent.querySelector("h2");
    const contactLinks = mainContent.querySelectorAll("a, .font-mono");

    if (headline) {
      tl.to(headline, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 }, 0.1);
    }
    if (contactLinks.length) {
      tl.to(contactLinks, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.25);
    }
  } else {
    tl.to(mainContent, { opacity: 1, y: 0, duration: 1.0 }, 0.1);
  }
}
