import "./styles/main.css";
import { initSmoothScroll } from "./lib/smoothScroll";
import { initTelemetryClock } from "./lib/clock";
import { initThemeManager } from "./lib/themeManager";
import { initHorizontalTrack, scrollToSection } from "./lib/horizontalTrack";
import { initNavigationMenu } from "./lib/navigationMenu";
import { initVerticalViews } from "./lib/verticalViews";
import { renderDynamicContent } from "./lib/dynamicContent";
import { initFolioLoader } from "./lib/loader";
import { initCustomCursor } from "./lib/customCursor";
import { initPanelAnimations } from "./lib/panelAnimations";

function initApp() {
  // 1. Initialize Lenis Smooth Virtual Scrolling
  initSmoothScroll(false);

  // 2. Initialize Telemetry Clock (London Local Time)
  initTelemetryClock("[data-telemetry-clock]", "Europe/London");

  // 3. Initialize Dynamic Rail Theme Synchronizer
  initThemeManager();

  // 4. Initialize Dynamic CMS Content Injection
  renderDynamicContent();

  // 5. Initialize Dedicated Vertical Views (Archive & Individual Blog Post Page)
  initVerticalViews();

  // 6. Initialize Master Horizontal Track
  initHorizontalTrack();

  // 7. Initialize Staggered Entrance Animations for Chapters
  initPanelAnimations();

  // 8. Initialize Fullscreen Navigation Menu
  initNavigationMenu();

  // 9. Minimal Loading Screen Sequence
  initFolioLoader();

  // 10. Fluid Monochromatic Custom Cursor
  initCustomCursor();

  // 11. Normalize Focus States: prevent button click boxes while keeping Tab accessibility
  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      document.body.classList.add("is-tabbing");
    }
  });
  window.addEventListener("mousedown", () => {
    document.body.classList.remove("is-tabbing");
  });
  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement)?.closest("button, a, [role='button']");
    if (btn instanceof HTMLElement && !document.body.classList.contains("is-tabbing")) {
      btn.blur();
    }
  });

  // Expose global controller for testing and automation
  (window as unknown as { __folio: unknown }).__folio = {
    scrollToSection,
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
