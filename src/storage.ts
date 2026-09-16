import type { AppMode, LevelId, LevelStats } from './types'

const KEY = 'english-app-stats-v2'

const empty = (): LevelStats => ({
  seen: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  lastId: 0,
})

function emptyMode(): Record<LevelId, LevelStats> {
  return { 1: empty(), 2: empty(), 3: empty(), 4: empty(), 5: empty(), 6: empty() }
}

export type ModeStats = Record<AppMode, Record<LevelId, LevelStats>>

export function loadStats(): ModeStats {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      // migrate old english-only stats if present
      const legacy = localStorage.getItem('english-learner-stats-v1')
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<Record<LevelId, LevelStats>>
        return {
          english: {
            1: { ...empty(), ...parsed[1] },
            2: { ...empty(), ...parsed[2] },
            3: { ...empty(), ...parsed[3] },
            4: { ...empty(), ...parsed[4] },
            5: { ...empty(), ...parsed[5] },
            6: { ...empty(), ...parsed[6] },
          },
          doctor: emptyMode(),
        }
      }
      return { english: emptyMode(), doctor: emptyMode() }
    }
    const parsed = JSON.parse(raw) as Partial<ModeStats>
    return {
      english: { ...emptyMode(), ...parsed.english },
      doctor: { ...emptyMode(), ...parsed.doctor },
    }
  } catch {
    return { english: emptyMode(), doctor: emptyMode() }
  }
}

export function saveStats(stats: ModeStats): void {
  localStorage.setItem(KEY, JSON.stringify(stats))
}

export function recordAnswer(
  stats: ModeStats,
  mode: AppMode,
  level: LevelId,
  questionId: number,
  correct: boolean,
): ModeStats {
  const current = stats[mode][level]
  const streak = correct ? current.streak + 1 : 0
  const next: ModeStats = {
    ...stats,
    [mode]: {
      ...stats[mode],
      [level]: {
        seen: current.seen + 1,
        correct: current.correct + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(current.bestStreak, streak),
        lastId: questionId,
      },
    },
  }
  saveStats(next)
  return next
}
