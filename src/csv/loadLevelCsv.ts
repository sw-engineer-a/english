import type { AppMode, LevelId } from '../types'
import { DOCTOR_CSV_FILES } from '../data/doctorLevels'

export interface ChatTurn {
  id: number
  bot_message: string
  replies: [string, string, string, string, string]
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

export function parseChatCsv(text: string): ChatTurn[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  const turns: ChatTurn[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line || !line.trim()) continue
    const cells = parseCsvLine(line)
    if (cells.length < 6) continue
    const [bot_message, r1, r2, r3, r4, r5] = cells
    if (!bot_message) continue
    turns.push({
      id: turns.length,
      bot_message,
      replies: [r1, r2, r3, r4, r5],
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
