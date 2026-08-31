import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron } from "@react-three/drei";

function RotatingShape() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Icosahedron ref={meshRef} args={[1.5, 0]} scale={1.5}>
      {/* flatShading is what actually produces sharp, distinct diamond
          facets — without it, Three.js smooths vertex normals across
          faces and even a detail={0} icosahedron looks rounded. */}
      <meshStandardMaterial
        color="#FF5722"
        roughness={0.15}
        metalness={0.6}
        flatShading
      />
    </Icosahedron>
  );
}

export default function Hero3DScene({ onReady }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      onCreated={() => onReady?.()}
    >
      {/* No Environment/HDRI here on purpose — it's a network fetch plus a
          PMREM cubemap generation cost on first load. A few well-placed
          lights give a faceted low-poly shape crisp specular sparkle
          across its flat faces (the classic "diamond glint" look)
          without any of that overhead, so this renders instantly. */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 6, 4]} intensity={2} color="#ffffff" />
      <directionalLight position={[-6, -3, -4]} intensity={0.8} color="#FFCCBC" />
      <pointLight position={[3, -2, 3]} intensity={1.2} color="#FF8A65" />

      <RotatingShape />
    </Canvas>
  );
}