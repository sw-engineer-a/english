import { FEMALE_LEVELS } from '../data/femaleConditions'
import { LEVELS } from '../data/levels'
import { BANK_SIZE, MODE_LABELS, type AppMode, type LevelId, type LevelStats } from '../types'

interface Props {
  mode: AppMode
  stats: Record<LevelId, LevelStats>
  onChoose: (level: LevelId) => void
  onBack: () => void
}

export function LevelSelect({ mode, stats, onChoose, onBack }: Props) {
  const levels = mode === 'doctor' ? FEMALE_LEVELS : LEVELS
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
        <h1>{mode === 'doctor' ? 'Choose a women’s health topic' : 'Choose your English age level'}</h1>
        <p className="lede">{modeInfo.subtitle}</p>
        {mode === 'doctor' ? (
          <p className="disclaimer">
            Tell the doctor your symptoms. The reply is a diagnosis from those symptoms. Go to
            urgent care for severe pain, fainting, very heavy bleeding, fever, or trouble breathing.
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
                {mode === 'doctor' ? 'Female health' : `Level ${level.id}`} · {level.cefr}
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
                {!s || s.seen === 0
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
