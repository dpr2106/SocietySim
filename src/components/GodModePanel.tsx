'use client';

import { useState, useRef } from 'react';
import { useSimStore } from '@/lib/store';
import { NewsEvent, SimulationReaction } from '@/types';

interface GodModePanelProps {
  onTriggerNews: (news: NewsEvent, reactions: SimulationReaction[]) => void;
  isSimulating: boolean;
}

const QUICK_CRISES = [
  { label: '☄️ Meteor Strike', text: 'Massive meteorite impacts city center — mass evacuation ordered', intensity: 10 },
  { label: '🌊 Mega Tsunami', text: 'Giant tsunami wave approaching all coastal cities within hours', intensity: 9 },
  { label: '🎉 World Peace', text: 'All world leaders sign historic universal peace and prosperity treaty', intensity: 8 },
  { label: '🦠 Plague', text: 'Unknown deadly virus spreads exponentially across all continents', intensity: 9 },
  { label: '💰 Gold Rush', text: 'Unlimited free money discovered — government sends $10M to every citizen', intensity: 8 },
  { label: '👾 Alien Invasion', text: 'Confirmed alien warships entering atmosphere — they demand our leaders', intensity: 10 },
];

export default function GodModePanel({ onTriggerNews, isSimulating }: GodModePanelProps) {
  const [crisisText, setCrisisText] = useState('');
  const [intensity, setIntensity] = useState(7);
  const [loading, setLoading] = useState(false);
  const [fetchingNews, setFetchingNews] = useState(false);
  const [autoSim, setAutoSim] = useState(false);
  const autoSimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [tickSpeed, setTickSpeed] = useState(30);
  const [collapsed, setCollapsed] = useState(false);

  const agents = useSimStore((s) => s.agents);
  const setSimRunning = useSimStore((s) => s.setSimRunning);
  const addNewsToQueue = useSimStore((s) => s.addNewsToQueue);

  const injectCrisis = async (text: string, int: number) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/god-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crisisText: text, intensity: int, agents }),
      });
      const data = await res.json();
      if (data.success) {
        const newsEvent: NewsEvent = {
          id: `god-${Date.now()}`,
          headline: text,
          source: '⚡ God Mode',
          sentiment: int >= 8 ? 'crisis' : int >= 6 ? 'negative' : 'neutral',
          intensity: int,
          timestamp: Date.now(),
        };
        addNewsToQueue(newsEvent);
        onTriggerNews(newsEvent, data.reactions);
      }
    } catch (e) {
      console.error('God mode inject failed', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveNews = async () => {
    setFetchingNews(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.headlines?.length) {
        const headline = data.headlines[Math.floor(Math.random() * data.headlines.length)];
        const simRes = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ headline: headline.headline, intensity: headline.intensity, agents }),
        });
        const simData = await simRes.json();
        if (simData.success) {
          addNewsToQueue(headline);
          onTriggerNews(headline, simData.reactions);
        }
      }
    } catch (e) {
      console.error('News fetch failed', e);
    } finally {
      setFetchingNews(false);
    }
  };

  const toggleAutoSim = () => {
    if (autoSim) {
      if (autoSimRef.current) clearInterval(autoSimRef.current);
      autoSimRef.current = null;
      setAutoSim(false);
      setSimRunning(false);
    } else {
      setAutoSim(true);
      setSimRunning(true);
      fetchLiveNews();
      autoSimRef.current = setInterval(fetchLiveNews, tickSpeed * 1000);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: 16,
        width: collapsed ? 52 : 300,
        background: 'rgba(8, 8, 20, 0.92)',
        border: '1px solid rgba(255, 80, 80, 0.4)',
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 100,
        boxShadow: '0 8px 40px rgba(255, 50, 50, 0.2)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,80,80,0.2)',
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          {!collapsed && (
            <span style={{ color: '#ff6b6b', fontWeight: 800, fontSize: 14, fontFamily: 'monospace', letterSpacing: 1 }}>
              GOD MODE
            </span>
          )}
        </div>
        {!collapsed && (
          <span style={{ color: '#666', fontSize: 18 }}>←</span>
        )}
      </div>

      {!collapsed && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick crises */}
          <div>
            <p style={{ color: '#aaa', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Events</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {QUICK_CRISES.map((c, i) => (
                <button
                  key={i}
                  onClick={() => injectCrisis(c.text, c.intensity)}
                  disabled={loading}
                  style={{
                    padding: '6px 8px',
                    background: 'rgba(255,100,100,0.1)',
                    border: '1px solid rgba(255,100,100,0.3)',
                    borderRadius: 8,
                    color: '#ffaaaa',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'system-ui',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(255,100,100,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(255,100,100,0.1)';
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom crisis */}
          <div>
            <p style={{ color: '#aaa', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Custom Crisis</p>
            <textarea
              value={crisisText}
              onChange={(e) => setCrisisText(e.target.value)}
              placeholder="Type your custom world event here..."
              style={{
                width: '100%',
                height: 80,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,100,100,0.3)',
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

            {/* Intensity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <span style={{ color: '#aaa', fontSize: 11, whiteSpace: 'nowrap' }}>Intensity:</span>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: '#ff6b6b' }}
              />
              <span style={{ color: '#ff6b6b', fontWeight: 700, fontSize: 13, width: 20, textAlign: 'right' }}>{intensity}</span>
            </div>

            <button
              onClick={() => injectCrisis(crisisText, intensity)}
              disabled={loading || !crisisText.trim()}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '10px',
                background: loading ? 'rgba(255,100,100,0.2)' : 'linear-gradient(135deg, #ff4444, #cc0000)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'monospace',
                letterSpacing: 1,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(255,0,0,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ PROCESSING...' : '⚡ INJECT CRISIS'}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

          {/* Live News Button */}
          <button
            onClick={fetchLiveNews}
            disabled={fetchingNews}
            style={{
              padding: '10px',
              background: 'rgba(68,136,255,0.15)',
              border: '1px solid rgba(68,136,255,0.4)',
              borderRadius: 10,
              color: '#88aaff',
              fontWeight: 700,
              fontSize: 12,
              cursor: fetchingNews ? 'wait' : 'pointer',
              fontFamily: 'system-ui',
            }}
          >
            {fetchingNews ? '📡 Fetching...' : '📡 Fetch Live News'}
          </button>

          {/* Auto-sim */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#aaa', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Auto Simulate</span>
              <button
                onClick={toggleAutoSim}
                style={{
                  padding: '4px 12px',
                  background: autoSim ? 'rgba(100,255,100,0.2)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${autoSim ? 'rgba(100,255,100,0.5)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 20,
                  color: autoSim ? '#88ff88' : '#aaa',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {autoSim ? '⏸ STOP' : '▶ START'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#888', fontSize: 10, whiteSpace: 'nowrap' }}>Every {tickSpeed}s</span>
              <input
                type="range"
                min={10}
                max={120}
                value={tickSpeed}
                onChange={(e) => setTickSpeed(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: '#44ff88' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
