import { FEMALE_CONDITIONS } from './data/femaleConditions'
import type { AppMode, LevelId, LevelStats } from './types'

const KEY = 'english-app-stats-v2'
const ENGLISH_IDS: LevelId[] = [1, 2, 3, 4, 5, 6]

const empty = (): LevelStats => ({
  seen: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  lastId: 0,
})

function emptyFor(ids: LevelId[]): Record<LevelId, LevelStats> {
  const out: Record<LevelId, LevelStats> = {}
  for (const id of ids) out[id] = empty()
  return out
}

function emptyEnglish(): Record<LevelId, LevelStats> {
  return emptyFor(ENGLISH_IDS)
}

function emptyDoctor(): Record<LevelId, LevelStats> {
  return emptyFor(FEMALE_CONDITIONS.map((c) => c.id))
}

export type ModeStats = Record<AppMode, Record<LevelId, LevelStats>>

export function loadStats(): ModeStats {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const legacy = localStorage.getItem('english-learner-stats-v1')
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<Record<LevelId, LevelStats>>
        return {
          english: {
            ...emptyEnglish(),
            1: { ...empty(), ...parsed[1] },
            2: { ...empty(), ...parsed[2] },
            3: { ...empty(), ...parsed[3] },
            4: { ...empty(), ...parsed[4] },
            5: { ...empty(), ...parsed[5] },
            6: { ...empty(), ...parsed[6] },
          },
          doctor: emptyDoctor(),
        }
      }
      return { english: emptyEnglish(), doctor: emptyDoctor() }
    }
    const parsed = JSON.parse(raw) as Partial<ModeStats>
    return {
      english: { ...emptyEnglish(), ...parsed.english },
      doctor: { ...emptyDoctor(), ...parsed.doctor },
    }
  } catch {
    return { english: emptyEnglish(), doctor: emptyDoctor() }
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
  const current = stats[mode][level] ?? empty()
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
