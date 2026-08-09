"use client";

/**
 * <ScrollReveal> — wraps children in a div that animates into view on scroll.
 *
 * Props:
 *  - as           HTML tag to render (default "div")
 *  - from         GSAP fromTo "from" overrides
 *  - delay        Stagger delay in seconds (default 0)
 *  - duration     Animation duration (default 0.7)
 *  - ease         GSAP ease string (default "power3.out")
 *  - start        ScrollTrigger start position (default "top 88%")
 *  - className    Extra classes on the wrapper
 */

import { useRef, useEffect, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  as?: ElementType;
  from?: gsap.TweenVars;
  delay?: number;
  duration?: number;
  ease?: string;
  start?: string;
  className?: string;
}

export function ScrollReveal({
  children,
  as: Tag = "div",
  from = {},
  delay = 0,
  duration = 0.7,
  ease = "power3.out",
  start = "top 88%",
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tween: gsap.core.Tween;
    let mounted = true;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (!mounted) return;
        gsap.registerPlugin(ScrollTrigger);

        tween = gsap.fromTo(
          el,
          { opacity: 0, y: 48, ...from },
          {
            opacity: 1,
            y: 0,
            duration,
            ease,
            delay,
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      }
    );

    return () => {
      mounted = false;
      tween?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </Tag>
  );
}

/**
 * <StaggerReveal> — animates a list of children with a stagger.
 * Wrap a set of sibling elements to have them cascade in.
 */
interface StaggerRevealProps {
  children: ReactNode;
  stagger?: number;
  from?: gsap.TweenVars;
  duration?: number;
  ease?: string;
  start?: string;
  className?: string;
  childSelector?: string;
}

export function StaggerReveal({
  children,
  stagger = 0.1,
  from = {},
  duration = 0.6,
  ease = "power3.out",
  start = "top 88%",
  className,
  childSelector = ":scope > *",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let tween: gsap.core.Tween;
    let mounted = true;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (!mounted) return;
        gsap.registerPlugin(ScrollTrigger);

        const items = container.querySelectorAll(childSelector);

        tween = gsap.fromTo(
          items,
          { opacity: 0, y: 40, ...from },
          {
            opacity: 1,
            y: 0,
            duration,
            ease,
            stagger,
            scrollTrigger: {
              trigger: container,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      }
    );

    return () => {
      mounted = false;
      tween?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
