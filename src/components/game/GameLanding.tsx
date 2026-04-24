import { useState, useCallback, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Globe from "./Globe";
import Stars from "./Stars";
import RegionMarkers, { type Region } from "./RegionMarkers";
import Avatar from "./Avatar";
import GameUI from "./GameUI";

function CameraController({
  targetPosition,
  active,
}: {
  targetPosition: [number, number, number] | null;
  active: boolean;
}) {
  useFrame((state) => {
    if (active && targetPosition) {
      const target = new THREE.Vector3(...targetPosition).multiplyScalar(1.8);
      state.camera.position.lerp(target, 0.03);
      state.camera.lookAt(0, 0, 0);
    } else {
      // Idle orbit
      const t = state.clock.elapsedTime;
      const idlePos = new THREE.Vector3(
        Math.sin(t * 0.15) * 12,
        Math.sin(t * 0.1) * 3 + 2,
        Math.cos(t * 0.15) * 12
      );
      state.camera.position.lerp(idlePos, 0.02);
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

function EnergyRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {[4.2, 4.5, 4.8].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.01, 128]} />
          <meshBasicMaterial
            color="#1d9bf0"
            transparent
            opacity={0.04 - i * 0.01}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function GameLanding({ onLogin }: { onLogin: () => void }) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [avatarState, setAvatarState] = useState<"idle" | "moving" | "arrived">("idle");
  const [cameraActive, setCameraActive] = useState(false);
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);

  const handleSelectRegion = useCallback((region: Region) => {
    setSelectedRegion(region);
    setAvatarState("idle");
    setCameraActive(false);
    setTargetPos(null);
  }, []);

  const handleEnterRegion = useCallback(() => {
    if (!selectedRegion) return;
    setAvatarState("moving");
    setCameraActive(true);
    // Convert lat/lon to target position
    const phi = ((90 - selectedRegion.lat) * Math.PI) / 180;
    const theta = ((selectedRegion.lon + 180) * Math.PI) / 180;
    const r = 3.5;
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);
    setTargetPos([x, y, z]);
  }, [selectedRegion]);

  const handleAvatarArrived = useCallback(() => {
    setAvatarState("arrived");
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 3, 12], fov: 50, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={({ gl }) => {
            gl.setClearColor("#000000");
            gl.toneMappingExposure = 1.2;
          }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[10, 5, 10]} intensity={2} color="#1d9bf0" />
            <pointLight position={[-10, -5, -10]} intensity={0.5} color="#a855f7" />
            <pointLight position={[0, 10, 0]} intensity={0.3} color="#ffffff" />
            <directionalLight position={[5, 3, 5]} intensity={0.5} color="#e7e9ea" />

            {/* Scene objects */}
            <Stars count={3000} />
            <Globe radius={3.5} />
            <EnergyRings />
            <RegionMarkers
              radius={3.5}
              selectedRegion={selectedRegion}
              hoveredRegion={hoveredRegion}
              onHover={setHoveredRegion}
              onSelect={handleSelectRegion}
            />
            <Avatar
              active={avatarState === "moving"}
              targetPosition={targetPos}
              onArrived={handleAvatarArrived}
            />
            <CameraController targetPosition={targetPos} active={cameraActive} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <GameUI
        selectedRegion={selectedRegion}
        avatarState={avatarState}
        onEnterRegion={handleEnterRegion}
        onLogin={onLogin}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
