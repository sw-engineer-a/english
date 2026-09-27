/**
 * Regenerate AI Doctor CSV banks — one folder per cancer type.
 *
 *   npm run regen:doctor
 *   node scripts/regen-doctor-categories.mjs 1
 *   node scripts/regen-doctor-categories.mjs breast-cancer
 */
import {
  createWriteStream,
  renameSync,
  unlinkSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HEADER = ['bot_message', 'reply_1', 'reply_2', 'reply_3', 'reply_4', 'reply_5']

const CATEGORIES = {
  1: { level: 1, folder: 'breast-cancer', title: 'Breast Cancer' },
  2: { level: 2, folder: 'lung-cancer', title: 'Lung Cancer' },
  3: { level: 3, folder: 'colorectal-cancer', title: 'Colorectal Cancer' },
  4: { level: 4, folder: 'prostate-cancer', title: 'Prostate Cancer' },
  5: { level: 5, folder: 'skin-cancer', title: 'Skin Cancer' },
  6: { level: 6, folder: 'leukemia', title: 'Leukemia' },
  7: { level: 7, folder: 'lymphoma', title: 'Lymphoma' },
  8: { level: 8, folder: 'stomach-cancer', title: 'Stomach Cancer' },
  9: { level: 9, folder: 'liver-cancer', title: 'Liver Cancer' },
  10: { level: 10, folder: 'cervical-cancer', title: 'Cervical Cancer' },
  11: { level: 11, folder: 'ovarian-cancer', title: 'Ovarian Cancer' },
  12: { level: 12, folder: 'pancreatic-cancer', title: 'Pancreatic Cancer' },
  13: { level: 13, folder: 'bladder-cancer', title: 'Bladder Cancer' },
  14: { level: 14, folder: 'kidney-cancer', title: 'Kidney Cancer' },
  15: { level: 15, folder: 'thyroid-cancer', title: 'Thyroid Cancer' },
  16: { level: 16, folder: 'brain-cancer', title: 'Brain Cancer' },
  17: { level: 17, folder: 'esophageal-cancer', title: 'Esophageal Cancer' },
  18: { level: 18, folder: 'head-neck-cancer', title: 'Head & Neck Cancer' },
  19: { level: 19, folder: 'uterine-cancer', title: 'Uterine Cancer' },
  20: { level: 20, folder: 'bone-cancer', title: 'Bone Cancer' },
}

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
        const turn = generateDoctorTurn(level, order[row])
        if (seen.has(turn.bot_message)) dups++
        else seen.add(turn.bot_message)
        chunk +=
          [turn.bot_message, turn.reply_1, turn.reply_2, turn.reply_3, turn.reply_4, turn.reply_5]
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

const { generateDoctorTurn } = await import(
  pathToFileURL(path.join(root, 'scripts', '_doctorTurns.bundle.mjs')).href
)

function resolveJobs(argv) {
  if (argv.length === 0) {
    return Object.values(CATEGORIES)
  }
  return argv.map((raw) => {
    const asNum = Number(raw)
    if (Number.isFinite(asNum) && CATEGORIES[asNum]) return CATEGORIES[asNum]
    const hit = Object.values(CATEGORIES).find(
      (c) => c.folder === raw || c.folder === `cancer-${raw}` || c.folder.endsWith(raw),
    )
    if (!hit) {
      process.stderr.write(`Unknown cancer: ${raw}\n`)
      process.exit(1)
    }
    return hit
  })
}

const jobs = resolveJobs(process.argv.slice(2))
const doctorRoot = path.join(root, 'csv', 'doctor')
mkdirSync(doctorRoot, { recursive: true })

// Remove obsolete clinic-category folders/zips when regenerating everything.
if (process.argv.slice(2).length === 0 && existsSync(doctorRoot)) {
  for (const name of readdirSync(doctorRoot)) {
    const full = path.join(doctorRoot, name)
    if (name === 'female' || name === 'cancer') continue
    const keep = Object.values(CATEGORIES).some(
      (c) => name === c.folder || name === `${c.folder}.zip`,
    )
    if (!keep) {
      rmSync(full, { recursive: true, force: true })
      process.stdout.write(`Removed obsolete ${name}\n`)
    }
  }
}

for (const job of jobs) {
  const { level, folder, title } = job
  const outDir = path.join(doctorRoot, folder)
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const order = shuffledIds(BANK, level * 900_001 + 41)
  const seen = new Set()
  let dups = 0
  const partCount = Math.ceil(BANK / ROWS_PER_PART)
  const startedAll = Date.now()

  process.stdout.write(`[${folder}] Generating ${BANK.toLocaleString()} chats — ${title}\n`)

  for (let part = 0; part < partCount; part++) {
    const start = part * ROWS_PER_PART
    const end = Math.min(BANK, start + ROWS_PER_PART)
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
    const note = status === 'tmp' ? ' (tmp left — close Excel if locked)' : ''
    process.stdout.write(
      `[${folder}] Done part-${partNo}.csv in ${((Date.now() - started) / 1000).toFixed(1)}s${note}\n`,
    )
  }

  const files = Array.from({ length: partCount }, (_, i) => `part-${String(i + 1).padStart(2, '0')}.csv`)
  const manifest = {
    mode: 'doctor',
    category: folder,
    cancer: title,
    title,
    level,
    total_rows: BANK,
    rows_per_file: ROWS_PER_PART,
    part_count: partCount,
    columns: HEADER,
    shuffle: 'deterministic-by-cancer',
    files,
  }
  writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const zipPath = path.join(doctorRoot, `${folder}.zip`)
  process.stdout.write(`[${folder}] Zipping → ${path.basename(zipPath)}\n`)
  zipFolder(outDir, zipPath)

  process.stdout.write(
    `[${folder}] Finished in ${((Date.now() - startedAll) / 1000).toFixed(1)}s (unique=${seen.size.toLocaleString()}, dups=${dups})\n`,
  )
  if (dups > 0) process.exitCode = 1
}

process.stdout.write('Doctor cancer export finished.\n')
