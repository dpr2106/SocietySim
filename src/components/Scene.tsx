'use client';

import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Village from './Village';
import CharacterManager from './CharacterManager';
import { useSimStore } from '@/lib/store';

function RendererSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);
  return null;
}

function SceneContents() {
  const setSelectedAgent = useSimStore((s) => s.setSelectedAgent);

  return (
    <>
      <RendererSetup />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[4, 0.6, 8]}
        inclination={0.51}
        azimuth={0.22}
        rayleigh={1.2}
        turbidity={8}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <Environment preset="sunset" background={false} />

      {/* Stars */}
      <Stars radius={120} depth={60} count={5000} factor={4} saturation={0.1} fade />

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#1a1a2e', 50, 105]} />

      {/* === Lighting rig === */}
      {/* Main sun directional */}
      <directionalLight
        position={[18, 28, 18]}
        intensity={2.4}
        color="#ffe8cc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0001}
      />
      {/* Cool sky fill */}
      <directionalLight position={[-14, 8, -14]} intensity={0.6} color="#9ab4e8" />
      {/* Warm hemisphere */}
      <hemisphereLight args={['#c0d0ff', '#5a4830', 0.75]} />
      {/* Fountain accent glow */}
      <pointLight position={[0, 3, 0]} color="#44aaff" intensity={3.5} distance={14} decay={2} />
      {/* Village warm fill */}
      <pointLight position={[0, 10, 0]} color="#ffcc88" intensity={1.5} distance={45} decay={2} />
      {/* Corner torches */}
      <pointLight position={[20, 2, 20]} color="#ff8833" intensity={2} distance={18} decay={2} />
      <pointLight position={[-20, 2, 20]} color="#ff8833" intensity={2} distance={18} decay={2} />
      <pointLight position={[20, 2, -20]} color="#ff8833" intensity={2} distance={18} decay={2} />
      <pointLight position={[-20, 2, -20]} color="#ff8833" intensity={2} distance={18} decay={2} />

      {/* Camera */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={8}
        maxDistance={75}
        target={[0, 1, 0]}
        makeDefault
      />

      {/* Background click → deselect agent */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        onClick={() => setSelectedAgent(null)}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      <Suspense fallback={null}>
        <Village />
        <CharacterManager />
      </Suspense>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      camera={{ position: [0, 22, 32], fov: 52, near: 0.1, far: 500 }}
      style={{ background: '#0a0a1a' }}
      dpr={[1, 2]}
    >
      <SceneContents />
    </Canvas>
  );
}
