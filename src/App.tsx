import { useState } from 'react'
import { ChatRoom } from './components/ChatRoom'
import { LevelSelect } from './components/LevelSelect'
import { ModeSelect } from './components/ModeSelect'
import { loadStats, type ModeStats } from './storage'
import type { AppMode, LevelId } from './types'

export default function App() {
  const [stats, setStats] = useState<ModeStats>(() => loadStats())
  const [mode, setMode] = useState<AppMode | null>(null)
  const [level, setLevel] = useState<LevelId | null>(null)

  if (!mode) {
    return <ModeSelect onChoose={setMode} />
  }

  if (!level) {
    return (
      <LevelSelect
        mode={mode}
        stats={stats[mode]}
        onChoose={setLevel}
        onBack={() => setMode(null)}
      />
    )
  }

  return (
    <ChatRoom
      mode={mode}
      levelId={level}
      stats={stats}
      onStats={setStats}
      onBack={() => setLevel(null)}
    />
  )
}
