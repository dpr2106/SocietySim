# 🌍 SocietySim: 3D Multi-Agent Simulator

An interactive full-stack 3D simulation where **15 AI-powered personas** live in a stylized village, react to real-world news headlines, and visually change their behavior — complete with floating speech bubbles, walking animations, and dynamic emotional states.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏘️ **3D Village** | Stylized Clash-of-Clans-style world with buildings, trees, roads, and a fountain |
| 🧑‍🤝‍🧑 **15 Characters** | Unique humanoid agents with walking animations (limb swing, body bob) |
| 🧠 **AI Personas** | 15 archetypes: Scientist, Soldier, Journalist, Anarchist, Child, Villain, Mystic… |
| 📰 **Live News** | Connect to NewsAPI for real-world headlines, or use built-in mock events |
| 🤖 **Gemini AI** | Optional Gemini integration for unique, context-aware speech per character |
| ⚡ **God Mode** | Inject any custom crisis — meteor strike, alien invasion, world peace… |
| 💬 **Speech Bubbles** | Floating HTML bubbles above each character showing their thoughts |
| 😱 **State Machine** | 8 states: idle, walking, panicking, gathering, fleeing, debating, meditating, celebrating |
| 📊 **Agent HUD** | Real-time emotion intensity bars and state indicators for all agents |
| 📡 **Auto-Simulate** | Set an interval for automatic news fetching and simulation |

---

## 🚀 Quick Start

### 1. Clone / Open the Project
```bash
cd C:\Users\prash\OneDrive\Desktop\society-sim
```

### 2. Install Dependencies (already done)
```bash
npm install
```

### 3. (Optional) Configure API Keys
```bash
copy .env.local.example .env.local
# Then open .env.local and add your keys
```

### 4. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Keys Setup

> **The app runs perfectly without any API keys.** Mock data provides a full experience.

### NewsAPI (Live Headlines)
1. Register at [newsapi.org/register](https://newsapi.org/register) — it's free
2. Copy your API key
3. Add to `.env.local`: `NEWSAPI_KEY=your_key_here`
4. Free tier: 100 requests/day (plenty for dev)

### Google Gemini (Richer AI Speech)
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Add to `.env.local`: `GEMINI_API_KEY=your_key_here`
4. Free tier: Very generous request limits

---

## 🎮 How to Use

### God Mode Panel (Right Side)
- **Quick Events**: Pre-built crises (meteor, tsunami, alien invasion, etc.)
- **Custom Crisis**: Type any scenario and set intensity 1-10
- **⚡ Inject Crisis**: Triggers immediate reactions from all 15 agents
- **📡 Fetch Live News**: Pulls a real headline and simulates reactions
- **Auto-Simulate**: Runs news + simulation on a timer (configurable interval)

### Agent HUD (Left Side)
- Shows all 15 agents with their current state emoji
- Color-coded emotion intensity bars
- Collapse/expand with click

### 3D Navigation
- **Orbit**: Left-click drag
- **Pan**: Right-click drag  
- **Zoom**: Scroll wheel

---

## 🗂 Project Structure

```
society-sim/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page + simulation orchestration
│   ├── globals.css             # Global styles + animations
│   └── api/
│       ├── news/route.ts       # News fetch endpoint
│       ├── simulate/route.ts   # AI persona reaction endpoint
│       └── god-mode/route.ts   # Custom crisis endpoint
├── components/
│   ├── Scene.tsx               # R3F Canvas with lighting + controls
│   ├── Village.tsx             # 3D village landscape
│   ├── Character.tsx           # Animated humanoid character
│   ├── CharacterManager.tsx    # Renders all 15 characters
│   ├── GodModePanel.tsx        # Crisis injection control panel
│   ├── NewsPanel.tsx           # Bottom news ticker
│   └── SimulationHUD.tsx       # Agent status panel
├── lib/
│   ├── personas.ts             # 15 persona definitions + reaction maps
│   ├── simulationEngine.ts     # Rule-based + Gemini AI engine
│   ├── newsService.ts          # NewsAPI client + mock headlines
│   └── store.ts                # Zustand global state
├── types/index.ts              # TypeScript interfaces
├── .env.local.example          # API key template
└── README.md                   # This file
```

---

## 🧠 The 15 Agents

| # | Name | Archetype | Panic Style | Peace Style |
|---|------|-----------|-------------|-------------|
| 1 | Aria | Scientist | Analyzes calmly | Reads data |
| 2 | Bruno | Soldier | Defensive patrol | Trains alone |
| 3 | Cleo | Journalist | Runs for scoop | Interviews others |
| 4 | Dex | Anarchist | Leads the panic | Plots revolution |
| 5 | Elena | Healer | Tends the wounded | Meditates |
| 6 | Felix | Merchant | Hoards resources | Trades happily |
| 7 | Greta | Elder | Counsels others | Tells stories |
| 8 | Hiro | Hacker | Hacks for info | Codes quietly |
| 9 | Isla | Child | Cries and runs | Plays and skips |
| 10 | Jax | Athlete | Sprints full speed | Jogs circuits |
| 11 | Kira | Artist | Paints the chaos | Sketches scenery |
| 12 | Leo | Politician | Gives speeches | Shakes hands |
| 13 | Maya | Farmer | Protects crops | Harvests calmly |
| 14 | Nero | Villain | Exploits crisis | Lurks in shadows |
| 15 | Ora | Mystic | Chants prophecy | Meditates |

---

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Three.js** + **@react-three/fiber** + **@react-three/drei**
- **Zustand** (global state)
- **NewsAPI** (live headlines, optional)
- **Google Gemini** (AI speech, optional)

---

## 📝 License

MIT — build something amazing! 🚀
