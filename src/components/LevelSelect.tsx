import { useEffect, useMemo, useState } from 'react'
import { LEVELS } from '../data/levels'
import { BANK_SIZE, type LevelId, type LevelStats } from '../types'

interface Props {
  stats: Record<LevelId, LevelStats>
  onChoose: (level: LevelId) => void
}

export function LevelSelect({ stats, onChoose }: Props) {
  const [uiLang, setUiLang] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('english-ui-lang')
    if (saved) setUiLang(saved)
  }, [])

  const copy = useMemo(() => UI[uiLang] ?? UI.en, [uiLang])

  return (
    <div className="home">
      <header className="home-hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lede">{copy.lede}</p>
        <label className="lang-row">
          <span>{copy.uiLanguage}</span>
          <select
            value={uiLang}
            onChange={(e) => {
              setUiLang(e.target.value)
              localStorage.setItem('english-ui-lang', e.target.value)
            }}
          >
            {LANGS.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className="level-grid">
        {LEVELS.map((level) => {
          const s = stats[level.id]
          const accuracy = s.seen ? Math.round((s.correct / s.seen) * 100) : 0
          return (
            <button
              key={level.id}
              type="button"
              className={`level-card level-${level.id}`}
              onClick={() => onChoose(level.id)}
              style={{
                ['--accent' as string]: level.theme.accent,
                ['--accent2' as string]: level.theme.accent2,
              }}
            >
              <span className="level-avatar">{level.tutor.avatar}</span>
              <span className="level-kicker">
                {copy.level} {level.id} · {level.cefr}
              </span>
              <strong>{level.title}</strong>
              <span className="ages">{level.ages}</span>
              <span className="tagline">{level.tagline}</span>
              <ul>
                {level.focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <span className="bank-note">{BANK_SIZE.toLocaleString()} {copy.questions} · 5 {copy.answers}</span>
              <span className="stats-line">
                {s.seen === 0 ? copy.start : `${accuracy}% · ${s.seen.toLocaleString()} ${copy.practiced}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '中文' },
  { id: 'es', label: 'Español' },
  { id: 'ar', label: 'العربية' },
  { id: 'fr', label: 'Français' },
  { id: 'ko', label: '한국어' },
  { id: 'ja', label: '日本語' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'pt', label: 'Português' },
  { id: 'hi', label: 'हिन्दी' },
]

const UI: Record<string, Record<string, string>> = {
  en: {
    eyebrow: 'English chat school for every age',
    title: 'Learn English by chatting',
    lede: 'Pick your age level. Each chat tutor has 100,000 questions, and every question has 5 answers. The English gets harder as you grow.',
    uiLanguage: 'Menu language',
    level: 'Level',
    questions: 'questions',
    answers: 'answers each',
    start: 'Tap to start chatting',
    practiced: 'practiced',
  },
  zh: {
    eyebrow: '适合每个年龄的英语聊天课堂',
    title: '用聊天学英语',
    lede: '选择你的年龄等级。每位老师有 10 万道题，每题 5 个选项。等级越高，英语越难。',
    uiLanguage: '界面语言',
    level: '等级',
    questions: '题',
    answers: '个选项',
    start: '点击开始聊天',
    practiced: '已练习',
  },
  es: {
    eyebrow: 'Escuela de inglés por edades',
    title: 'Aprende inglés conversando',
    lede: 'Elige tu nivel. Cada tutor tiene 100.000 preguntas, y cada pregunta tiene 5 respuestas.',
    uiLanguage: 'Idioma del menú',
    level: 'Nivel',
    questions: 'preguntas',
    answers: 'respuestas',
    start: 'Toca para empezar',
    practiced: 'practicadas',
  },
  ar: {
    eyebrow: 'مدرسة محادثة إنجليزية لكل عمر',
    title: 'تعلّم الإنجليزية بالمحادثة',
    lede: 'اختر مستواك. لكل مدرّس 100 ألف سؤال، ولكل سؤال 5 إجابات.',
    uiLanguage: 'لغة القائمة',
    level: 'المستوى',
    questions: 'سؤال',
    answers: 'إجابات',
    start: 'ابدأ المحادثة',
    practiced: 'تم التمرين',
  },
  fr: {
    eyebrow: 'Anglais conversationnel par âge',
    title: 'Apprendre l’anglais en discutant',
    lede: 'Choisissez votre niveau. Chaque tuteur a 100 000 questions, avec 5 réponses chacune.',
    uiLanguage: 'Langue du menu',
    level: 'Niveau',
    questions: 'questions',
    answers: 'réponses',
    start: 'Touchez pour commencer',
    practiced: 'faites',
  },
  ko: {
    eyebrow: '나이별 영어 회화 교실',
    title: '채팅으로 영어 배우기',
    lede: '나이 레벨을 고르세요. 각 튜터는 10만 문제, 문제마다 보기 5개입니다.',
    uiLanguage: '메뉴 언어',
    level: '레벨',
    questions: '문제',
    answers: '보기',
    start: '채팅 시작',
    practiced: '연습함',
  },
  ja: {
    eyebrow: '年齢別の英語チャット教室',
    title: 'チャットで英語を学ぶ',
    lede: '年齢レベルを選んでください。各講師は10万問、各問5つの選択肢があります。',
    uiLanguage: 'メニュー言語',
    level: 'レベル',
    questions: '問',
    answers: '選択肢',
    start: 'チャットを始める',
    practiced: '練習済み',
  },
  vi: {
    eyebrow: 'Lớp chat tiếng Anh theo độ tuổi',
    title: 'Học tiếng Anh bằng trò chuyện',
    lede: 'Chọn cấp độ. Mỗi giáo viên có 100.000 câu hỏi, mỗi câu 5 đáp án.',
    uiLanguage: 'Ngôn ngữ menu',
    level: 'Cấp',
    questions: 'câu hỏi',
    answers: 'đáp án',
    start: 'Bắt đầu chat',
    practiced: 'đã luyện',
  },
  pt: {
    eyebrow: 'Inglês conversação por idade',
    title: 'Aprenda inglês conversando',
    lede: 'Escolha seu nível. Cada tutor tem 100.000 perguntas, com 5 respostas cada.',
    uiLanguage: 'Idioma do menu',
    level: 'Nível',
    questions: 'perguntas',
    answers: 'respostas',
    start: 'Toque para começar',
    practiced: 'praticadas',
  },
  hi: {
    eyebrow: 'हर उम्र के लिए अंग्रेज़ी चैट स्कूल',
    title: 'बात करके अंग्रेज़ी सीखें',
    lede: 'अपना स्तर चुनें। हर शिक्षक के पास 1 लाख प्रश्न हैं, हर प्रश्न के 5 उत्तर।',
    uiLanguage: 'मेनू भाषा',
    level: 'स्तर',
    questions: 'प्रश्न',
    answers: 'उत्तर',
    start: 'चैट शुरू करें',
    practiced: 'अभ्यास',
  },
}
