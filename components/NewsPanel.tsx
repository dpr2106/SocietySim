'use client';

import { useSimStore } from '@/lib/store';
import { NewsEvent } from '@/types';

interface NewsPanelProps {
  newsQueue: NewsEvent[];
  activeNews: NewsEvent | null;
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return '#44ff88';
    case 'negative': return '#ff8844';
    case 'crisis': return '#ff4444';
    default: return '#aaaaff';
  }
}

function getSentimentLabel(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return '🟢 POSITIVE';
    case 'negative': return '🟡 NEGATIVE';
    case 'crisis': return '🔴 CRISIS';
    default: return '⚪ NEUTRAL';
  }
}

export default function NewsPanel({ newsQueue, activeNews }: NewsPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(6, 6, 18, 0.92)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        padding: '10px 20px',
      }}
    >
      {/* Active headline */}
      {activeNews && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: getSentimentColor(activeNews.sentiment),
              textTransform: 'uppercase',
              letterSpacing: 2,
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              animation: 'pulse 1s infinite',
            }}
          >
            ● LIVE
          </span>
          <span
            style={{
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'system-ui',
              flex: 1,
            }}
          >
            {activeNews.headline}
          </span>
          <span
            style={{
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 20,
              background: `${getSentimentColor(activeNews.sentiment)}22`,
              color: getSentimentColor(activeNews.sentiment),
              border: `1px solid ${getSentimentColor(activeNews.sentiment)}44`,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {getSentimentLabel(activeNews.sentiment)}
          </span>
          <span
            style={{
              fontSize: 10,
              color: '#888',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}
          >
            INTENSITY: {activeNews.intensity}/10
          </span>
        </div>
      )}

      {/* News ticker */}
      <div
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 48,
            animation: 'ticker 30s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {[...newsQueue, ...newsQueue].map((news, i) => (
            <span
              key={i}
              style={{
                color: getSentimentColor(news.sentiment),
                fontSize: 11,
                fontFamily: 'monospace',
                opacity: 0.7,
              }}
            >
              ◆ {news.headline} — {news.source}
            </span>
          ))}
          {newsQueue.length === 0 && (
            <span style={{ color: '#555', fontSize: 11, fontFamily: 'monospace' }}>
              ◆ Simulation idle. Use God Mode to inject an event or fetch live news. ◆
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
