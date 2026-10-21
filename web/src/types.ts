/** English uses 1–6. AI Doctor uses women’s health topic ids (see FEMALE_CONDITIONS). */
export type LevelId = number
export type AppMode = 'english' | 'doctor'

export interface TutorPersona {
  name: string
  role: string
  avatar: string
  greeting: string
  praise: string[]
  retry: string[]
  next: string[]
}

export interface LevelTheme {
  bg: string
  bg2: string
  accent: string
  accent2: string
  ink: string
  card: string
  bubble: string
  userBubble: string
}

export interface LevelConfig {
  id: LevelId
  title: string
  ages: string
  cefr: string
  tagline: string
  focus: string[]
  tutor: TutorPersona
  theme: LevelTheme
}

export interface Question {
  id: number
  level: LevelId
  skill: string
  prompt: string
  passage?: string
  answers: string[]
  correctIndex: number
  explanation: string
}

export interface ChatMessage {
  id: string
  role: 'tutor' | 'user' | 'system'
  text: string
  passage?: string
  kind?: 'question' | 'feedback' | 'hello' | 'summary'
  correct?: boolean
}

export interface LevelStats {
  seen: number
  correct: number
  streak: number
  bestStreak: number
  lastId: number
}

export const BANK_SIZE = 100_000
export const CHOICES = 5

export const MODE_LABELS: Record<AppMode, { title: string; subtitle: string; icon: string }> = {
  english: {
    title: 'English Learning',
    subtitle: 'Practice everyday English chat by age level.',
    icon: '📚',
  },
  doctor: {
    title: 'AI Doctor',
    subtitle: 'Describe symptoms and receive a diagnosis for women’s health conditions.',
    icon: '🩺',
  },
}
