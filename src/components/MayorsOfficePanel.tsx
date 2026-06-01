'use client';

import { useState } from 'react';
import { useSimStore } from '@/lib/store';
import { NewsEvent, SimulationReaction } from '@/types';

interface MayorsOfficePanelProps {
  onTriggerNews: (news: NewsEvent, reactions: SimulationReaction[]) => void;
  isSimulating: boolean;
}

const POLICIES = [
  { label: '💰 Raise Taxes', text: 'Mayor announces 20% tax hike on all citizens to fund city projects', intensity: 8, sentiment: 'negative' },
  { label: '💵 Stimulus Checks', text: 'Mayor signs bill giving $2000 stimulus check to every resident', intensity: 7, sentiment: 'positive' },
  { label: '🚨 Police Crackdown', text: 'Mayor declares strict curfew and increased police presence', intensity: 8, sentiment: 'crisis' },
  { label: '🌾 Subsidize Farming', text: 'Mayor grants massive subsidies to local farmers and food markets', intensity: 6, sentiment: 'positive' },
  { label: '🏗️ Tech Investment', text: 'Mayor announces multi-million dollar investment in local tech sector', intensity: 7, sentiment: 'positive' },
];

export default function MayorsOfficePanel({ onTriggerNews, isSimulating }: MayorsOfficePanelProps) {
  const [policyText, setPolicyText] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const agents = useSimStore((s) => s.agents);
  const addNewsToQueue = useSimStore((s) => s.addNewsToQueue);

  const enactPolicy = async (text: string, int: number, forcedSentiment?: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/mayor-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyText: text, intensity: int, agents }),
      });
      const data = await res.json();
      if (data.success) {
        const newsEvent: NewsEvent = {
          id: `mayor-${Date.now()}`,
          headline: text,
          source: '🏛️ City Hall',
          sentiment: forcedSentiment ? (forcedSentiment as 'positive' | 'negative' | 'neutral' | 'crisis') : (int >= 8 ? 'crisis' : int >= 6 ? 'negative' : 'neutral'),
          intensity: int,
          timestamp: Date.now(),
        };
        addNewsToQueue(newsEvent);
        onTriggerNews(newsEvent, data.reactions);
      }
    } catch (e) {
      console.error('Mayor policy failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        top: 16,
        width: collapsed ? 52 : 300,
        background: 'rgba(10, 20, 40, 0.95)',
        border: '1px solid rgba(100, 150, 255, 0.4)',
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 100,
        boxShadow: '0 8px 40px rgba(50, 100, 255, 0.2)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: collapsed ? 'none' : '1px solid rgba(100,150,255,0.2)',
          cursor: 'pointer',
          background: 'linear-gradient(90deg, rgba(100,150,255,0.1), transparent)'
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏛️</span>
          {!collapsed && (
            <span style={{ color: '#88aaff', fontWeight: 800, fontSize: 14, fontFamily: 'monospace', letterSpacing: 1 }}>
              MAYOR'S OFFICE
            </span>
          )}
        </div>
        {!collapsed && (
          <span style={{ color: '#666', fontSize: 18 }}>→</span>
        )}
      </div>

      {!collapsed && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick Policies */}
          <div>
            <p style={{ color: '#88aaff', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Quick Policies</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              {POLICIES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => enactPolicy(p.text, p.intensity, p.sentiment)}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(100,150,255,0.1)',
                    border: '1px solid rgba(100,150,255,0.3)',
                    borderRadius: 8,
                    color: '#cceeff',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'system-ui',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(100,150,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(100,150,255,0.1)';
                  }}
                >
                  <span style={{ fontSize: 16 }}>{p.label.split(' ')[0]}</span>
                  <span style={{ fontWeight: 500 }}>{p.label.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Policy */}
          <div>
            <p style={{ color: '#88aaff', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Draft Custom Policy</p>
            <textarea
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              placeholder="Draft your mayoral decree here..."
              style={{
                width: '100%',
                height: 80,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(100,150,255,0.3)',
                borderRadius: 8,
                padding: '8px 10px',
                color: '#eee',
                fontSize: 12,
                resize: 'none',
                fontFamily: 'system-ui',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* Impact */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <span style={{ color: '#88aaff', fontSize: 11, whiteSpace: 'nowrap' }}>Impact:</span>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: '#6699ff' }}
              />
              <span style={{ color: '#6699ff', fontWeight: 700, fontSize: 13, width: 20, textAlign: 'right' }}>{intensity}</span>
            </div>

            <button
              onClick={() => enactPolicy(policyText, intensity)}
              disabled={loading || !policyText.trim()}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '10px',
                background: loading ? 'rgba(100,150,255,0.2)' : 'linear-gradient(135deg, #2b6cb0, #2c5282)',
                border: '1px solid rgba(100,150,255,0.5)',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'monospace',
                letterSpacing: 1,
                boxShadow: loading ? 'none' : '0 4px 15px rgba(50,100,255,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ DRAFTING...' : '🏛️ ENACT POLICY'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
