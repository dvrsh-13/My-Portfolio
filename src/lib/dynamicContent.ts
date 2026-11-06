import { cms } from "./cmsStore";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { escapeHtml } from "./utils";

export function renderDynamicContent(): () => void {
  renderProfileAndSettings();
  renderEducationList();
  renderCompetitionsList();
  renderProjectsList();
  renderExperienceList();
  renderBlogsList();

  // Subscribe to CMS changes and return unsubscribe function
  const unsubscribe = cms.subscribe(() => {
    renderProfileAndSettings();
    renderEducationList();
    renderCompetitionsList();
    renderProjectsList();
    renderExperienceList();
    renderBlogsList();
    ScrollTrigger.refresh();
  });

  return unsubscribe;
}

function renderProfileAndSettings() {
  const settings = cms.getSettings();

  // Update Page Title
  if (typeof document !== "undefined" && settings.name) {
    document.title = settings.name;
  }

  // Monogram Initials
  const initials = settings.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  document.querySelectorAll<HTMLElement>("[data-setting-monogram]").forEach((el) => {
    el.textContent = initials || "DV";
  });

  // Name
  document.querySelectorAll<HTMLElement>("[data-setting-name]").forEach((el) => {
    el.textContent = settings.name;
  });

  // Title / Subtitle
  document.querySelectorAll<HTMLElement>("[data-setting-title]").forEach((el) => {
    el.textContent = settings.title;
  });

  // Bio
  document.querySelectorAll<HTMLElement>("[data-setting-bio]").forEach((el) => {
    const paragraphs = settings.bio.split("\n\n").filter(Boolean);
    if (paragraphs.length > 0) {
      el.innerHTML = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    } else {
      el.textContent = settings.bio;
    }
  });

  // Location
  document.querySelectorAll<HTMLElement>("[data-setting-location]").forEach((el) => {
    el.textContent = settings.location;
  });

  // Email
  document.querySelectorAll<HTMLAnchorElement>("[data-setting-email]").forEach((el) => {
    el.href = `mailto:${encodeURIComponent(settings.email)}`;
    el.textContent = settings.email;
  });

  // GitHub
  document.querySelectorAll<HTMLAnchorElement>("[data-setting-github]").forEach((el) => {
    el.href = settings.github;
  });

  // LinkedIn
  document.querySelectorAll<HTMLAnchorElement>("[data-setting-linkedin]").forEach((el) => {
    el.href = settings.linkedin;
  });
}

function renderEducationList() {
  const container = document.querySelector<HTMLElement>("[data-dynamic-education]");
  if (!container) return;

  const eduList = cms.getEducation();
  const featured = eduList.filter((e) => e.featured);
  const displayList = featured.length > 0 ? featured : eduList;

  container.innerHTML = displayList
    .map(
      (item) => `
    <div class="border-b border-neutral-800 pb-4 last:border-b-0 space-y-1">
      <div class="flex justify-between items-baseline">
        <h3 class="font-serif text-xl md:text-2xl font-normal text-white">
          ${escapeHtml(item.institution)} · <span class="font-sans text-sm md:text-base text-neutral-300 font-light">${escapeHtml(item.program)}</span>
        </h3>
        <span class="font-mono text-xs text-neutral-500">${escapeHtml(item.period)}</span>
      </div>
      <div class="flex items-center gap-2 mt-1 text-xs md:text-sm text-neutral-300 font-light">
        <span class="text-white font-medium">${escapeHtml(item.grades)}</span>
      </div>
      ${
        item.details && item.details.length
          ? item.details
              .slice(0, 2)
              .map(
                (d) => `<p class="font-sans text-xs text-neutral-400 font-light leading-relaxed">${escapeHtml(d)}</p>`
              )
              .join("")
          : ""
      }
    </div>
  `
    )
    .join("");
}

function renderCompetitionsList() {
  const container = document.querySelector<HTMLElement>("[data-dynamic-competitions]");
  if (!container) return;

  const allExp = cms.getAllExperience();
  const featuredComps = allExp.filter((e) => e.category === "competition" && e.featured);
  const comps = featuredComps.length > 0 ? featuredComps : allExp.filter((e) => e.category === "competition");

  const fallbackComps = [
    {
      company: "MathWorks Math Modelling (M3) Challenge",
      period: "2026",
      highlight: "Top 20% Worldwide.",
      text: "Trained an XGBoost gradient boosting model on UK behavioural datasets and engineered Monte Carlo stochastic simulations to quantify demographic tail risk.",
    },
    {
      company: "Lockheed Martin Code Quest",
      period: "2025 & 2026",
      highlight: "Advanced Division: Top 3 (2026) & 2nd Place (2025).",
      text: "Led team in high-pressure algorithmic problem solving using Python under strict complexity constraints.",
    },
  ];

  if (comps.length > 0) {
    container.innerHTML = comps
      .slice(0, 2)
      .map(
        (c) => `
      <div class="space-y-1">
        <div class="flex justify-between text-xs text-neutral-400 font-sans">
          <span class="text-neutral-300 font-medium">${escapeHtml(c.company || c.role)}</span>
          <span class="font-mono text-neutral-500">${escapeHtml(c.period)}</span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light leading-relaxed">
          <span class="text-white font-medium">${escapeHtml(c.role)}.</span> ${escapeHtml(c.bulletPoints[0] || c.description)}
        </p>
      </div>
    `
      )
      .join("");
  } else {
    container.innerHTML = fallbackComps
      .map(
        (c) => `
      <div class="space-y-1">
        <div class="flex justify-between text-xs text-neutral-400 font-sans">
          <span class="text-neutral-300 font-medium">${escapeHtml(c.company)}</span>
          <span class="font-mono text-neutral-500">${escapeHtml(c.period)}</span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light leading-relaxed">
          <span class="text-white font-medium">${escapeHtml(c.highlight)}</span> ${escapeHtml(c.text)}
        </p>
      </div>
    `
      )
      .join("");
  }
}

function renderProjectsList() {
  const container = document.querySelector<HTMLElement>("[data-dynamic-projects]");
  const countBtn = document.querySelector<HTMLElement>("[data-projects-count]");
  if (!container) return;

  const featured = cms.getProjects(true);
  const total = cms.getAllProjects().length;

  if (countBtn) {
    countBtn.textContent = `(${total})`;
  }

  container.innerHTML = featured
    .map(
      (p, i) => `
    <div
      class="work-item border-b border-neutral-800 py-4 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white"
      data-project-item
      data-project-index="${i}"
      data-open-project="${escapeHtml(p.id)}"
      role="button"
      tabindex="0"
      aria-label="View project details: ${escapeHtml(p.title)}"
    >
      <div class="flex justify-between items-center">
        <div class="flex items-baseline gap-4">
          <span class="font-mono text-xs text-neutral-500">0${i + 1}</span>
          <h3 class="font-serif text-2xl md:text-[calc(2.8_*_var(--scale))] font-normal text-white">${escapeHtml(p.title)}</h3>
        </div>
        <span class="work-item-arrow text-base text-neutral-400 font-sans">↗</span>
      </div>
      <p class="font-sans text-xs text-neutral-400 mt-1 pl-8 font-light">
        ${escapeHtml(p.subtitle)} · ${p.tags.slice(0, 3).map((t) => escapeHtml(t)).join(" · ")}
      </p>
    </div>
  `
    )
    .join("");

  // Update preview portal cards
  const portalContainer = document.querySelector<HTMLElement>("[data-project-portals]");
  if (portalContainer) {
    portalContainer.innerHTML = featured
      .map(
        (p, i) => `
      <div data-project-image="${i}" class="absolute inset-6 opacity-0 transition-opacity duration-300 flex flex-col justify-between pointer-events-none">
        <div class="flex justify-between text-neutral-400 border-b border-neutral-800 pb-2 text-xs font-sans">
          <span class="text-white font-medium">0${i + 1} · ${escapeHtml(p.title)}</span>
          <span class="font-mono text-neutral-500">${escapeHtml(p.year)}</span>
        </div>
        <div class="my-auto space-y-3 font-sans text-xs text-neutral-300">
          <p class="leading-relaxed font-light">${escapeHtml(p.description)}</p>
          ${
            p.metrics && p.metrics.length
              ? `<div class="border-l border-neutral-700 pl-3 py-0.5 text-xs text-neutral-400 font-light">
                  ${escapeHtml(p.metrics[0])}
                </div>`
              : ""
          }
        </div>
        <div class="text-[11px] font-sans text-neutral-500 border-t border-neutral-800 pt-2">
          ${p.tags.map((t) => escapeHtml(t)).join(" · ")}
        </div>
      </div>
    `
      )
      .join("");
  }

  rebindProjectHoverPortals();
}

function renderExperienceList() {
  const container = document.querySelector<HTMLElement>("[data-dynamic-experience]");
  const countBtn = document.querySelector<HTMLElement>("[data-experience-count]");
  if (!container) return;

  const allWork = cms.getAllExperience().filter((e) => e.category === "work");
  const featured = allWork.filter((e) => e.featured).slice(0, cms.getSettings().featuredExperienceLimit);
  const total = allWork.length;

  if (countBtn) {
    countBtn.textContent = `(${total})`;
  }

  container.innerHTML = featured
    .map(
      (e) => `
    <div class="border-b border-neutral-200 pb-5 last:border-b-0 space-y-1.5">
      <div class="flex justify-between items-baseline">
        <h3 class="font-serif text-xl md:text-[calc(2.2_*_var(--scale))] font-normal text-neutral-900">
          ${escapeHtml(e.company)} · <span class="font-sans text-sm md:text-base text-neutral-600 font-light">${escapeHtml(e.role)}</span>
        </h3>
        <span class="font-mono text-xs text-neutral-500">${escapeHtml(e.period)}</span>
      </div>
      <p class="font-sans text-xs md:text-sm text-neutral-600 leading-relaxed font-light">
        ${escapeHtml(e.bulletPoints[0] || e.description)}
      </p>
      ${
        e.bulletPoints[1]
          ? `<p class="font-sans text-xs text-neutral-500 leading-relaxed font-light">
              • ${escapeHtml(e.bulletPoints[1])}
            </p>`
          : ""
      }
    </div>
  `
    )
    .join("");
}

function renderBlogsList() {
  const container = document.querySelector<HTMLElement>("[data-dynamic-blogs]");
  const countBtn = document.querySelector<HTMLElement>("[data-blogs-count]");
  if (!container) return;

  const featured = cms.getBlogs(true);
  const total = cms.getAllBlogs().length;

  if (countBtn) {
    countBtn.textContent = `(${total})`;
  }

  container.innerHTML = featured
    .map(
      (b) => `
    <article
      class="border-b border-neutral-200 pb-5 last:border-b-0 cursor-pointer group outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
      data-open-post="${escapeHtml(b.id)}"
      role="button"
      tabindex="0"
      aria-label="Read working paper: ${escapeHtml(b.title)}"
    >
      <div class="flex justify-between items-baseline font-sans text-xs text-neutral-500">
        <span class="font-sans text-neutral-600 font-medium">${b.tags.slice(0, 2).map((t) => escapeHtml(t)).join(" · ")}</span>
        <span class="font-mono text-[11px] text-neutral-400">${escapeHtml(b.date)}</span>
      </div>
      <h3 class="font-serif text-xl md:text-2xl mt-1.5 font-normal text-neutral-900 group-hover:text-neutral-500 transition-colors flex items-center justify-between">
        <span>${escapeHtml(b.title)}</span>
        <span class="text-xs font-sans text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">Read Note →</span>
      </h3>
      <p class="font-sans text-xs md:text-sm text-neutral-600 mt-1 leading-relaxed font-light">
        ${escapeHtml(b.excerpt)}
      </p>
    </article>
  `
    )
    .join("");
}

function rebindProjectHoverPortals() {
  const projectItems = document.querySelectorAll<HTMLElement>("[data-project-item]");
  const projectImages = document.querySelectorAll<HTMLElement>("[data-project-image]");
  const portalFrame = document.querySelector<HTMLElement>("#project-hover-frame");

  if (!portalFrame) return;

  const showPortal = (idx: number) => {
    portalFrame.classList.remove("opacity-0", "pointer-events-none");
    portalFrame.classList.add("opacity-100", "pointer-events-auto");

    projectImages.forEach((img) => {
      const isMatch = img.getAttribute("data-project-image") === String(idx);
      img.style.opacity = isMatch ? "1" : "0";
    });
  };

  const hidePortal = () => {
    projectImages.forEach((img) => (img.style.opacity = "0"));
    portalFrame.classList.add("opacity-0", "pointer-events-none");
    portalFrame.classList.remove("opacity-100", "pointer-events-auto");
  };

  projectItems.forEach((item) => {
    const idx = parseInt(item.dataset.projectIndex || "0", 10);
    item.addEventListener("mouseenter", () => showPortal(idx));
    item.addEventListener("mouseleave", hidePortal);
    item.addEventListener("focus", () => showPortal(idx));
    item.addEventListener("blur", hidePortal);
  });
}
