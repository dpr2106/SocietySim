'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NewsEvent, SimulationReaction } from '@/types';
import { useSimStore } from '@/lib/store';
import GodModePanel from '@/components/GodModePanel';
import NewsPanel from '@/components/NewsPanel';
import SimulationHUD from '@/components/SimulationHUD';
import ResourceHUD from '@/components/ResourceHUD';

// Dynamically import the 3D scene (no SSR)
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function Home() {
  const [newsQueue, setNewsQueue] = useState<NewsEvent[]>([]);
  const [activeNews, setActiveNews] = useState<NewsEvent | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const updateAgent = useSimStore((s) => s.updateAgent);
  const storeSetActiveNews = useSimStore((s) => s.setActiveNews);
  const addNewsToQueue = useSimStore((s) => s.addNewsToQueue);
  const updateResources = useSimStore((s) => s.updateResources);

  const handleTriggerNews = useCallback(
    (news: NewsEvent, reactions: SimulationReaction[]) => {
      setActiveNews(news);
      storeSetActiveNews(news);
      setNewsQueue((prev) => [...prev.slice(-4), news]);
      setIsSimulating(true);

      // Apply immediate resource impact based on news sentiment
      let delta = { economy: 0, foodSecurity: 0, publicSafety: 0, socialHarmony: 0 };
      if (news.sentiment === 'crisis') {
        delta = { economy: -news.intensity * 4, foodSecurity: -news.intensity * 3, publicSafety: -news.intensity * 5, socialHarmony: -news.intensity * 4 };
      } else if (news.sentiment === 'negative') {
        delta = { economy: -news.intensity * 2, foodSecurity: -news.intensity * 1, publicSafety: -news.intensity * 2, socialHarmony: -news.intensity * 2 };
      } else if (news.sentiment === 'positive') {
        delta = { economy: news.intensity * 3, foodSecurity: news.intensity * 2, publicSafety: news.intensity * 2, socialHarmony: news.intensity * 4 };
      }
      updateResources(delta);

      // Apply reactions with staggered timing — store speech but DON'T auto-show bubble
      reactions.forEach((reaction, i) => {
        setTimeout(() => {
          updateAgent(reaction.agentId, {
            state: reaction.newState,
            emotion: reaction.emotion,
            emotionIntensity: reaction.emotionIntensity,
            speech: reaction.speech,       // stored — revealed only on click
            speechVisible: false,          // never auto-show
            speedMultiplier: reaction.speedMultiplier,
            targetPosition: reaction.targetPosition || [
              (Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40,
            ],
          });
        }, i * 120);
      });

      // Return to daily routine after 20 seconds
      setTimeout(() => {
        const { agents } = useSimStore.getState();
        
        // Simple helper to pick a random POI of a given type
        // POIs are defined in Village.tsx, but we'll hardcode some fallback coords here 
        // to avoid circular dependencies or complex imports in this simple setup.
        const POI_ZONES = {
          shop: [ [-8,0,-5], [8,0,-5], [-8,0,5], [8,0,5] ],
          social: [ [0,0,4], [0,0,-4], [4,0,0], [-4,0,0] ],
          patrol: [ [-25,0,-25], [25,0,25], [-25,0,25], [25,0,-25], [0,0,-28], [0,0,28] ]
        };

        const pickRandom = (arr: number[][]) => arr[Math.floor(Math.random() * arr.length)] as [number, number, number];

        reactions.forEach((reaction) => {
          const agent = agents.find(a => a.id === reaction.agentId);
          if (!agent) return;

          let routineState: typeof agent.state = 'walking';
          let target: [number, number, number] = pickRandom(POI_ZONES.social);

          if (['Merchant', 'Villain', 'Politician'].includes(agent.archetype)) {
            routineState = 'shopping';
            target = pickRandom(POI_ZONES.shop);
          } else if (['Soldier', 'Hacker', 'Scientist'].includes(agent.archetype)) {
            routineState = 'patrolling';
            target = pickRandom(POI_ZONES.patrol);
          } else if (['Elder', 'Healer', 'Mystic'].includes(agent.archetype)) {
            routineState = 'sitting';
            target = pickRandom(POI_ZONES.social);
          } else {
            routineState = 'socializing';
            target = [(Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10]; // Near fountain/well
          }

          updateAgent(agent.id, {
            state: routineState,
            speedMultiplier: 0.8, // Relaxed pace
            emotionIntensity: 0.1, // Calm
            targetPosition: target,
          });
        });
        setIsSimulating(false);
      }, 20000);
    },
    [updateAgent, storeSetActiveNews]
  );

  // Welcome event on load
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        if (data.headlines?.length) {
          const headline = data.headlines[0];
          const agents = useSimStore.getState().agents;
          const simRes = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ headline: headline.headline, intensity: headline.intensity, agents }),
          });
          const simData = await simRes.json();
          if (simData.success) {
            addNewsToQueue(headline);
            handleTriggerNews(headline, simData.reactions);
          }
        }
      } catch {
        // Silent fail for welcome event
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Passive Economy Generator
  useEffect(() => {
    if (isSimulating) return; // Halt economy during crises

    const tick = setInterval(() => {
      const { agents, updateResources, resources } = useSimStore.getState();
      let delta = { economy: 0, foodSecurity: 0, publicSafety: 0, socialHarmony: 0 };

      // Base decay to simulate natural consumption/entropy if no one is working
      delta.economy -= 0.1;
      delta.foodSecurity -= 0.2;
      delta.socialHarmony -= 0.1;

      agents.forEach(agent => {
        if (agent.state === 'shopping' || agent.archetype === 'Merchant') delta.economy += 0.2;
        if (agent.archetype === 'Farmer' || agent.archetype === 'Healer') delta.foodSecurity += 0.3;
        if (agent.archetype === 'Soldier' || agent.state === 'patrolling') delta.publicSafety += 0.2;
        if (agent.archetype === 'Elder' || agent.state === 'celebrating' || agent.state === 'socializing') delta.socialHarmony += 0.2;
      });

      // Slowly pull things back to 100% naturally if they are low
      if (resources.publicSafety < 100) delta.publicSafety += 0.1;

      updateResources(delta);
    }, 1000);

    return () => clearInterval(tick);
  }, [isSimulating]);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#0a0a1a',
      }}
    >
      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%' }}>
        <Scene />
      </div>

      {/* Top center title */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(8, 8, 20, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '8px 20px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h1
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: 3,
              margin: 0,
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🌍 SOCIETAL SIMULATOR
          </h1>
          <p style={{ color: '#555', fontSize: 10, margin: '2px 0 0', fontFamily: 'monospace', letterSpacing: 1 }}>
            15 AI AGENTS · MULTI-AGENT SOCIETY
          </p>
        </div>
      </div>

      {/* Simulation pulse indicator */}
      {isSimulating && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'rgba(255, 80, 80, 0.15)',
            border: '1px solid rgba(255, 80, 80, 0.5)',
            borderRadius: 20,
            padding: '6px 16px',
            color: '#ff8888',
            fontSize: 11,
            fontFamily: 'monospace',
            letterSpacing: 1,
            backdropFilter: 'blur(8px)',
            animation: 'pulse 1s infinite',
          }}
        >
          ● SIMULATION ACTIVE
        </div>
      )}

      {/* UI Panels */}
      <ResourceHUD />
      <SimulationHUD />
      <GodModePanel onTriggerNews={handleTriggerNews} isSimulating={isSimulating} />
      <NewsPanel newsQueue={newsQueue} activeNews={activeNews} />
    </main>
  );
}
