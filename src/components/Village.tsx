'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useSimStore } from '@/lib/store';

export type POIType = 'shop' | 'social' | 'patrol';

export interface POI {
  type: POIType;
  position: [number, number, number];
}

export const POINTS_OF_INTEREST: POI[] = [
  // Shops
  { type: 'shop', position: [-8, 0, -5] },
  { type: 'shop', position: [8, 0, -5] },
  { type: 'shop', position: [-8, 0, 5] },
  { type: 'shop', position: [8, 0, 5] },
  // Social/Benches
  { type: 'social', position: [0, 0, 4] },
  { type: 'social', position: [0, 0, -4] },
  { type: 'social', position: [4, 0, 0] },
  { type: 'social', position: [-4, 0, 0] },
  // Patrol Nodes
  { type: 'patrol', position: [-25, 0, -25] },
  { type: 'patrol', position: [25, 0, 25] },
  { type: 'patrol', position: [-25, 0, 25] },
  { type: 'patrol', position: [25, 0, -25] },
  { type: 'patrol', position: [0, 0, -28] },
  { type: 'patrol', position: [0, 0, 28] },
];

// A single building block
function Building({
  position,
  size,
  color,
  roofColor,
  height,
}: {
  position: [number, number, number];
  size: [number, number];
  color: string;
  roofColor: string;
  height: number;
}) {
  return (
    <group position={position}>
      {/* Main body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], height, size[1]]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Roof pyramid */}
      <mesh position={[0, height + 0.5, 0]} castShadow>
        <coneGeometry args={[Math.max(size[0], size[1]) * 0.75, 1, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.5, size[1] / 2 + 0.01]}>
        <boxGeometry args={[0.4, 0.8, 0.05]} />
        <meshStandardMaterial color="#5d3a1a" />
      </mesh>
      {/* Window */}
      <mesh position={[0.5, height * 0.6, size[1] / 2 + 0.01]}>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// A tree
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color="#2d7a2d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial color="#3a9a3a" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Animated fountain
function Fountain({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      (waterRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Basin */}
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 0.6, 16]} />
        <meshStandardMaterial color="#8a9bb0" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 1, 12]} />
        <meshStandardMaterial color="#c0c8d0" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Water */}
      <mesh ref={waterRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color="#44aaff"
          emissive="#2288ff"
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Road segment
function Road({
  position,
  size,
  horizontal,
}: {
  position: [number, number, number];
  size: number;
  horizontal: boolean;
}) {
  return (
    <mesh position={[position[0], 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={horizontal ? [size, 2] : [2, size]} />
      <meshStandardMaterial color="#3a3a4a" roughness={0.95} />
    </mesh>
  );
}

// Boundary wall segment
function WallSegment({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[size[0], 1.5, size[1]]} />
      <meshStandardMaterial color="#a0917a" roughness={0.9} />
    </mesh>
  );
}

// Market Stall / Shop
function Shop({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base/Table */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.8, 1]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* Posts */}
      <mesh position={[-0.9, 1.2, -0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.6]} />
        <meshStandardMaterial color="#5c3a21" />
      </mesh>
      <mesh position={[0.9, 1.2, -0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.6]} />
        <meshStandardMaterial color="#5c3a21" />
      </mesh>
      {/* Awning */}
      <mesh position={[0, 2.1, 0.1]} rotation={[0.2, 0, 0]} castShadow>
        <planeGeometry args={[2.2, 1.5]} />
        <meshStandardMaterial color="#e74c3c" side={THREE.DoubleSide} />
      </mesh>
      {/* Awning stripes */}
      <mesh position={[0, 2.101, 0.1]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[2.2, 1.5]} />
        <meshStandardMaterial color="#f1c40f" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Bench
function Bench({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#6e4b30" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.5, 0.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.3]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.8} />
      </mesh>
      <mesh position={[0.5, 0.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.3]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Well (replaces fountain or adds to it)
function Well({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base stone ring */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.8, 12]} />
        <meshStandardMaterial color="#7f8c8d" roughness={0.9} />
      </mesh>
      {/* Inner water (dark) */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 12]} />
        <meshStandardMaterial color="#2980b9" roughness={0.1} />
      </mesh>
      {/* Wooden posts */}
      <mesh position={[-0.6, 1.3, 0]} castShadow>
        <boxGeometry args={[0.1, 1.8, 0.1]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 1.3, 0]} castShadow>
        <boxGeometry args={[0.1, 1.8, 0.1]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.9} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[1, 0.8, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Lamp Post
function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 3, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} />
      </mesh>
      {/* Light housing */}
      <mesh position={[0, 3.1, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Glow bulb */}
      <mesh position={[0, 3.05, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 3.1, 0]} intensity={1} color="#f1c40f" distance={10} decay={2} />
    </group>
  );
}

export default function Village() {
  const buildingData = useMemo(() => [
    { position: [-15, 0, -15] as [number, number, number], size: [3, 3] as [number, number], color: '#e8d5a3', roofColor: '#c0392b', height: 3 },
    { position: [15, 0, -15] as [number, number, number], size: [4, 3] as [number, number], color: '#d4b896', roofColor: '#2980b9', height: 4 },
    { position: [-15, 0, 15] as [number, number, number], size: [3, 4] as [number, number], color: '#c8b89a', roofColor: '#27ae60', height: 3.5 },
    { position: [15, 0, 15] as [number, number, number], size: [5, 3] as [number, number], color: '#ddd0b8', roofColor: '#8e44ad', height: 5 },
    { position: [0, 0, -18] as [number, number, number], size: [6, 4] as [number, number], color: '#e0c9a8', roofColor: '#e67e22', height: 6 },
    { position: [-20, 0, 0] as [number, number, number], size: [3, 3] as [number, number], color: '#c4b49a', roofColor: '#c0392b', height: 2.5 },
    { position: [20, 0, 0] as [number, number, number], size: [3, 5] as [number, number], color: '#d8c8b0', roofColor: '#16a085', height: 4 },
    { position: [0, 0, 18] as [number, number, number], size: [4, 4] as [number, number], color: '#e4d4b4', roofColor: '#d35400', height: 3 },
    { position: [-8, 0, -20] as [number, number, number], size: [2, 2] as [number, number], color: '#d0c0a8', roofColor: '#1abc9c', height: 2 },
    { position: [8, 0, -20] as [number, number, number], size: [2, 3] as [number, number], color: '#c8b8a0', roofColor: '#9b59b6', height: 2.5 },
  ], []);

  const treePositions: [number, number, number][] = useMemo(() => [
    [-10, 0, -5], [10, 0, -5], [-5, 0, 10], [5, 0, 10],
    [-22, 0, -8], [22, 0, 8], [-8, 0, -22], [8, 0, 22],
    [-12, 0, 12], [12, 0, -12], [-18, 0, 18], [18, 0, -18],
    [-3, 0, -8], [3, 0, 8], [0, 0, -12],
  ], []);

  const economy = useSimStore(s => s.resources.economy);
  const socialHarmony = useSimStore(s => s.resources.socialHarmony);

  // Dynamic colors
  const isRioting = socialHarmony < 30;
  
  // Grass turns brown when economy crashes
  const grassColor = useMemo(() => {
    return new THREE.Color('#5a7a3a').lerp(new THREE.Color('#554433'), 1 - (economy / 100)).getStyle();
  }, [economy]);

  // Grid gets dimmer and redder when economy is bad
  const gridColor = useMemo(() => {
    return new THREE.Color('#4a6a2a').lerp(new THREE.Color('#aa3333'), 1 - (economy / 100)).getStyle();
  }, [economy]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70, 70, 70]} />
        <meshStandardMaterial
          color={grassColor}
          roughness={0.95}
          wireframe={false}
        />
      </mesh>

      {/* Atmospheric Sparkles */}
      <Sparkles count={800} scale={60} size={3} speed={0.4} opacity={0.15} color="#ffe8cc" position={[0, 4, 0]} />

      {/* Grid lines on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[60, 60, 30, 30]} />
        <meshStandardMaterial
          color={gridColor}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Roads */}
      <Road position={[0, 0, 0]} size={60} horizontal />
      <Road position={[0, 0, 0]} size={60} horizontal={false} />
      <Road position={[-10, 0, 0]} size={40} horizontal={false} />
      <Road position={[10, 0, 0]} size={40} horizontal={false} />
      <Road position={[0, 0, -10]} size={40} horizontal />
      <Road position={[0, 0, 10]} size={40} horizontal />

      {/* Central Well (replaces Fountain) */}
      <Well position={[0, 0, 0]} />

      {/* Buildings */}
      {buildingData.map((b, i) => (
        <Building key={i} {...b} />
      ))}

      {/* Shops */}
      <Shop position={[-10, 0, -10]} />
      <Shop position={[10, 0, -10]} />
      <Shop position={[-10, 0, 10]} />
      <Shop position={[10, 0, 10]} />

      {/* Benches */}
      <Bench position={[-2, 0, -3]} />
      <Bench position={[2, 0, -3]} />
      <Bench position={[-2, 0, 3]} rotation={[0, Math.PI, 0]} />
      <Bench position={[2, 0, 3]} rotation={[0, Math.PI, 0]} />

      {/* Lamp Posts */}
      <LampPost position={[-4, 0, -4]} />
      <LampPost position={[4, 0, -4]} />
      <LampPost position={[-4, 0, 4]} />
      <LampPost position={[4, 0, 4]} />

      {/* Trees */}
      {treePositions.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}

      {/* Boundary walls */}
      <WallSegment position={[0, 0.75, -30]} size={[62, 1]} />
      <WallSegment position={[0, 0.75, 30]} size={[62, 1]} />
      <WallSegment position={[-30, 0.75, 0]} size={[1, 60]} />
      <WallSegment position={[30, 0.75, 0]} size={[1, 60]} />

      {/* Corner towers */}
      {[[-30, -30], [30, -30], [-30, 30], [30, 30]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.5, z]} castShadow>
          <boxGeometry args={[2, 3, 2]} />
          <meshStandardMaterial color="#8a7a6a" roughness={0.85} />
        </mesh>
      ))}

      {/* Decorative rocks */}
      {[[-7, 0, -7], [7, 0, 7], [-7, 0, 7], [7, 0, -7]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <dodecahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#7a7a7a" roughness={0.9} />
        </mesh>
      ))}

      {/* Ambient light glow at fountain */}
      <pointLight position={[0, 2, 0]} color="#4488ff" intensity={2} distance={8} />

      {/* Riot Warning Lights */}
      {isRioting && (
        <group>
          <pointLight position={[-15, 5, -15]} color="#ff0000" intensity={4} distance={20} />
          <pointLight position={[15, 5, 15]} color="#ff0000" intensity={4} distance={20} />
          <pointLight position={[-15, 5, 15]} color="#ff0000" intensity={4} distance={20} />
          <pointLight position={[15, 5, -15]} color="#ff0000" intensity={4} distance={20} />
        </group>
      )}
    </group>
  );
}
