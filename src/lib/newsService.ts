import { NewsEvent, Sentiment } from '@/types';

// ─── RSS Parsing helpers ─────────────────────────────────────────────────────
function parseRssXml(xml: string): { title: string; description: string }[] {
  const items: { title: string; description: string }[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
  const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[0];
    const titleMatch = titleRegex.exec(block);
    const descMatch = descRegex.exec(block);
    const title = titleMatch?.[1]?.trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const desc = descMatch?.[1]?.trim().replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (title && title.length > 10 && !title.toLowerCase().includes('bbc') && !title.toLowerCase().includes('reuters')) {
      items.push({ title, description: desc || '' });
    }
  }
  return items;
}

const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times' },
  { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News' },
];

async function fetchRssHeadlines(): Promise<NewsEvent[]> {
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SocietalSimulator/1.0)' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRssXml(xml);
      if (items.length >= 3) {
        return items.slice(0, 8).map((item, i) => ({
          id: `rss-${Date.now()}-${i}`,
          headline: item.title,
          source: feed.source,
          sentiment: classifySentiment(item.title + ' ' + item.description),
          intensity: computeIntensity(item.title + ' ' + item.description),
          timestamp: Date.now(),
        }));
      }
    } catch {
      continue;
    }
  }
  return [];
}

// ─── NewsAPI ─────────────────────────────────────────────────────────────────
async function fetchNewsApiHeadlines(): Promise<NewsEvent[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=8&apiKey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).slice(0, 8).map((a: { title: string; source: { name: string }; description: string }, i: number) => ({
      id: `newsapi-${Date.now()}-${i}`,
      headline: a.title?.replace(/\s*-\s*[^-]*$/, '') || a.description || '',
      source: a.source?.name || 'NewsAPI',
      sentiment: classifySentiment(a.title + ' ' + a.description),
      intensity: computeIntensity(a.title + ' ' + a.description),
      timestamp: Date.now(),
    })).filter((e: NewsEvent) => e.headline.length > 10);
  } catch {
    return [];
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────
const MOCK_HEADLINES: Omit<NewsEvent, 'id' | 'timestamp'>[] = [
  { headline: 'Scientists Discover Breakthrough Cure for Terminal Diseases', source: 'Science Today', sentiment: 'positive', intensity: 8 },
  { headline: 'Global Economy Collapses Overnight — Markets in Freefall', source: 'Finance Wire', sentiment: 'crisis', intensity: 9 },
  { headline: 'Historic Peace Treaty Signed Between All Major Nations', source: 'World News', sentiment: 'positive', intensity: 7 },
  { headline: 'Massive Asteroid Approaching Earth — Impact in 72 Hours', source: 'NASA Watch', sentiment: 'crisis', intensity: 10 },
  { headline: 'AI Systems Surpass Human Intelligence Across All Domains', source: 'Tech Pulse', sentiment: 'negative', intensity: 6 },
  { headline: 'Renewable Energy Now Powers 90% of the Globe', source: 'Green Earth', sentiment: 'positive', intensity: 6 },
  { headline: 'Unknown Virus Detected Spreading Rapidly Across Continents', source: 'Health Alert', sentiment: 'crisis', intensity: 9 },
  { headline: 'Solar Flare to Knock Out Global Power Grids Tomorrow', source: 'Space Monitor', sentiment: 'negative', intensity: 8 },
  { headline: 'First Confirmed Contact: Alien Signal Decoded by Scientists', source: 'Space News', sentiment: 'neutral', intensity: 9 },
  { headline: 'Historic Famine Threatens Billions as Crops Fail Worldwide', source: 'Climate Report', sentiment: 'crisis', intensity: 8 },
];

let mockIndex = 0;

export async function fetchHeadlines(): Promise<NewsEvent[]> {
  // 1. Try NewsAPI (if key provided)
  const newsApiResults = await fetchNewsApiHeadlines();
  if (newsApiResults.length >= 3) return newsApiResults;

  // 2. Try RSS feeds (no key required)
  const rssResults = await fetchRssHeadlines();
  if (rssResults.length >= 3) return rssResults;

  // 3. Fall back to mock
  const headlines: NewsEvent[] = [];
  for (let i = 0; i < 5; i++) {
    const mock = MOCK_HEADLINES[(mockIndex + i) % MOCK_HEADLINES.length];
    headlines.push({ ...mock, id: `mock-${Date.now()}-${i}`, timestamp: Date.now() });
  }
  mockIndex = (mockIndex + 1) % MOCK_HEADLINES.length;
  return headlines;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function classifySentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  const crisisWords = ['collapse', 'asteroid', 'disaster', 'virus', 'meltdown', 'apocalypse', 'nuclear', 'evacuate', 'catastrophe', 'crisis', 'emergency', 'attack', 'kills', 'killed', 'dead', 'deaths', 'war', 'explosion', 'flood', 'earthquake', 'hurricane', 'tsunami', 'fire', 'terror', 'shooting'];
  const positiveWords = ['cure', 'peace', 'treaty', 'renewable', 'donates', 'breakthrough', 'celebrate', 'saved', 'victory', 'recovery', 'hope', 'historic', 'achievement', 'success'];
  const negativeWords = ['crash', 'threat', 'warning', 'risk', 'fail', 'danger', 'drought', 'inflation', 'recession', 'scandal', 'protest', 'strike', 'tension', 'dispute'];

  if (crisisWords.some((w) => lower.includes(w))) return 'crisis';
  if (positiveWords.some((w) => lower.includes(w))) return 'positive';
  if (negativeWords.some((w) => lower.includes(w))) return 'negative';
  return 'neutral';
}

export function computeIntensity(text: string): number {
  const lower = text.toLowerCase();
  const highIntensity = ['thousands', 'millions', 'global', 'world', 'nuclear', 'asteroid', 'apocalypse', 'collapse', 'massive', 'historic', 'unprecedented', 'catastrophic'];
  const midIntensity = ['major', 'significant', 'critical', 'serious', 'widespread', 'multiple'];
  let score = 5;
  if (highIntensity.some((w) => lower.includes(w))) score += 3;
  if (midIntensity.some((w) => lower.includes(w))) score += 1;
  return Math.min(10, score);
}

export function extractTopic(headline: string): string {
  // Extract first proper noun or key subject
  const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'by', 'for', 'with', 'as', 'it', 'its', 'this', 'that', 'from', 'into', 'after', 'over', 'under']);
  const words = headline.split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[^a-zA-Z]/g, '');
    if (clean.length > 3 && !stopWords.has(clean.toLowerCase())) {
      return clean;
    }
  }
  return 'this event';
}

export { MOCK_HEADLINES };
