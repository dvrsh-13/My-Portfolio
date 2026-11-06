import { cms } from "./lib/cmsStore";
import type { ProjectItem, ExperienceItem, BlogItem, EducationItem } from "./data/portfolioData";
import { escapeHtml } from "./lib/utils";

type CurrentEditType = "project" | "experience" | "competition" | "blog" | "education";
let activeEditType: CurrentEditType = "project";
let activeEditId: string | null = null;

const CMS_AUTH_HASH =
  (import.meta.env.VITE_CMS_AUTH_HASH as string) ||
  "c6a54c0acd53bd4c8856b04e1043a921ccaafd824bb0df5dfd9ba59630b7347c";
const CMS_PASS_HASH =
  (import.meta.env.VITE_CMS_PASS_HASH as string) ||
  "755e362692395313f23227cfb5d518905e9e868d5c4984120cae327cc0a17252";
const CMS_SESSION_KEY = "folio_cms_session_token";
const CMS_LOCKOUT_KEY = "folio_cms_lockout_until";
const CMS_ATTEMPTS_KEY = "folio_cms_failed_attempts";

function getLockoutUntil(): number {
  try {
    return parseInt(sessionStorage.getItem(CMS_LOCKOUT_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function setLockoutUntil(ts: number) {
  try {
    sessionStorage.setItem(CMS_LOCKOUT_KEY, String(ts));
  } catch {
    // fallback
  }
}

function getFailedAttempts(): number {
  try {
    return parseInt(sessionStorage.getItem(CMS_ATTEMPTS_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function setFailedAttempts(count: number) {
  try {
    sessionStorage.setItem(CMS_ATTEMPTS_KEY, String(count));
  } catch {
    // fallback
  }
}

async function computeSha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isSessionAuthenticated(): boolean {
  const token = sessionStorage.getItem(CMS_SESSION_KEY);
  return Boolean(token && token.startsWith("auth_"));
}

function init() {
  setupAuthGate();
}

function setupAuthGate() {
  const barrier = document.getElementById("cms-login-barrier");
  const app = document.getElementById("cms-app");
  const form = document.getElementById("cms-login-form") as HTMLFormElement | null;
  const usernameInput = document.getElementById("cms-auth-username") as HTMLInputElement | null;
  const passwordInput = document.getElementById("cms-auth-password") as HTMLInputElement | null;
  const errorBox = document.getElementById("cms-login-error");
  const submitBtn = document.getElementById("cms-login-submit") as HTMLButtonElement | null;
  const logoutBtn = document.getElementById("cms-logout-btn");

  logoutBtn?.addEventListener("click", () => {
    sessionStorage.removeItem(CMS_SESSION_KEY);
    window.location.reload();
  });

  if (isSessionAuthenticated()) {
    if (barrier) barrier.style.display = "none";
    if (app) app.style.display = "block";
    setupTabs();
    renderAll();
    setupEventListeners();
    setupStickyHeaderCollapse();
    // Live synchronization across multiple open CMS Studio windows
    cms.subscribe(() => renderAll());
    return;
  }

  // Ensure app is hidden
  if (app) app.style.display = "none";
  if (barrier) barrier.style.display = "flex";

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const now = Date.now();
    const currentLockout = getLockoutUntil();
    if (now < currentLockout) {
      const waitSec = Math.ceil((currentLockout - now) / 1000);
      if (errorBox) {
        errorBox.textContent = `Too many failed attempts. Try again in ${waitSec}s.`;
        errorBox.classList.remove("hidden");
      }
      return;
    }

    const username = usernameInput?.value.trim() || "";
    const password = passwordInput?.value || "";

    if (!username || !password) {
      if (errorBox) {
        errorBox.textContent = "Please enter both username and password.";
        errorBox.classList.remove("hidden");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Verifying...</span>`;
    }

    try {
      const cleanPass = password.trim();
      const cleanUser = username.trim();

      // Check if input is a GitHub Personal Access Token for zero-hash cloud auth
      const candidateToken =
        cleanPass.startsWith("ghp_") || cleanPass.startsWith("github_pat_")
          ? cleanPass
          : cleanUser.startsWith("ghp_") || cleanUser.startsWith("github_pat_")
          ? cleanUser
          : null;

      if (candidateToken) {
        try {
          const ghRes = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `token ${candidateToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          if (ghRes.ok) {
            const ghUser = await ghRes.json();
            const allowedOwner = "dvrsh-13";
            const currentLogin = (ghUser.login || "").toLowerCase();

            if (currentLogin !== allowedOwner) {
              if (errorBox) {
                errorBox.textContent = `Access denied: GitHub account @${ghUser.login} is not authorised for this portfolio.`;
                errorBox.classList.remove("hidden");
              }
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Authenticate &amp; Unlock Studio</span><span>→</span>`;
              }
              return;
            }

            sessionStorage.setItem("folio_gh_token", candidateToken);
            sessionStorage.setItem(CMS_SESSION_KEY, `auth_gh_${ghUser.login}_${Date.now()}`);
            setFailedAttempts(0);
            setLockoutUntil(0);
            if (errorBox) errorBox.classList.add("hidden");
            if (barrier) barrier.style.display = "none";
            if (app) app.style.display = "block";

            setupTabs();
            renderAll();
            setupEventListeners();
            setupStickyHeaderCollapse();
            cms.subscribe(() => renderAll());
            showToast(`✓ Authenticated as GitHub user @${ghUser.login}`);
            return;
          }
        } catch (netErr) {
          console.warn("[GitHub Token Verification Failed]", netErr);
        }
      }

      const passHash = await computeSha256(cleanPass);
      const comboHash = await computeSha256(`${cleanUser}:${cleanPass}`);

      // Cryptographic verification against verified SHA-256 hash constants
      const isPasswordValid =
        passHash === CMS_PASS_HASH ||
        comboHash === CMS_AUTH_HASH;

      const normalizedUser = cleanUser.toLowerCase();
      const isUserValid = Boolean(normalizedUser && normalizedUser.length > 0);

      if (isPasswordValid && isUserValid) {
        sessionStorage.setItem(CMS_SESSION_KEY, `auth_${Date.now()}`);
        setFailedAttempts(0);
        setLockoutUntil(0);
        if (errorBox) errorBox.classList.add("hidden");
        if (barrier) barrier.style.display = "none";
        if (app) app.style.display = "block";

        setupTabs();
        renderAll();
        setupEventListeners();
        setupStickyHeaderCollapse();
        cms.subscribe(() => renderAll());
      } else {
        const attempts = getFailedAttempts() + 1;
        if (attempts >= 5) {
          setLockoutUntil(Date.now() + 30000);
          setFailedAttempts(0);
          if (errorBox) {
            errorBox.textContent = "Too many failed attempts. Access locked for 30 seconds.";
            errorBox.classList.remove("hidden");
          }
        } else {
          setFailedAttempts(attempts);
          if (errorBox) {
            errorBox.textContent = "Invalid administrator username or password.";
            errorBox.classList.remove("hidden");
          }
        }
        if (passwordInput) passwordInput.value = "";
        passwordInput?.focus();
      }
    } catch (err) {
      console.error("[CMS Auth Error]", err);
      if (errorBox) {
        errorBox.textContent = "Authentication verification error. Please retry.";
        errorBox.classList.remove("hidden");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Authenticate &amp; Unlock Studio</span><span>→</span>`;
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function renderAll() {
  renderCMSProjects();
  renderCMSExperience();
  renderCMSCompetitions();
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
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("border-white", "text-white", "font-medium");
      btn.classList.remove("border-transparent", "text-neutral-400", "font-normal");
      btn.setAttribute("aria-selected", "true");

      tabPanels.forEach((p) => {
        p.classList.toggle("hidden", p.dataset.tabPanel !== target);
      });
    });
  });

  const tabNav = document.getElementById("cms-tabs-nav");
  tabNav?.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const btnArray = Array.from(tabBtns);
    const currentIndex = btnArray.findIndex((b) => b === document.activeElement);
    if (currentIndex === -1) return;
    e.preventDefault();
    const nextIndex =
      e.key === "ArrowRight"
        ? (currentIndex + 1) % btnArray.length
        : (currentIndex - 1 + btnArray.length) % btnArray.length;
    btnArray[nextIndex].focus();
    btnArray[nextIndex].click();
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
  toast.className = `fixed bottom-6 right-6 z-[150] px-5 py-3 rounded-xl font-sans text-xs font-medium shadow-2xl transition-all duration-300 flex items-center gap-2 ${
    isError ? "bg-rose-950 text-rose-200 border border-rose-800" : "bg-neutral-100 text-neutral-900 shadow-white/10"
  }`;

  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    if (toast) {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
    }
  }, 3500);
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

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="border border-dashed border-neutral-800 p-8 rounded-xl text-center space-y-2 bg-[#131316]/50">
        <p class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">No Projects Currently Stored</p>
        <p class="font-sans text-xs text-neutral-500 font-light">Click &ldquo;+ Add New Project&rdquo; above to create a record or &ldquo;Reset Defaults&rdquo; in the top bar to reload standard projects.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects
    .map(
      (p) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${escapeHtml(p.title)}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            p.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${p.featured ? "● Storyboard Featured" : "Archive Only"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${escapeHtml(p.subtitle)} · <span class="text-neutral-500">${escapeHtml(p.category)} (${escapeHtml(p.year)})</span></p>
        <p class="font-sans text-sm text-neutral-300 font-light leading-relaxed">${escapeHtml(p.description)}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-proj="${escapeHtml(p.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-proj="${escapeHtml(p.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${p.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${p.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-proj="${escapeHtml(p.id)}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
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
      if (id && confirm("Delete this project from your database?")) {
        cms.deleteProject(id);
        renderCMSProjects();
      }
    });
  });
}

// -------------------------------------------------------------
// 2. Experience CMS (Industrial Placements)
// -------------------------------------------------------------
function renderCMSExperience() {
  const container = document.getElementById("cms-experience-list");
  const indicator = document.getElementById("experience-limit-indicator");
  if (!container) return;

  const exp = cms.getAllExperience().filter((e) => e.category === "work");
  const limit = cms.getSettings().featuredExperienceLimit;
  const featuredCount = exp.filter((e) => e.featured).length;

  if (indicator) {
    indicator.textContent = `Showing ${featuredCount} of ${limit} maximum on main storyboard · ${exp.length - featuredCount} stored in full archive`;
  }

  if (exp.length === 0) {
    container.innerHTML = `
      <div class="border border-dashed border-neutral-800 p-8 rounded-xl text-center space-y-2 bg-[#131316]/50">
        <p class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">No Work Experience Records Stored</p>
        <p class="font-sans text-xs text-neutral-500 font-light">Click &ldquo;+ Add Experience&rdquo; above to register an industrial placement or software engineering role.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = exp
    .map(
      (e) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${escapeHtml(e.company)}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            e.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${e.featured ? "● Storyboard Featured" : "Archive Only"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${escapeHtml(e.role)} · <span class="text-neutral-500">${escapeHtml(e.location)} (${escapeHtml(e.period)})</span></p>
        <p class="font-sans text-sm text-neutral-300 font-light leading-relaxed">${escapeHtml(e.bulletPoints?.[0] || e.description)}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-exp="${escapeHtml(e.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-exp="${escapeHtml(e.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${e.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${e.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-exp="${escapeHtml(e.id)}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
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
      if (id && confirm("Delete this experience entry?")) {
        cms.deleteExperience(id);
        renderCMSExperience();
      }
    });
  });
}

// -------------------------------------------------------------
// 3. Competitions CMS (Olympiads & Hackathons)
// -------------------------------------------------------------
function renderCMSCompetitions() {
  const container = document.getElementById("cms-competitions-list");
  const indicator = document.getElementById("competitions-count-indicator");
  if (!container) return;

  const comps = cms.getAllExperience().filter((e) => e.category === "competition");

  if (indicator) {
    indicator.textContent = `${comps.length} competition & olympiad records · Rendered in Chapter 02 (Academic Record & Competitions)`;
  }

  if (comps.length === 0) {
    container.innerHTML = `
      <div class="border border-dashed border-neutral-800 p-8 rounded-xl text-center space-y-2 bg-[#131316]/50">
        <p class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">No Competitions Currently Stored</p>
        <p class="font-sans text-xs text-neutral-500 font-light">Click &ldquo;+ Add Competition&rdquo; above to register an academic competition, modelling challenge, or hackathon.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = comps
    .map(
      (c) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${escapeHtml(c.company)}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            c.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${c.featured ? "● Chapter 02 Active" : "Archived"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">
          <span class="text-white font-medium">${escapeHtml(c.role)}</span> · <span class="text-neutral-500">${escapeHtml(c.location || "UK")} (${escapeHtml(c.period)})</span>
        </p>
        <p class="font-sans text-sm text-neutral-300 font-light leading-relaxed">${escapeHtml(c.bulletPoints?.[0] || c.description)}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-comp="${escapeHtml(c.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-comp="${escapeHtml(c.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${c.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${c.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-comp="${escapeHtml(c.id)}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll("[data-edit-comp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit-comp");
      if (id) openEditModal("competition", id);
    });
  });

  container.querySelectorAll("[data-toggle-comp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle-comp");
      if (id) {
        cms.toggleExperienceFeatured(id);
        renderCMSCompetitions();
        showToast("Competition visibility toggled");
      }
    });
  });

  container.querySelectorAll("[data-delete-comp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-delete-comp");
      if (id && confirm("Delete this competition record?")) {
        cms.deleteExperience(id);
        renderCMSCompetitions();
        showToast("Competition record deleted");
      }
    });
  });
}

// -------------------------------------------------------------
// 4. Blogs CMS
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

  if (blogs.length === 0) {
    container.innerHTML = `
      <div class="border border-dashed border-neutral-800 p-8 rounded-xl text-center space-y-2 bg-[#131316]/50">
        <p class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">No Research Dispatches Stored</p>
        <p class="font-sans text-xs text-neutral-500 font-light">Click &ldquo;+ Add New Dispatch&rdquo; above to write an essay, research note, or working paper.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = blogs
    .map(
      (b) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${escapeHtml(b.title)}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            b.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${b.featured ? "● Storyboard Featured" : "Archive Only"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-400 font-light">${escapeHtml(b.date)} · <span class="text-neutral-500">${b.tags.map((t) => escapeHtml(t)).join(", ")}</span></p>
        <p class="font-sans text-sm text-neutral-300 font-light leading-relaxed">${escapeHtml(b.excerpt)}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-blog="${escapeHtml(b.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-blog="${escapeHtml(b.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${b.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${b.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-blog="${escapeHtml(b.id)}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
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
      if (id && confirm("Delete this dispatch?")) {
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

  if (edu.length === 0) {
    container.innerHTML = `
      <div class="border border-dashed border-neutral-800 p-8 rounded-xl text-center space-y-2 bg-[#131316]/50">
        <p class="font-sans text-xs uppercase tracking-widest text-neutral-400 font-medium">No Academic Records Stored</p>
        <p class="font-sans text-xs text-neutral-500 font-light">Click &ldquo;+ Add Academic Record&rdquo; above to register an institution, degree, or coursework.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = edu
    .map(
      (item) => `
    <div class="border border-neutral-800 hover:border-neutral-700 p-6 bg-[#131316] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="font-serif text-xl font-normal text-white">${escapeHtml(item.institution)}</h3>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded border ${
            item.featured
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-medium"
              : "border-neutral-800 text-neutral-500"
          }">
            ${item.featured ? "● Storyboard Featured" : "Archive Only"}
          </span>
        </div>
        <p class="font-sans text-xs text-neutral-300 font-medium">${escapeHtml(item.program)} · <span class="text-neutral-400 font-light">${escapeHtml(item.grades)}</span></p>
        <p class="font-mono text-xs text-neutral-500">${escapeHtml(item.period)}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0 font-sans text-xs">
        <button data-edit-edu="${escapeHtml(item.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer">
          Edit
        </button>
        <button data-toggle-edu="${escapeHtml(item.id)}" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700 ${item.featured ? "text-amber-300 hover:text-amber-200" : "text-neutral-300 hover:text-white"} transition-colors cursor-pointer">
          ${item.featured ? "Unfeature" : "Feature"}
        </button>
        <button data-delete-edu="${escapeHtml(item.id)}" class="px-3.5 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer">
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

  container.querySelectorAll("[data-toggle-edu]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle-edu");
      if (id) {
        cms.toggleEducationFeatured(id);
        renderCMSEducation();
      }
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
// 6. Modal Record Editor (Safe DOM properties, Accessible labels)
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
          <label for="f-proj-title" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Project Title</label>
          <input type="text" id="f-proj-title" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="f-proj-sub" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Subtitle</label>
            <input type="text" id="f-proj-sub" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label for="f-proj-cat" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Category</label>
            <input type="text" id="f-proj-cat" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label for="f-proj-year" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Year</label>
          <input type="text" id="f-proj-year" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-mono" />
        </div>
        <div>
          <label for="f-proj-desc" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Description</label>
          <textarea id="f-proj-desc" rows="3" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
        <div>
          <label for="f-proj-metrics" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Key Finding / Metric (One per line)</label>
          <textarea id="f-proj-metrics" rows="2" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
        <div>
          <label for="f-proj-code" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Python / Code Snippet (Optional)</label>
          <textarea id="f-proj-code" rows="4" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-white font-mono text-xs rounded-xl outline-none transition-all placeholder:text-neutral-600 resize-y"></textarea>
        </div>
        <div>
          <label for="f-proj-tags" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Tags (Comma-separated)</label>
          <input type="text" id="f-proj-tags" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
      </div>
    `;

    // Safe assignment via DOM property setters
    (document.getElementById("f-proj-title") as HTMLInputElement).value = item?.title || "";
    (document.getElementById("f-proj-sub") as HTMLInputElement).value = item?.subtitle || "";
    (document.getElementById("f-proj-cat") as HTMLInputElement).value = item?.category || "Quantitative Systems";
    (document.getElementById("f-proj-year") as HTMLInputElement).value = item?.year || "2026";
    (document.getElementById("f-proj-desc") as HTMLTextAreaElement).value = item?.description || "";
    (document.getElementById("f-proj-metrics") as HTMLTextAreaElement).value = item?.metrics ? item.metrics.join("\n") : "";
    (document.getElementById("f-proj-code") as HTMLTextAreaElement).value = item?.codeSnippet || "";
    (document.getElementById("f-proj-tags") as HTMLInputElement).value = item?.tags ? item.tags.join(", ") : "Python, NumPy";
  } else if (type === "experience") {
    const item = id ? cms.getAllExperience().find((e) => e.id === id) : null;
    titleEl.textContent = item ? "Edit Work Placement" : "New Work Placement";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="f-exp-company" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Company Name</label>
            <input type="text" id="f-exp-company" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label for="f-exp-location" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Location</label>
            <input type="text" id="f-exp-location" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="f-exp-role" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Role / Placement Title</label>
            <input type="text" id="f-exp-role" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label for="f-exp-period" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Period / Dates</label>
            <input type="text" id="f-exp-period" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label for="f-exp-desc" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Narrative Summary</label>
          <textarea id="f-exp-desc" rows="2" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
        <div>
          <label for="f-exp-bullets" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Bullet Points & Contributions (One per line)</label>
          <textarea id="f-exp-bullets" rows="4" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
      </div>
    `;

    (document.getElementById("f-exp-company") as HTMLInputElement).value = item?.company || "";
    (document.getElementById("f-exp-location") as HTMLInputElement).value = item?.location || "London, UK";
    (document.getElementById("f-exp-role") as HTMLInputElement).value = item?.role || "";
    (document.getElementById("f-exp-period") as HTMLInputElement).value = item?.period || "2026";
    (document.getElementById("f-exp-desc") as HTMLTextAreaElement).value = item?.description || "";
    (document.getElementById("f-exp-bullets") as HTMLTextAreaElement).value = item?.bulletPoints ? item.bulletPoints.join("\n") : "";
  } else if (type === "competition") {
    const item = id ? cms.getAllExperience().find((e) => e.id === id) : null;
    titleEl.textContent = item ? "Edit Competition Record" : "New Competition Record";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="f-comp-company" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Competition / Organisation</label>
            <input type="text" id="f-comp-company" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label for="f-comp-role" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Award / Standing / Title</label>
            <input type="text" id="f-comp-role" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="f-comp-period" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Year / Season</label>
            <input type="text" id="f-comp-period" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label for="f-comp-loc" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Location / Scope</label>
            <input type="text" id="f-comp-loc" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label for="f-comp-desc" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Narrative Summary (Headline highlight in Chapter 02)</label>
          <textarea id="f-comp-desc" rows="2" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
        <div>
          <label for="f-comp-bullets" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Key Contributions &amp; Algorithmic Details (One per line)</label>
          <textarea id="f-comp-bullets" rows="3" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
      </div>
    `;

    (document.getElementById("f-comp-company") as HTMLInputElement).value = item?.company || "";
    (document.getElementById("f-comp-role") as HTMLInputElement).value = item?.role || "";
    (document.getElementById("f-comp-period") as HTMLInputElement).value = item?.period || "2026";
    (document.getElementById("f-comp-loc") as HTMLInputElement).value = item?.location || "UK";
    (document.getElementById("f-comp-desc") as HTMLTextAreaElement).value = item?.description || "";
    (document.getElementById("f-comp-bullets") as HTMLTextAreaElement).value = item?.bulletPoints ? item.bulletPoints.join("\n") : "";
  } else if (type === "blog") {
    const item = id ? cms.getAllBlogs().find((b) => b.id === id) : null;
    titleEl.textContent = item ? "Edit Research Dispatch" : "New Research Dispatch";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div>
          <label for="f-blog-title" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Article Title</label>
          <input type="text" id="f-blog-title" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div>
          <label for="f-blog-date" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Publication Date</label>
          <input type="text" id="f-blog-date" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div>
          <label for="f-blog-tags" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Tags (Comma-separated)</label>
          <input type="text" id="f-blog-tags" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div>
          <label for="f-blog-excerpt" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Abstract / Excerpt (Lead)</label>
          <textarea id="f-blog-excerpt" rows="2" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
        <div>
          <label for="f-blog-content" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Full Essay Content (Double return for paragraphs)</label>
          <textarea id="f-blog-content" rows="6" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-white font-sans text-xs rounded-xl outline-none transition-all placeholder:text-neutral-600 leading-relaxed resize-y"></textarea>
        </div>
      </div>
    `;

    (document.getElementById("f-blog-title") as HTMLInputElement).value = item?.title || "";
    (document.getElementById("f-blog-date") as HTMLInputElement).value = item?.date || "2026";
    (document.getElementById("f-blog-tags") as HTMLInputElement).value = item?.tags ? item.tags.join(", ") : "Quantitative Finance, Statistics";
    (document.getElementById("f-blog-excerpt") as HTMLTextAreaElement).value = item?.excerpt || "";
    (document.getElementById("f-blog-content") as HTMLTextAreaElement).value = item?.content || "";
  } else if (type === "education") {
    const item = id ? cms.getEducation().find((e) => e.id === id) : null;
    titleEl.textContent = item ? "Edit Academic Record" : "New Academic Record";
    if (featuredCheckbox) featuredCheckbox.checked = item ? item.featured : true;

    fieldsContainer.innerHTML = `
      <div class="space-y-4 font-sans text-xs">
        <div>
          <label for="f-edu-inst" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Institution Name</label>
          <input type="text" id="f-edu-inst" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="f-edu-prog" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Programme / Qualification</label>
            <input type="text" id="f-edu-prog" required class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
          <div>
            <label for="f-edu-period" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Period / Dates</label>
            <input type="text" id="f-edu-period" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
          </div>
        </div>
        <div>
          <label for="f-edu-grades" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Grades Achieved</label>
          <input type="text" id="f-edu-grades" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] px-3.5 py-2.5 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans" />
        </div>
        <div>
          <label for="f-edu-details" class="block font-sans text-xs uppercase tracking-wider text-neutral-300 font-medium mb-1.5">Details & Dissertations (One per line)</label>
          <textarea id="f-edu-details" rows="3" class="w-full bg-[#161616] border border-neutral-800 focus:border-white focus:bg-[#1c1c1c] p-3 text-xs text-white rounded-xl outline-none transition-all placeholder:text-neutral-600 font-sans resize-y"></textarea>
        </div>
      </div>
    `;

    (document.getElementById("f-edu-inst") as HTMLInputElement).value = item?.institution || "";
    (document.getElementById("f-edu-prog") as HTMLInputElement).value = item?.program || "";
    (document.getElementById("f-edu-period") as HTMLInputElement).value = item?.period || "Sep 2024 — Aug 2026";
    (document.getElementById("f-edu-grades") as HTMLInputElement).value = item?.grades || "";
    (document.getElementById("f-edu-details") as HTMLTextAreaElement).value = item?.details ? item.details.join("\n") : "";
  }

  modal.showModal();
}

function handleFormSubmit() {
  const form = document.getElementById("cms-editor-form") as HTMLFormElement | null;
  if (form && !form.reportValidity()) {
    return;
  }

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
    const period = (document.getElementById("f-exp-period") as HTMLInputElement)?.value || "";
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
  } else if (activeEditType === "competition") {
    const company = (document.getElementById("f-comp-company") as HTMLInputElement)?.value;
    const role = (document.getElementById("f-comp-role") as HTMLInputElement)?.value;
    const location = (document.getElementById("f-comp-loc") as HTMLInputElement)?.value || "UK";
    const period = (document.getElementById("f-comp-period") as HTMLInputElement)?.value || "2026";
    const description = (document.getElementById("f-comp-desc") as HTMLTextAreaElement)?.value || "";
    const bulletsStr = (document.getElementById("f-comp-bullets") as HTMLTextAreaElement)?.value || "";

    const bulletPoints = bulletsStr.split("\n").map((s) => s.trim()).filter(Boolean);

    if (!company || !role) return;

    if (activeEditId) {
      cms.updateExperience(activeEditId, {
        company,
        role,
        location,
        period,
        description,
        bulletPoints,
        featured: isFeatured,
        category: "competition",
      });
    } else {
      cms.addExperience({
        id: "comp-" + Date.now(),
        company,
        role,
        location,
        period,
        description,
        bulletPoints,
        featured: isFeatured,
        category: "competition",
      });
    }
    renderCMSCompetitions();
  } else if (activeEditType === "blog") {
    const title = (document.getElementById("f-blog-title") as HTMLInputElement)?.value;
    const date = (document.getElementById("f-blog-date") as HTMLInputElement)?.value || "2026";
    const tagsStr = (document.getElementById("f-blog-tags") as HTMLInputElement)?.value || "";
    const excerpt = (document.getElementById("f-blog-excerpt") as HTMLTextAreaElement)?.value || "";
    const content = (document.getElementById("f-blog-content") as HTMLTextAreaElement)?.value || "";

    const tags = tagsStr.split(",").map((s) => s.trim()).filter(Boolean);

    if (!title) return;

    if (activeEditId) {
      cms.updateBlog(activeEditId, {
        title,
        date,
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
  showToast("Record successfully updated");
}

function setupStickyHeaderCollapse() {
  const stickyBar = document.getElementById("cms-sticky-bar");
  if (!stickyBar) return;

  const onScroll = () => {
    stickyBar.classList.toggle("shadow-2xl", window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupEventListeners() {
  // Modal buttons
  document.getElementById("add-project-btn")?.addEventListener("click", () => openEditModal("project"));
  document.getElementById("add-experience-btn")?.addEventListener("click", () => openEditModal("experience"));
  document.getElementById("add-competition-btn")?.addEventListener("click", () => openEditModal("competition"));
  document.getElementById("add-blog-btn")?.addEventListener("click", () => openEditModal("blog"));
  document.getElementById("add-education-btn")?.addEventListener("click", () => openEditModal("education"));

  const modal = document.getElementById("cms-editor-modal") as HTMLDialogElement | null;
  document.getElementById("modal-close-btn")?.addEventListener("click", () => {
    modal?.close();
  });
  document.getElementById("modal-cancel-btn")?.addEventListener("click", () => {
    modal?.close();
  });

  // Attach submit listeners to form and submit buttons for guaranteed event capture
  const editorForm = document.getElementById("cms-editor-form") as HTMLFormElement | null;
  editorForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  document.getElementById("modal-submit-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });
  document.getElementById("modal-save-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  // Unified save for Profile, Candidate Settings, and Storyboard Display Limits
  const handleSaveAllSettings = (isGlobalSave = false) => {
    const name = (document.getElementById("setting-name") as HTMLInputElement)?.value;
    const title = (document.getElementById("setting-title") as HTMLInputElement)?.value;
    const email = (document.getElementById("setting-email") as HTMLInputElement)?.value;
    const location = (document.getElementById("setting-location") as HTMLInputElement)?.value;
    const github = (document.getElementById("setting-github") as HTMLInputElement)?.value;
    const linkedin = (document.getElementById("setting-linkedin") as HTMLInputElement)?.value;
    const bio = (document.getElementById("setting-bio") as HTMLTextAreaElement)?.value;

    const projLimitInput = document.getElementById("setting-proj-limit") as HTMLInputElement | null;
    const expLimitInput = document.getElementById("setting-exp-limit") as HTMLInputElement | null;
    const blogLimitInput = document.getElementById("setting-blog-limit") as HTMLInputElement | null;

    const featuredProjectsLimit = Math.max(1, Math.min(10, parseInt(projLimitInput?.value || "3", 10) || 3));
    const featuredExperienceLimit = Math.max(1, Math.min(10, parseInt(expLimitInput?.value || "3", 10) || 3));
    const featuredBlogsLimit = Math.max(1, Math.min(10, parseInt(blogLimitInput?.value || "3", 10) || 3));

    cms.updateSettings({
      ...(name !== undefined ? { name } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(github !== undefined ? { github } : {}),
      ...(linkedin !== undefined ? { linkedin } : {}),
      ...(bio !== undefined ? { bio } : {}),
      featuredProjectsLimit,
      featuredExperienceLimit,
      featuredBlogsLimit,
    });

    renderCMSProjects();
    renderCMSExperience();
    renderCMSBlogs();

    if (isGlobalSave) {
      showToast("✓ All CMS Changes Saved");
    } else {
      showToast("✓ Settings & Display Bounds Saved");
    }
  };

  document.getElementById("save-profile-btn")?.addEventListener("click", () => handleSaveAllSettings(false));
  document.getElementById("save-limits-btn")?.addEventListener("click", () => handleSaveAllSettings(false));
  document.getElementById("cms-persistent-save-btn")?.addEventListener("click", () => handleSaveAllSettings(true));

  // Reset defaults
  document.getElementById("reset-defaults-btn")?.addEventListener("click", () => {
    if (confirm("Reset all content back to factory defaults? This clears custom local changes.")) {
      cms.resetToDefaults();
      renderAll();
      showToast("Folio data reset to defaults");
    }
  });

  // Export JSON
  document.getElementById("export-json-btn")?.addEventListener("click", () => {
    const jsonStr = cms.exportJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✓ Exported JSON database snapshot");
  });

  // Export TypeScript file
  document.getElementById("export-ts-btn")?.addEventListener("click", () => {
    const tsStr = cms.exportPortfolioDataTS();
    const blob = new Blob([tsStr], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolioData.ts";
    a.click();
    URL.revokeObjectURL(url);
    showToast("✓ Downloaded portfolioData.ts source file");
  });

  // GitHub Direct Sync
  const ghRepoInput = document.getElementById("gh-sync-repo") as HTMLInputElement;
  const ghBranchInput = document.getElementById("gh-sync-branch") as HTMLInputElement;
  const ghTokenInput = document.getElementById("gh-sync-token") as HTMLInputElement;
  const ghStatus = document.getElementById("gh-sync-status");

  const savedToken = sessionStorage.getItem("folio_gh_token");
  if (savedToken && ghTokenInput) ghTokenInput.value = savedToken;
  const savedRepo = localStorage.getItem("folio_gh_repo");
  if (savedRepo && ghRepoInput) ghRepoInput.value = savedRepo;

  document.getElementById("gh-publish-btn")?.addEventListener("click", async () => {
    const token = ghTokenInput?.value.trim();
    const repo = ghRepoInput?.value.trim() || "dvrsh-13/My-Portfolio";
    const branch = ghBranchInput?.value.trim() || "main";

    if (!token) {
      showToast("Please provide a GitHub Personal Access Token (PAT) with repo scope", true);
      return;
    }

    sessionStorage.setItem("folio_gh_token", token);
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

      if (!getRes.ok && getRes.status !== 404) {
        const errJson = await getRes.json().catch(() => ({}));
        throw new Error(errJson.message || `GitHub API error: ${getRes.status} ${getRes.statusText}`);
      }

      let currentSha = "";
      if (getRes.ok) {
        const fileData = await getRes.json();
        currentSha = fileData.sha;
      }

      // 2. Base64 encode TypeScript content with modern TextEncoder
      const tsContent = cms.exportPortfolioDataTS();
      const bytes = new TextEncoder().encode(tsContent);
      let binStr = "";
      for (let i = 0; i < bytes.length; i++) {
        binStr += String.fromCharCode(bytes[i]);
      }
      const base64Content = btoa(binStr);

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
        const errJson = await putRes.json().catch(() => ({}));
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
