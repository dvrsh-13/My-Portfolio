/**
 * Synchronizes the fixed Rail navigation colors with the active panel in view
 */
export function initThemeManager() {
  const header = document.querySelector<HTMLElement>("[data-intro-header]");
  const panels = document.querySelectorAll<HTMLElement>("[data-horizontal-panel]");

  if (!header || !panels.length) return () => {};

  // For mobile vertical stacked view
  const observer = new IntersectionObserver(
    (entries) => {
      // Only run IntersectionObserver when on mobile (on desktop, ScrollTrigger handles it)
      if (window.innerWidth >= 768) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          const target = entry.target as HTMLElement;
          const bg = target.dataset.headerBg || "#000000";
          const text = target.dataset.headerText || "#ffffff";
          const border = target.dataset.headerBorder || "#222222";

          header.style.setProperty("--header-bg", bg);
          header.style.setProperty("--header-text", text);
          header.style.setProperty("--header-border", border);
        }
      });
    },
    {
      threshold: [0.1, 0.4, 0.8],
    }
  );

  panels.forEach((p) => observer.observe(p));

  return () => observer.disconnect();
}
