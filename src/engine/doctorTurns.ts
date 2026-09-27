import { NAMES } from '../data/banks'
import { CANCERS, getCancer, type CancerDef } from '../data/doctorLevels'
import { BANK_SIZE, type LevelId } from '../types'
import { decodeIndex, mulberry32, shuffle } from './rng'

export interface DoctorTurn {
  id: number
  level: LevelId
  bot_message: string
  reply_1: string
  reply_2: string
  reply_3: string
  reply_4: string
  reply_5: string
  conversation_category: string
}

type Ctx = {
  name: string
  cancer: CancerDef
  test: string
  treatment: string
  sideEffect: string
  time: string
  place: string
  feeling: string
  support: string
  question: string
}

type Template = {
  goal: string
  bot: (ctx: Ctx) => string
  replies: (ctx: Ctx) => string[]
}

const TIMES = [
  'this morning',
  'yesterday',
  'last week',
  'two weeks ago',
  'since Monday',
  'after my last cycle',
  'before the scan',
  'overnight',
]

const PLACES = [
  'oncology clinic',
  'cancer center',
  'infusion room',
  'waiting area',
  'hospital ward',
  'radiation suite',
  'imaging department',
  'home',
]

const FEELINGS = [
  'worried',
  'hopeful',
  'tired',
  'okay',
  'anxious',
  'stronger',
  'uncertain',
  'calmer',
]

const SUPPORT = [
  'my partner',
  'my sister',
  'my brother',
  'my friend',
  'my parent',
  'my caregiver',
  'my nurse navigator',
  'my support group',
]

const QUESTIONS = [
  'what the next step is',
  'how long treatment may take',
  'what side effects to expect',
  'when to call urgently',
  'how to manage pain',
  'whether I can keep working',
  'what the scan showed',
  'how to prepare for the appointment',
]

function makeCtxFromKey(cancer: CancerDef, key: number): Ctx {
  const sizes = [
    NAMES.length,
    cancer.commonTests.length,
    cancer.treatments.length,
    cancer.sideEffects.length,
    TIMES.length,
    PLACES.length,
    FEELINGS.length,
    SUPPORT.length,
    QUESTIONS.length,
  ]
  const [ni, ti, tri, si, tmi, pi, fei, sui, qi] = decodeIndex(key, sizes)
  return {
    name: NAMES[ni],
    cancer,
    test: cancer.commonTests[ti],
    treatment: cancer.treatments[tri],
    sideEffect: cancer.sideEffects[si],
    time: TIMES[tmi],
    place: PLACES[pi],
    feeling: FEELINGS[fei],
    support: SUPPORT[sui],
    question: QUESTIONS[qi],
  }
}

function gcd(a: number, b: number): number {
  while (b) {
    const t = a % b
    a = b
    b = t
  }
  return a
}

function findMix(total: number): number {
  let mix = Math.floor(total * 0.6180339887498949) | 1
  if (mix < 2) mix = 1
  while (gcd(mix, total) !== 1) mix += 2
  if (mix >= total) mix = 1
  return mix
}

/** Every slot appears so combinatorial ids stay unique. */
function uniqueBot(template: Template, ctx: Ctx): string {
  const core = template.bot(ctx).replace(/\s+/g, ' ').trim()
  return `${ctx.name}, ${ctx.time} at the ${ctx.place}: ${core} (${ctx.cancer.shortName}; ${ctx.cancer.site}; ${ctx.test}; ${ctx.treatment}; ${ctx.sideEffect}; feeling ${ctx.feeling}; with ${ctx.support}; about ${ctx.question}).`
}

function five(replies: string[], seed: number): [string, string, string, string, string] {
  const rand = mulberry32(seed)
  const unique: string[] = []
  const seen = new Set<string>()
  for (const reply of shuffle(replies, rand)) {
    const key = reply.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(reply.trim())
    if (unique.length === 5) break
  }
  while (unique.length < 5) unique.push('Okay.')
  return [unique[0], unique[1], unique[2], unique[3], unique[4]]
}

/** Shared oncology English templates — cancer name filled from context. */
const CANCER_TEMPLATES: Template[] = [
  {
    goal: 'Opening the visit',
    bot: (c) => `Hello. What brings you in today about your ${c.cancer.shortName}?`,
    replies: (c) => [
      `I want to talk about my ${c.cancer.shortName} care.`,
      'I have new symptoms to report.',
      'I need help understanding my treatment plan.',
      'I am here for a follow-up visit.',
      'I have questions before my next appointment.',
    ],
  },
  {
    goal: 'Naming the diagnosis',
    bot: () => `Can you tell me the name of your diagnosis in your own words?`,
    replies: (c) => [
      `I was diagnosed with ${c.cancer.shortName}.`,
      `My doctor said I have ${c.cancer.shortName} in the ${c.cancer.site}.`,
      'I am still learning how to say it clearly.',
      `It is ${c.cancer.shortName}, and I am starting treatment.`,
      `I have ${c.cancer.shortName} and need practice explaining it.`,
    ],
  },
  {
    goal: 'Site and location',
    bot: (c) => `Where is the ${c.cancer.shortName} located?`,
    replies: (c) => [
      `It is in my ${c.cancer.site}.`,
      `The main area is the ${c.cancer.site}.`,
      'I am not sure of the exact spot yet.',
      `My doctor pointed to the ${c.cancer.site} on the scan.`,
      `It started in the ${c.cancer.site}.`,
    ],
  },
  {
    goal: 'Symptom report',
    bot: (c) => `What symptom related to ${c.cancer.shortName} worries you most right now?`,
    replies: (c) => [
      `The ${c.sideEffect} is hardest.`,
      'Pain that is getting worse.',
      'Feeling very tired every day.',
      'Trouble doing normal activities.',
      'A new symptom I have not had before.',
    ],
  },
  {
    goal: 'When it started',
    bot: () => 'When did this problem start?',
    replies: (c) => [
      `It started ${c.time}.`,
      'It has been getting worse recently.',
      'It began after my last treatment.',
      'I first noticed it last month.',
      'I am not sure of the exact day.',
    ],
  },
  {
    goal: 'Test talk',
    bot: (c) => `Have you had a ${c.test} for your ${c.cancer.shortName}?`,
    replies: (c) => [
      `Yes, I had a ${c.test}.`,
      `I am scheduled for a ${c.test}.`,
      'Not yet, but my doctor ordered one.',
      `I had a ${c.test} ${c.time}.`,
      'I need help understanding what that test is.',
    ],
  },
  {
    goal: 'Understanding results',
    bot: (c) => `What did your doctor say about the ${c.test} results?`,
    replies: () => [
      'The results are still pending.',
      'They want another scan to compare.',
      'The treatment seems to be helping.',
      'There are some changes we need to watch.',
      'I did not fully understand and need it explained again.',
    ],
  },
  {
    goal: 'Treatment plan',
    bot: (c) => `Which treatment are you discussing for ${c.cancer.shortName}?`,
    replies: (c) => [
      `We are talking about ${c.treatment}.`,
      `My plan includes ${c.treatment}.`,
      'I am comparing a few options.',
      'I want a second opinion first.',
      'I need simpler words to understand the plan.',
    ],
  },
  {
    goal: 'Chemotherapy English',
    bot: () => 'How can you describe chemotherapy in simple English?',
    replies: () => [
      'It is medicine that travels through the body to treat cancer.',
      'It can be given by infusion or tablets.',
      'It may cause side effects like fatigue or nausea.',
      'Nurses watch me closely during the infusion.',
      'I should report fever or severe symptoms quickly.',
    ],
  },
  {
    goal: 'Radiation English',
    bot: () => 'What is radiation therapy, in everyday words?',
    replies: () => [
      'It uses careful beams to treat the cancer area.',
      'Each session is usually short.',
      'I must lie still in the same position.',
      'Skin in the area may become sore.',
      'I should tell the team about new pain or burns.',
    ],
  },
  {
    goal: 'Surgery talk',
    bot: (c) => `What question would you ask before surgery for ${c.cancer.shortName}?`,
    replies: () => [
      'How long will recovery take?',
      'What risks should I know about?',
      'Will I need help at home afterward?',
      'When can I eat and walk again?',
      'What warning signs mean I should call?',
    ],
  },
  {
    goal: 'Side effects',
    bot: (c) => `Are you having ${c.sideEffect} from treatment?`,
    replies: (c) => [
      `Yes, the ${c.sideEffect} is bothering me.`,
      'A little, but I can manage it.',
      'No, not that one.',
      `Yes, especially ${c.time}.`,
      'I am not sure if it is from treatment.',
    ],
  },
  {
    goal: 'Reporting urgently',
    bot: () => 'Which problem should you report to the clinic right away?',
    replies: () => [
      'A fever during cancer treatment.',
      'Sudden severe pain.',
      'Trouble breathing.',
      'Uncontrolled vomiting.',
      'Confusion or fainting.',
    ],
  },
  {
    goal: 'Pain words',
    bot: () => 'How bad is your pain from 0 to 10?',
    replies: () => [
      'About a 3 — mild.',
      'Around a 6 — moderate.',
      'An 8 — strong and hard to ignore.',
      'It changes during the day.',
      'It is worse at night.',
    ],
  },
  {
    goal: 'Daily life',
    bot: (c) => `How is ${c.cancer.shortName} treatment affecting your daily life?`,
    replies: (c) => [
      `I feel ${c.feeling} most days.`,
      'I need more rest than before.',
      'I can still do light activities.',
      'Work is harder right now.',
      'I need help with errands.',
    ],
  },
  {
    goal: 'Support network',
    bot: () => 'Who is helping you during treatment?',
    replies: (c) => [
      `${c.support} is helping me.`,
      'I have a caregiver at home.',
      'I am mostly managing alone.',
      'My clinic team is very supportive.',
      'I want to find a support group.',
    ],
  },
  {
    goal: 'Questions for the oncologist',
    bot: () => 'What do you want to ask your oncologist today?',
    replies: (c) => [
      `I want to ask ${c.question}.`,
      'I want clearer words about my scan.',
      'I want to know if treatment is working.',
      'I need advice about side effects.',
      'I want to confirm the next appointment.',
    ],
  },
  {
    goal: 'Appointments',
    bot: () => 'When is your next oncology appointment?',
    replies: (c) => [
      `It is ${c.time}.`,
      'Next week at the cancer center.',
      'I still need to book it.',
      'After my next blood test.',
      'I am waiting for a call back.',
    ],
  },
  {
    goal: 'Preparing for a visit',
    bot: () => 'How can you prepare for your oncology visit?',
    replies: (c) => [
      `I will write down questions about ${c.question}.`,
      'I will bring a list of my medicines.',
      'I will note new symptoms and when they started.',
      `I will ask ${c.support} to come with me.`,
      'I will bring my recent test papers.',
    ],
  },
  {
    goal: 'Medicine and doses',
    bot: () => 'How do you take your cancer medicines safely?',
    replies: () => [
      'I follow the exact dose and schedule.',
      'I do not skip doses without asking.',
      'I store medicines as instructed.',
      'I report new side effects quickly.',
      'I ask before taking other medicines or supplements.',
    ],
  },
  {
    goal: 'Infection precautions',
    bot: () => 'What can you say about infection precautions during cancer care?',
    replies: () => [
      'I wash my hands often.',
      'I avoid crowded places when my counts are low.',
      'I call if I get a fever.',
      'I cook food carefully and store leftovers safely.',
      'I ask visitors to stay home if they are sick.',
    ],
  },
  {
    goal: 'Nutrition during treatment',
    bot: () => 'What is a helpful nutrition goal during cancer treatment?',
    replies: () => [
      'Eat small meals if large ones are hard.',
      'Drink enough fluids unless told otherwise.',
      'Choose protein when appetite is low.',
      'Tell the team about big weight changes.',
      'Ask a dietitian for a simple plan.',
    ],
  },
  {
    goal: 'Emotions and worry',
    bot: () => 'How are you feeling emotionally about cancer care?',
    replies: (c) => [
      `I feel ${c.feeling}.`,
      'Some days are harder than others.',
      'I am coping with support.',
      'I would like counseling resources.',
      'I feel overwhelmed and need to talk.',
    ],
  },
  {
    goal: 'Caregiver English',
    bot: () => 'How can a caregiver ask for clear information?',
    replies: (c) => [
      'Could you explain that in simpler words?',
      `What should we watch for at home after ${c.treatment}?`,
      'When should we call the clinic urgently?',
      'Can you write the plan down for us?',
      'Who do we contact after hours?',
    ],
  },
  {
    goal: 'Scan and staging talk',
    bot: (c) => `Your team mentioned staging for ${c.cancer.shortName}. What can you say?`,
    replies: () => [
      'Staging describes how far the cancer has spread.',
      'I want the doctor to explain my stage clearly.',
      'Staging helps choose the treatment plan.',
      'I still have questions about what my stage means.',
      'I will ask for a written summary.',
    ],
  },
  {
    goal: 'Remission and follow-up',
    bot: () => 'What does follow-up care mean after cancer treatment?',
    replies: (c) => [
      'Regular visits and tests to check for changes.',
      `Another ${c.test} may be part of follow-up.`,
      'I should report new symptoms early.',
      'Follow-up helps catch problems sooner.',
      'I will keep my appointment schedule.',
    ],
  },
  {
    goal: 'Work and daily plans',
    bot: () => 'Can you keep working during treatment?',
    replies: () => [
      'I may need a lighter schedule.',
      'Some days I can work; some days I cannot.',
      'I will ask my doctor for work advice.',
      'I might need medical leave for a while.',
      'I will plan rest around infusion days.',
    ],
  },
  {
    goal: 'Clinical trial talk',
    bot: () => 'What is a clinical trial, in simple English?',
    replies: () => [
      'It is a research study of a new treatment.',
      'I can ask about benefits and risks.',
      'Joining is my choice.',
      'I can leave a trial if I need to.',
      'I want written information before deciding.',
    ],
  },
  {
    goal: 'Palliative and comfort care',
    bot: () => 'What does comfort care mean?',
    replies: () => [
      'It focuses on symptom relief and quality of life.',
      'It can be given along with cancer treatment.',
      'It helps with pain, sleep, and stress.',
      'It is not only for the end of life.',
      'I can ask the team for a palliative care referral.',
    ],
  },
  {
    goal: 'Closing the visit',
    bot: (c) => `Before you leave, what is your next step for ${c.cancer.shortName} care?`,
    replies: (c) => [
      `I will start ${c.treatment} as planned.`,
      `I will complete my ${c.test}.`,
      'I will call if symptoms get worse.',
      `I will talk with ${c.support} about the plan.`,
      'I will book my follow-up appointment.',
    ],
  },
]

export function generateDoctorTurn(level: LevelId, id: number, bankSize = BANK_SIZE): DoctorTurn {
  const cancer = getCancer(level)
  const size = Math.max(1, Math.floor(bankSize))
  const index = ((id % size) + size) % size
  const mix = findMix(size)
  const key = Number((BigInt(index) * BigInt(mix)) % BigInt(size))
  const ctx = makeCtxFromKey(cancer, key + level * 1_000_003)
  const template = CANCER_TEMPLATES[key % CANCER_TEMPLATES.length]
  const seed = level * 700_019 + index * 131
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five(template.replies(ctx), seed)

  return {
    id: index,
    level,
    bot_message: uniqueBot(template, ctx),
    reply_1,
    reply_2,
    reply_3,
    reply_4,
    reply_5,
    conversation_category: template.goal,
  }
}

/** Used by regen tooling. */
export function doctorCancerCount(): number {
  return CANCERS.length
}
