/**
 * Synchronizes the fixed Rail navigation colors with the active panel in view
 */
export function initThemeManager() {
  const header = document.querySelector<HTMLElement>("[data-intro-header]");
  const panels = document.querySelectorAll<HTMLElement>("[data-horizontal-panel]");

  if (!header || !panels.length) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          const target = entry.target as HTMLElement;
          const bg = target.dataset.headerBg || "transparent";
          const text = target.dataset.headerText || "#f3eee8";
          const border = target.dataset.headerBorder || "#5a524d";

          header.style.setProperty("--header-bg", bg);
          header.style.setProperty("--header-text", text);
          header.style.setProperty("--header-border", border);
        }
      });
    },
    {
      threshold: [0.1, 0.45, 0.8],
    }
  );

  panels.forEach((p) => observer.observe(p));

  return () => observer.disconnect();
}
