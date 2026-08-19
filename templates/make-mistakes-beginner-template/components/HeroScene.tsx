"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function SpinningBox() {
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color="#14b8a6" metalness={0.2} roughness={0.35} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [2.4, 1.8, 2.8], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 2]} intensity={1.1} />
      <SpinningBox />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}
