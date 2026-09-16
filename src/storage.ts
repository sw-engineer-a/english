import type { LevelId, LevelStats } from './types'

const KEY = 'english-learner-stats-v1'

const empty = (): LevelStats => ({
  seen: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  lastId: 0,
})

export function loadStats(): Record<LevelId, LevelStats> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return { 1: empty(), 2: empty(), 3: empty(), 4: empty(), 5: empty(), 6: empty() }
    }
    const parsed = JSON.parse(raw) as Partial<Record<LevelId, LevelStats>>
    return {
      1: { ...empty(), ...parsed[1] },
      2: { ...empty(), ...parsed[2] },
      3: { ...empty(), ...parsed[3] },
      4: { ...empty(), ...parsed[4] },
      5: { ...empty(), ...parsed[5] },
      6: { ...empty(), ...parsed[6] },
    }
  } catch {
    return { 1: empty(), 2: empty(), 3: empty(), 4: empty(), 5: empty(), 6: empty() }
  }
}

export function saveStats(stats: Record<LevelId, LevelStats>): void {
  localStorage.setItem(KEY, JSON.stringify(stats))
}

export function recordAnswer(
  stats: Record<LevelId, LevelStats>,
  level: LevelId,
  questionId: number,
  correct: boolean,
): Record<LevelId, LevelStats> {
  const current = stats[level]
  const streak = correct ? current.streak + 1 : 0
  const next = {
    ...stats,
    [level]: {
      seen: current.seen + 1,
      correct: current.correct + (correct ? 1 : 0),
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      lastId: questionId,
    },
  }
  saveStats(next)
  return next
}
