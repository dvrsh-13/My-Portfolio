import { cms } from "./lib/cmsStore";
import type { ProjectItem, ExperienceItem, BlogItem, EducationItem } from "./data/portfolioData";

type CurrentEditType = "project" | "experience" | "blog" | "education";
let activeEditType: CurrentEditType = "project";
let activeEditId: string | null = null;

function init() {
  setupTabs();
  renderAll();
  setupEventListeners();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function renderAll() {
  renderCMSProjects();
  renderCMSExperience();
  renderCMSBlogs();
  renderCMSEducation();
  loadProfileAndSettings();
}

function setupTabs() {
  const tabBtns = document.querySelectorAll<HTMLButtonElement>("[data-tab-btn]");
  const tabPanels = document.querySelectorAll<HTMLElement>("[data-tab-panel]");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tabBtn;

      tabBtns.forEach((b) => {
        b.classList.remove("border-white", "text-white", "font-medium");
        b.classList.add("border-transparent", "text-neutral-400", "font-normal");
      });
      btn.classList.add("border-white", "text-white", "font-medium");
      btn.classList.remove("border-transparent", "text-neutral-400", "font-normal");

      tabPanels.forEach((p) => {
        p.classList.toggle("hidden", p.dataset.tabPanel !== target);
      });
    });
  });
}

function showToast(message: string, isError = false) {
  let toast = document.getElementById("cms-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cms-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `fixed bottom-8 right-8 z-[200] font-sans font-medium text-xs px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300 opacity-100 translate-y-0 flex items-center gap-2.5 border backdrop-blur-md ${
    isError
      ? "bg-rose-950/90 text-rose-200 border-rose-800"
      : "bg-white text-black border-neutral-200 shadow-2xl"
  }`;

  setTimeout(() => {
    if (toast) {
      toast.classList.add("opacity-0", "translate-y-4");
      toast.classList.remove("opacity-100", "translate-y-0");
    }
  }, 3000);
}

// -------------------------------------------------------------
// 1. Projects CMS
// -------------------------------------------------------------
function renderCMSProjects() {
  const container = document.getElementById("cms-projects-list");
  const indicator = document.getElementById("projects-limit-indicator");
  if (!container) return;

  const projects = cms.getAllProjects();
  const limit = cms.getSettings().featuredProjectsLimit;
  const featuredCount = projects.filter((p) => p.featured).length;

  if (indicator) {
    indicator.textContent = `Showing ${featuredCount} of ${limit} maximum on main storyboard · ${projects.length - featuredCount} stored in full archive`;
  }

  container.innerHTML = projects
    .map(
      (p) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${p.title}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            p.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${p.featured ? "● Storyboard Featured" : "Archive Only"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${p.subtitle} · <span class="text-neutral-500">${p.category} (${p.year})</span></p>
        <p class="font-sans text-sm text-neutral-300 font-light leading-relaxed">${p.description}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-proj="${p.id}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-proj="${p.id}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${p.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${p.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-proj="${p.id}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll("[data-edit-proj]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit-proj");
      if (id) openEditModal("project", id);
    });
  });

  container.querySelectorAll("[data-toggle-proj]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle-proj");
      if (id) {
        cms.toggleProjectFeatured(id);
        renderCMSProjects();
      }
    });
  });

  container.querySelectorAll("[data-delete-proj]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-delete-proj");
      if (id && confirm("Delete this computational project?")) {
        cms.deleteProject(id);
        renderCMSProjects();
      }
    });
  });
}

// -------------------------------------------------------------
// 2. Experience CMS
// -------------------------------------------------------------
function renderCMSExperience() {
  const container = document.getElementById("cms-experience-list");
  const indicator = document.getElementById("experience-limit-indicator");
  if (!container) return;

  const exp = cms.getAllExperience();
  const limit = cms.getSettings().featuredExperienceLimit;
  const featuredCount = exp.filter((e) => e.featured).length;

  if (indicator) {
    indicator.textContent = `Showing ${featuredCount} of ${limit} maximum on main storyboard · ${exp.length - featuredCount} stored in full archive`;
  }

  container.innerHTML = exp
    .map(
      (e) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${e.company}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            e.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${e.featured ? "● Storyboard Featured" : "Archive Only"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${e.role} · <span class="text-neutral-500">${e.location} (${e.period})</span></p>
        <p class="font-sans text-sm text-neutral-300 font-light leading-relaxed">${e.bulletPoints[0] || e.description}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-exp="${e.id}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-exp="${e.id}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${e.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${e.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-exp="${e.id}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll("[data-edit-exp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit-exp");
      if (id) openEditModal("experience", id);
    });
  });

  container.querySelectorAll("[data-toggle-exp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle-exp");
      if (id) {
        cms.toggleExperienceFeatured(id);
        renderCMSExperience();
      }
    });
  });

  container.querySelectorAll("[data-delete-exp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-delete-exp");
      if (id && confirm("Delete this experience record?")) {
        cms.deleteExperience(id);
        renderCMSExperience();
      }
    });
  });
}

// -------------------------------------------------------------
// 3. Blogs CMS
// -------------------------------------------------------------
function renderCMSBlogs() {
  const container = document.getElementById("cms-blogs-list");
  const indicator = document.getElementById("blogs-limit-indicator");
  if (!container) return;

  const blogs = cms.getAllBlogs();
  const limit = cms.getSettings().featuredBlogsLimit;
  const featuredCount = blogs.filter((b) => b.featured).length;

  if (indicator) {
    indicator.textContent = `Showing ${featuredCount} of ${limit} maximum on main storyboard · ${blogs.length - featuredCount} stored in full archive`;
  }

  container.innerHTML = blogs
    .map(
      (b) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${b.title}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            b.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${b.featured ? "● Storyboard Featured" : "Archive Only"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${b.date} · ${b.readTime} · <span class="text-neutral-500">${b.tags.join(", ")}</span></p>
        <p class="font-sans text-sm text-neutral-300 font-light leading-relaxed">${b.excerpt}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-blog="${b.id}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-blog="${b.id}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${b.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${b.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-blog="${b.id}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll("[data-edit-blog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit-blog");
      if (id) openEditModal("blog", id);
    });
  });

  container.querySelectorAll("[data-toggle-blog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle-blog");
      if (id) {
        cms.toggleBlogFeatured(id);
        renderCMSBlogs();
      }
    });
  });

  container.querySelectorAll("[data-delete-blog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-delete-blog");
      if (id && confirm("Delete this research dispatch?")) {
        cms.deleteBlog(id);
        renderCMSBlogs();
      }
    });
  });
}

// -------------------------------------------------------------
// 4. Education CMS
// -------------------------------------------------------------
function renderCMSEducation() {
  const container = document.getElementById("cms-education-list");
  if (!container) return;

  const edu = cms.getEducation();
  container.innerHTML = edu
    .map(
      (item) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <h3 class="font-serif text-xl font-normal text-white">${item.institution}</h3>
        <p class="font-sans text-xs text-neutral-300 font-medium">${item.program} · <span class="text-neutral-400 font-light">${item.grades}</span></p>
        <p class="font-mono text-xs text-neutral-500">${item.period}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-edu="${item.id}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-delete-edu="${item.id}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll("[data-edit-edu]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit-edu");
      if (id) openEditModal("education", id);
    });
  });

  container.querySelectorAll("[data-delete-edu]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-delete-edu");
      if (id && confirm("Delete this academic record?")) {
        cms.deleteEducation(id);
        renderCMSEducation();
      }
    });
  });
}

// -------------------------------------------------------------
// 5. Profile & Settings
// -------------------------------------------------------------
function loadProfileAndSettings() {
  const s = cms.getSettings();

  const nameInput = document.getElementById("setting-name") as HTMLInputElement;
  const titleInput = document.getElementById("setting-title") as HTMLInputElement;
  const emailInput = document.getElementById("setting-email") as HTMLInputElement;
  const locationInput = document.getElementById("setting-location") as HTMLInputElement;
  const githubInput = document.getElementById("setting-github") as HTMLInputElement;
  const linkedinInput = document.getElementById("setting-linkedin") as HTMLInputElement;
  const bioInput = document.getElementById("setting-bio") as HTMLTextAreaElement;

  if (nameInput) nameInput.value = s.name;
  if (titleInput) titleInput.value = s.title;
  if (emailInput) emailInput.value = s.email;
  if (locationInput) locationInput.value = s.location;
  if (githubInput) githubInput.value = s.github;
  if (linkedinInput) linkedinInput.value = s.linkedin;
  if (bioInput) bioInput.value = s.bio;

  const projInput = document.getElementById("setting-proj-limit") as HTMLInputElement;
  const expInput = document.getElementById("setting-exp-limit") as HTMLInputElement;
  const blogInput = document.getElementById("setting-blog-limit") as HTMLInputElement;

  if (projInput) projInput.value = String(s.featuredProjectsLimit);
  if (expInput) expInput.value = String(s.featuredExperienceLimit);
  if (blogInput) blogInput.value = String(s.featuredBlogsLimit);
}

// -------------------------------------------------------------
// 6. Modal Record Editor (Real Forms, No window.prompt!)
// -------------------------------------------------------------
function openEditModal(type: CurrentEditType, id: string | null = null) {
  const modal = document.getElementById("cms-editor-modal") as HTMLDialogElement;
  const titleEl = document.getElementById("modal-form-title");
  const fieldsContainer = document.getElementById("modal-form-fields");
  const featuredCheckbox = document.getElementById("modal-featured-checkbox") as HTMLInputElement;

  if (!modal || !titleEl || !fieldsContainer) return;

  activeEditType = type;
  activeEditId = id;

  if (type === "project") {
    const item = id ? cms.getAllProjects().find((p) => p.id === id) : null;
    titleEl.textContent = item ? "Edit Project" : "New Project";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Project Title</label>
          <input type="text" id="f-proj-title" value="${item?.title || ""}" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Subtitle</label>
            <input type="text" id="f-proj-sub" value="${item?.subtitle || ""}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Category</label>
            <input type="text" id="f-proj-cat" value="${item?.category || "Quantitative Systems"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Year</label>
          <input type="text" id="f-proj-year" value="${item?.year || "2026"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-mono" />
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Description</label>
          <textarea id="f-proj-desc" rows="3" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y">${item?.description || ""}</textarea>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Key Finding / Metric (One per line)</label>
          <textarea id="f-proj-metrics" rows="2" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y">${item?.metrics.join("\n") || ""}</textarea>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Python / Code Snippet (Optional)</label>
          <textarea id="f-proj-code" rows="4" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-white font-mono text-xs rounded-xl outline-none transition-all placeholder:text-neutral-600 resize-y">${item?.codeSnippet || ""}</textarea>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Tags (Comma-separated)</label>
          <input type="text" id="f-proj-tags" value="${item?.tags.join(", ") || "Python, NumPy"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
      </div>
    `;
  } else if (type === "experience") {
    const item = id ? cms.getAllExperience().find((e) => e.id === id) : null;
    titleEl.textContent = item ? "Edit Work Placement" : "New Work Placement";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Company Name</label>
            <input type="text" id="f-exp-company" value="${item?.company || ""}" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Location</label>
            <input type="text" id="f-exp-location" value="${item?.location || "London, UK"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Role / Placement Title</label>
            <input type="text" id="f-exp-role" value="${item?.role || ""}" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Period / Dates</label>
            <input type="text" id="f-exp-period" value="${item?.period || "2026"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Narrative Summary</label>
          <textarea id="f-exp-desc" rows="2" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y">${item?.description || ""}</textarea>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Bullet Points & Contributions (One per line)</label>
          <textarea id="f-exp-bullets" rows="4" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y">${item?.bulletPoints.join("\n") || ""}</textarea>
        </div>
      </div>
    `;
  } else if (type === "blog") {
    const item = id ? cms.getAllBlogs().find((b) => b.id === id) : null;
    titleEl.textContent = item ? "Edit Research Dispatch" : "New Research Dispatch";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Article Title</label>
          <input type="text" id="f-blog-title" value="${item?.title || ""}" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Publication Date</label>
            <input type="text" id="f-blog-date" value="${item?.date || "2026"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Read Time</label>
            <input type="text" id="f-blog-time" value="${item?.readTime || "7 min read"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Tags (Comma-separated)</label>
          <input type="text" id="f-blog-tags" value="${item?.tags.join(", ") || "Quantitative Finance, Statistics"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Abstract / Excerpt (Lead)</label>
          <textarea id="f-blog-excerpt" rows="2" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y">${item?.excerpt || ""}</textarea>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Full Essay Content (Double return for paragraphs)</label>
          <textarea id="f-blog-content" rows="6" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-white font-sans text-xs rounded-xl outline-none transition-all placeholder:text-neutral-600 leading-relaxed resize-y">${item?.content || ""}</textarea>
        </div>
      </div>
    `;
  } else if (type === "education") {
    const item = id ? cms.getEducation().find((e) => e.id === id) : null;
    titleEl.textContent = item ? "Edit Academic Record" : "New Academic Record";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Institution Name</label>
          <input type="text" id="f-edu-inst" value="${item?.institution || ""}" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Program / Qualification</label>
            <input type="text" id="f-edu-prog" value="${item?.program || ""}" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Period / Dates</label>
            <input type="text" id="f-edu-period" value="${item?.period || "Sep 2024 — Aug 2026"}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Grades Achieved</label>
          <input type="text" id="f-edu-grades" value="${item?.grades || ""}" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div>
          <label class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Details & Dissertations (One per line)</label>
          <textarea id="f-edu-details" rows="3" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y">${item?.details.join("\n") || ""}</textarea>
        </div>
      </div>
    `;
  }

  modal.showModal();
}

function handleFormSubmit() {
  const featuredCheckbox = document.getElementById("modal-featured-checkbox") as HTMLInputElement;
  const isFeatured = featuredCheckbox ? featuredCheckbox.checked : true;

  if (activeEditType === "project") {
    const title = (document.getElementById("f-proj-title") as HTMLInputElement)?.value;
    const subtitle = (document.getElementById("f-proj-sub") as HTMLInputElement)?.value || "";
    const category = (document.getElementById("f-proj-cat") as HTMLInputElement)?.value || "Applied Systems";
    const year = (document.getElementById("f-proj-year") as HTMLInputElement)?.value || "2026";
    const description = (document.getElementById("f-proj-desc") as HTMLTextAreaElement)?.value || "";
    const metricsStr = (document.getElementById("f-proj-metrics") as HTMLTextAreaElement)?.value || "";
    const codeSnippet = (document.getElementById("f-proj-code") as HTMLTextAreaElement)?.value || "";
    const tagsStr = (document.getElementById("f-proj-tags") as HTMLInputElement)?.value || "";

    const metrics = metricsStr.split("\n").map((s) => s.trim()).filter(Boolean);
    const tags = tagsStr.split(",").map((s) => s.trim()).filter(Boolean);

    if (!title) return;

    if (activeEditId) {
      cms.updateProject(activeEditId, {
        title,
        subtitle,
        category,
        year,
        description,
        metrics,
        codeSnippet,
        tags,
        featured: isFeatured,
      });
    } else {
      cms.addProject({
        id: "proj-" + Date.now(),
        title,
        subtitle,
        category,
        year,
        description,
        metrics,
        codeSnippet,
        tags,
        featured: isFeatured,
      });
    }
    renderCMSProjects();
  } else if (activeEditType === "experience") {
    const company = (document.getElementById("f-exp-company") as HTMLInputElement)?.value;
    const location = (document.getElementById("f-exp-location") as HTMLInputElement)?.value || "London, UK";
    const role = (document.getElementById("f-exp-role") as HTMLInputElement)?.value;
    const period = (document.getElementById("f-exp-period") as HTMLInputElement)?.value || "2026";
    const description = (document.getElementById("f-exp-desc") as HTMLTextAreaElement)?.value || "";
    const bulletsStr = (document.getElementById("f-exp-bullets") as HTMLTextAreaElement)?.value || "";

    const bulletPoints = bulletsStr.split("\n").map((s) => s.trim()).filter(Boolean);

    if (!company || !role) return;

    if (activeEditId) {
      cms.updateExperience(activeEditId, {
        company,
        location,
        role,
        period,
        description,
        bulletPoints,
        featured: isFeatured,
      });
    } else {
      cms.addExperience({
        id: "exp-" + Date.now(),
        company,
        location,
        role,
        period,
        description,
        bulletPoints,
        featured: isFeatured,
        category: "work",
      });
    }
    renderCMSExperience();
  } else if (activeEditType === "blog") {
    const title = (document.getElementById("f-blog-title") as HTMLInputElement)?.value;
    const date = (document.getElementById("f-blog-date") as HTMLInputElement)?.value || "2026";
    const readTime = (document.getElementById("f-blog-time") as HTMLInputElement)?.value || "7 min read";
    const tagsStr = (document.getElementById("f-blog-tags") as HTMLInputElement)?.value || "";
    const excerpt = (document.getElementById("f-blog-excerpt") as HTMLTextAreaElement)?.value || "";
    const content = (document.getElementById("f-blog-content") as HTMLTextAreaElement)?.value || "";

    const tags = tagsStr.split(",").map((s) => s.trim()).filter(Boolean);

    if (!title) return;

    if (activeEditId) {
      cms.updateBlog(activeEditId, {
        title,
        date,
        readTime,
        tags,
        excerpt,
        content,
        featured: isFeatured,
      });
    } else {
      cms.addBlog({
        id: "blog-" + Date.now(),
        title,
        date,
        readTime,
        tags,
        excerpt,
        content,
        featured: isFeatured,
      });
    }
    renderCMSBlogs();
  } else if (activeEditType === "education") {
    const institution = (document.getElementById("f-edu-inst") as HTMLInputElement)?.value;
    const program = (document.getElementById("f-edu-prog") as HTMLInputElement)?.value;
    const period = (document.getElementById("f-edu-period") as HTMLInputElement)?.value || "";
    const grades = (document.getElementById("f-edu-grades") as HTMLInputElement)?.value || "";
    const detailsStr = (document.getElementById("f-edu-details") as HTMLTextAreaElement)?.value || "";

    const details = detailsStr.split("\n").map((s) => s.trim()).filter(Boolean);

    if (!institution || !program) return;

    if (activeEditId) {
      cms.updateEducation(activeEditId, {
        institution,
        program,
        period,
        grades,
        details,
        featured: isFeatured,
      });
    } else {
      cms.addEducation({
        id: "edu-" + Date.now(),
        institution,
        program,
        period,
        grades,
        details,
        featured: isFeatured,
      });
    }
    renderCMSEducation();
  }

  const modal = document.getElementById("cms-editor-modal") as HTMLDialogElement;
  modal?.close();
  showToast(activeEditId ? "✓ Record updated successfully" : "✓ New record created successfully");
}

function setupEventListeners() {
  // Modal buttons
  document.getElementById("add-project-btn")?.addEventListener("click", () => openEditModal("project"));
  document.getElementById("add-experience-btn")?.addEventListener("click", () => openEditModal("experience"));
  document.getElementById("add-blog-btn")?.addEventListener("click", () => openEditModal("blog"));
  document.getElementById("add-education-btn")?.addEventListener("click", () => openEditModal("education"));

  const modal = document.getElementById("cms-editor-modal") as HTMLDialogElement;
  document.getElementById("modal-close-btn")?.addEventListener("click", () => modal?.close());
  document.getElementById("modal-cancel-btn")?.addEventListener("click", () => modal?.close());

  document.getElementById("cms-editor-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  // Save Profile
  document.getElementById("save-profile-btn")?.addEventListener("click", () => {
    const nameInput = document.getElementById("setting-name") as HTMLInputElement;
    const titleInput = document.getElementById("setting-title") as HTMLInputElement;
    const emailInput = document.getElementById("setting-email") as HTMLInputElement;
    const locationInput = document.getElementById("setting-location") as HTMLInputElement;
    const githubInput = document.getElementById("setting-github") as HTMLInputElement;
    const linkedinInput = document.getElementById("setting-linkedin") as HTMLInputElement;
    const bioInput = document.getElementById("setting-bio") as HTMLTextAreaElement;

    cms.updateSettings({
      name: nameInput.value || "DEVARSH VINOD",
      title: titleInput.value || "Applied Mathematics & Computer Science",
      email: emailInput.value || "devarshvinod@gmail.com",
      location: locationInput.value || "Slough & London, UK",
      github: githubInput.value || "https://github.com",
      linkedin: linkedinInput.value || "https://linkedin.com",
      bio: bioInput.value,
    });

    showToast("✓ Profile settings saved successfully");
  });

  // Apply Limits
  document.getElementById("save-limits-btn")?.addEventListener("click", () => {
    const projInput = document.getElementById("setting-proj-limit") as HTMLInputElement;
    const expInput = document.getElementById("setting-exp-limit") as HTMLInputElement;
    const blogInput = document.getElementById("setting-blog-limit") as HTMLInputElement;

    cms.updateSettings({
      featuredProjectsLimit: parseInt(projInput.value, 10) || 3,
      featuredExperienceLimit: parseInt(expInput.value, 10) || 3,
      featuredBlogsLimit: parseInt(blogInput.value, 10) || 3,
    });

    renderAll();
    showToast("✓ Storyboard display limits updated and applied");
  });

  // Reset to Defaults
  document.getElementById("reset-defaults-btn")?.addEventListener("click", () => {
    if (confirm("Reset all content, records, and settings to original defaults?")) {
      cms.resetToDefaults();
      renderAll();
      showToast("✓ Database reset to initial defaults");
    }
  });

  // Export JSON
  document.getElementById("export-json-btn")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(cms.exportJSON());
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `devarsh_vinod_portfolio_${Date.now()}.json`);
    dlAnchor.click();
  });

  // Export TypeScript code
  document.getElementById("export-ts-btn")?.addEventListener("click", () => {
    const tsCode = cms.exportPortfolioDataTS();
    const blob = new Blob([tsCode], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", url);
    dlAnchor.setAttribute("download", "portfolioData.ts");
    dlAnchor.click();
    URL.revokeObjectURL(url);
  });

  // GitHub Direct Sync
  const ghRepoInput = document.getElementById("gh-sync-repo") as HTMLInputElement;
  const ghBranchInput = document.getElementById("gh-sync-branch") as HTMLInputElement;
  const ghTokenInput = document.getElementById("gh-sync-token") as HTMLInputElement;
  const ghStatus = document.getElementById("gh-sync-status");

  const savedToken = localStorage.getItem("folio_gh_token");
  if (savedToken && ghTokenInput) ghTokenInput.value = savedToken;
  const savedRepo = localStorage.getItem("folio_gh_repo");
  if (savedRepo && ghRepoInput) ghRepoInput.value = savedRepo;

  document.getElementById("gh-publish-btn")?.addEventListener("click", async () => {
    const token = ghTokenInput?.value.trim();
    const repo = ghRepoInput?.value.trim() || "dvrsh-13/My-Portfolio";
    const branch = ghBranchInput?.value.trim() || "Main";

    if (!token) {
      showToast("Please provide a GitHub Personal Access Token (PAT) with repo scope", true);
      return;
    }

    localStorage.setItem("folio_gh_token", token);
    localStorage.setItem("folio_gh_repo", repo);

    if (ghStatus) {
      ghStatus.textContent = "Connecting to GitHub API...";
      ghStatus.className = "text-xs font-mono text-neutral-400";
    }

    try {
      const filePath = "src/data/portfolioData.ts";
      const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;

      // 1. Fetch existing file SHA
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      let currentSha = "";
      if (getRes.ok) {
        const fileData = await getRes.json();
        currentSha = fileData.sha;
      }

      // 2. Base64 encode TypeScript content (handles UTF-8)
      const tsContent = cms.exportPortfolioDataTS();
      const base64Content = btoa(unescape(encodeURIComponent(tsContent)));

      // 3. Commit directly via GitHub REST API
      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update portfolioData.ts via Content Architecture Studio",
          content: base64Content,
          branch,
          ...(currentSha ? { sha: currentSha } : {}),
        }),
      });

      if (!putRes.ok) {
        const errJson = await putRes.json();
        throw new Error(errJson.message || "Failed to commit to GitHub");
      }

      if (ghStatus) {
        ghStatus.textContent = "✓ Successfully committed! GitHub Pages build will trigger automatically.";
        ghStatus.className = "text-xs font-mono text-emerald-400";
      }
      showToast("✓ Successfully committed updated data to GitHub repository!");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[CMS GitHub Sync]", err);
      if (ghStatus) {
        ghStatus.textContent = `✕ Error: ${errMsg}`;
        ghStatus.className = "text-xs font-mono text-rose-400";
      }
      showToast(`✕ GitHub Publish Failed: ${errMsg}`, true);
    }
  });

  // Import JSON
  const importInput = document.getElementById("import-json-input") as HTMLInputElement;
  importInput?.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          cms.importJSON(evt.target?.result as string);
          renderAll();
          showToast("✓ Database snapshot imported successfully");
        } catch {
          showToast("✕ Failed to parse JSON snapshot file", true);
        }
      };
      reader.readAsText(file);
    }
  });
}
