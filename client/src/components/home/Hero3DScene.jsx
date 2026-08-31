import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Environment } from "@react-three/drei";

function RotatingShape() {
  const meshRef = useRef();

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
      scale={1.5}
    >
      <meshStandardMaterial
        color="#3b82f6"
        roughness={0.3}
        metalness={0.7}
      />
    </Icosahedron>
  );
}

export default function Hero3DScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <RotatingShape />
    </Canvas>
  );
}
