"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Registers a GSAP ScrollTrigger animation on a container ref.
 * Cleans up when the component unmounts.
 *
 * @param animateFn   Called with (gsap, ScrollTrigger) once the module loads.
 *                    Return a GSAP context or timeline for auto-cleanup.
 * @param deps        Re-run when these change (like a normal useEffect).
 */
export function useGSAPScroll(
  animateFn: (
    gsap: typeof import("gsap").gsap,
    ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger
  ) => gsap.Context | gsap.core.Timeline | void,
  deps: React.DependencyList = []
) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);

      const result = animateFn(gsap, ScrollTrigger);

      cleanupRef.current = () => {
        if (result && "revert" in result) {
          (result as gsap.Context).revert();
        } else if (result && "kill" in result) {
          (result as gsap.core.Timeline).kill();
        }
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });

    return () => {
      mounted = false;
      cleanupRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Simpler variant: animate a single ref element on scroll-into-view.
 *
 * @param ref       The element to animate
 * @param vars      GSAP fromTo "from" vars (defaults to fade-up)
 * @param toVars    GSAP fromTo "to" vars
 * @param trigger   ScrollTrigger config overrides
 */
export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  vars?: gsap.TweenVars,
  toVars?: gsap.TweenVars,
  trigger?: Record<string, unknown>
) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let tween: gsap.core.Tween;
    let st: import("gsap/ScrollTrigger").ScrollTrigger;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);

        tween = gsap.fromTo(
          el,
          { opacity: 0, y: 40, ...vars },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            ...toVars,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
              ...trigger,
            },
          }
        );

        st = tween.scrollTrigger as import("gsap/ScrollTrigger").ScrollTrigger;
      }
    );

    return () => {
      tween?.kill();
      st?.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
