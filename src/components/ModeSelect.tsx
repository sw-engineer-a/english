import { MODE_LABELS, type AppMode } from '../types'

interface Props {
  onChoose: (mode: AppMode) => void
}

export function ModeSelect({ onChoose }: Props) {
  return (
    <div className="home">
      <header className="home-hero">
        <p className="eyebrow">Chat hub</p>
        <h1>Choose a chat mode</h1>
        <p className="lede">
          English Learning is language practice. AI Doctor takes symptoms and gives a diagnosis.
        </p>
      </header>

      <div className="mode-grid">
        {(Object.keys(MODE_LABELS) as AppMode[]).map((mode) => {
          const item = MODE_LABELS[mode]
          return (
            <button
              key={mode}
              type="button"
              className={`mode-card mode-${mode}`}
              onClick={() => onChoose(mode)}
            >
              <span className="mode-icon">{item.icon}</span>
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
