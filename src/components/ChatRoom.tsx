import { useEffect, useRef, useState } from 'react'
import { loadLevelCsv, type ChatTurn } from '../csv/loadLevelCsv'
import { getDoctorLevel } from '../data/doctorLevels'
import { getLevel } from '../data/levels'
import { speak, stopSpeaking } from '../speech'
import { recordAnswer, type ModeStats } from '../storage'
import type { AppMode, ChatMessage, LevelId } from '../types'

interface Props {
  mode: AppMode
  levelId: LevelId
  stats: ModeStats
  onStats: (stats: ModeStats) => void
  onBack: () => void
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ChatRoom({ mode, levelId, stats, onStats, onBack }: Props) {
  const level = mode === 'doctor' ? getDoctorLevel(levelId) : getLevel(levelId)
  const scroller = useRef<HTMLDivElement>(null)
  const [turns, setTurns] = useState<ChatTurn[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [turnId, setTurnId] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [locked, setLocked] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [jump, setJump] = useState('')
  const [session, setSession] = useState({ chats: 0 })

  const turn = turns?.[turnId] ?? null
  const total = turns?.length ?? 0
  const currentStats = stats[mode][levelId]

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    setTurns(null)
    setMessages([])
    setLocked(false)
    setSession({ chats: 0 })

    loadLevelCsv(mode, levelId)
      .then((rows) => {
        if (!alive) return
        const saved = stats[mode][levelId]
        const start = saved.seen ? (saved.lastId + 1) % rows.length : saved.lastId % rows.length
        const first = rows[start]
        setTurns(rows)
        setTurnId(start)
        setMessages([
          { id: uid(), role: 'tutor', text: level.tutor.greeting, kind: 'hello' },
          {
            id: `turn-${first.id}`,
            role: 'tutor',
            text: first.bot_message,
            kind: 'question',
          },
        ])
        setLoading(false)
      })
      .catch((err: Error) => {
        if (!alive) return
        setError(err.message || 'Failed to load chat CSV')
        setLoading(false)
      })

    return () => {
      alive = false
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, levelId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, locked, loading])

  useEffect(() => {
    if (!voiceOn || loading) return
    const last = messages[messages.length - 1]
    if (last?.role === 'tutor') speak(last.text, levelId)
    return () => stopSpeaking()
  }, [messages, voiceOn, levelId, loading])

  function showTurn(nextId: number, withCue = false) {
    if (!turns) return
    const next = turns[nextId]
    setTurnId(nextId)
    setLocked(false)
    setMessages((prev) => {
      const bubble: ChatMessage = {
        id: `turn-${next.id}`,
        role: 'tutor',
        text: next.bot_message,
        kind: 'question',
      }
      if (prev.some((m) => m.id === bubble.id)) return prev
      const cue = withCue
        ? [
            {
              id: uid(),
              role: 'tutor' as const,
              text: level.tutor.next[nextId % level.tutor.next.length],
              kind: 'hello' as const,
            },
          ]
        : []
      return [...prev, ...cue, bubble]
    })
  }

  function handleReply(index: number) {
    if (locked || !turn) return
    const reply = turn.replies[index]
    const praise = level.tutor.praise[turn.id % level.tutor.praise.length]
    setLocked(true)
    const chats = session.chats + 1
    setSession({ chats })
    onStats(recordAnswer(stats, mode, levelId, turn.id, true))
    const extra =
      chats % 10 === 0 ? ` Great chat! You practiced ${chats} replies in this session.` : ''
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', text: reply, correct: true },
      {
        id: uid(),
        role: 'tutor',
        text: `${praise}${extra}`,
        kind: 'feedback',
        correct: true,
      },
    ])
  }

  function nextChat() {
    if (!turns) return
    showTurn((turnId + 1) % turns.length, true)
  }

  function jumpTo() {
    if (!turns) return
    const n = Number.parseInt(jump, 10)
    if (Number.isNaN(n) || n < 1 || n > turns.length) return
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: 'system',
        text: `Chat ${n.toLocaleString()} of ${turns.length.toLocaleString()}`,
      },
    ])
    showTurn(n - 1)
    setJump('')
  }

  return (
    <div
      className={`chat-shell level-${levelId} mode-${mode}`}
      style={{
        ['--bg' as string]: level.theme.bg,
        ['--bg2' as string]: level.theme.bg2,
        ['--accent' as string]: level.theme.accent,
        ['--accent2' as string]: level.theme.accent2,
        ['--ink' as string]: level.theme.ink,
        ['--card' as string]: level.theme.card,
        ['--bubble' as string]: level.theme.bubble,
        ['--user-bubble' as string]: level.theme.userBubble,
      }}
    >
      <header className="chat-top">
        <button type="button" className="ghost" onClick={onBack}>
          ← Levels
        </button>
        <div className="who">
          <span className="who-avatar">{level.tutor.avatar}</span>
          <div>
            <strong>{level.tutor.name}</strong>
            <p>
              {mode === 'doctor'
                ? `AI Doctor · ${level.title}`
                : `English · ${level.title} · ${level.ages}`}
              {turn ? ` · Chat ${(turnId + 1).toLocaleString()} / ${total.toLocaleString()}` : ''}
            </p>
          </div>
        </div>
        <div className="meters">
          <span>★ {currentStats.streak}</span>
          <span>{currentStats.seen.toLocaleString()}</span>
          <button type="button" className="ghost" onClick={() => setVoiceOn((v) => !v)}>
            {voiceOn ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      <div className="transcript" ref={scroller}>
        {loading && (
          <article className="bubble system">
            <div>
              <p>
                Loading {mode === 'doctor' ? level.title : level.ages} CSV…
              </p>
            </div>
          </article>
        )}
        {error && (
          <article className="bubble system">
            <div>
              <p>{error}</p>
            </div>
          </article>
        )}
        {messages.map((msg) => (
          <article
            key={msg.id}
            className={`bubble ${msg.role} ${msg.kind ?? ''} ${msg.correct === true ? 'right' : ''}`}
          >
            {msg.role === 'tutor' && <span className="mini-avatar">{level.tutor.avatar}</span>}
            <div>
              <p>{msg.text}</p>
            </div>
          </article>
        ))}
      </div>

      <footer className="composer">
        {!loading && !error && turn && !locked ? (
          <div className="choices">
            {turn.replies.map((reply, index) => (
              <button key={`${turn.id}-${index}`} type="button" onClick={() => handleReply(index)}>
                <span className="choice-key">{['A', 'B', 'C', 'D', 'E'][index]}</span>
                {reply}
              </button>
            ))}
          </div>
        ) : null}
        {!loading && !error && turn && locked ? (
          <button type="button" className="next-btn" onClick={nextChat}>
            {level.tutor.next[0]} →
          </button>
        ) : null}
        <div className="jump-row">
          <span>
            {turn
              ? `Session ${session.chats}`
              : loading
                ? 'Loading CSV…'
                : 'CSV not ready'}
          </span>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              jumpTo()
            }}
          >
            <input
              inputMode="numeric"
              placeholder={total ? `Go to #1–${total}` : 'Go to #'}
              value={jump}
              onChange={(e) => setJump(e.target.value)}
              disabled={!turns}
            />
            <button type="submit" disabled={!turns}>
              Go
            </button>
          </form>
        </div>
      </footer>
    </div>
  )
}
