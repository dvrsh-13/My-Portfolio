# Monochromatic Architectural Audit & Diagnostic Report
**Reference:** [khanhnguyen.design](https://khanhnguyen.design/) Philosophy vs. Vibecoded Technical Clutter  
**Target:** Dev Patel — Computer Science & Applied Mathematics Portfolio  
**Status:** Audit Complete · Pending User Approval for Execution on Chapters 02–06 & Drawers

---

## 1. Summary of Completed Actions (Strict Scope)
1. **Minimal Loading Screen:** Replaced the animated timeline ticker with a serene, distraction-free loading screen featuring a hairline expansion bar and smooth GSAP dissolution.
2. **Hero Section (`Panel 00`):**
   - Stripped `STATUS: Degree Apprenticeship Candidate`.
   - Stripped `DISCIPLINE: Computer Science & Applied Mathematics`.
   - Stripped all technology pill badges (`Python`, `Scikit-Learn`, `PostgreSQL`, `Docker`, `LaTeX`).
   - Stripped `Industry Placements: BP · Cognizant...` footer rail.
   - Migrated the long intro sentence to Chapter 01.
   - Refined into monumental serif typography (`DEV PATEL`) with a single quiet editorial subtitle: `Applied Mathematics & Computer Science`.
3. **Chapter 01 (`Panel 01 - Profile & Focus`):**
   - Eliminated the redundant `Candidate Dossier` card (removing premature duplication with Chapter 02).
   - Set the core bio lead in natural, spacious editorial typography.
   - Replaced badge pills with a pure typographic 3-column focus layout (Applied Mathematics, Software Engineering, Data & Predictive Modelling).
4. **Footer:** Removed `"Designed with Monochromatic Architectural Principles"`.
5. **Content Studio (`/cms.html` & `src/cms.ts`):** Complete rehaul into an editorial curation engine with visible storyboard display limits (default: 3 max) and clear indicators of live vs. drawer items.

---

## 2. Comprehensive Diagnostic of Remaining Sections (Awaiting User Consultation)

### A. Chapter 02: Academic Record & Competitions (`#education`)
- **Issue 1: Pill Badge Artifact (`AAA Achieved`).** The `<span class="... rounded ...">AAA Achieved</span>` uses high-contrast pill badge styling that disrupts editorial flow.
  - *Proposed Solution:* Set `Achieved AAA` as quiet, inline tabular text alongside subjects (`Computer Science, Mathematics, Further Mathematics — Achieved AAA`).
- **Issue 2: Boxy Widget Containers for Competitions.** The `M3 Challenge` and `Lockheed Martin Code Quest` are boxed inside `bg-neutral-900/60 border border-neutral-800` cards, making them look like dashboard widgets.
  - *Proposed Solution:* Remove card boxes. Use pure typographic grid layout with delicate hairline top dividers, matching the editorial rhythm of the academic rows.
- **Issue 3: GCSEs Crammed into the Footer Rail.** Squeezing GCSE grades into the bottom navigation bar is an awkward shortcut.
  - *Proposed Solution:* Integrate GCSEs cleanly as a quiet third academic record under Upton Court and Cambridge STEM Smart, leaving the bottom bar purely for navigation.
- **Issue 4: Jargon-Heavy Bullet Points.** Overly dense explanations of XGBoost and Monte Carlo in the competition summaries.
  - *Proposed Solution:* Refine to a single punchy editorial line with competition placement highlighted naturally.

---

### B. Midpoint Transition Panel ("THE SYSTEMS")
- **Issue 1: Fake HUD / Terminal Artifact.** The card currently revealed when "THE" and "SYSTEMS" split apart looks like a simulated terminal card (`N = 520`, `In-Sample Sharpe: 0.57 → Out-of-Sample: -0.28`). This is a classic "vibecoded" trope.
  - *Proposed Solution:* Replace the text-heavy card with an authentic, minimalist architectural or algorithmic graphic (such as a clean, high-precision SVG vector representing frequency noise decomposition or a minimal coordinate lattice), letting the monumental typography speak for itself.

---

### C. Chapter 03: Work Experience & Placements (`#experience`)
- **Issue 1: Resume Bullet Points on Main Stage.** Rendering raw bullet points on the horizontal track feels like pasting a PDF resume onto a website.
  - *Proposed Solution:* The main horizontal storyboard should display only the Company, Location, Role, Period, and a single, beautifully written narrative sentence. Full bullet points should be reserved exclusively for the slide-over drawer.
- **Issue 2: Redundant Footer Label.** `Sectors: Energy (BP) · Machine Learning (Cognizant) · Defense (Lockheed Martin) · Rail (HS2)`. Deeply redundant since the companies are already displayed prominently above.
  - *Proposed Solution:* Remove footer sectors label entirely; keep only clean location marker and next chapter link.
- **Issue 3: Compressed Spacing.** The entries currently use tight padding (`pb-4`).
  - *Proposed Solution:* Expand spacing to generous `py-8` intervals with subtle hairline dividers, giving each placement breathing room.

---

### D. Chapter 04: Projects & Mathematical Modelling (`#projects`)
- **Issue 1: Pill Badges in Hover Preview.** The preview card currently renders tags as pill buttons (`px-2 py-0.5 bg-neutral-800 rounded`).
  - *Proposed Solution:* Format tags as a quiet typographic row (`Python · NumPy · Deflated Sharpe Ratio`) with no background pill boxes.
- **Issue 2: Redundant Meta Headers in Hover Portal.** Labels like `Interactive Preview · Real-time`, `Key Finding:`, `Quantitative & Algorithmic Details`.
  - *Proposed Solution:* Strip fake UI meta labels. Show clean project title, concise methodology, and empirical result without artificial brackets.
- **Issue 3: Footer Clutter.** `Methodology: Deflated Sharpe Ratio · Fourier Transforms · Monte Carlo` in the footer.
  - *Proposed Solution:* Remove footer methodology string entirely.

---

### E. Chapter 05: Research Notes & Dispatches (`#blog`)
- **Issue 1: Verbose Uppercase Header Tags.** Uppercase categories like `QUANTITATIVE FINANCE · STATISTICS · PYTHON` directly above titles compete visually with the headlines.
  - *Proposed Solution:* Simplify to a quiet, single category and date in clean typography.
- **Issue 2: Footer Clutter.** `Subjects: Overfitting & Backtesting · Autonomous Systems (EPQ)...` in footer rail.
  - *Proposed Solution:* Remove footer subjects label entirely.

---

### F. Chapter 06: Direct Contact & Channels (`#contact`)
- **Issue 1: Redundant Meta Subtitles.** `Get In Touch` stacked directly on top of `LET’S CONNECT`, and `Direct Inquiries:` stacked on top of the email address.
  - *Proposed Solution:* Remove redundant subheads. Let the monumental headline and email address stand on their own.
- **Issue 2: Redundant Apprenticeship Paragraph.** Repeating the apprenticeship pitch a third time in the footer dilutes impact.
  - *Proposed Solution:* A single, elegant closing note and direct links (`GitHub`, `LinkedIn`, `Email`).

---

### G. Slide-Over Archive Drawers (`#archive-modal`)
- **Issue 1: Repetitive Role Titles.** In the Experience drawer, every entry has `Engineering & Operations Work Experience`, `Machine Learning Work Experience`, etc.
  - *Proposed Solution:* Use the authentic role title (e.g. `Systems Engineering Placement`, `Machine Learning Intern`, `High-Speed Rail Team Lead`).
- **Issue 2: Raw Code Snippet Formatting.** In the Projects drawer, raw Python code creates awkward horizontal scrollbars.
  - *Proposed Solution:* Streamline code presentation into a sleek, clean, minimal mathematical definition block with syntax highlighting or typographic styling.
- **Issue 3: Pill Badges in Drawer Cards.** Tags in the drawer still use rounded pill badge boxes.
  - *Proposed Solution:* Convert to clean inline text tags.
