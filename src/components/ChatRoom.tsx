import { useEffect, useRef, useState } from 'react'
import { getLevel } from '../data/levels'
import { generateQuestion } from '../engine/generate'
import { speak, stopSpeaking } from '../speech'
import { recordAnswer } from '../storage'
import { BANK_SIZE, type ChatMessage, type LevelId, type LevelStats, type Question } from '../types'

interface Props {
  levelId: LevelId
  stats: Record<LevelId, LevelStats>
  onStats: (stats: Record<LevelId, LevelStats>) => void
  onBack: () => void
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ChatRoom({ levelId, stats, onStats, onBack }: Props) {
  const level = getLevel(levelId)
  const scroller = useRef<HTMLDivElement>(null)
  const saved = stats[levelId]
  const openingId = saved.seen ? (saved.lastId + 1) % BANK_SIZE : saved.lastId % BANK_SIZE
  const [questionId, setQuestionId] = useState(openingId)
  const [question, setQuestion] = useState<Question>(() => generateQuestion(levelId, openingId))
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const first = generateQuestion(levelId, openingId)
    return [
      { id: uid(), role: 'tutor', text: level.tutor.greeting, kind: 'hello' },
      { id: `q-${first.id}`, role: 'tutor', text: first.prompt, passage: first.passage, kind: 'question' },
    ]
  })
  const [locked, setLocked] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [jump, setJump] = useState('')
  const [session, setSession] = useState({ asked: 0, correct: 0 })

  const currentStats = stats[levelId]
  const accuracy = currentStats.seen ? Math.round((currentStats.correct / currentStats.seen) * 100) : 0

  function questionBubble(q: Question): ChatMessage {
    return {
      id: `q-${q.id}`,
      role: 'tutor',
      text: q.prompt,
      passage: q.passage,
      kind: 'question',
    }
  }

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, locked])

  useEffect(() => {
    if (!voiceOn) return
    const last = messages[messages.length - 1]
    if (last?.role === 'tutor') {
      const spoken = [last.passage, last.text].filter(Boolean).join('. ')
      speak(spoken, levelId)
    }
    return () => stopSpeaking()
  }, [messages, voiceOn, levelId])

  function ask(nextId: number) {
    const q = generateQuestion(levelId, nextId)
    setQuestionId(nextId)
    setQuestion(q)
    setLocked(false)
    setMessages((prev) => (prev.some((m) => m.id === `q-${q.id}`) ? prev : [...prev, questionBubble(q)]))
  }

  function handleAnswer(index: number) {
    if (locked) return
    const correct = index === question.correctIndex
    const pick = question.answers[index]
    const praise = level.tutor.praise[question.id % level.tutor.praise.length]
    const retry = level.tutor.retry[question.id % level.tutor.retry.length]
    const feedback = correct
      ? `${praise} ${question.explanation}`
      : `${retry} ${question.explanation}`
    setLocked(true)
    const asked = session.asked + 1
    const correctCount = session.correct + (correct ? 1 : 0)
    setSession({ asked, correct: correctCount })
    onStats(recordAnswer(stats, levelId, question.id, correct))
    const extra =
      asked % 10 === 0
        ? ` You finished ${asked} questions in this chat. Score: ${correctCount}/${asked}.`
        : ''
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', text: pick, correct },
      { id: uid(), role: 'tutor', text: feedback + extra, kind: 'feedback', correct },
    ])
  }

  function nextQuestion() {
    const nextLine = level.tutor.next[question.id % level.tutor.next.length]
    setMessages((prev) => [...prev, { id: uid(), role: 'tutor', text: nextLine, kind: 'hello' }])
    ask((questionId + 1) % BANK_SIZE)
  }

  function jumpTo() {
    const n = Number.parseInt(jump, 10)
    if (Number.isNaN(n) || n < 1 || n > BANK_SIZE) return
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'system', text: `Question ${n.toLocaleString()} of ${BANK_SIZE.toLocaleString()}` },
    ])
    ask(n - 1)
    setJump('')
  }

  return (
    <div
      className={`chat-shell level-${levelId}`}
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
              {level.title} · {level.ages} · Q{(question.id + 1).toLocaleString()} / {BANK_SIZE.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="meters">
          <span>★ {currentStats.streak}</span>
          <span>{accuracy}%</span>
          <button type="button" className="ghost" onClick={() => setVoiceOn((v) => !v)}>
            {voiceOn ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      <div className="transcript" ref={scroller}>
        {messages.map((msg) => (
          <article key={msg.id} className={`bubble ${msg.role} ${msg.kind ?? ''} ${msg.correct === false ? 'wrong' : ''} ${msg.correct === true ? 'right' : ''}`}>
            {msg.role === 'tutor' && <span className="mini-avatar">{level.tutor.avatar}</span>}
            <div>
              {msg.passage && <p className="passage">{msg.passage}</p>}
              <p>{msg.text}</p>
            </div>
          </article>
        ))}
      </div>

      <footer className="composer">
        {!locked ? (
          <div className="choices">
            {question.answers.map((answer, index) => (
              <button key={`${question.id}-${index}`} type="button" onClick={() => handleAnswer(index)}>
                <span className="choice-key">{['A', 'B', 'C', 'D', 'E'][index]}</span>
                {answer}
              </button>
            ))}
          </div>
        ) : (
          <button type="button" className="next-btn" onClick={nextQuestion}>
            {level.tutor.next[0]} →
          </button>
        )}
        <div className="jump-row">
          <span>
            Session {session.correct}/{session.asked || 0} · skill: {question.skill}
          </span>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              jumpTo()
            }}
          >
            <input
              inputMode="numeric"
              placeholder="Go to #1–100000"
              value={jump}
              onChange={(e) => setJump(e.target.value)}
            />
            <button type="submit">Go</button>
          </form>
        </div>
      </footer>
    </div>
  )
}
