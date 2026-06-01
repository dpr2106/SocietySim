import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@/types';
import { PERSONAS } from '@/lib/personas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent1, agent2 }: { agent1: Agent; agent2: Agent } = body;

    if (!agent1 || !agent2) {
      return NextResponse.json({ error: 'Missing agents' }, { status: 400 });
    }

    const persona1 = PERSONAS.find(p => p.id === agent1.id)!;
    const persona2 = PERSONAS.find(p => p.id === agent2.id)!;

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const dialogue = await generateConversationGroq(persona1, persona2, groqKey);
        return NextResponse.json({ dialogue, success: true });
      } catch (e) {
        console.warn('Groq conversation failed', e);
      }
    }

    // Fallback: simple rule-based conversation
    const fallbackDialogue = [
      { agentId: agent1.id, speech: `Hello, I've been thinking about recent events.` },
      { agentId: agent2.id, speech: `Indeed. Times are changing quickly.` }
    ];
    return NextResponse.json({ dialogue: fallbackDialogue, success: true });

  } catch (error) {
    console.error('Converse error:', error);
    return NextResponse.json({ error: 'Conversation failed' }, { status: 500 });
  }
}

async function generateConversationGroq(p1: any, p2: any, apiKey: string) {
  const systemPrompt = `You are an AI generating a quick 2-line passing conversation between two villagers in a simulation.
CRITICAL RULES:
1. SHOW, DON'T TELL: Do not explicitly state professions (e.g. "As a soldier..."). Speak naturally.
2. CONTEXT: The two agents are just walking past each other in the village square.
3. LENGTH: Exactly 1 sentence per agent. Extremely brief.
4. FORMAT: Return ONLY valid JSON array.

Example:
[
  { "agentId": 1, "speech": "Have you noticed the sky looks darker today?" },
  { "agentId": 2, "speech": "Yes, I'm making sure my family stays indoors." }
]`;

  const userPrompt = `Agent A (ID: ${p1.id}): ${p1.name}, the ${p1.archetype}.
Agent B (ID: ${p2.id}): ${p2.name}, the ${p2.archetype}.
Write their 2-line conversation.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error('Groq API error');

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content || '{}';
  
  try {
    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : parsed.dialogue ?? Object.values(parsed)[0] ?? [];
  } catch {
    const arrMatch = rawText.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
  }
  return [];
}
