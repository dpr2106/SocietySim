'use client';

import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Agent, SimState } from '@/types';
import { useSimStore } from '@/lib/store';

interface CharacterProps {
  agent: Agent;
}

const STATE_COLORS: Record<SimState, string> = {
  idle: '#888888',
  walking: '#aaaaaa',
  panicking: '#ff2222',
  gathering: '#2266ff',
  fleeing: '#ff8800',
  debating: '#cc22ff',
  meditating: '#00ddcc',
  celebrating: '#ffdd00',
};

const STATE_EMOJI: Record<SimState, string> = {
  idle: '😐', walking: '🚶', panicking: '😱', gathering: '🤝',
  fleeing: '🏃', debating: '💬', meditating: '🧘', celebrating: '🎉',
};

const EMOTION_EMISSIVE: Record<string, string> = {
  calm: '#001133', fearful: '#330000', angry: '#331100',
  happy: '#003311', curious: '#222200', sad: '#000033', defiant: '#220033',
};

export default function Character({ agent }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const outlineRef = useRef<THREE.Mesh>(null);

  const selectedAgentId = useSimStore((s) => s.selectedAgentId);
  const setSelectedAgent = useSimStore((s) => s.setSelectedAgent);
  const isSelected = selectedAgentId === agent.id;

  const currentPos = useRef<THREE.Vector3>(
    new THREE.Vector3(agent.position[0], 0, agent.position[2])
  );
  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  const handleClick = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setSelectedAgent(isSelected ? null : agent.id);
  }, [isSelected, agent.id, setSelectedAgent]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const target = new THREE.Vector3(agent.targetPosition[0], 0, agent.targetPosition[2]);
    const speed = 1.0 * agent.speedMultiplier * delta;
    const distToTarget = currentPos.current.distanceTo(target);
    const isMoving = distToTarget > 0.3;

    if (isMoving) {
      const dir = target.clone().sub(currentPos.current).normalize();
      currentPos.current.addScaledVector(dir, Math.min(speed, distToTarget));
      const angle = Math.atan2(dir.x, dir.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, 0.15);
    }

    groupRef.current.position.copy(currentPos.current);

    const t = Date.now() * 0.001 + timeOffset;
    const freq = isMoving ? agent.speedMultiplier * 3 : 0.5;
    const swing = isMoving ? 0.5 : 0.05;

    if (bodyRef.current) {
      const bobAmount = isMoving ? 0.07 : 0.02;
      bodyRef.current.position.y = Math.abs(Math.sin(t * freq)) * bobAmount;

      if (agent.state === 'panicking') {
        bodyRef.current.rotation.z = Math.sin(t * 9) * 0.18;
        bodyRef.current.rotation.x = Math.sin(t * 7) * 0.08;
      } else if (agent.state === 'celebrating') {
        bodyRef.current.rotation.z = Math.sin(t * 4) * 0.22;
        bodyRef.current.position.y += Math.abs(Math.sin(t * 5)) * 0.12;
      } else if (agent.state === 'meditating') {
        bodyRef.current.position.y = 0.05 + Math.sin(t * 0.6) * 0.04;
        bodyRef.current.rotation.z = 0;
        bodyRef.current.rotation.x = 0;
      } else {
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, 0.12);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.12);
      }
    }

    // Head look-around
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.7) * 0.3;
      if (agent.state === 'panicking') headRef.current.rotation.y = Math.sin(t * 5) * 0.5;
      if (agent.state === 'meditating') headRef.current.rotation.x = -0.2;
    }

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(t * freq) * swing;
      rightLegRef.current.rotation.x = -Math.sin(t * freq) * swing;
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (agent.state === 'debating' || agent.state === 'gathering') {
        leftArmRef.current.rotation.x = Math.sin(t * 2.5) * 0.7 - 0.3;
        rightArmRef.current.rotation.x = Math.cos(t * 2.0) * 0.5 - 0.2;
        leftArmRef.current.rotation.z = -0.3;
        rightArmRef.current.rotation.z = 0.3;
      } else if (agent.state === 'meditating') {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.6, 0.05);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.6, 0.05);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.05);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05);
      } else if (agent.state === 'celebrating') {
        leftArmRef.current.rotation.x = Math.sin(t * 4) * 1.1 - 1.0;
        rightArmRef.current.rotation.x = -Math.sin(t * 4) * 1.1 - 1.0;
        leftArmRef.current.rotation.z = 0.3;
        rightArmRef.current.rotation.z = -0.3;
      } else {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.25, 0.08);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.25, 0.08);
        leftArmRef.current.rotation.x = -Math.sin(t * freq) * swing * 0.7;
        rightArmRef.current.rotation.x = Math.sin(t * freq) * swing * 0.7;
      }
    }

    // Pulse selection outline
    if (outlineRef.current) {
      if (isSelected) {
        const pulse = 1.0 + Math.sin(t * 4) * 0.04;
        outlineRef.current.scale.setScalar(pulse);
        outlineRef.current.visible = true;
      } else {
        outlineRef.current.visible = false;
      }
    }
  });

  const stateColor = STATE_COLORS[agent.state] || agent.color;
  const emissiveColor = EMOTION_EMISSIVE[agent.emotion] || '#000000';

  return (
    <group ref={groupRef} position={[agent.position[0], 0, agent.position[2]]} onClick={handleClick}>
      <group ref={bodyRef}>

        {/* Selection halo (ring on ground) */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.55, 0.75, 32]} />
            <meshStandardMaterial
              color={agent.color}
              emissive={agent.color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        )}

        {/* Faction halo (ring on ground) */}
        {agent.faction && agent.faction !== 'Neutral' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
            <ringGeometry args={[0.6, 0.8, 32]} />
            <meshStandardMaterial
              color={agent.faction === 'Order' ? '#0088ff' : '#ff0000'}
              emissive={agent.faction === 'Order' ? '#0088ff' : '#ff0000'}
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}

        {/* Head */}
        <mesh ref={headRef} position={[0, 2.05, 0]} castShadow>
          <sphereGeometry args={[0.29, 20, 20]} />
          <meshStandardMaterial
            color={agent.accentColor}
            roughness={0.3}
            metalness={0.2}
            emissive={emissiveColor}
            emissiveIntensity={agent.emotionIntensity * 0.6}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.11, 2.1, 0.25]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.5} />
        </mesh>
        <mesh position={[0.11, 2.1, 0.25]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.5} />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.09, 2.12, 0.27]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0.13, 2.12, 0.27]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.76, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.15, 12]} />
          <meshStandardMaterial color={agent.accentColor} roughness={0.4} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[0.58, 0.72, 0.32]} />
          <meshStandardMaterial
            color={stateColor}
            roughness={0.6}
            metalness={0.1}
            emissive={emissiveColor}
            emissiveIntensity={agent.emotionIntensity * 0.4}
          />
        </mesh>

        {/* Chest detail stripe */}
        <mesh position={[0, 1.35, 0.165]}>
          <boxGeometry args={[0.18, 0.45, 0.02]} />
          <meshStandardMaterial
            color={agent.accentColor}
            roughness={0.4}
            emissive={agent.color}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Left Arm */}
        <group position={[-0.39, 1.45, 0]}>
          <mesh ref={leftArmRef} position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
            <meshStandardMaterial color={stateColor} roughness={0.5} metalness={0.05} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group position={[0.39, 1.45, 0]}>
          <mesh ref={rightArmRef} position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.38, 4, 8]} />
            <meshStandardMaterial color={stateColor} roughness={0.5} metalness={0.05} />
          </mesh>
        </group>

        {/* Hips */}
        <mesh position={[0, 0.88, 0]}>
          <boxGeometry args={[0.52, 0.22, 0.3]} />
          <meshStandardMaterial color={agent.color} roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Left Leg */}
        <group position={[-0.18, 0.76, 0]}>
          <mesh ref={leftLegRef} position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.48, 4, 8]} />
            <meshStandardMaterial color={agent.color} roughness={0.65} metalness={0.05} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group position={[0.18, 0.76, 0]}>
          <mesh ref={rightLegRef} position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.48, 4, 8]} />
            <meshStandardMaterial color={agent.color} roughness={0.65} metalness={0.05} />
          </mesh>
        </group>

        {/* Name tag (always visible) */}
        <Html
          position={[0, 2.75, 0]}
          center
          occlude={false}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {/* Name tag */}
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: agent.accentColor,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
              border: `1px solid ${agent.color}55`,
              fontFamily: 'monospace',
              letterSpacing: 0.5,
              boxShadow: isSelected ? `0 0 10px ${agent.color}88` : 'none',
            }}>
              {STATE_EMOJI[agent.state]} {agent.name}
            </div>

            {/* Click hint when not selected */}
            {!isSelected && (
              <div style={{
                color: 'rgba(255,255,255,0.25)',
                fontSize: 8,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}>
                click to inspect
              </div>
            )}

            {/* Speech bubble — ONLY when selected */}
            {isSelected && agent.speech && (
              <div style={{
                position: 'relative',
                background: 'rgba(15, 15, 30, 0.97)',
                border: `2px solid ${agent.color}`,
                borderRadius: 12,
                padding: '12px 16px',
                width: 320,
                textAlign: 'left',
                boxShadow: `0 4px 24px ${agent.color}66, 0 0 40px ${agent.color}22`,
                animation: 'fadeInUp 0.25s ease',
                fontFamily: 'system-ui',
                backdropFilter: 'blur(8px)',
              }}>
                {/* Persona header */}
                <div style={{
                  color: agent.accentColor,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                  fontFamily: 'monospace',
                }}>
                  {agent.archetype}
                </div>
                {/* Speech text */}
                <div style={{
                  color: '#ffffff',
                  fontSize: 12,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}>
                  "{agent.speech}"
                </div>
                {/* Bubble tail */}
                <div style={{
                  position: 'absolute',
                  bottom: -9,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `9px solid ${agent.color}`,
                }} />
              </div>
            )}

            {/* "No thoughts yet" when selected but no speech */}
            {isSelected && !agent.speech && (
              <div style={{
                background: 'rgba(10,10,25,0.9)',
                border: `1px dashed ${agent.color}55`,
                borderRadius: 10,
                padding: '6px 12px',
                color: '#666',
                fontSize: 11,
                fontFamily: 'monospace',
                fontStyle: 'italic',
              }}>
                Waiting for a news event...
              </div>
            )}
          </div>
        </Html>
      </group>

      {/* Ground shadow disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.25} roughness={1} />
      </mesh>
    </group>
  );
}
