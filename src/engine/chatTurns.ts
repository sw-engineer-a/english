import { BANK_SIZE, type LevelId } from '../types'
import { generateUniqueChatTurn } from './uniqueTurns'

export interface ChatTurn {
  id: number
  level: LevelId
  bot_message: string
  reply_1: string
  reply_2: string
  reply_3: string
  reply_4: string
  reply_5: string
  topic1: number
  topic2: number
  topic3: number
}

/** Age-leveled chat turn; unique by combinatorial pattern capacity. */
export function generateChatTurn(level: LevelId, id: number, bankSize = BANK_SIZE): ChatTurn {
  return generateUniqueChatTurn(level, id, bankSize)
}
