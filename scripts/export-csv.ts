import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEVELS } from '../src/data/levels'
import { generateQuestion } from '../src/engine/generate'
import { BANK_SIZE, type LevelId } from '../src/types'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'csv')

const HEADER = [
  'question_id',
  'level',
  'ages',
  'tutor',
  'skill',
  'passage',
  'prompt',
  'answer_a',
  'answer_b',
  'answer_c',
  'answer_d',
  'answer_e',
  'correct_letter',
  'correct_answer',
  'correct_index',
  'explanation',
]

const FILES: { level: LevelId; file: string }[] = [
  { level: 1, file: 'level-1-ages-3-5.csv' },
  { level: 2, file: 'level-2-ages-6-8.csv' },
  { level: 3, file: 'level-3-ages-9-10.csv' },
  { level: 4, file: 'level-4-ages-11-12.csv' },
  { level: 5, file: 'level-5-ages-13-15.csv' },
  { level: 6, file: 'level-6-ages-15-plus.csv' },
]

function csvCell(value: string | number): string {
  const text = String(value ?? '')
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

function writeLevel(level: LevelId, filePath: string): Promise<void> {
  const meta = LEVELS[level - 1]
  const stream = createWriteStream(filePath, { encoding: 'utf8' })
  const letters = ['A', 'B', 'C', 'D', 'E'] as const

  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.write('\uFEFF')
    stream.write(`${HEADER.join(',')}\n`)

    let index = 0
    const chunkSize = 250

    const pump = () => {
      let chunk = ''
      const end = Math.min(BANK_SIZE, index + chunkSize)
      for (; index < end; index++) {
        const q = generateQuestion(level, index)
        chunk += [
          q.id + 1,
          q.level,
          meta.ages,
          meta.tutor.name,
          q.skill,
          q.passage ?? '',
          q.prompt,
          q.answers[0] ?? '',
          q.answers[1] ?? '',
          q.answers[2] ?? '',
          q.answers[3] ?? '',
          q.answers[4] ?? '',
          letters[q.correctIndex] ?? '',
          q.answers[q.correctIndex] ?? '',
          q.correctIndex,
          q.explanation,
        ]
          .map(csvCell)
          .join(',')
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

await mkdir(outDir, { recursive: true })

for (const item of FILES) {
  const filePath = path.join(outDir, item.file)
  const started = Date.now()
  process.stdout.write(`Writing ${item.file}...\n`)
  await writeLevel(item.level, filePath)
  process.stdout.write(`Done ${item.file} in ${((Date.now() - started) / 1000).toFixed(1)}s\n`)
}

process.stdout.write(`CSV files saved in ${outDir}\n`)
