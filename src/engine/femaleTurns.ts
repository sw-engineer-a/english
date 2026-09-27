import { getFemaleCondition, type FemaleCondition } from '../data/femaleConditions'
import { BANK_SIZE, type LevelId } from '../types'
import { decodeIndex } from './rng'

export interface DialogueLine {
  patient: string
  bot: string
}

export interface FemaleTurn {
  id: number
  level: LevelId
  patient_1: string
  bot_1: string
  patient_2: string
  bot_2: string
  patient_3: string
  bot_3: string
  patient_4: string
  bot_4: string
}

const SEVERITY = ['mild', 'moderate', 'strong', 'severe', 'on and off', 'worse at night', 'worse with activity', 'mild but daily']

const FREQUENCY = [
  'every day',
  'a few times a week',
  'only during my period',
  'after meals',
  'when I walk',
  'at night',
  'on and off',
  'most mornings',
]

/** Other conditions considered before the leading diagnosis. */
const DIFFERENTIALS: Record<string, [string, string]> = {
  pcos: ['a thyroid disorder', 'perimenopause'],
  endometriosis: ['an ovarian cyst', 'uterine fibroids'],
  'uterine-fibroids': ['heavy menstrual bleeding', 'endometriosis'],
  'heavy-periods': ['uterine fibroids', 'a thyroid disorder'],
  'urinary-tract-infection': ['vaginal irritation', 'a kidney infection'],
  'yeast-infection': ['bacterial vaginosis', 'skin irritation'],
  'bacterial-vaginosis': ['a yeast infection', 'another vaginal infection'],
  'pelvic-inflammatory-disease': ['a urinary infection', 'endometriosis'],
  menopause: ['a thyroid disorder', 'iron-deficiency anemia'],
  osteoporosis: ['low vitamin D', 'a thyroid disorder'],
  'ovarian-cysts': ['endometriosis', 'uterine fibroids'],
  'cervical-screening': ['an HPV-related cell change', 'a cervical infection'],
  'breast-screening': ['a breast cyst', 'hormonal breast tenderness'],
  'thyroid-disorder': ['iron-deficiency anemia', 'perimenopause'],
  'iron-deficiency-anemia': ['heavy menstrual bleeding', 'a thyroid disorder'],
  'gestational-diabetes': ['normal pregnancy thirst', 'anemia in pregnancy'],
}

const TIMES = [
  'since this morning',
  'since yesterday',
  'for a week',
  'for two cycles',
  'since Monday',
  'since my last period',
  'overnight',
  'for a few months',
]

const FEELINGS = ['worried', 'unsure', 'tired', 'embarrassed', 'anxious', 'a bit calmer', 'scared', 'ready to ask']

type Ctx = {
  condition: FemaleCondition
  otherA: string
  otherB: string
  sign: string
  sign2: string
  time: string
  test: string
  nextStep: string
  feeling: string
  severity: string
  frequency: string
}

function makeCtx(condition: FemaleCondition, key: number): Ctx {
  const others = DIFFERENTIALS[condition.slug] ?? ['another common condition', 'a hormone change']
  const sizes = [
    condition.signs.length,
    condition.signs.length,
    TIMES.length,
    condition.tests.length,
    condition.nextSteps.length,
    FEELINGS.length,
    SEVERITY.length,
    FREQUENCY.length,
  ]
  const [si, s2, tmi, ti, nsi, fei, sev, fr] = decodeIndex(key, sizes)
  return {
    condition,
    otherA: others[0],
    otherB: others[1],
    sign: condition.signs[si],
    sign2: condition.signs[s2],
    time: TIMES[tmi],
    test: condition.tests[ti],
    nextStep: condition.nextSteps[nsi],
    feeling: FEELINGS[fei],
    severity: SEVERITY[sev],
    frequency: FREQUENCY[fr],
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

function lines(ctx: Ctx): [DialogueLine, DialogueLine, DialogueLine, DialogueLine] {
  const disease = ctx.condition.shortName
  const same = ctx.sign === ctx.sign2
  const second = same
    ? `The ${ctx.sign} happens ${ctx.frequency}`
    : `I also have ${ctx.sign2}. It happens ${ctx.frequency}`
  const pattern = same ? `${ctx.severity} ${ctx.sign}` : `${ctx.sign} and ${ctx.sign2}`
  return [
    {
      patient: `I have ${ctx.severity} ${ctx.sign} ${ctx.time}.`,
      bot: `Possible diseases: ${disease}, ${ctx.otherA}, and ${ctx.otherB}. ${cap(ctx.sign)} that is ${ctx.severity} can fit all three. Tell me another symptom so I can narrow this.`,
    },
    {
      patient: `${second}.`,
      bot: `${cap(ctx.otherB)} is now less likely. Possible diseases: ${disease} and ${ctx.otherA}. ${cap(pattern)} happening ${ctx.frequency} fits those two better.`,
    },
    {
      patient: `I feel ${ctx.feeling}. The ${ctx.sign} is still ${ctx.severity}.`,
      bot: `Most likely disease: ${disease}. ${cap(ctx.otherA)} is still possible, but less likely when you feel ${ctx.feeling} and the ${ctx.sign} is ${ctx.severity}.`,
    },
    {
      patient: `The ${ctx.sign} is ${ctx.severity}, ${ctx.frequency}, and I feel ${ctx.feeling}.`,
      bot: `Detected disease: ${disease}. ${cap(pattern)}, ${ctx.frequency}, ${ctx.time}, matches ${disease}. ${cap(ctx.otherA)} does not fit as well. Confirm with this check: ${ctx.test}. Next, ${ctx.nextStep}. Go to urgent care for severe pain, fainting, very heavy bleeding, fever, or trouble breathing.`,
    },
  ]
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function generateFemaleTurn(level: LevelId, id: number, bankSize = BANK_SIZE): FemaleTurn {
  const condition = getFemaleCondition(level)
  const size = Math.max(1, Math.floor(bankSize))
  const index = ((id % size) + size) % size
  const mix = findMix(size)
  const key = Number((BigInt(index) * BigInt(mix)) % BigInt(size))
  const ctx = makeCtx(condition, key + level * 1_000_003)
  const [a, b, c, d] = lines(ctx)
  return {
    id: index,
    level,
    patient_1: a.patient,
    bot_1: a.bot,
    patient_2: b.patient,
    bot_2: b.bot,
    patient_3: c.patient,
    bot_3: c.bot,
    patient_4: d.patient,
    bot_4: d.bot,
  }
}
