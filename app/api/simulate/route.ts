import { NextRequest, NextResponse } from 'next/server';
import { processNewsEvent } from '@/lib/simulationEngine';
import { PERSONAS } from '@/lib/personas';
import { Agent } from '@/types';

// Build default agents from PERSONAS when none are passed
function buildDefaultAgents(): Agent[] {
  return PERSONAS.map((p) => ({
    id: p.id,
    name: p.name,
    archetype: p.archetype,
    color: p.color,
    accentColor: p.accentColor,
    position: [0, 0, 0] as [number, number, number],
    targetPosition: [0, 0, 0] as [number, number, number],
    state: 'idle' as const,
    emotion: 'calm' as const,
    emotionIntensity: 0.2,
    speech: '',
    speechVisible: false,
    speedMultiplier: 1.0,
    personality: p.personality,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { headline, intensity, agents }: { headline: string; intensity: number; agents: Agent[] } = body;

    if (!headline) {
      return NextResponse.json({ error: 'Missing headline' }, { status: 400 });
    }

    // If no agents passed (or empty), build from PERSONAS — this always gives all 15
    const resolvedAgents =
      Array.isArray(agents) && agents.length > 0 ? agents : buildDefaultAgents();

    const reactions = await processNewsEvent(headline, intensity || 7, resolvedAgents);
    return NextResponse.json({ reactions, success: true });
  } catch (error) {
    console.error('Simulate error:', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
