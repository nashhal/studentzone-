import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type FadeContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
};

/**
 * A restrained FadeContent treatment adapted from the React Bits pattern.
 * Motion is limited to opacity, transform and a short blur, with automatic
 * GSAP context cleanup through @gsap/react.
 */
export function FadeContent({
  children,
  delay = 0,
  className,
  ...props
}: FadeContentProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = container.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      element,
      { autoAlpha: 0, y: 14, filter: "blur(5px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.68,
        delay,
        ease: "power3.out",
        clearProps: "filter,transform",
      },
    );
  }, { scope: container, dependencies: [delay], revertOnUpdate: true });

  return (
    <div ref={container} className={className} {...props}>
      {children}
    </div>
  );
}
