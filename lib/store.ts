import { create } from 'zustand';
import { Agent, NewsEvent, SimState, Emotion, SocietalHealth } from '@/types';
import { PERSONAS } from '@/lib/personas';

function randomPosition(): [number, number, number] {
  return [
    (Math.random() - 0.5) * 40,
    0,
    (Math.random() - 0.5) * 40,
  ];
}

function initAgents(): Agent[] {
  return PERSONAS.map((p) => ({
    id: p.id,
    name: p.name,
    archetype: p.archetype,
    color: p.color,
    accentColor: p.accentColor,
    position: randomPosition(),
    targetPosition: randomPosition(),
    state: 'idle' as SimState,
    emotion: 'calm' as Emotion,
    emotionIntensity: 0.2,
    speech: '',
    speechVisible: false,
    speedMultiplier: 1.0,
    personality: p.personality,
  }));
}

interface SimStore {
  agents: Agent[];
  activeNews: NewsEvent | null;
  simRunning: boolean;
  tickSpeed: number;
  showGodMode: boolean;
  showHUD: boolean;
  newsQueue: NewsEvent[];
  selectedAgentId: number | null;
  resources: SocietalHealth;

  // Actions
  updateAgent: (id: number, patch: Partial<Agent>) => void;
  setAgents: (agents: Agent[]) => void;
  setActiveNews: (news: NewsEvent | null) => void;
  setSimRunning: (running: boolean) => void;
  setTickSpeed: (speed: number) => void;
  toggleGodMode: () => void;
  toggleHUD: () => void;
  addNewsToQueue: (news: NewsEvent) => void;
  clearSpeechBubble: (id: number) => void;
  setSelectedAgent: (id: number | null) => void;
  updateResources: (delta: Partial<SocietalHealth>) => void;
}

export const useSimStore = create<SimStore>((set) => ({
  agents: initAgents(),
  activeNews: null,
  simRunning: false,
  tickSpeed: 30,
  showGodMode: true,
  showHUD: true,
  newsQueue: [],
  selectedAgentId: null,
  resources: {
    economy: 100,
    foodSecurity: 100,
    publicSafety: 100,
    socialHarmony: 100,
  },

  updateAgent: (id, patch) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  setAgents: (agents) => set({ agents }),

  setActiveNews: (news) => set({ activeNews: news }),

  setSimRunning: (running) => set({ simRunning: running }),

  setTickSpeed: (speed) => set({ tickSpeed: speed }),

  toggleGodMode: () => set((state) => ({ showGodMode: !state.showGodMode })),

  toggleHUD: () => set((state) => ({ showHUD: !state.showHUD })),

  addNewsToQueue: (news) =>
    set((state) => ({ newsQueue: [...state.newsQueue.slice(-4), news] })),

  clearSpeechBubble: (id) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, speechVisible: false, speech: '' } : a
      ),
    })),

  setSelectedAgent: (id) => set({ selectedAgentId: id }),

  updateResources: (delta) =>
    set((state) => ({
      resources: {
        economy: Math.min(100, Math.max(0, state.resources.economy + (delta.economy || 0))),
        foodSecurity: Math.min(100, Math.max(0, state.resources.foodSecurity + (delta.foodSecurity || 0))),
        publicSafety: Math.min(100, Math.max(0, state.resources.publicSafety + (delta.publicSafety || 0))),
        socialHarmony: Math.min(100, Math.max(0, state.resources.socialHarmony + (delta.socialHarmony || 0))),
      },
    })),
}));
