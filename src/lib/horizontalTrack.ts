import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./smoothScroll";
import { checkPanelEntrances } from "./panelAnimations";
import { updateCursorThemeExternal } from "./customCursor";

gsap.registerPlugin(ScrollTrigger);

let activeTrigger: ScrollTrigger | null = null;
let masterTimeline: gsap.core.Timeline | null = null;
let centerGeometry: {
  phase1Dist: number;
  zoomDuration: number;
  totalScroll: number;
  scrollDist: number;
} | null = null;

let headerElement: HTMLElement | null = null;
let panelElements: HTMLElement[] = [];
let activeThemePanel: HTMLElement | null = null;

export function getHorizontalTrigger(): ScrollTrigger | null {
  return activeTrigger;
}

export function updateRailTheme() {
  if (!headerElement || !panelElements.length) return;

  const isDesktop = window.innerWidth >= 768;
  const headerRect = headerElement.getBoundingClientRect();
  // Chapter theme triggers 2px under the sidebar edge
  const triggerPoint = isDesktop
    ? Math.max(0, headerRect.right - 2)
    : Math.max(0, headerRect.bottom - 2);

  for (const panel of panelElements) {
    const rect = panel.getBoundingClientRect();
    const coversPoint = isDesktop
      ? rect.left <= triggerPoint && rect.right > triggerPoint
      : rect.top <= triggerPoint && rect.bottom > triggerPoint;

    if (coversPoint) {
      if (panel === activeThemePanel) break; // Avoid redundant DOM writes
      activeThemePanel = panel;

      const bg = panel.dataset.headerBg || "#000000";
      const text = panel.dataset.headerText || "#ffffff";
      const border = panel.dataset.headerBorder || "#222222";

      headerElement.style.setProperty("--header-bg", bg);
      headerElement.style.setProperty("--header-text", text);
      headerElement.style.setProperty("--header-border", border);
      headerElement.style.color = text;
      headerElement.style.backgroundColor = bg;
      headerElement.style.borderColor = border;
      break;
    }
  }
}

export function scrollToSection(
  targetId: string,
  options: { duration?: number; immediate?: boolean } = {}
) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const {
    duration = prefersReducedMotion ? 0 : 1.2,
    immediate = prefersReducedMotion,
  } = options;
  const cleanId = targetId.replace(/^#/, "");
  const targetEl =
    document.getElementById(cleanId) ||
    document.querySelector<HTMLElement>(`[data-section='${cleanId}']`);

  const lenis = getLenis();
  const trigger = activeTrigger;

  if (!targetEl && cleanId !== "site-top" && cleanId !== "hero") return;

  // Desktop horizontal pin track mode
  if (window.innerWidth >= 768 && trigger) {
    const track = document.querySelector<HTMLElement>("[data-horizontal-track]");
    if (!track) return;

    if (cleanId === "site-top" || cleanId === "hero" || !targetEl) {
      if (immediate) {
        if (masterTimeline) masterTimeline.progress(0);
        window.scrollTo(0, 0);
        lenis?.scrollTo(0, { immediate: true });
        updateRailTheme();
      } else if (lenis) {
        lenis.scrollTo(0, { duration });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const panelList = Array.from(track.querySelectorAll<HTMLElement>(".horizontal-panel"));
    const targetIndex = panelList.indexOf(targetEl);
    const targetOffset = targetIndex >= 0 ? targetIndex * window.innerWidth : targetEl.offsetLeft;

    const scrollDist = track.scrollWidth - window.innerWidth;
    let targetScrollY: number;
    let progress: number;

    if (centerGeometry) {
      const { phase1Dist, zoomDuration, totalScroll } = centerGeometry;
      let timelineOffset: number;

      if (targetOffset <= phase1Dist) {
        timelineOffset = targetOffset;
      } else {
        timelineOffset = targetOffset + zoomDuration;
      }

      progress = Math.min(1, Math.max(0, timelineOffset / totalScroll));
      targetScrollY = trigger.start + progress * (trigger.end - trigger.start);
    } else {
      progress = Math.min(1, Math.max(0, targetOffset / scrollDist));
      targetScrollY = trigger.start + progress * (trigger.end - trigger.start);
    }

    if (immediate) {
      if (masterTimeline) {
        masterTimeline.progress(progress);
      }
      window.scrollTo(0, targetScrollY);
      lenis?.scrollTo(targetScrollY, { immediate: true });
      updateRailTheme();
    } else if (lenis) {
      lenis.scrollTo(targetScrollY, { duration });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    }
  } else {
    // Mobile vertical mode
    if (cleanId === "site-top" || cleanId === "hero" || !targetEl) {
      if (immediate) {
        window.scrollTo(0, 0);
        lenis?.scrollTo(0, { immediate: true });
      } else if (lenis) {
        lenis.scrollTo(0, { duration });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (immediate) {
      targetEl.scrollIntoView({ behavior: "instant" });
      lenis?.scrollTo(targetEl, { immediate: true });
    } else if (lenis) {
      lenis.scrollTo(targetEl, { duration });
    } else {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  }
}

function computeSmartSnap(value: number, points: number[], direction: number): number {
  if (points.length <= 1) return value;
  if (value <= points[0]) return points[0];
  if (value >= points[points.length - 1]) return points[points.length - 1];

  let idx = 0;
  for (let i = 0; i < points.length - 1; i++) {
    if (value >= points[i] && value <= points[i + 1]) {
      idx = i;
      break;
    }
  }

  const pPrev = points[idx];
  const pNext = points[idx + 1];
  const span = pNext - pPrev;
  if (span <= 0.0001) return pPrev;

  const fraction = (value - pPrev) / span;

  // Directional intelligence:
  // When scrolling forward (direction > 0): if 20% or more towards next chapter, snap forward
  // When scrolling backward (direction < 0): if 20% or more towards previous chapter, snap backward
  if (direction > 0) {
    return fraction >= 0.2 ? pNext : pPrev;
  } else if (direction < 0) {
    return fraction <= 0.8 ? pPrev : pNext;
  }

  return fraction >= 0.5 ? pNext : pPrev;
}

export function initHorizontalTrack() {
  const pinContainer = document.querySelector<HTMLElement>("[data-horizontal-pin]");
  const track = document.querySelector<HTMLElement>("[data-horizontal-track]");
  const progressBar = document.querySelector<HTMLElement>("[data-header-scroll-progress]");
  const centerSection = document.querySelector<HTMLElement>("[data-transition-section]");
  const centerMedia = centerSection?.querySelector<HTMLElement>("[data-transition-media]");
  const centerLeftWord = centerSection?.querySelector<HTMLElement>("[data-word-left]");
  const centerRightWord = centerSection?.querySelector<HTMLElement>("[data-word-right]");
  headerElement = document.querySelector<HTMLElement>("[data-intro-header]");
  panelElements = Array.from(document.querySelectorAll<HTMLElement>("[data-horizontal-panel]"));

  if (!pinContainer || !track) return () => {};

  // Support direct static panel preview for headless capture and testing
  const urlPanel = new URLSearchParams(window.location.search).get("panel");
  if (urlPanel) {
    const target =
      document.getElementById(urlPanel) ||
      document.querySelector<HTMLElement>(`[data-section='${urlPanel}']`);
    if (target) {
      const panelList = Array.from(track.querySelectorAll<HTMLElement>(".horizontal-panel"));
      const targetIndex = panelList.indexOf(target);
      const offset = targetIndex >= 0 ? targetIndex * window.innerWidth : target.offsetLeft;

      track.style.transform = `translate3d(-${offset}px, 0, 0)`;
      const bg = target.dataset.headerBg || "#000000";
      const text = target.dataset.headerText || "#ffffff";
      const border = target.dataset.headerBorder || "#222222";
      if (headerElement) {
        headerElement.style.setProperty("--header-bg", bg);
        headerElement.style.setProperty("--header-text", text);
        headerElement.style.setProperty("--header-border", border);
        headerElement.style.color = text;
        headerElement.style.backgroundColor = bg;
        headerElement.style.borderColor = border;
      }
      return () => {};
    }
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const getScrollDistance = () => track.scrollWidth - window.innerWidth;

    masterTimeline = gsap.timeline({
      defaults: { ease: "none" },
    });

    const scrollDist = getScrollDistance();

    if (centerSection && centerMedia && centerLeftWord && centerRightWord) {
      const panelList = Array.from(track.querySelectorAll<HTMLElement>(".horizontal-panel"));
      const centerIndex = panelList.indexOf(centerSection);
      const sectionOffset = centerIndex >= 0 ? centerIndex * window.innerWidth : centerSection.offsetLeft;

      const centeredX = -(sectionOffset - (window.innerWidth - centerSection.offsetWidth) / 2);
      const phase1Dist = Math.max(0, -centeredX);
      const phase3Dist = Math.max(0, scrollDist - phase1Dist);
      const zoomDuration = window.innerHeight * 1.1;
      const totalScroll = scrollDist + zoomDuration;

      const mediaW = centerMedia.offsetWidth || 560;
      const mediaH = centerMedia.offsetHeight || 350;
      const fullScreenScale = Math.max(window.innerWidth / mediaW, window.innerHeight / mediaH) * 1.15;

      centerGeometry = {
        phase1Dist,
        zoomDuration,
        totalScroll,
        scrollDist,
      };

      // Base states
      gsap.set(centerMedia, { scale: 0, opacity: 0, transformOrigin: "center center" });
      gsap.set(centerLeftWord, { x: 0, opacity: 1 });
      gsap.set(centerRightWord, { x: 0, opacity: 1 });

      // Phase 1: Track scrolls to center section
      masterTimeline.fromTo(track, { x: 0 }, { x: centeredX, duration: phase1Dist });

      // Phase 2: Pause track scroll, expand center media, fly text outwards to complete fade
      masterTimeline.addLabel("centerPause");
      masterTimeline.fromTo(
        centerMedia,
        { scale: 0, opacity: 0 },
        { scale: fullScreenScale, opacity: 1, duration: zoomDuration, ease: "power2.inOut" },
        "centerPause"
      );
      masterTimeline.fromTo(
        centerLeftWord,
        { x: 0, opacity: 1 },
        { x: -window.innerWidth * 0.75, opacity: 0, duration: zoomDuration, ease: "power2.inOut" },
        "centerPause"
      );
      masterTimeline.fromTo(
        centerRightWord,
        { x: 0, opacity: 1 },
        { x: window.innerWidth * 0.75, opacity: 0, duration: zoomDuration, ease: "power2.inOut" },
        "centerPause"
      );

      // Phase 3: Resume track scroll to end
      masterTimeline.fromTo(track, { x: centeredX }, { x: -scrollDist, duration: phase3Dist });

      // Compute subtle magnetic snap points corresponding to each chapter
      const snapPoints = panelList.map((_, idx) => {
        const targetOffset = idx * window.innerWidth;
        const timelineOffset = targetOffset <= phase1Dist ? targetOffset : targetOffset + zoomDuration;
        return Math.min(1, Math.max(0, timelineOffset / totalScroll));
      });
      // Add snap point for completed transition card preview
      snapPoints.push(Math.min(1, Math.max(0, (phase1Dist + zoomDuration) / totalScroll)));
      const uniqueSnapPoints = Array.from(new Set(snapPoints.map((p) => Number(p.toFixed(4))))).sort(
        (a, b) => a - b
      );

      activeTrigger = ScrollTrigger.create({
        trigger: pinContainer,
        animation: masterTimeline,
        start: "top top",
        end: () => `+=${totalScroll}`,
        pin: true,
        scrub: prefersReducedMotion ? 0 : 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: prefersReducedMotion
          ? undefined
          : {
              snapTo: (val: number) => {
                const dir = activeTrigger ? activeTrigger.direction : 0;
                return computeSmartSnap(val, uniqueSnapPoints, dir);
              },
              duration: { min: 0.25, max: 0.55 },
              delay: 0.35,
              ease: "power2.out",
              inertia: false,
            },
        onUpdate: (self) => {
          if (progressBar) {
            progressBar.style.transform = `scaleY(${self.progress})`;
          }
          updateRailTheme();
          checkPanelEntrances();
          updateCursorThemeExternal();
        },
      });
    } else {
      masterTimeline.fromTo(track, { x: 0 }, { x: () => -getScrollDistance() });

      const fallbackSnapPoints = panelElements.map((_, idx) =>
        panelElements.length > 1 ? idx / (panelElements.length - 1) : 0
      );

      activeTrigger = ScrollTrigger.create({
        trigger: pinContainer,
        animation: masterTimeline,
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: prefersReducedMotion ? 0 : 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: prefersReducedMotion
          ? undefined
          : {
              snapTo: (val: number) => {
                const dir = activeTrigger ? activeTrigger.direction : 0;
                return computeSmartSnap(val, fallbackSnapPoints, dir);
              },
              duration: { min: 0.25, max: 0.55 },
              delay: 0.35,
              ease: "power2.out",
              inertia: false,
            },
        onUpdate: (self) => {
          if (progressBar) {
            progressBar.style.transform = `scaleY(${self.progress})`;
          }
          updateRailTheme();
          checkPanelEntrances();
          updateCursorThemeExternal();
        },
      });
    }

    // Set initial rail theme immediately on desktop mount
    updateRailTheme();
  });

  // Mobile real-time scroll progress tracking
  const updateMobileProgress = () => {
    if (window.innerWidth < 768 && progressBar) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    }
  };
  window.addEventListener("scroll", updateMobileProgress, { passive: true });
  window.addEventListener("resize", updateMobileProgress, { passive: true });
  updateMobileProgress();

  return () => {
    window.removeEventListener("scroll", updateMobileProgress);
    window.removeEventListener("resize", updateMobileProgress);
    activeTrigger?.kill();
    activeTrigger = null;
    masterTimeline?.kill();
    masterTimeline = null;
    centerGeometry = null;
    activeThemePanel = null;
    mm.revert();
  };
}
