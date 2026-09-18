import { createWriteStream, writeFileSync } from 'node:fs'
import { mkdir, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOCTOR_CSV_FILES } from '../src/data/doctorLevels'
import { generateChatTurn } from '../src/engine/chatTurns'
import { generateDoctorTurn } from '../src/engine/doctorTurns'
import { getTopics } from '../src/engine/topics'
import { BANK_SIZE, type LevelId } from '../src/types'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const ENGLISH_HEADER = [
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

const DOCTOR_HEADER = [
  'bot_message',
  'reply_1',
  'reply_2',
  'reply_3',
  'reply_4',
  'reply_5',
]

const ENGLISH_FILES: { level: LevelId; file: string }[] = [
  { level: 1, file: 'level-1-ages-3-5.csv' },
  { level: 2, file: 'level-2-ages-6-8.csv' },
  { level: 3, file: 'level-3-ages-9-10.csv' },
  { level: 4, file: 'level-4-ages-11-12.csv' },
  { level: 5, file: 'level-5-ages-13-15.csv' },
  { level: 6, file: 'level-6-ages-15-plus.csv' },
]

const DOCTOR_FILES: { level: LevelId; file: string }[] = (
  Object.entries(DOCTOR_CSV_FILES) as [string, string][]
).map(([level, file]) => ({ level: Number(level) as LevelId, file }))

function csvCell(value: string | number): string {
  const text = String(value ?? '')
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

function writeBank(
  filePath: string,
  header: string[],
  makeRow: (level: LevelId, index: number) => string[],
  level: LevelId,
): Promise<void> {
  const stream = createWriteStream(filePath, { encoding: 'utf8' })

  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.write(`${header.join(',')}\n`)

    let index = 0
    const chunkSize = 400

    const pump = () => {
      let chunk = ''
      const end = Math.min(BANK_SIZE, index + chunkSize)
      for (; index < end; index++) {
        chunk += makeRow(level, index).map(csvCell).join(',')
        chunk += '\n'
      }

      const ok = stream.write(chunk)
      if (index >= BANK_SIZE) {
        stream.end(() => resolve())
        return
      }
      if (ok) setImmediate(pump)
      else stream.once('drain', pump)
    }

    pump()
  })
}

async function clearOldDoctorFiles(outDir: string) {
  const files = await readdir(outDir).catch(() => [] as string[])
  for (const file of files) {
    if (file.startsWith('level-') && file.endsWith('.csv')) {
      await unlink(path.join(outDir, file))
    }
  }
}

async function exportMode(
  mode: 'english' | 'doctor',
  files: { level: LevelId; file: string }[],
  header: string[],
  makeRow: (level: LevelId, index: number) => string[],
) {
  const outDir = path.join(root, 'csv', mode)
  await mkdir(outDir, { recursive: true })
  if (mode === 'doctor') await clearOldDoctorFiles(outDir)

  for (const item of files) {
    const filePath = path.join(outDir, item.file)
    const started = Date.now()
    process.stdout.write(`[${mode}] Writing ${item.file}...\n`)
    await writeBank(filePath, header, makeRow, item.level)
    process.stdout.write(
      `[${mode}] Done ${item.file} in ${((Date.now() - started) / 1000).toFixed(1)}s\n`,
    )
  }
}

const only = process.argv[2] // english | doctor | all

if (!only || only === 'all' || only === 'english') {
  const englishDir = path.join(root, 'csv', 'english')
  await mkdir(englishDir, { recursive: true })
  const topicsPath = path.join(englishDir, 'topics.csv')
  const topics = getTopics(2)
  const topicsCsv = ['topic_id,topic', ...topics.map((t) => `${t.id},${csvCell(t.name)}`)].join(
    '\n',
  )
  writeFileSync(topicsPath, `${topicsCsv}\n`, 'utf8')
  process.stdout.write(`[english] Wrote topics.csv (${topics.length} topics)\n`)

  await exportMode('english', ENGLISH_FILES, ENGLISH_HEADER, (level, index) => {
    const turn = generateChatTurn(level, index)
    return [
      turn.bot_message,
      turn.reply_1,
      turn.reply_2,
      turn.reply_3,
      turn.reply_4,
      turn.reply_5,
      String(turn.topic1),
      String(turn.topic2),
      String(turn.topic3),
    ]
  })
}

if (!only || only === 'all' || only === 'doctor') {
  await exportMode('doctor', DOCTOR_FILES, DOCTOR_HEADER, (level, index) => {
    const turn = generateDoctorTurn(level, index)
    return [
      turn.bot_message,
      turn.reply_1,
      turn.reply_2,
      turn.reply_3,
      turn.reply_4,
      turn.reply_5,
    ]
  })
}

process.stdout.write('CSV export finished.\n')
