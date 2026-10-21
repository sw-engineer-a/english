import type { LevelId } from '../types'
import { topicId } from './topics'

/** Topic columns store age-level topic table IDs. */
export type TopicTags = {
  topic1: number
  topic2: number
  topic3: number
}

type Triple = [number, number, number]
type Pool = Record<string, Triple[]>

function T(level: LevelId, a: string, b: string, c: string): Triple {
  return [topicId(level, a), topicId(level, b), topicId(level, c)]
}

const L1: Pool = {
  'Speaking and introductions': [
    T(1, 'at home', 'with family', 'morning'),
    T(1, 'at preschool', 'with friends', 'morning'),
    T(1, 'at the park', 'with mom', 'afternoon'),
    T(1, 'at home', 'with dad', 'evening'),
  ],
  Colors: [
    T(1, 'at home', 'color time', 'playtime'),
    T(1, 'at preschool', 'drawing time', 'with friends'),
    T(1, 'at the park', 'outside', 'with family'),
  ],
  Animals: [
    T(1, 'at the zoo', 'animal time', 'with family'),
    T(1, 'on a farm', 'animal time', 'with dad'),
    T(1, 'at home', 'toy time', 'playtime'),
  ],
  Food: [
    T(1, 'at home', 'in the kitchen', 'mealtime'),
    T(1, 'at home', 'snack time', 'with mom'),
    T(1, 'at preschool', 'snack time', 'with friends'),
  ],
  'Toys and play': [
    T(1, 'at home', 'toy time', 'playtime'),
    T(1, 'at the playground', 'with friends', 'afternoon'),
    T(1, 'at the park', 'outside', 'with family'),
  ],
  Numbers: [
    T(1, 'at preschool', 'counting time', 'with friends'),
    T(1, 'at home', 'counting time', 'playtime'),
    T(1, 'at the shop', 'with mom', 'afternoon'),
  ],
  Family: [
    T(1, 'at home', 'with family', 'evening'),
    T(1, 'at home', 'with grandma', 'afternoon'),
    T(1, 'in the living room', 'with mom', 'story time'),
  ],
  Places: [
    T(1, 'at the park', 'outside', 'with family'),
    T(1, 'at home', 'with family', 'evening'),
    T(1, 'at preschool', 'with friends', 'morning'),
  ],
  Actions: [
    T(1, 'at the playground', 'playtime', 'with friends'),
    T(1, 'at home', 'playtime', 'with dad'),
    T(1, 'outside', 'at the park', 'afternoon'),
  ],
  'Polite talk': [
    T(1, 'at home', 'mealtime', 'with family'),
    T(1, 'at preschool', 'with friends', 'snack time'),
    T(1, 'at the shop', 'with mom', 'afternoon'),
  ],
}

const L2: Pool = {
  'Speaking and introductions': [
    T(2, 'at home', 'with family', 'morning'),
    T(2, 'at school', 'in the classroom', 'with friends'),
    T(2, 'on the way to school', 'with friends', 'morning'),
    T(2, 'on the way from school', 'after school', 'with friends'),
  ],
  'School vocabulary': [
    T(2, 'at school', 'in the classroom', 'with teacher'),
    T(2, 'at school', 'during break', 'with friends'),
    T(2, 'on the way to school', 'before school', 'morning'),
    T(2, 'at school', 'art time', 'with friends'),
  ],
  'Daily talk': [
    T(2, 'at home', 'morning', 'before school'),
    T(2, 'on the way to school', 'morning', 'with friends'),
    T(2, 'at school', 'in the classroom', 'morning'),
    T(2, 'on the way from school', 'afternoon', 'after school'),
  ],
  Weather: [
    T(2, 'outside', 'on the way to school', 'morning'),
    T(2, 'at the park', 'outside', 'afternoon'),
    T(2, 'at home', 'with family', 'morning'),
  ],
  'Food and likes': [
    T(2, 'at home', 'in the kitchen', 'mealtime'),
    T(2, 'at school', 'at lunch', 'with friends'),
    T(2, 'at home', 'with family', 'evening'),
  ],
  Family: [
    T(2, 'at home', 'with family', 'evening'),
    T(2, 'in the living room', 'with family', 'weekend'),
    T(2, 'on the way from school', 'with family', 'afternoon'),
  ],
  Hobbies: [
    T(2, 'at home', 'playtime', 'after school'),
    T(2, 'at the park', 'with friends', 'weekend'),
    T(2, 'at school', 'during break', 'with friends'),
    T(2, 'sports day', 'at school', 'afternoon'),
  ],
  Places: [
    T(2, 'on the way to school', 'outside', 'morning'),
    T(2, 'at the park', 'with friends', 'afternoon'),
    T(2, 'at the shop', 'shopping', 'with family'),
    T(2, 'at the zoo', 'weekend', 'with family'),
  ],
  'Polite talk': [
    T(2, 'at school', 'in the classroom', 'with teacher'),
    T(2, 'at the shop', 'shopping', 'with family'),
    T(2, 'at home', 'mealtime', 'with family'),
  ],
}

const L3: Pool = {
  'Speaking and introductions': [
    T(3, 'at school', 'in the classroom', 'with friends'),
    T(3, 'at home', 'with family', 'evening'),
    T(3, 'on the way to school', 'with friends', 'morning'),
  ],
  'Past experiences': [
    T(3, 'at home', 'with family', 'evening'),
    T(3, 'at school', 'in the classroom', 'with classmates'),
    T(3, 'at the park', 'weekend', 'with friends'),
  ],
  'School life': [
    T(3, 'at school', 'in the classroom', 'afternoon'),
    T(3, 'during break', 'with friends', 'at school'),
    T(3, 'on the way from school', 'after school', 'with friends'),
  ],
  'Reasons and because': [
    T(3, 'at school', 'with friends', 'during break'),
    T(3, 'at home', 'with family', 'evening'),
    T(3, 'at a sports club', 'practice time', 'afternoon'),
  ],
  Comparisons: [
    T(3, 'at school', 'in the classroom', 'with classmates'),
    T(3, 'at the park', 'outside', 'with friends'),
    T(3, 'at home', 'homework time', 'evening'),
  ],
  Feelings: [
    T(3, 'at home', 'with family', 'evening'),
    T(3, 'at school', 'in the classroom', 'morning'),
    T(3, 'on the way to school', 'with friends', 'morning'),
  ],
  'Weekend plans': [
    T(3, 'at home', 'weekend plans', 'with family'),
    T(3, 'at school', 'with friends', 'afternoon'),
    T(3, 'at a café', 'weekend', 'with friends'),
  ],
  'Food and preferences': [
    T(3, 'at home', 'mealtime', 'with family'),
    T(3, 'at school', 'at lunch', 'with friends'),
    T(3, 'at a restaurant', 'with family', 'evening'),
  ],
  Directions: [
    T(3, 'on the way to school', 'outside', 'morning'),
    T(3, 'in town', 'with friends', 'afternoon'),
    T(3, 'on the bus', 'after school', 'with classmates'),
  ],
  Stories: [
    T(3, 'at school', 'in the classroom', 'with classmates'),
    T(3, 'at the library', 'after school', 'homework time'),
    T(3, 'at home', 'with family', 'evening'),
  ],
  Opinions: [
    T(3, 'at school', 'with friends', 'during break'),
    T(3, 'at home', 'with family', 'evening'),
    T(3, 'at a birthday party', 'with friends', 'weekend'),
  ],
  'Daily routines': [
    T(3, 'at home', 'morning', 'on the way to school'),
    T(3, 'on the way to school', 'morning', 'with friends'),
    T(3, 'at home', 'evening', 'homework time'),
  ],
}

const L4_ONLY: Pool = {
  Conversations: [
    T(4, 'at school', 'after school', 'with friends'),
    T(4, 'at a café', 'afternoon', 'with friends'),
    T(4, 'on the way from school', 'with classmates', 'afternoon'),
  ],
  'First conditional': [
    T(4, 'at school', 'in the classroom', 'with classmates'),
    T(4, 'at home', 'weekend', 'with family'),
    T(4, 'outside', 'on the way to school', 'morning'),
  ],
  'Opinions and reasons': [
    T(4, 'at school', 'in the classroom', 'with classmates'),
    T(4, 'at a café', 'with friends', 'afternoon'),
    T(4, 'online', 'with friends', 'evening'),
  ],
  Advice: [
    T(4, 'at school', 'before a test', 'with friends'),
    T(4, 'at home', 'homework time', 'with family'),
    T(4, 'at the library', 'study group', 'after school'),
  ],
  'Phrasal verbs': [
    T(4, 'at school', 'during break', 'with friends'),
    T(4, 'on the bus', 'on the way to school', 'morning'),
    T(4, 'at home', 'with family', 'evening'),
  ],
  'School projects': [
    T(4, 'at school', 'group project', 'with classmates'),
    T(4, 'at the library', 'study group', 'after school'),
    T(4, 'online', 'group project', 'evening'),
  ],
  'Making suggestions': [
    T(4, 'after school', 'with friends', 'at a café'),
    T(4, 'at school', 'during break', 'with classmates'),
    T(4, 'weekend', 'at the park', 'with friends'),
  ],
  'Describing people': [
    T(4, 'at school', 'in the classroom', 'with friends'),
    T(4, 'at a club meeting', 'with classmates', 'afternoon'),
    T(4, 'at home', 'with family', 'evening'),
  ],
  'Travel talk': [
    T(4, 'at home', 'travel talk', 'weekend'),
    T(4, 'at school', 'in the classroom', 'with classmates'),
    T(4, 'in town', 'with family', 'weekend'),
  ],
  'Problem solving': [
    T(4, 'at school', 'with friends', 'during break'),
    T(4, 'on the bus', 'on the way to school', 'morning'),
    T(4, 'at home', 'homework time', 'evening'),
  ],
}

const L4: Pool = {
  'Speaking and introductions': [
    T(4, 'at school', 'in the classroom', 'with friends'),
    T(4, 'at home', 'with family', 'evening'),
    T(4, 'on the way to school', 'with friends', 'morning'),
  ],
  'Past experiences': [
    T(4, 'at home', 'with family', 'evening'),
    T(4, 'at school', 'in the classroom', 'with classmates'),
    T(4, 'at the park', 'weekend', 'with friends'),
  ],
  'School life': [
    T(4, 'at school', 'in the classroom', 'afternoon'),
    T(4, 'during break', 'with friends', 'at school'),
    T(4, 'on the way from school', 'after school', 'with friends'),
  ],
  'Reasons and because': [
    T(4, 'at school', 'with friends', 'during break'),
    T(4, 'at home', 'with family', 'evening'),
    T(4, 'at a sports club', 'after school', 'with friends'),
  ],
  Comparisons: [
    T(4, 'at school', 'in the classroom', 'with classmates'),
    T(4, 'at the park', 'outside', 'with friends'),
    T(4, 'at home', 'homework time', 'evening'),
  ],
  Feelings: [
    T(4, 'at home', 'with family', 'evening'),
    T(4, 'at school', 'before a test', 'morning'),
    T(4, 'on the way to school', 'with friends', 'morning'),
  ],
  'Weekend plans': [
    T(4, 'at home', 'weekend', 'with family'),
    T(4, 'at school', 'with friends', 'afternoon'),
    T(4, 'at a café', 'weekend', 'with friends'),
  ],
  'Food and preferences': [
    T(4, 'at home', 'with family', 'evening'),
    T(4, 'at school', 'at lunch', 'with friends'),
    T(4, 'at a café', 'afternoon', 'with friends'),
  ],
  Directions: [
    T(4, 'on the way to school', 'outside', 'morning'),
    T(4, 'in town', 'with friends', 'afternoon'),
    T(4, 'on the bus', 'after school', 'with classmates'),
  ],
  Stories: [
    T(4, 'at school', 'in the classroom', 'with classmates'),
    T(4, 'at the library', 'after school', 'homework time'),
    T(4, 'at home', 'with family', 'evening'),
  ],
  Opinions: [
    T(4, 'at school', 'with friends', 'during break'),
    T(4, 'at home', 'with family', 'evening'),
    T(4, 'online', 'with friends', 'evening'),
  ],
  'Daily routines': [
    T(4, 'at home', 'morning', 'on the way to school'),
    T(4, 'on the way to school', 'morning', 'with friends'),
    T(4, 'at home', 'evening', 'homework time'),
  ],
  ...L4_ONLY,
}

const L5_ONLY: Pool = {
  'Teen conversation': [
    T(5, 'at school', 'during break', 'with friends'),
    T(5, 'after school', 'at a café', 'with friends'),
    T(5, 'online', 'group chat', 'evening'),
  ],
  'Idioms in chat': [
    T(5, 'at school', 'with friends', 'during break'),
    T(5, 'at a café', 'hanging out', 'afternoon'),
    T(5, 'on social media', 'with friends', 'evening'),
  ],
  'School stress': [
    T(5, 'at school', 'exam week', 'before a test'),
    T(5, 'at home', 'homework time', 'evening'),
    T(5, 'at the library', 'study group', 'after school'),
  ],
  'Hobbies and identity': [
    T(5, 'at a sports club', 'after school', 'with friends'),
    T(5, 'at home', 'evening', 'online'),
    T(5, 'hanging out', 'at the mall', 'weekend'),
  ],
  'Agreeing and disagreeing': [
    T(5, 'at school', 'in the classroom', 'with classmates'),
    T(5, 'at a café', 'with friends', 'afternoon'),
    T(5, 'online', 'group chat', 'evening'),
  ],
  'Problem talk': [
    T(5, 'at school', 'with classmates', 'group chat'),
    T(5, 'at home', 'with family', 'evening'),
    T(5, 'online', 'with classmates', 'evening'),
  ],
  'Future goals': [
    T(5, 'at school', 'in the classroom', 'with classmates'),
    T(5, 'at home', 'future plans', 'with family'),
    T(5, 'at a café', 'with friends', 'afternoon'),
  ],
  'News and society': [
    T(5, 'at school', 'in the classroom', 'with classmates'),
    T(5, 'at home', 'with family', 'evening'),
    T(5, 'online', 'on social media', 'evening'),
  ],
  'Everyday English': [
    T(5, 'after school', 'hanging out', 'at a café'),
    T(5, 'on the way from school', 'with friends', 'afternoon'),
    T(5, 'at the mall', 'weekend', 'with friends'),
  ],
}

const L5: Pool = {
  Conversations: [
    T(5, 'at school', 'after school', 'with friends'),
    T(5, 'at a café', 'hanging out', 'afternoon'),
    T(5, 'online', 'group chat', 'evening'),
  ],
  'First conditional': [
    T(5, 'at school', 'exam week', 'with friends'),
    T(5, 'at home', 'weekend', 'with family'),
    T(5, 'on the way to school', 'morning', 'with friends'),
  ],
  'Opinions and reasons': [
    T(5, 'at school', 'in the classroom', 'with classmates'),
    T(5, 'at a café', 'with friends', 'afternoon'),
    T(5, 'online', 'on social media', 'evening'),
  ],
  Advice: [
    T(5, 'at school', 'before a test', 'with friends'),
    T(5, 'at home', 'homework time', 'evening'),
    T(5, 'at the library', 'study group', 'after school'),
  ],
  'Phrasal verbs': [
    T(5, 'at school', 'during break', 'with friends'),
    T(5, 'on the bus', 'on the way to school', 'morning'),
    T(5, 'hanging out', 'at a café', 'afternoon'),
  ],
  'School projects': [
    T(5, 'at school', 'with classmates', 'in the classroom'),
    T(5, 'at the library', 'study group', 'after school'),
    T(5, 'online', 'with classmates', 'evening'),
  ],
  'Making suggestions': [
    T(5, 'after school', 'at a café', 'with friends'),
    T(5, 'at the mall', 'weekend', 'with friends'),
    T(5, 'online', 'group chat', 'evening'),
  ],
  'Describing people': [
    T(5, 'at school', 'with friends', 'during break'),
    T(5, 'at a party', 'with friends', 'weekend'),
    T(5, 'online', 'with friends', 'evening'),
  ],
  'Travel talk': [
    T(5, 'at home', 'future plans', 'with family'),
    T(5, 'at school', 'with classmates', 'in the classroom'),
    T(5, 'in town', 'weekend', 'with friends'),
  ],
  'Problem solving': [
    T(5, 'at school', 'with friends', 'during break'),
    T(5, 'on the bus', 'on the way to school', 'morning'),
    T(5, 'at home', 'with family', 'evening'),
  ],
  Opinions: [
    T(5, 'at school', 'in the classroom', 'with classmates'),
    T(5, 'at a café', 'with friends', 'afternoon'),
    T(5, 'online', 'on social media', 'evening'),
  ],
  ...L5_ONLY,
}

const L6: Pool = {
  'Teen conversation': [
    T(6, 'at university', 'after class', 'with friends'),
    T(6, 'at a café', 'with classmates', 'afternoon'),
    T(6, 'online', 'with friends', 'evening'),
  ],
  Opinions: [
    T(6, 'at university', 'in a seminar', 'with classmates'),
    T(6, 'at a café', 'with friends', 'afternoon'),
    T(6, 'online', 'with colleagues', 'evening'),
  ],
  'Idioms in chat': [
    T(6, 'at a café', 'with friends', 'afternoon'),
    T(6, 'online', 'with classmates', 'evening'),
    T(6, 'at university', 'after class', 'with friends'),
  ],
  'School stress': [
    T(6, 'at university', 'study group', 'at the library'),
    T(6, 'at home', 'evening', 'with family'),
    T(6, 'online', 'with classmates', 'evening'),
  ],
  'Hobbies and identity': [
    T(6, 'at home', 'weekend', 'with friends'),
    T(6, 'in town', 'with friends', 'afternoon'),
    T(6, 'online', 'with friends', 'evening'),
  ],
  'Agreeing and disagreeing': [
    T(6, 'in a seminar', 'at university', 'with classmates'),
    T(6, 'at a café', 'with friends', 'afternoon'),
    T(6, 'in a meeting', 'at work', 'with colleagues'),
  ],
  'Problem talk': [
    T(6, 'at university', 'team project', 'with classmates'),
    T(6, 'at work', 'with colleagues', 'afternoon'),
    T(6, 'online', 'on a video call', 'evening'),
  ],
  'Future goals': [
    T(6, 'at an interview', 'career talk', 'morning'),
    T(6, 'at university', 'with classmates', 'after class'),
    T(6, 'at home', 'with family', 'evening'),
  ],
  'News and society': [
    T(6, 'at university', 'in a seminar', 'with classmates'),
    T(6, 'at a café', 'with friends', 'afternoon'),
    T(6, 'online', 'with classmates', 'evening'),
  ],
  'Everyday English': [
    T(6, 'at a café', 'with friends', 'afternoon'),
    T(6, 'in town', 'weekend', 'with friends'),
    T(6, 'at home', 'with family', 'evening'),
  ],
  'Professional English': [
    T(6, 'at work', 'in a meeting', 'morning'),
    T(6, 'at an interview', 'job interview', 'morning'),
    T(6, 'at the office', 'with colleagues', 'afternoon'),
  ],
  'Meetings and collaboration': [
    T(6, 'at work', 'in a meeting', 'morning'),
    T(6, 'at the office', 'team project', 'with colleagues'),
    T(6, 'online', 'on a video call', 'morning'),
  ],
  'Academic discussion': [
    T(6, 'at university', 'in a seminar', 'with classmates'),
    T(6, 'at the library', 'study group', 'afternoon'),
    T(6, 'at a café', 'with classmates', 'afternoon'),
  ],
  'Register and tone': [
    T(6, 'at university', 'formal email', 'morning'),
    T(6, 'at work', 'with a client', 'afternoon'),
    T(6, 'online', 'formal email', 'evening'),
  ],
  'Workplace chat': [
    T(6, 'at work', 'with a client', 'afternoon'),
    T(6, 'at the office', 'with colleagues', 'afternoon'),
    T(6, 'in a meeting', 'presentation', 'morning'),
  ],
  'Debate and nuance': [
    T(6, 'at university', 'in a seminar', 'with classmates'),
    T(6, 'at a café', 'with friends', 'afternoon'),
    T(6, 'at work', 'in a meeting', 'afternoon'),
  ],
  'Collocations in context': [
    T(6, 'at work', 'in a meeting', 'afternoon'),
    T(6, 'at university', 'in a seminar', 'with classmates'),
    T(6, 'at a café', 'study group', 'afternoon'),
  ],
  'Interview English': [
    T(6, 'at an interview', 'job interview', 'morning'),
    T(6, 'at the office', 'career talk', 'afternoon'),
    T(6, 'online', 'on a video call', 'afternoon'),
  ],
  'Social English': [
    T(6, 'at a café', 'with friends', 'afternoon'),
    T(6, 'networking', 'with colleagues', 'evening'),
    T(6, 'at home', 'with family', 'weekend'),
  ],
  'Problem solving': [
    T(6, 'at work', 'team project', 'with colleagues'),
    T(6, 'at university', 'with classmates', 'study group'),
    T(6, 'online', 'on a video call', 'evening'),
  ],
}

const FALLBACK: Record<LevelId, Triple[]> = {
  1: [
    T(1, 'at home', 'with family', 'playtime'),
    T(1, 'at preschool', 'with friends', 'morning'),
    T(1, 'at the park', 'with mom', 'afternoon'),
  ],
  2: [
    T(2, 'at home', 'with family', 'morning'),
    T(2, 'at school', 'with friends', 'in the classroom'),
    T(2, 'on the way to school', 'morning', 'with friends'),
  ],
  3: [
    T(3, 'at school', 'with friends', 'in the classroom'),
    T(3, 'at home', 'with family', 'evening'),
    T(3, 'on the way to school', 'morning', 'with friends'),
  ],
  4: [
    T(4, 'at school', 'with friends', 'after school'),
    T(4, 'at home', 'with family', 'evening'),
    T(4, 'at a café', 'with friends', 'afternoon'),
  ],
  5: [
    T(5, 'at school', 'with friends', 'after school'),
    T(5, 'at a café', 'hanging out', 'afternoon'),
    T(5, 'online', 'group chat', 'evening'),
  ],
  6: [
    T(6, 'at university', 'with classmates', 'after class'),
    T(6, 'at work', 'with colleagues', 'morning'),
    T(6, 'at a café', 'with friends', 'afternoon'),
  ],
}

const BY_LEVEL: Record<LevelId, Pool> = {
  1: L1,
  2: L2,
  3: L3,
  4: L4,
  5: L5,
  6: L6,
}

export function topicsForGoal(goal: string, index = 0, level: LevelId = 2): TopicTags {
  const pool = BY_LEVEL[level][goal] ?? FALLBACK[level]
  const triple = pool[((index % pool.length) + pool.length) % pool.length]
  return {
    topic1: triple[0],
    topic2: triple[1],
    topic3: triple[2],
  }
}
