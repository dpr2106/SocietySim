export type SimState =
  | 'idle'
  | 'walking'
  | 'panicking'
  | 'gathering'
  | 'fleeing'
  | 'debating'
  | 'meditating'
  | 'celebrating'
  | 'shopping'
  | 'sitting'
  | 'socializing'
  | 'patrolling';

export type Emotion = 'calm' | 'fearful' | 'angry' | 'happy' | 'curious' | 'sad' | 'defiant';

export type Sentiment = 'positive' | 'negative' | 'neutral' | 'crisis';

export interface Agent {
  id: number;
  name: string;
  archetype: string;
  color: string;
  accentColor: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  state: SimState;
  emotion: Emotion;
  emotionIntensity: number; // 0-1
  speech: string;
  speechVisible: boolean;
  speedMultiplier: number; // Base speed is 1.0, affects movement
  personality: string[];
  faction?: 'Order' | 'Chaos' | 'Neutral';
}

export interface NewsEvent {
  id: string;
  headline: string;
  source: string;
  sentiment: Sentiment;
  intensity: number; // 1-10
  timestamp: number;
}

export interface PersonaDef {
  id: number;
  name: string;
  archetype: string;
  color: string;
  accentColor: string;
  personality: string[];
  reactionMap: Record<Sentiment, {
    state: SimState;
    emotion: Emotion;
    speeches: string[];
    speedMultiplier: number;
  }>;
}

export interface SimulationReaction {
  agentId: number;
  newState: SimState;
  emotion: Emotion;
  emotionIntensity: number;
  speech: string;
  speedMultiplier: number;
  targetPosition?: [number, number, number];
}

export interface GodModePayload {
  crisisText: string;
  intensity: number;
}

export interface SocietalHealth {
  economy: number;       // 0-100%
  foodSecurity: number;  // 0-100%
  publicSafety: number;  // 0-100%
  socialHarmony: number; // 0-100%
}
