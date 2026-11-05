import { cms } from "./lib/cmsStore";
import type { ProjectItem, ExperienceItem, BlogItem, EducationItem } from "./data/portfolioData";

type CurrentEditType = "project" | "experience" | "blog" | "education";
let activeEditType: CurrentEditType = "project";
let activeEditId: string | null = null;

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  renderAll();
  setupEventListeners();
});

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
        b.classList.add("border-transparent", "text-neutral-500");
      });
      btn.classList.add("border-white", "text-white", "font-medium");
      btn.classList.remove("border-transparent", "text-neutral-500");

      tabPanels.forEach((p) => {
        p.classList.toggle("hidden", p.dataset.tabPanel !== target);
      });
    });
  });
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
    <div class="border border-neutral-800/80 p-5 bg-neutral-900/30 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
      <div class="space-y-1 max-w-xl">
        <div class="flex items-center gap-3">
          <h3 class="font-serif text-lg md:text-xl font-normal text-white">${p.title}</h3>
          <span class="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5 border ${
            p.featured
              ? "border-white/40 text-white font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${p.featured ? "Live on Storyboard" : "Full Archive View"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${p.subtitle} · ${p.category} (${p.year})</p>
        <p class="font-sans text-xs text-neutral-500 font-light line-clamp-1">${p.description}</p>
      </div>

      <div class="flex items-center gap-4 shrink-0 font-sans text-xs">
        <button data-edit-proj="${p.id}" class="to-link-underline text-neutral-300 hover:text-white cursor-pointer py-1">
          Edit
        </button>
        <span class="text-neutral-700">·</span>
        <button data-toggle-proj="${p.id}" class="to-link-underline text-neutral-300 hover:text-white cursor-pointer py-1">
          ${p.featured ? "Unfeature" : "Feature"}
        </button>
        <span class="text-neutral-700">·</span>
        <button data-delete-proj="${p.id}" class="text-neutral-500 hover:text-rose-400 cursor-pointer transition-colors py-1">
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
    <div class="border border-neutral-800/80 p-5 bg-neutral-900/30 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
      <div class="space-y-1 max-w-xl">
        <div class="flex items-center gap-3">
          <h3 class="font-serif text-lg md:text-xl font-normal text-white">${e.company}</h3>
          <span class="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5 border ${
            e.featured
              ? "border-white/40 text-white font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${e.featured ? "Live on Storyboard" : "Full Archive View"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${e.role} · ${e.location} (${e.period})</p>
        <p class="font-sans text-xs text-neutral-500 font-light line-clamp-1">${e.bulletPoints[0] || e.description}</p>
      </div>

      <div class="flex items-center gap-4 shrink-0 font-sans text-xs">
        <button data-edit-exp="${e.id}" class="to-link-underline text-neutral-300 hover:text-white cursor-pointer py-1">
          Edit
        </button>
        <span class="text-neutral-700">·</span>
        <button data-toggle-exp="${e.id}" class="to-link-underline text-neutral-300 hover:text-white cursor-pointer py-1">
          ${e.featured ? "Unfeature" : "Feature"}
        </button>
        <span class="text-neutral-700">·</span>
        <button data-delete-exp="${e.id}" class="text-neutral-500 hover:text-rose-400 cursor-pointer transition-colors py-1">
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
    <div class="border border-neutral-800/80 p-5 bg-neutral-900/30 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
      <div class="space-y-1 max-w-xl">
        <div class="flex items-center gap-3">
          <h3 class="font-serif text-lg md:text-xl font-normal text-white">${b.title}</h3>
          <span class="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5 border ${
            b.featured
              ? "border-white/40 text-white font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${b.featured ? "Live on Storyboard" : "Full Archive View"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${b.date} · ${b.readTime} · ${b.tags.join(", ")}</p>
        <p class="font-sans text-xs text-neutral-500 font-light line-clamp-1">${b.excerpt}</p>
      </div>

      <div class="flex items-center gap-4 shrink-0 font-sans text-xs">
        <button data-edit-blog="${b.id}" class="to-link-underline text-neutral-300 hover:text-white cursor-pointer py-1">
          Edit
        </button>
        <span class="text-neutral-700">·</span>
        <button data-toggle-blog="${b.id}" class="to-link-underline text-neutral-300 hover:text-white cursor-pointer py-1">
          ${b.featured ? "Unfeature" : "Feature"}
        </button>
        <span class="text-neutral-700">·</span>
        <button data-delete-blog="${b.id}" class="text-neutral-500 hover:text-rose-400 cursor-pointer transition-colors py-1">
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
    <div class="border border-neutral-800/80 p-5 bg-neutral-900/30 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
      <div class="space-y-1 max-w-xl">
        <h3 class="font-serif text-lg md:text-xl font-normal text-white">${item.institution}</h3>
        <p class="font-sans text-xs text-neutral-300 font-medium">${item.program} · <span class="text-neutral-400 font-light">${item.grades}</span></p>
        <p class="font-mono text-xs text-neutral-500">${item.period}</p>
      </div>

      <div class="flex items-center gap-4 shrink-0 font-sans text-xs">
        <button data-edit-edu="${item.id}" class="to-link-underline text-neutral-300 hover:text-white cursor-pointer py-1">
          Edit
        </button>
        <span class="text-neutral-700">·</span>
        <button data-delete-edu="${item.id}" class="text-neutral-500 hover:text-rose-400 cursor-pointer transition-colors py-1">
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
      <div class="space-y-3 font-sans text-xs">
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Project Title</label>
          <input type="text" id="f-proj-title" value="${item?.title || ""}" required class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Subtitle</label>
            <input type="text" id="f-proj-sub" value="${item?.subtitle || ""}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Category</label>
            <input type="text" id="f-proj-cat" value="${item?.category || "Quantitative Systems"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Year</label>
          <input type="text" id="f-proj-year" value="${item?.year || "2026"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Description</label>
          <textarea id="f-proj-desc" rows="3" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500">${item?.description || ""}</textarea>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Key Finding / Metric (One per line)</label>
          <textarea id="f-proj-metrics" rows="2" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500">${item?.metrics.join("\n") || ""}</textarea>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Python / Code Snippet (Optional)</label>
          <textarea id="f-proj-code" rows="4" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white font-mono text-xs rounded outline-none focus:border-neutral-500">${item?.codeSnippet || ""}</textarea>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Tags (Comma-separated)</label>
          <input type="text" id="f-proj-tags" value="${item?.tags.join(", ") || "Python, NumPy"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
        </div>
      </div>
    `;
  } else if (type === "experience") {
    const item = id ? cms.getAllExperience().find((e) => e.id === id) : null;
    titleEl.textContent = item ? "Edit Work Placement" : "New Work Placement";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-3 font-sans text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Company Name</label>
            <input type="text" id="f-exp-company" value="${item?.company || ""}" required class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Location</label>
            <input type="text" id="f-exp-location" value="${item?.location || "London, UK"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Role / Placement Title</label>
            <input type="text" id="f-exp-role" value="${item?.role || ""}" required class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Period / Dates</label>
            <input type="text" id="f-exp-period" value="${item?.period || "2026"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Narrative Summary</label>
          <textarea id="f-exp-desc" rows="2" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500">${item?.description || ""}</textarea>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Bullet Points & Contributions (One per line)</label>
          <textarea id="f-exp-bullets" rows="4" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500">${item?.bulletPoints.join("\n") || ""}</textarea>
        </div>
      </div>
    `;
  } else if (type === "blog") {
    const item = id ? cms.getAllBlogs().find((b) => b.id === id) : null;
    titleEl.textContent = item ? "Edit Research Dispatch" : "New Research Dispatch";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-3 font-sans text-xs">
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Article Title</label>
          <input type="text" id="f-blog-title" value="${item?.title || ""}" required class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Publication Date</label>
            <input type="text" id="f-blog-date" value="${item?.date || "2026"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Read Time</label>
            <input type="text" id="f-blog-time" value="${item?.readTime || "7 min read"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Tags (Comma-separated)</label>
          <input type="text" id="f-blog-tags" value="${item?.tags.join(", ") || "Quantitative Finance, Statistics"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Abstract / Excerpt (Lead)</label>
          <textarea id="f-blog-excerpt" rows="2" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500">${item?.excerpt || ""}</textarea>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Full Essay Content (Double return for paragraphs)</label>
          <textarea id="f-blog-content" rows="6" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white font-sans text-xs rounded outline-none focus:border-neutral-500 leading-relaxed">${item?.content || ""}</textarea>
        </div>
      </div>
    `;
  } else if (type === "education") {
    const item = id ? cms.getEducation().find((e) => e.id === id) : null;
    titleEl.textContent = item ? "Edit Academic Record" : "New Academic Record";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-3 font-sans text-xs">
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Institution Name</label>
          <input type="text" id="f-edu-inst" value="${item?.institution || ""}" required class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Program / Qualification</label>
            <input type="text" id="f-edu-prog" value="${item?.program || ""}" required class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label class="block text-neutral-400 mb-1 font-medium">Period / Dates</label>
            <input type="text" id="f-edu-period" value="${item?.period || "Sep 2024 — Aug 2026"}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
          </div>
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Grades Achieved</label>
          <input type="text" id="f-edu-grades" value="${item?.grades || ""}" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500" />
        </div>
        <div>
          <label class="block text-neutral-400 mb-1 font-medium">Details & Dissertations (One per line)</label>
          <textarea id="f-edu-details" rows="3" class="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded outline-none focus:border-neutral-500">${item?.details.join("\n") || ""}</textarea>
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
      name: nameInput.value || "DEV PATEL",
      title: titleInput.value || "Applied Mathematics & Computer Science",
      email: emailInput.value || "devpatel.cs.math@gmail.com",
      location: locationInput.value || "Slough & London, UK",
      github: githubInput.value || "https://github.com",
      linkedin: linkedinInput.value || "https://linkedin.com",
      bio: bioInput.value,
    });

    alert("Profile settings saved successfully.");
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
    alert("Display limits updated and applied.");
  });

  // Reset to Defaults
  document.getElementById("reset-defaults-btn")?.addEventListener("click", () => {
    if (confirm("Reset all content, records, and settings to original defaults?")) {
      cms.resetToDefaults();
      renderAll();
      alert("Database reset to initial defaults.");
    }
  });

  // Export JSON
  document.getElementById("export-json-btn")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(cms.exportJSON());
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `dev_patel_portfolio_${Date.now()}.json`);
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
      alert("Please provide a GitHub Personal Access Token (PAT) with 'repo' scope to publish directly.");
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
      alert("Successfully committed updated data to GitHub repository! GitHub Pages build triggered.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[CMS GitHub Sync]", err);
      if (ghStatus) {
        ghStatus.textContent = `✕ Error: ${errMsg}`;
        ghStatus.className = "text-xs font-mono text-rose-400";
      }
      alert(`GitHub Publish Failed: ${errMsg}`);
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
          alert("Database snapshot imported successfully.");
        } catch {
          alert("Failed to parse JSON snapshot file.");
        }
      };
      reader.readAsText(file);
    }
  });
}
