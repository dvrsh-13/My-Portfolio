/**
 * Controls interactive hover portals for projects and academic/research tags
 */
export function initHoverPortals() {
  // 1. Projects Portal
  const projectItems = document.querySelectorAll<HTMLElement>("[data-project-item]");
  const projectImages = document.querySelectorAll<HTMLElement>("[data-project-image]");
  const projectPlaceholder = document.querySelector<HTMLElement>("[data-project-placeholder]");

  projectItems.forEach((item) => {
    const indexStr = item.dataset.projectIndex;
    if (indexStr === undefined) return;
    const index = parseInt(indexStr, 10);

    const onEnter = () => {
      projectImages.forEach((img, i) => {
        if (i === index) {
          img.style.opacity = "1";
          img.style.transform = "scale(1)";
        } else {
          img.style.opacity = "0";
          img.style.transform = "scale(1.05)";
        }
      });
      if (projectPlaceholder) projectPlaceholder.style.opacity = "0";
    };

    const onLeave = () => {
      projectImages.forEach((img) => {
        img.style.opacity = "0";
      });
      if (projectPlaceholder) projectPlaceholder.style.opacity = "1";
    };

    item.addEventListener("mouseenter", onEnter);
    item.addEventListener("mouseleave", onLeave);
  });

  // 2. Research Focus Tags Portal
  const researchTags = document.querySelectorAll<HTMLElement>("[data-research-tag]");
  const researchDiagrams = document.querySelectorAll<HTMLElement>("[data-research-diagram]");

  researchTags.forEach((tag) => {
    const indexStr = tag.dataset.researchIndex;
    if (indexStr === undefined) return;
    const index = parseInt(indexStr, 10);

    tag.addEventListener("mouseenter", () => {
      researchDiagrams.forEach((diag, i) => {
        diag.style.opacity = i === index ? "1" : "0";
      });
    });
  });
}
