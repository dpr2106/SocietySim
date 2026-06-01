'use client';

import { useSimStore } from '@/lib/store';

export default function ResourceHUD() {
  const resources = useSimStore((s) => s.resources);
  const showHUD = useSimStore((s) => s.showHUD);

  if (!showHUD) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 260,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'rgba(8, 8, 20, 0.92)',
          border: '1px solid rgba(100, 150, 255, 0.3)',
          borderRadius: 16,
          padding: '12px 14px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 40px rgba(50, 100, 255, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <span style={{ color: '#88aaff', fontWeight: 800, fontSize: 13, fontFamily: 'monospace', letterSpacing: 1 }}>
            SOCIETAL HEALTH
          </span>
        </div>

        <HealthBar icon="📈" label="Economy" value={resources.economy} color="#44bbff" />
        <HealthBar icon="🌾" label="Food Security" value={resources.foodSecurity} color="#44ff88" />
        <HealthBar icon="🛡️" label="Public Safety" value={resources.publicSafety} color="#ffaa44" />
        <HealthBar icon="🕊️" label="Social Harmony" value={resources.socialHarmony} color="#ff44ff" />
      </div>
    </div>
  );
}

function HealthBar({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  const isCritical = value < 30;
  const displayColor = isCritical ? '#ff4444' : color;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>{icon}</span>
          <span style={{ color: '#ccc', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
        </div>
        <span style={{ color: displayColor, fontSize: '10px', fontWeight: 800, fontFamily: 'monospace' }}>
          {Math.floor(value)}%
        </span>
      </div>
      
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: '100%',
            background: displayColor,
            borderRadius: '3px',
            transition: 'width 0.5s ease, background 0.5s ease',
            boxShadow: `0 0 8px ${displayColor}88`,
          }}
        />
      </div>
    </div>
  );
}
