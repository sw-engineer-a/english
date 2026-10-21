import type { LevelId } from '../types'

/** Topic row for one age level's topics.csv */
export type TopicRow = {
  id: number
  name: string
}

function build(names: string[]): TopicRow[] {
  return names.map((name, i) => ({ id: i + 1, name }))
}

/** Age-specific topic tables (IDs restart at 1 in each age folder). */
export const TOPICS_BY_LEVEL: Record<LevelId, TopicRow[]> = {
  1: build([
    'at home',
    'at preschool',
    'at the park',
    'at the playground',
    'at the zoo',
    'on a farm',
    'at the shop',
    'in the living room',
    'in the kitchen',
    'outside',
    'with mom',
    'with dad',
    'with grandma',
    'with family',
    'with friends',
    'playtime',
    'snack time',
    'story time',
    'bath time',
    'bedtime',
    'morning',
    'afternoon',
    'evening',
    'toy time',
    'animal time',
    'color time',
    'counting time',
    'singing time',
    'drawing time',
    'mealtime',
  ]),
  2: build([
    'at home',
    'at school',
    'on the way to school',
    'on the way from school',
    'after school',
    'before school',
    'in the classroom',
    'during break',
    'at lunch',
    'at the park',
    'at the playground',
    'at the shop',
    'at the zoo',
    'on a farm',
    'in the living room',
    'in the kitchen',
    'outside',
    'with family',
    'with friends',
    'with teacher',
    'morning',
    'afternoon',
    'evening',
    'weekend',
    'mealtime',
    'playtime',
    'homework time',
    'art time',
    'math time',
    'reading time',
    'shopping',
    'sports day',
  ]),
  3: build([
    'at home',
    'at school',
    'on the way to school',
    'on the way from school',
    'after school',
    'in the classroom',
    'during break',
    'at lunch',
    'at the library',
    'at the park',
    'at the shop',
    'at a café',
    'at a restaurant',
    'at a sports club',
    'at a birthday party',
    'outside',
    'in town',
    'on the bus',
    'with family',
    'with friends',
    'with classmates',
    'morning',
    'afternoon',
    'evening',
    'weekend',
    'homework time',
    'club time',
    'weekend plans',
    'shopping',
    'mealtime',
    'practice time',
  ]),
  4: build([
    'at home',
    'at school',
    'on the way to school',
    'on the way from school',
    'after school',
    'in the classroom',
    'during break',
    'at lunch',
    'at the library',
    'at the park',
    'at a café',
    'at a sports club',
    'at a club meeting',
    'group project',
    'outside',
    'in town',
    'on the bus',
    'online',
    'with family',
    'with friends',
    'with classmates',
    'morning',
    'afternoon',
    'evening',
    'weekend',
    'homework time',
    'study group',
    'before a test',
    'presentation day',
    'travel talk',
    'shopping',
  ]),
  5: build([
    'at home',
    'at school',
    'on the way to school',
    'on the way from school',
    'after school',
    'in the classroom',
    'during break',
    'at the library',
    'at a café',
    'at a sports club',
    'at the mall',
    'at a party',
    'hanging out',
    'online',
    'on social media',
    'on the bus',
    'in town',
    'with family',
    'with friends',
    'with classmates',
    'morning',
    'afternoon',
    'evening',
    'weekend',
    'exam week',
    'before a test',
    'homework time',
    'study group',
    'part-time job talk',
    'future plans',
    'group chat',
  ]),
  6: build([
    'at home',
    'at university',
    'at work',
    'at the office',
    'in a meeting',
    'at an interview',
    'at a café',
    'at the library',
    'in a seminar',
    'online',
    'on a video call',
    'in town',
    'on a trip',
    'at the airport',
    'with family',
    'with friends',
    'with classmates',
    'with colleagues',
    'with a client',
    'morning',
    'afternoon',
    'evening',
    'weekend',
    'study group',
    'career talk',
    'job interview',
    'team project',
    'formal email',
    'networking',
    'presentation',
    'after class',
  ]),
}

const BY_LEVEL_ID = new Map<LevelId, Map<number, string>>()
const BY_LEVEL_NAME = new Map<LevelId, Map<string, number>>()

for (const level of [1, 2, 3, 4, 5, 6] as LevelId[]) {
  const rows = TOPICS_BY_LEVEL[level]
  BY_LEVEL_ID.set(level, new Map(rows.map((t) => [t.id, t.name])))
  BY_LEVEL_NAME.set(level, new Map(rows.map((t) => [t.name, t.id])))
}

export function getTopics(level: LevelId): TopicRow[] {
  return TOPICS_BY_LEVEL[level]
}

export function topicName(level: LevelId, id: number): string {
  return BY_LEVEL_ID.get(level)?.get(id) ?? ''
}

export function topicId(level: LevelId, name: string): number {
  const id = BY_LEVEL_NAME.get(level)?.get(name)
  if (id == null) throw new Error(`Unknown topic for level ${level}: ${name}`)
  return id
}

export function resolveTopicIds(
  level: LevelId,
  ids: Array<number | string | undefined | null>,
): string[] {
  return ids
    .map((raw) => {
      if (raw == null || raw === '') return ''
      const id = typeof raw === 'number' ? raw : Number(raw)
      if (!Number.isFinite(id) || id <= 0) return ''
      return topicName(level, id)
    })
    .filter(Boolean)
}

/** @deprecated use getTopics(level) — kept for older flat export helpers */
export const TOPICS = TOPICS_BY_LEVEL[2]
