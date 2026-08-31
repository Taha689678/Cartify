import { useState, useEffect, Suspense, lazy, Component } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the actual 3D scene so Three.js isn't in the main bundle
const Scene = lazy(() => import("./Hero3DScene.jsx"));

/**
 * Catches WebGL/context-creation or Three.js runtime errors (e.g. an old
 * GPU, a browser with WebGL disabled, or a driver crash) so a failure in
 * the 3D scene degrades to the same static visual as mobile, rather than
 * taking down the whole hero section with a blank white crash.
 */
class SceneErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const StaticPreview = ({ subtitle }) => (
  <div className="w-full h-[280px] md:h-[400px] relative rounded-2xl overflow-hidden">
    <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #FF7043, #E64A19)",
          transform: "rotate(12deg)",
        }}
      >
        <span
          className="font-bold text-xl text-white"
          style={{ transform: "rotate(-12deg)" }}
        >
          3D
        </span>
      </div>
      <div className="text-orange-900 font-medium">Interactive View</div>
      <p className="text-orange-800/60 text-sm mt-1">{subtitle}</p>
    </div>
  </div>
);

export const Hero3D = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // matchMedia only fires on actual breakpoint crossings, unlike a raw
    // resize listener which fires continuously on every pixel of drag.
    const mql = window.matchMedia("(max-width: 767px)");
    const handleChange = (e) => setIsMobile(e.matches);

    setIsMobile(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  if (isMobile) {
    return <StaticPreview subtitle="Available on desktop screens" />;
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden">
      <SceneErrorBoundary
        fallback={<StaticPreview subtitle="Interactive view unavailable on this device" />}
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
          }
        >
          {/* Fade the canvas in once mounted instead of popping in abruptly */}
          <div
            className={`w-full h-full transition-opacity duration-500 ${
              isSceneReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <Scene onReady={() => setIsSceneReady(true)} />
          </div>
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
};