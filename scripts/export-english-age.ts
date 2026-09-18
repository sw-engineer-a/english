/**
 * Export one English age level as a folder of split CSVs (GitHub-friendly).
 *
 * Usage:
 *   node scripts/export-english-age.mjs 6-8
 *   node scripts/export-english-age.mjs all
 *   node scripts/export-english-age.mjs 6-8 --total=1000000 --rows=100000
 */
import { createWriteStream, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateChatTurn } from '../src/engine/chatTurns'
import { getTopics } from '../src/engine/topics'
import type { LevelId } from '../src/types'

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

const AGE_LEVELS: Record<string, { level: LevelId; folder: string }> = {
  '3-5': { level: 1, folder: 'ages-3-5' },
  '6-8': { level: 2, folder: 'ages-6-8' },
  '9-10': { level: 3, folder: 'ages-9-10' },
  '11-12': { level: 4, folder: 'ages-11-12' },
  '13-15': { level: 5, folder: 'ages-13-15' },
  '15-plus': { level: 6, folder: 'ages-15-plus' },
}

function csvCell(value: string | number): string {
  const text = String(value ?? '')
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

function parseArgs(argv: string[]) {
  const ageKey = argv[2]
  let total = 1_000_000
  let rowsPerFile = 100_000

  for (const arg of argv.slice(3)) {
    if (arg.startsWith('--total=')) total = Number(arg.slice('--total='.length))
    if (arg.startsWith('--rows=')) rowsPerFile = Number(arg.slice('--rows='.length))
  }

  if (!ageKey || (ageKey !== 'all' && !AGE_LEVELS[ageKey])) {
    process.stderr.write(
      `Usage: node scripts/export-english-age.mjs <all|${Object.keys(AGE_LEVELS).join('|')}> [--total=1000000] [--rows=100000]\n`,
    )
    process.exit(1)
  }

  if (!Number.isFinite(total) || total < 1) {
    process.stderr.write('Invalid --total\n')
    process.exit(1)
  }
  if (!Number.isFinite(rowsPerFile) || rowsPerFile < 1) {
    process.stderr.write('Invalid --rows\n')
    process.exit(1)
  }

  const jobs =
    ageKey === 'all'
      ? Object.entries(AGE_LEVELS).map(([key, meta]) => ({ ageKey: key, ...meta }))
      : [{ ageKey, ...AGE_LEVELS[ageKey] }]

  return { jobs, total: Math.floor(total), rowsPerFile: Math.floor(rowsPerFile) }
}

async function exportAge(opts: {
  ageKey: string
  level: LevelId
  folder: string
  total: number
  rowsPerFile: number
}) {
  const { ageKey, level, folder, total, rowsPerFile } = opts
  const outDir = path.join(root, 'csv', 'english', folder)
  await mkdir(outDir, { recursive: true })

  const topics = getTopics(level)
  const topicsPath = path.join(outDir, 'topics.csv')
  writeFileSync(
    topicsPath,
    `${['topic_id,topic', ...topics.map((t) => `${t.id},${csvCell(t.name)}`)].join('\n')}\n`,
    'utf8',
  )
  process.stdout.write(`[${folder}] Wrote topics.csv (${topics.length} topics)\n`)

  const partCount = Math.ceil(total / rowsPerFile)
  process.stdout.write(
    `[${folder}] Generating ${total.toLocaleString()} chats for ages ${ageKey} (level ${level}) in ${partCount} parts × ${rowsPerFile.toLocaleString()} rows\n`,
  )

  const startedAll = Date.now()
  for (let part = 0; part < partCount; part++) {
    const startId = part * rowsPerFile
    const endId = Math.min(total, startId + rowsPerFile)
    const partNo = String(part + 1).padStart(2, '0')
    const fileName = `part-${partNo}.csv`
    const filePath = path.join(outDir, fileName)
    const started = Date.now()
    process.stdout.write(`[${folder}] Writing ${fileName} (rows ${startId + 1}–${endId})...\n`)
    await writePart(filePath, level, total, startId, endId)
    process.stdout.write(
      `[${folder}] Done ${fileName} in ${((Date.now() - started) / 1000).toFixed(1)}s\n`,
    )
  }

  const manifest = {
    ages: ageKey,
    level,
    total_rows: total,
    rows_per_file: rowsPerFile,
    part_count: partCount,
    columns: HEADER,
    topics_file: 'topics.csv',
    topic_count: topics.length,
    files: Array.from({ length: partCount }, (_, i) => `part-${String(i + 1).padStart(2, '0')}.csv`),
  }
  writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  process.stdout.write(
    `[${folder}] Finished ${total.toLocaleString()} rows in ${((Date.now() - startedAll) / 1000).toFixed(1)}s\n`,
  )
}

const { jobs, total, rowsPerFile } = parseArgs(process.argv)
for (const job of jobs) {
  await exportAge({ ...job, total, rowsPerFile })
}
process.stdout.write('English age export finished.\n')

function writePart(
  filePath: string,
  level: LevelId,
  bankSize: number,
  startId: number,
  endIdExclusive: number,
): Promise<void> {
  const stream = createWriteStream(filePath, { encoding: 'utf8' })

  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.write(`${HEADER.join(',')}\n`)

    let index = startId
    const chunkSize = 400

    const pump = () => {
      let chunk = ''
      const end = Math.min(endIdExclusive, index + chunkSize)
      for (; index < end; index++) {
        const turn = generateChatTurn(level, index, bankSize)
        chunk += [
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
          .join(',')
        chunk += '\n'
      }

      const ok = stream.write(chunk)
      if (index >= endIdExclusive) {
        stream.end(() => resolve())
        return
      }
      if (ok) setImmediate(pump)
      else stream.once('drain', pump)
    }

    pump()
  })
}
