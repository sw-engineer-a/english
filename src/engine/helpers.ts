import { mulberry32, shuffle } from './rng'
import type { Question } from '../types'

export function article(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? 'an' : 'a'
}

export function cap(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function thirdPerson(verb: string): string {
  if (verb === 'have') return 'has'
  if (verb === 'do') return 'does'
  if (verb === 'go') return 'goes'
  if (verb.endsWith('y') && !/[aeiou]y$/i.test(verb)) return `${verb.slice(0, -1)}ies`
  if (/(s|sh|ch|x|z|o)$/i.test(verb)) return `${verb}es`
  return `${verb}s`
}

export function gerund(verb: string): string {
  if (verb.endsWith('ie')) return `${verb.slice(0, -2)}ying`
  if (verb.endsWith('e') && !verb.endsWith('ee')) return `${verb.slice(0, -1)}ing`
  return `${verb}ing`
}

export function fiveChoices(
  correct: string,
  pool: string[],
  seed: number,
  extras: string[] = [],
): { answers: string[]; correctIndex: number } {
  const norm = (s: string) => s.trim().toLowerCase()
  const seen = new Set<string>([norm(correct)])
  const rand = mulberry32(seed)
  const distractors: string[] = []
  for (const candidate of shuffle([...pool, ...extras], rand)) {
    if (distractors.length >= 4) break
    const value = candidate.trim()
    if (!value || seen.has(norm(value))) continue
    seen.add(norm(value))
    distractors.push(value)
  }
  let pad = 1
  while (distractors.length < 4) {
    const fallback = `option ${pad++}`
    if (!seen.has(norm(fallback))) {
      seen.add(norm(fallback))
      distractors.push(fallback)
    }
  }
  const answers = shuffle([correct, ...distractors.slice(0, 4)], rand)
  return {
    answers,
    correctIndex: answers.findIndex((item) => norm(item) === norm(correct)),
  }
}

export function finalize(
  question: Omit<Question, 'answers' | 'correctIndex'> & {
    answers: string[]
    correctIndex: number
  },
): Question {
  if (question.answers.length !== 5) {
    throw new Error(`Question ${question.id} must have 5 answers`)
  }
  if (question.correctIndex < 0 || question.correctIndex > 4) {
    throw new Error(`Question ${question.id} has an invalid correct index`)
  }
  return question
}

export const GENERIC_NOUNS = [
  'book',
  'chair',
  'window',
  'pencil',
  'garden',
  'river',
  'market',
  'ticket',
  'bottle',
  'jacket',
  'camera',
  'message',
  'project',
  'lesson',
  'village',
  'station',
  'bridge',
  'kitchen',
  'weekend',
  'holiday',
]

export const GENERIC_ADJECTIVES = [
  'happy',
  'quiet',
  'busy',
  'friendly',
  'careful',
  'useful',
  'simple',
  'modern',
  'famous',
  'serious',
  'bright',
  'heavy',
  'empty',
  'fresh',
  'honest',
  'lucky',
  'nervous',
  'polite',
  'strange',
  'warm',
]
