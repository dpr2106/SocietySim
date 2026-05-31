import { NextRequest, NextResponse } from 'next/server';
import { processNewsEvent } from '@/lib/simulationEngine';
import { PERSONAS } from '@/lib/personas';
import { Agent, GodModePayload } from '@/types';

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
    const { crisisText, intensity, agents }: GodModePayload & { agents: Agent[] } = body;

    if (!crisisText) {
      return NextResponse.json({ error: 'Missing crisisText' }, { status: 400 });
    }

    const resolvedAgents =
      Array.isArray(agents) && agents.length > 0 ? agents : buildDefaultAgents();

    const reactions = await processNewsEvent(crisisText, intensity || 8, resolvedAgents);
    return NextResponse.json({ reactions, success: true });
  } catch (error) {
    console.error('God mode error:', error);
    return NextResponse.json({ error: 'God mode failed' }, { status: 500 });
  }
}
