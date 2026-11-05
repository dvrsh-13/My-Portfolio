import { lockScroll } from "./smoothScroll";
import { scrollToSection } from "./horizontalTrack";

export function initNavigationMenu() {
  const menuContainer = document.querySelector<HTMLElement>("#fullscreen-menu");
  const menuToggle = document.querySelector<HTMLButtonElement>("#menu-toggle");
  const menuCloseBtn = document.querySelector<HTMLButtonElement>("#menu-close");
  const navLinks = document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");
  const iconBarTop = document.querySelector<SVGElement>("[data-icon-bar='top']");
  const iconBarMid = document.querySelector<SVGElement>("[data-icon-bar='mid']");
  const iconBarBot = document.querySelector<SVGElement>("[data-icon-bar='bot']");

  if (!menuContainer || !menuToggle) return;

  let isOpen = false;

  const setIconState = (open: boolean) => {
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (iconBarTop && iconBarMid && iconBarBot) {
      if (open) {
        iconBarTop.style.transform = "translateY(5px) rotate(45deg)";
        iconBarMid.style.opacity = "0";
        iconBarBot.style.transform = "translateY(-5px) rotate(-45deg)";
      } else {
        iconBarTop.style.transform = "";
        iconBarMid.style.opacity = "1";
        iconBarBot.style.transform = "";
      }
    }
  };

  const openMenu = () => {
    isOpen = true;
    menuContainer.classList.remove("pointer-events-none", "opacity-0");
    menuContainer.classList.add("pointer-events-auto", "opacity-100");
    menuContainer.setAttribute("aria-hidden", "false");
    lockScroll(true);
    setIconState(true);
  };

  const closeMenu = () => {
    isOpen = false;
    menuContainer.classList.remove("pointer-events-auto", "opacity-100");
    menuContainer.classList.add("pointer-events-none", "opacity-0");
    menuContainer.setAttribute("aria-hidden", "true");
    lockScroll(false);
    setIconState(false);
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  menuCloseBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenu();
  });

  // ESC key dismisses menu
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeMenu();
    }
  });

  // Clicking backdrop outside content closes menu
  menuContainer.addEventListener("click", (e) => {
    if (e.target === menuContainer) {
      closeMenu();
    }
  });

  // Chapter navigation links inside menu
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#")) {
        e.preventDefault();
        closeMenu();
        const targetId = href.slice(1);
        setTimeout(() => {
          scrollToSection(targetId, { duration: 1.2 });
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            if (!targetEl.hasAttribute("tabindex")) {
              targetEl.setAttribute("tabindex", "-1");
            }
            targetEl.focus({ preventScroll: true });
          }
        }, 80);
      }
    });
  });

  // Global anchor interceptor for all internal anchor jumps
  document.addEventListener("click", (e) => {
    const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
    if (!anchor || anchor.hasAttribute("data-nav-link")) return;

    const href = anchor.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.slice(1);
      scrollToSection(targetId, { duration: 1.2 });
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        if (!targetEl.hasAttribute("tabindex")) {
          targetEl.setAttribute("tabindex", "-1");
        }
        targetEl.focus({ preventScroll: true });
      }
    }
  });

  // URL query or hash navigation
  const urlParams = new URLSearchParams(window.location.search);
  const targetSection = urlParams.get("section");
  if (targetSection) {
    window.scrollTo(0, 0);
    setTimeout(() => {
      scrollToSection(targetSection, { immediate: true });
    }, 150);
  } else if (window.location.hash) {
    const initialHash = window.location.hash.slice(1);
    window.scrollTo(0, 0);
    setTimeout(() => {
      scrollToSection(initialHash, { immediate: true });
    }, 150);
  }

  // Auto-open via query param for testing / preview
  if (urlParams.get("menu") === "open") {
    setTimeout(openMenu, 100);
  }
}
