// ../../scripts/export-english-age.ts
import { createWriteStream, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ../../src/data/banks.ts
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

// ../../src/types.ts
var BANK_SIZE = 1e5;

// ../../src/engine/rng.ts
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

// ../../src/engine/helpers.ts
function cap(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ../../src/engine/topics.ts
function build(names) {
  return names.map((name, i) => ({ id: i + 1, name }));
}
var TOPICS_BY_LEVEL = {
  1: build([
    "at home",
    "at preschool",
    "at the park",
    "at the playground",
    "at the zoo",
    "on a farm",
    "at the shop",
    "in the living room",
    "in the kitchen",
    "outside",
    "with mom",
    "with dad",
    "with grandma",
    "with family",
    "with friends",
    "playtime",
    "snack time",
    "story time",
    "bath time",
    "bedtime",
    "morning",
    "afternoon",
    "evening",
    "toy time",
    "animal time",
    "color time",
    "counting time",
    "singing time",
    "drawing time",
    "mealtime"
  ]),
  2: build([
    "at home",
    "at school",
    "on the way to school",
    "on the way from school",
    "after school",
    "before school",
    "in the classroom",
    "during break",
    "at lunch",
    "at the park",
    "at the playground",
    "at the shop",
    "at the zoo",
    "on a farm",
    "in the living room",
    "in the kitchen",
    "outside",
    "with family",
    "with friends",
    "with teacher",
    "morning",
    "afternoon",
    "evening",
    "weekend",
    "mealtime",
    "playtime",
    "homework time",
    "art time",
    "math time",
    "reading time",
    "shopping",
    "sports day"
  ]),
  3: build([
    "at home",
    "at school",
    "on the way to school",
    "on the way from school",
    "after school",
    "in the classroom",
    "during break",
    "at lunch",
    "at the library",
    "at the park",
    "at the shop",
    "at a caf\xE9",
    "at a restaurant",
    "at a sports club",
    "at a birthday party",
    "outside",
    "in town",
    "on the bus",
    "with family",
    "with friends",
    "with classmates",
    "morning",
    "afternoon",
    "evening",
    "weekend",
    "homework time",
    "club time",
    "weekend plans",
    "shopping",
    "mealtime",
    "practice time"
  ]),
  4: build([
    "at home",
    "at school",
    "on the way to school",
    "on the way from school",
    "after school",
    "in the classroom",
    "during break",
    "at lunch",
    "at the library",
    "at the park",
    "at a caf\xE9",
    "at a sports club",
    "at a club meeting",
    "group project",
    "outside",
    "in town",
    "on the bus",
    "online",
    "with family",
    "with friends",
    "with classmates",
    "morning",
    "afternoon",
    "evening",
    "weekend",
    "homework time",
    "study group",
    "before a test",
    "presentation day",
    "travel talk",
    "shopping"
  ]),
  5: build([
    "at home",
    "at school",
    "on the way to school",
    "on the way from school",
    "after school",
    "in the classroom",
    "during break",
    "at the library",
    "at a caf\xE9",
    "at a sports club",
    "at the mall",
    "at a party",
    "hanging out",
    "online",
    "on social media",
    "on the bus",
    "in town",
    "with family",
    "with friends",
    "with classmates",
    "morning",
    "afternoon",
    "evening",
    "weekend",
    "exam week",
    "before a test",
    "homework time",
    "study group",
    "part-time job talk",
    "future plans",
    "group chat"
  ]),
  6: build([
    "at home",
    "at university",
    "at work",
    "at the office",
    "in a meeting",
    "at an interview",
    "at a caf\xE9",
    "at the library",
    "in a seminar",
    "online",
    "on a video call",
    "in town",
    "on a trip",
    "at the airport",
    "with family",
    "with friends",
    "with classmates",
    "with colleagues",
    "with a client",
    "morning",
    "afternoon",
    "evening",
    "weekend",
    "study group",
    "career talk",
    "job interview",
    "team project",
    "formal email",
    "networking",
    "presentation",
    "after class"
  ])
};
var BY_LEVEL_ID = /* @__PURE__ */ new Map();
var BY_LEVEL_NAME = /* @__PURE__ */ new Map();
for (const level of [1, 2, 3, 4, 5, 6]) {
  const rows = TOPICS_BY_LEVEL[level];
  BY_LEVEL_ID.set(level, new Map(rows.map((t) => [t.id, t.name])));
  BY_LEVEL_NAME.set(level, new Map(rows.map((t) => [t.name, t.id])));
}
function getTopics(level) {
  return TOPICS_BY_LEVEL[level];
}
function topicId(level, name) {
  const id = BY_LEVEL_NAME.get(level)?.get(name);
  if (id == null) throw new Error(`Unknown topic for level ${level}: ${name}`);
  return id;
}
var TOPICS = TOPICS_BY_LEVEL[2];

// ../../src/engine/categories.ts
function T(level, a, b, c) {
  return [topicId(level, a), topicId(level, b), topicId(level, c)];
}
var L1 = {
  "Speaking and introductions": [
    T(1, "at home", "with family", "morning"),
    T(1, "at preschool", "with friends", "morning"),
    T(1, "at the park", "with mom", "afternoon"),
    T(1, "at home", "with dad", "evening")
  ],
  Colors: [
    T(1, "at home", "color time", "playtime"),
    T(1, "at preschool", "drawing time", "with friends"),
    T(1, "at the park", "outside", "with family")
  ],
  Animals: [
    T(1, "at the zoo", "animal time", "with family"),
    T(1, "on a farm", "animal time", "with dad"),
    T(1, "at home", "toy time", "playtime")
  ],
  Food: [
    T(1, "at home", "in the kitchen", "mealtime"),
    T(1, "at home", "snack time", "with mom"),
    T(1, "at preschool", "snack time", "with friends")
  ],
  "Toys and play": [
    T(1, "at home", "toy time", "playtime"),
    T(1, "at the playground", "with friends", "afternoon"),
    T(1, "at the park", "outside", "with family")
  ],
  Numbers: [
    T(1, "at preschool", "counting time", "with friends"),
    T(1, "at home", "counting time", "playtime"),
    T(1, "at the shop", "with mom", "afternoon")
  ],
  Family: [
    T(1, "at home", "with family", "evening"),
    T(1, "at home", "with grandma", "afternoon"),
    T(1, "in the living room", "with mom", "story time")
  ],
  Places: [
    T(1, "at the park", "outside", "with family"),
    T(1, "at home", "with family", "evening"),
    T(1, "at preschool", "with friends", "morning")
  ],
  Actions: [
    T(1, "at the playground", "playtime", "with friends"),
    T(1, "at home", "playtime", "with dad"),
    T(1, "outside", "at the park", "afternoon")
  ],
  "Polite talk": [
    T(1, "at home", "mealtime", "with family"),
    T(1, "at preschool", "with friends", "snack time"),
    T(1, "at the shop", "with mom", "afternoon")
  ]
};
var L2 = {
  "Speaking and introductions": [
    T(2, "at home", "with family", "morning"),
    T(2, "at school", "in the classroom", "with friends"),
    T(2, "on the way to school", "with friends", "morning"),
    T(2, "on the way from school", "after school", "with friends")
  ],
  "School vocabulary": [
    T(2, "at school", "in the classroom", "with teacher"),
    T(2, "at school", "during break", "with friends"),
    T(2, "on the way to school", "before school", "morning"),
    T(2, "at school", "art time", "with friends")
  ],
  "Daily talk": [
    T(2, "at home", "morning", "before school"),
    T(2, "on the way to school", "morning", "with friends"),
    T(2, "at school", "in the classroom", "morning"),
    T(2, "on the way from school", "afternoon", "after school")
  ],
  Weather: [
    T(2, "outside", "on the way to school", "morning"),
    T(2, "at the park", "outside", "afternoon"),
    T(2, "at home", "with family", "morning")
  ],
  "Food and likes": [
    T(2, "at home", "in the kitchen", "mealtime"),
    T(2, "at school", "at lunch", "with friends"),
    T(2, "at home", "with family", "evening")
  ],
  Family: [
    T(2, "at home", "with family", "evening"),
    T(2, "in the living room", "with family", "weekend"),
    T(2, "on the way from school", "with family", "afternoon")
  ],
  Hobbies: [
    T(2, "at home", "playtime", "after school"),
    T(2, "at the park", "with friends", "weekend"),
    T(2, "at school", "during break", "with friends"),
    T(2, "sports day", "at school", "afternoon")
  ],
  Places: [
    T(2, "on the way to school", "outside", "morning"),
    T(2, "at the park", "with friends", "afternoon"),
    T(2, "at the shop", "shopping", "with family"),
    T(2, "at the zoo", "weekend", "with family")
  ],
  "Polite talk": [
    T(2, "at school", "in the classroom", "with teacher"),
    T(2, "at the shop", "shopping", "with family"),
    T(2, "at home", "mealtime", "with family")
  ]
};
var L3 = {
  "Speaking and introductions": [
    T(3, "at school", "in the classroom", "with friends"),
    T(3, "at home", "with family", "evening"),
    T(3, "on the way to school", "with friends", "morning")
  ],
  "Past experiences": [
    T(3, "at home", "with family", "evening"),
    T(3, "at school", "in the classroom", "with classmates"),
    T(3, "at the park", "weekend", "with friends")
  ],
  "School life": [
    T(3, "at school", "in the classroom", "afternoon"),
    T(3, "during break", "with friends", "at school"),
    T(3, "on the way from school", "after school", "with friends")
  ],
  "Reasons and because": [
    T(3, "at school", "with friends", "during break"),
    T(3, "at home", "with family", "evening"),
    T(3, "at a sports club", "practice time", "afternoon")
  ],
  Comparisons: [
    T(3, "at school", "in the classroom", "with classmates"),
    T(3, "at the park", "outside", "with friends"),
    T(3, "at home", "homework time", "evening")
  ],
  Feelings: [
    T(3, "at home", "with family", "evening"),
    T(3, "at school", "in the classroom", "morning"),
    T(3, "on the way to school", "with friends", "morning")
  ],
  "Weekend plans": [
    T(3, "at home", "weekend plans", "with family"),
    T(3, "at school", "with friends", "afternoon"),
    T(3, "at a caf\xE9", "weekend", "with friends")
  ],
  "Food and preferences": [
    T(3, "at home", "mealtime", "with family"),
    T(3, "at school", "at lunch", "with friends"),
    T(3, "at a restaurant", "with family", "evening")
  ],
  Directions: [
    T(3, "on the way to school", "outside", "morning"),
    T(3, "in town", "with friends", "afternoon"),
    T(3, "on the bus", "after school", "with classmates")
  ],
  Stories: [
    T(3, "at school", "in the classroom", "with classmates"),
    T(3, "at the library", "after school", "homework time"),
    T(3, "at home", "with family", "evening")
  ],
  Opinions: [
    T(3, "at school", "with friends", "during break"),
    T(3, "at home", "with family", "evening"),
    T(3, "at a birthday party", "with friends", "weekend")
  ],
  "Daily routines": [
    T(3, "at home", "morning", "on the way to school"),
    T(3, "on the way to school", "morning", "with friends"),
    T(3, "at home", "evening", "homework time")
  ]
};
var L4_ONLY = {
  Conversations: [
    T(4, "at school", "after school", "with friends"),
    T(4, "at a caf\xE9", "afternoon", "with friends"),
    T(4, "on the way from school", "with classmates", "afternoon")
  ],
  "First conditional": [
    T(4, "at school", "in the classroom", "with classmates"),
    T(4, "at home", "weekend", "with family"),
    T(4, "outside", "on the way to school", "morning")
  ],
  "Opinions and reasons": [
    T(4, "at school", "in the classroom", "with classmates"),
    T(4, "at a caf\xE9", "with friends", "afternoon"),
    T(4, "online", "with friends", "evening")
  ],
  Advice: [
    T(4, "at school", "before a test", "with friends"),
    T(4, "at home", "homework time", "with family"),
    T(4, "at the library", "study group", "after school")
  ],
  "Phrasal verbs": [
    T(4, "at school", "during break", "with friends"),
    T(4, "on the bus", "on the way to school", "morning"),
    T(4, "at home", "with family", "evening")
  ],
  "School projects": [
    T(4, "at school", "group project", "with classmates"),
    T(4, "at the library", "study group", "after school"),
    T(4, "online", "group project", "evening")
  ],
  "Making suggestions": [
    T(4, "after school", "with friends", "at a caf\xE9"),
    T(4, "at school", "during break", "with classmates"),
    T(4, "weekend", "at the park", "with friends")
  ],
  "Describing people": [
    T(4, "at school", "in the classroom", "with friends"),
    T(4, "at a club meeting", "with classmates", "afternoon"),
    T(4, "at home", "with family", "evening")
  ],
  "Travel talk": [
    T(4, "at home", "travel talk", "weekend"),
    T(4, "at school", "in the classroom", "with classmates"),
    T(4, "in town", "with family", "weekend")
  ],
  "Problem solving": [
    T(4, "at school", "with friends", "during break"),
    T(4, "on the bus", "on the way to school", "morning"),
    T(4, "at home", "homework time", "evening")
  ]
};
var L4 = {
  "Speaking and introductions": [
    T(4, "at school", "in the classroom", "with friends"),
    T(4, "at home", "with family", "evening"),
    T(4, "on the way to school", "with friends", "morning")
  ],
  "Past experiences": [
    T(4, "at home", "with family", "evening"),
    T(4, "at school", "in the classroom", "with classmates"),
    T(4, "at the park", "weekend", "with friends")
  ],
  "School life": [
    T(4, "at school", "in the classroom", "afternoon"),
    T(4, "during break", "with friends", "at school"),
    T(4, "on the way from school", "after school", "with friends")
  ],
  "Reasons and because": [
    T(4, "at school", "with friends", "during break"),
    T(4, "at home", "with family", "evening"),
    T(4, "at a sports club", "after school", "with friends")
  ],
  Comparisons: [
    T(4, "at school", "in the classroom", "with classmates"),
    T(4, "at the park", "outside", "with friends"),
    T(4, "at home", "homework time", "evening")
  ],
  Feelings: [
    T(4, "at home", "with family", "evening"),
    T(4, "at school", "before a test", "morning"),
    T(4, "on the way to school", "with friends", "morning")
  ],
  "Weekend plans": [
    T(4, "at home", "weekend", "with family"),
    T(4, "at school", "with friends", "afternoon"),
    T(4, "at a caf\xE9", "weekend", "with friends")
  ],
  "Food and preferences": [
    T(4, "at home", "with family", "evening"),
    T(4, "at school", "at lunch", "with friends"),
    T(4, "at a caf\xE9", "afternoon", "with friends")
  ],
  Directions: [
    T(4, "on the way to school", "outside", "morning"),
    T(4, "in town", "with friends", "afternoon"),
    T(4, "on the bus", "after school", "with classmates")
  ],
  Stories: [
    T(4, "at school", "in the classroom", "with classmates"),
    T(4, "at the library", "after school", "homework time"),
    T(4, "at home", "with family", "evening")
  ],
  Opinions: [
    T(4, "at school", "with friends", "during break"),
    T(4, "at home", "with family", "evening"),
    T(4, "online", "with friends", "evening")
  ],
  "Daily routines": [
    T(4, "at home", "morning", "on the way to school"),
    T(4, "on the way to school", "morning", "with friends"),
    T(4, "at home", "evening", "homework time")
  ],
  ...L4_ONLY
};
var L5_ONLY = {
  "Teen conversation": [
    T(5, "at school", "during break", "with friends"),
    T(5, "after school", "at a caf\xE9", "with friends"),
    T(5, "online", "group chat", "evening")
  ],
  "Idioms in chat": [
    T(5, "at school", "with friends", "during break"),
    T(5, "at a caf\xE9", "hanging out", "afternoon"),
    T(5, "on social media", "with friends", "evening")
  ],
  "School stress": [
    T(5, "at school", "exam week", "before a test"),
    T(5, "at home", "homework time", "evening"),
    T(5, "at the library", "study group", "after school")
  ],
  "Hobbies and identity": [
    T(5, "at a sports club", "after school", "with friends"),
    T(5, "at home", "evening", "online"),
    T(5, "hanging out", "at the mall", "weekend")
  ],
  "Agreeing and disagreeing": [
    T(5, "at school", "in the classroom", "with classmates"),
    T(5, "at a caf\xE9", "with friends", "afternoon"),
    T(5, "online", "group chat", "evening")
  ],
  "Problem talk": [
    T(5, "at school", "with classmates", "group chat"),
    T(5, "at home", "with family", "evening"),
    T(5, "online", "with classmates", "evening")
  ],
  "Future goals": [
    T(5, "at school", "in the classroom", "with classmates"),
    T(5, "at home", "future plans", "with family"),
    T(5, "at a caf\xE9", "with friends", "afternoon")
  ],
  "News and society": [
    T(5, "at school", "in the classroom", "with classmates"),
    T(5, "at home", "with family", "evening"),
    T(5, "online", "on social media", "evening")
  ],
  "Everyday English": [
    T(5, "after school", "hanging out", "at a caf\xE9"),
    T(5, "on the way from school", "with friends", "afternoon"),
    T(5, "at the mall", "weekend", "with friends")
  ]
};
var L5 = {
  Conversations: [
    T(5, "at school", "after school", "with friends"),
    T(5, "at a caf\xE9", "hanging out", "afternoon"),
    T(5, "online", "group chat", "evening")
  ],
  "First conditional": [
    T(5, "at school", "exam week", "with friends"),
    T(5, "at home", "weekend", "with family"),
    T(5, "on the way to school", "morning", "with friends")
  ],
  "Opinions and reasons": [
    T(5, "at school", "in the classroom", "with classmates"),
    T(5, "at a caf\xE9", "with friends", "afternoon"),
    T(5, "online", "on social media", "evening")
  ],
  Advice: [
    T(5, "at school", "before a test", "with friends"),
    T(5, "at home", "homework time", "evening"),
    T(5, "at the library", "study group", "after school")
  ],
  "Phrasal verbs": [
    T(5, "at school", "during break", "with friends"),
    T(5, "on the bus", "on the way to school", "morning"),
    T(5, "hanging out", "at a caf\xE9", "afternoon")
  ],
  "School projects": [
    T(5, "at school", "with classmates", "in the classroom"),
    T(5, "at the library", "study group", "after school"),
    T(5, "online", "with classmates", "evening")
  ],
  "Making suggestions": [
    T(5, "after school", "at a caf\xE9", "with friends"),
    T(5, "at the mall", "weekend", "with friends"),
    T(5, "online", "group chat", "evening")
  ],
  "Describing people": [
    T(5, "at school", "with friends", "during break"),
    T(5, "at a party", "with friends", "weekend"),
    T(5, "online", "with friends", "evening")
  ],
  "Travel talk": [
    T(5, "at home", "future plans", "with family"),
    T(5, "at school", "with classmates", "in the classroom"),
    T(5, "in town", "weekend", "with friends")
  ],
  "Problem solving": [
    T(5, "at school", "with friends", "during break"),
    T(5, "on the bus", "on the way to school", "morning"),
    T(5, "at home", "with family", "evening")
  ],
  Opinions: [
    T(5, "at school", "in the classroom", "with classmates"),
    T(5, "at a caf\xE9", "with friends", "afternoon"),
    T(5, "online", "on social media", "evening")
  ],
  ...L5_ONLY
};
var L6 = {
  "Teen conversation": [
    T(6, "at university", "after class", "with friends"),
    T(6, "at a caf\xE9", "with classmates", "afternoon"),
    T(6, "online", "with friends", "evening")
  ],
  Opinions: [
    T(6, "at university", "in a seminar", "with classmates"),
    T(6, "at a caf\xE9", "with friends", "afternoon"),
    T(6, "online", "with colleagues", "evening")
  ],
  "Idioms in chat": [
    T(6, "at a caf\xE9", "with friends", "afternoon"),
    T(6, "online", "with classmates", "evening"),
    T(6, "at university", "after class", "with friends")
  ],
  "School stress": [
    T(6, "at university", "study group", "at the library"),
    T(6, "at home", "evening", "with family"),
    T(6, "online", "with classmates", "evening")
  ],
  "Hobbies and identity": [
    T(6, "at home", "weekend", "with friends"),
    T(6, "in town", "with friends", "afternoon"),
    T(6, "online", "with friends", "evening")
  ],
  "Agreeing and disagreeing": [
    T(6, "in a seminar", "at university", "with classmates"),
    T(6, "at a caf\xE9", "with friends", "afternoon"),
    T(6, "in a meeting", "at work", "with colleagues")
  ],
  "Problem talk": [
    T(6, "at university", "team project", "with classmates"),
    T(6, "at work", "with colleagues", "afternoon"),
    T(6, "online", "on a video call", "evening")
  ],
  "Future goals": [
    T(6, "at an interview", "career talk", "morning"),
    T(6, "at university", "with classmates", "after class"),
    T(6, "at home", "with family", "evening")
  ],
  "News and society": [
    T(6, "at university", "in a seminar", "with classmates"),
    T(6, "at a caf\xE9", "with friends", "afternoon"),
    T(6, "online", "with classmates", "evening")
  ],
  "Everyday English": [
    T(6, "at a caf\xE9", "with friends", "afternoon"),
    T(6, "in town", "weekend", "with friends"),
    T(6, "at home", "with family", "evening")
  ],
  "Professional English": [
    T(6, "at work", "in a meeting", "morning"),
    T(6, "at an interview", "job interview", "morning"),
    T(6, "at the office", "with colleagues", "afternoon")
  ],
  "Meetings and collaboration": [
    T(6, "at work", "in a meeting", "morning"),
    T(6, "at the office", "team project", "with colleagues"),
    T(6, "online", "on a video call", "morning")
  ],
  "Academic discussion": [
    T(6, "at university", "in a seminar", "with classmates"),
    T(6, "at the library", "study group", "afternoon"),
    T(6, "at a caf\xE9", "with classmates", "afternoon")
  ],
  "Register and tone": [
    T(6, "at university", "formal email", "morning"),
    T(6, "at work", "with a client", "afternoon"),
    T(6, "online", "formal email", "evening")
  ],
  "Workplace chat": [
    T(6, "at work", "with a client", "afternoon"),
    T(6, "at the office", "with colleagues", "afternoon"),
    T(6, "in a meeting", "presentation", "morning")
  ],
  "Debate and nuance": [
    T(6, "at university", "in a seminar", "with classmates"),
    T(6, "at a caf\xE9", "with friends", "afternoon"),
    T(6, "at work", "in a meeting", "afternoon")
  ],
  "Collocations in context": [
    T(6, "at work", "in a meeting", "afternoon"),
    T(6, "at university", "in a seminar", "with classmates"),
    T(6, "at a caf\xE9", "study group", "afternoon")
  ],
  "Interview English": [
    T(6, "at an interview", "job interview", "morning"),
    T(6, "at the office", "career talk", "afternoon"),
    T(6, "online", "on a video call", "afternoon")
  ],
  "Social English": [
    T(6, "at a caf\xE9", "with friends", "afternoon"),
    T(6, "networking", "with colleagues", "evening"),
    T(6, "at home", "with family", "weekend")
  ],
  "Problem solving": [
    T(6, "at work", "team project", "with colleagues"),
    T(6, "at university", "with classmates", "study group"),
    T(6, "online", "on a video call", "evening")
  ]
};
var FALLBACK = {
  1: [
    T(1, "at home", "with family", "playtime"),
    T(1, "at preschool", "with friends", "morning"),
    T(1, "at the park", "with mom", "afternoon")
  ],
  2: [
    T(2, "at home", "with family", "morning"),
    T(2, "at school", "with friends", "in the classroom"),
    T(2, "on the way to school", "morning", "with friends")
  ],
  3: [
    T(3, "at school", "with friends", "in the classroom"),
    T(3, "at home", "with family", "evening"),
    T(3, "on the way to school", "morning", "with friends")
  ],
  4: [
    T(4, "at school", "with friends", "after school"),
    T(4, "at home", "with family", "evening"),
    T(4, "at a caf\xE9", "with friends", "afternoon")
  ],
  5: [
    T(5, "at school", "with friends", "after school"),
    T(5, "at a caf\xE9", "hanging out", "afternoon"),
    T(5, "online", "group chat", "evening")
  ],
  6: [
    T(6, "at university", "with classmates", "after class"),
    T(6, "at work", "with colleagues", "morning"),
    T(6, "at a caf\xE9", "with friends", "afternoon")
  ]
};
var BY_LEVEL = {
  1: L1,
  2: L2,
  3: L3,
  4: L4,
  5: L5,
  6: L6
};
function topicsForGoal(goal, index = 0, level = 2) {
  const pool = BY_LEVEL[level][goal] ?? FALLBACK[level];
  const triple = pool[(index % pool.length + pool.length) % pool.length];
  return {
    topic1: triple[0],
    topic2: triple[1],
    topic3: triple[2]
  };
}

// ../../src/engine/chatTurns.ts
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
var L12 = [
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
var L22 = [
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
var L32 = [
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
var L42 = [
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
var L52 = [
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
var L62 = [
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
var BY_LEVEL2 = {
  1: L12,
  2: L22,
  3: L32,
  4: [...L32, ...L42],
  5: [...L42, ...L52],
  6: [...L52, ...L62]
};
function generateChatTurn(level, id, bankSize = BANK_SIZE) {
  const size = Math.max(1, Math.floor(bankSize));
  const index = (id % size + size) % size;
  const templates = BY_LEVEL2[level];
  const template = templates[index % templates.length];
  const ctx = makeCtx(level, index);
  const seed = level * 1000003 + index * 97;
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five(template.replies(ctx), seed);
  const topics = topicsForGoal(template.goal, index, level);
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
    topic3: topics.topic3
  };
}

// ../../scripts/export-english-age.ts
var root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
var HEADER = [
  "bot_message",
  "reply_1",
  "reply_2",
  "reply_3",
  "reply_4",
  "reply_5",
  "topic1",
  "topic2",
  "topic3"
];
var AGE_LEVELS = {
  "03-05": { level: 1, folder: "ages-03-05" },
  "06-08": { level: 2, folder: "ages-06-08" },
  "09-10": { level: 3, folder: "ages-09-10" },
  "11-12": { level: 4, folder: "ages-11-12" },
  "13-15": { level: 5, folder: "ages-13-15" },
  "15-plus": { level: 6, folder: "ages-15-plus" }
};
function normalizeAgeKey(raw) {
  const aliases = {
    "3-5": "03-05",
    "6-8": "06-08",
    "9-10": "09-10"
  };
  return aliases[raw] ?? raw;
}
function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
function parseArgs(argv) {
  const rawKey = argv[2];
  const ageKey = rawKey ? normalizeAgeKey(rawKey) : rawKey;
  let total2 = 1e6;
  let rowsPerFile2 = 1e5;
  for (const arg of argv.slice(3)) {
    if (arg.startsWith("--total=")) total2 = Number(arg.slice("--total=".length));
    if (arg.startsWith("--rows=")) rowsPerFile2 = Number(arg.slice("--rows=".length));
  }
  if (!ageKey || ageKey !== "all" && !AGE_LEVELS[ageKey]) {
    process.stderr.write(
      `Usage: node scripts/export-english-age.mjs <all|${Object.keys(AGE_LEVELS).join("|")}> [--total=1000000] [--rows=100000]
`
    );
    process.exit(1);
  }
  if (!Number.isFinite(total2) || total2 < 1) {
    process.stderr.write("Invalid --total\n");
    process.exit(1);
  }
  if (!Number.isFinite(rowsPerFile2) || rowsPerFile2 < 1) {
    process.stderr.write("Invalid --rows\n");
    process.exit(1);
  }
  const jobs2 = ageKey === "all" ? Object.entries(AGE_LEVELS).map(([key, meta]) => ({ ageKey: key, ...meta })) : [{ ageKey, ...AGE_LEVELS[ageKey] }];
  return { jobs: jobs2, total: Math.floor(total2), rowsPerFile: Math.floor(rowsPerFile2) };
}
async function exportAge(opts) {
  const { ageKey, level, folder, total: total2, rowsPerFile: rowsPerFile2 } = opts;
  const outDir = path.join(root, "csv", "english", folder);
  await mkdir(outDir, { recursive: true });
  const topics = getTopics(level);
  const topicsPath = path.join(outDir, "topics.csv");
  writeFileSync(
    topicsPath,
    `${["topic_id,topic", ...topics.map((t) => `${t.id},${csvCell(t.name)}`)].join("\n")}
`,
    "utf8"
  );
  process.stdout.write(`[${folder}] Wrote topics.csv (${topics.length} topics)
`);
  const partCount = Math.ceil(total2 / rowsPerFile2);
  process.stdout.write(
    `[${folder}] Generating ${total2.toLocaleString()} chats for ages ${ageKey} (level ${level}) in ${partCount} parts \xD7 ${rowsPerFile2.toLocaleString()} rows
`
  );
  const startedAll = Date.now();
  for (let part = 0; part < partCount; part++) {
    const startId = part * rowsPerFile2;
    const endId = Math.min(total2, startId + rowsPerFile2);
    const partNo = String(part + 1).padStart(2, "0");
    const fileName = `part-${partNo}.csv`;
    const filePath = path.join(outDir, fileName);
    const started = Date.now();
    process.stdout.write(`[${folder}] Writing ${fileName} (rows ${startId + 1}\u2013${endId})...
`);
    await writePart(filePath, level, total2, startId, endId);
    process.stdout.write(
      `[${folder}] Done ${fileName} in ${((Date.now() - started) / 1e3).toFixed(1)}s
`
    );
  }
  const manifest = {
    ages: ageKey,
    level,
    total_rows: total2,
    rows_per_file: rowsPerFile2,
    part_count: partCount,
    columns: HEADER,
    topics_file: "topics.csv",
    topic_count: topics.length,
    files: Array.from({ length: partCount }, (_, i) => `part-${String(i + 1).padStart(2, "0")}.csv`)
  };
  writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}
`, "utf8");
  process.stdout.write(
    `[${folder}] Finished ${total2.toLocaleString()} rows in ${((Date.now() - startedAll) / 1e3).toFixed(1)}s
`
  );
}
var { jobs, total, rowsPerFile } = parseArgs(process.argv);
for (const job of jobs) {
  await exportAge({ ...job, total, rowsPerFile });
}
process.stdout.write("English age export finished.\n");
function writePart(filePath, level, bankSize, startId, endIdExclusive) {
  const stream = createWriteStream(filePath, { encoding: "utf8" });
  return new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.write(`${HEADER.join(",")}
`);
    let index = startId;
    const chunkSize = 400;
    const pump = () => {
      let chunk = "";
      const end = Math.min(endIdExclusive, index + chunkSize);
      for (; index < end; index++) {
        const turn = generateChatTurn(level, index, bankSize);
        chunk += [
          turn.bot_message,
          turn.reply_1,
          turn.reply_2,
          turn.reply_3,
          turn.reply_4,
          turn.reply_5,
          turn.topic1,
          turn.topic2,
          turn.topic3
        ].map(csvCell).join(",");
        chunk += "\n";
      }
      const ok = stream.write(chunk);
      if (index >= endIdExclusive) {
        stream.end(() => resolve());
        return;
      }
      if (ok) setImmediate(pump);
      else stream.once("drain", pump);
    };
    pump();
  });
}
