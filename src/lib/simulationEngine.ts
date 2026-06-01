import { Agent, SimulationReaction, NewsEvent, Sentiment, PersonaDef } from '@/types';
import { PERSONAS } from '@/lib/personas';
import { classifySentiment, extractTopic } from '@/lib/newsService';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomGatherTarget(index: number, total: number): [number, number, number] {
  const angle = (index / total) * Math.PI * 2;
  const radius = 4 + Math.random() * 2;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

function randomFleeTarget(): [number, number, number] {
  const angle = Math.random() * Math.PI * 2;
  const dist = 15 + Math.random() * 10;
  return [Math.cos(angle) * dist, 0, Math.sin(angle) * dist];
}

function clampPosition(pos: [number, number, number]): [number, number, number] {
  return [Math.max(-26, Math.min(26, pos[0])), 0, Math.max(-26, Math.min(26, pos[2]))];
}

// ── Contextual dynamic speech generator ───────────────────────────────────────
// Generates speech that references the ACTUAL headline topic, not static quotes

const CONTEXTUAL_TEMPLATES: Record<string, Record<Sentiment, string[]>> = {
  Scientist: {
    positive: [
      "The data on {topic} is extraordinary — a genuine paradigm shift.",
      "Peer-reviewing {topic} findings now. Results seem reproducible.",
      "My models predicted something like {topic}. Remarkable accuracy.",
      "{topic} changes everything we know about our world.",
    ],
    neutral: [
      "Insufficient data on {topic} to draw conclusions yet.",
      "Running simulations on {topic} implications. Standby.",
      "{topic}... I'll need to analyze the full dataset.",
      "Gathering evidence on {topic} before forming an opinion.",
    ],
    negative: [
      "The {topic} data trends are deeply concerning.",
      "My analysis of {topic} suggests we have limited time to act.",
      "Peer review confirms: {topic} situation is worse than reported.",
      "Statistical models show {topic} will escalate further.",
    ],
    crisis: [
      "Emergency protocols activated. {topic} requires immediate scientific response.",
      "{topic} data is catastrophic — we have hours, not days.",
      "I've run 500 simulations. {topic} outcome is... bad.",
      "Publishing my {topic} research NOW. The world must know.",
    ],
  },
  Soldier: {
    positive: ["Area secured. {topic} threat neutralized. Stand down.", "{topic} — mission accomplished. All units return to base.", "Confirmed: {topic} situation resolved. Good work, team."],
    neutral: ["Monitoring {topic}. Awaiting orders.", "{topic}. Maintaining defensive posture.", "Eyes on {topic}. No change in threat level."],
    negative: ["All units, {topic} is a developing situation. Stay frosty.", "Preparing tactical response to {topic}. Load up.", "{topic} escalating. Request backup."],
    crisis: ["{topic}! ALL UNITS SCRAMBLE! This is not a drill!", "EVACUATE! {topic} has triggered emergency protocols!", "Deploying to {topic} coordinates. God help us all."],
  },
  Journalist: {
    positive: ["BREAKING: {topic} — this is the story of the century!", "Live from the scene — {topic} unfolding before my eyes!", "{topic} confirmed! I'm filing this report immediately!"],
    neutral: ["Sources close to {topic} refuse to comment. Suspicious.", "Following {topic} story. Something doesn't add up.", "Investigating {topic}. The truth is out there."],
    negative: ["EXCLUSIVE: {topic} is worse than officials admit!", "{topic} coverup? I have documents. Going live in 5!", "They tried to hide {topic}. I found out. Watch me expose this."],
    crisis: ["LIVE BROADCAST! {topic} — I'm literally running right now!", "{topic}!! Someone is DEFINITELY getting Pulitzered for this!", "UNBELIEVABLE! {topic} — I've NEVER seen anything like this!"],
  },
  Anarchist: {
    positive: ["Don't trust {topic}. They want you distracted.", "{topic} is a psyop. Wake up.", "They're celebrating {topic} so you won't notice what's really happening."],
    neutral: ["{topic} is exactly what they want you to focus on.", "While you watch {topic}, they're stealing your rights.", "Question everything about {topic}. Everything."],
    negative: ["I TOLD you about {topic}! Nobody listened!", "{topic} is the system eating itself. Beautiful.", "This is what {topic} gets us. Time to burn it all down."],
    crisis: ["{topic}?! REVOLUTION. NOW. No more waiting.", "THIS IS IT. {topic} is the spark we needed!", "EVERYONE TO THE STREETS. {topic} is their final move!"],
  },
  Healer: {
    positive: ["Oh thank goodness... {topic} is such a relief.", "With {topic}, healing can finally begin.", "{topic} means we can focus on recovery now."],
    neutral: ["Checking on everyone after {topic} news.", "How is everyone feeling about {topic}?", "{topic}... let's process this together, okay?"],
    negative: ["Anyone hurt because of {topic}? I'm here.", "{topic} is causing so much stress. Breathe with me.", "We'll get through {topic}. I promise. Together."],
    crisis: ["TRIAGE! {topic} casualties need medical attention NOW!", "Setting up emergency care — {topic} is overwhelming.", "Stay calm everyone! I'm trained for {topic} situations!"],
  },
  Merchant: {
    positive: ["Buying everything related to {topic}! This is bullish!", "{topic} just made me very rich. Very, very rich.", "The {topic} market is BOOMING. Get in now!"],
    neutral: ["{topic}... What's the arbitrage opportunity here?", "Calculating {topic} profit margins. Give me a moment.", "How can I monetize {topic}? There's always an angle."],
    negative: ["Shorting {topic} right now. This is going DOWN.", "{topic} is crashing my portfolio. SELL SELL SELL.", "Converting all assets away from {topic} exposure immediately."],
    crisis: ["{topic}?! I'm hoarding gold and canned goods!", "My {topic} hedge fund is performing BEAUTIFULLY right now.", "Emergency {topic} survival kits — only $999! Get yours!"],
  },
  Elder: {
    positive: ["Reminds me of better days... {topic} is like '72 all over again.", "In my experience, {topic} is how things should be.", "{topic}... finally. I've waited 40 years for this."],
    neutral: ["{topic}... I've seen this before, child. Many times.", "Sit down. Let me tell you about the last time {topic} happened.", "{topic} is just history repeating itself."],
    negative: ["{topic} happened before. In 1978. We survived. We will again.", "Gather round. I have a story about {topic} that might help.", "{topic} worries me. But I've seen worse. Hold together."],
    crisis: ["Lord... {topic} again. I thought we learned our lesson.", "{topic}... This is exactly what my grandmother warned about.", "Everyone stay calm. {topic} will pass. Hold each other."],
  },
  Hacker: {
    positive: ["Running verification on {topic} claims. Checksums match.", "{topic} data checks out across 47 independent sources. Legit.", "SSL certs valid. {topic} news appears authentic."],
    neutral: ["{topic} metadata is interesting... origin: suspicious.", "Tracing {topic} to primary source. Give me 30 seconds.", "Zero-day on {topic} database detected. Monitoring."],
    negative: ["{topic} network traffic spiked 3000%. They're hiding something.", "Intercepted comms about {topic}. This is much bigger than reported.", "{topic} — government keyword filter activated. They're scared."],
    crisis: ["WIPING ALL {topic}-RELATED DRIVES. Now.", "{topic} triggered my emergency protocol. Going dark.", "I knew {topic} was coming. My honeypot data shows months of prep."],
  },
  Child: {
    positive: ["{topic}!! YAY!! Does this mean we get a party?!", "Yay!! {topic} is so cool!! Can we celebrate??", "{topic}!! The best day EVER!! So happy!!"],
    neutral: ["What does {topic} mean? Is it scary?", "{topic}... why is everyone making faces?", "I don't understand {topic}. Can someone explain?"],
    negative: ["Is {topic} going to hurt us? I'm scared...", "*crying* I don't want {topic} to happen!", "{topic}... I want my mommy. Is she okay?"],
    crisis: ["WAAAH!! {topic} is SCARY!!", "Somebody help! {topic} is too much!!", "*runs in circles* {topic}!! SCARY!!"],
  },
  Athlete: {
    positive: ["{topic}?! LET'S GOOOOO!! Time to celebrate!!", "Training for {topic} response already. First place!", "{topic}!! VICTORY!! I'm doing a victory lap RIGHT NOW!"],
    neutral: ["{topic}. Staying loose. Keeping limber.", "Gotta stay ready for anything. {topic} included.", "{topic}... warming up just in case. You never know."],
    negative: ["RUNNING AWAY FROM {topic} AT FULL SPEED.", "{topic}?! My legs are my greatest asset. Using them NOW.", "Race you away from {topic}. I'm DEFINITELY winning."],
    crisis: ["{topic}!! SPRINT! EVERYONE SPRINT! I'LL LEAD!", "My personal best just became my survival record. {topic}!!", "FASTER FASTER FASTER! {topic} is right behind us!"],
  },
  Artist: {
    positive: ["The beauty of {topic} moves me to tears. Painting now.", "{topic} is my new muse. This canvas won't paint itself.", "Capturing {topic} in brushstrokes. Art imitates joy."],
    neutral: ["{topic}... there's a haunting aesthetic to it.", "The chiaroscuro of {topic}... deeply compelling.", "Sketching {topic} from multiple angles. The light is perfect."],
    negative: ["{topic} is beautiful in its tragedy. Painting furiously.", "The world crumbles via {topic}... magnificently.", "My {topic} series will define a generation. I can feel it."],
    crisis: ["I paint {topic} while others flee. This is my masterpiece.", "Art transcends {topic}. Continuing to create.", "History will remember {topic}. I'll make sure of it."],
  },
  Politician: {
    positive: ["I take full credit for {topic}. This was MY policy.", "{topic} is a testament to my leadership. Vote for me!", "I've worked tirelessly on {topic}. You're welcome, citizens."],
    neutral: ["We're monitoring {topic} closely. No cause for alarm.", "My office is fully aware of {topic}. Trust the process.", "A comprehensive {topic} taskforce has been assembled."],
    negative: ["The opposition caused {topic}. I want that on record.", "{topic} is their fault. My hands are completely clean.", "I promise to fix {topic}. Just give me one more term."],
    crisis: ["{topic}... my bunker is... I mean, I'm managing the crisis.", "Full transparency on {topic}... *whispers to aide: get the jet*", "Citizens, {topic} requires my immediate... relocation. For safety."],
  },
  Farmer: {
    positive: ["{topic} means good harvest coming. I can feel it in the soil.", "Blessed news about {topic}. The land provides.", "{topic} is what we've been praying for. Thank the heavens."],
    neutral: ["Storm feels different since {topic}. Watching the sky.", "{topic}... the animals are restless. Something's coming.", "Back to work. {topic} won't plant itself."],
    negative: ["{topic} threatens my crops. Everything I've built.", "Protecting the harvest from {topic}. Nobody goes hungry if I can help it.", "{topic}... storing supplies. Been ready for this."],
    crisis: ["TO THE ROOT CELLAR! {topic} is here!", "I knew {topic} was coming. Harvest stored. Ready.", "Protecting crops from {topic}. Won't let my family starve."],
  },
  Villain: {
    positive: ["{topic} ruins everything. Back to square one.", "*hisses* {topic} was NOT supposed to happen.", "My plans for {topic} domination... foiled again."],
    neutral: ["{topic}... excellent. The pieces are in motion.", "Yes... {topic} plays right into my hands.", "Patience. {topic} will serve my purposes soon."],
    negative: ["{topic}... *sinister laugh* ...exactly as planned.", "Chaos from {topic}. BEAUTIFUL. This is my moment.", "{topic} creates the perfect distraction. Executing Phase Two."],
    crisis: ["{topic}!! YESSS!! The day of reckoning has come!", "I ORCHESTRATED {topic}! BOW BEFORE ME!", "All of this {topic} chaos... is MINE. *evil laughter*"],
  },
  Mystic: {
    positive: ["{topic}... the stars foretold this harmony.", "Balance restored through {topic}. The spirits are pleased.", "{topic}... I saw this in the flames three moons ago."],
    neutral: ["{topic} disturbs the cosmic balance. Meditating on this.", "The ancient texts mention {topic}... or something like it.", "Communing with the spirits about {topic}. They are... unsettled."],
    negative: ["The prophecy of {topic} is being fulfilled.", "{topic} was written in the stars long ago. I have seen it.", "Ancient forces respond to {topic}. Seek shelter in old places."],
    crisis: ["{topic}!! THE PROPHECY IS FULFILLED! The end approaches!", "*chanting* {topic}... {topic}... the veil is torn...", "I FORETOLD {topic}!! NONE SHALL ESCAPE THE PROPHECY!!"],
  },
};

function generateContextualSpeech(archetype: string, headline: string, sentiment: Sentiment): string {
  const topic = extractTopic(headline);
  const templates = CONTEXTUAL_TEMPLATES[archetype]?.[sentiment] ?? [`${topic} is... concerning.`];
  const template = pickRandom(templates);
  return template.replace(/\{topic\}/g, topic);
}

export async function processNewsEvent(
  headline: string,
  intensity: number,
  agents: Agent[]
): Promise<SimulationReaction[]> {
  const sentiment: Sentiment = classifySentiment(headline);

  // Priority 1: Groq (fastest free AI — LLaMA 3.3 70B)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      return await processWithGroq(headline, sentiment, intensity, agents, groqKey);
    } catch (e) {
      console.warn('Groq unavailable, trying Gemini...', e);
    }
  }

  // Priority 2: Gemini fallback
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      return await processWithGemini(headline, sentiment, intensity, agents, geminiKey);
    } catch {
      console.warn('Gemini unavailable, using contextual rule-based engine');
    }
  }

  // Priority 3: Contextual rule-based engine (no key needed)
  return agents.map((agent, index) => {
    const persona: PersonaDef | undefined = PERSONAS.find((p) => p.id === agent.id);
    if (!persona) {
      return {
        agentId: agent.id,
        newState: 'walking',
        emotion: 'calm',
        emotionIntensity: 0.3,
        speech: `${extractTopic(headline)}... interesting.`,
        speedMultiplier: 1.0,
        targetPosition: clampPosition([(Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40]),
      };
    }

    const baseReaction = persona.reactionMap[sentiment];
    const intensityFactor = intensity / 10;
    const speech = generateContextualSpeech(persona.archetype, headline, sentiment);

    let targetPosition: [number, number, number];
    if (['gathering', 'debating', 'meditating', 'celebrating'].includes(baseReaction.state)) {
      targetPosition = clampPosition(randomGatherTarget(index, agents.length));
    } else if (['fleeing', 'panicking'].includes(baseReaction.state)) {
      targetPosition = clampPosition(randomFleeTarget());
    } else {
      targetPosition = clampPosition([(Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40]);
    }

    return {
      agentId: agent.id,
      newState: baseReaction.state,
      emotion: baseReaction.emotion,
      emotionIntensity: Math.min(1, intensityFactor * 0.8 + 0.2),
      speech,
      speedMultiplier: baseReaction.speedMultiplier * (1 + intensityFactor * 0.3),
      targetPosition,
    };
  });
}

// ── Groq AI (LLaMA 3.3 70B — free, fastest) ────────────────────────────────
async function processWithGroq(
  headline: string,
  sentiment: Sentiment,
  intensity: number,
  agents: Agent[],
  apiKey: string
): Promise<SimulationReaction[]> {
  const personaList = PERSONAS.map((p) => `ID ${p.id}: ${p.name} (${p.archetype})`).join('\n');

  const systemPrompt = `You are a multi-agent simulation engine for a societal simulator game.
Given a news headline, generate unique in-character reactions for 15 different personas.

CRITICAL RULES:
1. RELEVANCE FILTERING: Evaluate if the news is actually relevant to the character's archetype. 
   - A Soldier doesn't care about sports. An Athlete doesn't care about politics.
   - If the news is NOT relevant, their reaction should be dismissive, distracted, or annoyed (e.g. "I don't have time for this, I have a race to train for.").
2. SHOW, DON'T TELL (CRITICAL): Never explicitly state your profession or archetype. Do NOT say "As a hacker..." or "I must prioritize my duties as a soldier." Speak naturally and realistically like a real human would in this scenario. Never break the fourth wall.
3. LENGTH: Each quote MUST be 2 to 3 full sentences. Do NOT give short 5-word answers. Provide deep, immersive, conversational thoughts.
4. PERSONALITY: Match the character's archetype perfectly through tone and vocabulary, NOT by stating what they are.

Return ONLY valid JSON array. No markdown, no explanation.`;

  const userPrompt = `NEWS HEADLINE: "${headline}"
SENTIMENT: ${sentiment} | INTENSITY: ${intensity}/10

Characters:
${personaList}

Return JSON array EXACTLY like this:
[{"agentId": 0, "speech": "This is a full sentence. And here is another one. It shows deep thought.", "emotion": "calm|fearful|angry|happy|curious|sad|defiant"}, ...]
All 15 agents required.`;

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
      temperature: 0.85,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content || '{}';

  // Parse response — Groq returns json_object so we need to find the array
  let groqReactions: { agentId: number; speech: string; emotion: string }[] = [];
  try {
    const parsed = JSON.parse(rawText);
    // Handle both {reactions: [...]} and direct array wrapped in object
    groqReactions = Array.isArray(parsed) ? parsed
      : parsed.reactions ?? parsed.agents ?? parsed.characters ?? Object.values(parsed)[0] ?? [];
  } catch {
    const arrMatch = rawText.match(/\[[\s\S]*\]/);
    if (arrMatch) groqReactions = JSON.parse(arrMatch[0]);
  }

  if (!Array.isArray(groqReactions) || groqReactions.length === 0) {
    throw new Error('Groq returned no valid reactions');
  }

  return buildReactionsFromAI(groqReactions, headline, sentiment, intensity, agents);
}

// ── Shared builder — maps AI reactions array → SimulationReaction[] ────────────
function buildReactionsFromAI(
  aiReactions: { agentId: number; speech: string; emotion: string }[],
  headline: string,
  sentiment: Sentiment,
  intensity: number,
  agents: Agent[]
): SimulationReaction[] {
  return agents.map((agent, index) => {
    const aiData = aiReactions.find((r) => r.agentId === agent.id);
    const persona = PERSONAS.find((p) => p.id === agent.id)!;
    const baseReaction = persona.reactionMap[sentiment];
    const intensityFactor = intensity / 10;

    let targetPosition: [number, number, number];
    if (['gathering', 'debating', 'meditating', 'celebrating'].includes(baseReaction.state)) {
      targetPosition = clampPosition(randomGatherTarget(index, agents.length));
    } else if (['fleeing', 'panicking'].includes(baseReaction.state)) {
      targetPosition = clampPosition(randomFleeTarget());
    } else {
      targetPosition = clampPosition([(Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40]);
    }

    return {
      agentId: agent.id,
      newState: baseReaction.state,
      emotion: (aiData?.emotion as SimulationReaction['emotion']) || baseReaction.emotion,
      emotionIntensity: Math.min(1, intensityFactor * 0.8 + 0.2),
      speech: aiData?.speech || generateContextualSpeech(persona.archetype, headline, sentiment),
      speedMultiplier: baseReaction.speedMultiplier * (1 + intensityFactor * 0.3),
      targetPosition,
    };
  });
}

// ── Gemini AI fallback ────────────────────────────────────────────────────────
async function processWithGemini(
  headline: string,
  sentiment: Sentiment,
  intensity: number,
  agents: Agent[],
  apiKey: string
): Promise<SimulationReaction[]> {
  const personaList = PERSONAS.map((p) => `${p.id}: ${p.name} (${p.archetype})`).join('\n');

  const prompt = `You are a multi-agent simulation engine. A news event just occurred:

HEADLINE: "${headline}"
SENTIMENT: ${sentiment}
INTENSITY: ${intensity}/10

Generate a unique, contextual reaction for each of these 15 characters. 

CRITICAL RULES:
1. RELEVANCE: Only care about the news if it fits the archetype. If irrelevant, the character should state they don't care or are busy with their normal life.
2. SHOW, DON'T TELL: Never explicitly state your profession (e.g. do not say "As a soldier..."). Speak naturally and realistically like a real human. Never break the fourth wall.
3. LENGTH: Each quote MUST be 2 to 3 full sentences. Provide deep, immersive, conversational thoughts.
4. TOPIC: Reference the specific topic from the headline if relevant.

Characters:
${personaList}

Respond with ONLY a JSON array:
[{ "agentId": number, "speech": "First sentence goes here. Second sentence goes here. Third sentence if needed.", "emotion": "calm|fearful|angry|happy|curious|sad|defiant" }]`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(10000),
    }
  );

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON in Gemini response');

  const geminiReactions = JSON.parse(jsonMatch[0]);
  return buildReactionsFromAI(geminiReactions, headline, sentiment, intensity, agents);
}
