# Agent Takeover Manual & Future-Proofing Operating Guide

**Document Purpose:** Immediate turnkey onboarding guide for incoming autonomous AI agents or software engineers taking over the Dev Patel Portfolio & Content Architecture Studio codebase.  
**Prerequisites:** Familiarity with modern TypeScript, Vite, Tailwind CSS v4, GSAP ScrollTrigger, and Lenis.

---

## 1. Quick Start & Environment Baseline

### Runtime Environment:
- **Node.js:** `v26.4.0` (or Node 20+ LTS)
- **Package Manager:** `npm 11.17.0` (Note: `pnpm` is not installed on this workstation)
- **Host OS:** Windows 11 (PowerShell terminal shell)
- **Default Port:** `3000` (configurable in `vite.config.ts`)

### Workspace & Git Topology:
* **Root Workspace:** `C:\Users\devar\Desktop\MY PORTFOLIO`
* **Remote Repository:** `https://github.com/dvrsh-13/My-Portfolio`
* **Active Working Branch:** `reverse_engineer_portfolio`
* **Worktree Location:** `C:\Users\devar\.gemini\antigravity\worktrees\MY PORTFOLIO\reverse_engineer_portfolio`
* **Commit History:**
  - `cea2024`: *"First draft"* (Initial Vite/TS/GSAP scaffolding)
  - `ec515c9`: *"Post-refinements, added CMS - merged with main"* (Monochromatic transformation, full-page vertical views, CMS Studio)

> [!IMPORTANT]
> **Branch Renaming Context:** In the final exchange of session 2, the user stated: *"just a heads up, the branch has be renamed as Main - you need not do anything, just reply yes"*. The code in `reverse_engineer_portfolio` is fully up-to-date and compiles cleanly. If the user asks you to align or merge `main`, perform a clean fast-forward merge from `reverse_engineer_portfolio`.

---

## 2. Development & Build Commands

Always run build and verification commands inside the project directory:

```powershell
# 1. Install dependencies (if setting up fresh):
npm install

# 2. Build for production (TypeScript check + Vite bundle):
npm run build

# 3. Launch live development server outside sandbox:
# Note: On Windows, use BypassSandbox: true and IsDaemon: true so the dev server binds cleanly to port 3000
npm run dev
```

### URLs to Access Once Running:
* **Live Portfolio Storyboard:** [http://localhost:3000/](http://localhost:3000/)
* **Content Architecture Studio:** [http://localhost:3000/cms.html](http://localhost:3000/cms.html)

---

## 3. Direct Panel Previews for Testing & Headless QA

The application includes built-in URL query parameters for instant panel jumps, bypassing the year ticker during automated testing or headless Chrome capture:

| URL Query | Target View Rendered | Purpose |
| :--- | :--- | :--- |
| `http://localhost:3000/?panel=about` | Chapter 01 (Profile & Focus) | Instant jump to profile without scrolling |
| `http://localhost:3000/?panel=education` | Chapter 02 (Academic Record) | Instant jump to education & competitions |
| `http://localhost:3000/?panel=experience` | Chapter 03 (Work Experience) | Instant jump to industrial placements |
| `http://localhost:3000/?panel=projects` | Chapter 04 (Computational Projects)| Instant jump to projects & hover portal |
| `http://localhost:3000/?panel=contact` | Chapter 06 (Direct Channels) | Instant jump to footer & contact |
| `http://localhost:3000/?menu=open` | Fullscreen Navigation Menu | Renders menu in open state |
| `http://localhost:3000/?view=experience&noload=1` | Dedicated Full-Page Experience View | Tests `#vertical-archive-view` directly |
| `http://localhost:3000/?view=projects&noload=1` | Dedicated Full-Page Projects View | Tests `#vertical-archive-view` for projects |
| `http://localhost:3000/?post=backtest-overfitting-notes&noload=1` | Dedicated Top-Slide Article View | Tests `#vertical-article-view` paper reader |

### Safe Headless Chrome Screenshot Snippet (Windows PowerShell):
On Windows, launching Chrome in headless mode fails with `Access is denied (0x5)` if trying to write directly to the working directory. Always route through `$env:TEMP`:

```powershell
$tmp = "$env:TEMP\test_preview.png"
Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList "--headless --disable-gpu --virtual-time-budget=2000 --window-size=1440,900 --screenshot=`"$tmp`" http://localhost:3000/?panel=projects" `
  -Wait -NoNewWindow
Move-Item $tmp ".\audit\screenshots\test_preview.png" -Force
```

---

## 4. The Six Golden Design Rules (Avoiding "AI Slop")

As an incoming agent, you must rigorously preserve the architectural integrity established through multiple rounds of user critique:

> [!CAUTION]
> **RULE 1: Never Add Rounded Pill Badges or Card Containers**  
> Do not wrap technology names or grades in pill buttons (`px-3 py-1 bg-neutral-800 rounded-full`). All tags must be formatted as quiet, inline typographic strings separated by middle dots (e.g., `Python · NumPy · Deflated Sharpe Ratio`).

> [!CAUTION]
> **RULE 2: Strictly Respect the Fluid Scaling Engine (`--scale`)**  
> Never inject arbitrary Tailwind margins or paddings like `m-6` or `p-8` into storyboard panels. All structural spacing must derive from `var(--scale)` and `var(--vg)` to preserve geometric ratios on ultrawide and 4K displays.

> [!CAUTION]
> **RULE 3: Do Not Introduce Pseudoterminal or Cyber Clutter**  
> The user explicitly rejected fake hacker tropes: do not add brackets (`[SYS.INIT]`, `[STATUS: CANDIDATE]`), animated blinking terminal cursors, or simulated HUD widgets.

> [!CAUTION]
> **RULE 4: Maintain Disciplined Typographic Roles**  
> - Monumental Titles & Chapter Heads: `Newsreader` (`font-serif`)  
> - Body Copy, Subtitles & Navigation: `Plus Jakarta Sans` (`font-sans`)  
> - Dates, Quantitative Metrics, Code & Clock: `JetBrains Mono` (`font-mono`)  
> Never use monospace for general body text or descriptions.

> [!CAUTION]
> **RULE 5: Keep the CMS Studio Strictly Decoupled from Public UI**  
> The public storyboard must remain pristine. Never add "CMS", "Admin", or "Edit" buttons to `index.html`. The CMS is accessible solely via direct navigation to `/cms.html`.

> [!CAUTION]
> **RULE 6: Never Revert Full-Page Views to Side Drawers**  
> The user rejected 40% side drawers. All "View All" actions and article links must open full-page vertical views (`#vertical-archive-view` and `#vertical-article-view`) with centered 56rem and 48rem reader containers.

---

## 5. Open Roadmap Items & Exact Next Steps

Below is the status of all open features and user directives awaiting future action:

### 1. Chapter 03 Transition Panel ("THE SYSTEMS")
- **Current State:** The transition section (`Panel 03`, `[data-transition-section]`) sits between Education and Experience. It currently contains a clean placeholder typographic split.
- **User Instruction:** *(for this I have better plans so wait on further instructions)*.
- **Action for Incoming Agent:** **DO NOT MODIFY THIS PANEL** unless the user explicitly provides their concept for it. Wait for their prompt.

### 2. Interactive Project Hover Viewport
- **Current State:** Hovering over projects in Chapter 04 reveals an interactive blueprint preview on the right. When the cursor is not hovering, the box is hidden with zero opacity.
- **User Instruction:** *"the interactive view could be something much better, we can decide on this later fully but yes cleanup for sure, also just hide the interactive view box when the user isnt hovering over any of the projects"*.
- **Action for Incoming Agent:** The hide-on-idle cleanup is complete. If the user prompts to enhance the interactive project viewport, propose high-craft visualizations (e.g. SVG frequency spectrograms, algorithmic lattice graphs, or interactive parameter sliders).

### 3. Worktree / Main Branch Alignment
- **Current State:** The root repository branch `main` has no commits, while all 32 implementation files reside on branch `reverse_engineer_portfolio` in the associated worktree.
- **User Instruction:** User noted that the branch has been renamed as `Main`.
- **Action for Incoming Agent:** When instructed, safely checkout `main` and fast-forward or merge `reverse_engineer_portfolio` to bring the root workspace into complete parity.

### 4. Production Deployment Checklist
When the user is ready to publish:
1. `npm run build` generates static assets in `dist/`.
2. Deploy to **Cloudflare Pages**, **Vercel**, or **Netlify** with single-page fallback routing.
3. Configure custom domain (e.g., `devpatel.design` or `devpatel.io`).
4. Ensure `cms.html` is either password-protected via basic HTTP auth at the edge or retained as a local offline curation engine.
