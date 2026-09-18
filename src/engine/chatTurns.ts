import {
  ANIMALS,
  COLORS,
  DAYS,
  FAMILY,
  FOODS,
  L1_ACTIONS,
  L1_PLACES,
  L2_ACTIONS,
  L2_OBJECTS,
  L2_PLACES,
  NAMES,
  NUMBER_WORDS,
  SCHOOL_ITEMS,
  TOYS,
  WEATHER,
} from '../data/banks'
import { BANK_SIZE, type LevelId } from '../types'
import { cap } from './helpers'
import { topicsForGoal } from './categories'
import { decodeIndex, mulberry32, pick, shuffle } from './rng'

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

type Template = {
  goal: string
  bot: (ctx: Ctx) => string
  replies: (ctx: Ctx) => string[]
}

type Ctx = {
  name: string
  name2: string
  color: string
  animal: string
  food: string
  toy: string
  place: string
  action: string
  day: string
  weather: string
  school: string
  family: string
  object: string
  number: string
  age: number
  subject: string
  hobby: string
  job: string
  city: string
  feeling: string
}

const SUBJECTS = [
  'math',
  'English',
  'science',
  'art',
  'music',
  'history',
  'PE',
  'reading',
  'writing',
  'geography',
]

const HOBBIES = [
  'football',
  'drawing',
  'reading',
  'singing',
  'dancing',
  'swimming',
  'cooking',
  'gaming',
  'cycling',
  'painting',
]

const JOBS = [
  'teacher',
  'doctor',
  'engineer',
  'artist',
  'nurse',
  'chef',
  'driver',
  'designer',
  'scientist',
  'writer',
]

const CITIES = [
  'Tokyo',
  'Seoul',
  'London',
  'Paris',
  'New York',
  'Manila',
  'Hanoi',
  'Bangkok',
  'Cairo',
  'Madrid',
  'Beijing',
  'Sydney',
]

const FEELINGS = [
  'happy',
  'tired',
  'excited',
  'nervous',
  'okay',
  'great',
  'bored',
  'hungry',
  'sleepy',
  'fine',
]

function makeCtx(level: LevelId, id: number): Ctx {
  const sizes = [
    NAMES.length,
    NAMES.length,
    COLORS.length,
    ANIMALS.length,
    FOODS.length,
    TOYS.length,
    L2_PLACES.length,
    L2_ACTIONS.length,
    DAYS.length,
    WEATHER.length,
    SCHOOL_ITEMS.length,
    FAMILY.length,
    L2_OBJECTS.length,
    NUMBER_WORDS.length,
    SUBJECTS.length,
    HOBBIES.length,
    JOBS.length,
    CITIES.length,
    FEELINGS.length,
    20,
  ]
  const [
    ni,
    n2,
    ci,
    ai,
    fi,
    ti,
    pi,
    vi,
    di,
    wi,
    si,
    fami,
    oi,
    numi,
    subi,
    hobi,
    jobi,
    cityi,
    feeli,
    agei,
  ] = decodeIndex(level * 1_000_003 + id * 97, sizes)

  return {
    name: NAMES[ni],
    name2: NAMES[(n2 + 1) % NAMES.length],
    color: COLORS[ci],
    animal: ANIMALS[ai],
    food: FOODS[fi],
    toy: TOYS[ti],
    place: pick([...L1_PLACES, ...L2_PLACES], pi),
    action: pick([...L1_ACTIONS, ...L2_ACTIONS], vi),
    day: DAYS[di],
    weather: WEATHER[wi],
    school: SCHOOL_ITEMS[si],
    family: FAMILY[fami],
    object: L2_OBJECTS[oi],
    number: NUMBER_WORDS[numi],
    age: (() => {
      const ranges: Record<LevelId, [number, number]> = {
        1: [3, 5],
        2: [6, 8],
        3: [9, 10],
        4: [11, 12],
        5: [13, 15],
        6: [16, 25],
      }
      const [min, max] = ranges[level]
      return min + (agei % (max - min + 1))
    })(),
    subject: SUBJECTS[subi],
    hobby: HOBBIES[hobi],
    job: JOBS[jobi],
    city: CITIES[cityi],
    feeling: FEELINGS[feeli],
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
  while (unique.length < 5) unique.push(`Okay.`)
  return [unique[0], unique[1], unique[2], unique[3], unique[4]]
}

const L1: Template[] = [
  {
    goal: 'Speaking and introductions',
    bot: () => 'Hello!',
    replies: () => ['Hi!', 'Hello!', 'Hi, friend!', 'Hello, Benny!', 'Hi there!'],
  },
  {
    goal: 'Speaking and introductions',
    bot: () => 'How are you?',
    replies: () => ['I am good.', 'I am happy.', 'I am fine.', 'I am okay.', 'I am great!'],
  },
  {
    goal: 'Speaking and introductions',
    bot: (c) => `What is your name?`,
    replies: (c) => [
      `My name is ${c.name}.`,
      `I am ${c.name}.`,
      `My name is ${c.name2}.`,
      `I am ${c.name2}.`,
      `I'm ${c.name}.`,
    ],
  },
  {
    goal: 'Speaking and introductions',
    bot: () => 'Nice to meet you!',
    replies: () => ['Nice to meet you too!', 'You too!', 'Thank you!', 'Nice to meet you!', 'Hi!'],
  },
  {
    goal: 'Speaking and introductions',
    bot: () => 'Say goodbye!',
    replies: () => ['Bye!', 'Goodbye!', 'See you!', 'Bye-bye!', 'Good night!'],
  },
  {
    goal: 'Colors',
    bot: (c) => `What color is this?`,
    replies: (c) => [
      `It is ${c.color}.`,
      `${cap(c.color)}.`,
      `This is ${c.color}.`,
      `It is ${pick(COLORS, c.age)}.`,
      `I see ${c.color}.`,
    ],
  },
  {
    goal: 'Animals',
    bot: (c) => `What animal do you see?`,
    replies: (c) => [
      `A ${c.animal}.`,
      `I see a ${c.animal}.`,
      `It is a ${c.animal}.`,
      `A ${pick(ANIMALS, c.age)}.`,
      `Look, a ${c.animal}!`,
    ],
  },
  {
    goal: 'Food',
    bot: (c) => `Do you like ${c.food}?`,
    replies: (c) => [
      `Yes, I like ${c.food}.`,
      `I love ${c.food}!`,
      `Yes!`,
      `No, I don't like ${c.food}.`,
      `Yummy!`,
    ],
  },
  {
    goal: 'Toys and play',
    bot: (c) => `What do you want to play with?`,
    replies: (c) => [
      `I want the ${c.toy}.`,
      `The ${c.toy}, please.`,
      `I like the ${c.toy}.`,
      `Let's play with the ${c.toy}.`,
      `A ${pick(TOYS, c.age)}, please.`,
    ],
  },
  {
    goal: 'Numbers',
    bot: (c) => `How many do you see?`,
    replies: (c) => [
      `${cap(c.number)}.`,
      `I see ${c.number}.`,
      `There are ${c.number}.`,
      `${cap(pick(NUMBER_WORDS, c.age))}.`,
      `${cap(c.number)} toys.`,
    ],
  },
  {
    goal: 'Family',
    bot: (c) => `Who is this?`,
    replies: (c) => [
      `This is my ${c.family}.`,
      `My ${c.family}.`,
      `It is my ${c.family}.`,
      `This is ${c.name}.`,
      `My ${pick(FAMILY, c.age)}.`,
    ],
  },
  {
    goal: 'Places',
    bot: (c) => `Where are you?`,
    replies: (c) => [
      `I am at the ${c.place}.`,
      `At the ${c.place}.`,
      `I am home.`,
      `I am at school.`,
      `In the ${pick(L1_PLACES, c.age)}.`,
    ],
  },
  {
    goal: 'Actions',
    bot: (c) => `What can you do?`,
    replies: (c) => [
      `I can ${c.action}.`,
      `I can ${pick(L1_ACTIONS, c.age)}.`,
      `I can jump.`,
      `I can run.`,
      `I can play.`,
    ],
  },
  {
    goal: 'Polite talk',
    bot: () => 'Please say thank you.',
    replies: () => ['Thank you!', 'Thanks!', 'Thank you very much!', 'Thanks a lot!', 'Thank you, friend!'],
  },
  {
    goal: 'Polite talk',
    bot: () => 'Can I have some juice, please?',
    replies: () => ['Yes.', 'Here you are.', 'Please.', 'Okay.', 'Yes, please.'],
  },
]

const L2: Template[] = [
  {
    goal: 'Speaking and introductions',
    bot: () => 'Hello! How are you today?',
    replies: () => [
      'I am good, thank you.',
      'I am fine.',
      'I am happy today.',
      'I am a little tired.',
      'I am okay.',
    ],
  },
  {
    goal: 'Speaking and introductions',
    bot: () => 'What is your name?',
    replies: (c) => [
      `My name is ${c.name}.`,
      `I am ${c.name}.`,
      `I'm ${c.name}. Nice to meet you.`,
      `My name is ${c.name2}.`,
      `People call me ${c.name}.`,
    ],
  },
  {
    goal: 'Speaking and introductions',
    bot: () => 'How old are you?',
    replies: (c) => [
      `I am ${c.age} years old.`,
      `I'm ${c.age}.`,
      `I am ${c.age + 1} years old.`,
      `${c.age} years old.`,
      `I turned ${c.age} this year.`,
    ],
  },
  {
    goal: 'Speaking and introductions',
    bot: () => 'Where are you from?',
    replies: (c) => [
      `I am from ${c.city}.`,
      `I come from ${c.city}.`,
      `From ${c.city}.`,
      `I live in ${c.city}.`,
      `I am from ${pick(CITIES, c.age)}.`,
    ],
  },
  {
    goal: 'School vocabulary',
    bot: () => 'Do you like school?',
    replies: () => [
      'Yes, I do.',
      'I love school!',
      'School is fun.',
      'A little.',
      'Yes!',
    ],
  },
  {
    goal: 'School vocabulary',
    bot: () => 'What is your favorite subject?',
    replies: (c) => [
      `My favorite subject is ${c.subject}.`,
      `I like ${c.subject}.`,
      `${cap(c.subject)}.`,
      `I love ${pick(SUBJECTS, c.age)}.`,
      `Math is my favorite.`,
    ],
  },
  {
    goal: 'School vocabulary',
    bot: () => 'Who is your teacher?',
    replies: (c) => [
      `My teacher is ${c.name}.`,
      `Miss ${c.name}.`,
      `Mr. ${c.name2}.`,
      `My teacher is kind.`,
      `${c.name} is my teacher.`,
    ],
  },
  {
    goal: 'School vocabulary',
    bot: (c) => `What do you need for school?`,
    replies: (c) => [
      `I need a ${c.school}.`,
      `A ${c.school}, please.`,
      `I need my ${pick(SCHOOL_ITEMS, c.age)}.`,
      `I need a book and a pencil.`,
      `My bag and my ${c.school}.`,
    ],
  },
  {
    goal: 'Daily talk',
    bot: (c) => `What day is it today?`,
    replies: (c) => [
      `Today is ${c.day}.`,
      `It is ${c.day}.`,
      `${c.day}.`,
      `Today is ${pick(DAYS, c.age)}.`,
      `I think it is ${c.day}.`,
    ],
  },
  {
    goal: 'Weather',
    bot: () => 'How is the weather?',
    replies: (c) => [
      `It is ${c.weather}.`,
      `The weather is ${c.weather}.`,
      `It is sunny.`,
      `It is rainy.`,
      `It is ${pick(WEATHER, c.age)}.`,
    ],
  },
  {
    goal: 'Food and likes',
    bot: (c) => `What do you like to eat?`,
    replies: (c) => [
      `I like ${c.food}.`,
      `I love ${c.food}!`,
      `I like ${pick(FOODS, c.age)}.`,
      `Pizza, please.`,
      `I like fruit.`,
    ],
  },
  {
    goal: 'Family',
    bot: () => 'Who do you live with?',
    replies: (c) => [
      `I live with my ${c.family}.`,
      `With my mom and dad.`,
      `I live with my family.`,
      `With my ${pick(FAMILY, c.age)}.`,
      `I live with my sister.`,
    ],
  },
  {
    goal: 'Hobbies',
    bot: () => 'What do you like to do?',
    replies: (c) => [
      `I like ${c.hobby}.`,
      `I love ${c.hobby}.`,
      `I like to play.`,
      `I like ${pick(HOBBIES, c.age)}.`,
      `I like reading books.`,
    ],
  },
  {
    goal: 'Places',
    bot: (c) => `Where do you want to go?`,
    replies: (c) => [
      `I want to go to the ${c.place}.`,
      `To the ${c.place}.`,
      `I want to go home.`,
      `To the park, please.`,
      `To the ${pick(L2_PLACES, c.age)}.`,
    ],
  },
  {
    goal: 'Polite talk',
    bot: () => 'Can you help me, please?',
    replies: () => [
      'Yes, of course.',
      'Sure!',
      'Okay, I can help.',
      'Yes, what do you need?',
      'No problem.',
    ],
  },
]

const L3: Template[] = [
  {
    goal: 'Speaking and introductions',
    bot: () => 'Tell me about yourself.',
    replies: (c) => [
      `My name is ${c.name}. I am ${c.age} years old.`,
      `I am ${c.name}, and I like ${c.hobby}.`,
      `I live in ${c.city}.`,
      `I am a student. I like ${c.subject}.`,
      `Hi! I'm ${c.name2}. Nice to meet you.`,
    ],
  },
  {
    goal: 'Past experiences',
    bot: () => 'What did you do yesterday?',
    replies: (c) => [
      `I went to the ${c.place}.`,
      `I played with my friends.`,
      `I studied ${c.subject}.`,
      `I watched a movie.`,
      `I helped my ${c.family}.`,
    ],
  },
  {
    goal: 'School life',
    bot: () => 'What was your favorite class today?',
    replies: (c) => [
      `My favorite class was ${c.subject}.`,
      `I liked ${c.subject} today.`,
      `Art was fun.`,
      `I enjoyed ${pick(SUBJECTS, c.age)}.`,
      `PE was my favorite.`,
    ],
  },
  {
    goal: 'Reasons and because',
    bot: (c) => `Why do you like ${c.hobby}?`,
    replies: (c) => [
      `Because it is fun.`,
      `Because I feel happy.`,
      `Because I am good at it.`,
      `Because I can do it with friends.`,
      `Because it helps me relax.`,
    ],
  },
  {
    goal: 'Comparisons',
    bot: (c) => `Which is bigger, a ${c.animal} or a mouse?`,
    replies: (c) => [
      `A ${c.animal} is bigger.`,
      `The ${c.animal} is bigger than a mouse.`,
      `A mouse is smaller.`,
      `The ${c.animal}.`,
      `I think the ${c.animal} is bigger.`,
    ],
  },
  {
    goal: 'Feelings',
    bot: () => 'How do you feel today?',
    replies: (c) => [
      `I feel ${c.feeling}.`,
      `I am ${c.feeling} today.`,
      'I feel great.',
      `A little tired, but okay.`,
      `I feel ${pick(FEELINGS, c.age)}.`,
    ],
  },
  {
    goal: 'Weekend plans',
    bot: () => 'What are you going to do this weekend?',
    replies: (c) => [
      `I am going to visit the ${c.place}.`,
      `I will play ${c.hobby}.`,
      `I am going to study.`,
      `I will stay home and rest.`,
      `I am going to see my friends.`,
    ],
  },
  {
    goal: 'Food and preferences',
    bot: (c) => `Would you like some ${c.food}?`,
    replies: (c) => [
      `Yes, please.`,
      `No, thank you.`,
      `Yes, I love ${c.food}.`,
      `Maybe later.`,
      `Just a little, please.`,
    ],
  },
  {
    goal: 'Directions',
    bot: () => 'Where is the library?',
    replies: () => [
      'It is next to the school.',
      'Go straight and turn left.',
      'It is near the park.',
      'Across from the supermarket.',
      'I can show you.',
    ],
  },
  {
    goal: 'Stories',
    bot: (c) => `${c.name} lost a bag. What can you say?`,
    replies: () => [
      'Where did you last see it?',
      'I can help you look.',
      'Was it in the classroom?',
      'Let us ask the teacher.',
      'Do not worry. We will find it.',
    ],
  },
  {
    goal: 'Opinions',
    bot: (c) => `What do you think about this ${c.object}?`,
    replies: (c) => [
      `I think it is nice.`,
      `It looks interesting.`,
      `I like it a lot.`,
      `It is okay, but not my favorite.`,
      `I think it is useful.`,
    ],
  },
  {
    goal: 'Daily routines',
    bot: () => 'What time do you usually wake up?',
    replies: () => [
      'I wake up at seven.',
      'Around 7:00 in the morning.',
      'I get up early.',
      'Usually at half past six.',
      'I wake up at eight on weekends.',
    ],
  },
]

const L4: Template[] = [
  {
    goal: 'Conversations',
    bot: () => 'What are your plans for this evening?',
    replies: (c) => [
      `I am going to ${c.action} after dinner.`,
      'I will finish my homework first.',
      `I might visit the ${c.place}.`,
      'I am not sure yet.',
      'I plan to rest and read.',
    ],
  },
  {
    goal: 'First conditional',
    bot: (c) => `If it rains tomorrow, what will you do?`,
    replies: () => [
      'If it rains, I will stay home.',
      'I will take an umbrella.',
      'I will watch a movie indoors.',
      'I will study at home.',
      'I will call my friend instead.',
    ],
  },
  {
    goal: 'Opinions and reasons',
    bot: (c) => `Do you think ${c.subject} is important?`,
    replies: (c) => [
      `Yes, because it helps me learn.`,
      'Yes, it is useful in daily life.',
      'I think so, but it can be hard.',
      'Not really. I prefer other subjects.',
      `Yes. ${cap(c.subject)} is important for my future.`,
    ],
  },
  {
    goal: 'Advice',
    bot: () => 'I feel nervous about the test. What should I do?',
    replies: () => [
      'You should review a little every day.',
      'Try to sleep well tonight.',
      'Ask the teacher if you need help.',
      'Take deep breaths and stay calm.',
      'Study with a friend.',
    ],
  },
  {
    goal: 'Phrasal verbs',
    bot: () => 'Can you look after my bag for a minute?',
    replies: () => [
      'Sure, I can look after it.',
      'No problem.',
      'Okay. I will watch it.',
      'Yes, leave it here.',
      'Of course.',
    ],
  },
  {
    goal: 'School projects',
    bot: () => 'How is your group project going?',
    replies: () => [
      'It is going well so far.',
      'We still need more ideas.',
      'We finished the first part.',
      'It is a bit difficult, but okay.',
      'We will present it next week.',
    ],
  },
  {
    goal: 'Making suggestions',
    bot: () => 'What should we do after school?',
    replies: (c) => [
      `Why don't we go to the ${c.place}?`,
      `Let's play ${c.hobby}.`,
      'How about studying together?',
      'We could get some snacks.',
      'Maybe we can walk in the park.',
    ],
  },
  {
    goal: 'Describing people',
    bot: (c) => `What is ${c.name} like?`,
    replies: (c) => [
      `${c.name} is friendly and kind.`,
      `${c.name} is funny.`,
      `${c.name} works hard at school.`,
      `${c.name} is a bit quiet, but nice.`,
      `${c.name} loves ${c.hobby}.`,
    ],
  },
  {
    goal: 'Travel talk',
    bot: (c) => `Have you ever visited ${c.city}?`,
    replies: (c) => [
      `Yes, I went to ${c.city} last year.`,
      `Not yet, but I want to.`,
      `No, I have never been there.`,
      `Yes, it was amazing.`,
      `I hope I can visit ${c.city} someday.`,
    ],
  },
  {
    goal: 'Problem solving',
    bot: () => 'The bus is late. What can we do?',
    replies: () => [
      'We can wait a few more minutes.',
      'Maybe we should walk.',
      'Let us call someone.',
      'We can take the next bus.',
      'I can check the schedule on my phone.',
    ],
  },
]

const L5: Template[] = [
  {
    goal: 'Teen conversation',
    bot: () => 'How was your weekend?',
    replies: (c) => [
      'Pretty good. I hung out with friends.',
      `I practiced ${c.hobby} most of the time.`,
      'It was busy because of homework.',
      'Not bad. I watched a few shows.',
      'Honestly, I needed more sleep.',
    ],
  },
  {
    goal: 'Opinions',
    bot: (c) => `What do you think about online classes?`,
    replies: () => [
      'They are convenient, but I miss real classrooms.',
      'I like them when the lessons are clear.',
      'They can be useful, though distractions are a problem.',
      'I prefer face-to-face classes.',
      'It depends on the teacher and the subject.',
    ],
  },
  {
    goal: 'Idioms in chat',
    bot: () => 'The homework was a piece of cake for me. What about you?',
    replies: () => [
      'Same here. It was really easy.',
      'Not for me. I found it tricky.',
      'It took me longer than I expected.',
      'I got most of it right.',
      'I need to review a few parts again.',
    ],
  },
  {
    goal: 'School stress',
    bot: () => 'Exams are coming. How are you preparing?',
    replies: () => [
      'I made a revision timetable.',
      'I am starting with the hardest topics.',
      'I study a little every evening.',
      'I still need a better plan.',
      'I review notes and practice past papers.',
    ],
  },
  {
    goal: 'Hobbies and identity',
    bot: (c) => `Why do you enjoy ${c.hobby}?`,
    replies: (c) => [
      `It helps me relax after school.`,
      `I feel more confident when I do it.`,
      `I can meet people who like ${c.hobby} too.`,
      'It gives me a break from screens.',
      'I have been doing it for years.',
    ],
  },
  {
    goal: 'Agreeing and disagreeing',
    bot: () => 'Social media is mostly a waste of time. Do you agree?',
    replies: () => [
      'I partly agree. It depends how you use it.',
      'I disagree. It helps me stay connected.',
      'I see your point, but it can also be useful.',
      'Yes, if people scroll all day.',
      'Not completely. There are educational accounts too.',
    ],
  },
  {
    goal: 'Problem talk',
    bot: () => 'My group member is not doing any work. What should I say?',
    replies: () => [
      'You could talk to them politely first.',
      'Explain what still needs to be finished.',
      'Ask if they need help with their part.',
      'If it continues, tell the teacher.',
      'Suggest a clear deadline for each task.',
    ],
  },
  {
    goal: 'Future goals',
    bot: () => 'What do you want to do after high school?',
    replies: (c) => [
      `I want to study to become a ${c.job}.`,
      'I am still deciding.',
      `Maybe I will study in ${c.city}.`,
      'I want to travel and then go to university.',
      'I hope to find a job I really like.',
    ],
  },
  {
    goal: 'News and society',
    bot: () => 'Should students have less homework?',
    replies: () => [
      'Yes. Quality matters more than quantity.',
      'A little homework is fine, but not every night.',
      'I think projects are better than long worksheets.',
      'It depends on the subject.',
      'Students also need free time to rest.',
    ],
  },
  {
    goal: 'Everyday English',
    bot: () => 'Want to hang out later?',
    replies: (c) => [
      'Sure. What time works for you?',
      `Maybe after I finish ${c.subject}.`,
      'I can for about an hour.',
      'Not today, but tomorrow works.',
      'Yes. Let’s meet at the café.',
    ],
  },
]

const L6: Template[] = [
  {
    goal: 'Professional English',
    bot: () => 'Could you briefly introduce yourself?',
    replies: (c) => [
      `My name is ${c.name}. I am currently studying English and interested in becoming a ${c.job}.`,
      `I’m ${c.name}. I live in ${c.city} and focus on academic English.`,
      `I’m ${c.name}. I enjoy ${c.hobby} and hope to work in education.`,
      `My name is ${c.name2}. I am preparing for advanced English exams.`,
      `I’m ${c.name}. I would like to improve my workplace communication skills.`,
    ],
  },
  {
    goal: 'Meetings and collaboration',
    bot: () => 'The deadline was moved up. How should we respond?',
    replies: () => [
      'We should prioritize the essential tasks first.',
      'I can revise the timeline and share it today.',
      'Let’s divide the remaining work clearly.',
      'We may need to request a short extension.',
      'I suggest a quick meeting to reassign roles.',
    ],
  },
  {
    goal: 'Academic discussion',
    bot: () => 'What makes a source reliable?',
    replies: () => [
      'It should be accurate, recent, and well supported by evidence.',
      'Trusted authors and clear references matter.',
      'Peer-reviewed research is usually more reliable.',
      'We should check for bias and weak arguments.',
      'Reliable sources explain methods and limitations.',
    ],
  },
  {
    goal: 'Register and tone',
    bot: () => 'How would you request more time from a professor?',
    replies: () => [
      'Would it be possible to request a short extension?',
      'I can submit a complete draft by Thursday if needed.',
      'Thank you for considering my request.',
      'I apologize for the delay and appreciate your understanding.',
      'Could I ask for two extra days to finish the assignment?',
    ],
  },
  {
    goal: 'Workplace chat',
    bot: () => 'A client is unhappy with the delay. What is a professional reply?',
    replies: () => [
      'Thank you for flagging this. I will look into it and update you by 3 p.m.',
      'I understand your concern and apologize for the inconvenience.',
      'We are reviewing the issue and will share a clear plan shortly.',
      'Please let me know if you need anything while we investigate.',
      'I appreciate your patience while we resolve this.',
    ],
  },
  {
    goal: 'Debate and nuance',
    bot: () => 'Is remote work better than office work?',
    replies: () => [
      'It depends on the role and the person.',
      'Remote work offers flexibility, but collaboration can suffer.',
      'Offices help with teamwork, yet commuting can be exhausting.',
      'A hybrid model may balance both sides.',
      'Productivity often depends more on habits than location.',
    ],
  },
  {
    goal: 'Collocations in context',
    bot: () => 'We need to make a decision today. What do you suggest?',
    replies: () => [
      'I suggest we review the key evidence first.',
      'Let’s list the pros and cons before deciding.',
      'We should reach a consensus if possible.',
      'I can summarize the options in a short note.',
      'We may need more data before we decide.',
    ],
  },
  {
    goal: 'Interview English',
    bot: () => 'Why do you want this role?',
    replies: (c) => [
      `Because it matches my interest in becoming a ${c.job}.`,
      'I want to apply my English skills in a real workplace.',
      'The role would help me grow professionally.',
      'I am motivated by clear goals and teamwork.',
      'I believe I can contribute and keep learning.',
    ],
  },
  {
    goal: 'Problem solving',
    bot: () => 'Our survey results are unclear. What next?',
    replies: () => [
      'We should check the sample size and wording.',
      'I recommend collecting a bit more data.',
      'Let’s compare the results with earlier research.',
      'We can interview a few participants for clarity.',
      'I suggest rewriting the weakest questions.',
    ],
  },
  {
    goal: 'Social English',
    bot: () => 'Thanks for joining the discussion. Any final thoughts?',
    replies: () => [
      'I think we covered the main points clearly.',
      'I agree with the overall conclusion.',
      'One issue still needs more evidence.',
      'I am happy to revise the summary if needed.',
      'Thank you. This was a useful conversation.',
    ],
  },
]

const BY_LEVEL: Record<LevelId, Template[]> = {
  1: L1,
  2: L2,
  3: L3,
  4: [...L3, ...L4],
  5: [...L4, ...L5],
  6: [...L5, ...L6],
}

export function generateChatTurn(level: LevelId, id: number, bankSize = BANK_SIZE): ChatTurn {
  const size = Math.max(1, Math.floor(bankSize))
  const index = ((id % size) + size) % size
  const templates = BY_LEVEL[level]
  const template = templates[index % templates.length]
  const ctx = makeCtx(level, index)
  const seed = level * 1_000_003 + index * 97
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five(template.replies(ctx), seed)
  const topics = topicsForGoal(template.goal, index, level)

  return {
    id: index,
    level,
    bot_message: template.bot(ctx),
    reply_1,
    reply_2,
    reply_3,
    reply_4,
    reply_5,
    topic1: topics.topic1,
    topic2: topics.topic2,
    topic3: topics.topic3,
  }
}
