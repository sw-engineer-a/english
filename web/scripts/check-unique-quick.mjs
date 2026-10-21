/**
 * Quick uniqueness check for one level.
 *   node scripts/check-unique-quick.mjs [level=1] [count=100000]
 */
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const level = Number(process.argv[2] || 1)
const count = Number(process.argv[3] || 100_000)

const { generateChatTurn } = await import(
  pathToFileURL(path.join(root, 'scripts', '_chatTurns.bundle.mjs')).href
)

const seen = new Set()
let dups = 0
for (let i = 0; i < count; i++) {
  const msg = generateChatTurn(level, i, 1_000_000).bot_message
  if (seen.has(msg)) dups++
  else seen.add(msg)
}
console.log(JSON.stringify({ level, checked: count, unique: seen.size, dups }))
if (dups > 0) process.exitCode = 1
