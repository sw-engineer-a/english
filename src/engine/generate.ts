import { BANK_SIZE, type LevelId, type Question } from '../types'
import {
  ADJECTIVES_COMPARE,
  ANIMAL_EMOJI,
  ANIMAL_SOUNDS,
  ANIMALS,
  BODY,
  COLLOCATIONS,
  COLORS,
  DAYS,
  FAMILY,
  FOODS,
  FORMAL_INFORMAL,
  IDIOMS,
  IRREGULAR,
  L1_ACTIONS,
  L1_PLACES,
  L2_ACTIONS,
  L2_OBJECTS,
  L2_PLACES,
  NAMES,
  NUMBER_WORDS,
  OPPOSITES,
  PHRASAL,
  PRONOUNS,
  REASONS,
  REGULAR_PAST,
  SCHOOL_ITEMS,
  TOYS,
  WEATHER,
  ACADEMIC_PAIRS,
} from '../data/banks'
import { article, cap, fiveChoices, finalize, gerund, GENERIC_ADJECTIVES, GENERIC_NOUNS, thirdPerson } from './helpers'
import { decodeIndex, mulberry32, product } from './rng'

const SOUND_ANIMALS = Object.keys(ANIMAL_SOUNDS)
const FALLBACK = [...GENERIC_NOUNS, ...GENERIC_ADJECTIVES, ...TOYS, ...SCHOOL_ITEMS]

function spaceOk(sizes: number[], need: number): number[] {
  if (product(sizes) < need) {
    const extra = Math.ceil(need / Math.max(1, product(sizes)))
    return [...sizes, extra]
  }
  return sizes
}

function misspell(word: string, variant: number): string {
  const clean = word.trim()
  const parts = clean.split(' ')
  const target = parts[0]
  if (target.length < 3) return `${target}e${variant}`
  const chars = [...target]
  const i = (variant % (chars.length - 1)) + 0
  let next = target
    switch (variant % 4) {
    case 0: {
      const j = i + 1 < chars.length ? i + 1 : 0
      const tmp = chars[i]
      chars[i] = chars[j]
      chars[j] = tmp
      next = chars.join('')
      break
    }
    case 1:
      next = target.slice(0, Math.max(1, i)) + target.slice(Math.max(1, i) + 1)
      break
    case 2:
      next = target.slice(0, i + 1) + target[i] + target.slice(i + 1)
      break
    default:
      next = target.replace(/[aeiou]/i, (m) => (m === 'a' ? 'e' : 'a'))
      break
  }
  if (next.toLowerCase() === target.toLowerCase() || next.length < 2) next = `${target}x`
  parts[0] = next
  return parts.join(' ')
}

function regularPast(verb: string): string {
  if (verb.endsWith('e')) return `${verb}d`
  if (verb.endsWith('y') && !/[aeiou]y$/i.test(verb)) return `${verb.slice(0, -1)}ied`
  return `${verb}ed`
}

function superlative(adj: string): string {
  if (adj === 'good') return 'best'
  if (adj === 'bad') return 'worst'
  if (adj.endsWith('y') && !/[aeiou]y$/i.test(adj)) return `${adj.slice(0, -1)}iest`
  if (adj.endsWith('e')) return `${adj}st`
  if (/[aeiou][b-df-hj-np-tv-z]$/i.test(adj) && adj.length <= 4) return `${adj}${adj.slice(-1)}est`
  return `${adj}est`
}

function comparative(adj: string): string {
  if (adj === 'good') return 'better'
  if (adj === 'bad') return 'worse'
  if (adj.endsWith('y') && !/[aeiou]y$/i.test(adj)) return `${adj.slice(0, -1)}ier`
  if (adj.endsWith('e')) return `${adj}r`
  if (/[aeiou][b-df-hj-np-tv-z]$/i.test(adj) && adj.length <= 4) return `${adj}${adj.slice(-1)}er`
  return `${adj}er`
}

function buildQuestion(
  level: LevelId,
  id: number,
  skill: string,
  prompt: string,
  correct: string,
  pool: string[],
  seed: number,
  explanation: string,
  extras: string[] = FALLBACK,
  passage?: string,
): Question {
  const { answers, correctIndex } = fiveChoices(correct, pool, seed, extras)
  return finalize({
    id,
    level,
    skill,
    prompt,
    passage,
    answers,
    correctIndex,
    explanation,
  })
}

function genL1(id: number, seed: number): Question {
  if (id < 40000) {
    const sizes = spaceOk([ANIMALS.length, COLORS.length, L1_ACTIONS.length, L1_PLACES.length, 4], 40000)
    const [ai, ci, vi, pi, fi] = decodeIndex(id, sizes)
    const animal = ANIMALS[ai]
    const color = COLORS[ci]
    const action = L1_ACTIONS[vi]
    const place = L1_PLACES[pi]
    const emoji = ANIMAL_EMOJI[animal] ?? '🐾'
    const passage = `Look! ${cap(article(color))} ${color} ${animal} can ${action} in the ${place}. ${emoji}`
    const focus = fi % 4
    if (focus === 0) {
      return buildQuestion(1, id, 'Reading', 'What animal do you see?', animal, ANIMALS, seed, `The animal is a ${animal}.`, ANIMALS, passage)
    }
    if (focus === 1) {
      return buildQuestion(1, id, 'Colors', `What color is the ${animal}?`, color, COLORS, seed, `The ${animal} is ${color}.`, COLORS, passage)
    }
    if (focus === 2) {
      return buildQuestion(1, id, 'Places', `Where is the ${animal}?`, `in the ${place}`, L1_PLACES.map((p) => `in the ${p}`), seed, `The ${animal} is in the ${place}.`, [], passage)
    }
    return buildQuestion(1, id, 'Actions', `What can the ${animal} do?`, action, L1_ACTIONS, seed, `The ${animal} can ${action}.`, L1_ACTIONS, passage)
  }

  if (id < 60000) {
    const local = id - 40000
    const sizes = spaceOk([SOUND_ANIMALS.length, FOODS.length, BODY.length, TOYS.length, 5], 20000)
    const [si, fi, bi, ti, qi] = decodeIndex(local, sizes)
    const kind = qi % 5
    if (kind === 0) {
      const animal = SOUND_ANIMALS[si]
      const sound = ANIMAL_SOUNDS[animal]
      return buildQuestion(
        1,
        id,
        'Sounds',
        `${ANIMAL_EMOJI[animal] ?? ''} A ${animal} says…`,
        sound,
        Object.values(ANIMAL_SOUNDS),
        seed,
        `A ${animal} says ${sound}!`,
      )
    }
    if (kind === 1) {
      const food = FOODS[fi]
      return buildQuestion(1, id, 'Food', `Which one can we eat?`, food, [...ANIMALS, ...TOYS, ...BODY], seed, `We can eat ${article(food)} ${food}.`, [])
    }
    if (kind === 2) {
      const part = BODY[bi]
      return buildQuestion(1, id, 'Body', `Which one is a body part?`, part, [...TOYS, ...FOODS, ...COLORS], seed, `${cap(part)} is a part of the body.`, [])
    }
    if (kind === 3) {
      const toy = TOYS[ti]
      return buildQuestion(1, id, 'Toys', `Which one is a toy?`, toy, [...FOODS, ...BODY, ...COLORS], seed, `${cap(article(toy))} ${toy} is a toy.`, [])
    }
    const n = (si % 10) + 1
    return buildQuestion(1, id, 'Numbers', `What number is this? ${'⭐'.repeat(n)}`, NUMBER_WORDS[n - 1], NUMBER_WORDS, seed, `There are ${NUMBER_WORDS[n - 1]} stars.`)
  }

  if (id < 80000) {
    const local = id - 60000
    const items = [...ANIMALS, ...FOODS, ...TOYS, ...BODY]
    const sizes = spaceOk([NAMES.length, items.length, COLORS.length, 4], 20000)
    const [ni, ii, ci, qi] = decodeIndex(local, sizes)
    const name = NAMES[ni]
    const item = items[ii]
    const color = COLORS[ci]
    if (qi % 4 === 0) {
      return buildQuestion(1, id, 'A / An', `${name} sees ${article(item)} ${item}. Choose a or an.`, article(item), ['a', 'an', 'the', 'and', 'to'], seed, `We say ${article(item)} ${item}.`)
    }
    if (qi % 4 === 1) {
      return buildQuestion(1, id, 'This is', `Choose the correct sentence.`, `This is ${article(item)} ${item}.`, [
        `This is ${item} ${article(item)}.`,
        `This are ${article(item)} ${item}.`,
        `This ${article(item)} is ${item}.`,
        `These is ${article(item)} ${item}.`,
      ], seed, `We say: This is ${article(item)} ${item}.`)
    }
    if (qi % 4 === 2) {
      return buildQuestion(1, id, 'I like', `Choose the happy sentence.`, `I like ${item}.`, [
        `I like to ${item}.`,
        `I likes ${item}.`,
        `Me like ${item}.`,
        `I likeing ${item}.`,
      ], seed, `A good sentence is: I like ${item}.`)
    }
    return buildQuestion(1, id, 'Colors', `The ${item} is ${color}. What color is it?`, color, COLORS, seed, `It is ${color}.`)
  }

  if (id < 90000) {
    const local = id - 80000
    const greetings = [
      { q: 'You see a friend. What do you say?', a: 'Hello!', pool: ['Goodbye!', 'Stop!', 'Go away!', 'I am a cat!'] },
      { q: 'You want a cookie. What do you say?', a: 'Please.', pool: ['No never.', 'Give now!', 'I sleep.', 'Go home.'] },
      { q: 'Someone gives you a toy. What do you say?', a: 'Thank you!', pool: ['I am sad.', 'Go away!', 'No please sit.', 'I am a bus.'] },
      { q: 'You bump into a friend. What do you say?', a: 'I am sorry.', pool: ['I am a dog.', 'Open the sky.', 'Count the milk.', 'Run the color.'] },
      { q: 'It is night. What do you say?', a: 'Good night.', pool: ['Good morning.', 'Happy soup.', 'Big thank run.', 'Please the sun.'] },
      { q: 'It is morning. What do you say?', a: 'Good morning!', pool: ['Good night.', 'I am juice.', 'Sit the park.', 'Red please.'] },
      { q: 'You leave home. What do you say?', a: 'Goodbye!', pool: ['Eat the shoe.', 'Hello night.', 'Sorry milk.', 'Please jump color.'] },
      { q: 'You need help. What do you say?', a: 'Help me, please.', pool: ['I am table.', 'Close the baby.', 'Thank the rain.', 'Blue you.'] },
    ]
    const times = ['morning', 'afternoon', 'evening', 'night']
    const sizes = spaceOk([NAMES.length, L1_PLACES.length, greetings.length, times.length], 10000)
    const [ni, pi, gi, ti] = decodeIndex(local, sizes)
    const g = greetings[gi]
    const name = NAMES[ni]
    const passage = `${name} is at the ${L1_PLACES[pi]} in the ${times[ti]}.`
    return buildQuestion(1, id, 'Polite talk', `${g.q}`, g.a, g.pool, seed, `A kind answer is: ${g.a}`, [], passage)
  }

  const local = id - 90000
  const words = [...ANIMALS.slice(0, 24), ...COLORS, ...FOODS.slice(0, 16), ...TOYS, ...FAMILY]
  const sizes = spaceOk([words.length, NAMES.length, 6], 10000)
  const [wi, ni, vi] = decodeIndex(local, sizes)
  const word = words[wi]
  const wrong = [0, 1, 2, 3].map((n) => misspell(word, vi + n + 1))
  return buildQuestion(1, id, 'Spelling', `${NAMES[ni]} asks: which spelling is right?`, word, wrong, seed, `The correct word is ${word}.`)
}

function genL2(id: number, seed: number): Question {
  if (id < 40000) {
    const sizes = spaceOk([NAMES.length, L2_ACTIONS.length, L2_OBJECTS.length, L2_PLACES.length, DAYS.length, 4], 40000)
    const [ni, ai, oi, pi, di, fi] = decodeIndex(id, sizes)
    const name = NAMES[ni]
    const p = PRONOUNS[name]
    const action = L2_ACTIONS[ai]
    const object = L2_OBJECTS[oi]
    const place = L2_PLACES[pi]
    const day = DAYS[di]
    const passage = `${name} ${thirdPerson(action)} ${article(object)} ${object} at the ${place} on ${day}.`
    const focus = fi % 4
    if (focus === 0) {
      return buildQuestion(2, id, 'Reading', `Who ${thirdPerson(action)} ${article(object)} ${object}?`, name, [...NAMES], seed, `${name} does it.`, NAMES, passage)
    }
    if (focus === 1) {
      return buildQuestion(2, id, 'Places', `Where does ${name} ${action} ${article(object)} ${object}?`, `at the ${place}`, L2_PLACES.map((x) => `at the ${x}`), seed, `${cap(p.subj)} does it at the ${place}.`, [], passage)
    }
    if (focus === 2) {
      return buildQuestion(2, id, 'Days', `When does ${name} ${action}?`, `on ${day}`, DAYS.map((d) => `on ${d}`), seed, `${name} does it on ${day}.`, [], passage)
    }
    return buildQuestion(2, id, 'Present simple', `Choose the correct verb form.`, `${name} ${thirdPerson(action)} ${article(object)} ${object}.`, [
      `${name} ${action} ${article(object)} ${object}.`,
      `${name} ${gerund(action)} ${article(object)} ${object}.`,
      `${name} ${action}s not ${object}.`,
      `${name} are ${action} ${object}.`,
    ], seed, `With he/she/it we add -s: ${name} ${thirdPerson(action)}…`, [], passage)
  }

  if (id < 60000) {
    const local = id - 40000
    const sizes = spaceOk([WEATHER.length, SCHOOL_ITEMS.length, FAMILY.length, FOODS.length, 5], 20000)
    const [wi, si, fi, foi, qi] = decodeIndex(local, sizes)
    const kind = qi % 5
    if (kind === 0) {
      const w = WEATHER[wi]
      return buildQuestion(2, id, 'Weather', `The sky is ${w === 'sunny' ? 'bright' : w}. How is the weather?`, w, WEATHER, seed, `The weather is ${w}.`)
    }
    if (kind === 1) {
      const item = SCHOOL_ITEMS[si]
      return buildQuestion(2, id, 'School', `Which word belongs at school?`, item, [...ANIMALS, ...FOODS.slice(10), ...TOYS], seed, `${cap(item)} is a school word.`, [])
    }
    if (kind === 2) {
      const fam = FAMILY[fi]
      return buildQuestion(2, id, 'Family', `Which word is a family word?`, fam, [...TOYS, ...COLORS, ...L2_PLACES], seed, `${cap(fam)} is a family word.`, [])
    }
    if (kind === 3) {
      const food = FOODS[foi]
      return buildQuestion(2, id, 'I like', `Choose the correct sentence.`, `I like ${food}, but I don’t like ${FOODS[(foi + 3) % FOODS.length]}.`, [
        `I likes ${food}, but I don’t like ${FOODS[(foi + 3) % FOODS.length]}.`,
        `I like ${food}, but I not like ${FOODS[(foi + 3) % FOODS.length]}.`,
        `Me like ${food}, but I don’t like ${FOODS[(foi + 3) % FOODS.length]}.`,
        `I liking ${food}, but I don’t like ${FOODS[(foi + 3) % FOODS.length]}.`,
      ], seed, `Use like with I, and don’t like for the opposite.`)
    }
    const [a, b] = OPPOSITES[wi % OPPOSITES.length]
    return buildQuestion(2, id, 'Opposites', `What is the opposite of ${a}?`, b, OPPOSITES.map((x) => x[1]), seed, `${cap(a)} and ${b} are opposites.`)
  }

  if (id < 80000) {
    const local = id - 60000
    const sizes = spaceOk([NAMES.length, SCHOOL_ITEMS.length, L2_ACTIONS.length, 5], 20000)
    const [ni, si, ai, qi] = decodeIndex(local, sizes)
    const name = NAMES[ni]
    const item = SCHOOL_ITEMS[si]
    const action = L2_ACTIONS[ai]
    const kind = qi % 5
    if (kind === 0) {
      const useAn = article(item) === 'an'
      return buildQuestion(2, id, 'A / An', `${name} needs ${article(item)} ${item}. Choose a or an.`, article(item), ['a', 'an', 'some a', 'the an', 'any'], seed, `${useAn ? 'An' : 'A'} is used because ${item} starts with a ${useAn ? 'vowel' : 'consonant'} sound.`)
    }
    if (kind === 1) {
      return buildQuestion(2, id, 'Plurals', `Choose the correct plural.`, item === 'teacher' ? 'teachers' : `${item}s`.replace(/ss$/, 'ses'), [
        `${item}esx`,
        `${item}ies`,
        `${item}'s s`,
        `${item}s's`,
      ], seed, `Most nouns add -s in the plural.`)
    }
    if (kind === 2) {
      return buildQuestion(2, id, 'Can', `Choose the correct sentence.`, `${name} can ${action} very well.`, [
        `${name} can ${thirdPerson(action)} very well.`,
        `${name} cans ${action} very well.`,
        `${name} can to ${action} very well.`,
        `${name} can ${gerund(action)} very well.`,
      ], seed, `After can we use the base verb: can ${action}.`)
    }
    if (kind === 3) {
      return buildQuestion(2, id, 'Possessive', `Whose ${item} is this? It is ${PRONOUNS[name].poss}.`, `${PRONOUNS[name].poss} ${item}`, [
        `${PRONOUNS[name].subj} ${item}`,
        `him ${item}`,
        `them ${item}`,
        `they ${item}`,
      ], seed, `Use ${PRONOUNS[name].poss} before a noun.`)
    }
    return buildQuestion(2, id, 'There is', `Choose the correct sentence.`, `There is ${article(item)} ${item} on the desk.`, [
      `There are ${article(item)} ${item} on the desk.`,
      `There is ${item}s on the desk.`,
      `There be ${article(item)} ${item} on the desk.`,
      `It are ${article(item)} ${item} on the desk.`,
    ], seed, `Use there is with one thing.`)
  }

  if (id < 90000) {
    const local = id - 80000
    const talks = [
      { q: 'Someone says “How are you?” What can you say?', a: 'I’m fine, thank you.', pool: ['I am a pencil.', 'Yes, I am seven weather.', 'My name is running.', 'It is a bag you.'] },
      { q: 'You want to join a game. What can you say?', a: 'Can I play, please?', pool: ['I am the weather.', 'Close your Monday.', 'Give me the sky.', 'I don’t school.'] },
      { q: 'You don’t understand. What can you say?', a: 'Can you say that again, please?', pool: ['I am yesterday.', 'Stop the teacher milk.', 'Thank you I am rain.', 'Please the homework eat.'] },
      { q: 'It is time for lunch. What can you say?', a: 'Let’s eat lunch.', pool: ['Let’s sleep the book.', 'Open the weather.', 'I can Monday.', 'She are bag.'] },
      { q: 'Your friend is sad. What can you say?', a: 'Are you okay?', pool: ['You are a window?', 'Eat the classroom.', 'I am two blue.', 'Please the opposite.'] },
      { q: 'You meet a new classmate. What can you say?', a: 'Hi, my name is… What’s your name?', pool: ['I don’t like I am.', 'How old is the weather?', 'Can you Monday me?', 'This is eat.'] },
      { q: 'You need a pencil. What can you say?', a: 'May I borrow a pencil?', pool: ['May I borrow a weather?', 'I am the pencil eat.', 'Please jump the bag.', 'My brother is a ruler sad.'] },
      { q: 'Class is finished. What can you say?', a: 'See you tomorrow!', pool: ['See you yesterday!', 'I am closed.', 'Thank you the floor.', 'Play the teacher.'] },
    ]
    const sizes = spaceOk([NAMES.length, L2_PLACES.length, talks.length, DAYS.length], 10000)
    const [ni, pi, ti, di] = decodeIndex(local, sizes)
    const t = talks[ti]
    const passage = `${NAMES[ni]} is at the ${L2_PLACES[pi]} on ${DAYS[di]}.`
    return buildQuestion(2, id, 'Conversation', t.q, t.a, t.pool, seed, `A natural answer is: ${t.a}`, [], passage)
  }

  const local = id - 90000
  const words = [...SCHOOL_ITEMS, ...L2_OBJECTS, ...WEATHER, ...FAMILY]
  const sizes = spaceOk([words.length, NAMES.length, 8], 10000)
  const [wi, ni, vi] = decodeIndex(local, sizes)
  const word = words[wi]
  return buildQuestion(2, id, 'Spelling', `${NAMES[ni]} wrote a word. Which spelling is correct?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 2)), seed, `The correct spelling is ${word}.`)
}

function genL3(id: number, seed: number): Question {
  if (id < 40000) {
    const verbs = IRREGULAR.filter(([base]) =>
      ['go', 'come', 'drive', 'fly', 'run', 'leave', 'take', 'buy', 'find', 'meet', 'see', 'make', 'eat', 'write'].includes(base),
    )
    const sizes = spaceOk([NAMES.length, verbs.length, L2_PLACES.length, REASONS.length, L2_OBJECTS.length, 4], 40000)
    const [ni, vi, pi, ri, oi, fi] = decodeIndex(id, sizes)
    const name = NAMES[ni]
    const [base, past] = verbs[vi]
    const place = L2_PLACES[pi]
    const reason = REASONS[ri]
    const object = L2_OBJECTS[oi]
    const p = PRONOUNS[name]
    const motion = ['go', 'come', 'drive', 'fly', 'run', 'leave'].includes(base)
    const passage = motion
      ? `Yesterday, ${name} ${past} to the ${place} because ${reason}.`
      : `Yesterday, ${name} ${past} ${article(object)} ${object} at the ${place} because ${reason}.`
    const focus = fi % 4
    if (focus === 0) {
      return buildQuestion(3, id, 'Past simple', `What is the past form of ${base}?`, past, verbs.map((x) => x[1]), seed, `${cap(base)} → ${past}.`, verbs.map((x) => x[1]), passage)
    }
    if (focus === 1) {
      return buildQuestion(3, id, 'Reading', `Where was ${name}?`, `at the ${place}`, L2_PLACES.map((x) => `at the ${x}`), seed, `${cap(p.subj)} was at the ${place}.`, [], passage)
    }
    if (focus === 2) {
      return buildQuestion(3, id, 'Because', `Why did that happen?`, `because ${reason}`, REASONS.map((x) => `because ${x}`), seed, `The reason is: ${reason}.`, [], passage)
    }
    return buildQuestion(3, id, 'Time words', `Which word shows the action is in the past?`, 'Yesterday', ['Tomorrow', 'Now', 'Every day', 'Next week'], seed, `Yesterday tells us it already happened.`, [], passage)
  }

  if (id < 60000) {
    const local = id - 40000
    const sizes = spaceOk([NAMES.length, ADJECTIVES_COMPARE.length, ANIMALS.length, 4], 20000)
    const [ni, ai, ani, qi] = decodeIndex(local, sizes)
    const name = NAMES[ni]
    const adj = ADJECTIVES_COMPARE[ai]
    const other = NAMES[(ni + 3) % NAMES.length]
    const animal = ANIMALS[ani]
    const otherAnimal = ANIMALS[(ani + 5) % ANIMALS.length]
    if (qi % 4 === 0) {
      return buildQuestion(3, id, 'Comparatives', `Choose the correct sentence.`, `${name} is ${comparative(adj)} than ${other}.`, [
        `${name} is ${adj} than ${other}.`,
        `${name} is more ${comparative(adj)} than ${other}.`,
        `${name} is ${adj}erest than ${other}.`,
        `${name} is the ${comparative(adj)} than ${other}.`,
      ], seed, `Short adjectives add -er + than: ${comparative(adj)} than.`)
    }
    if (qi % 4 === 1) {
      return buildQuestion(3, id, 'Comparatives', `A ${animal} is ${comparative('big')} than a ${otherAnimal}? Choose the comparative of big.`, 'bigger', ['biger', 'more big', 'biggest than', 'bigly'], seed, `Big → bigger (double the g).`)
    }
    if (qi % 4 === 2) {
      return buildQuestion(3, id, 'Superlatives', `Choose the correct sentence.`, `${name} is the ${superlative(adj)} in the class.`, [
        `${name} is the more ${adj} in the class.`,
        `${name} is ${comparative(adj)} in the class.`,
        `${name} is most ${adj}er in the class.`,
        `${name} is the ${adj} than the class.`,
      ], seed, `Use the + -est for the top one in a group.`)
    }
    return buildQuestion(3, id, 'Reading', `${name} is ${comparative(adj)} than ${other}. Who is more ${adj}?`, name, [other, 'both', 'nobody', 'the teacher'], seed, `${name} is ${comparative(adj)}.`)
  }

  if (id < 80000) {
    const local = id - 60000
    const sizes = spaceOk([NAMES.length, REGULAR_PAST.length, IRREGULAR.length, 5], 20000)
    const [ni, ri, ii, qi] = decodeIndex(local, sizes)
    const name = NAMES[ni]
    const reg = REGULAR_PAST[ri]
    const irr = IRREGULAR[ii]
    const kind = qi % 5
    if (kind === 0) {
      return buildQuestion(3, id, 'Regular past', `What is the past form of ${reg}?`, regularPast(reg), REGULAR_PAST.map(regularPast), seed, `${cap(reg)} → ${regularPast(reg)}.`)
    }
    if (kind === 1) {
      return buildQuestion(3, id, 'Questions', `Choose the correct question.`, `Did ${name} ${reg} yesterday?`, [
        `Did ${name} ${regularPast(reg)} yesterday?`,
        `Does ${name} ${regularPast(reg)} yesterday?`,
        `${name} did ${regularPast(reg)} yesterday?`,
        `Did ${name} ${thirdPerson(reg)} yesterday?`,
      ], seed, `After did, use the base verb: Did ${name} ${reg}…`)
    }
    if (kind === 2) {
      return buildQuestion(3, id, 'Negatives', `Choose the correct negative.`, `${name} didn’t ${irr[0]} the book.`, [
        `${name} didn’t ${irr[1]} the book.`,
        `${name} doesn’t ${irr[1]} the book.`,
        `${name} not ${irr[0]} the book.`,
        `${name} didn’t ${irr[2]} the book.`,
      ], seed, `After didn’t, use the base form ${irr[0]}.`)
    }
    if (kind === 3) {
      return buildQuestion(3, id, 'Prepositions', `${name} put the book ___ the bag.`, 'in', ['on to in', 'at', 'from', 'of'], seed, `We put things in a bag.`)
    }
    return buildQuestion(3, id, 'Frequency', `Choose the sentence with the adverb in a natural place.`, `${name} always ${thirdPerson(reg)} after school.`, [
      `${name} ${thirdPerson(reg)} always after school.`,
      `Always ${name} ${thirdPerson(reg)} after school the.`,
      `${name} ${thirdPerson(reg)} after always school.`,
      `${name} is always ${reg} after school yesterday.`,
    ], seed, `Put always before the main verb: always ${thirdPerson(reg)}.`)
  }

  if (id < 90000) {
    const local = id - 80000
    const talks = [
      { q: 'You missed the bus. What can you say?', a: 'I missed the bus, so I was late.', pool: ['I miss the bus tomorrow so I am old.', 'The bus did I.', 'I am missing yesterday bus.', 'Late I the bus because.'] },
      { q: 'A friend asks “What did you do last weekend?”', a: 'I visited my grandparents.', pool: ['I visit my grandparents tomorrow.', 'I visiting my grandparents now yesterday.', 'I will visited my grandparents.', 'I am visit my grandparents last.'] },
      { q: 'You want to suggest a plan.', a: 'Why don’t we go to the museum?', pool: ['Why we don’t going museum?', 'Don’t why we go?', 'We no go museum why?', 'Why does we going?'] },
      { q: 'Someone looks taller than you. What can you say?', a: 'You’re taller than me.', pool: ['You’re more taller me.', 'You taller I.', 'You’re tallest than me.', 'You are more tall I.'] },
      { q: 'You need a reason. Complete: I stayed home…', a: 'because I felt sick.', pool: ['because I will sick.', 'because I am yesterday.', 'so I felt because.', 'than I felt sick.'] },
      { q: 'The teacher asks about last night’s homework.', a: 'I finished it after dinner.', pool: ['I finish it after dinner yesterday not.', 'I am finish it.', 'I finishing after.', 'I did finished it.'] },
      { q: 'You want to compare two books.', a: 'This book is more interesting than that one.', pool: ['This book is interestinger.', 'This book more interesting that.', 'This book is the more interesting than.', 'This book interestingest.'] },
      { q: 'A classmate lost a bag. What can you say?', a: 'Where did you last see it?', pool: ['Where you did saw it?', 'Where do you saw it last?', 'Where did you saw it?', 'Where you see it did?'] },
    ]
    const sizes = spaceOk([NAMES.length, L2_PLACES.length, talks.length, DAYS.length], 10000)
    const [ni, pi, ti, di] = decodeIndex(local, sizes)
    const t = talks[ti]
    const passage = `${NAMES[ni]} was at the ${L2_PLACES[pi]} last ${DAYS[di]}.`
    return buildQuestion(3, id, 'Conversation', t.q, t.a, t.pool, seed, `A clear answer is: ${t.a}`, [], passage)
  }

  const local = id - 90000
  const words = [...IRREGULAR.map((x) => x[1]), ...REGULAR_PAST.map(regularPast), ...ADJECTIVES_COMPARE.map(comparative)]
  const sizes = spaceOk([words.length, NAMES.length, 8], 10000)
  const [wi, ni, vi] = decodeIndex(local, sizes)
  const word = words[wi]
  return buildQuestion(3, id, 'Spelling', `Which form is spelled correctly? (${NAMES[ni]}’s notebook)`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 1)), seed, `The correct form is ${word}.`)
}

function genL4(id: number, seed: number): Question {
  if (id < 40000) {
    const sizes = spaceOk([NAMES.length, L2_ACTIONS.length, L2_PLACES.length, L2_OBJECTS.length, 4], 40000)
    const [ni, ai, pi, oi, fi] = decodeIndex(id, sizes)
    const name = NAMES[ni]
    const p = PRONOUNS[name]
    const action = L2_ACTIONS[ai]
    const place = L2_PLACES[pi]
    const object = L2_OBJECTS[oi]
    const passage = `If ${name} ${thirdPerson(action)} ${article(object)} ${object} tonight, ${p.subj} will go to the ${place} tomorrow.`
    const focus = fi % 4
    if (focus === 0) {
      return buildQuestion(4, id, 'First conditional', `Choose the correct pair of verb forms.`, `If ${name} ${thirdPerson(action)}…, ${p.subj} will go…`, [
        `If ${name} will ${action}…, ${p.subj} will go…`,
        `If ${name} ${action}…, ${p.subj} goes…`,
        `If ${name} ${gerund(action)}…, ${p.subj} will going…`,
        `If ${name} ${thirdPerson(action)}…, ${p.subj} going…`,
      ], seed, `If + present, will + base verb.`, [], passage)
    }
    if (focus === 1) {
      return buildQuestion(4, id, 'Future', `What will ${name} do tomorrow if the plan works?`, `go to the ${place}`, L2_PLACES.map((x) => `go to the ${x}`), seed, `${cap(p.subj)} will go to the ${place}.`, [], passage)
    }
    if (focus === 2) {
      return buildQuestion(4, id, 'Going to', `Choose the sentence about a plan.`, `${name} is going to ${action} ${article(object)} ${object}.`, [
        `${name} going to ${action} ${article(object)} ${object}.`,
        `${name} is go to ${action} ${article(object)} ${object}.`,
        `${name} will going ${action} ${article(object)} ${object}.`,
        `${name} is going ${thirdPerson(action)} ${object}.`,
      ], seed, `Plan: am/is/are going to + base verb.`)
    }
    return buildQuestion(4, id, 'Reading', `When will ${name} go to the ${place}?`, 'tomorrow', ['yesterday', 'last week', 'two years ago', 'just now'], seed, `The sentence says tomorrow.`, [], passage)
  }

  if (id < 60000) {
    const local = id - 40000
    const sizes = spaceOk([PHRASAL.length, NAMES.length, L2_OBJECTS.length, 4], 20000)
    const [phi, ni, oi, qi] = decodeIndex(local, sizes)
    const ph = PHRASAL[phi]
    const name = NAMES[ni]
    const object = L2_OBJECTS[oi]
    if (qi % 4 === 0) {
      return buildQuestion(4, id, 'Phrasal verbs', `What does “${ph.verb}” mean?`, ph.meaning, PHRASAL.map((x) => x.meaning), seed, `${cap(ph.verb)} means “${ph.meaning}”.`)
    }
    if (qi % 4 === 1) {
      return buildQuestion(4, id, 'Phrasal verbs', `${name} wants to ${ph.example}. Which phrasal verb fits?`, ph.verb, PHRASAL.map((x) => x.verb), seed, `The natural phrase is ${ph.verb}.`)
    }
    if (qi % 4 === 2) {
      return buildQuestion(4, id, 'Present continuous vs simple', `Choose the best sentence for a plan happening now.`, `${name} is ${gerund('pack')} ${article(object)} ${object} right now.`, [
        `${name} ${thirdPerson('pack')} ${article(object)} ${object} right now.`,
        `${name} pack ${article(object)} ${object} right now.`,
        `${name} is pack ${article(object)} ${object} right now.`,
        `${name} will packing ${object} right now.`,
      ], seed, `Right now → present continuous: is packing.`)
    }
    return buildQuestion(4, id, 'Will vs going to', `The sky is full of dark clouds. Choose the most natural sentence.`, 'It’s going to rain.', [
      'It will raining.',
      'It rains tomorrow yesterday.',
      'It going rain.',
      'It will to rain now ago.',
    ], seed, `Evidence now → going to.`)
  }

  if (id < 80000) {
    const local = id - 60000
    const sizes = spaceOk([NAMES.length, GENERIC_ADJECTIVES.length, GENERIC_NOUNS.length, 5], 20000)
    const [ni, ai, oi, qi] = decodeIndex(local, sizes)
    const name = NAMES[ni]
    const adj = GENERIC_ADJECTIVES[ai]
    const noun = GENERIC_NOUNS[oi]
    const kind = qi % 5
    if (kind === 0) {
      return buildQuestion(4, id, 'Relative clauses', `Choose the most natural sentence.`, `${name} met a teacher who is ${adj}.`, [
        `${name} met a teacher which is ${adj}.`,
        `${name} met a teacher who are ${adj}.`,
        `${name} met a teacher whose is ${adj}.`,
        `${name} met a teacher who ${adj} is.`,
      ], seed, `Use who for people.`)
    }
    if (kind === 1) {
      return buildQuestion(4, id, 'Opinions', `Choose a polite opinion.`, `I think this ${noun} is ${adj}.`, [
        `I thinking this ${noun} is ${adj}.`,
        `I am think this ${noun} ${adj}.`,
        `For me is this ${noun} ${adj}.`,
        `I thinks this ${noun} is ${adj}.`,
      ], seed, `I think + sentence.`)
    }
    if (kind === 2) {
      return buildQuestion(4, id, 'Modals', `Choose the best advice.`, `${name} should take the ${noun} to the teacher.`, [
        `${name} should to take the ${noun}.`,
        `${name} should taking the ${noun}.`,
        `${name} should takes the ${noun}.`,
        `${name} musts take the ${noun}.`,
      ], seed, `Should + base verb.`)
    }
    if (kind === 3) {
      return buildQuestion(4, id, 'Present perfect intro', `Choose the sentence that connects past and now.`, `${name} has lost the ${noun}.`, [
        `${name} have lost the ${noun}.`,
        `${name} has lose the ${noun}.`,
        `${name} has losing the ${noun}.`,
        `${name} is lost the ${noun} yesterday has.`,
      ], seed, `He/She + has + past participle.`)
    }
    return buildQuestion(4, id, 'Connectors', `Complete: ${name} was tired, ___ ${PRONOUNS[name].subj} finished the ${noun}.`, 'but', ['because of', 'so that', 'if not', 'during'], seed, `But shows contrast.`)
  }

  if (id < 90000) {
    const local = id - 80000
    const talks = [
      { q: 'A friend asks about weekend plans. What sounds natural?', a: 'I’m going to visit my cousin if I finish my project.', pool: ['I will going visit my cousin if I will finish.', 'I going visit if I finished.', 'I am visit cousin if finish.', 'If I will finish I going.'] },
      { q: 'You disagree politely.', a: 'I see your point, but I don’t quite agree.', pool: ['You wrong totally forever.', 'I not agree you point.', 'My idea is more you.', 'No, your sentence bad.'] },
      { q: 'You need to postpone.', a: 'Could we put the meeting off until Friday?', pool: ['Could we put off until the meeting Friday?', 'We delay Friday the meet?', 'Put we the meeting Friday off?', 'Could we the meeting put?'] },
      { q: 'You offer help.', a: 'If you want, I can look after your bag.', pool: ['If you will want, I looking after.', 'I can looking your bag if.', 'If you want I look your bag after.', 'I after look your bag can.'] },
      { q: 'You make a prediction with evidence.', a: 'Look at those clouds — it’s going to rain.', pool: ['Look at those clouds — it will raining.', 'Those clouds rain it will to.', 'It rains going those clouds.', 'Going to it rain look.'] },
      { q: 'You ask for an opinion.', a: 'What would you do in my situation?', pool: ['What you would do in situation my?', 'What do you would?', 'What you do would my situation?', 'Would what you doing?'] },
      { q: 'You explain a rule.', a: 'If you press this button, the machine will start.', pool: ['If you will press this button, the machine starts.', 'If you pressing, the machine will starting.', 'If you press, the machine going start.', 'If you pressed, the machine start will.'] },
      { q: 'You talk about experience.', a: 'I’ve already seen that film.', pool: ['I already have see that film.', 'I have already saw that film.', 'I already seeing that film.', 'I have see already that film.'] },
    ]
    const sizes = spaceOk([NAMES.length, L2_PLACES.length, talks.length, PHRASAL.length], 10000)
    const [ni, pi, ti] = decodeIndex(local, sizes)
    const t = talks[ti]
    const passage = `${NAMES[ni]} is talking with a friend at the ${L2_PLACES[pi]}.`
    return buildQuestion(4, id, 'Conversation', t.q, t.a, t.pool, seed, `The most natural choice is: ${t.a}`, [], passage)
  }

  const local = id - 90000
  const words = [...PHRASAL.map((x) => x.verb), ...GENERIC_NOUNS, ...GENERIC_ADJECTIVES]
  const sizes = spaceOk([words.length, NAMES.length, 8], 10000)
  const [wi, ni, vi] = decodeIndex(local, sizes)
  const word = words[wi]
  return buildQuestion(4, id, 'Spelling', `Which option is spelled correctly in ${NAMES[ni]}’s essay?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 3)), seed, `The correct spelling is ${word}.`)
}

function genL5(id: number, seed: number): Question {
  if (id < 40000) {
    const sizes = spaceOk([NAMES.length, IDIOMS.length, L2_PLACES.length, GENERIC_NOUNS.length, 4], 40000)
    const [ni, ii, pi, oi, fi] = decodeIndex(id, sizes)
    const name = NAMES[ni]
    const p = PRONOUNS[name]
    const idiom = IDIOMS[ii]
    const place = L2_PLACES[pi]
    const noun = GENERIC_NOUNS[oi]
    const passage = `${name} was at the ${place} when everything went wrong with the ${noun}. At first ${p.subj} wanted to call it a day, but then a classmate helped ${p.obj} break the ice with the new group. In the end ${p.subj} felt over the moon.`
    const focus = fi % 4
    if (focus === 0) {
      return buildQuestion(5, id, 'Idioms', `What does “${idiom.idiom}” mean?`, idiom.meaning, IDIOMS.map((x) => x.meaning), seed, `“${idiom.idiom}” means ${idiom.meaning}.`, [], passage)
    }
    if (focus === 1) {
      return buildQuestion(5, id, 'Reading', `How did ${name} feel at the end?`, 'extremely happy', ['very angry', 'too sleepy to move', 'completely bored', 'afraid of the dark'], seed, `Over the moon = extremely happy.`, [], passage)
    }
    if (focus === 2) {
      return buildQuestion(5, id, 'Passive', `Choose the passive form.`, `The ${noun} was left at the ${place}.`, [
        `The ${noun} was leave at the ${place}.`,
        `The ${noun} were left at the ${place}.`,
        `The ${noun} was lefted at the ${place}.`,
        `The ${noun} is been leave at the ${place}.`,
      ], seed, `Past passive: was/were + past participle.`)
    }
    return buildQuestion(5, id, 'Reported speech', `${name} said, “I am tired.” Choose the reported form.`, `${name} said ${p.subj} was tired.`, [
      `${name} said ${p.subj} is tired.`,
      `${name} said ${p.subj} am tired.`,
      `${name} told that ${p.subj} is tired.`,
      `${name} said ${p.subj} were tired I.`,
    ], seed, `Am/is usually becomes was in reported speech.`)
  }

  if (id < 60000) {
    const local = id - 40000
    const sizes = spaceOk([IDIOMS.length, NAMES.length, IRREGULAR.length, 4], 20000)
    const [ii, ni, vi, qi] = decodeIndex(local, sizes)
    const idiom = IDIOMS[ii]
    const name = NAMES[ni]
    const irr = IRREGULAR[vi]
    if (qi % 4 === 0) {
      return buildQuestion(5, id, 'Idioms', `${name} used the idiom “${idiom.idiom}”. What does it mean?`, idiom.meaning, IDIOMS.map((x) => x.meaning), seed, `Here the idiom means: ${idiom.meaning}.`)
    }
    if (qi % 4 === 1) {
      const habit: [string, string, string] = ['go', 'went', 'gone']
      const used = ['go', 'run', 'swim', 'sleep', 'speak', 'write', 'eat', 'drive', 'sing'].includes(irr[0])
        ? irr
        : habit
      return buildQuestion(5, id, 'Second conditional', `Choose the correct second conditional.`, `If ${name} ${used[1]} more often, ${PRONOUNS[name].subj} would feel better.`, [
        `If ${name} ${used[0]} more often, ${PRONOUNS[name].subj} would feel better.`,
        `If ${name} would ${used[0]} more often, ${PRONOUNS[name].subj} will feel better.`,
        `If ${name} ${used[2]} more often, ${PRONOUNS[name].subj} would felt better.`,
        `If ${name} ${used[1]} more often, ${PRONOUNS[name].subj} will feel better.`,
      ], seed, `Second conditional: If + past, would + base.`)
    }
    if (qi % 4 === 2) {
      return buildQuestion(5, id, 'Passive', `Rewrite: People speak English here.`, 'English is spoken here.', [
        'English is speak here.',
        'English are spoken here.',
        'English spoken is here.',
        'English is speaking here by people now here.',
      ], seed, `Present passive: is/are + past participle.`)
    }
    return buildQuestion(5, id, 'Tone', `A teacher asks why your homework is late. Which reply is most appropriate?`, 'I’m sorry — I underestimated the time it would take, but I can submit it today.', [
      'Whatever, it’s just homework.',
      'You never told us anything.',
      'I didn’t do it because I slept, lol.',
      'That’s your problem, not mine.',
    ], seed, `Own the mistake and offer a solution.`)
  }

  if (id < 80000) {
    const local = id - 60000
    const sizes = spaceOk([ACADEMIC_PAIRS.length, NAMES.length, GENERIC_NOUNS.length, 5], 20000)
    const [ai, ni, oi, qi] = decodeIndex(local, sizes)
    const item = ACADEMIC_PAIRS[ai]
    const name = NAMES[ni]
    const noun = GENERIC_NOUNS[oi]
    const kind = qi % 5
    if (kind === 0) {
      return buildQuestion(5, id, 'Academic vocabulary', `What does “${item.word}” mean?`, item.meaning, item.distractors, seed, `${cap(item.word)}: ${item.meaning}.`)
    }
    if (kind === 1) {
      return buildQuestion(5, id, 'Word choice', `${name} needs a precise word meaning “${item.meaning}”.`, item.word, ACADEMIC_PAIRS.map((x) => x.word), seed, `The best word is ${item.word}.`)
    }
    if (kind === 2) {
      return buildQuestion(5, id, 'Relative clauses', `Choose the most accurate sentence.`, `The ${noun} that ${name} found was damaged.`, [
        `The ${noun} who ${name} found was damaged.`,
        `The ${noun} that ${name} found were damaged.`,
        `The ${noun} which ${name} found was damage.`,
        `The ${noun} that ${name} finding was damaged.`,
      ], seed, `Use that/which for things; keep verb agreement.`)
    }
    if (kind === 3) {
      return buildQuestion(5, id, 'Connectors', `Complete: The result was unexpected; ____, the team continued.`, 'however', ['therefore because', 'for example of', 'such as if', 'in order the'], seed, `However introduces contrast.`)
    }
    return buildQuestion(5, id, 'Gerunds / infinitives', `Choose the natural sentence.`, `${name} suggested checking the ${noun}.`, [
      `${name} suggested to check the ${noun}.`,
      `${name} suggested check the ${noun}.`,
      `${name} suggested to checking the ${noun}.`,
      `${name} suggested that checking to the ${noun}.`,
    ], seed, `Suggest + gerund (or that-clause).`)
  }

  if (id < 90000) {
    const local = id - 80000
    const talks = [
      { q: 'A classmate is stressed about exams. What sounds supportive and natural?', a: 'If I were you, I’d make a revision timetable and start with the hardest topic.', pool: ['If I was you I will cram all night and cry.', 'You should to panic more.', 'Exams are whatever, skip them.', 'If I were you I would made nothing.'] },
      { q: 'You need to report what the coach said: “Practice starts at 5.”', a: 'The coach said practice started at 5.', pool: ['The coach said practice starts at 5 always now then.', 'The coach told practice start at 5.', 'The coach said that practice starting at 5.', 'The coach said practice has start at 5.'] },
      { q: 'Someone used an idiom: “Don’t cut corners.” They mean:', a: 'Don’t rush and do a careless job.', pool: ['Don’t walk near corners.', 'Don’t spend any money.', 'Don’t talk to strangers.', 'Don’t arrive early.'] },
      { q: 'You disagree in a group project.', a: 'I get what you mean, but the data doesn’t really support that yet.', pool: ['That’s dumb and you’re wrong.', 'I am not agree you.', 'Your idea no good.', 'We no use data.'] },
      { q: 'You write a caption for a science fair project.', a: 'The results suggest that temperature has a significant effect on growth.', pool: ['The results suggest temperature do effect growth significant.', 'Results is suggesting temperature effect.', 'The results suggesting significant growth temperature.', 'Temperature significant the results growth.'] },
      { q: 'A friend spilled the beans about a surprise party. They:', a: 'revealed the secret', pool: ['cooked too many beans', 'cleaned the kitchen', 'arrived too early', 'bought expensive tickets'] },
      { q: 'Choose the most natural complaint at a restaurant.', a: 'Excuse me — I think this bill might be wrong.', pool: ['Hey you, this bill stupid.', 'The bill are mistake.', 'You gave wrong I think bill.', 'This bill no correct, give new.'] },
      { q: 'You describe a movie without spoiling it.', a: 'It’s slower than I expected, but the ending really stays with you.', pool: ['It slower I expect but ending stay.', 'It is more slow I thought ending.', 'Ending stay you but slow it.', 'The movie are slow ending stay.'] },
    ]
    const sizes = spaceOk([NAMES.length, IDIOMS.length, talks.length, L2_PLACES.length], 10000)
    const [ni, ii, ti, pi] = decodeIndex(local, sizes)
    const t = talks[ti]
    const passage = `${NAMES[ni]} is chatting near the ${L2_PLACES[pi]} after someone mentioned “${IDIOMS[ii].idiom}”.`
    return buildQuestion(5, id, 'Teen conversation', t.q, t.a, t.pool, seed, `The strongest choice is: ${t.a}`, [], passage)
  }

  const local = id - 90000
  const words = [...IDIOMS.map((x) => x.idiom), ...ACADEMIC_PAIRS.map((x) => x.word)]
  const sizes = spaceOk([words.length, NAMES.length, 8], 10000)
  const [wi, ni, vi] = decodeIndex(local, sizes)
  const word = words[wi]
  return buildQuestion(5, id, 'Spelling', `Which option matches standard English in ${NAMES[ni]}’s article?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 4)), seed, `The standard form is ${word}.`)
}

function genL6(id: number, seed: number): Question {
  if (id < 40000) {
    const sizes = spaceOk([COLLOCATIONS.length, NAMES.length, GENERIC_NOUNS.length, ACADEMIC_PAIRS.length, 4], 40000)
    const [ci, ni, oi, ai, fi] = decodeIndex(id, sizes)
    const col = COLLOCATIONS[ci]
    const name = NAMES[ni]
    const p = PRONOUNS[name]
    const noun = GENERIC_NOUNS[oi]
    const academic = ACADEMIC_PAIRS[ai]
    const passage = `${name} argued that the ${noun} was ${academic.word}, yet the committee still needed to ${col.pair} before publishing the findings. ${cap(p.subj)} refused to cut corners, even under a tight schedule.`
    const focus = fi % 4
    if (focus === 0) {
      return buildQuestion(6, id, 'Collocations', `Choose the verb/adjective that collocates with “${col.cue}”.`, col.correct, col.wrong, seed, `The idiomatic collocation is ${col.pair}.`, [], passage)
    }
    if (focus === 1) {
      return buildQuestion(6, id, 'Academic vocabulary', `In this passage, “${academic.word}” is closest in meaning to:`, academic.meaning, academic.distractors, seed, `${cap(academic.word)} means ${academic.meaning}.`, [], passage)
    }
    if (focus === 2) {
      return buildQuestion(6, id, 'Reading inference', `What can be inferred about ${name}?`, `${cap(p.subj)} prioritized quality over speed.`, [
        `${cap(p.subj)} wanted to finish at any cost.`,
        `${cap(p.subj)} refused to publish anything.`,
        `${cap(p.subj)} ignored the committee.`,
        `${cap(p.subj)} cut corners to meet the deadline.`,
      ], seed, `Refusing to cut corners means ${p.subj} would not sacrifice quality.`, [], passage)
    }
    return buildQuestion(6, id, 'Reference', `What does “the findings” most likely refer to?`, `the results of the work on the ${noun}`, [
      'a holiday plan',
      'a restaurant bill',
      'a sports score',
      'a private diary entry with no research',
    ], seed, `The academic context points to research results.`, [], passage)
  }

  if (id < 60000) {
    const local = id - 40000
    const sizes = spaceOk([FORMAL_INFORMAL.length, COLLOCATIONS.length, NAMES.length, 4], 20000)
    const [fi, ci, ni, qi] = decodeIndex(local, sizes)
    const pair = FORMAL_INFORMAL[fi]
    const col = COLLOCATIONS[ci]
    const name = NAMES[ni]
    if (qi % 4 === 0) {
      return buildQuestion(6, id, 'Register', `Choose the most formal equivalent of “${pair.informal}”.`, pair.formal, [pair.informal, ...pair.extra], seed, `In academic/workplace English, prefer ${pair.formal}.`)
    }
    if (qi % 4 === 1) {
      return buildQuestion(6, id, 'Register', `Which option is too informal for a research paper?`, pair.informal, [pair.formal, 'subsequently', 'nevertheless', 'in contrast'], seed, `“${pair.informal}” is conversational.`)
    }
    if (qi % 4 === 2) {
      return buildQuestion(6, id, 'Collocations', `${name} must ___ ${col.cue} before Friday.`, col.correct, col.wrong, seed, `Use ${col.pair}.`)
    }
    return buildQuestion(6, id, 'Nuance', `Which sentence is most precise?`, `The evidence strongly suggests a causal link, but it does not prove one.`, [
      `The evidence proves maybe a link or not, whatever.`,
      `The evidence are suggesting prove.`,
      `The evidence strongly suggest a causal link but do not proves.`,
      `The evidence is prove of causal.`,
    ], seed, `Academic English separates suggestion from proof.`)
  }

  if (id < 80000) {
    const local = id - 60000
    const sizes = spaceOk([NAMES.length, IRREGULAR.length, GENERIC_NOUNS.length, 5], 20000)
    const [ni, ii, oi, qi] = decodeIndex(local, sizes)
    const name = NAMES[ni]
    const irr = IRREGULAR[ii]
    const noun = GENERIC_NOUNS[oi]
    const kind = qi % 5
    if (kind === 0) {
      return buildQuestion(6, id, 'Mixed conditionals', `Choose the most accurate mixed conditional.`, `If ${name} had ${irr[2]} the ${noun} earlier, ${PRONOUNS[name].subj} would not be in trouble now.`, [
        `If ${name} ${irr[1]} the ${noun} earlier, ${PRONOUNS[name].subj} will not be in trouble now.`,
        `If ${name} had ${irr[0]} the ${noun} earlier, ${PRONOUNS[name].subj} would not be in trouble now.`,
        `If ${name} has ${irr[2]} the ${noun} earlier, ${PRONOUNS[name].subj} would not been in trouble now.`,
        `If ${name} would have ${irr[2]} the ${noun} earlier, ${PRONOUNS[name].subj} would not be in trouble now.`,
      ], seed, `Past condition + present result: had + past participle, would + base.`)
    }
    if (kind === 1) {
      return buildQuestion(6, id, 'Inversion', `Choose the more formal inverted form.`, `Had ${name} ${irr[2]} sooner, the ${noun} would have been saved.`, [
        `Had ${name} ${irr[0]} sooner, the ${noun} would have been saved.`,
        `Had ${name} would ${irr[2]} sooner, the ${noun} would have been saved.`,
        `Did ${name} had ${irr[2]} sooner, the ${noun} would have been saved.`,
        `Have ${name} ${irr[2]} sooner, the ${noun} would been saved.`,
      ], seed, `Formal inversion: Had + subject + past participle.`)
    }
    if (kind === 2) {
      return buildQuestion(6, id, 'Cleft sentences', `Choose the cleft sentence that emphasizes the ${noun}.`, `It was the ${noun} that caused the delay.`, [
        `It were the ${noun} that caused the delay.`,
        `It was the ${noun} which cause the delay.`,
        `It is been the ${noun} that caused the delay.`,
        `It was the ${noun} that causing the delay.`,
      ], seed, `Cleft: It was X that + clause.`)
    }
    if (kind === 3) {
      return buildQuestion(6, id, 'Participles', `Choose the sentence with a correct participle clause.`, `Having ${irr[2]} the ${noun}, ${name} left the office.`, [
        `Having ${irr[0]} the ${noun}, ${name} left the office.`,
        `Having ${irr[1]} the ${noun}, ${name} left the office.`,
        `Have ${irr[2]} the ${noun}, ${name} left the office.`,
        `Having ${irr[2]} the ${noun}, ${name} leaving the office.`,
      ], seed, `Having + past participle.`)
    }
    return buildQuestion(6, id, 'Subject-verb agreement', `Choose the grammatically precise sentence.`, `The committee has reached a decision on the ${noun}.`, [
      `The committee have reach a decision on the ${noun}.`,
      `The committee has reach a decision on the ${noun}.`,
      `The committee has reached a decision on the ${noun}s is.`,
      `The committee reaching has a decision on the ${noun}.`,
    ], seed, `In American academic English, committee is usually singular: has.`)
  }

  if (id < 90000) {
    const local = id - 80000
    const talks = [
      { q: 'You are emailing a professor to request an extension. Which is best?', a: 'Would it be possible to request a short extension? I can submit a complete draft by Thursday.', pool: ['Hey, I need more time, thx.', 'Give me extension now please because reasons.', 'I was wondering you give time or what.', 'Can haz extra days lol.'] },
      { q: 'In a meeting, a colleague interrupts with a weak claim. You respond professionally:', a: 'Could we look at the data again? I’m not sure that conclusion is fully supported yet.', pool: ['That’s nonsense and you know it.', 'Your idea is stupid frankly.', 'No way that works, bro.', 'I am not agree you conclusion.'] },
      { q: 'Which sentence belongs in an academic essay?', a: 'This paper examines the extent to which urban design influences public health outcomes.', pool: ['This paper gonna talk about cities and health stuff.', 'I will tell you what I think about cities.', 'Cities are like, really important, you know?', 'We gonna look at health in the city yeah.'] },
      { q: 'Choose the most idiomatic collocation.', a: 'The policy poses a threat to smaller businesses.', pool: ['The policy puts a threat to smaller businesses.', 'The policy makes a threat to smaller businesses.', 'The policy does a threat to smaller businesses.', 'The policy gives a threat to smaller businesses.'] },
      { q: 'You need to concede a point without abandoning your argument.', a: 'While the method has limitations, the overall pattern remains consistent.', pool: ['The method has limitations so my whole argument is dead.', 'Limitations whatever, I still win.', 'The method limitation but pattern consistent remaining.', 'While the method has limitations, but the pattern remains.'] },
      { q: 'Which option has the most precise hedging?', a: 'The findings appear to indicate a modest improvement.', pool: ['The findings totally prove everything forever.', 'The findings appear indicate modest improve.', 'The findings are prove a modest improvement.', 'The findings indicating modest improvement appear to.'] },
      { q: 'A client is unhappy. Choose the most professional reply.', a: 'Thank you for flagging this. I’ll look into the issue and get back to you by 3 p.m.', pool: ['Not my fault, talk to someone else.', 'Wow chill, it’s not that serious.', 'I’ll try maybe later if I remember.', 'You should have read the email.'] },
      { q: 'Choose the sentence with correct parallel structure.', a: 'The role requires analyzing data, presenting findings, and writing reports.', pool: ['The role requires analyzing data, to present findings, and write reports.', 'The role requires analyze data, presenting findings, and to write reports.', 'The role requires analyzing data, presenting findings, and to writing reports.', 'The role requires analyzing data, present findings, and wrote reports.'] },
    ]
    const sizes = spaceOk([NAMES.length, talks.length, COLLOCATIONS.length, FORMAL_INFORMAL.length], 10000)
    const [ni, ti, ci] = decodeIndex(local, sizes)
    const t = talks[ti]
    const passage = `${NAMES[ni]} is reviewing a draft that currently overuses “${FORMAL_INFORMAL[ci % FORMAL_INFORMAL.length].informal}” and misses the collocation ${COLLOCATIONS[ci].pair}.`
    return buildQuestion(6, id, 'Professional English', t.q, t.a, t.pool, seed, `The most proficient choice is: ${t.a}`, [], passage)
  }

  const local = id - 90000
  const words = [...COLLOCATIONS.map((x) => x.pair), ...ACADEMIC_PAIRS.map((x) => x.word), ...FORMAL_INFORMAL.map((x) => x.formal)]
  const sizes = spaceOk([words.length, NAMES.length, 8], 10000)
  const [wi, ni, vi] = decodeIndex(local, sizes)
  const word = words[wi]
  return buildQuestion(6, id, 'Accuracy', `Which form is standard in ${NAMES[ni]}’s final draft?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 5)), seed, `The standard form is ${word}.`)
}

const GENERATORS: Record<LevelId, (id: number, seed: number) => Question> = {
  1: genL1,
  2: genL2,
  3: genL3,
  4: genL4,
  5: genL5,
  6: genL6,
}

export function generateQuestion(level: LevelId, id: number): Question {
  const index = ((id % BANK_SIZE) + BANK_SIZE) % BANK_SIZE
  const seed = level * 1_000_003 + index * 97
  return GENERATORS[level](index, seed)
}

export function sampleQuestions(level: LevelId, count: number, startId = 0): Question[] {
  return Array.from({ length: count }, (_, i) => generateQuestion(level, startId + i))
}

export function randomQuestionId(level: LevelId, avoid = -1): number {
  const rand = mulberry32(Date.now() + level * 13)
  let next = Math.floor(rand() * BANK_SIZE)
  if (next === avoid) next = (next + 1) % BANK_SIZE
  return next
}
