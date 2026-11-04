import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initHorizontalTrack() {
  const pinContainer = document.querySelector<HTMLElement>("[data-horizontal-pin]");
  const track = document.querySelector<HTMLElement>("[data-horizontal-track]");
  const progressBar = document.querySelector<HTMLElement>("[data-header-scroll-progress]");
  const centerSection = document.querySelector<HTMLElement>("[data-transition-section]");
  const centerMedia = centerSection?.querySelector<HTMLElement>("[data-transition-media]");
  const centerLeftWord = centerSection?.querySelector<HTMLElement>("[data-word-left]");
  const centerRightWord = centerSection?.querySelector<HTMLElement>("[data-word-right]");

  if (!pinContainer || !track) return () => {};

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    const getScrollDistance = () => track.scrollWidth - window.innerWidth;

    const masterTimeline = gsap.timeline({
      defaults: { ease: "none" },
    });

    const scrollDist = getScrollDistance();

    if (centerSection && centerMedia && centerLeftWord && centerRightWord) {
      // Calculate pause geometry
      const sectionOffset = centerSection.offsetLeft;
      const centeredX = -(sectionOffset - (window.innerWidth - centerSection.offsetWidth) / 2);
      const phase1Dist = Math.max(0, -centeredX);
      const phase3Dist = Math.max(0, scrollDist - phase1Dist);
      const zoomDuration = window.innerHeight; // Pinned scroll budget for the zoom
      const totalScroll = scrollDist + zoomDuration;

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
        { scale: 1.15, duration: zoomDuration, ease: "power2.inOut" },
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

      ScrollTrigger.create({
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
        },
      });
    } else {
      // Direct smooth horizontal translation
      masterTimeline.fromTo(track, { x: 0 }, { x: () => -getScrollDistance() });

      ScrollTrigger.create({
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
        },
      });
    }
  });

  // Mobile fallback (< 768px): Vertical progress tracking
  mm.add("(max-width: 767px)", () => {
    ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (progressBar) {
          progressBar.style.transform = `scaleX(${self.progress})`;
        }
      },
    });
  });

  return () => {
    mm.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}
