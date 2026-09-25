/**
 * Regenerate English age CSV banks (1M rows × 10 parts each).
 * - Identical: same id always yields the same question
 * - Random: file order is a deterministic shuffle (neighbors differ)
 * - Unique: no duplicate bot_message in the bank
 *
 *   npm run regen:ages              # all ages
 *   npm run regen:ages -- 06-08     # one age (args after --)
 *   node scripts/regen-english-ages.mjs 03-05 06-08
 */
import { createWriteStream, renameSync, unlinkSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HEADER = [
  'bot_message',
  'reply_1',
  'reply_2',
  'reply_3',
  'reply_4',
  'reply_5',
  'topic1',
  'topic2',
  'topic3',
]

const AGE_LEVELS = {
  '03-05': { level: 1, folder: 'ages-03-05' },
  '06-08': { level: 2, folder: 'ages-06-08' },
  '09-10': { level: 3, folder: 'ages-09-10' },
  '11-12': { level: 4, folder: 'ages-11-12' },
  '13-15': { level: 5, folder: 'ages-13-15' },
  '15-plus': { level: 6, folder: 'ages-15-plus' },
}

function csvCell(value) {
  const text = String(value ?? '')
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

/** Deterministic shuffle (same seed → same order every run). */
function shuffledIds(n, seed) {
  const ids = Array.from({ length: n }, (_, i) => i)
  let a = seed | 0
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids
}

/** Stream one part without buffering 100k row strings. */
function writePartStreaming(filePath, start, end, order, level, seen) {
  const tmpPath = `${filePath}.tmp`
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(tmpPath, { encoding: 'utf8' })
    stream.on('error', reject)
    stream.write(`${HEADER.join(',')}\n`)
    let row = start
    let dups = 0
    const chunkSize = 400
    const pump = () => {
      let chunk = ''
      const stop = Math.min(end, row + chunkSize)
      for (; row < stop; row++) {
        const turn = generateChatTurn(level, order[row], BANK)
        if (seen.has(turn.bot_message)) dups++
        else seen.add(turn.bot_message)
        chunk +=
          [
            turn.bot_message,
            turn.reply_1,
            turn.reply_2,
            turn.reply_3,
            turn.reply_4,
            turn.reply_5,
            turn.topic1,
            turn.topic2,
            turn.topic3,
          ]
            .map(csvCell)
            .join(',') + '\n'
      }
      const ok = stream.write(chunk)
      if (row >= end) {
        stream.end(() => {
          try {
            if (existsSync(filePath)) unlinkSync(filePath)
            renameSync(tmpPath, filePath)
            resolve({ status: 'ok', dups })
          } catch {
            resolve({ status: 'tmp', dups })
          }
        })
        return
      }
      if (ok) setImmediate(pump)
      else stream.once('drain', pump)
    }
    pump()
  })
}

const { generateChatTurn } = await import(
  pathToFileURL(path.join(root, 'scripts', '_chatTurns.bundle.mjs')).href
)
const { getTopics } = await import(
  pathToFileURL(path.join(root, 'scripts', '_topics.bundle.mjs')).href
)

const BANK = 1_000_000
const ROWS_PER_PART = 100_000
const PARTS = 10

const requested = process.argv.slice(2)
const jobs =
  requested.length > 0
    ? requested.map((key) => {
        const meta = AGE_LEVELS[key]
        if (!meta) {
          process.stderr.write(`Unknown age key: ${key}\n`)
          process.exit(1)
        }
        return { ageKey: key, ...meta }
      })
    : Object.entries(AGE_LEVELS).map(([ageKey, meta]) => ({ ageKey, ...meta }))

for (const job of jobs) {
  const { ageKey, level, folder } = job
  const outDir = path.join(root, 'csv', 'english', folder)
  mkdirSync(outDir, { recursive: true })

  const topics = getTopics(level)
  writeFileSync(
    path.join(outDir, 'topics.csv'),
    `${['topic_id,topic', ...topics.map((t) => `${t.id},${csvCell(t.name)}`)].join('\n')}\n`,
    'utf8',
  )
  process.stdout.write(`[${folder}] Wrote topics.csv (${topics.length} topics)\n`)

  // Stable shuffle per level so re-runs match; neighbors in the file look random.
  const order = shuffledIds(BANK, level * 1_000_003 + 97)
  const seen = new Set()
  let dups = 0
  const startedAll = Date.now()
  process.stdout.write(
    `[${folder}] Generating ${BANK.toLocaleString()} unique chats (level ${level}), random file order...\n`,
  )

  for (let part = 0; part < PARTS; part++) {
    const start = part * ROWS_PER_PART
    const end = start + ROWS_PER_PART
    const partNo = String(part + 1).padStart(2, '0')
    const filePath = path.join(outDir, `part-${partNo}.csv`)
    const started = Date.now()
    process.stdout.write(`[${folder}] Writing part-${partNo}.csv (rows ${start + 1}–${end})...\n`)

    const { status, dups: partDups } = await writePartStreaming(
      filePath,
      start,
      end,
      order,
      level,
      seen,
    )
    dups += partDups
    const note = status === 'tmp' ? ` (left as .tmp — close Excel if locked)` : ''
    process.stdout.write(
      `[${folder}] Done part-${partNo}.csv in ${((Date.now() - started) / 1000).toFixed(1)}s${note}\n`,
    )
  }

  const manifest = {
    ages: ageKey,
    level,
    total_rows: BANK,
    rows_per_file: ROWS_PER_PART,
    part_count: PARTS,
    columns: HEADER,
    topics_file: 'topics.csv',
    topic_count: topics.length,
    shuffle: 'deterministic-by-level',
    files: Array.from({ length: PARTS }, (_, i) => `part-${String(i + 1).padStart(2, '0')}.csv`),
  }
  writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  process.stdout.write(
    `[${folder}] Finished ${BANK.toLocaleString()} rows in ${((Date.now() - startedAll) / 1000).toFixed(1)}s (unique=${seen.size.toLocaleString()}, dups=${dups})\n`,
  )
  if (dups > 0) process.exitCode = 1
}

process.stdout.write('English age export finished.\n')
