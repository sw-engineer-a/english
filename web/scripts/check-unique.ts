import { generateUniqueChatTurn, uniqueCapacity } from '../src/engine/uniqueTurns'
import type { LevelId } from '../src/types'

const levels = (process.argv[2] ? [Number(process.argv[2])] : [1, 2, 3, 4, 5, 6]) as LevelId[]
const sample = Number(process.argv[3] || 1_000_000)

for (const level of levels) {
  const capacity = uniqueCapacity(level)
  const total = Math.min(sample, capacity)
  const seen = new Set<string>()
  let dup = 0
  for (let i = 0; i < total; i++) {
    const msg = generateUniqueChatTurn(level, i, total).bot_message
    if (seen.has(msg)) dup++
    else seen.add(msg)
  }
  const preview = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => generateUniqueChatTurn(level, i, total).bot_message)
  console.log(JSON.stringify({ level, capacity, checked: total, unique: seen.size, duplicates: dup }))
  for (const line of preview) console.log('  -', line)
}
