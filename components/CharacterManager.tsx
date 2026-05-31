'use client';

import Character from './Character';
import { useSimStore } from '@/lib/store';

export default function CharacterManager() {
  const agents = useSimStore((s) => s.agents);

  return (
    <>
      {agents.map((agent) => (
        <Character key={agent.id} agent={agent} />
      ))}
    </>
  );
}
