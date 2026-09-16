import { NAMES } from '../data/banks'
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
  learning_goal: string
}

type Ctx = {
  name: string
  body: string
  symptom: string
  food: string
  habit: string
  time: string
  medicine: string
  place: string
  feeling: string
  activity: string
}

type Template = {
  goal: string
  bot: (ctx: Ctx) => string
  replies: (ctx: Ctx) => string[]
}

const BODY = [
  'head',
  'tummy',
  'throat',
  'ear',
  'eye',
  'tooth',
  'knee',
  'back',
  'chest',
  'hand',
  'foot',
  'nose',
]

const SYMPTOMS = [
  'a fever',
  'a cough',
  'a headache',
  'a sore throat',
  'a runny nose',
  'a stomachache',
  'an allergy',
  'dizziness',
  'a rash',
  'ear pain',
]

const FOODS = ['water', 'soup', 'fruit', 'rice', 'juice', 'yogurt', 'toast', 'tea']
const HABITS = ['sleep', 'exercise', 'wash hands', 'brush teeth', 'drink water', 'rest']
const TIMES = ['this morning', 'yesterday', 'last night', 'two days ago', 'since Monday', 'after lunch']
const MEDICINES = ['syrup', 'tablets', 'drops', 'cream', 'vitamins', 'lozenges']
const PLACES = ['clinic', 'hospital', 'pharmacy', 'nurse room', 'waiting room', 'home']
const FEELINGS = ['okay', 'better', 'worse', 'tired', 'worried', 'fine', 'sore', 'weak']
const ACTIVITIES = ['running', 'playing football', 'studying', 'swimming', 'walking', 'sleeping']

function makeCtx(level: LevelId, id: number): Ctx {
  const sizes = [
    NAMES.length,
    BODY.length,
    SYMPTOMS.length,
    FOODS.length,
    HABITS.length,
    TIMES.length,
    MEDICINES.length,
    PLACES.length,
    FEELINGS.length,
    ACTIVITIES.length,
  ]
  const [ni, bi, si, fi, hi, ti, mi, pi, fei, ai] = decodeIndex(level * 900_011 + id * 89, sizes)
  return {
    name: NAMES[ni],
    body: BODY[bi],
    symptom: SYMPTOMS[si],
    food: FOODS[fi],
    habit: HABITS[hi],
    time: TIMES[ti],
    medicine: MEDICINES[mi],
    place: PLACES[pi],
    feeling: FEELINGS[fei],
    activity: ACTIVITIES[ai],
  }
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

const L1: Template[] = [
  {
    goal: 'Greeting the doctor',
    bot: () => 'Hello! How are you today?',
    replies: () => ['I am okay.', 'I feel sick.', 'I am fine.', 'My tummy hurts.', 'I feel tired.'],
  },
  {
    goal: 'Body parts',
    bot: (c) => `Does your ${c.body} hurt?`,
    replies: (c) => [
      `Yes, my ${c.body} hurts.`,
      'A little.',
      'No, it is okay.',
      `Yes, it hurts here.`,
      'It hurts when I move.',
    ],
  },
  {
    goal: 'Feelings',
    bot: () => 'How do you feel?',
    replies: (c) => [
      `I feel ${c.feeling}.`,
      'I feel sick.',
      'I feel better.',
      'I feel hot.',
      'I feel sad.',
    ],
  },
  {
    goal: 'Tummy talk',
    bot: () => 'Does your tummy hurt?',
    replies: () => ['Yes.', 'No.', 'A little.', 'Yes, after eating.', 'It hurts now.'],
  },
  {
    goal: 'Brave clinic visit',
    bot: () => 'Can I look in your mouth?',
    replies: () => ['Okay.', 'Yes.', 'I am ready.', 'Please be gentle.', 'Yes, Doctor.'],
  },
  {
    goal: 'Rest and care',
    bot: () => 'Please drink some water.',
    replies: () => ['Okay.', 'Yes, I will.', 'Thank you.', 'I want water.', 'Okay, Doctor.'],
  },
  {
    goal: 'Parents and help',
    bot: () => 'Who came with you today?',
    replies: (c) => ['My mom.', 'My dad.', `I came with ${c.name}.`, 'My grandma.', 'My family.'],
  },
  {
    goal: 'Medicine words',
    bot: (c) => `This is ${c.medicine}. Can you take it?`,
    replies: () => ['Yes.', 'Okay.', 'It tastes funny.', 'I can try.', 'With water, please.'],
  },
]

const L2: Template[] = [
  {
    goal: 'Describing symptoms',
    bot: () => 'What is wrong today?',
    replies: (c) => [
      `I have ${c.symptom}.`,
      `My ${c.body} hurts.`,
      'I feel sick.',
      `I have had ${c.symptom} since ${c.time}.`,
      'I do not feel well.',
    ],
  },
  {
    goal: 'When it started',
    bot: () => 'When did it start?',
    replies: (c) => [
      `It started ${c.time}.`,
      'Yesterday.',
      'This morning.',
      'Two days ago.',
      'Last night.',
    ],
  },
  {
    goal: 'Fever and cold',
    bot: () => 'Do you have a fever?',
    replies: () => [
      'Yes, I feel hot.',
      'No, I do not.',
      'Maybe a little.',
      'Yes, since last night.',
      'My mom checked. It was high.',
    ],
  },
  {
    goal: 'Healthy habits',
    bot: (c) => `Do you ${c.habit} every day?`,
    replies: (c) => [
      `Yes, I ${c.habit} every day.`,
      'Sometimes.',
      'Not always.',
      'I try to.',
      'No, I forget.',
    ],
  },
  {
    goal: 'Appointments',
    bot: () => 'Can you come back tomorrow?',
    replies: () => [
      'Yes, I can.',
      'What time?',
      'Okay.',
      'I need to ask my parents.',
      'Yes, after school.',
    ],
  },
  {
    goal: 'Food and drink',
    bot: (c) => `Please drink more ${c.food}.`,
    replies: (c) => [
      `Okay. I will drink ${c.food}.`,
      'Thank you.',
      'How much should I drink?',
      'I will try.',
      'Yes, Doctor.',
    ],
  },
  {
    goal: 'Allergy basics',
    bot: () => 'Are you allergic to any medicine?',
    replies: () => [
      'No, I am not.',
      'I do not know.',
      'Yes, some medicine makes me itchy.',
      'My mom says no.',
      'I need to check.',
    ],
  },
  {
    goal: 'Pharmacy talk',
    bot: (c) => `Please get this ${c.medicine} from the pharmacy.`,
    replies: () => [
      'Okay.',
      'Where is the pharmacy?',
      'Thank you.',
      'How many times a day?',
      'I understand.',
    ],
  },
]

const L3: Template[] = [
  {
    goal: 'Symptom history',
    bot: () => 'Can you tell me more about your symptoms?',
    replies: (c) => [
      `I have ${c.symptom}, and it started ${c.time}.`,
      `My ${c.body} hurts when I move.`,
      'It is worse at night.',
      'I also feel tired.',
      'The pain comes and goes.',
    ],
  },
  {
    goal: 'Activity and injury',
    bot: (c) => `Did this happen while you were ${c.activity}?`,
    replies: (c) => [
      `Yes, during ${c.activity}.`,
      'No, it started later.',
      'Maybe. I am not sure.',
      'Yes, after school sports.',
      'No, I was resting.',
    ],
  },
  {
    goal: 'Questions for the doctor',
    bot: () => 'Do you have any questions for me?',
    replies: (c) => [
      'When can I go back to school?',
      `How long should I take the ${c.medicine}?`,
      'Should I stay home tomorrow?',
      'Is it serious?',
      'Can I play sports this week?',
    ],
  },
  {
    goal: 'First aid basics',
    bot: () => 'If you cut your finger, what should you do first?',
    replies: () => [
      'Wash it and put a bandage on.',
      'Tell an adult.',
      'Keep it clean.',
      'Do not touch dirty things.',
      'Ask for help.',
    ],
  },
  {
    goal: 'Allergies',
    bot: () => 'Have you noticed any allergies?',
    replies: () => [
      'I sneeze near dust.',
      'Some foods make my tummy hurt.',
      'I am not sure.',
      'I get itchy in spring.',
      'No known allergies.',
    ],
  },
  {
    goal: 'Rest advice',
    bot: () => 'You should rest today. Can you do that?',
    replies: () => [
      'Yes, I will rest.',
      'I have homework, but I can rest after.',
      'Okay. No sports today.',
      'I will stay home.',
      'Thank you for the advice.',
    ],
  },
  {
    goal: 'Temperature and measurement',
    bot: () => 'What was your temperature this morning?',
    replies: () => [
      'It was 38 degrees.',
      'I do not know the number.',
      'My mom said it was high.',
      'It was normal.',
      'I felt hot, but we did not check.',
    ],
  },
  {
    goal: 'Follow-up',
    bot: () => 'Please come back if it gets worse.',
    replies: () => [
      'I understand.',
      'What counts as worse?',
      'Okay, I will tell my parents.',
      'Thank you, Doctor.',
      'I will return if needed.',
    ],
  },
]

const L4: Template[] = [
  {
    goal: 'Booking an appointment',
    bot: () => 'Would you like a morning or afternoon appointment?',
    replies: () => [
      'Morning is better for me.',
      'Afternoon, please.',
      'Either is fine.',
      'After school would help.',
      'What times are available?',
    ],
  },
  {
    goal: 'Explaining the problem',
    bot: () => 'In your own words, what brings you in today?',
    replies: (c) => [
      `I’ve had ${c.symptom} since ${c.time}.`,
      `My ${c.body} has been sore.`,
      'I feel worse when I exercise.',
      'I need advice about sleeping better.',
      'I think I may have caught a cold.',
    ],
  },
  {
    goal: 'Prevention',
    bot: () => 'What can you do to stay healthier this week?',
    replies: (c) => [
      `I can ${c.habit} more regularly.`,
      'I can wash my hands often.',
      'I can sleep earlier.',
      'I can drink more water.',
      'I can avoid sharing drinks.',
    ],
  },
  {
    goal: 'Pharmacy English',
    bot: (c) => `Please take this ${c.medicine} twice a day after meals.`,
    replies: (c) => [
      'Twice a day after meals. Got it.',
      'For how many days?',
      'Should I take it with water?',
      'What if I miss a dose?',
      `I understand. ${c.medicine} after meals.`,
    ],
  },
  {
    goal: 'Consent and comfort',
    bot: () => 'Is it okay if I check your throat?',
    replies: () => [
      'Yes, that’s fine.',
      'Okay, please go ahead.',
      'Can you explain first?',
      'Yes, but please be gentle.',
      'I feel a bit nervous, but okay.',
    ],
  },
  {
    goal: 'School and recovery',
    bot: () => 'Should you stay home from school?',
    replies: () => [
      'If I still have a fever, yes.',
      'I can go if I feel better.',
      'What do you recommend?',
      'I will ask my parents.',
      'I think one more day of rest helps.',
    ],
  },
  {
    goal: 'Sports injury',
    bot: (c) => `Your ${c.body} may need rest from ${c.activity}.`,
    replies: (c) => [
      `Okay. No ${c.activity} for now.`,
      'How long should I rest?',
      'Can I do light exercise?',
      'I understand.',
      'I will ice it and rest.',
    ],
  },
  {
    goal: 'Clear communication',
    bot: () => 'Did I explain that clearly?',
    replies: () => [
      'Yes, thank you.',
      'Could you repeat the medicine times?',
      'I understand most of it.',
      'One part is still unclear.',
      'Yes. I can explain it back.',
    ],
  },
]

const L5: Template[] = [
  {
    goal: 'Teen wellness',
    bot: () => 'Have you been feeling more stressed than usual?',
    replies: () => [
      'A bit, especially with exams.',
      'Yes. Sleep has been difficult.',
      'Not really, just tired from training.',
      'I feel overwhelmed some days.',
      'I’m okay, but I could use advice.',
    ],
  },
  {
    goal: 'Asking for help',
    bot: () => 'It’s okay to ask for help. What would you like support with?',
    replies: (c) => [
      `Managing ${c.symptom}.`,
      'Sleep and energy.',
      'Sports recovery.',
      'Anxiety before tests.',
      'Eating more regularly.',
    ],
  },
  {
    goal: 'Privacy',
    bot: () => 'Would you like to talk alone for a minute?',
    replies: () => [
      'Yes, that would help.',
      'No, my parent can stay.',
      'Maybe later.',
      'Yes, please.',
      'I’m fine either way.',
    ],
  },
  {
    goal: 'Sports and recovery',
    bot: (c) => `You hurt your ${c.body} while ${c.activity}. How bad is the pain now?`,
    replies: () => [
      'Mild, but annoying.',
      'Moderate when I move.',
      'Strong if I put weight on it.',
      'Better than yesterday.',
      'Still sore at night.',
    ],
  },
  {
    goal: 'Healthy routines',
    bot: () => 'Which habit do you want to improve first?',
    replies: (c) => [
      `I want to improve my ${c.habit}.`,
      'Sleeping on time.',
      'Drinking enough water.',
      'Taking screen breaks.',
      'Stretching after sports.',
    ],
  },
  {
    goal: 'Clinic manners',
    bot: () => 'If you disagree with advice, how can you say that politely?',
    replies: () => [
      'Could we look at another option?',
      'I understand, but I’m worried about side effects.',
      'Can you explain why that is best?',
      'I’d like a second opinion if possible.',
      'Thank you. I need time to think.',
    ],
  },
  {
    goal: 'Mental health English',
    bot: () => 'How have your mood and energy been this week?',
    replies: () => [
      'Mostly stable.',
      'Lower than usual.',
      'Up and down.',
      'Better when I sleep enough.',
      'I’ve felt anxious before school.',
    ],
  },
  {
    goal: 'Follow-up planning',
    bot: () => 'Let’s plan a check-in. What works for you?',
    replies: () => [
      'Next week after school.',
      'A message reminder would help.',
      'I can come on Friday.',
      'Mornings are difficult.',
      'Please text my parent the time.',
    ],
  },
]

const L6: Template[] = [
  {
    goal: 'History taking',
    bot: () => 'Please summarize your main concern in one or two sentences.',
    replies: (c) => [
      `I’ve had ${c.symptom} since ${c.time}, and it’s affecting my sleep.`,
      `My ${c.body} pain started after ${c.activity}.`,
      'I need advice on recurring headaches.',
      'I’m here for a follow-up after last week’s visit.',
      'I want to discuss allergy symptoms that keep returning.',
    ],
  },
  {
    goal: 'Medication and pharmacy',
    bot: (c) => `Please confirm how you will take the ${c.medicine}.`,
    replies: (c) => [
      `I’ll take the ${c.medicine} twice daily after meals.`,
      'Once at night with water.',
      'Only if the pain is above mild.',
      'For five days, then stop unless advised.',
      'I’ll read the label and follow the dose exactly.',
    ],
  },
  {
    goal: 'Consent',
    bot: () => 'Do I have your consent to proceed with the examination?',
    replies: () => [
      'Yes, you have my consent.',
      'Yes, please explain each step.',
      'I consent, but tell me if anything will hurt.',
      'I’d like my parent present.',
      'Can we wait one minute first?',
    ],
  },
  {
    goal: 'Professional patient talk',
    bot: () => 'Are there any red-flag symptoms I should know about?',
    replies: () => [
      'No chest pain or breathing trouble.',
      'I had a high fever last night.',
      'No fainting, but I felt dizzy once.',
      'There’s a new rash on my arm.',
      'None that I noticed.',
    ],
  },
  {
    goal: 'Lifestyle counseling',
    bot: () => 'What change can you realistically make this month?',
    replies: (c) => [
      `I can improve my ${c.habit} schedule.`,
      'I can reduce late-night screens.',
      'I can walk 20 minutes daily.',
      'I can prepare water in the morning.',
      'I can keep a simple symptom diary.',
    ],
  },
  {
    goal: 'Clarifying advice',
    bot: () => 'Could you repeat the care plan in your own words?',
    replies: (c) => [
      `Rest, hydrate, and take ${c.medicine} as directed.`,
      'Return sooner if symptoms worsen.',
      'Avoid intense exercise for a few days.',
      'Monitor temperature and sleep.',
      'Follow up if there’s no improvement in three days.',
    ],
  },
  {
    goal: 'Urgent vs routine',
    bot: () => 'When should you seek urgent care instead of waiting?',
    replies: () => [
      'If breathing becomes difficult.',
      'If the fever is very high and persistent.',
      'If pain suddenly becomes severe.',
      'If there’s confusion or fainting.',
      'If symptoms rapidly get worse.',
    ],
  },
  {
    goal: 'Closing the visit',
    bot: () => 'Do you feel ready to leave with a clear plan?',
    replies: () => [
      'Yes. Thank you for explaining.',
      'Yes, and I’ll message if anything changes.',
      'Almost—one more question about dosing.',
      'Yes. I’ll book the follow-up now.',
      'Yes. I understand the next steps.',
    ],
  },
]

const SYMPTOMS_CAT: Template[] = [
  ...L1.filter((t) =>
    ['Greeting the doctor', 'Body parts', 'Feelings', 'Tummy talk', 'Brave clinic visit'].includes(
      t.goal,
    ),
  ),
  ...L2.filter((t) =>
    ['Describing symptoms', 'When it started', 'Fever and cold'].includes(t.goal),
  ),
  ...L3.filter((t) =>
    ['Symptom history', 'Temperature and measurement', 'Allergies'].includes(t.goal),
  ),
  ...L6.filter((t) => t.goal === 'History taking' || t.goal === 'Professional patient talk'),
]

const PHARMACY_CAT: Template[] = [
  ...L1.filter((t) => t.goal === 'Medicine words'),
  ...L2.filter((t) =>
    ['Pharmacy talk', 'Allergy basics', 'Food and drink'].includes(t.goal),
  ),
  ...L3.filter((t) => t.goal === 'Questions for the doctor'),
  ...L4.filter((t) => t.goal === 'Pharmacy English' || t.goal === 'Clear communication'),
  ...L6.filter((t) => t.goal === 'Medication and pharmacy' || t.goal === 'Clarifying advice'),
]

const EMERGENCY_CAT: Template[] = [
  ...L3.filter((t) => t.goal === 'First aid basics' || t.goal === 'Activity and injury'),
  ...L4.filter((t) => t.goal === 'Sports injury'),
  ...L5.filter((t) => t.goal === 'Sports and recovery'),
  ...L6.filter((t) => t.goal === 'Urgent vs routine'),
  {
    goal: 'Call for help',
    bot: () => 'Someone is badly hurt. What should you do?',
    replies: () => [
      'Call emergency services.',
      'Ask an adult for help right away.',
      'Stay calm and check if they can breathe.',
      'Do not move them if the injury looks serious.',
      'Keep them safe until help arrives.',
    ],
  },
  {
    goal: 'Bleeding basics',
    bot: () => 'There is bleeding from a small cut. What is a good first step?',
    replies: () => [
      'Press clean cloth on the cut.',
      'Wash the area if possible.',
      'Put on a bandage.',
      'Raise the hand if it is safe.',
      'Get adult help if bleeding continues.',
    ],
  },
  {
    goal: 'Burns basics',
    bot: () => 'You touched something hot. What should you do?',
    replies: () => [
      'Cool it with running water.',
      'Do not put ice directly on it.',
      'Tell an adult.',
      'Keep the area clean.',
      'Seek help if it looks serious.',
    ],
  },
]

const HABITS_CAT: Template[] = [
  ...L1.filter((t) => t.goal === 'Rest and care'),
  ...L2.filter((t) => t.goal === 'Healthy habits'),
  ...L3.filter((t) => t.goal === 'Rest advice'),
  ...L4.filter((t) => t.goal === 'Prevention' || t.goal === 'School and recovery'),
  ...L5.filter((t) => t.goal === 'Healthy routines'),
  ...L6.filter((t) => t.goal === 'Lifestyle counseling'),
  {
    goal: 'Sleep habits',
    bot: () => 'How many hours do you usually sleep?',
    replies: () => [
      'About seven to eight hours.',
      'Less than I need.',
      'I go to bed too late.',
      'I sleep well most nights.',
      'I want to improve my sleep.',
    ],
  },
  {
    goal: 'Exercise habits',
    bot: () => 'How often do you exercise each week?',
    replies: () => [
      'Three or four times a week.',
      'Almost every day.',
      'Only on weekends.',
      'Not enough right now.',
      'I walk to school most days.',
    ],
  },
]

const APPOINTMENTS_CAT: Template[] = [
  ...L1.filter((t) => t.goal === 'Parents and help'),
  ...L2.filter((t) => t.goal === 'Appointments'),
  ...L3.filter((t) => t.goal === 'Follow-up'),
  ...L4.filter((t) =>
    ['Booking an appointment', 'Explaining the problem', 'Consent and comfort'].includes(t.goal),
  ),
  ...L5.filter((t) => t.goal === 'Follow-up planning' || t.goal === 'Clinic manners'),
  ...L6.filter((t) => t.goal === 'Consent' || t.goal === 'Closing the visit'),
]

const WELLNESS_CAT: Template[] = [
  ...L5.filter((t) =>
    ['Teen wellness', 'Asking for help', 'Privacy', 'Mental health English'].includes(t.goal),
  ),
  {
    goal: 'Stress talk',
    bot: () => 'What usually makes you feel stressed?',
    replies: () => [
      'School deadlines.',
      'Not sleeping enough.',
      'Too many messages and notifications.',
      'Arguments at home.',
      'Feeling behind in class.',
    ],
  },
  {
    goal: 'Support language',
    bot: () => 'Who can you talk to when you feel low?',
    replies: () => [
      'A trusted family member.',
      'A school counselor.',
      'A close friend.',
      'A teacher I trust.',
      'I am still looking for someone.',
    ],
  },
  {
    goal: 'Calming strategies',
    bot: () => 'What helps you calm down?',
    replies: () => [
      'Slow breathing.',
      'A short walk.',
      'Writing my thoughts down.',
      'Listening to quiet music.',
      'Talking to someone I trust.',
    ],
  },
  {
    goal: 'Asking gently',
    bot: () => 'How can you ask for support politely?',
    replies: () => [
      'Could I talk to you for a minute?',
      'I am struggling and need advice.',
      'Would you have time to listen later?',
      'I need help with stress management.',
      'Can we discuss how I have been feeling?',
    ],
  },
]

const BY_LEVEL: Record<LevelId, Template[]> = {
  1: SYMPTOMS_CAT,
  2: PHARMACY_CAT,
  3: EMERGENCY_CAT,
  4: HABITS_CAT,
  5: APPOINTMENTS_CAT,
  6: WELLNESS_CAT,
}

export function generateDoctorTurn(level: LevelId, id: number): DoctorTurn {
  const index = ((id % BANK_SIZE) + BANK_SIZE) % BANK_SIZE
  const templates = BY_LEVEL[level]
  const template = templates[index % templates.length]
  const ctx = makeCtx(level, index)
  const seed = level * 700_019 + index * 131
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five(template.replies(ctx), seed)

  return {
    id: index,
    level,
    bot_message: template.bot(ctx),
    reply_1,
    reply_2,
    reply_3,
    reply_4,
    reply_5,
    learning_goal: template.goal,
  }
}

