'use client';

import { useSimStore } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryChart() {
  const history = useSimStore((s) => s.history);
  const showHUD = useSimStore((s) => s.showHUD);

  if (!showHUD || history.length < 2) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '140px',
        background: 'rgba(8, 8, 20, 0.85)',
        border: '1px solid rgba(100, 150, 255, 0.2)',
        borderRadius: 16,
        padding: '12px 16px 8px',
        backdropFilter: 'blur(12px)',
        zIndex: 90,
        pointerEvents: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ color: '#88aaff', fontSize: 11, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>
          SOCIETAL HEALTH INDEX (LIVE)
        </span>
        <div style={{ display: 'flex', gap: 12, fontSize: 10, fontFamily: 'monospace', color: '#ccc' }}>
          <span style={{ color: '#44bbff' }}>● Eco</span>
          <span style={{ color: '#44ff88' }}>● Food</span>
          <span style={{ color: '#ffaa44' }}>● Safe</span>
          <span style={{ color: '#ff44ff' }}>● Harm</span>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '90px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #444', borderRadius: 8, fontSize: 12 }}
              itemStyle={{ fontFamily: 'monospace', fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
            />
            <Line type="monotone" dataKey="economy" stroke="#44bbff" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="foodSecurity" stroke="#44ff88" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="publicSafety" stroke="#ffaa44" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="socialHarmony" stroke="#ff44ff" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
