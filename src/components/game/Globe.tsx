import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Procedural dot-matrix earth using instanced meshes
function DotGlobe({ radius = 3.5 }: { radius?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate dot positions for continents (simplified lat/lon grid)
  const dots = useMemo(() => {
    const positions: [number, number, number][] = [];
    const dotCount = 2500;
    for (let i = 0; i < dotCount; i++) {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lon = Math.random() * Math.PI * 2;
      // Skip polar regions and oceans (rough approximation)
      const latDeg = (lat * 180) / Math.PI;
      const lonDeg = (lon * 180) / Math.PI;
      // Simple continent mask - keep dots in land-like areas
      let keep = false;
      if (latDeg > 15 && latDeg < 70 && ((lonDeg > -130 && lonDeg < -60) || (lonDeg > -10 && lonDeg < 50))) keep = true; // North America / Europe
      if (latDeg > -35 && latDeg < 10 && lonDeg > -85 && lonDeg < -35) keep = true; // South America
      if (latDeg > -35 && latDeg < 35 && lonDeg > -20 && lonDeg < 55) keep = true; // Africa
      if (latDeg > 5 && latDeg < 75 && lonDeg > 55 && lonDeg < 145) keep = true; // Asia
      if (latDeg > -45 && latDeg < -10 && lonDeg > 110 && lonDeg < 155) keep = true; // Australia
      if (Math.random() > 0.92) keep = true; // Some scattered ocean dots
      if (!keep) continue;

      const x = radius * Math.cos(lat) * Math.cos(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lon);
      positions.push([x, y, z]);
    }
    return positions;
  }, [radius]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dark ocean sphere */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color="#0a0e17"
          roughness={0.9}
          metalness={0.1}
          emissive="#051020"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Continent dots */}
      {dots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.025, 4, 4]} />
          <meshStandardMaterial
            color="#1d9bf0"
            emissive="#1d9bf0"
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[radius + 0.02, 32, 32]} />
        <meshBasicMaterial
          color="#1d9bf0"
          wireframe
          transparent
          opacity={0.03}
        />
      </mesh>
    </group>
  );
}

// Atmospheric glow shader
function AtmosphereGlow({ radius = 3.5 }: { radius?: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const atmosphereShader = useMemo(
    () => ({
      uniforms: {
        c: { value: 0.6 },
        p: { value: 4.0 },
        glowColor: { value: new THREE.Color("#1d9bf0") },
        viewVector: { value: new THREE.Vector3(0, 0, 15) },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.6 - dot(vNormal, vNormel), 4.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      const camera = state.camera;
      materialRef.current.uniforms.viewVector.value.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[radius * 1.15, 64, 64]} />
      <shaderMaterial ref={materialRef} {...atmosphereShader} />
    </mesh>
  );
}

// Inner core glow
function InnerGlow({ radius = 3.5 }: { radius?: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.05, 32, 32]} />
      <meshBasicMaterial
        color="#0a2a4a"
        transparent
        opacity={0.15}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Globe({ radius = 3.5 }: { radius?: number }) {
  return (
    <group>
      <DotGlobe radius={radius} />
      <AtmosphereGlow radius={radius} />
      <InnerGlow radius={radius} />
    </group>
  );
}
