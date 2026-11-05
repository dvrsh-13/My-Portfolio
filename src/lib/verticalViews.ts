import gsap from "gsap";
import { cms } from "./cmsStore";
import { lockScroll } from "./smoothScroll";

let isArchiveOpen = false;
let isArticleOpen = false;

export function initVerticalViews() {
  const archiveView = document.querySelector<HTMLElement>("#vertical-archive-view");
  const articleView = document.querySelector<HTMLElement>("#vertical-article-view");

  if (!archiveView || !articleView) return;

  // Set initial off-screen positions
  gsap.set(archiveView, { yPercent: 100, display: "none" });
  gsap.set(articleView, { yPercent: -100, display: "none" });

  // Close triggers
  document.querySelectorAll("[data-close-archive]").forEach((btn) => {
    btn.addEventListener("click", closeArchiveView);
  });

  document.querySelectorAll("[data-close-article]").forEach((btn) => {
    btn.addEventListener("click", closeArticleView);
  });

  // Global ESC key listener
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isArticleOpen) {
        closeArticleView();
      } else if (isArchiveOpen) {
        closeArchiveView();
      }
    }
  });

  // Global delegate for open triggers
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
  });

  // Support direct test preview via URL parameter (?view=experience / ?post=backtest-overfitting-notes)
  const urlParams = new URLSearchParams(window.location.search);
  const testView = urlParams.get("view");
  if (testView === "experience" || testView === "projects" || testView === "blogs") {
    openArchiveView(testView);
  }
  const testPost = urlParams.get("post");
  if (testPost) {
    openBlogPost(testPost);
  }
}

/**
 * Opens full-page dedicated vertical archive (Experience, Projects, or Blogs)
 * Transitions smoothly up from the bottom (Y-axis transition)
 */
export function openArchiveView(category: "experience" | "projects" | "blogs") {
  const archiveView = document.querySelector<HTMLElement>("#vertical-archive-view");
  const titleEl = document.querySelector<HTMLElement>("#archive-view-title");
  const countEl = document.querySelector<HTMLElement>("#archive-view-count");
  const contentEl = document.querySelector<HTMLElement>("#archive-view-content");

  if (!archiveView || !titleEl || !countEl || !contentEl) return;

  if (category === "experience") {
    const list = cms.getAllExperience();
    titleEl.textContent = "Work Experience & Placements";
    countEl.textContent = `${list.length} Industrial & Engineering Records`;

    contentEl.innerHTML = list
      .map(
        (e) => `
      <article class="border-b border-neutral-800/80 pb-12 last:border-b-0 space-y-4">
        <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-1 text-xs font-sans text-neutral-400">
          <span class="uppercase tracking-widest text-neutral-300 font-medium">${e.company} · ${e.location}</span>
          <span class="font-mono text-neutral-500">${e.period}</span>
        </div>
        <h3 class="font-serif text-2xl md:text-3xl text-white font-normal">${e.role}</h3>
        <p class="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed">${e.description}</p>
        
        <div class="pt-1">
          <ul class="space-y-2 text-xs md:text-sm font-sans text-neutral-300 pl-4 list-disc font-light">
            ${e.bulletPoints.map((b) => `<li class="leading-relaxed">${b}</li>`).join("")}
          </ul>
        </div>
      </article>
    `
      )
      .join("");
  } else if (category === "projects") {
    const list = cms.getAllProjects();
    titleEl.textContent = "Computational Projects & Mathematical Models";
    countEl.textContent = `${list.length} Projects & Quantitative Implementations`;

    contentEl.innerHTML = list
      .map(
        (p, i) => `
      <article class="border-b border-neutral-800/80 pb-12 last:border-b-0 space-y-5">
        <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-1 text-xs font-sans text-neutral-400">
          <span class="uppercase tracking-widest text-neutral-300 font-medium">0${i + 1} · ${p.category}</span>
          <span class="font-mono text-neutral-500">${p.year}</span>
        </div>
        <div>
          <h3 class="font-serif text-2xl md:text-3xl text-white font-normal">${p.title}</h3>
          <p class="font-sans text-xs md:text-sm text-neutral-400 font-light mt-1">${p.subtitle}</p>
        </div>
        <p class="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed">${p.description}</p>
        
        ${
          p.metrics && p.metrics.length
            ? `
          <div class="border-l border-neutral-700 pl-4 py-1 space-y-1.5 text-xs md:text-sm font-sans text-neutral-300">
            ${p.metrics.map((m) => `<div>• ${m}</div>`).join("")}
          </div>
        `
            : ""
        }

        ${
          p.codeSnippet
            ? `
          <div class="bg-neutral-950 border border-neutral-800/80 p-4 rounded text-xs font-mono text-neutral-300 overflow-x-auto">
            <pre class="leading-relaxed whitespace-pre font-mono text-xs text-neutral-300"><code>${p.codeSnippet}</code></pre>
          </div>
        `
            : ""
        }

        <div class="font-sans text-xs text-neutral-400 pt-1">
          <span>${p.tags.join(" · ")}</span>
        </div>
      </article>
    `
      )
      .join("");
  } else if (category === "blogs") {
    const list = cms.getAllBlogs();
    titleEl.textContent = "Research Notes & Working Papers";
    countEl.textContent = `${list.length} Dispatches & Dissertation Insights`;

    contentEl.innerHTML = list
      .map(
        (b) => `
      <article class="border-b border-neutral-800/80 pb-10 last:border-b-0 cursor-pointer group space-y-2" data-open-post="${b.id}">
        <div class="flex justify-between items-baseline text-xs font-sans text-neutral-400">
          <span class="uppercase tracking-widest text-neutral-300 font-medium">${b.tags.join(" · ")}</span>
          <span class="font-mono text-neutral-500">${b.date} · ${b.readTime}</span>
        </div>
        <h3 class="font-serif text-2xl md:text-3xl text-white font-normal group-hover:text-neutral-400 transition-colors flex items-center justify-between">
          <span>${b.title}</span>
          <span class="text-xs font-sans text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">Read Essay →</span>
        </h3>
        <p class="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed">
          ${b.excerpt}
        </p>
      </article>
    `
      )
      .join("");
  }

  isArchiveOpen = true;
  lockScroll(true);

  archiveView.style.display = "block";
  archiveView.scrollTop = 0;

  if (window.location.search.includes("view=")) {
    gsap.set(archiveView, { yPercent: 0 });
    return;
  }

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
  if (!archiveView || !isArchiveOpen) return;

  gsap.to(archiveView, {
    yPercent: 100,
    duration: 0.5,
    ease: "power3.in",
    onComplete: () => {
      archiveView.style.display = "none";
      isArchiveOpen = false;
      if (!isArticleOpen) {
        lockScroll(false);
      }
    },
  });
}

/**
 * Opens dedicated individual blog post page.
 * Slides in from the TOP, and exits to the TOP.
 */
export function openBlogPost(blogId: string) {
  const articleView = document.querySelector<HTMLElement>("#vertical-article-view");
  const postCategory = document.querySelector<HTMLElement>("#article-category");
  const postMeta = document.querySelector<HTMLElement>("#article-meta");
  const postTitle = document.querySelector<HTMLElement>("#article-title");
  const postExcerpt = document.querySelector<HTMLElement>("#article-excerpt");
  const postContent = document.querySelector<HTMLElement>("#article-body");

  if (!articleView || !postTitle || !postContent) return;

  const blog = cms.getAllBlogs().find((b) => b.id === blogId);
  if (!blog) return;

  if (postCategory) postCategory.textContent = blog.tags.slice(0, 2).join(" · ") || "Research Note";
  if (postMeta) postMeta.textContent = `${blog.date} · ${blog.readTime}`;
  postTitle.textContent = blog.title;
  if (postExcerpt) postExcerpt.textContent = blog.excerpt;

  // Format paragraphs
  const paragraphs = blog.content.split("\n\n").filter(Boolean);
  postContent.innerHTML = paragraphs
    .map(
      (p) => `<p class="font-sans text-base md:text-lg text-neutral-200 leading-relaxed font-light">${p}</p>`
    )
    .join("");

  isArticleOpen = true;
  lockScroll(true);

  articleView.style.display = "block";
  articleView.scrollTop = 0;

  if (window.location.search.includes("post=")) {
    gsap.set(articleView, { yPercent: 0 });
    return;
  }

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
  if (!articleView || !isArticleOpen) return;

  gsap.to(articleView, {
    yPercent: -100,
    duration: 0.55,
    ease: "power3.inOut",
    onComplete: () => {
      articleView.style.display = "none";
      isArticleOpen = false;
      if (!isArchiveOpen) {
        lockScroll(false);
      }
    },
  });
}
