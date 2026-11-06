# Devarsh Vinod — Portfolio

A minimalist, high-performance portfolio website. Built with a dual-axis continuous storyboard and dedicated vertical reading views.

---

## Tech Stack

- **Core Engine**: [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation & Motion**: [GSAP (GreenSock)](https://gsap.com/) & ScrollTrigger
- **Smooth Scrolling**: [@studio-freight/lenis](https://github.com/darkroomengineering/lenis)

---

## Key Features

- **Dual-Axis Storyboard**: Smooth horizontal virtual scroll on desktop translating wheel input into lateral traversal, paired with a midpoint kinetic expander. Seamlessly refolds into a tactile vertical layout on mobile devices.
- **Dedicated Vertical Reading Views**: Full-page pull-down reading overlays for technical working papers and dedicated detail screens for computational projects.
- **Dynamic Theme Synchronisation**: Fixed vertical navigation rail that dynamically updates theme colours, timestamps, and chapter indicators based on active screen position.
- **Subtle Magnetic Snapping**: Fluid, directional snapping that gently aligns chapters as you navigate across the storyboard.
- **Zero-Item Graceful Handling**: Built-in empty states across all views to cleanly handle in-progress projects, working papers, or competition updates.
- **Performance & Accessibility**: Semantic HTML5, full keyboard navigation support, high-contrast typography, and strict British English content standards.

---

## Quickstart & Template Guide

### Prerequisites
- Node.js $\ge$ 18.0.0
- npm

### 1. Installation
```bash
git clone https://github.com/dvrsh-13/My-Portfolio.git
cd My-Portfolio
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` to explore the live portfolio.

### 3. Customising Content
Customise your portfolio content by modifying the structured data records directly in `src/data/portfolioData.ts`.

### 4. Production Build
```bash
npm run build
npm run preview
```
Compiles and optimises static assets into `dist/` ready for hosting on GitHub Pages, Vercel, or Netlify.

---

## Attribution

Design inspiration credited to [khanhnguyen.design](https://khanhnguyen.design/).
