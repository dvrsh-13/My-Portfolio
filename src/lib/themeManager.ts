/**
 * Synchronizes the fixed Rail navigation colors with the active panel in view
 */
export function initThemeManager() {
  const header = document.querySelector<HTMLElement>("[data-intro-header]");
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-horizontal-panel]"));

  if (!header || !panels.length) return () => {};

  let activeMobilePanel: HTMLElement | null = null;

  // For mobile vertical stacked view: check exact bounding client rect under header
  const updateMobileHeaderTheme = () => {
    if (window.innerWidth >= 768 || !header) return;
    const headerBottom = header.getBoundingClientRect().bottom;

    for (const panel of panels) {
      const rect = panel.getBoundingClientRect();
      if (rect.top <= headerBottom && rect.bottom > headerBottom) {
        if (panel === activeMobilePanel) break;
        activeMobilePanel = panel;

        const bg = panel.dataset.headerBg || "#000000";
        const text = panel.dataset.headerText || "#ffffff";
        const border = panel.dataset.headerBorder || "#222222";

        header.style.setProperty("--header-bg", bg);
        header.style.setProperty("--header-text", text);
        header.style.setProperty("--header-border", border);
        header.style.color = text;
        header.style.backgroundColor = bg;
        header.style.borderColor = border;
        break;
      }
    }
  };

  window.addEventListener("scroll", updateMobileHeaderTheme, { passive: true });
  window.addEventListener("resize", updateMobileHeaderTheme, { passive: true });
  updateMobileHeaderTheme();

  return () => {
    window.removeEventListener("scroll", updateMobileHeaderTheme);
    window.removeEventListener("resize", updateMobileHeaderTheme);
  };
}
