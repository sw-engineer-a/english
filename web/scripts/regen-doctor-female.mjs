/**
 * Women's health detection chats — one folder per condition under csv/doctor/female/.
 * Does not touch cancer folders.
 *
 *   npm run regen:female
 *   node scripts/regen-doctor-female.mjs pcos
 */
import {
  createWriteStream,
  renameSync,
  unlinkSync,
  existsSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HEADER = ['patient_1', 'bot_1', 'patient_2', 'bot_2', 'patient_3', 'bot_3', 'patient_4', 'bot_4']

const CATEGORIES = [
  { level: 101, folder: 'pcos', title: 'PCOS' },
  { level: 102, folder: 'endometriosis', title: 'Endometriosis' },
  { level: 103, folder: 'uterine-fibroids', title: 'Uterine Fibroids' },
  { level: 104, folder: 'heavy-periods', title: 'Heavy Periods' },
  { level: 105, folder: 'urinary-tract-infection', title: 'Urinary Tract Infection' },
  { level: 106, folder: 'yeast-infection', title: 'Yeast Infection' },
  { level: 107, folder: 'bacterial-vaginosis', title: 'Bacterial Vaginosis' },
  { level: 108, folder: 'pelvic-inflammatory-disease', title: 'Pelvic Inflammatory Disease' },
  { level: 109, folder: 'menopause', title: 'Menopause' },
  { level: 110, folder: 'osteoporosis', title: 'Osteoporosis' },
  { level: 111, folder: 'ovarian-cysts', title: 'Ovarian Cysts' },
  { level: 112, folder: 'cervical-screening', title: 'Cervical Screening' },
  { level: 113, folder: 'breast-screening', title: 'Breast Screening' },
  { level: 114, folder: 'thyroid-disorder', title: 'Thyroid Disorder' },
  { level: 115, folder: 'iron-deficiency-anemia', title: 'Iron-Deficiency Anemia' },
  { level: 116, folder: 'gestational-diabetes', title: 'Gestational Diabetes' },
]

const BANK = 100_000
const ROWS_PER_PART = 100_000

function csvCell(value) {
  const text = String(value ?? '')
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

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

function writePartStreaming(filePath, start, end, order, level, seen, generateFemaleTurn) {
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
        const turn = generateFemaleTurn(level, order[row])
        const fingerprint = `${turn.patient_1}|${turn.bot_1}|${turn.patient_2}|${turn.bot_2}|${turn.patient_3}|${turn.bot_3}|${turn.patient_4}|${turn.bot_4}`
        if (seen.has(fingerprint)) dups++
        else seen.add(fingerprint)
        chunk +=
          [
            turn.patient_1,
            turn.bot_1,
            turn.patient_2,
            turn.bot_2,
            turn.patient_3,
            turn.bot_3,
            turn.patient_4,
            turn.bot_4,
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

function zipFolder(folderPath, zipPath) {
  if (existsSync(zipPath)) unlinkSync(zipPath)
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `Compress-Archive -Path "${folderPath}\\*" -DestinationPath "${zipPath}" -Force`,
    ],
    { stdio: 'inherit' },
  )
}

const { generateFemaleTurn } = await import(
  pathToFileURL(path.join(root, 'scripts', '_femaleTurns.bundle.mjs')).href
)

function resolveJobs(argv) {
  if (argv.length === 0) return CATEGORIES
  return argv.map((raw) => {
    const asNum = Number(raw)
    const hit = CATEGORIES.find(
      (c) => c.level === asNum || c.folder === raw || c.folder.endsWith(raw),
    )
    if (!hit) {
      process.stderr.write(`Unknown female condition: ${raw}\n`)
      process.exit(1)
    }
    return hit
  })
}

const jobs = resolveJobs(process.argv.slice(2))
const femaleRoot = path.join(root, 'csv', 'doctor', 'female')
mkdirSync(femaleRoot, { recursive: true })

for (const job of jobs) {
  const { level, folder, title } = job
  const outDir = path.join(femaleRoot, folder)
  mkdirSync(outDir, { recursive: true })

  const order = shuffledIds(BANK, level * 900_001 + 17)
  const seen = new Set()
  let dups = 0
  const startedAll = Date.now()

  process.stdout.write(`[female/${folder}] Generating ${BANK.toLocaleString()} chats — ${title}\n`)
  const filePath = path.join(outDir, 'part-01.csv')
  const started = Date.now()
  const { status, dups: partDups } = await writePartStreaming(
    filePath,
    0,
    BANK,
    order,
    level,
    seen,
    generateFemaleTurn,
  )
  dups += partDups
  const note = status === 'tmp' ? ' (tmp left — close Excel if locked)' : ''
  process.stdout.write(
    `[female/${folder}] Done part-01.csv in ${((Date.now() - started) / 1000).toFixed(1)}s${note}\n`,
  )

  const manifest = {
    mode: 'doctor',
    track: 'female',
    category: folder,
    condition: title,
    title,
    level,
    total_rows: BANK,
    rows_per_file: ROWS_PER_PART,
    part_count: 1,
    columns: HEADER,
    purpose: 'multi-turn visit: patient reports symptoms, doctor gives a diagnosis',
    shuffle: 'deterministic-by-condition',
    files: ['part-01.csv'],
  }
  writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const zipPath = path.join(femaleRoot, `${folder}.zip`)
  process.stdout.write(`[female/${folder}] Zipping → female/${path.basename(zipPath)}\n`)
  zipFolder(outDir, zipPath)

  process.stdout.write(
    `[female/${folder}] Finished in ${((Date.now() - startedAll) / 1000).toFixed(1)}s (unique=${seen.size.toLocaleString()}, dups=${dups})\n`,
  )
  if (dups > 0) process.exitCode = 1
}

process.stdout.write('Female detection export finished. Cancer data was left in place.\n')
