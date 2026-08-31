import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const CustomCursor = () => {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  // Raw coordinates
  const targetPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EASE = prefersReducedMotion ? 1 : 0.35; // 0.35 is buttery smooth without lagging behind too much

    const tick = () => {
      ringPos.current.x += (targetPos.current.x - ringPos.current.x) * EASE;
      ringPos.current.y += (targetPos.current.y - ringPos.current.y) * EASE;
      
      // We directly mutate the DOM styles. 
      // Do NOT use CSS transitions on transform, as it fights with requestAnimationFrame and causes lag/stutter!
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    const onMouseMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      setIsVisible(true);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);

    const onMouseOver = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';
        
      if (isClickable && !isHovering) setIsHovering(true);
      else if (!isClickable && isHovering) setIsHovering(false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mousedown", onMouseDown, { passive: true });
    document.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, [isHovering]);

  useEffect(() => {
    setIsHovering(false);
    setIsPressed(false);
  }, [location.pathname]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  // We rely purely on width/height/opacity CSS transitions.
  // We omit `style={{}}` to prevent React from wiping our inline `transform` during re-renders (which caused the "1 inch jump").
  return (
    <>
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[100] rounded-full border-2 border-orange-500 will-change-transform transition-[width,height,opacity,background-color] duration-150 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isPressed 
            ? "w-7 h-7 bg-orange-500/30" 
            : isHovering
              ? "w-12 h-12 bg-orange-500/10"
              : "w-8 h-8 bg-transparent"
        }`}
      />
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[100] rounded-full bg-orange-600 will-change-transform transition-[width,height,opacity] duration-100 ease-out ${
          isVisible && !isHovering ? "opacity-100" : "opacity-0"
        } ${
          isPressed ? "w-2 h-2" : "w-1.5 h-1.5"
        }`}
      />
    </>
  );
};
