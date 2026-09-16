import { createWriteStream } from 'node:fs'
import { mkdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateQuestion } from '../src/engine/generate'
import { BANK_SIZE, type LevelId } from '../src/types'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'csv')

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
  const stream = createWriteStream(filePath, { encoding: 'utf8' })

  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.write('question,answer\n')

    let index = 0
    const chunkSize = 400

    const pump = () => {
      let chunk = ''
      const end = Math.min(BANK_SIZE, index + chunkSize)
      for (; index < end; index++) {
        const q = generateQuestion(level, index)
        const question = q.passage ? `${q.passage} ${q.prompt}` : q.prompt
        const answer = q.answers[q.correctIndex] ?? ''
        chunk += `${csvCell(question)},${csvCell(answer)}\n`
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
await unlink(path.join(outDir, 'levels.csv')).catch(() => {})

for (const item of FILES) {
  const filePath = path.join(outDir, item.file)
  const started = Date.now()
  process.stdout.write(`Writing ${item.file}...\n`)
  await writeLevel(item.level, filePath)
  process.stdout.write(`Done ${item.file} in ${((Date.now() - started) / 1000).toFixed(1)}s\n`)
}

process.stdout.write(`Chat CSV files saved in ${outDir}\n`)
