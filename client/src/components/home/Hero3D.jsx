import { useRef, useState, useEffect, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the actual 3D scene so Three.js isn't in the main bundle
const Scene = lazy(() => import("./Hero3DScene.jsx"));

export const Hero3D = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="w-full h-[280px] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex flex-col items-center justify-center text-center p-6 shadow-inner">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
          <span className="font-bold text-xl">3D</span>
        </div>
        <div className="text-blue-800 font-medium">Interactive View</div>
        <p className="text-blue-600/70 text-sm mt-1">Available on desktop screens</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }>
        <Scene />
      </Suspense>
    </div>
  );
};
