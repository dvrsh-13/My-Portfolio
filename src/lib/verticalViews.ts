import gsap from "gsap";
import { cms } from "./cmsStore";
import { lockScroll } from "./smoothScroll";
import { escapeHtml } from "./utils";

let isArchiveOpen = false;
let isArchiveClosing = false;
let isArticleOpen = false;
let isArticleClosing = false;
let isProjectOpen = false;
let isProjectClosing = false;

let currentArchiveCategory: "experience" | "projects" | "blogs" | null = null;
let currentBlogPostId: string | null = null;
let currentProjectId: string | null = null;

let lastFocusedElement: HTMLElement | null = null;

function clearModalQueryParams() {
  if (window.location.search) {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    url.searchParams.delete("post");
    url.searchParams.delete("project");
    window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
  }
}

export function initVerticalViews() {
  const archiveView = document.querySelector<HTMLElement>("#vertical-archive-view");
  const articleView = document.querySelector<HTMLElement>("#vertical-article-view");
  const projectView = document.querySelector<HTMLElement>("#vertical-project-view");

  if (!archiveView || !articleView) return;

  // Set initial off-screen positions
  gsap.set(archiveView, { yPercent: 100, display: "none" });
  archiveView.setAttribute("aria-hidden", "true");

  gsap.set(articleView, { yPercent: -100, display: "none" });
  articleView.setAttribute("aria-hidden", "true");

  if (projectView) {
    gsap.set(projectView, { yPercent: -100, display: "none" });
    projectView.setAttribute("aria-hidden", "true");
  }

  // Isolate wheel & touch scrolling so overlay scrolls smoothly without Lenis window interference
  const isolateModalScroll = (el: HTMLElement) => {
    el.addEventListener(
      "wheel",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );
    el.addEventListener(
      "touchmove",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );
  };
  isolateModalScroll(archiveView);
  isolateModalScroll(articleView);
  if (projectView) {
    isolateModalScroll(projectView);
  }

  // Close triggers
  document.querySelectorAll("[data-close-archive]").forEach((btn) => {
    btn.addEventListener("click", closeArchiveView);
  });

  document.querySelectorAll("[data-close-article]").forEach((btn) => {
    btn.addEventListener("click", closeArticleView);
  });

  document.querySelectorAll("[data-close-project]").forEach((btn) => {
    btn.addEventListener("click", closeProjectDetail);
  });

  // Global ESC key listener with robust ordering & debounce guard
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isProjectOpen && !isProjectClosing) {
        closeProjectDetail();
      } else if (isArticleOpen && !isArticleClosing) {
        closeArticleView();
      } else if (isArchiveOpen && !isArchiveClosing) {
        closeArchiveView();
      }
    }
  });

  // Global delegate for open triggers (Click)
  document.addEventListener("click", (e) => {
    const archiveTrigger = (e.target as HTMLElement).closest<HTMLElement>("[data-open-view]");
    if (archiveTrigger) {
      const category = archiveTrigger.dataset.openView as "experience" | "projects" | "blogs";
      if (category) {
        openArchiveView(category);
      }
      return;
    }

    const articleTrigger = (e.target as HTMLElement).closest<HTMLElement>("[data-open-post]");
    if (articleTrigger) {
      const postId = articleTrigger.dataset.openPost;
      if (postId) {
        openBlogPost(postId);
      }
      return;
    }

    const projectTrigger = (e.target as HTMLElement).closest<HTMLElement>("[data-open-project]");
    if (projectTrigger) {
      const projectId = projectTrigger.dataset.openProject;
      if (projectId) {
        openProjectDetail(projectId);
      }
      return;
    }
  });

  // Keyboard accessibility: Enter and Space activate clickable modal trigger cards
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const activeEl = document.activeElement as HTMLElement | null;
      if (!activeEl) return;
      const trigger = activeEl.closest<HTMLElement>(
        "[data-open-view], [data-open-post], [data-open-project]"
      );
      if (trigger && (activeEl === trigger || trigger.contains(activeEl))) {
        e.preventDefault();
        trigger.click();
      }
    }
  });

  // Support direct test preview via URL parameter (?view=experience / ?post=... / ?project=...)
  const urlParams = new URLSearchParams(window.location.search);
  const testView = urlParams.get("view");
  if (testView === "experience" || testView === "projects" || testView === "blogs") {
    openArchiveView(testView, true);
  }
  const testPost = urlParams.get("post");
  if (testPost) {
    openBlogPost(testPost, true);
  }
  const testProject = urlParams.get("project");
  if (testProject) {
    openProjectDetail(testProject, true);
  }

  // Live reactivity: re-render open vertical overlays whenever CMS mutations occur
  cms.subscribe(() => {
    if (isArchiveOpen && currentArchiveCategory) {
      openArchiveView(currentArchiveCategory, true);
    }
    if (isArticleOpen && currentBlogPostId) {
      const exists = cms.getAllBlogs().some((b) => b.id === currentBlogPostId);
      if (exists) {
        openBlogPost(currentBlogPostId, true);
      } else {
        closeArticleView();
      }
    }
    if (isProjectOpen && currentProjectId) {
      const exists = cms.getAllProjects().some((p) => p.id === currentProjectId);
      if (exists) {
        openProjectDetail(currentProjectId, true);
      } else {
        closeProjectDetail();
      }
    }
  });
}

/**
 * Opens full-page dedicated vertical archive (Experience, Projects, or Blogs)
 * Transitions smoothly up from the bottom (Y-axis transition)
 */
export function openArchiveView(category: "experience" | "projects" | "blogs", immediate = false) {
  const archiveView = document.querySelector<HTMLElement>("#vertical-archive-view");
  const titleEl = document.querySelector<HTMLElement>("#archive-view-title");
  const countEl = document.querySelector<HTMLElement>("#archive-view-count");
  const contentEl = document.querySelector<HTMLElement>("#archive-view-content");

  if (!archiveView || !titleEl || !countEl || !contentEl || isArchiveClosing) return;

  lastFocusedElement = document.activeElement as HTMLElement | null;
  currentArchiveCategory = category;

  if (category === "experience") {
    const list = cms.getAllExperience().filter((e) => e.category === "work");
    titleEl.textContent = "Work Experience & Placements";
    countEl.textContent = `${list.length} Industrial & Engineering Records`;

    if (list.length === 0) {
      contentEl.innerHTML = `
        <div class="py-20 text-center border border-neutral-800/80 rounded-sm p-8 space-y-3">
          <div class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">Work Experience · In Progress</div>
          <p class="font-sans text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
            Industrial placements, quantitative research internships, and engineering positions are being updated.
          </p>
        </div>
      `;
    } else {
      contentEl.innerHTML = list
        .map(
          (e) => `
      <article class="border-b border-neutral-800/80 pb-12 last:border-b-0 space-y-4">
        <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-1 text-xs font-sans text-neutral-400">
          <span class="uppercase tracking-widest text-neutral-300 font-medium">${escapeHtml(e.company)} · ${escapeHtml(e.location)}</span>
          <span class="font-mono text-neutral-500">${escapeHtml(e.period)}</span>
        </div>
        <h3 class="font-serif text-2xl md:text-3xl text-white font-normal">${escapeHtml(e.role)}</h3>
        <p class="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed">${escapeHtml(e.description)}</p>
        
        <div class="pt-1">
          <ul class="space-y-2 text-xs md:text-sm font-sans text-neutral-300 pl-4 list-disc font-light">
            ${(e.bulletPoints || []).map((b) => `<li class="leading-relaxed">${escapeHtml(b)}</li>`).join("")}
          </ul>
        </div>
      </article>
    `
        )
        .join("");
    }
  } else if (category === "projects") {
    const list = cms.getAllProjects();
    titleEl.textContent = "All Projects";
    countEl.textContent = `${list.length} Projects Completed`;

    if (list.length === 0) {
      contentEl.innerHTML = `
        <div class="py-20 text-center border border-neutral-800/80 rounded-sm p-8 space-y-3">
          <div class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">Selected Projects · Work in Progress</div>
          <p class="font-sans text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
            Algorithmic models, software repositories, and technical case studies are currently being curated and will be published shortly.
          </p>
        </div>
      `;
    } else {
      contentEl.innerHTML = list
        .map(
          (p, i) => `
      <article class="border-b border-neutral-800/80 pb-12 last:border-b-0 space-y-5">
        <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-1 text-xs font-sans text-neutral-400">
          <span class="uppercase tracking-widest text-neutral-300 font-medium">0${i + 1} · ${escapeHtml(p.category)}</span>
          <span class="font-mono text-neutral-500">${escapeHtml(p.year)}</span>
        </div>
        <div>
          <h3 class="font-serif text-2xl md:text-3xl text-white font-normal">${escapeHtml(p.title)}</h3>
          <p class="font-sans text-xs md:text-sm text-neutral-400 font-light mt-1">${escapeHtml(p.subtitle)}</p>
        </div>
        <p class="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed">${escapeHtml(p.description)}</p>
        
        ${p.metrics && p.metrics.length
              ? `
          <div class="border-l border-neutral-700 pl-4 py-1 space-y-1.5 text-xs md:text-sm font-sans text-neutral-300">
            ${p.metrics.map((m) => `<div>• ${escapeHtml(m)}</div>`).join("")}
          </div>
        `
              : ""
            }

        ${p.codeSnippet
              ? `
          <div class="bg-neutral-950 border border-neutral-800/80 p-4 rounded text-xs font-mono text-neutral-300 overflow-x-auto">
            <pre class="leading-relaxed whitespace-pre font-mono text-xs text-neutral-300"><code>${escapeHtml(p.codeSnippet)}</code></pre>
          </div>
        `
              : ""
            }

        <div class="flex justify-between items-center pt-2">
          <div class="font-sans text-xs text-neutral-400">
            <span>${p.tags.map(escapeHtml).join(" · ")}</span>
          </div>
          <button
            data-open-project="${escapeHtml(p.id)}"
            class="to-link-underline font-sans text-xs uppercase tracking-wider text-neutral-300 hover:text-white cursor-pointer py-1 flex items-center gap-1.5 font-medium"
            role="button"
            tabindex="0"
            aria-label="View dedicated details for ${escapeHtml(p.title)}"
          >
            <span>View Project →</span>
          </button>
        </div>
      </article>
    `
        )
        .join("");
    }
  } else if (category === "blogs") {
    const list = cms.getAllBlogs();
    titleEl.textContent = "Blogs and Research";
    countEl.textContent = `${list.length} Articles written`;

    if (list.length === 0) {
      contentEl.innerHTML = `
        <div class="py-20 text-center border border-neutral-800/80 rounded-sm p-8 space-y-3">
          <div class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">Writings · Coming Soon</div>
          <p class="font-sans text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
            Still writing...
          </p>
        </div>
      `;
    } else {
      contentEl.innerHTML = list
        .map(
          (b) => `
      <article
        class="border-b border-neutral-800/80 pb-10 last:border-b-0 cursor-pointer group space-y-2 outline-none focus-visible:ring-1 focus-visible:ring-white"
        data-open-post="${escapeHtml(b.id)}"
        role="button"
        tabindex="0"
        aria-label="Read working paper: ${escapeHtml(b.title)}"
      >
        <div class="flex justify-between items-baseline text-xs font-sans text-neutral-400">
          <span class="uppercase tracking-widest text-neutral-300 font-medium">${b.tags.map(escapeHtml).join(" · ")}</span>
          <span class="font-mono text-neutral-500">${escapeHtml(b.date)}</span>
        </div>
        <h3 class="font-serif text-2xl md:text-3xl text-white font-normal group-hover:text-neutral-400 transition-colors flex items-center justify-between">
          <span>${escapeHtml(b.title)}</span>
          <span class="text-xs font-sans text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">Read Essay →</span>
        </h3>
        <p class="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed">
          ${escapeHtml(b.excerpt)}
        </p>
      </article>
    `
        )
        .join("");
    }
  }

  isArchiveOpen = true;
  lockScroll(true);

  archiveView.style.display = "block";
  archiveView.setAttribute("aria-hidden", "false");
  archiveView.scrollTop = 0;
  archiveView.focus();

  if (immediate) {
    gsap.set(archiveView, { yPercent: 0 });
    return;
  }

  gsap.killTweensOf(archiveView);
  gsap.fromTo(
    archiveView,
    { yPercent: 100 },
    {
      yPercent: 0,
      duration: 0.65,
      ease: "power3.out",
    }
  );
}

export function closeArchiveView() {
  const archiveView = document.querySelector<HTMLElement>("#vertical-archive-view");
  if (!archiveView || !isArchiveOpen || isArchiveClosing) return;

  isArchiveClosing = true;
  clearModalQueryParams();

  gsap.killTweensOf(archiveView);
  gsap.to(archiveView, {
    yPercent: 100,
    duration: 0.5,
    ease: "power3.in",
    onComplete: () => {
      archiveView.style.display = "none";
      archiveView.setAttribute("aria-hidden", "true");
      isArchiveOpen = false;
      isArchiveClosing = false;
      currentArchiveCategory = null;
      if (!isArticleOpen && !isProjectOpen) {
        lockScroll(false);
      }
      lastFocusedElement?.focus();
    },
  });
}

/**
 * Opens dedicated individual blog post page.
 * Slides in from the TOP, and exits to the TOP.
 */
export function openBlogPost(blogId: string, immediate = false) {
  const articleView = document.querySelector<HTMLElement>("#vertical-article-view");
  const postCategory = document.querySelector<HTMLElement>("#article-category");
  const postMeta = document.querySelector<HTMLElement>("#article-meta");
  const postTitle = document.querySelector<HTMLElement>("#article-title");
  const postExcerpt = document.querySelector<HTMLElement>("#article-excerpt");
  const postContent = document.querySelector<HTMLElement>("#article-body");

  if (!articleView || !postTitle || !postContent || isArticleClosing) return;

  const blog = cms.getAllBlogs().find((b) => b.id === blogId);
  if (!blog) return;

  lastFocusedElement = document.activeElement as HTMLElement | null;
  currentBlogPostId = blogId;

  if (postCategory) postCategory.textContent = blog.tags.slice(0, 2).join(" · ") || "Research Note";
  if (postMeta) postMeta.textContent = blog.date;
  postTitle.textContent = blog.title;
  if (postExcerpt) postExcerpt.textContent = blog.excerpt;

  // Format paragraphs safely
  const paragraphs = blog.content.split(/\r?\n\r?\n/).filter(Boolean);
  postContent.innerHTML = paragraphs
    .map(
      (p) =>
        `<p class="font-sans text-base md:text-lg text-neutral-200 leading-relaxed font-light">${escapeHtml(
          p
        )}</p>`
    )
    .join("");

  isArticleOpen = true;
  lockScroll(true);

  articleView.style.display = "block";
  articleView.setAttribute("aria-hidden", "false");
  articleView.scrollTop = 0;
  articleView.focus();

  if (immediate) {
    gsap.set(articleView, { yPercent: 0 });
    return;
  }

  gsap.killTweensOf(articleView);
  gsap.fromTo(
    articleView,
    { yPercent: -100 },
    {
      yPercent: 0,
      duration: 0.7,
      ease: "power3.inOut",
    }
  );
}

export function closeArticleView() {
  const articleView = document.querySelector<HTMLElement>("#vertical-article-view");
  if (!articleView || !isArticleOpen || isArticleClosing) return;

  isArticleClosing = true;
  clearModalQueryParams();

  gsap.killTweensOf(articleView);
  gsap.to(articleView, {
    yPercent: -100,
    duration: 0.55,
    ease: "power3.inOut",
    onComplete: () => {
      articleView.style.display = "none";
      articleView.setAttribute("aria-hidden", "true");
      isArticleOpen = false;
      isArticleClosing = false;
      currentBlogPostId = null;
      if (!isArchiveOpen && !isProjectOpen) {
        lockScroll(false);
      }
      lastFocusedElement?.focus();
    },
  });
}

/**
 * Opens dedicated individual project page.
 * Slides in from the TOP, and exits to the TOP (matching blog posts).
 */
export function openProjectDetail(projectId: string, immediate = false) {
  const projectView = document.querySelector<HTMLElement>("#vertical-project-view");
  const categoryEl = document.querySelector<HTMLElement>("#project-view-category");
  const metaEl = document.querySelector<HTMLElement>("#project-view-meta");
  const titleEl = document.querySelector<HTMLElement>("#project-view-title");
  const subtitleEl = document.querySelector<HTMLElement>("#project-view-subtitle");
  const descEl = document.querySelector<HTMLElement>("#project-view-description");
  const metricsWrap = document.querySelector<HTMLElement>("#project-view-metrics-wrap");
  const metricsEl = document.querySelector<HTMLElement>("#project-view-metrics");
  const codeWrap = document.querySelector<HTMLElement>("#project-view-code-wrap");
  const codeEl = document.querySelector<HTMLElement>("#project-view-code");
  const tagsEl = document.querySelector<HTMLElement>("#project-view-tags");

  if (!projectView || !titleEl || !descEl || isProjectClosing) return;

  const project = cms.getAllProjects().find((p) => p.id === projectId);
  if (!project) return;

  lastFocusedElement = document.activeElement as HTMLElement | null;
  currentProjectId = projectId;

  if (categoryEl) categoryEl.textContent = project.category || "Computational Project";
  if (metaEl) metaEl.textContent = `${project.year} · Project Details`;
  titleEl.textContent = project.title;
  if (subtitleEl) subtitleEl.textContent = project.subtitle;

  // Format description paragraphs safely
  const paragraphs = project.description.split(/\r?\n\r?\n/).filter(Boolean);
  descEl.innerHTML = paragraphs
    .map(
      (p) =>
        `<p class="font-sans text-base md:text-lg text-neutral-200 leading-relaxed font-light">${escapeHtml(
          p
        )}</p>`
    )
    .join("");

  // Metrics
  if (metricsWrap && metricsEl) {
    if (project.metrics && project.metrics.length > 0) {
      metricsWrap.style.display = "block";
      metricsEl.innerHTML = project.metrics.map((m) => `<div>• ${escapeHtml(m)}</div>`).join("");
    } else {
      metricsWrap.style.display = "none";
    }
  }

  // Code snippet (safe via textContent)
  if (codeWrap && codeEl) {
    if (project.codeSnippet && project.codeSnippet.trim()) {
      codeWrap.style.display = "block";
      codeEl.textContent = project.codeSnippet;
    } else {
      codeWrap.style.display = "none";
    }
  }

  // Tags
  if (tagsEl) {
    tagsEl.textContent = project.tags.join(" · ");
  }

  isProjectOpen = true;
  lockScroll(true);

  projectView.style.display = "block";
  projectView.setAttribute("aria-hidden", "false");
  projectView.scrollTop = 0;
  projectView.focus();

  if (immediate) {
    gsap.set(projectView, { yPercent: 0 });
    return;
  }

  gsap.killTweensOf(projectView);
  gsap.fromTo(
    projectView,
    { yPercent: -100 },
    {
      yPercent: 0,
      duration: 0.7,
      ease: "power3.inOut",
    }
  );
}

export function closeProjectDetail() {
  const projectView = document.querySelector<HTMLElement>("#vertical-project-view");
  if (!projectView || !isProjectOpen || isProjectClosing) return;

  isProjectClosing = true;
  clearModalQueryParams();

  gsap.killTweensOf(projectView);
  gsap.to(projectView, {
    yPercent: -100,
    duration: 0.55,
    ease: "power3.inOut",
    onComplete: () => {
      projectView.style.display = "none";
      projectView.setAttribute("aria-hidden", "true");
      isProjectOpen = false;
      isProjectClosing = false;
      currentProjectId = null;
      if (!isArchiveOpen && !isArticleOpen) {
        lockScroll(false);
      }
      lastFocusedElement?.focus();
    },
  });
}
