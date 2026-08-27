import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Environment } from "@react-three/drei";

function RotatingShape() {
  const meshRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Icosahedron
      ref={meshRef}
      args={[1.5, 0]}
      scale={isMobile ? 1.2 : 1.5}
    >
      <meshStandardMaterial
        color="#3b82f6"
        roughness={0.3}
        metalness={0.7}
      />
    </Icosahedron>
  );
}

export const Hero3D = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="w-full h-[280px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
        <div className="text-blue-600 text-lg font-medium">3D View</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] md:h-[500px]">
      {!isLoaded && (
        <div className="w-full h-full bg-gray-200 rounded-2xl animate-pulse" />
      )}
      <Canvas
        onCreated={() => setIsLoaded(true)}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <RotatingShape />
      </Canvas>
    </div>
  );
};
