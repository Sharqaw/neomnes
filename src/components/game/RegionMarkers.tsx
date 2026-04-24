import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

export interface Region {
  id: string;
  name: string;
  nameAr: string;
  lat: number; // degrees
  lon: number; // degrees
  cities: string[];
  color: string;
}

export const REGIONS: Region[] = [
  { id: "na", name: "North America", nameAr: "أمريكا الشمالية", lat: 45, lon: -100, cities: ["New York", "Los Angeles", "Toronto", "Mexico City"], color: "#1d9bf0" },
  { id: "sa", name: "South America", nameAr: "أمريكا الجنوبية", lat: -15, lon: -60, cities: ["São Paulo", "Buenos Aires", "Lima", "Bogotá"], color: "#00ba7c" },
  { id: "eu", name: "Europe", nameAr: "أوروبا", lat: 50, lon: 15, cities: ["London", "Paris", "Berlin", "Rome"], color: "#f59e0b" },
  { id: "me", name: "Middle East", nameAr: "الشرق الأوسط", lat: 25, lon: 45, cities: ["Dubai", "Cairo", "Riyadh", "Istanbul"], color: "#f4212e" },
  { id: "af", name: "Africa", nameAr: "إفريقيا", lat: 5, lon: 20, cities: ["Lagos", "Cairo", "Nairobi", "Johannesburg"], color: "#a855f7" },
  { id: "as", name: "Asia", nameAr: "آسيا", lat: 35, lon: 100, cities: ["Tokyo", "Beijing", "Mumbai", "Bangkok"], color: "#ec4899" },
  { id: "oc", name: "Oceania", nameAr: "أوقيانوسيا", lat: -25, lon: 135, cities: ["Sydney", "Melbourne", "Auckland", "Perth"], color: "#06b6d4" },
];

function latLonToVec3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

function RegionPin({
  region,
  radius,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: {
  region: Region;
  radius: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (region: Region) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pinRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [localHover, setLocalHover] = useState(false);

  const position = latLonToVec3(region.lat, region.lon, radius);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pinRef.current) {
      const targetScale = isSelected ? 1.8 : isHovered || localHover ? 1.4 : 1;
      pinRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    if (pulseRef.current) {
      const pulseScale = 1 + Math.sin(t * 3 + region.lat) * 0.3;
      pulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isHovered || isSelected ? 0.6 : 0.2) * (0.5 + Math.sin(t * 2) * 0.5);
    }
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setLocalHover(true);
      onHover(region.id);
      document.body.style.cursor = "pointer";
    },
    [region.id, onHover]
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setLocalHover(false);
      onHover(null);
      document.body.style.cursor = "auto";
    },
    [onHover]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(region);
    },
    [region, onSelect]
  );

  return (
    <group ref={groupRef} position={position}>
      {/* Look at center */}
      <group lookAt={[0, 0, 0]}>
        {/* Pin needle */}
        <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.005, 0.4, 8]} />
          <meshStandardMaterial
            color={region.color}
            emissive={region.color}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Pin head */}
        <mesh
          ref={pinRef}
          position={[0, 0, 0.4]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={region.color}
            emissive={region.color}
            emissiveIntensity={isSelected ? 2 : isHovered || localHover ? 1.5 : 0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Pulse ring */}
        <mesh ref={pulseRef} position={[0, 0, 0.4]}>
          <ringGeometry args={[0.1, 0.14, 32]} />
          <meshBasicMaterial
            color={region.color}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Label */}
        {(isHovered || isSelected) && (
          <Html position={[0, 0.25, 0.5]} center distanceFactor={8}>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap pointer-events-none"
              style={{
                background: `${region.color}22`,
                border: `1px solid ${region.color}66`,
                color: region.color,
                backdropFilter: "blur(8px)",
              }}
            >
              {region.nameAr}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

export default function RegionMarkers({
  radius = 3.5,
  selectedRegion,
  hoveredRegion,
  onHover,
  onSelect,
}: {
  radius?: number;
  selectedRegion: Region | null;
  hoveredRegion: string | null;
  onHover: (id: string | null) => void;
  onSelect: (region: Region) => void;
}) {
  return (
    <group>
      {REGIONS.map((region) => (
        <RegionPin
          key={region.id}
          region={region}
          radius={radius}
          isHovered={hoveredRegion === region.id}
          isSelected={selectedRegion?.id === region.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
