# Society Simulator: Master Upgrade (Phases 3 & 4)

## Goal
Implement Phase 3 (Agent-to-Agent Conversations & Improved Roleplay) and Phase 4 (Factions & Rebellions). The user also requested that the LLM roleplay is much more natural and doesn't break the fourth wall (e.g. no more "As a soldier...").

## 1. Better Roleplay & Prompt Engineering
The current LLM prompts are causing the AI to sound robotic and constantly state their archetype.
- **[MODIFY] `lib/simulationEngine.ts`**: Update both Groq and Gemini system prompts.
  - **New Rule:** "SHOW, DON'T TELL. Never state your profession (e.g. do not say 'As a hacker...'). Never break the fourth wall. Speak naturally and realistically like a real human would in this scenario."

## 2. Phase 3: Agent-to-Agent Conversations 💬
Currently, agents only react to global news. We will add a system where they can talk to each other.
- **[NEW] `app/api/converse/route.ts`**: A new API route that takes two agent archetypes and generates a short 2-line dialogue between them (e.g., A asks a question, B responds).
- **[MODIFY] `app/page.tsx`**: Add a new interval (`setInterval`) that runs every 10 seconds. It will randomly pick two agents who are "idle" and close to each other, hit the `/api/converse` endpoint, and update their speech bubbles simultaneously.

## 3. Phase 4: Factions & Rebellions ⚔️
When society breaks down, agents will take sides.
- **[MODIFY] `types/index.ts`**: Add `faction?: 'Order' | 'Chaos' | 'Neutral'` to the `Agent` interface.
- **[MODIFY] `app/page.tsx`**: In the economy tick, if `socialHarmony < 30`, assign the "Anarchist", "Villain", and "Hacker" to `Chaos`, and "Soldier", "Politician", and "Elder" to `Order`. If harmony recovers above 70%, reset everyone to `Neutral`.
- **[MODIFY] `components/Character.tsx`**: Render a glowing ring under the agent based on their faction (Red for Chaos, Blue for Order).

## User Review Required

> [!IMPORTANT]
> The prompt update will immediately fix the "cringey" dialogue you saw in the screenshots. 
> Does this execution plan for Conversations and Factions look good to you? Once you approve, I will build it all!
