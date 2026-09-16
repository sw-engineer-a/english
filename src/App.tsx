import { useState } from 'react'
import { ChatRoom } from './components/ChatRoom'
import { LevelSelect } from './components/LevelSelect'
import { loadStats } from './storage'
import type { LevelId, LevelStats } from './types'

export default function App() {
  const [stats, setStats] = useState<Record<LevelId, LevelStats>>(() => loadStats())
  const [level, setLevel] = useState<LevelId | null>(null)

  if (!level) {
    return <LevelSelect stats={stats} onChoose={setLevel} />
  }

  return (
    <ChatRoom
      levelId={level}
      stats={stats}
      onStats={setStats}
      onBack={() => setLevel(null)}
    />
  )
}
