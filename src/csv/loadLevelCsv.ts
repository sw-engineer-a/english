import type { AppMode, LevelId } from '../types'
import { DOCTOR_CSV_FILES } from '../data/doctorLevels'

export interface ChatTurn {
  id: number
  bot_message: string
  replies: [string, string, string, string, string]
  /** Topic table IDs (0 / missing = unused). */
  topic1?: number
  topic2?: number
  topic3?: number
}

const ENGLISH_FILES: Record<LevelId, string> = {
  1: 'level-1-ages-3-5.csv',
  2: 'level-2-ages-6-8.csv',
  3: 'level-3-ages-9-10.csv',
  4: 'level-4-ages-11-12.csv',
  5: 'level-5-ages-13-15.csv',
  6: 'level-6-ages-15-plus.csv',
}

export function csvPath(mode: AppMode, level: LevelId): string {
  const file = mode === 'doctor' ? DOCTOR_CSV_FILES[level] : ENGLISH_FILES[level]
  return `/csv/${mode}/${file}`
}

const cache = new Map<string, ChatTurn[]>()

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      cells.push(current)
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current)
  return cells
}

function parseTopicId(raw: string | undefined): number | undefined {
  if (raw == null || raw.trim() === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return Math.trunc(n)
}

export function parseChatCsv(text: string): ChatTurn[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines.length === 0) return []

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)

  const botIdx = idx('bot_message')
  const r1 = idx('reply_1')
  const r2 = idx('reply_2')
  const r3 = idx('reply_3')
  const r4 = idx('reply_4')
  const r5 = idx('reply_5')
  const t1 = idx('topic1')
  const t2 = idx('topic2')
  const t3 = idx('topic3')

  const turns: ChatTurn[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line || !line.trim()) continue
    const cells = parseCsvLine(line)

    if (botIdx < 0 || r1 < 0 || r2 < 0 || r3 < 0 || r4 < 0 || r5 < 0) {
      if (cells.length < 6) continue
      const [bot_message, a, b, c, d, e, topic1, topic2, topic3] = cells
      if (!bot_message) continue
      turns.push({
        id: turns.length,
        bot_message,
        replies: [a, b, c, d, e],
        topic1: parseTopicId(topic1),
        topic2: parseTopicId(topic2),
        topic3: parseTopicId(topic3),
      })
      continue
    }

    const bot_message = cells[botIdx]
    if (!bot_message) continue
    turns.push({
      id: turns.length,
      bot_message,
      replies: [cells[r1], cells[r2], cells[r3], cells[r4], cells[r5]],
      topic1: t1 >= 0 ? parseTopicId(cells[t1]) : undefined,
      topic2: t2 >= 0 ? parseTopicId(cells[t2]) : undefined,
      topic3: t3 >= 0 ? parseTopicId(cells[t3]) : undefined,
    })
  }

  return turns
}

export async function loadLevelCsv(mode: AppMode, level: LevelId): Promise<ChatTurn[]> {
  const key = `${mode}:${level}`
  const hit = cache.get(key)
  if (hit) return hit

  const path = csvPath(mode, level)
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`)
  }
  const text = await response.text()
  const turns = parseChatCsv(text)
  if (turns.length === 0) {
    throw new Error(`No chat rows found in ${path}`)
  }
  cache.set(key, turns)
  return turns
}
