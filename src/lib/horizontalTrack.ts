import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./smoothScroll";

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

export function getHorizontalTrigger(): ScrollTrigger | null {
  return activeTrigger;
}

export function updateRailTheme() {
  if (!headerElement || !panelElements.length) return;
  const midViewport = window.innerWidth * 0.45;

  for (const panel of panelElements) {
    const rect = panel.getBoundingClientRect();
    if (rect.left <= midViewport && rect.right >= midViewport) {
      const bg = panel.dataset.headerBg || "#000000";
      const text = panel.dataset.headerText || "#ffffff";
      const border = panel.dataset.headerBorder || "#222222";

      headerElement.style.setProperty("--header-bg", bg);
      headerElement.style.setProperty("--header-text", text);
      headerElement.style.setProperty("--header-border", border);
      break;
    }
  }
}

export function scrollToSection(
  targetId: string,
  options: { duration?: number; immediate?: boolean } = {}
) {
  const { duration = 1.2, immediate = false } = options;
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
      }
      return () => {};
    }
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
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
      const zoomDuration = window.innerHeight * 0.9;
      const totalScroll = scrollDist + zoomDuration;

      centerGeometry = {
        phase1Dist,
        zoomDuration,
        totalScroll,
        scrollDist,
      };

      // Base states
      gsap.set(centerMedia, { scale: 0, transformOrigin: "center center" });
      gsap.set(centerLeftWord, { x: 0 });
      gsap.set(centerRightWord, { x: 0 });

      // Phase 1: Track scrolls to center section
      masterTimeline.fromTo(track, { x: 0 }, { x: centeredX, duration: phase1Dist });

      // Phase 2: Pause track scroll, expand center media, fly text outwards
      masterTimeline.addLabel("centerPause");
      masterTimeline.fromTo(
        centerMedia,
        { scale: 0 },
        { scale: 1.1, duration: zoomDuration, ease: "power2.inOut" },
        "centerPause"
      );
      masterTimeline.fromTo(
        centerLeftWord,
        { x: 0 },
        { x: -window.innerWidth * 0.35, duration: zoomDuration, ease: "power2.inOut" },
        "centerPause"
      );
      masterTimeline.fromTo(
        centerRightWord,
        { x: 0 },
        { x: window.innerWidth * 0.35, duration: zoomDuration, ease: "power2.inOut" },
        "centerPause"
      );

      // Phase 3: Resume track scroll to end
      masterTimeline.fromTo(track, { x: centeredX }, { x: -scrollDist, duration: phase3Dist });

      activeTrigger = ScrollTrigger.create({
        trigger: pinContainer,
        animation: masterTimeline,
        start: "top top",
        end: () => `+=${totalScroll}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressBar) {
            progressBar.style.transform = `scaleY(${self.progress})`;
          }
          updateRailTheme();
        },
      });
    } else {
      masterTimeline.fromTo(track, { x: 0 }, { x: () => -getScrollDistance() });

      activeTrigger = ScrollTrigger.create({
        trigger: pinContainer,
        animation: masterTimeline,
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressBar) {
            progressBar.style.transform = `scaleY(${self.progress})`;
          }
          updateRailTheme();
        },
      });
    }

    // Set initial rail theme immediately on desktop mount
    updateRailTheme();
  });

  return () => {
    activeTrigger?.kill();
    masterTimeline?.kill();
    mm.revert();
  };
}
