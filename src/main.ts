import "./styles/main.css";
import { initSmoothScroll } from "./lib/smoothScroll";
import { initTelemetryClock } from "./lib/clock";
import { initThemeManager } from "./lib/themeManager";
import { initYearTicker } from "./lib/yearTicker";
import { initHorizontalTrack } from "./lib/horizontalTrack";
import { initHoverPortals } from "./lib/hoverPortal";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lenis Smooth Scroll Engine
  const lenis = initSmoothScroll(true);

  // 2. Initialize Real-Time Telemetry Clock
  initTelemetryClock("[data-telemetry-clock]", "UTC");

  // 3. Initialize Dynamic Theme Manager for Fixed Left Rail
  initThemeManager();

  // 4. Initialize Interactive Hover Preview Portals (Projects & Research Formulas)
  initHoverPortals();

  // 5. Initialize Year Ticker (2018 -> 2026) & Hero Reveal
  initYearTicker({
    startYear: 2018,
    endYear: 2026,
    onComplete: () => {
      // 6. After initial hero choreography finishes, initialize Master Horizontal Track
      initHorizontalTrack();
    },
  });

  // 7. Fullscreen Navigation Modal Wiring
  const menuDialog = document.querySelector<HTMLDialogElement>("#fullscreen-menu");
  const menuToggle = document.querySelector<HTMLButtonElement>("#menu-toggle");
  const menuClose = document.querySelector<HTMLButtonElement>("#menu-close");
  const navLinks = document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");

  if (menuDialog && menuToggle) {
    const openMenu = () => {
      menuDialog.showModal();
      lenis?.stop();
    };

    const closeMenu = () => {
      menuDialog.close();
      lenis?.start();
    };

    menuToggle.addEventListener("click", openMenu);
    menuClose?.addEventListener("click", closeMenu);

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          closeMenu();
          const target = document.querySelector(href);
          if (target) {
            // Smoothly translate with Lenis
            lenis?.scrollTo(target as HTMLElement, {
              offset: 0,
              duration: 1.5,
            });
          }
        }
      });
    });

    menuDialog.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    });
  }

  // 8. Copy PGP Fingerprint Feedback
  const copyPgpBtn = document.querySelector<HTMLButtonElement>("#copy-pgp-btn");
  if (copyPgpBtn) {
    copyPgpBtn.addEventListener("click", () => {
      const fingerprint = "B891 42E0 9C77 1B54 F26A 83DE 4A89 2F10 C91B 8E23";
      navigator.clipboard.writeText(fingerprint).then(() => {
        const originalText = copyPgpBtn.textContent;
        copyPgpBtn.textContent = "COPIED TO CLIPBOARD ✓";
        copyPgpBtn.style.backgroundColor = "#faf9f6";
        copyPgpBtn.style.color = "#1f1d1b";
        setTimeout(() => {
          copyPgpBtn.textContent = originalText;
          copyPgpBtn.style.backgroundColor = "";
          copyPgpBtn.style.color = "";
        }, 2200);
      });
    });
  }
});
