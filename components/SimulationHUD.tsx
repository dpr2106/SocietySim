'use client';

import { useState } from 'react';
import { useSimStore } from '@/lib/store';
import { SimState, Emotion } from '@/types';

function getStateEmoji(state: SimState): string {
  const map: Record<SimState, string> = {
    idle: '😐', walking: '🚶', panicking: '😱', gathering: '🤝',
    fleeing: '🏃', debating: '💬', meditating: '🧘', celebrating: '🎉',
  };
  return map[state] || '❓';
}

function getEmotionColor(emotion: Emotion): string {
  const map: Record<Emotion, string> = {
    calm: '#44bbff', fearful: '#ff4444', angry: '#ff8800',
    happy: '#44ff88', curious: '#ffff44', sad: '#8888ff', defiant: '#ff44ff',
  };
  return map[emotion] || '#ffffff';
}

export default function SimulationHUD() {
  const [collapsed, setCollapsed] = useState(false);
  const agents = useSimStore((s) => s.agents);
  const activeNews = useSimStore((s) => s.activeNews);
  const simRunning = useSimStore((s) => s.simRunning);

  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        top: 16,
        width: collapsed ? 52 : 260,
        background: 'rgba(8, 8, 20, 0.92)',
        border: '1px solid rgba(100, 150, 255, 0.3)',
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 100,
        boxShadow: '0 8px 40px rgba(50, 100, 255, 0.15)',
        maxHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: collapsed ? 'none' : '1px solid rgba(100,150,255,0.2)',
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🌍</span>
          {!collapsed && (
            <span style={{ color: '#88aaff', fontWeight: 800, fontSize: 13, fontFamily: 'monospace', letterSpacing: 1 }}>
              AGENT STATUS
            </span>
          )}
        </div>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {simRunning && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#44ff88', display: 'block', boxShadow: '0 0 6px #44ff88' }} />
            )}
            <span style={{ color: '#666', fontSize: 16 }}>→</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', padding: '8px 12px 12px' }}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 4px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Color dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: agent.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${agent.color}`,
                }}
              />

              {/* Name */}
              <span style={{ color: '#ddd', fontSize: 11, fontWeight: 600, width: 36, flexShrink: 0, fontFamily: 'system-ui' }}>
                {agent.name}
              </span>

              {/* State emoji */}
              <span style={{ fontSize: 13, flexShrink: 0 }}>{getStateEmoji(agent.state)}</span>

              {/* Emotion intensity bar */}
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${agent.emotionIntensity * 100}%`,
                    height: '100%',
                    background: getEmotionColor(agent.emotion),
                    borderRadius: 2,
                    transition: 'width 0.5s ease, background 0.5s ease',
                    boxShadow: `0 0 4px ${getEmotionColor(agent.emotion)}`,
                  }}
                />
              </div>

              {/* Archetype */}
              <span style={{ color: '#555', fontSize: 9, width: 52, textAlign: 'right', flexShrink: 0, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                {agent.archetype}
              </span>
            </div>
          ))}

          {/* Legend */}
          <div style={{ marginTop: 10, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <p style={{ color: '#555', fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              States
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {(['idle', 'walking', 'panicking', 'gathering', 'fleeing', 'debating', 'meditating', 'celebrating'] as SimState[]).map((s) => (
                <span key={s} style={{ color: '#666', fontSize: 9, fontFamily: 'monospace' }}>
                  {getStateEmoji(s)} {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
