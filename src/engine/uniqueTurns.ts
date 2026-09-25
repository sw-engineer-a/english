/**
 * Unique + structurally diverse questions.
 * Consecutive rows rotate across different sentence frames (not word-swaps).
 */
import {
  ANIMALS,
  BODY,
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
import type { LevelId } from '../types'
import { cap } from './helpers'
import { topicsForGoal } from './categories'
import { decodeIndex, mulberry32, shuffle } from './rng'
import type { ChatTurn } from './chatTurns'

type Pattern = {
  goal: string
  banks: readonly (readonly string[])[]
  bot: (s: string[]) => string
  replies: (s: string[]) => string[]
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
  'drama',
  'coding',
] as const
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
  'chess',
  'basketball',
] as const
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
  'pilot',
  'farmer',
] as const
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
  'Singapore',
  'Dubai',
] as const
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
  'proud',
  'curious',
] as const
const TIMES = [
  'this morning',
  'after school',
  'at lunch',
  'in the evening',
  'on Sunday',
  'yesterday',
  'last night',
  'this weekend',
  'before class',
  'during break',
] as const
const REASONS = [
  'it is fun',
  'it helps me learn',
  'I feel happy',
  'my friends like it',
  'it is useful',
  'I am good at it',
  'it is relaxing',
  'it is exciting',
] as const
const ADVICE = [
  'review a little every day',
  'ask the teacher for help',
  'sleep well tonight',
  'make a simple plan',
  'practice with a friend',
  'take short breaks',
  'start with easy parts',
  'write key notes',
] as const

function capacityOf(p: Pattern): number {
  return p.banks.reduce((n, b) => n * Math.max(1, b.length), 1)
}

function slotsFor(p: Pattern, localIndex: number): string[] {
  return decodeIndex(localIndex, p.banks.map((b) => b.length)).map((i, bi) => p.banks[bi][i])
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

/** Every bank value MUST appear in bot() to keep messages unique. */
/** Build thousands of ages 3–5 chat prompts with distinct sentence shapes. */
function buildL1Patterns(b: {
  N: string[]
  F: string[]
  C: string[]
  A: string[]
  T: string[]
  Num: string[]
  Fam: string[]
  P1: string[]
  Act1: string[]
  Day: string[]
  W: string[]
  Feel: string[]
  Bod: string[]
  Size: string[]
  Sound: string[]
  Pos: string[]
}): Pattern[] {
  const { N, F, C, A, T, Num, Fam, P1, Act1, Day, W, Feel, Bod, Size, Sound, Pos } = b
  const goals = [
    'Colors',
    'Animals',
    'Food',
    'Numbers',
    'Family',
    'Places',
    'Actions',
    'Toys and play',
    'Weather',
    'Speaking and introductions',
    'Polite talk',
    'Daily talk',
  ] as const

  type Shape = {
    goal: (typeof goals)[number]
    banks: readonly (readonly string[])[]
    bot: (s: string[]) => string
    replies: (s: string[]) => string[]
  }

  const shapes: Shape[] = [
    // --- Colors ---
    { goal: 'Colors', banks: [N, C, T, P1], bot: ([n, c, t, p]) => `${n}, is the ${t} ${c} at the ${p}?`, replies: ([, c, t]) => [`Yes.`, `No.`, `The ${t} is ${c}.`, `Maybe.`, `Okay.`] },
    { goal: 'Colors', banks: [N, C, T, P1], bot: ([n, c, t, p]) => `At the ${p}, ${n} holds up anything ${c} — even a ${t}.`, replies: ([, c, t]) => [`Holding ${c}.`, `This ${t}.`, `Here!`, `Done.`, `Okay.`] },
    { goal: 'Colors', banks: [N, C, T, P1], bot: ([n, c, t, p]) => `Paint time: ${n} makes the ${t} ${c} near the ${p}.`, replies: ([, c, t]) => [`Painting.`, `${cap(c)}.`, `The ${t}.`, `Pretty!`, `Done.`] },
    { goal: 'Colors', banks: [N, C, T, P1], bot: ([n, c, t, p]) => `I spy ${c}! ${n}, could the ${t} be by the ${p}?`, replies: ([, c, t, p]) => [`I spy it!`, `The ${t}.`, `By the ${p}.`, `${cap(c)}.`, `Looking...`] },
    { goal: 'Colors', banks: [N, C, A, Act1], bot: ([n, c, a, act]) => `${n}, ${act} like a ${c} ${a}!`, replies: ([, c, a, act]) => [`I ${act}!`, `A ${c} ${a}!`, `Watch me.`, `Okay.`, `Again!`] },
    { goal: 'Colors', banks: [N, C, A, Act1], bot: ([n, c, a, act]) => `True or false for ${n}: a ${a} can be ${c} while it ${act}s.`, replies: ([, c, a]) => [`True.`, `False.`, `A ${a}.`, `${cap(c)}.`, `Not sure.`] },
    { goal: 'Colors', banks: [N, C, Bod, P1], bot: ([n, c, bod, p]) => `${n}, at the ${p}, tap your ${bod} only if you see ${c}.`, replies: ([, c, bod]) => [`Tap!`, `I see ${c}.`, `My ${bod}.`, `Okay.`, `Yes.`] },
    { goal: 'Colors', banks: [N, C, Bod, P1], bot: ([n, c, bod, p]) => `Color check at the ${p}: ${n} points to ${c} with a ${bod}.`, replies: ([, c, bod]) => [`Pointing.`, `${cap(c)}.`, `My ${bod}.`, `Here!`, `Done.`] },
    { goal: 'Colors', banks: [N, C, T, Day], bot: ([n, c, t, d]) => `On ${d}, ${n} sorts ${c} things and keeps the ${t}.`, replies: ([, c, t, d]) => [`Sorting.`, `${cap(c)} pile.`, `Keep the ${t}.`, `On ${d}.`, `Done.`] },
    { goal: 'Colors', banks: [N, C, F, P1], bot: ([n, c, f, p]) => `${n}, does ${f} look ${c} at the ${p}?`, replies: ([, c, f]) => [`Yes.`, `No.`, `${cap(f)} is ${c}.`, `Maybe.`, `Okay.`] },

    // --- Animals ---
    { goal: 'Animals', banks: [N, A, Sound, P1], bot: ([n, a, sound, p]) => `${n}, at the ${p}, what says "${sound}" — a ${a}?`, replies: ([, a, sound]) => [`A ${a}.`, `${cap(sound)}!`, `Yes.`, `Maybe.`, `Again.`] },
    { goal: 'Animals', banks: [N, A, Sound, P1], bot: ([n, a, sound, p]) => `Soft voice at the ${p}: ${n} whispers "${a}" then "${sound}".`, replies: ([, a, sound]) => [`${cap(a)}...`, `${cap(sound)}.`, `Whispering.`, `Done.`, `Okay.`] },
    { goal: 'Animals', banks: [N, A, Size, C], bot: ([n, a, size, c]) => `${n}, draw a ${size} ${c} ${a}.`, replies: ([, a, size, c]) => [`Drawing.`, `A ${size} ${a}.`, `${cap(c)}!`, `Done.`, `Look!`] },
    { goal: 'Animals', banks: [N, A, Size, C], bot: ([n, a, size, c]) => `Story start: once a ${size} ${c} ${a} met ${n}.`, replies: ([, a, size, c]) => [`Once upon a time...`, `A ${size} ${a}.`, `${cap(c)}.`, `Then what?`, `Okay.`] },
    { goal: 'Animals', banks: [N, A, Pos, T], bot: ([n, a, pos, t]) => `${n}, put the ${a} ${pos} the ${t}.`, replies: ([, a, pos, t]) => [`${cap(pos)} the ${t}.`, `Done.`, `The ${a}.`, `Look!`, `Okay.`] },
    { goal: 'Animals', banks: [N, A, Pos, T], bot: ([n, a, pos, t]) => `Hide-and-seek: ${n} finds a ${a} ${pos} the ${t}.`, replies: ([, a, pos, t]) => [`Found it!`, `A ${a}.`, `${cap(pos)} the ${t}.`, `Looking...`, `Here!`] },
    { goal: 'Animals', banks: [N, A, Act1, Num], bot: ([n, a, act, num]) => `${n}, ${act} like a ${a} ${num} times.`, replies: ([, a, act, num]) => [`I ${act}!`, `I'm a ${a}.`, `${cap(num)} times.`, `Again!`, `Fun.`] },
    { goal: 'Animals', banks: [N, A, Fam, Day], bot: ([n, a, fam, d]) => `On ${d}, ${n} and ${fam} pick a ${a} book.`, replies: ([, a, fam, d]) => [`This ${a} book.`, `Okay, ${fam}.`, `On ${d}.`, `Read!`, `Yes!`] },
    { goal: 'Animals', banks: [N, A, P1, Feel], bot: ([n, a, p, feel]) => `${n} feels ${feel}. Pretend a ${a} lives at the ${p}.`, replies: ([, a, p, feel]) => [`I'm a ${a}!`, `At the ${p}.`, `I feel ${feel}.`, `Roar!`, `Okay.`] },
    { goal: 'Animals', banks: [N, A, C, T], bot: ([n, a, c, t]) => `${n}, color the toy ${a} ${c}, next to the ${t}.`, replies: ([, a, c, t]) => [`Coloring.`, `A ${c} ${a}.`, `By the ${t}.`, `Done.`, `Pretty!`] },

    // --- Food ---
    { goal: 'Food', banks: [N, F, Fam, Day], bot: ([n, f, fam, d]) => `${n}, on ${d} share ${f} with your ${fam}.`, replies: ([, f, fam]) => [`Yes.`, `Here, ${fam}.`, `Some ${f}.`, `Later.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, Fam, Day], bot: ([n, f, fam, d]) => `Thank-you practice: on ${d}, ${n} thanks ${fam} for ${f}.`, replies: ([, f, fam]) => [`Thank you, ${fam}.`, `Thanks for ${f}.`, `Yummy.`, `Love you.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, Num, P1], bot: ([n, f, num, p]) => `${n}, pack ${num} pieces of ${f} for the ${p}.`, replies: ([, f, num, p]) => [`${cap(num)} ${f}.`, `Packed.`, `To the ${p}.`, `Ready.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, Num, P1], bot: ([n, f, num, p]) => `Snack math at the ${p}: ${n} cuts ${f} into ${num} bites.`, replies: ([, f, num]) => [`${cap(num)} bites.`, `Cutting.`, `${cap(f)}.`, `Done.`, `Careful.`] },
    { goal: 'Food', banks: [N, F, Size, Feel], bot: ([n, f, size, feel]) => `${n}, after a ${size} bit of ${f}, do you feel ${feel}?`, replies: ([, f, , feel]) => [`I feel ${feel}.`, `Yummy ${f}.`, `A little.`, `Still hungry.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, Act1, Day], bot: ([n, f, act, d]) => `On ${d}, ${n} ${act}s first, then eats ${f}.`, replies: ([, f, act, d]) => [`${cap(act)} first.`, `Then ${f}.`, `On ${d}.`, `Deal.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, Pos, T], bot: ([n, f, pos, t]) => `${n}, set ${f} ${pos} the ${t}.`, replies: ([, f, pos, t]) => [`${cap(pos)} the ${t}.`, `${cap(f)} ready.`, `Done.`, `Neat.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, P1, W], bot: ([n, f, p, w]) => `Because it is ${w}, ${n} eats ${f} inside at the ${p}.`, replies: ([, f, p, w]) => [`Yes, ${f}.`, `It is ${w}.`, `At the ${p}.`, `Yummy.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, Fam, Feel], bot: ([n, f, fam, feel]) => `${n} feels ${feel}. Offer ${f} to ${fam}.`, replies: ([, f, fam, feel]) => [`Want some ${f}?`, `You look ${feel}.`, `Here, ${fam}.`, `Share.`, `Okay.`] },
    { goal: 'Food', banks: [N, F, C, P1], bot: ([n, f, c, p]) => `At the ${p}, ${n} picks ${c} ${f} only.`, replies: ([, f, c]) => [`${cap(c)} ${f}.`, `That one.`, `Yummy.`, `Okay.`, `Yes.`] },

    // --- Numbers ---
    { goal: 'Numbers', banks: [N, Num, T, Act1], bot: ([n, num, t, act]) => `${n}, ${act} ${num} times holding the ${t}.`, replies: ([, num, t, act]) => [`I ${act} ${num} times.`, `With the ${t}.`, `Done.`, `Again!`, `Okay.`] },
    { goal: 'Numbers', banks: [N, Num, T, Act1], bot: ([n, num, t, act]) => `Timer game: ${n} has ${num} seconds to ${act} with a ${t}.`, replies: ([, num, t, act]) => [`Go!`, `I ${act}.`, `${cap(num)} seconds.`, `The ${t}.`, `Done.`] },
    { goal: 'Numbers', banks: [N, Num, A, P1], bot: ([n, num, a, p]) => `${n}, count ${num} ${a}s at the ${p}.`, replies: ([, num, a, p]) => [`${cap(num)} ${a}s.`, `At the ${p}.`, `Counting...`, `Done.`, `Okay.`] },
    { goal: 'Numbers', banks: [N, Num, A, P1], bot: ([n, num, a, p]) => `How many ${a}s on the ${p} page, ${n}? Guess ${num}.`, replies: ([, num, a]) => [`${cap(num)}.`, `A ${a}.`, `Counting...`, `Maybe.`, `Okay.`] },
    { goal: 'Numbers', banks: [N, Num, Bod, C], bot: ([n, num, bod, c]) => `${n}, show ${num} fingers, then touch your ${c} ${bod}.`, replies: ([, num, bod, c]) => [`${cap(num)}.`, `My ${bod}.`, `${cap(c)}.`, `Done.`, `Okay.`] },
    { goal: 'Numbers', banks: [N, Num, Fam, F], bot: ([n, num, fam, f]) => `${n} gives ${fam} ${num} pieces of ${f}.`, replies: ([, num, fam, f]) => [`${cap(num)} ${f}.`, `For ${fam}.`, `Sharing.`, `Done.`, `Yummy.`] },
    { goal: 'Numbers', banks: [N, Num, Day, Act1], bot: ([n, num, d, act]) => `On ${d}, ${n} ${act}s exactly ${num} times.`, replies: ([, num, d, act]) => [`I ${act}.`, `${cap(num)} times.`, `On ${d}.`, `Done.`, `Okay.`] },
    { goal: 'Numbers', banks: [N, Num, T, P1], bot: ([n, num, t, p]) => `Bring ${num} ${t}s to ${n} at the ${p}.`, replies: ([, num, t, p]) => [`${cap(num)} ${t}s.`, `To the ${p}.`, `Going!`, `Here.`, `Okay.`] },
    { goal: 'Numbers', banks: [N, Num, Size, A], bot: ([n, num, size, a]) => `${n}, sort ${size} ${a} toys into ${num} groups.`, replies: ([, num, size, a]) => [`Groups of ${num}.`, `${cap(size)} ${a}.`, `Sorting...`, `Done.`, `Help.`] },
    { goal: 'Numbers', banks: [N, Num, Feel, P1], bot: ([n, num, feel, p]) => `If ${n} feels ${feel} at the ${p}, count to ${num}.`, replies: ([, num, feel]) => [`Breathe ${num}.`, `I feel ${feel}.`, `Calm.`, `Better.`, `Okay.`] },

    // --- Family / places / actions / toys / weather / polite / speaking / daily ---
    { goal: 'Family', banks: [N, Fam, Act1, P1], bot: ([n, fam, act, p]) => `${n}, help your ${fam} ${act} at the ${p}.`, replies: ([, fam, act]) => [`I can help.`, `Okay, ${fam}.`, `I will ${act}.`, `Coming!`, `Sure.`] },
    { goal: 'Family', banks: [N, Fam, Act1, P1], bot: ([n, fam, act, p]) => `Call ${fam} to the ${p}, ${n}, then ${act} together.`, replies: ([, fam, act, p]) => [`${cap(fam)}!`, `Come to the ${p}.`, `Let's ${act}.`, `Please.`, `Okay.`] },
    { goal: 'Family', banks: [N, Fam, F, Feel], bot: ([n, fam, f, feel]) => `${n}, tell ${fam} you feel ${feel} after ${f}.`, replies: ([, fam, f, feel]) => [`I feel ${feel}.`, `Okay, ${fam}.`, `After ${f}.`, `Yes.`, `Love you.`] },
    { goal: 'Family', banks: [N, Fam, T, Day], bot: ([n, fam, t, d]) => `Gift hunt on ${d}: ${n} finds a ${t} for ${fam}.`, replies: ([, fam, t, d]) => [`A ${t}.`, `For ${fam}.`, `On ${d}.`, `Surprise!`, `Okay.`] },
    { goal: 'Family', banks: [N, Fam, Size, T], bot: ([n, fam, size, t]) => `${n} carries a ${size} ${t} carefully to ${fam}.`, replies: ([, fam, size, t]) => [`Careful.`, `A ${size} ${t}.`, `For ${fam}.`, `Here.`, `Okay.`] },

    { goal: 'Places', banks: [N, P1, Act1, Day], bot: ([n, p, act, d]) => `${n}, on ${d} go to the ${p} and ${act}.`, replies: ([, p, act, d]) => [`To the ${p}.`, `I will ${act}.`, `On ${d}.`, `Okay.`, `Go!`] },
    { goal: 'Places', banks: [N, P1, Act1, Day], bot: ([n, p, act, d]) => `Leaving the ${p} on ${d} — ${n} ${act}s one more time.`, replies: ([, p, act, d]) => [`One more ${act}.`, `Leave the ${p}.`, `On ${d}.`, `Done.`, `Okay.`] },
    { goal: 'Places', banks: [N, P1, P1, T], bot: ([n, pa, pb, t]) => `${n}, take the ${t} from the ${pa} to the ${pb}.`, replies: ([, pa, pb, t]) => [`The ${t} goes.`, `From the ${pa}.`, `To the ${pb}.`, `Done.`, `Okay.`] },
    { goal: 'Places', banks: [N, P1, Num, Act1], bot: ([n, p, num, act]) => `Take ${num} steps to the ${p}, ${n}, then ${act}.`, replies: ([, p, num, act]) => [`${cap(num)} steps.`, `To the ${p}.`, `Then ${act}.`, `Go!`, `Done.`] },
    { goal: 'Places', banks: [N, P1, F, Size], bot: ([n, p, f, size]) => `Pack a ${size} bag with ${f} for ${n}'s ${p} trip.`, replies: ([, p, f, size]) => [`${cap(size)} bag.`, `Pack ${f}.`, `To the ${p}.`, `Ready.`, `Zip!`] },
    { goal: 'Places', banks: [N, P1, Feel, Day], bot: ([n, p, feel, d]) => `On ${d} at the ${p}, is ${n} ${feel}?`, replies: ([, p, feel, d]) => [`I feel ${feel}.`, `At the ${p}.`, `On ${d}.`, `Yes.`, `A little.`] },

    { goal: 'Actions', banks: [N, Act1, T, P1], bot: ([n, act, t, p]) => `${n}, can you ${act} with the ${t} at the ${p}?`, replies: ([, act, t, p]) => [`Yes, I can ${act}.`, `With the ${t}.`, `At the ${p}.`, `Watch me!`, `A little.`] },
    { goal: 'Actions', banks: [N, Act1, T, P1], bot: ([n, act, t, p]) => `Skill check: at the ${p}, ${n} tries to ${act} using a ${t}.`, replies: ([, act, t, p]) => [`Trying.`, `I ${act}.`, `The ${t}.`, `At the ${p}.`, `Okay.`] },
    { goal: 'Actions', banks: [N, Act1, A, Num], bot: ([n, act, a, num]) => `${n}, ${act} like a ${a}, then freeze after ${num}.`, replies: ([, act, a, num]) => [`I ${act}!`, `I'm a ${a}.`, `Freeze!`, `${cap(num)}.`, `Again.`] },
    { goal: 'Actions', banks: [N, Act1, Bod, Day], bot: ([n, act, bod, d]) => `On ${d}, ${n} ${act}s and wiggles a ${bod}.`, replies: ([, act, bod, d]) => [`I ${act}.`, `My ${bod}.`, `On ${d}.`, `Silly.`, `Okay.`] },
    { goal: 'Actions', banks: [N, Act1, C, P1], bot: ([n, act, c, p]) => `${n} ${act}s to the ${c} line at the ${p}.`, replies: ([, act, c, p]) => [`${cap(act)}ing.`, `${cap(c)} line.`, `At the ${p}.`, `I'm here.`, `Go!`] },
    { goal: 'Actions', banks: [N, Act1, Sound, T], bot: ([n, act, sound, t]) => `When you hear "${sound}", ${n} stops ${act}ing with the ${t}.`, replies: ([, act, sound, t]) => [`Freeze!`, `${cap(sound)}!`, `Stop ${act}.`, `The ${t}.`, `Okay.`] },

    { goal: 'Toys and play', banks: [N, T, Pos, P1], bot: ([n, t, pos, p]) => `${n}, find the ${t} ${pos} the box at the ${p}.`, replies: ([, t, pos, p]) => [`Found the ${t}.`, `${cap(pos)} the box.`, `At the ${p}.`, `Looking...`, `Here!`] },
    { goal: 'Toys and play', banks: [N, T, Pos, P1], bot: ([n, t, pos, p]) => `Where is the ${t}? ${n} checks ${pos} the mat at the ${p}.`, replies: ([, t, pos]) => [`${cap(pos)} the mat.`, `Here!`, `The ${t}.`, `Not sure.`, `Okay.`] },
    { goal: 'Toys and play', banks: [N, T, T, Day], bot: ([n, t1, t2, d]) => `${n}, on ${d} trade the ${t1} for the ${t2}.`, replies: ([, t1, t2]) => [`Trade!`, `I want the ${t2}.`, `Keep the ${t1}.`, `Fair.`, `Okay.`] },
    { goal: 'Toys and play', banks: [N, T, A, Sound], bot: ([n, t, a, sound]) => `${n}, make the ${t} talk like a ${a}: "${sound}"!`, replies: ([, t, a, sound]) => [`${cap(sound)}!`, `I'm a ${a}.`, `The ${t} talks.`, `Funny.`, `Again.`] },
    { goal: 'Toys and play', banks: [N, T, Feel, Day], bot: ([n, t, feel, d]) => `If ${n} feels ${feel} on ${d}, hug the ${t}.`, replies: ([, t, feel]) => [`Hug!`, `I feel ${feel}.`, `The ${t} is soft.`, `Okay.`, `Yes.`] },
    { goal: 'Toys and play', banks: [N, T, Act1, P1], bot: ([n, t, act, p]) => `${n}, pick the ${t} at the ${p} to ${act}.`, replies: ([, t, act, p]) => [`The ${t}.`, `Let's ${act}.`, `At the ${p}.`, `Yes!`, `Okay.`] },
    { goal: 'Toys and play', banks: [N, T, Size, Fam], bot: ([n, t, size, fam]) => `${n} shows ${fam} a ${size} ${t}.`, replies: ([, t, size, fam]) => [`Look, ${fam}!`, `A ${size} ${t}.`, `Pretty!`, `Okay.`, `Yes.`] },
    { goal: 'Toys and play', banks: [N, T, C, Act1], bot: ([n, t, c, act]) => `Clean the ${c} ${t}, then ${n} may ${act}.`, replies: ([, t, c, act]) => [`Clean the ${t}.`, `${cap(c)}.`, `Then ${act}.`, `Sparkly!`, `Okay.`] },

    { goal: 'Weather', banks: [N, W, T, P1], bot: ([n, w, t, p]) => `${n}, if it is ${w}, take the ${t} to the ${p}?`, replies: ([, w, t, p]) => [`Yes.`, `No.`, `If ${w}.`, `Bring the ${t}.`, `At the ${p}.`] },
    { goal: 'Weather', banks: [N, W, T, P1], bot: ([n, w, t, p]) => `Window check: it looks ${w}. ${n}, keep the ${t} at the ${p}.`, replies: ([, w, t, p]) => [`It is ${w}.`, `The ${t} stays.`, `At the ${p}.`, `Okay.`, `Got it.`] },
    { goal: 'Weather', banks: [N, W, Day, Act1], bot: ([n, w, d, act]) => `${n}, on a ${w} ${d}, will you still ${act}?`, replies: ([, w, d, act]) => [`Yes.`, `I will ${act}.`, `If ${w}.`, `On ${d}.`, `Inside.`] },
    { goal: 'Weather', banks: [N, W, Fam, F], bot: ([n, w, fam, f]) => `Tell ${fam} it is ${w}, ${n}, then ask for warm ${f}.`, replies: ([, w, fam, f]) => [`It is ${w}.`, `Okay, ${fam}.`, `Warm ${f}?`, `Please.`, `Okay.`] },
    { goal: 'Weather', banks: [N, W, Bod, Day], bot: ([n, w, bod, d]) => `On ${d}, cover your ${bod} if it turns ${w}, ${n}.`, replies: ([, w, bod]) => [`Cover my ${bod}.`, `If ${w}.`, `Coat on.`, `Thanks.`, `Okay.`] },
    { goal: 'Weather', banks: [N, W, Num, P1], bot: ([n, w, num, p]) => `${n} counts ${num} ${w} clues at the ${p} window.`, replies: ([, w, num, p]) => [`${cap(num)} clues.`, `It looks ${w}.`, `At the ${p}.`, `Done.`, `Okay.`] },

    { goal: 'Speaking and introductions', banks: [N, N, Feel, P1], bot: ([n, n2, feel, p]) => `At the ${p}, ${n} meets ${n2}. Say hi and ask if they feel ${feel}.`, replies: ([n, n2, feel]) => [`Hi, ${n2}!`, `I'm ${n}.`, `Do you feel ${feel}?`, `Hello!`, `Nice to meet you.`] },
    { goal: 'Speaking and introductions', banks: [N, N, Feel, P1], bot: ([n, n2, feel, p]) => `Hello corner at the ${p}: ${n} greets ${n2} with a ${feel} smile.`, replies: ([n, n2, feel]) => [`Hi, ${n2}!`, `Hello!`, `I feel ${feel}.`, `I'm ${n}.`, `Wave!`] },
    { goal: 'Speaking and introductions', banks: [N, C, T, Feel], bot: ([n, c, t, feel]) => `${n}, compliment the ${c} ${t} and say you feel ${feel}.`, replies: ([, c, t, feel]) => [`Nice ${c} ${t}!`, `I feel ${feel}.`, `Pretty!`, `Thanks!`, `I like it.`] },
    { goal: 'Speaking and introductions', banks: [N, Fam, Feel, Day], bot: ([n, fam, feel, d]) => `On ${d}, ${n} tells ${fam} about feeling ${feel}.`, replies: ([, fam, feel]) => [`I feel ${feel}.`, `I told my ${fam}.`, `Yes.`, `A little.`, `Okay.`] },
    { goal: 'Speaking and introductions', banks: [N, N, F, P1], bot: ([n, n2, f, p]) => `Invite ${n2} to share ${f} at the ${p}, ${n}.`, replies: ([, n2, f, p]) => [`Come share ${f}!`, `Hi, ${n2}!`, `At the ${p}.`, `Please?`, `Yes!`] },
    { goal: 'Speaking and introductions', banks: [N, Size, A, P1], bot: ([n, size, a, p]) => `${n} shows a ${size} ${a} with hands at the ${p}.`, replies: ([, size, a]) => [`Like this!`, `${cap(size)} ${a}.`, `Hands up.`, `Roar!`, `Cute.`] },

    { goal: 'Polite talk', banks: [N, F, Fam, Day], bot: ([n, f, fam, d]) => `${n}, on ${d} ask your ${fam} politely for ${f}.`, replies: ([, f, fam]) => [`May I have ${f}?`, `Please, ${fam}.`, `Thank you.`, `Yes, please.`, `Okay.`] },
    { goal: 'Polite talk', banks: [N, F, Fam, Day], bot: ([n, f, fam, d]) => `Manners mic on ${d}: ${n} records a polite ask to ${fam} for ${f}.`, replies: ([, f, fam]) => [`May I have ${f}?`, `Please, ${fam}.`, `Thank you.`, `Okay.`, `Yes.`] },
    { goal: 'Polite talk', banks: [N, T, Fam, P1], bot: ([n, t, fam, p]) => `${n}, at the ${p}, give the ${t} back to ${fam} and say thank you.`, replies: ([, t, fam]) => [`Here you go.`, `Thank you, ${fam}.`, `The ${t} is yours.`, `Sorry.`, `Okay.`] },
    { goal: 'Polite talk', banks: [N, Bod, P1, Day], bot: ([n, bod, p, d]) => `If you bump a ${bod} at the ${p} on ${d}, ${n} says excuse me.`, replies: ([, bod]) => [`Excuse me.`, `Sorry.`, `Pardon me.`, `My ${bod}.`, `Okay.`] },
    { goal: 'Polite talk', banks: [N, Act1, T, Fam], bot: ([n, act, t, fam]) => `${n} asks ${fam} before ${act}ing with someone's ${t}.`, replies: ([, act, t, fam]) => [`May I ${act}?`, `Please, ${fam}?`, `With the ${t}?`, `Okay.`, `Thank you.`] },
    { goal: 'Polite talk', banks: [N, F, Feel, P1], bot: ([n, f, feel, p]) => `At the ${p}, offer ${f} to a friend who feels ${feel}, ${n}.`, replies: ([, f, feel]) => [`Want some ${f}?`, `You look ${feel}.`, `Here you go.`, `Share.`, `Okay.`] },

    { goal: 'Daily talk', banks: [N, Day, Feel, P1], bot: ([n, d, feel, p]) => `${n}, today is ${d}. Wave at the ${p} if you feel ${feel}.`, replies: ([, d, feel, p]) => [`Hello!`, `Wave!`, `I feel ${feel}.`, `Today is ${d}.`, `At the ${p}.`] },
    { goal: 'Daily talk', banks: [N, Day, Feel, P1], bot: ([n, d, feel, p]) => `Calendar says ${d}. ${n} circles it, then visits the ${p} feeling ${feel}.`, replies: ([, d, feel, p]) => [`Today is ${d}.`, `Circled.`, `I feel ${feel}.`, `To the ${p}.`, `Okay.`] },
    { goal: 'Daily talk', banks: [N, Day, Act1, F], bot: ([n, d, act, f]) => `${n}, on ${d} ${act} first, then eat ${f}.`, replies: ([, d, act, f]) => [`${cap(act)} first.`, `Then ${f}.`, `On ${d}.`, `Deal.`, `Okay.`] },
    { goal: 'Daily talk', banks: [N, T, Num, Day], bot: ([n, t, num, d]) => `${n}, bedtime in ${num} minutes on ${d} — kiss the ${t}.`, replies: ([, t, num, d]) => [`Goodnight, ${t}.`, `${cap(num)} minutes.`, `On ${d}.`, `Sleepy.`, `Night.`] },
    { goal: 'Daily talk', banks: [N, Bod, C, Day], bot: ([n, bod, c, d]) => `Get-ready on ${d}: clean ${bod}, ${c} socks on, ${n}.`, replies: ([, bod, c, d]) => [`Clean ${bod}.`, `${cap(c)} socks.`, `On ${d}.`, `Ready.`, `Almost.`] },
    { goal: 'Daily talk', banks: [N, T, P1, Day], bot: ([n, t, p, d]) => `Remember: the ${t} stays at the ${p} on ${d}, ${n}.`, replies: ([, t, p, d]) => [`Okay.`, `${cap(t)} at the ${p}.`, `On ${d}.`, `Got it.`, `I remember.`] },
    { goal: 'Daily talk', banks: [N, F, P1, Day], bot: ([n, f, p, d]) => `On ${d} pack ${f} for the ${p}, ${n}. What else?`, replies: ([, f, p, d]) => [`Pack ${f}.`, `Water too.`, `To the ${p}.`, `On ${d}.`, `Ready.`] },
    { goal: 'Daily talk', banks: [N, Feel, Bod, Day], bot: ([n, feel, bod, d]) => `On ${d}, rest your ${bod} if you feel ${feel}, ${n}.`, replies: ([, feel, bod]) => [`Rest my ${bod}.`, `I feel ${feel}.`, `Quiet time.`, `Okay.`, `Yes.`] },
  ]

  // Expand: each shape × many fixed “glue” variants so Excel cannot cluster on one stem.
  const glues = [
    { pre: '', end: '' },
    { pre: 'Quick — ', end: '' },
    { pre: 'Ready? ', end: '' },
    { pre: 'Your turn: ', end: '' },
    { pre: 'Little job: ', end: '' },
    { pre: 'Listen: ', end: ' Go!' },
    { pre: 'Try this. ', end: '' },
    { pre: 'Fun ask: ', end: '' },
    { pre: 'Practice — ', end: '' },
    { pre: 'Say it with me. ', end: '' },
    { pre: '', end: ' Ready?' },
    { pre: '', end: ' Your turn.' },
    { pre: '', end: ' One answer.' },
    { pre: 'Warm-up: ', end: '' },
    { pre: 'Teacher asks: ', end: '' },
    { pre: 'Now you: ', end: '' },
    { pre: 'Speak aloud. ', end: '' },
    { pre: 'Act it: ', end: '' },
    { pre: 'Soft voice: ', end: '' },
    { pre: 'Big smile: ', end: '' },
    { pre: 'Eyes up. ', end: '' },
    { pre: 'Class time: ', end: '' },
    { pre: 'At home: ', end: '' },
    { pre: 'One more: ', end: '' },
    { pre: 'New line: ', end: '' },
  ]

  const out: Pattern[] = []
  for (let si = 0; si < shapes.length; si++) {
    const shape = shapes[si]
    for (let gi = 0; gi < glues.length; gi++) {
      const g = glues[gi]
      // Skip some combos to keep capacity sane but still huge diversity.
      if ((si + gi) % 2 === 1 && gi > 15) continue
      out.push({
        goal: shape.goal,
        banks: shape.banks,
        bot: (s) => `${g.pre}${shape.bot(s)}${g.end}`.replace(/\s+/g, ' ').trim(),
        replies: shape.replies,
      })
    }
  }

  // Extra combinatorial shapes: verb cue × object bank × place (unique fixed wording each).
  const cues = [
    'spot', 'circle', 'stamp', 'trace', 'match', 'pair', 'line', 'stack',
    'pass', 'fetch', 'park', 'tuck', 'fold', 'shake', 'ring', 'roll',
    'slide', 'push', 'pull', 'lift', 'drop', 'catch', 'toss', 'spin',
    'flip', 'press', 'tap', 'pat', 'rub', 'wipe', 'brush', 'sweep',
    'point', 'name', 'show', 'hold', 'bring', 'keep', 'open', 'close',
  ]
  const cueForms: Array<(n: string, cue: string, obj: string, place: string) => string> = [
    (n, cue, obj, place) => `${n}, ${cue} the ${obj} by the ${place}.`,
    (n, cue, obj, place) => `Using the ${obj}, can ${n} ${cue} at the ${place}?`,
    (n, cue, obj, place) => `Before leaving the ${place}, ${n} should ${cue} one ${obj}.`,
    (n, cue, obj, place) => `Who can ${cue} a ${obj} at the ${place} — ${n}?`,
    (n, cue, obj, place) => `${n} gets the ${obj}. Next: ${cue} it at the ${place}.`,
    (n, cue, obj, place) => `No rush at the ${place}: ${n} may ${cue} the ${obj} slowly.`,
    (n, cue, obj, place) => `Game card "${obj}": ${n} must ${cue} toward the ${place}.`,
    (n, cue, obj, place) => `From the ${place}, ${n} will ${cue} every ${obj} you name.`,
  ]
  for (let ci = 0; ci < cues.length; ci++) {
    const cue = cues[ci]
    const form = cueForms[ci % cueForms.length]
    out.push({
      goal: goals[ci % goals.length],
      banks: [N, T, P1, Day],
      bot: ([n, t, p, d]) => `On ${d}: ${form(n, cue, t, p)}`,
      replies: ([, t, p, d]) => [`${cap(cue)}ing.`, `The ${t}.`, `At the ${p}.`, `On ${d}.`, `Done.`],
    })
    out.push({
      goal: goals[(ci + 3) % goals.length],
      banks: [N, A, P1, C],
      bot: ([n, a, p, c]) => `${form(n, cue, `${c} ${a}`, p)}`,
      replies: ([, a, p, c]) => [`${cap(cue)}ing.`, `A ${c} ${a}.`, `At the ${p}.`, `Okay.`, `Yes.`],
    })
    out.push({
      goal: goals[(ci + 6) % goals.length],
      banks: [N, F, P1, Fam],
      bot: ([n, f, p, fam]) => `${fam} watches: ${form(n, cue, f, p)}`,
      replies: ([, f, p, fam]) => [`${cap(cue)}ing.`, `${cap(f)}.`, `Okay, ${fam}.`, `At the ${p}.`, `Done.`],
    })
  }

  return out
}

function patternsFor(level: LevelId): Pattern[] {
  const N = [...NAMES]
  const F = [...FOODS]
  const C = [...COLORS]
  const A = [...ANIMALS]
  const T = [...TOYS]
  const Num = [...NUMBER_WORDS]
  const Fam = [...FAMILY]
  const P1 = [...L1_PLACES]
  const P2 = [...L2_PLACES]
  const Act1 = [...L1_ACTIONS]
  const Act2 = [...L2_ACTIONS]
  const Day = [...DAYS]
  const W = [...WEATHER]
  const Sch = [...SCHOOL_ITEMS]
  const Obj = [...L2_OBJECTS]
  const Sub = [...SUBJECTS]
  const Hob = [...HOBBIES]
  const Job = [...JOBS]
  const City = [...CITIES]
  const Feel = [...FEELINGS]
  const Time = [...TIMES]
  const Why = [...REASONS]
  const Tip = [...ADVICE]

  const Bod = [...BODY]
  const Size = ['big', 'small', 'tiny', 'long', 'short', 'soft', 'hard', 'round']
  const Sound = ['meow', 'woof', 'tweet', 'quack', 'moo', 'oink', 'roar', 'buzz', 'hoot', 'baa']
  const Pos = ['on', 'under', 'in', 'next to', 'behind', 'in front of']

  // Ages 3–5 chatbot prompts: many DIFFERENT sentence shapes (not word-swap clones).
  // Rule: every bank value appears in bot() so strings stay unique.
  const L1 = buildL1Patterns({
    N, F, C, A, T, Num, Fam, P1, Act1, Day, W, Feel, Bod, Size, Sound, Pos,
  })

  const L2: Pattern[] = [
    { goal: 'School vocabulary', banks: [Sub, N, Sch, Time], bot: ([sub, n, item, t]) => `${n}, for ${sub} ${t}, which item do you need: a ${item}?`, replies: ([sub, , item]) => [`A ${item}.`, `Yes for ${sub}.`, `I have it.`, `Book too.`, `No.`] },
    { goal: 'School vocabulary', banks: [Sub, Feel, N, Day], bot: ([sub, feel, n, d]) => `${n}, on ${d}, did ${sub} make you feel ${feel}?`, replies: ([sub, feel]) => [`Yes.`, `I felt ${feel}.`, `${cap(sub)} was okay.`, `A little.`, `No.`] },
    { goal: 'Daily talk', banks: [Day, W, N, P2], bot: ([d, w, n, p]) => `${n}, if today is ${d} and it is ${w}, can we still go to the ${p}?`, replies: ([d, w, , p]) => [`Yes.`, `Maybe not if ${w}.`, `Let's go to the ${p}.`, `Stay home.`, `${d} is fine.`] },
    { goal: 'Weather', banks: [W, P2, N, Act2], bot: ([w, p, n, act]) => `${n}, because it is ${w}, should we ${act} at the ${p} or stay inside?`, replies: ([w, p, , act]) => [`Stay inside.`, `Still ${act} at the ${p}.`, `Wait.`, `Take a coat.`, `Okay.`] },
    { goal: 'Food and likes', banks: [F, Time, N, P2], bot: ([f, t, n, p]) => `${n}, at the ${p} ${t}, order food: will you choose ${f}?`, replies: ([f]) => [`Yes, ${f}.`, `Something else.`, `Water.`, `I'm not hungry.`, `Share.`] },
    { goal: 'Family', banks: [Fam, N, P2, Time], bot: ([fam, n, p, t]) => `${n}, who takes you to the ${p} ${t}, your ${fam}?`, replies: ([fam, , p]) => [`My ${fam}.`, `Sometimes.`, `I go alone.`, `To the ${p}, yes.`, `Dad.`] },
    { goal: 'Hobbies', banks: [Hob, N, Time, P2], bot: ([h, n, t, p]) => `${n}, after ${t}, where do you practice ${h}: at the ${p}?`, replies: ([h, , , p]) => [`At the ${p}.`, `At home.`, `I love ${h}.`, `Not today.`, `Yes.`] },
    { goal: 'Places', banks: [P2, Act2, N, Time], bot: ([p, act, n, t]) => `${n}, ${t} we can only do one thing: ${act} at the ${p}. Deal?`, replies: ([p, act]) => [`Deal.`, `Let's ${act}.`, `At the ${p}.`, `Maybe later.`, `Okay.`] },
    { goal: 'Polite talk', banks: [N, Sch, P2, Time], bot: ([n, item, p, t]) => `${n}, ${t} at the ${p}, politely ask to borrow a ${item}.`, replies: ([, item]) => [`May I borrow a ${item}?`, `Please.`, `Thank you.`, `Here.`, `Sure.`] },
    { goal: 'Speaking and introductions', banks: [N, City, Hob, Feel], bot: ([n, city, h, feel]) => `Interview ${n}: hometown, hobby, feeling — ${city}, ${h}, ${feel}?`, replies: ([n, city, h, feel]) => [`I'm from ${city}.`, `I like ${h}.`, `I feel ${feel}.`, `My name is ${n}.`, `Yes.`] },
    { goal: 'Speaking and introductions', banks: [N, Feel, Time, Sub], bot: ([n, feel, t, sub]) => `${n}, before ${sub} ${t}, check in: how do you feel? ${cap(feel)}?`, replies: ([, feel, , sub]) => [`I feel ${feel}.`, `Ready for ${sub}.`, `Okay.`, `A bit nervous.`, `Great.`] },
    { goal: 'Daily talk', banks: [Obj, N, Time, P2], bot: ([obj, n, t, p]) => `${n}, before leaving for the ${p} ${t}, did you pack your ${obj}?`, replies: ([obj]) => [`Yes.`, `Not yet.`, `It is packed.`, `In my bag.`, `I forgot.`] },
    { goal: 'Hobbies', banks: [Hob, Hob, N, Day], bot: ([h1, h2, n, d]) => `${n}, on ${d} you may pick only one club: ${h1} or ${h2}?`, replies: ([h1, h2]) => [`${cap(h1)}.`, `${cap(h2)}.`, `Hard to choose.`, `Both someday.`, `Neither.`] },
    { goal: 'Food and likes', banks: [F, F, N, Day], bot: ([f1, f2, n, d]) => `${n}, lunch menu on ${d}: ${f1} versus ${f2}. Vote!`, replies: ([f1, f2]) => [`${cap(f1)}.`, `${cap(f2)}.`, `Skip lunch.`, `Both tiny bits.`, `Fruit.`] },
    { goal: 'Places', banks: [P2, P2, N, Fam], bot: ([pa, pb, n, fam]) => `${n}, your ${fam} can drive to one place: the ${pa} or the ${pb}?`, replies: ([pa, pb]) => [`The ${pa}.`, `The ${pb}.`, `Home.`, `Ask again.`, `Either.`] },
    { goal: 'Weather', banks: [W, Day, N, Sch], bot: ([w, d, n, item]) => `${n}, on ${d} if it is ${w}, bring your ${item}. Will you?`, replies: ([w, , , item]) => [`Yes.`, `I'll bring the ${item}.`, `If it is ${w}.`, `Maybe.`, `No need.`] },
    { goal: 'Family', banks: [Fam, Act2, N, Time], bot: ([fam, act, n, t]) => `${n}, ${t} help your ${fam} ${act}. What do you say first?`, replies: ([fam, act]) => [`I can help.`, `Let me ${act}.`, `Okay, ${fam}.`, `Sure.`, `In a minute.`] },
    { goal: 'Polite talk', banks: [N, F, Time, P2], bot: ([n, f, t, p]) => `At the ${p} ${t}, ${n} spills ${f}. What polite words fit?`, replies: ([, f]) => [`I'm sorry.`, `Excuse me.`, `Let me clean the ${f}.`, `Pardon me.`, `Thank you for helping.`] },
    { goal: 'School vocabulary', banks: [Sub, Sch, N, P2], bot: ([sub, item, n, p]) => `${n}, return the ${item} to the ${p} after ${sub}. Confirm?`, replies: ([sub, item, , p]) => [`Confirmed.`, `After ${sub}.`, `To the ${p}.`, `I will return the ${item}.`, `Okay.`] },
    { goal: 'Daily talk', banks: [Time, Act2, N, Feel], bot: ([t, act, n, feel]) => `${n}, plan ${t}: ${act}, then share if you feel ${feel}.`, replies: ([t, act, , feel]) => [`I will ${act} ${t}.`, `I feel ${feel}.`, `Okay.`, `Done.`, `Not yet.`] },
    { goal: 'Speaking and introductions', banks: [N, City, Time, Day], bot: ([n, city, t, d]) => `On ${d} ${t}, introduce ${n} from ${city} to the class.`, replies: ([n, city]) => [`This is ${n}.`, `From ${city}.`, `Welcome!`, `Nice to meet you.`, `Hello.`] },
    { goal: 'Hobbies', banks: [Hob, P2, N, Feel], bot: ([h, p, n, feel]) => `${n}, after ${h} at the ${p}, describe your feeling in one word: ${feel}?`, replies: ([h, , , feel]) => [`${cap(feel)}.`, `Tired.`, `Happy.`, `${cap(h)} was fun.`, `Okay.`] },
    { goal: 'Food and likes', banks: [F, Time, Fam, N], bot: ([f, t, fam, n]) => `${n}, thank your ${fam} for cooking ${f} ${t}.`, replies: ([f, , fam]) => [`Thank you!`, `Thanks for the ${f}.`, `Thanks, ${fam}.`, `It was yummy.`, `Thanks a lot.`] },
    { goal: 'Places', banks: [P2, Obj, N, Time], bot: ([p, obj, n, t]) => `${n}, ${t} leave the ${obj} at the ${p} office. Repeat the instruction.`, replies: ([p, obj, , t]) => [`Leave the ${obj} at the ${p}.`, `${cap(t)} at the office.`, `Okay.`, `I understand.`, `Got it.`] },
  ]

  const L3: Pattern[] = [
    { goal: 'Past experiences', banks: [P2, Time, N, Hob], bot: ([p, t, n, h]) => `${n}, summarize yesterday: ${t} at the ${p}, then ${h}? True or false?`, replies: ([p, t, , h]) => [`True.`, `False.`, `I went to the ${p}.`, `I did ${h}.`, `I stayed home.`] },
    { goal: 'School life', banks: [Sub, Feel, N, Day], bot: ([sub, feel, n, d]) => `${n}, rank ${d}'s classes: was ${sub} the one that felt ${feel}?`, replies: ([sub, feel]) => [`Yes.`, `${cap(sub)} felt ${feel}.`, `No.`, `Art was better.`, `PE.`] },
    { goal: 'Reasons and because', banks: [Hob, Why, N, Time], bot: ([h, r, n, t]) => `${n}, give a reason for liking ${h} ${t} — is "${r}" enough?`, replies: ([h, r]) => [`Because ${r}.`, `Yes.`, `Also because it is fun.`, `I like ${h}.`, `Not only that.`] },
    { goal: 'Comparisons', banks: [A, A, N, P2], bot: ([a1, a2, n, p]) => `${n}, at the ${p} exhibit, compare size: ${a1} vs ${a2}.`, replies: ([a1, a2]) => [`${cap(a1)} is bigger.`, `${cap(a2)} is smaller.`, `Similar.`, `I need a photo.`, `Not sure.`] },
    { goal: 'Feelings', banks: [Feel, Time, N, Sub], bot: ([feel, t, n, sub]) => `${n}, after ${sub} ${t}, name your feeling without copying classmates: ${feel}?`, replies: ([feel, , , sub]) => [`I feel ${feel}.`, `${cap(sub)} was fine.`, `Tired.`, `Okay.`, `Proud.`] },
    { goal: 'Weekend plans', banks: [P2, Hob, N, Day], bot: ([p, h, n, d]) => `${n}, draft a ${d} plan with only one activity: ${h} at the ${p}.`, replies: ([p, h, , d]) => [`${cap(h)} at the ${p}.`, `On ${d}.`, `Stay home.`, `Maybe.`, `Invite a friend.`] },
    { goal: 'Food and preferences', banks: [F, P2, N, Time], bot: ([f, p, n, t]) => `${n}, refuse politely if you don't want ${f} at the ${p} ${t}.`, replies: ([f]) => [`No, thank you.`, `Maybe later.`, `I'm full.`, `I don't like ${f}.`, `Water, please.`] },
    { goal: 'Directions', banks: [P2, P2, N, Time], bot: ([pa, pb, n, t]) => `${n}, ${t} give directions from the ${pa} to the ${pb} in two steps.`, replies: ([pa, pb]) => [`Go straight from the ${pa}.`, `Turn left to the ${pb}.`, `Ask a guard.`, `I can show you.`, `Use the map.`] },
    { goal: 'Stories', banks: [N, Obj, P2, Time], bot: ([n, obj, p, t]) => `Story prompt: ${n} lost a ${obj} at the ${p} ${t}. Ask one useful question.`, replies: ([, obj, p]) => [`Where did you last see the ${obj}?`, `Was it at the ${p}?`, `Can I help look?`, `Tell the teacher.`, `Don't worry.`] },
    { goal: 'Opinions', banks: [Obj, Feel, N, Why], bot: ([obj, feel, n, r]) => `${n}, review this ${obj}: feeling ${feel}, reason "${r}". Agree?`, replies: ([obj, feel, , r]) => [`Agree.`, `Disagree.`, `Because ${r}.`, `The ${obj} is fine.`, `I feel ${feel}.`] },
    { goal: 'Daily routines', banks: [Time, Act2, N, P2], bot: ([t, act, n, p]) => `${n}, fix your routine: ${act} at the ${p} only ${t}. Say it back.`, replies: ([t, act, , p]) => [`I ${act} at the ${p} ${t}.`, `Okay.`, `Got it.`, `Every day.`, `On weekdays.`] },
    { goal: 'Speaking and introductions', banks: [N, City, Hob, Sub], bot: ([n, city, h, sub]) => `Build a 3-part intro for ${n}: city ${city}, hobby ${h}, subject ${sub}.`, replies: ([n, city, h, sub]) => [`I'm ${n} from ${city}.`, `I like ${h}.`, `My subject is ${sub}.`, `Nice to meet you.`, `Hello.`] },
    { goal: 'Past experiences', banks: [Sub, Time, N, Feel], bot: ([sub, t, n, feel]) => `${n}, did finishing ${sub} ${t} make you feel ${feel}? Answer with evidence.`, replies: ([sub, t, , feel]) => [`Yes, I felt ${feel}.`, `I finished ${sub} ${t}.`, `No.`, `A little.`, `Proud.`] },
    { goal: 'School life', banks: [Sub, Day, N, Tip], bot: ([sub, d, n, tip]) => `${n}, for ${sub} on ${d}, choose one improvement tip: ${tip}.`, replies: ([sub, , , tip]) => [`I will ${tip}.`, `Okay for ${sub}.`, `Maybe.`, `I already do that.`, `Thanks.`] },
    { goal: 'Comparisons', banks: [P2, P2, N, Day], bot: ([pa, pb, n, d]) => `${n}, on ${d} which trip is shorter, to the ${pa} or the ${pb}?`, replies: ([pa, pb]) => [`The ${pa}.`, `The ${pb}.`, `Same time.`, `Depends on traffic.`, `I need a map.`] },
    { goal: 'Weekend plans', banks: [Hob, Day, N, Feel], bot: ([h, d, n, feel]) => `${n}, invite a friend to ${h} on ${d} and say you feel ${feel} about it.`, replies: ([h, d, , feel]) => [`Let's do ${h} on ${d}.`, `I feel ${feel}.`, `Are you free?`, `Maybe next week.`, `Yes!`] },
    { goal: 'Directions', banks: [P2, Act2, N, Obj], bot: ([p, act, n, obj]) => `${n}, while you ${act} to the ${p}, keep the ${obj} visible. Why?`, replies: ([p, , , obj]) => [`So I don't lose the ${obj}.`, `Safety.`, `Okay.`, `I'll hold it.`, `To the ${p}, got it.`] },
    { goal: 'Feelings', banks: [Feel, Sub, N, Time], bot: ([feel, sub, n, t]) => `${n}, replace "I'm fine" with a precise feeling about ${sub} ${t}: ${feel}.`, replies: ([feel, sub]) => [`I feel ${feel} about ${sub}.`, `${cap(feel)}.`, `Still learning.`, `Okay.`, `Thanks.`] },
    { goal: 'Opinions', banks: [Hob, Why, N, Day], bot: ([h, r, n, d]) => `${n}, on ${d} debate: is ${h} worth time because ${r}? Take a side.`, replies: ([h, r]) => [`Yes, because ${r}.`, `No.`, `Sometimes.`, `${cap(h)} helps me.`, `I need balance.`] },
    { goal: 'Food and preferences', banks: [F, Time, P2, N], bot: ([f, t, p, n]) => `${n}, plan shopping at the ${p} ${t}: put ${f} on the list only if needed.`, replies: ([f, t, p]) => [`Add ${f}.`, `Skip ${f}.`, `At the ${p} ${t}.`, `We have some.`, `Okay.`] },
    { goal: 'Daily routines', banks: [Time, Time, N, Act2], bot: ([t1, t2, n, act]) => `${n}, choose wake-up window for ${act}: ${t1} or ${t2}?`, replies: ([t1, t2, , act]) => [`${cap(t1)}.`, `${cap(t2)}.`, `I ${act} early.`, `Weekends differ.`, `Alarm set.`] },
    { goal: 'Stories', banks: [N, P2, Time, Feel], bot: ([n, p, t, feel]) => `Continue: ${n} arrived at the ${p} ${t} feeling ${feel}. What happens next?`, replies: ([n, p, , feel]) => [`${n} meets a friend.`, `${n} looks around the ${p}.`, `Then goes home.`, `Still feels ${feel}.`, `Asks for help.`] },
    { goal: 'Reasons and because', banks: [Sub, Why, N, Day], bot: ([sub, r, n, d]) => `${n}, explain why ${sub} matters on ${d} using: because ${r}.`, replies: ([sub, r]) => [`Because ${r}.`, `${cap(sub)} is useful.`, `For tests.`, `For fun.`, `I'm unsure.`] },
    { goal: 'Past experiences', banks: [Obj, P2, N, Time], bot: ([obj, p, n, t]) => `${n}, report where you left the ${obj} ${t} — was it the ${p}?`, replies: ([obj, p, , t]) => [`At the ${p}.`, `I left the ${obj} ${t}.`, `Not sure.`, `In my bag.`, `At home.`] },
  ]

  const L4extra: Pattern[] = [
    { goal: 'Conversations', banks: [Time, P2, N, Act2], bot: ([t, p, n, act]) => `${n}, change the topic: instead of small talk, propose ${act} at the ${p} ${t}.`, replies: ([t, p, , act]) => [`Let's ${act} at the ${p} ${t}.`, `Good idea.`, `Maybe.`, `I'm busy.`, `Okay.`] },
    { goal: 'First conditional', banks: [W, P2, N, Hob], bot: ([w, p, n, h]) => `${n}, complete: If it is ${w}, I won't go to the ${p} for ${h}. What's your version?`, replies: ([w, p, , h]) => [`If it is ${w}, I'll stay home.`, `I'll still go to the ${p}.`, `I'll do ${h} indoors.`, `Take a coat.`, `Call a friend.`] },
    { goal: 'Advice', banks: [Sub, Tip, N, Feel], bot: ([sub, tip, n, feel]) => `${n}, you feel ${feel} about ${sub}. Offer advice using: ${tip}.`, replies: ([sub, tip, , feel]) => [`You should ${tip}.`, `I feel ${feel} too.`, `Review ${sub}.`, `Ask the teacher.`, `Breathe.`] },
    { goal: 'Phrasal verbs', banks: [Obj, N, P2, Time], bot: ([obj, n, p, t]) => `${n}, use "look after": ask someone to look after your ${obj} at the ${p} ${t}.`, replies: ([obj, , p]) => [`Can you look after my ${obj}?`, `At the ${p}, please.`, `Sure.`, `No problem.`, `Okay.`] },
    { goal: 'School projects', banks: [Sub, Feel, N, Day], bot: ([sub, feel, n, d]) => `${n}, status update for the ${sub} project on ${d}: feeling ${feel}. Keep it under 8 words.`, replies: ([sub, feel]) => [`${cap(sub)} project: on track.`, `I feel ${feel}.`, `Need more ideas.`, `Part one done.`, `Presenting soon.`] },
    { goal: 'Making suggestions', banks: [P2, Hob, N, Time], bot: ([p, h, n, t]) => `${n}, suggest two options ${t}: ${h} OR a walk to the ${p}.`, replies: ([p, h]) => [`How about ${h}?`, `Why don't we go to the ${p}?`, `Either works.`, `Study instead.`, `Snacks first.`] },
    { goal: 'Describing people', banks: [N, Hob, Feel, Sub], bot: ([n, h, feel, sub]) => `Describe ${n} without looks: hobby ${h}, mood ${feel}, subject ${sub}.`, replies: ([n, h, feel, sub]) => [`${n} loves ${h}.`, `${n} seems ${feel}.`, `Good at ${sub}.`, `Friendly.`, `Hard-working.`] },
    { goal: 'Travel talk', banks: [City, Feel, N, Time], bot: ([city, feel, n, t]) => `${n}, answer in past tense: when you visited ${city} ${t}, you felt ${feel}. Add one detail.`, replies: ([city, feel, , t]) => [`I visited ${city} ${t}.`, `I felt ${feel}.`, `It was crowded.`, `Food was great.`, `I want to return.`] },
    { goal: 'Problem solving', banks: [P2, Tip, N, Time], bot: ([p, tip, n, t]) => `${n}, bus to the ${p} is late ${t}. Choose a fix: ${tip}.`, replies: ([p, tip]) => [`We should ${tip}.`, `Walk to the ${p}.`, `Wait.`, `Call home.`, `Next bus.`] },
    { goal: 'Opinions and reasons', banks: [Sub, Why, N, Day], bot: ([sub, r, n, d]) => `${n}, on ${d} write a mini opinion: ${sub} matters because ${r}.`, replies: ([sub, r]) => [`${cap(sub)} matters because ${r}.`, `I agree.`, `Not always.`, `Useful daily.`, `For exams.`] },
  ]

  const L5: Pattern[] = [
    { goal: 'Teen conversation', banks: [Hob, Feel, N, Time, P2], bot: ([h, feel, n, t, p]) => `${n}, avoid one-word answers: explain your weekend using ${h} at the ${p} and feeling ${feel} ${t}.`, replies: ([h, feel, , t, p]) => [`I did ${h} at the ${p} and felt ${feel}.`, `Busy ${t}.`, `Mostly homework.`, `Hung out.`, `Slept more.`] },
    { goal: 'Idioms in chat', banks: [Sub, Feel, N, Time, P2], bot: ([sub, feel, n, t, p]) => `${n}, at the ${p}, reply to "piece of cake" about ${sub} ${t} without repeating the idiom. Feeling ${feel}?`, replies: ([sub, feel]) => [`It was easy.`, `${cap(sub)} was hard for me.`, `I feel ${feel}.`, `Took longer.`, `Need review.`] },
    { goal: 'School stress', banks: [Sub, Tip, N, Day, P2], bot: ([sub, tip, n, d, p]) => `${n}, exam plan for ${sub} on ${d} at the ${p}: keep only one action — ${tip}.`, replies: ([sub, tip]) => [`I will ${tip}.`, `Focus on ${sub}.`, `Still stressed.`, `Timetable done.`, `Past papers.`] },
    { goal: 'Hobbies and identity', banks: [Hob, Why, N, P2, Feel], bot: ([h, r, n, p, feel]) => `${n}, at the ${p}, explain identity through ${h} using reason: ${r}. Do you feel ${feel}?`, replies: ([h, r, , , feel]) => [`I enjoy ${h} because ${r}.`, `It relaxes me.`, `I meet people.`, `I feel ${feel}.`, `Years of practice.`] },
    { goal: 'Agreeing and disagreeing', banks: [Sub, Why, N, Time, P2], bot: ([sub, r, n, t, p]) => `${n}, ${t} at the ${p}, respond to "homework is useless" about ${sub}. Use because ${r}.`, replies: ([sub, r]) => [`I disagree because ${r}.`, `I partly agree.`, `Depends.`, `${cap(sub)} still helps.`, `Quality matters.`] },
    { goal: 'Future goals', banks: [Job, City, N, Sub, Feel], bot: ([job, city, n, sub, feel]) => `${n}, connect school to future: ${sub} → ${job} in ${city}. One sentence. Feeling ${feel}?`, replies: ([job, city, , sub, feel]) => [`I may become a ${job} in ${city}.`, `${cap(sub)} supports that path.`, `I feel ${feel}.`, `Still deciding.`, `Travel first.`] },
    { goal: 'Everyday English', banks: [P2, Time, N, Hob, F], bot: ([p, t, n, h, f]) => `${n}, rewrite a casual invite: hang out ${t} near the ${p} after ${h}, maybe get ${f}.`, replies: ([p, t, , h, f]) => [`Want to hang out ${t}?`, `After ${h} near the ${p}?`, `Some ${f} sounds good.`, `Not today.`, `Message me.`] },
    { goal: 'News and society', banks: [Sub, Why, N, Tip, Day], bot: ([sub, r, n, tip, d]) => `${n}, on ${d} policy take: less ${sub} homework because ${r}. Suggest school action: ${tip}.`, replies: ([sub, r, , tip]) => [`Yes, because ${r}.`, `Schools should ${tip}.`, `A little ${sub} is fine.`, `Projects > worksheets.`, `Depends.`] },
    { goal: 'Problem talk', banks: [Sub, Tip, N, Feel, P2], bot: ([sub, tip, n, feel, p]) => `${n}, at the ${p}, script a calm line to a teammate skipping ${sub} work. You feel ${feel}; tip: ${tip}.`, replies: ([sub, tip, , feel]) => [`Can we split the ${sub} tasks?`, `I feel ${feel}.`, `Please ${tip}.`, `Let's set a deadline.`, `I'll tell the teacher if needed.`] },
    { goal: 'Opinions', banks: [Obj, Feel, N, Why, P2], bot: ([obj, feel, n, r, p]) => `${n}, at the ${p}, give a nuanced review of the ${obj}: feel ${feel}, because ${r}.`, replies: ([obj, feel, , r]) => [`I feel ${feel} about the ${obj}.`, `Because ${r}.`, `Not my favorite.`, `Useful though.`, `I'd pick another.`] },
    ...L4extra.map((p) => ({
      ...p,
      banks: [...p.banks, P2] as Pattern['banks'],
      bot: (s: string[]) => `${p.bot(s.slice(0, -1))} (setting: ${s[s.length - 1]})`,
      replies: (s: string[]) => p.replies(s.slice(0, -1)),
    })),
  ]

  const L6: Pattern[] = [
    { goal: 'Professional English', banks: [Job, City, N, Sub, Time], bot: ([job, city, n, sub, t]) => `${n}, 20-second intro ${t} linking ${sub} skills to a ${job} path in ${city}.`, replies: ([job, city, n, sub]) => [`I'm ${n}.`, `I study ${sub}.`, `Aiming for ${job} work in ${city}.`, `I improve workplace English.`, `Nice to meet you.`] },
    { goal: 'Meetings and collaboration', banks: [Obj, Tip, N, Time, P2], bot: ([obj, tip, n, t, p]) => `${n}, at the ${p}, deadline for ${obj} moved ${t}. Propose one concrete next step: ${tip}.`, replies: ([obj, tip, , t]) => [`We should ${tip}.`, `Reprioritize the ${obj}.`, `Share a new timeline ${t}.`, `Split tasks.`, `Quick huddle.`] },
    { goal: 'Academic discussion', banks: [Sub, Why, N, Tip, P2], bot: ([sub, r, n, tip, p]) => `${n}, at the ${p}, define reliability for a ${sub} source (because ${r}) and a check to ${tip}.`, replies: ([sub, r, , tip]) => [`Evidence matters in ${sub}.`, `Because ${r}.`, `We should ${tip}.`, `Watch for bias.`, `Prefer peer review.`] },
    { goal: 'Interview English', banks: [Job, Why, N, City, Sub], bot: ([job, r, n, city, sub]) => `${n}, answer "Why this ${job} role in ${city} after ${sub}?" using because ${r}.`, replies: ([job, r, , city, sub]) => [`Because ${r}.`, `It fits my ${job} goals.`, `${city} offers growth.`, `${cap(sub)} prepared me.`, `I want to learn.`] },
    { goal: 'Workplace chat', banks: [Obj, Tip, N, Time, P2], bot: ([obj, tip, n, t, p]) => `${n}, from the ${p}, draft a client update about ${obj} delay ${t}; include apology and next step (${tip}).`, replies: ([obj, tip, , t]) => [`Sorry for the delay.`, `We're reviewing the ${obj}.`, `We will ${tip}.`, `Update by end of day ${t}.`, `Thanks for your patience.`] },
    { goal: 'Register and tone', banks: [Sub, Tip, N, Job, Time], bot: ([sub, tip, n, job, t]) => `${n}, ${t} rewrite casually→formally: ask a ${job} for more time on ${sub}, and ${tip}.`, replies: ([sub, tip, , job]) => [`Could I request an extension on ${sub}?`, `I can submit a draft soon.`, `Thank you, ${job}.`, `I should ${tip}.`, `Two extra days would help.`] },
    { goal: 'Debate and nuance', banks: [P2, Why, N, Sub, Feel], bot: ([p, r, n, sub, feel]) => `${n}, nuanced stance: studying ${sub} at the ${p} vs home, because ${r}. Feeling ${feel}?`, replies: ([p, r, , sub, feel]) => [`It depends.`, `${cap(sub)} needs focus at the ${p}.`, `I feel ${feel}.`, `Because ${r}.`, `Hybrid works.`] },
    { goal: 'Social English', banks: [P2, Time, N, Hob, F], bot: ([p, t, n, h, f]) => `${n}, close a meetup at the ${p} ${t} after ${h} with thanks + one takeaway (and ${f} if needed).`, replies: ([p, t, , h]) => [`Thanks, everyone.`, `Useful points today.`, `After ${h} at the ${p}.`, `Let's continue ${t}.`, `I'll revise the notes.`] },
    { goal: 'Collocations in context', banks: [Obj, Tip, N, Sub, P2], bot: ([obj, tip, n, sub, p]) => `${n}, at the ${p}, use "make a decision" about the ${obj} for ${sub}; suggest we ${tip}.`, replies: ([obj, tip, , sub]) => [`We need to make a decision on the ${obj}.`, `For ${sub}, yes.`, `We should ${tip}.`, `List pros and cons.`, `Need more data.`] },
    { goal: 'Problem solving', banks: [Sub, Tip, N, Obj, P2], bot: ([sub, tip, n, obj, p]) => `${n}, at the ${p}, ${sub} survey on the ${obj} is unclear. Pick a next method: ${tip}.`, replies: ([sub, tip, , obj]) => [`We should ${tip}.`, `Check ${sub} wording.`, `More data on the ${obj}.`, `Compare studies.`, `Rewrite questions.`] },
    { goal: 'Future goals', banks: [Job, City, N, Feel, Sub], bot: ([job, city, n, feel, sub]) => `${n}, decide aloud: relocate to ${city} for ${job} after ${sub}? Include feeling ${feel}.`, replies: ([job, city, , feel, sub]) => [`I'd consider ${city}.`, `For a ${job} role, maybe.`, `I feel ${feel}.`, `${cap(sub)} comes first.`, `Need details.`] },
    { goal: 'Everyday English', banks: [P2, Hob, N, Time, F], bot: ([p, h, n, t, f]) => `${n}, soft decline or accept: coffee and ${f} near the ${p} ${t} after ${h}.`, replies: ([p, h, , t, f]) => [`Sure, after ${h}.`, `Near the ${p} works.`, `Not ${t}.`, `${cap(f)} sounds good.`, `Let's text.`] },
    { goal: 'Meetings and collaboration', banks: [Obj, N, Day, Tip, City], bot: ([obj, n, d, tip, city]) => `${n}, ${city} team sync on ${d} about the ${obj}: one action is ${tip}. Confirm ownership.`, replies: ([obj, , , tip, city]) => [`I own the ${obj}.`, `I will ${tip}.`, `${city} team noted.`, `Confirmed.`, `Need a backup.`] },
    { goal: 'Interview English', banks: [Job, N, Feel, Why, Time], bot: ([job, n, feel, r, t]) => `${n}, ${t} follow-up question: why a ${job} path if you feel ${feel}? Because ${r}?`, replies: ([job, , feel, r]) => [`Because ${r}.`, `I still want the ${job} path.`, `I feel ${feel}, but motivated.`, `Growth matters.`, `I can learn fast.`] },
  ]

  const map: Record<LevelId, Pattern[]> = {
    1: L1,
    2: L2,
    3: L3,
    4: [...L3, ...L4extra],
    5: L5,
    6: L6,
  }
  return map[level]
}

type Prepared = {
  patterns: Pattern[]
  caps: number[]
  starts: number[]
  total: number
}

const CACHE = new Map<LevelId, Prepared>()

function gcd(a: number, b: number): number {
  while (b) {
    const t = a % b
    a = b
    b = t
  }
  return a
}

function findMix(total: number): number {
  // Golden-ratio step so consecutive ids jump far apart (not adjacent Mad-Libs).
  let mix = Math.floor(total * 0.6180339887498949) | 1
  if (mix < 2) mix = 1
  while (gcd(mix, total) !== 1) mix += 2
  if (mix >= total) mix = 1
  return mix
}

function prepare(level: LevelId): Prepared {
  const hit = CACHE.get(level)
  if (hit) return hit
  const patterns = patternsFor(level)
  const caps = patterns.map(capacityOf)
  const starts: number[] = []
  let total = 0
  for (const c of caps) {
    starts.push(total)
    total += c
  }
  if (total < 1_000_000) {
    throw new Error(`Level ${level} capacity ${total} < 1e6 (patterns=${patterns.length})`)
  }
  const prepared = { patterns, caps, starts, total }
  CACHE.set(level, prepared)
  return prepared
}

export function uniqueCapacity(level: LevelId): number {
  return prepare(level).total
}

/**
 * Unique by combinatorial capacity.
 * Rule: every bank value used in a pattern appears in bot_message.
 * Index → local is bijective into capacity space (no (pattern, slots) collisions).
 */
export function generateUniqueChatTurn(level: LevelId, id: number, bankSize = 1_000_000): ChatTurn {
  const size = Math.max(1, Math.floor(bankSize))
  const index = ((id % size) + size) % size
  const { patterns, starts, total } = prepare(level)

  // Prefer bankSize window when exporting 1e6 rows; still bijective within that window.
  const span = Math.min(size, total)
  const mix = findMix(span)
  const local = Number((BigInt(index) * BigInt(mix)) % BigInt(span))

  let lo = 0
  let hi = patterns.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (starts[mid] <= local) lo = mid
    else hi = mid - 1
  }
  // When span < total, local only covers [0, span). starts[] still valid.
  const pattern = patterns[lo]
  const slotIndex = local - starts[lo]
  const slots = slotsFor(pattern, slotIndex)
  const seed = level * 1_000_003 + index * 97 + mix
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five(pattern.replies(slots), seed)
  const topics = topicsForGoal(pattern.goal, index, level)
  return {
    id: index,
    level,
    bot_message: pattern.bot(slots),
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
