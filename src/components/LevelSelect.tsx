import { DOCTOR_LEVELS } from '../data/doctorLevels'
import { LEVELS } from '../data/levels'
import { BANK_SIZE, MODE_LABELS, type AppMode, type LevelId, type LevelStats } from '../types'

interface Props {
  mode: AppMode
  stats: Record<LevelId, LevelStats>
  onChoose: (level: LevelId) => void
  onBack: () => void
}

export function LevelSelect({ mode, stats, onChoose, onBack }: Props) {
  const levels = mode === 'doctor' ? DOCTOR_LEVELS : LEVELS
  const modeInfo = MODE_LABELS[mode]

  return (
    <div className="home">
      <header className="home-hero">
        <button type="button" className="ghost back-modes" onClick={onBack}>
          ← Modes
        </button>
        <p className="eyebrow">
          {modeInfo.icon} {modeInfo.title}
        </p>
        <h1>{mode === 'doctor' ? 'Choose a clinic topic' : 'Choose your English age level'}</h1>
        <p className="lede">{modeInfo.subtitle}</p>
        {mode === 'doctor' ? (
          <p className="disclaimer">
            AI Doctor is for English practice about health talks only. It is not real medical advice.
          </p>
        ) : null}
      </header>
      <div className="level-grid">
        {levels.map((level) => {
          const s = stats[level.id]
          return (
            <button
              key={level.id}
              type="button"
              className={`level-card level-${level.id} mode-${mode}`}
              onClick={() => onChoose(level.id)}
              style={{
                ['--accent' as string]: level.theme.accent,
                ['--accent2' as string]: level.theme.accent2,
              }}
            >
              <span className="level-avatar">{level.tutor.avatar}</span>
              <span className="level-kicker">
                {mode === 'doctor' ? `Topic ${level.id}` : `Level ${level.id}`} · {level.cefr}
              </span>
              <strong>{level.title}</strong>
              <span className="ages">{level.ages}</span>
              <span className="tagline">{level.tagline}</span>
              <ul>
                {level.focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <span className="bank-note">
                {BANK_SIZE.toLocaleString()} chats · 5 replies each · CSV: {mode}
              </span>
              <span className="stats-line">
                {s.seen === 0
                  ? 'Tap to start chatting'
                  : `${s.seen.toLocaleString()} replies practiced`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
