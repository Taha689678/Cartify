import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const CustomCursor = () => {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  // Actual pointer position (updates instantly on every mousemove)
  const targetPos = useRef({ x: 0, y: 0 });
  // Ring position (eases toward targetPos every frame, giving it a soft trail)
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Higher = snappier ring, lower = longer/softer trail.
    const EASE = prefersReducedMotion ? 1 : 0.5;

    const applyTransform = (el, x, y, extra = "") => {
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) ${extra}`;
    };

    const tick = () => {
      ringPos.current.x += (targetPos.current.x - ringPos.current.x) * EASE;
      ringPos.current.y += (targetPos.current.y - ringPos.current.y) * EASE;
      applyTransform(ringRef.current, ringPos.current.x, ringPos.current.y);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    const onMouseMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      applyTransform(dotRef.current, e.clientX, e.clientY);
      setIsVisible((v) => (v ? v : true));
    };

    const onMouseLeaveWindow = () => setIsVisible(false);
    const onMouseEnterWindow = () => setIsVisible(true);
    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);

    const onMouseOver = (e) => {
      const target = e.target;
      const isClickable =
        target.closest("a, button, select, [role='button'], [data-cursor-hover]") !== null ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovering(isClickable);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveWindow);
    document.addEventListener("mouseenter", onMouseEnterWindow);
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
      document.removeEventListener("mouseenter", onMouseEnterWindow);
      document.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    setIsHovering(false);
    setIsPressed(false);
  }, [location.pathname]);

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  ) {
    return null;
  }

  return (
    <>
      {/* Trailing ring — eases toward the pointer for a soft, smooth follow */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[100] rounded-full border-2 border-orange-500 transition-[width,height,opacity,background-color] duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isHovering
            ? "w-12 h-12 bg-orange-500/10"
            : "w-8 h-8 bg-transparent"
        } ${isPressed ? "scale-90" : "scale-100"}`}
        style={{ willChange: "transform", transitionProperty: "width, height, opacity, background-color, transform" }}
      />

      {/* Precise dot — tracks the raw pointer position with zero lag */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[100] rounded-full bg-orange-600 transition-[opacity,transform] duration-150 ease-out ${
          isVisible && !isHovering ? "opacity-100" : "opacity-0"
        } ${isPressed ? "scale-150" : "scale-100"}`}
        style={{ width: 6, height: 6, willChange: "transform" }}
      />
    </>
  );
};