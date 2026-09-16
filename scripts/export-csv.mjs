// scripts/export-csv.ts
import { createWriteStream } from "node:fs";
import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// src/data/doctorLevels.ts
var DOCTOR_CSV_FILES = {
  1: "category-1-symptoms-checkup.csv",
  2: "category-2-pharmacy-medicine.csv",
  3: "category-3-first-aid-emergency.csv",
  4: "category-4-healthy-habits.csv",
  5: "category-5-appointments-followup.csv",
  6: "category-6-mental-wellness.csv"
};

// src/data/banks.ts
var NAMES = [
  "Mia",
  "Leo",
  "Sam",
  "Ana",
  "Ben",
  "Yuki",
  "Omar",
  "Lara",
  "Nico",
  "Hana",
  "Eli",
  "Sara",
  "Ken",
  "Lila",
  "Theo",
  "Maya",
  "Rui",
  "Noor",
  "Luca",
  "Zoe"
];
var COLORS = [
  "red",
  "blue",
  "yellow",
  "green",
  "orange",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
  "gray",
  "gold"
];
var ANIMALS = [
  "cat",
  "dog",
  "bird",
  "fish",
  "duck",
  "frog",
  "cow",
  "pig",
  "horse",
  "sheep",
  "lion",
  "tiger",
  "bear",
  "monkey",
  "elephant",
  "rabbit",
  "mouse",
  "chicken",
  "bee",
  "butterfly",
  "turtle",
  "snake",
  "giraffe",
  "zebra",
  "panda",
  "fox",
  "owl",
  "whale",
  "dolphin",
  "penguin",
  "koala",
  "kangaroo",
  "goat",
  "hen",
  "puppy",
  "kitten",
  "lamb",
  "calf",
  "ant",
  "spider",
  "swan",
  "wolf",
  "deer",
  "camel",
  "seal",
  "crab",
  "shark",
  "parrot"
];
var FOODS = [
  "apple",
  "banana",
  "orange",
  "grape",
  "milk",
  "bread",
  "cake",
  "cookie",
  "egg",
  "rice",
  "cheese",
  "pizza",
  "juice",
  "water",
  "ice cream",
  "candy",
  "carrot",
  "tomato",
  "potato",
  "chicken",
  "soup",
  "salad",
  "fish",
  "yogurt",
  "honey",
  "corn",
  "peach",
  "mango",
  "noodle",
  "sandwich"
];
var L1_ACTIONS = [
  "run",
  "jump",
  "play",
  "eat",
  "sleep",
  "sit",
  "walk",
  "clap",
  "smile",
  "swim",
  "hop",
  "dance",
  "sing",
  "look",
  "hide",
  "drink"
];
var L1_PLACES = [
  "park",
  "home",
  "zoo",
  "farm",
  "garden",
  "room",
  "school",
  "kitchen",
  "car",
  "bus",
  "tree",
  "pond",
  "bed",
  "box",
  "bag",
  "shop"
];
var TOYS = [
  "ball",
  "doll",
  "car",
  "teddy",
  "kite",
  "block",
  "puzzle",
  "balloon",
  "train",
  "drum",
  "robot",
  "crayon"
];
var FAMILY = ["mom", "dad", "baby", "sister", "brother", "grandma", "grandpa", "family"];
var NUMBER_WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten"
];
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var WEATHER = ["sunny", "rainy", "cloudy", "windy", "snowy", "hot", "cold", "warm"];
var SCHOOL_ITEMS = [
  "book",
  "pencil",
  "bag",
  "eraser",
  "ruler",
  "desk",
  "teacher",
  "friend",
  "classroom",
  "workbook",
  "crayon",
  "notebook"
];
var L2_ACTIONS = [
  "read",
  "write",
  "draw",
  "help",
  "clean",
  "cook",
  "play",
  "watch",
  "listen",
  "open",
  "close",
  "carry",
  "share",
  "visit",
  "paint",
  "study"
];
var L2_PLACES = [
  "school",
  "library",
  "playground",
  "supermarket",
  "hospital",
  "station",
  "beach",
  "museum",
  "bakery",
  "park",
  "home",
  "classroom",
  "kitchen",
  "farm",
  "zoo",
  "market"
];
var L2_OBJECTS = [
  "story",
  "picture",
  "letter",
  "present",
  "ticket",
  "sandwich",
  "football",
  "song",
  "map",
  "game",
  "flower",
  "card",
  "lunch",
  "message",
  "photo",
  "gift"
];

// src/types.ts
var BANK_SIZE = 1e5;

// src/engine/rng.ts
function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function shuffle(items, rand) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function decodeIndex(n, sizes) {
  const out = [];
  let x = Math.abs(Math.floor(n));
  for (const size of sizes) {
    out.push(x % size);
    x = Math.floor(x / size);
  }
  return out;
}
function pick(list, index) {
  return list[(index % list.length + list.length) % list.length];
}

// src/engine/helpers.ts
function cap(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// src/engine/chatTurns.ts
var SUBJECTS = [
  "math",
  "English",
  "science",
  "art",
  "music",
  "history",
  "PE",
  "reading",
  "writing",
  "geography"
];
var HOBBIES = [
  "football",
  "drawing",
  "reading",
  "singing",
  "dancing",
  "swimming",
  "cooking",
  "gaming",
  "cycling",
  "painting"
];
var JOBS = [
  "teacher",
  "doctor",
  "engineer",
  "artist",
  "nurse",
  "chef",
  "driver",
  "designer",
  "scientist",
  "writer"
];
var CITIES = [
  "Tokyo",
  "Seoul",
  "London",
  "Paris",
  "New York",
  "Manila",
  "Hanoi",
  "Bangkok",
  "Cairo",
  "Madrid",
  "Beijing",
  "Sydney"
];
var FEELINGS = [
  "happy",
  "tired",
  "excited",
  "nervous",
  "okay",
  "great",
  "bored",
  "hungry",
  "sleepy",
  "fine"
];
function makeCtx(level, id) {
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
    20
  ];
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
    agei
  ] = decodeIndex(level * 1000003 + id * 97, sizes);
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
      const ranges = {
        1: [3, 5],
        2: [6, 8],
        3: [9, 10],
        4: [11, 12],
        5: [13, 15],
        6: [16, 25]
      };
      const [min, max] = ranges[level];
      return min + agei % (max - min + 1);
    })(),
    subject: SUBJECTS[subi],
    hobby: HOBBIES[hobi],
    job: JOBS[jobi],
    city: CITIES[cityi],
    feeling: FEELINGS[feeli]
  };
}
function five(replies, seed) {
  const rand = mulberry32(seed);
  const unique = [];
  const seen = /* @__PURE__ */ new Set();
  for (const reply of shuffle(replies, rand)) {
    const key = reply.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(reply.trim());
    if (unique.length === 5) break;
  }
  while (unique.length < 5) unique.push(`Okay.`);
  return [unique[0], unique[1], unique[2], unique[3], unique[4]];
}
var L1 = [
  {
    goal: "Speaking and introductions",
    bot: () => "Hello!",
    replies: () => ["Hi!", "Hello!", "Hi, friend!", "Hello, Benny!", "Hi there!"]
  },
  {
    goal: "Speaking and introductions",
    bot: () => "How are you?",
    replies: () => ["I am good.", "I am happy.", "I am fine.", "I am okay.", "I am great!"]
  },
  {
    goal: "Speaking and introductions",
    bot: (c) => `What is your name?`,
    replies: (c) => [
      `My name is ${c.name}.`,
      `I am ${c.name}.`,
      `My name is ${c.name2}.`,
      `I am ${c.name2}.`,
      `I'm ${c.name}.`
    ]
  },
  {
    goal: "Speaking and introductions",
    bot: () => "Nice to meet you!",
    replies: () => ["Nice to meet you too!", "You too!", "Thank you!", "Nice to meet you!", "Hi!"]
  },
  {
    goal: "Speaking and introductions",
    bot: () => "Say goodbye!",
    replies: () => ["Bye!", "Goodbye!", "See you!", "Bye-bye!", "Good night!"]
  },
  {
    goal: "Colors",
    bot: (c) => `What color is this?`,
    replies: (c) => [
      `It is ${c.color}.`,
      `${cap(c.color)}.`,
      `This is ${c.color}.`,
      `It is ${pick(COLORS, c.age)}.`,
      `I see ${c.color}.`
    ]
  },
  {
    goal: "Animals",
    bot: (c) => `What animal do you see?`,
    replies: (c) => [
      `A ${c.animal}.`,
      `I see a ${c.animal}.`,
      `It is a ${c.animal}.`,
      `A ${pick(ANIMALS, c.age)}.`,
      `Look, a ${c.animal}!`
    ]
  },
  {
    goal: "Food",
    bot: (c) => `Do you like ${c.food}?`,
    replies: (c) => [
      `Yes, I like ${c.food}.`,
      `I love ${c.food}!`,
      `Yes!`,
      `No, I don't like ${c.food}.`,
      `Yummy!`
    ]
  },
  {
    goal: "Toys and play",
    bot: (c) => `What do you want to play with?`,
    replies: (c) => [
      `I want the ${c.toy}.`,
      `The ${c.toy}, please.`,
      `I like the ${c.toy}.`,
      `Let's play with the ${c.toy}.`,
      `A ${pick(TOYS, c.age)}, please.`
    ]
  },
  {
    goal: "Numbers",
    bot: (c) => `How many do you see?`,
    replies: (c) => [
      `${cap(c.number)}.`,
      `I see ${c.number}.`,
      `There are ${c.number}.`,
      `${cap(pick(NUMBER_WORDS, c.age))}.`,
      `${cap(c.number)} toys.`
    ]
  },
  {
    goal: "Family",
    bot: (c) => `Who is this?`,
    replies: (c) => [
      `This is my ${c.family}.`,
      `My ${c.family}.`,
      `It is my ${c.family}.`,
      `This is ${c.name}.`,
      `My ${pick(FAMILY, c.age)}.`
    ]
  },
  {
    goal: "Places",
    bot: (c) => `Where are you?`,
    replies: (c) => [
      `I am at the ${c.place}.`,
      `At the ${c.place}.`,
      `I am home.`,
      `I am at school.`,
      `In the ${pick(L1_PLACES, c.age)}.`
    ]
  },
  {
    goal: "Actions",
    bot: (c) => `What can you do?`,
    replies: (c) => [
      `I can ${c.action}.`,
      `I can ${pick(L1_ACTIONS, c.age)}.`,
      `I can jump.`,
      `I can run.`,
      `I can play.`
    ]
  },
  {
    goal: "Polite talk",
    bot: () => "Please say thank you.",
    replies: () => ["Thank you!", "Thanks!", "Thank you very much!", "Thanks a lot!", "Thank you, friend!"]
  },
  {
    goal: "Polite talk",
    bot: () => "Can I have some juice, please?",
    replies: () => ["Yes.", "Here you are.", "Please.", "Okay.", "Yes, please."]
  }
];
var L2 = [
  {
    goal: "Speaking and introductions",
    bot: () => "Hello! How are you today?",
    replies: () => [
      "I am good, thank you.",
      "I am fine.",
      "I am happy today.",
      "I am a little tired.",
      "I am okay."
    ]
  },
  {
    goal: "Speaking and introductions",
    bot: () => "What is your name?",
    replies: (c) => [
      `My name is ${c.name}.`,
      `I am ${c.name}.`,
      `I'm ${c.name}. Nice to meet you.`,
      `My name is ${c.name2}.`,
      `People call me ${c.name}.`
    ]
  },
  {
    goal: "Speaking and introductions",
    bot: () => "How old are you?",
    replies: (c) => [
      `I am ${c.age} years old.`,
      `I'm ${c.age}.`,
      `I am ${c.age + 1} years old.`,
      `${c.age} years old.`,
      `I turned ${c.age} this year.`
    ]
  },
  {
    goal: "Speaking and introductions",
    bot: () => "Where are you from?",
    replies: (c) => [
      `I am from ${c.city}.`,
      `I come from ${c.city}.`,
      `From ${c.city}.`,
      `I live in ${c.city}.`,
      `I am from ${pick(CITIES, c.age)}.`
    ]
  },
  {
    goal: "School vocabulary",
    bot: () => "Do you like school?",
    replies: () => [
      "Yes, I do.",
      "I love school!",
      "School is fun.",
      "A little.",
      "Yes!"
    ]
  },
  {
    goal: "School vocabulary",
    bot: () => "What is your favorite subject?",
    replies: (c) => [
      `My favorite subject is ${c.subject}.`,
      `I like ${c.subject}.`,
      `${cap(c.subject)}.`,
      `I love ${pick(SUBJECTS, c.age)}.`,
      `Math is my favorite.`
    ]
  },
  {
    goal: "School vocabulary",
    bot: () => "Who is your teacher?",
    replies: (c) => [
      `My teacher is ${c.name}.`,
      `Miss ${c.name}.`,
      `Mr. ${c.name2}.`,
      `My teacher is kind.`,
      `${c.name} is my teacher.`
    ]
  },
  {
    goal: "School vocabulary",
    bot: (c) => `What do you need for school?`,
    replies: (c) => [
      `I need a ${c.school}.`,
      `A ${c.school}, please.`,
      `I need my ${pick(SCHOOL_ITEMS, c.age)}.`,
      `I need a book and a pencil.`,
      `My bag and my ${c.school}.`
    ]
  },
  {
    goal: "Daily talk",
    bot: (c) => `What day is it today?`,
    replies: (c) => [
      `Today is ${c.day}.`,
      `It is ${c.day}.`,
      `${c.day}.`,
      `Today is ${pick(DAYS, c.age)}.`,
      `I think it is ${c.day}.`
    ]
  },
  {
    goal: "Weather",
    bot: () => "How is the weather?",
    replies: (c) => [
      `It is ${c.weather}.`,
      `The weather is ${c.weather}.`,
      `It is sunny.`,
      `It is rainy.`,
      `It is ${pick(WEATHER, c.age)}.`
    ]
  },
  {
    goal: "Food and likes",
    bot: (c) => `What do you like to eat?`,
    replies: (c) => [
      `I like ${c.food}.`,
      `I love ${c.food}!`,
      `I like ${pick(FOODS, c.age)}.`,
      `Pizza, please.`,
      `I like fruit.`
    ]
  },
  {
    goal: "Family",
    bot: () => "Who do you live with?",
    replies: (c) => [
      `I live with my ${c.family}.`,
      `With my mom and dad.`,
      `I live with my family.`,
      `With my ${pick(FAMILY, c.age)}.`,
      `I live with my sister.`
    ]
  },
  {
    goal: "Hobbies",
    bot: () => "What do you like to do?",
    replies: (c) => [
      `I like ${c.hobby}.`,
      `I love ${c.hobby}.`,
      `I like to play.`,
      `I like ${pick(HOBBIES, c.age)}.`,
      `I like reading books.`
    ]
  },
  {
    goal: "Places",
    bot: (c) => `Where do you want to go?`,
    replies: (c) => [
      `I want to go to the ${c.place}.`,
      `To the ${c.place}.`,
      `I want to go home.`,
      `To the park, please.`,
      `To the ${pick(L2_PLACES, c.age)}.`
    ]
  },
  {
    goal: "Polite talk",
    bot: () => "Can you help me, please?",
    replies: () => [
      "Yes, of course.",
      "Sure!",
      "Okay, I can help.",
      "Yes, what do you need?",
      "No problem."
    ]
  }
];
var L3 = [
  {
    goal: "Speaking and introductions",
    bot: () => "Tell me about yourself.",
    replies: (c) => [
      `My name is ${c.name}. I am ${c.age} years old.`,
      `I am ${c.name}, and I like ${c.hobby}.`,
      `I live in ${c.city}.`,
      `I am a student. I like ${c.subject}.`,
      `Hi! I'm ${c.name2}. Nice to meet you.`
    ]
  },
  {
    goal: "Past experiences",
    bot: () => "What did you do yesterday?",
    replies: (c) => [
      `I went to the ${c.place}.`,
      `I played with my friends.`,
      `I studied ${c.subject}.`,
      `I watched a movie.`,
      `I helped my ${c.family}.`
    ]
  },
  {
    goal: "School life",
    bot: () => "What was your favorite class today?",
    replies: (c) => [
      `My favorite class was ${c.subject}.`,
      `I liked ${c.subject} today.`,
      `Art was fun.`,
      `I enjoyed ${pick(SUBJECTS, c.age)}.`,
      `PE was my favorite.`
    ]
  },
  {
    goal: "Reasons and because",
    bot: (c) => `Why do you like ${c.hobby}?`,
    replies: (c) => [
      `Because it is fun.`,
      `Because I feel happy.`,
      `Because I am good at it.`,
      `Because I can do it with friends.`,
      `Because it helps me relax.`
    ]
  },
  {
    goal: "Comparisons",
    bot: (c) => `Which is bigger, a ${c.animal} or a mouse?`,
    replies: (c) => [
      `A ${c.animal} is bigger.`,
      `The ${c.animal} is bigger than a mouse.`,
      `A mouse is smaller.`,
      `The ${c.animal}.`,
      `I think the ${c.animal} is bigger.`
    ]
  },
  {
    goal: "Feelings",
    bot: () => "How do you feel today?",
    replies: (c) => [
      `I feel ${c.feeling}.`,
      `I am ${c.feeling} today.`,
      "I feel great.",
      `A little tired, but okay.`,
      `I feel ${pick(FEELINGS, c.age)}.`
    ]
  },
  {
    goal: "Weekend plans",
    bot: () => "What are you going to do this weekend?",
    replies: (c) => [
      `I am going to visit the ${c.place}.`,
      `I will play ${c.hobby}.`,
      `I am going to study.`,
      `I will stay home and rest.`,
      `I am going to see my friends.`
    ]
  },
  {
    goal: "Food and preferences",
    bot: (c) => `Would you like some ${c.food}?`,
    replies: (c) => [
      `Yes, please.`,
      `No, thank you.`,
      `Yes, I love ${c.food}.`,
      `Maybe later.`,
      `Just a little, please.`
    ]
  },
  {
    goal: "Directions",
    bot: () => "Where is the library?",
    replies: () => [
      "It is next to the school.",
      "Go straight and turn left.",
      "It is near the park.",
      "Across from the supermarket.",
      "I can show you."
    ]
  },
  {
    goal: "Stories",
    bot: (c) => `${c.name} lost a bag. What can you say?`,
    replies: () => [
      "Where did you last see it?",
      "I can help you look.",
      "Was it in the classroom?",
      "Let us ask the teacher.",
      "Do not worry. We will find it."
    ]
  },
  {
    goal: "Opinions",
    bot: (c) => `What do you think about this ${c.object}?`,
    replies: (c) => [
      `I think it is nice.`,
      `It looks interesting.`,
      `I like it a lot.`,
      `It is okay, but not my favorite.`,
      `I think it is useful.`
    ]
  },
  {
    goal: "Daily routines",
    bot: () => "What time do you usually wake up?",
    replies: () => [
      "I wake up at seven.",
      "Around 7:00 in the morning.",
      "I get up early.",
      "Usually at half past six.",
      "I wake up at eight on weekends."
    ]
  }
];
var L4 = [
  {
    goal: "Conversations",
    bot: () => "What are your plans for this evening?",
    replies: (c) => [
      `I am going to ${c.action} after dinner.`,
      "I will finish my homework first.",
      `I might visit the ${c.place}.`,
      "I am not sure yet.",
      "I plan to rest and read."
    ]
  },
  {
    goal: "First conditional",
    bot: (c) => `If it rains tomorrow, what will you do?`,
    replies: () => [
      "If it rains, I will stay home.",
      "I will take an umbrella.",
      "I will watch a movie indoors.",
      "I will study at home.",
      "I will call my friend instead."
    ]
  },
  {
    goal: "Opinions and reasons",
    bot: (c) => `Do you think ${c.subject} is important?`,
    replies: (c) => [
      `Yes, because it helps me learn.`,
      "Yes, it is useful in daily life.",
      "I think so, but it can be hard.",
      "Not really. I prefer other subjects.",
      `Yes. ${cap(c.subject)} is important for my future.`
    ]
  },
  {
    goal: "Advice",
    bot: () => "I feel nervous about the test. What should I do?",
    replies: () => [
      "You should review a little every day.",
      "Try to sleep well tonight.",
      "Ask the teacher if you need help.",
      "Take deep breaths and stay calm.",
      "Study with a friend."
    ]
  },
  {
    goal: "Phrasal verbs",
    bot: () => "Can you look after my bag for a minute?",
    replies: () => [
      "Sure, I can look after it.",
      "No problem.",
      "Okay. I will watch it.",
      "Yes, leave it here.",
      "Of course."
    ]
  },
  {
    goal: "School projects",
    bot: () => "How is your group project going?",
    replies: () => [
      "It is going well so far.",
      "We still need more ideas.",
      "We finished the first part.",
      "It is a bit difficult, but okay.",
      "We will present it next week."
    ]
  },
  {
    goal: "Making suggestions",
    bot: () => "What should we do after school?",
    replies: (c) => [
      `Why don't we go to the ${c.place}?`,
      `Let's play ${c.hobby}.`,
      "How about studying together?",
      "We could get some snacks.",
      "Maybe we can walk in the park."
    ]
  },
  {
    goal: "Describing people",
    bot: (c) => `What is ${c.name} like?`,
    replies: (c) => [
      `${c.name} is friendly and kind.`,
      `${c.name} is funny.`,
      `${c.name} works hard at school.`,
      `${c.name} is a bit quiet, but nice.`,
      `${c.name} loves ${c.hobby}.`
    ]
  },
  {
    goal: "Travel talk",
    bot: (c) => `Have you ever visited ${c.city}?`,
    replies: (c) => [
      `Yes, I went to ${c.city} last year.`,
      `Not yet, but I want to.`,
      `No, I have never been there.`,
      `Yes, it was amazing.`,
      `I hope I can visit ${c.city} someday.`
    ]
  },
  {
    goal: "Problem solving",
    bot: () => "The bus is late. What can we do?",
    replies: () => [
      "We can wait a few more minutes.",
      "Maybe we should walk.",
      "Let us call someone.",
      "We can take the next bus.",
      "I can check the schedule on my phone."
    ]
  }
];
var L5 = [
  {
    goal: "Teen conversation",
    bot: () => "How was your weekend?",
    replies: (c) => [
      "Pretty good. I hung out with friends.",
      `I practiced ${c.hobby} most of the time.`,
      "It was busy because of homework.",
      "Not bad. I watched a few shows.",
      "Honestly, I needed more sleep."
    ]
  },
  {
    goal: "Opinions",
    bot: (c) => `What do you think about online classes?`,
    replies: () => [
      "They are convenient, but I miss real classrooms.",
      "I like them when the lessons are clear.",
      "They can be useful, though distractions are a problem.",
      "I prefer face-to-face classes.",
      "It depends on the teacher and the subject."
    ]
  },
  {
    goal: "Idioms in chat",
    bot: () => "The homework was a piece of cake for me. What about you?",
    replies: () => [
      "Same here. It was really easy.",
      "Not for me. I found it tricky.",
      "It took me longer than I expected.",
      "I got most of it right.",
      "I need to review a few parts again."
    ]
  },
  {
    goal: "School stress",
    bot: () => "Exams are coming. How are you preparing?",
    replies: () => [
      "I made a revision timetable.",
      "I am starting with the hardest topics.",
      "I study a little every evening.",
      "I still need a better plan.",
      "I review notes and practice past papers."
    ]
  },
  {
    goal: "Hobbies and identity",
    bot: (c) => `Why do you enjoy ${c.hobby}?`,
    replies: (c) => [
      `It helps me relax after school.`,
      `I feel more confident when I do it.`,
      `I can meet people who like ${c.hobby} too.`,
      "It gives me a break from screens.",
      "I have been doing it for years."
    ]
  },
  {
    goal: "Agreeing and disagreeing",
    bot: () => "Social media is mostly a waste of time. Do you agree?",
    replies: () => [
      "I partly agree. It depends how you use it.",
      "I disagree. It helps me stay connected.",
      "I see your point, but it can also be useful.",
      "Yes, if people scroll all day.",
      "Not completely. There are educational accounts too."
    ]
  },
  {
    goal: "Problem talk",
    bot: () => "My group member is not doing any work. What should I say?",
    replies: () => [
      "You could talk to them politely first.",
      "Explain what still needs to be finished.",
      "Ask if they need help with their part.",
      "If it continues, tell the teacher.",
      "Suggest a clear deadline for each task."
    ]
  },
  {
    goal: "Future goals",
    bot: () => "What do you want to do after high school?",
    replies: (c) => [
      `I want to study to become a ${c.job}.`,
      "I am still deciding.",
      `Maybe I will study in ${c.city}.`,
      "I want to travel and then go to university.",
      "I hope to find a job I really like."
    ]
  },
  {
    goal: "News and society",
    bot: () => "Should students have less homework?",
    replies: () => [
      "Yes. Quality matters more than quantity.",
      "A little homework is fine, but not every night.",
      "I think projects are better than long worksheets.",
      "It depends on the subject.",
      "Students also need free time to rest."
    ]
  },
  {
    goal: "Everyday English",
    bot: () => "Want to hang out later?",
    replies: (c) => [
      "Sure. What time works for you?",
      `Maybe after I finish ${c.subject}.`,
      "I can for about an hour.",
      "Not today, but tomorrow works.",
      "Yes. Let\u2019s meet at the caf\xE9."
    ]
  }
];
var L6 = [
  {
    goal: "Professional English",
    bot: () => "Could you briefly introduce yourself?",
    replies: (c) => [
      `My name is ${c.name}. I am currently studying English and interested in becoming a ${c.job}.`,
      `I\u2019m ${c.name}. I live in ${c.city} and focus on academic English.`,
      `I\u2019m ${c.name}. I enjoy ${c.hobby} and hope to work in education.`,
      `My name is ${c.name2}. I am preparing for advanced English exams.`,
      `I\u2019m ${c.name}. I would like to improve my workplace communication skills.`
    ]
  },
  {
    goal: "Meetings and collaboration",
    bot: () => "The deadline was moved up. How should we respond?",
    replies: () => [
      "We should prioritize the essential tasks first.",
      "I can revise the timeline and share it today.",
      "Let\u2019s divide the remaining work clearly.",
      "We may need to request a short extension.",
      "I suggest a quick meeting to reassign roles."
    ]
  },
  {
    goal: "Academic discussion",
    bot: () => "What makes a source reliable?",
    replies: () => [
      "It should be accurate, recent, and well supported by evidence.",
      "Trusted authors and clear references matter.",
      "Peer-reviewed research is usually more reliable.",
      "We should check for bias and weak arguments.",
      "Reliable sources explain methods and limitations."
    ]
  },
  {
    goal: "Register and tone",
    bot: () => "How would you request more time from a professor?",
    replies: () => [
      "Would it be possible to request a short extension?",
      "I can submit a complete draft by Thursday if needed.",
      "Thank you for considering my request.",
      "I apologize for the delay and appreciate your understanding.",
      "Could I ask for two extra days to finish the assignment?"
    ]
  },
  {
    goal: "Workplace chat",
    bot: () => "A client is unhappy with the delay. What is a professional reply?",
    replies: () => [
      "Thank you for flagging this. I will look into it and update you by 3 p.m.",
      "I understand your concern and apologize for the inconvenience.",
      "We are reviewing the issue and will share a clear plan shortly.",
      "Please let me know if you need anything while we investigate.",
      "I appreciate your patience while we resolve this."
    ]
  },
  {
    goal: "Debate and nuance",
    bot: () => "Is remote work better than office work?",
    replies: () => [
      "It depends on the role and the person.",
      "Remote work offers flexibility, but collaboration can suffer.",
      "Offices help with teamwork, yet commuting can be exhausting.",
      "A hybrid model may balance both sides.",
      "Productivity often depends more on habits than location."
    ]
  },
  {
    goal: "Collocations in context",
    bot: () => "We need to make a decision today. What do you suggest?",
    replies: () => [
      "I suggest we review the key evidence first.",
      "Let\u2019s list the pros and cons before deciding.",
      "We should reach a consensus if possible.",
      "I can summarize the options in a short note.",
      "We may need more data before we decide."
    ]
  },
  {
    goal: "Interview English",
    bot: () => "Why do you want this role?",
    replies: (c) => [
      `Because it matches my interest in becoming a ${c.job}.`,
      "I want to apply my English skills in a real workplace.",
      "The role would help me grow professionally.",
      "I am motivated by clear goals and teamwork.",
      "I believe I can contribute and keep learning."
    ]
  },
  {
    goal: "Problem solving",
    bot: () => "Our survey results are unclear. What next?",
    replies: () => [
      "We should check the sample size and wording.",
      "I recommend collecting a bit more data.",
      "Let\u2019s compare the results with earlier research.",
      "We can interview a few participants for clarity.",
      "I suggest rewriting the weakest questions."
    ]
  },
  {
    goal: "Social English",
    bot: () => "Thanks for joining the discussion. Any final thoughts?",
    replies: () => [
      "I think we covered the main points clearly.",
      "I agree with the overall conclusion.",
      "One issue still needs more evidence.",
      "I am happy to revise the summary if needed.",
      "Thank you. This was a useful conversation."
    ]
  }
];
var BY_LEVEL = {
  1: L1,
  2: L2,
  3: L3,
  4: [...L3, ...L4],
  5: [...L4, ...L5],
  6: [...L5, ...L6]
};
function generateChatTurn(level, id) {
  const index = (id % BANK_SIZE + BANK_SIZE) % BANK_SIZE;
  const templates = BY_LEVEL[level];
  const template = templates[index % templates.length];
  const ctx = makeCtx(level, index);
  const seed = level * 1000003 + index * 97;
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five(template.replies(ctx), seed);
  return {
    id: index,
    level,
    bot_message: template.bot(ctx),
    reply_1,
    reply_2,
    reply_3,
    reply_4,
    reply_5,
    learning_goal: template.goal
  };
}

// src/engine/doctorTurns.ts
var BODY = [
  "head",
  "tummy",
  "throat",
  "ear",
  "eye",
  "tooth",
  "knee",
  "back",
  "chest",
  "hand",
  "foot",
  "nose"
];
var SYMPTOMS = [
  "a fever",
  "a cough",
  "a headache",
  "a sore throat",
  "a runny nose",
  "a stomachache",
  "an allergy",
  "dizziness",
  "a rash",
  "ear pain"
];
var FOODS2 = ["water", "soup", "fruit", "rice", "juice", "yogurt", "toast", "tea"];
var HABITS = ["sleep", "exercise", "wash hands", "brush teeth", "drink water", "rest"];
var TIMES = ["this morning", "yesterday", "last night", "two days ago", "since Monday", "after lunch"];
var MEDICINES = ["syrup", "tablets", "drops", "cream", "vitamins", "lozenges"];
var PLACES = ["clinic", "hospital", "pharmacy", "nurse room", "waiting room", "home"];
var FEELINGS2 = ["okay", "better", "worse", "tired", "worried", "fine", "sore", "weak"];
var ACTIVITIES = ["running", "playing football", "studying", "swimming", "walking", "sleeping"];
function makeCtx2(level, id) {
  const sizes = [
    NAMES.length,
    BODY.length,
    SYMPTOMS.length,
    FOODS2.length,
    HABITS.length,
    TIMES.length,
    MEDICINES.length,
    PLACES.length,
    FEELINGS2.length,
    ACTIVITIES.length
  ];
  const [ni, bi, si, fi, hi, ti, mi, pi, fei, ai] = decodeIndex(level * 900011 + id * 89, sizes);
  return {
    name: NAMES[ni],
    body: BODY[bi],
    symptom: SYMPTOMS[si],
    food: FOODS2[fi],
    habit: HABITS[hi],
    time: TIMES[ti],
    medicine: MEDICINES[mi],
    place: PLACES[pi],
    feeling: FEELINGS2[fei],
    activity: ACTIVITIES[ai]
  };
}
function five2(replies, seed) {
  const rand = mulberry32(seed);
  const unique = [];
  const seen = /* @__PURE__ */ new Set();
  for (const reply of shuffle(replies, rand)) {
    const key = reply.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(reply.trim());
    if (unique.length === 5) break;
  }
  while (unique.length < 5) unique.push("Okay.");
  return [unique[0], unique[1], unique[2], unique[3], unique[4]];
}
var L12 = [
  {
    goal: "Greeting the doctor",
    bot: () => "Hello! How are you today?",
    replies: () => ["I am okay.", "I feel sick.", "I am fine.", "My tummy hurts.", "I feel tired."]
  },
  {
    goal: "Body parts",
    bot: (c) => `Does your ${c.body} hurt?`,
    replies: (c) => [
      `Yes, my ${c.body} hurts.`,
      "A little.",
      "No, it is okay.",
      `Yes, it hurts here.`,
      "It hurts when I move."
    ]
  },
  {
    goal: "Feelings",
    bot: () => "How do you feel?",
    replies: (c) => [
      `I feel ${c.feeling}.`,
      "I feel sick.",
      "I feel better.",
      "I feel hot.",
      "I feel sad."
    ]
  },
  {
    goal: "Tummy talk",
    bot: () => "Does your tummy hurt?",
    replies: () => ["Yes.", "No.", "A little.", "Yes, after eating.", "It hurts now."]
  },
  {
    goal: "Brave clinic visit",
    bot: () => "Can I look in your mouth?",
    replies: () => ["Okay.", "Yes.", "I am ready.", "Please be gentle.", "Yes, Doctor."]
  },
  {
    goal: "Rest and care",
    bot: () => "Please drink some water.",
    replies: () => ["Okay.", "Yes, I will.", "Thank you.", "I want water.", "Okay, Doctor."]
  },
  {
    goal: "Parents and help",
    bot: () => "Who came with you today?",
    replies: (c) => ["My mom.", "My dad.", `I came with ${c.name}.`, "My grandma.", "My family."]
  },
  {
    goal: "Medicine words",
    bot: (c) => `This is ${c.medicine}. Can you take it?`,
    replies: () => ["Yes.", "Okay.", "It tastes funny.", "I can try.", "With water, please."]
  }
];
var L22 = [
  {
    goal: "Describing symptoms",
    bot: () => "What is wrong today?",
    replies: (c) => [
      `I have ${c.symptom}.`,
      `My ${c.body} hurts.`,
      "I feel sick.",
      `I have had ${c.symptom} since ${c.time}.`,
      "I do not feel well."
    ]
  },
  {
    goal: "When it started",
    bot: () => "When did it start?",
    replies: (c) => [
      `It started ${c.time}.`,
      "Yesterday.",
      "This morning.",
      "Two days ago.",
      "Last night."
    ]
  },
  {
    goal: "Fever and cold",
    bot: () => "Do you have a fever?",
    replies: () => [
      "Yes, I feel hot.",
      "No, I do not.",
      "Maybe a little.",
      "Yes, since last night.",
      "My mom checked. It was high."
    ]
  },
  {
    goal: "Healthy habits",
    bot: (c) => `Do you ${c.habit} every day?`,
    replies: (c) => [
      `Yes, I ${c.habit} every day.`,
      "Sometimes.",
      "Not always.",
      "I try to.",
      "No, I forget."
    ]
  },
  {
    goal: "Appointments",
    bot: () => "Can you come back tomorrow?",
    replies: () => [
      "Yes, I can.",
      "What time?",
      "Okay.",
      "I need to ask my parents.",
      "Yes, after school."
    ]
  },
  {
    goal: "Food and drink",
    bot: (c) => `Please drink more ${c.food}.`,
    replies: (c) => [
      `Okay. I will drink ${c.food}.`,
      "Thank you.",
      "How much should I drink?",
      "I will try.",
      "Yes, Doctor."
    ]
  },
  {
    goal: "Allergy basics",
    bot: () => "Are you allergic to any medicine?",
    replies: () => [
      "No, I am not.",
      "I do not know.",
      "Yes, some medicine makes me itchy.",
      "My mom says no.",
      "I need to check."
    ]
  },
  {
    goal: "Pharmacy talk",
    bot: (c) => `Please get this ${c.medicine} from the pharmacy.`,
    replies: () => [
      "Okay.",
      "Where is the pharmacy?",
      "Thank you.",
      "How many times a day?",
      "I understand."
    ]
  }
];
var L32 = [
  {
    goal: "Symptom history",
    bot: () => "Can you tell me more about your symptoms?",
    replies: (c) => [
      `I have ${c.symptom}, and it started ${c.time}.`,
      `My ${c.body} hurts when I move.`,
      "It is worse at night.",
      "I also feel tired.",
      "The pain comes and goes."
    ]
  },
  {
    goal: "Activity and injury",
    bot: (c) => `Did this happen while you were ${c.activity}?`,
    replies: (c) => [
      `Yes, during ${c.activity}.`,
      "No, it started later.",
      "Maybe. I am not sure.",
      "Yes, after school sports.",
      "No, I was resting."
    ]
  },
  {
    goal: "Questions for the doctor",
    bot: () => "Do you have any questions for me?",
    replies: (c) => [
      "When can I go back to school?",
      `How long should I take the ${c.medicine}?`,
      "Should I stay home tomorrow?",
      "Is it serious?",
      "Can I play sports this week?"
    ]
  },
  {
    goal: "First aid basics",
    bot: () => "If you cut your finger, what should you do first?",
    replies: () => [
      "Wash it and put a bandage on.",
      "Tell an adult.",
      "Keep it clean.",
      "Do not touch dirty things.",
      "Ask for help."
    ]
  },
  {
    goal: "Allergies",
    bot: () => "Have you noticed any allergies?",
    replies: () => [
      "I sneeze near dust.",
      "Some foods make my tummy hurt.",
      "I am not sure.",
      "I get itchy in spring.",
      "No known allergies."
    ]
  },
  {
    goal: "Rest advice",
    bot: () => "You should rest today. Can you do that?",
    replies: () => [
      "Yes, I will rest.",
      "I have homework, but I can rest after.",
      "Okay. No sports today.",
      "I will stay home.",
      "Thank you for the advice."
    ]
  },
  {
    goal: "Temperature and measurement",
    bot: () => "What was your temperature this morning?",
    replies: () => [
      "It was 38 degrees.",
      "I do not know the number.",
      "My mom said it was high.",
      "It was normal.",
      "I felt hot, but we did not check."
    ]
  },
  {
    goal: "Follow-up",
    bot: () => "Please come back if it gets worse.",
    replies: () => [
      "I understand.",
      "What counts as worse?",
      "Okay, I will tell my parents.",
      "Thank you, Doctor.",
      "I will return if needed."
    ]
  }
];
var L42 = [
  {
    goal: "Booking an appointment",
    bot: () => "Would you like a morning or afternoon appointment?",
    replies: () => [
      "Morning is better for me.",
      "Afternoon, please.",
      "Either is fine.",
      "After school would help.",
      "What times are available?"
    ]
  },
  {
    goal: "Explaining the problem",
    bot: () => "In your own words, what brings you in today?",
    replies: (c) => [
      `I\u2019ve had ${c.symptom} since ${c.time}.`,
      `My ${c.body} has been sore.`,
      "I feel worse when I exercise.",
      "I need advice about sleeping better.",
      "I think I may have caught a cold."
    ]
  },
  {
    goal: "Prevention",
    bot: () => "What can you do to stay healthier this week?",
    replies: (c) => [
      `I can ${c.habit} more regularly.`,
      "I can wash my hands often.",
      "I can sleep earlier.",
      "I can drink more water.",
      "I can avoid sharing drinks."
    ]
  },
  {
    goal: "Pharmacy English",
    bot: (c) => `Please take this ${c.medicine} twice a day after meals.`,
    replies: (c) => [
      "Twice a day after meals. Got it.",
      "For how many days?",
      "Should I take it with water?",
      "What if I miss a dose?",
      `I understand. ${c.medicine} after meals.`
    ]
  },
  {
    goal: "Consent and comfort",
    bot: () => "Is it okay if I check your throat?",
    replies: () => [
      "Yes, that\u2019s fine.",
      "Okay, please go ahead.",
      "Can you explain first?",
      "Yes, but please be gentle.",
      "I feel a bit nervous, but okay."
    ]
  },
  {
    goal: "School and recovery",
    bot: () => "Should you stay home from school?",
    replies: () => [
      "If I still have a fever, yes.",
      "I can go if I feel better.",
      "What do you recommend?",
      "I will ask my parents.",
      "I think one more day of rest helps."
    ]
  },
  {
    goal: "Sports injury",
    bot: (c) => `Your ${c.body} may need rest from ${c.activity}.`,
    replies: (c) => [
      `Okay. No ${c.activity} for now.`,
      "How long should I rest?",
      "Can I do light exercise?",
      "I understand.",
      "I will ice it and rest."
    ]
  },
  {
    goal: "Clear communication",
    bot: () => "Did I explain that clearly?",
    replies: () => [
      "Yes, thank you.",
      "Could you repeat the medicine times?",
      "I understand most of it.",
      "One part is still unclear.",
      "Yes. I can explain it back."
    ]
  }
];
var L52 = [
  {
    goal: "Teen wellness",
    bot: () => "Have you been feeling more stressed than usual?",
    replies: () => [
      "A bit, especially with exams.",
      "Yes. Sleep has been difficult.",
      "Not really, just tired from training.",
      "I feel overwhelmed some days.",
      "I\u2019m okay, but I could use advice."
    ]
  },
  {
    goal: "Asking for help",
    bot: () => "It\u2019s okay to ask for help. What would you like support with?",
    replies: (c) => [
      `Managing ${c.symptom}.`,
      "Sleep and energy.",
      "Sports recovery.",
      "Anxiety before tests.",
      "Eating more regularly."
    ]
  },
  {
    goal: "Privacy",
    bot: () => "Would you like to talk alone for a minute?",
    replies: () => [
      "Yes, that would help.",
      "No, my parent can stay.",
      "Maybe later.",
      "Yes, please.",
      "I\u2019m fine either way."
    ]
  },
  {
    goal: "Sports and recovery",
    bot: (c) => `You hurt your ${c.body} while ${c.activity}. How bad is the pain now?`,
    replies: () => [
      "Mild, but annoying.",
      "Moderate when I move.",
      "Strong if I put weight on it.",
      "Better than yesterday.",
      "Still sore at night."
    ]
  },
  {
    goal: "Healthy routines",
    bot: () => "Which habit do you want to improve first?",
    replies: (c) => [
      `I want to improve my ${c.habit}.`,
      "Sleeping on time.",
      "Drinking enough water.",
      "Taking screen breaks.",
      "Stretching after sports."
    ]
  },
  {
    goal: "Clinic manners",
    bot: () => "If you disagree with advice, how can you say that politely?",
    replies: () => [
      "Could we look at another option?",
      "I understand, but I\u2019m worried about side effects.",
      "Can you explain why that is best?",
      "I\u2019d like a second opinion if possible.",
      "Thank you. I need time to think."
    ]
  },
  {
    goal: "Mental health English",
    bot: () => "How have your mood and energy been this week?",
    replies: () => [
      "Mostly stable.",
      "Lower than usual.",
      "Up and down.",
      "Better when I sleep enough.",
      "I\u2019ve felt anxious before school."
    ]
  },
  {
    goal: "Follow-up planning",
    bot: () => "Let\u2019s plan a check-in. What works for you?",
    replies: () => [
      "Next week after school.",
      "A message reminder would help.",
      "I can come on Friday.",
      "Mornings are difficult.",
      "Please text my parent the time."
    ]
  }
];
var L62 = [
  {
    goal: "History taking",
    bot: () => "Please summarize your main concern in one or two sentences.",
    replies: (c) => [
      `I\u2019ve had ${c.symptom} since ${c.time}, and it\u2019s affecting my sleep.`,
      `My ${c.body} pain started after ${c.activity}.`,
      "I need advice on recurring headaches.",
      "I\u2019m here for a follow-up after last week\u2019s visit.",
      "I want to discuss allergy symptoms that keep returning."
    ]
  },
  {
    goal: "Medication and pharmacy",
    bot: (c) => `Please confirm how you will take the ${c.medicine}.`,
    replies: (c) => [
      `I\u2019ll take the ${c.medicine} twice daily after meals.`,
      "Once at night with water.",
      "Only if the pain is above mild.",
      "For five days, then stop unless advised.",
      "I\u2019ll read the label and follow the dose exactly."
    ]
  },
  {
    goal: "Consent",
    bot: () => "Do I have your consent to proceed with the examination?",
    replies: () => [
      "Yes, you have my consent.",
      "Yes, please explain each step.",
      "I consent, but tell me if anything will hurt.",
      "I\u2019d like my parent present.",
      "Can we wait one minute first?"
    ]
  },
  {
    goal: "Professional patient talk",
    bot: () => "Are there any red-flag symptoms I should know about?",
    replies: () => [
      "No chest pain or breathing trouble.",
      "I had a high fever last night.",
      "No fainting, but I felt dizzy once.",
      "There\u2019s a new rash on my arm.",
      "None that I noticed."
    ]
  },
  {
    goal: "Lifestyle counseling",
    bot: () => "What change can you realistically make this month?",
    replies: (c) => [
      `I can improve my ${c.habit} schedule.`,
      "I can reduce late-night screens.",
      "I can walk 20 minutes daily.",
      "I can prepare water in the morning.",
      "I can keep a simple symptom diary."
    ]
  },
  {
    goal: "Clarifying advice",
    bot: () => "Could you repeat the care plan in your own words?",
    replies: (c) => [
      `Rest, hydrate, and take ${c.medicine} as directed.`,
      "Return sooner if symptoms worsen.",
      "Avoid intense exercise for a few days.",
      "Monitor temperature and sleep.",
      "Follow up if there\u2019s no improvement in three days."
    ]
  },
  {
    goal: "Urgent vs routine",
    bot: () => "When should you seek urgent care instead of waiting?",
    replies: () => [
      "If breathing becomes difficult.",
      "If the fever is very high and persistent.",
      "If pain suddenly becomes severe.",
      "If there\u2019s confusion or fainting.",
      "If symptoms rapidly get worse."
    ]
  },
  {
    goal: "Closing the visit",
    bot: () => "Do you feel ready to leave with a clear plan?",
    replies: () => [
      "Yes. Thank you for explaining.",
      "Yes, and I\u2019ll message if anything changes.",
      "Almost\u2014one more question about dosing.",
      "Yes. I\u2019ll book the follow-up now.",
      "Yes. I understand the next steps."
    ]
  }
];
var SYMPTOMS_CAT = [
  ...L12.filter(
    (t) => ["Greeting the doctor", "Body parts", "Feelings", "Tummy talk", "Brave clinic visit"].includes(
      t.goal
    )
  ),
  ...L22.filter(
    (t) => ["Describing symptoms", "When it started", "Fever and cold"].includes(t.goal)
  ),
  ...L32.filter(
    (t) => ["Symptom history", "Temperature and measurement", "Allergies"].includes(t.goal)
  ),
  ...L62.filter((t) => t.goal === "History taking" || t.goal === "Professional patient talk")
];
var PHARMACY_CAT = [
  ...L12.filter((t) => t.goal === "Medicine words"),
  ...L22.filter(
    (t) => ["Pharmacy talk", "Allergy basics", "Food and drink"].includes(t.goal)
  ),
  ...L32.filter((t) => t.goal === "Questions for the doctor"),
  ...L42.filter((t) => t.goal === "Pharmacy English" || t.goal === "Clear communication"),
  ...L62.filter((t) => t.goal === "Medication and pharmacy" || t.goal === "Clarifying advice")
];
var EMERGENCY_CAT = [
  ...L32.filter((t) => t.goal === "First aid basics" || t.goal === "Activity and injury"),
  ...L42.filter((t) => t.goal === "Sports injury"),
  ...L52.filter((t) => t.goal === "Sports and recovery"),
  ...L62.filter((t) => t.goal === "Urgent vs routine"),
  {
    goal: "Call for help",
    bot: () => "Someone is badly hurt. What should you do?",
    replies: () => [
      "Call emergency services.",
      "Ask an adult for help right away.",
      "Stay calm and check if they can breathe.",
      "Do not move them if the injury looks serious.",
      "Keep them safe until help arrives."
    ]
  },
  {
    goal: "Bleeding basics",
    bot: () => "There is bleeding from a small cut. What is a good first step?",
    replies: () => [
      "Press clean cloth on the cut.",
      "Wash the area if possible.",
      "Put on a bandage.",
      "Raise the hand if it is safe.",
      "Get adult help if bleeding continues."
    ]
  },
  {
    goal: "Burns basics",
    bot: () => "You touched something hot. What should you do?",
    replies: () => [
      "Cool it with running water.",
      "Do not put ice directly on it.",
      "Tell an adult.",
      "Keep the area clean.",
      "Seek help if it looks serious."
    ]
  }
];
var HABITS_CAT = [
  ...L12.filter((t) => t.goal === "Rest and care"),
  ...L22.filter((t) => t.goal === "Healthy habits"),
  ...L32.filter((t) => t.goal === "Rest advice"),
  ...L42.filter((t) => t.goal === "Prevention" || t.goal === "School and recovery"),
  ...L52.filter((t) => t.goal === "Healthy routines"),
  ...L62.filter((t) => t.goal === "Lifestyle counseling"),
  {
    goal: "Sleep habits",
    bot: () => "How many hours do you usually sleep?",
    replies: () => [
      "About seven to eight hours.",
      "Less than I need.",
      "I go to bed too late.",
      "I sleep well most nights.",
      "I want to improve my sleep."
    ]
  },
  {
    goal: "Exercise habits",
    bot: () => "How often do you exercise each week?",
    replies: () => [
      "Three or four times a week.",
      "Almost every day.",
      "Only on weekends.",
      "Not enough right now.",
      "I walk to school most days."
    ]
  }
];
var APPOINTMENTS_CAT = [
  ...L12.filter((t) => t.goal === "Parents and help"),
  ...L22.filter((t) => t.goal === "Appointments"),
  ...L32.filter((t) => t.goal === "Follow-up"),
  ...L42.filter(
    (t) => ["Booking an appointment", "Explaining the problem", "Consent and comfort"].includes(t.goal)
  ),
  ...L52.filter((t) => t.goal === "Follow-up planning" || t.goal === "Clinic manners"),
  ...L62.filter((t) => t.goal === "Consent" || t.goal === "Closing the visit")
];
var WELLNESS_CAT = [
  ...L52.filter(
    (t) => ["Teen wellness", "Asking for help", "Privacy", "Mental health English"].includes(t.goal)
  ),
  {
    goal: "Stress talk",
    bot: () => "What usually makes you feel stressed?",
    replies: () => [
      "School deadlines.",
      "Not sleeping enough.",
      "Too many messages and notifications.",
      "Arguments at home.",
      "Feeling behind in class."
    ]
  },
  {
    goal: "Support language",
    bot: () => "Who can you talk to when you feel low?",
    replies: () => [
      "A trusted family member.",
      "A school counselor.",
      "A close friend.",
      "A teacher I trust.",
      "I am still looking for someone."
    ]
  },
  {
    goal: "Calming strategies",
    bot: () => "What helps you calm down?",
    replies: () => [
      "Slow breathing.",
      "A short walk.",
      "Writing my thoughts down.",
      "Listening to quiet music.",
      "Talking to someone I trust."
    ]
  },
  {
    goal: "Asking gently",
    bot: () => "How can you ask for support politely?",
    replies: () => [
      "Could I talk to you for a minute?",
      "I am struggling and need advice.",
      "Would you have time to listen later?",
      "I need help with stress management.",
      "Can we discuss how I have been feeling?"
    ]
  }
];
var BY_LEVEL2 = {
  1: SYMPTOMS_CAT,
  2: PHARMACY_CAT,
  3: EMERGENCY_CAT,
  4: HABITS_CAT,
  5: APPOINTMENTS_CAT,
  6: WELLNESS_CAT
};
function generateDoctorTurn(level, id) {
  const index = (id % BANK_SIZE + BANK_SIZE) % BANK_SIZE;
  const templates = BY_LEVEL2[level];
  const template = templates[index % templates.length];
  const ctx = makeCtx2(level, index);
  const seed = level * 700019 + index * 131;
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five2(template.replies(ctx), seed);
  return {
    id: index,
    level,
    bot_message: template.bot(ctx),
    reply_1,
    reply_2,
    reply_3,
    reply_4,
    reply_5,
    learning_goal: template.goal
  };
}

// scripts/export-csv.ts
var root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
var HEADER = [
  "bot_message",
  "reply_1",
  "reply_2",
  "reply_3",
  "reply_4",
  "reply_5"
];
var ENGLISH_FILES = [
  { level: 1, file: "level-1-ages-3-5.csv" },
  { level: 2, file: "level-2-ages-6-8.csv" },
  { level: 3, file: "level-3-ages-9-10.csv" },
  { level: 4, file: "level-4-ages-11-12.csv" },
  { level: 5, file: "level-5-ages-13-15.csv" },
  { level: 6, file: "level-6-ages-15-plus.csv" }
];
var DOCTOR_FILES = Object.entries(DOCTOR_CSV_FILES).map(([level, file]) => ({ level: Number(level), file }));
function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
function writeBank(filePath, makeRow, level) {
  const stream = createWriteStream(filePath, { encoding: "utf8" });
  return new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.write(`${HEADER.join(",")}
`);
    let index = 0;
    const chunkSize = 400;
    const pump = () => {
      let chunk = "";
      const end = Math.min(BANK_SIZE, index + chunkSize);
      for (; index < end; index++) {
        chunk += makeRow(level, index).map(csvCell).join(",");
        chunk += "\n";
      }
      const ok = stream.write(chunk);
      if (index >= BANK_SIZE) {
        stream.end(() => resolve());
        return;
      }
      if (ok) setImmediate(pump);
      else stream.once("drain", pump);
    };
    pump();
  });
}
async function clearOldDoctorFiles(outDir) {
  const files = await readdir(outDir).catch(() => []);
  for (const file of files) {
    if (file.startsWith("level-") && file.endsWith(".csv")) {
      await unlink(path.join(outDir, file));
    }
  }
}
async function exportMode(mode, files, makeRow) {
  const outDir = path.join(root, "csv", mode);
  await mkdir(outDir, { recursive: true });
  if (mode === "doctor") await clearOldDoctorFiles(outDir);
  for (const item of files) {
    const filePath = path.join(outDir, item.file);
    const started = Date.now();
    process.stdout.write(`[${mode}] Writing ${item.file}...
`);
    await writeBank(filePath, makeRow, item.level);
    process.stdout.write(
      `[${mode}] Done ${item.file} in ${((Date.now() - started) / 1e3).toFixed(1)}s
`
    );
  }
}
var only = process.argv[2];
if (!only || only === "all" || only === "english") {
  await exportMode("english", ENGLISH_FILES, (level, index) => {
    const turn = generateChatTurn(level, index);
    return [
      turn.bot_message,
      turn.reply_1,
      turn.reply_2,
      turn.reply_3,
      turn.reply_4,
      turn.reply_5
    ];
  });
}
if (!only || only === "all" || only === "doctor") {
  await exportMode("doctor", DOCTOR_FILES, (level, index) => {
    const turn = generateDoctorTurn(level, index);
    return [
      turn.bot_message,
      turn.reply_1,
      turn.reply_2,
      turn.reply_3,
      turn.reply_4,
      turn.reply_5
    ];
  });
}
process.stdout.write("CSV export finished.\n");
