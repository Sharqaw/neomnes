import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Avatar({
  active,
  targetPosition,
  onArrived,
}: {
  active: boolean;
  targetPosition: [number, number, number] | null;
  onArrived: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const hasArrived = useRef(false);

  const startPos = useMemo(() => new THREE.Vector3(0, 0, 6), []);
  const targetVec = useMemo(() => new THREE.Vector3(), []);

  // Trail particles
  const trailCount = 50;
  const trailPositions = useMemo(() => {
    const arr = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      arr[i * 3] = startPos.x;
      arr[i * 3 + 1] = startPos.y;
      arr[i * 3 + 2] = startPos.z;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !targetPosition) return;

    targetVec.set(...targetPosition);

    if (active) {
      hasArrived.current = false;
      const t = state.clock.elapsedTime;

      // Move toward target
      const currentPos = groupRef.current.position;
      const direction = targetVec.clone().sub(currentPos).normalize();
      const distance = currentPos.distanceTo(targetVec);

      if (distance > 0.3) {
        // Move
        const speed = Math.min(0.08, distance * 0.05);
        currentPos.add(direction.clone().multiplyScalar(speed));

        // Bobbing animation while moving
        groupRef.current.position.y += Math.sin(t * 8) * 0.005;

        // Rotate to face movement direction
        const lookTarget = currentPos.clone().add(direction);
        groupRef.current.lookAt(lookTarget);

        // Body tilt while walking
        if (bodyRef.current) {
          bodyRef.current.rotation.x = Math.sin(t * 10) * 0.1;
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 6) * 0.15;
        }

        // Update trail particles
        if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = trailCount - 1; i > 0; i--) {
            positions[i * 3] = positions[(i - 1) * 3];
            positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
            positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
          }
          positions[0] = currentPos.x;
          positions[1] = currentPos.y;
          positions[2] = currentPos.z;
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      } else if (!hasArrived.current) {
        hasArrived.current = true;
        // Arrival animation
        if (bodyRef.current) {
          bodyRef.current.rotation.x = 0;
        }
        if (headRef.current) {
          headRef.current.rotation.y = 0;
        }
        onArrived();
      }
    } else {
      // Idle floating at start position
      const t = state.clock.elapsedTime;
      groupRef.current.position.copy(startPos);
      groupRef.current.position.y += Math.sin(t * 2) * 0.1;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      hasArrived.current = false;
    }
  });

  return (
    <group ref={groupRef} position={startPos}>
      {/* Trail */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#1d9bf0"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Body */}
      <mesh ref={bodyRef} position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
        <meshStandardMaterial
          color="#0a1628"
          emissive="#1d9bf0"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshStandardMaterial
          color="#e7e9ea"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.05, 0.37, 0.1]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#1d9bf0" />
      </mesh>
      <mesh position={[0.05, 0.37, 0.1]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#1d9bf0" />
      </mesh>

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial
          color="#1d9bf0"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
