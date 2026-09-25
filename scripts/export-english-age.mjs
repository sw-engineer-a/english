// scripts/export-english-age.ts
import { createWriteStream, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// src/engine/topics.ts
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

// src/engine/categories.ts
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

// src/engine/uniqueTurns.ts
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
  "geography",
  "drama",
  "coding"
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
  "painting",
  "chess",
  "basketball"
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
  "writer",
  "pilot",
  "farmer"
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
  "Sydney",
  "Singapore",
  "Dubai"
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
  "fine",
  "proud",
  "curious"
];
var TIMES = [
  "this morning",
  "after school",
  "at lunch",
  "in the evening",
  "on Sunday",
  "yesterday",
  "last night",
  "this weekend",
  "before class",
  "during break"
];
var REASONS = [
  "it is fun",
  "it helps me learn",
  "I feel happy",
  "my friends like it",
  "it is useful",
  "I am good at it",
  "it is relaxing",
  "it is exciting"
];
var ADVICE = [
  "review a little every day",
  "ask the teacher for help",
  "sleep well tonight",
  "make a simple plan",
  "practice with a friend",
  "take short breaks",
  "start with easy parts",
  "write key notes"
];
function capacityOf(p) {
  return p.banks.reduce((n, b) => n * Math.max(1, b.length), 1);
}
function slotsFor(p, localIndex) {
  return decodeIndex(localIndex, p.banks.map((b) => b.length)).map((i, bi) => p.banks[bi][i]);
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
  while (unique.length < 5) unique.push("Okay.");
  return [unique[0], unique[1], unique[2], unique[3], unique[4]];
}
function patternsFor(level) {
  const N = [...NAMES];
  const F = [...FOODS];
  const C = [...COLORS];
  const A = [...ANIMALS];
  const T2 = [...TOYS];
  const Num = [...NUMBER_WORDS];
  const Fam = [...FAMILY];
  const P1 = [...L1_PLACES];
  const P2 = [...L2_PLACES];
  const Act1 = [...L1_ACTIONS];
  const Act2 = [...L2_ACTIONS];
  const Day = [...DAYS];
  const W = [...WEATHER];
  const Sch = [...SCHOOL_ITEMS];
  const Obj = [...L2_OBJECTS];
  const Sub = [...SUBJECTS];
  const Hob = [...HOBBIES];
  const Job = [...JOBS];
  const City = [...CITIES];
  const Feel = [...FEELINGS];
  const Time = [...TIMES];
  const Why = [...REASONS];
  const Tip = [...ADVICE];
  const L13 = [
    { goal: "Colors", banks: [C, T2, N, P1], bot: ([c, t, n, p]) => `${n}, point to something ${c} like the ${t} at the ${p}.`, replies: ([c, t]) => [`This ${t} is ${c}.`, `Here is ${c}.`, `${cap(c)}.`, `I found ${c}.`, `The ${t}!`] },
    { goal: "Animals", banks: [A, P1, N, C], bot: ([a, p, n, c]) => `${n}, find the ${c} ${a} at the ${p}.`, replies: ([a, p, , c]) => [`I see a ${c} ${a}.`, `At the ${p}!`, `A ${a}.`, `Here!`, `Looking...`] },
    { goal: "Food", banks: [F, N, Time, P1], bot: ([f, n, t, p]) => `${n}, please choose a snack: do you want ${f} ${t} at the ${p}?`, replies: ([f]) => [`Yes, ${f}.`, `No, thanks.`, `Just a little.`, `Yummy!`, `Later.`] },
    { goal: "Numbers", banks: [Num, T2, N, A], bot: ([num, t, n, a]) => `${n}, count the ${t}s, then count the ${a}s. How many ${t}s? ${cap(num)}?`, replies: ([num, t]) => [`${cap(num)}.`, `${cap(num)} ${t}s.`, `Yes.`, `Let me count.`, `I see ${num}.`] },
    { goal: "Family", banks: [Fam, N, P1, F], bot: ([fam, n, p, f]) => `${n}, show me your ${fam} who likes ${f} at the ${p}.`, replies: ([fam, , p, f]) => [`My ${fam}.`, `This is my ${fam}.`, `At the ${p}.`, `${cap(f)} for my ${fam}.`, `Here!`] },
    { goal: "Places", banks: [P1, N, Time, Act1], bot: ([p, n, t, act]) => `${n}, should we go to the ${p} ${t} to ${act}?`, replies: ([p, , t, act]) => [`Yes, to the ${p}.`, `Let's ${act}.`, `Okay ${t}.`, `Maybe.`, `Home first.`] },
    { goal: "Actions", banks: [Act1, N, P1, T2], bot: ([act, n, p, t]) => `${n}, can you ${act} with the ${t} at the ${p}?`, replies: ([act, , p, t]) => [`Yes, I can ${act}.`, `With the ${t}!`, `At the ${p}.`, `Watch me!`, `A little.`] },
    { goal: "Toys and play", banks: [T2, N, P1, Act1], bot: ([t, n, p, act]) => `${n}, pick a toy for the ${p}: the ${t} so we can ${act}.`, replies: ([t, , , act]) => [`The ${t}.`, `Let's ${act}.`, `Yes!`, `That one.`, `Okay.`] },
    { goal: "Speaking and introductions", banks: [N, N, Feel, P1], bot: ([n, n2, feel, p]) => `At the ${p}, please ask ${n} if ${n2} feels ${feel}.`, replies: ([n, n2, feel]) => [`${n} feels ${feel}.`, `${n2} is okay.`, `I feel ${feel}.`, `Hi!`, `Nice to meet you.`] },
    { goal: "Speaking and introductions", banks: [N, Feel, Time, Fam], bot: ([n, feel, t, fam]) => `${n}, tell your ${fam} how you feel ${t}. Are you ${feel}?`, replies: ([, feel, t, fam]) => [`I feel ${feel}.`, `I told my ${fam}.`, `${cap(t)} I am fine.`, `Yes.`, `A little.`] },
    { goal: "Polite talk", banks: [F, N, P1, Time], bot: ([f, n, p, t]) => `${n}, at the ${p} ${t}, ask politely for ${f}.`, replies: ([f]) => [`May I have ${f}?`, `Please.`, `Thank you.`, `Here you are.`, `Yes, please.`] },
    { goal: "Animals", banks: [A, A, N, P1], bot: ([a1, a2, n, p]) => `${n}, at the ${p}, is the animal a ${a1} or a ${a2}?`, replies: ([a1, a2]) => [`A ${a1}.`, `A ${a2}.`, `I think ${a1}.`, `Not sure.`, `Look again.`] },
    { goal: "Colors", banks: [C, C, T2, N], bot: ([c1, c2, t, n]) => `${n}, is the ${t} ${c1}, or is it ${c2}?`, replies: ([c1, c2, t]) => [`${cap(c1)}.`, `${cap(c2)}.`, `The ${t} is ${c1}.`, `Maybe ${c2}.`, `Both?`] },
    { goal: "Food", banks: [F, F, N, Time], bot: ([f1, f2, n, t]) => `${n}, for ${t}, pick only one: ${f1} or ${f2}?`, replies: ([f1, f2]) => [`${cap(f1)}.`, `${cap(f2)}.`, `Both!`, `Water.`, `Not hungry.`] },
    { goal: "Numbers", banks: [Num, A, N, P1], bot: ([num, a, n, p]) => `${n}, at the ${p}, can you find ${num} ${a}s?`, replies: ([num, a]) => [`Yes!`, `I found ${num}.`, `${cap(num)} ${a}s.`, `Counting...`, `Help me.`] },
    { goal: "Places", banks: [P1, P1, N, Fam], bot: ([p1, p2, n, fam]) => `${n}, your ${fam} asks: are we going to the ${p1} or the ${p2}?`, replies: ([p1, p2, , fam]) => [`The ${p1}.`, `The ${p2}.`, `Ask my ${fam}.`, `Home.`, `Either.`] },
    { goal: "Actions", banks: [Act1, Act1, N, T2], bot: ([a1, a2, n, t]) => `${n}, with the ${t}, should we ${a1} first or ${a2} first?`, replies: ([a1, a2]) => [`${cap(a1)} first.`, `${cap(a2)} first.`, `Both!`, `You choose.`, `Okay.`] },
    { goal: "Toys and play", banks: [T2, Act1, N, Time], bot: ([t, act, n, time]) => `${n}, ${time}, put away the ${t} after you ${act}. Understood?`, replies: ([t, act]) => [`Understood.`, `I will ${act}.`, `Okay.`, `The ${t} goes away.`, `Yes.`] },
    { goal: "Polite talk", banks: [N, T2, P1, Fam], bot: ([n, t, p, fam]) => `${n}, may your ${fam} borrow the ${t} at the ${p}?`, replies: ([, t, , fam]) => [`Yes.`, `Please be careful.`, `Ask my ${fam}.`, `Sure.`, `Here is the ${t}.`] },
    { goal: "Family", banks: [Fam, Fam, N, P1], bot: ([f1, f2, n, p]) => `${n}, at the ${p}, who helps more, your ${f1} or your ${f2}?`, replies: ([f1, f2]) => [`My ${f1}.`, `My ${f2}.`, `Both.`, `I help too.`, `Not sure.`] },
    { goal: "Daily talk", banks: [Day, N, Feel, P1], bot: ([d, n, feel, p]) => `${n}, today is ${d}. At the ${p}, do you feel ${feel}?`, replies: ([d, , feel]) => [`Yes.`, `I feel ${feel}.`, `Today is ${d}.`, `A little.`, `I'm okay.`] },
    { goal: "Weather", banks: [W, P1, N, T2], bot: ([w, p, n, t]) => `${n}, take the ${t} only if it is ${w} at the ${p}. Is it ${w}?`, replies: ([w, p]) => [`Yes, ${w}.`, `No.`, `At the ${p}, maybe.`, `Let's check.`, `A little ${w}.`] },
    { goal: "Food", banks: [F, Time, N, Fam], bot: ([f, t, n, fam]) => `${n}, your ${fam} prepared ${f} ${t}. Will you try it?`, replies: ([f, , , fam]) => [`Yes.`, `Thank you.`, `I love ${f}.`, `My ${fam} cooks well.`, `Later.`] },
    { goal: "Speaking and introductions", banks: [N, P1, Time, Act1], bot: ([n, p, t, act]) => `Say goodbye to ${n} at the ${p} ${t} before you ${act}.`, replies: ([n, , , act]) => [`Bye, ${n}!`, `See you!`, `Goodbye!`, `Okay, I will ${act}.`, `Bye-bye!`] }
  ];
  const L23 = [
    { goal: "School vocabulary", banks: [Sub, N, Sch, Time], bot: ([sub, n, item, t]) => `${n}, for ${sub} ${t}, which item do you need: a ${item}?`, replies: ([sub, , item]) => [`A ${item}.`, `Yes for ${sub}.`, `I have it.`, `Book too.`, `No.`] },
    { goal: "School vocabulary", banks: [Sub, Feel, N, Day], bot: ([sub, feel, n, d]) => `${n}, on ${d}, did ${sub} make you feel ${feel}?`, replies: ([sub, feel]) => [`Yes.`, `I felt ${feel}.`, `${cap(sub)} was okay.`, `A little.`, `No.`] },
    { goal: "Daily talk", banks: [Day, W, N, P2], bot: ([d, w, n, p]) => `${n}, if today is ${d} and it is ${w}, can we still go to the ${p}?`, replies: ([d, w, , p]) => [`Yes.`, `Maybe not if ${w}.`, `Let's go to the ${p}.`, `Stay home.`, `${d} is fine.`] },
    { goal: "Weather", banks: [W, P2, N, Act2], bot: ([w, p, n, act]) => `${n}, because it is ${w}, should we ${act} at the ${p} or stay inside?`, replies: ([w, p, , act]) => [`Stay inside.`, `Still ${act} at the ${p}.`, `Wait.`, `Take a coat.`, `Okay.`] },
    { goal: "Food and likes", banks: [F, Time, N, P2], bot: ([f, t, n, p]) => `${n}, at the ${p} ${t}, order food: will you choose ${f}?`, replies: ([f]) => [`Yes, ${f}.`, `Something else.`, `Water.`, `I'm not hungry.`, `Share.`] },
    { goal: "Family", banks: [Fam, N, P2, Time], bot: ([fam, n, p, t]) => `${n}, who takes you to the ${p} ${t}, your ${fam}?`, replies: ([fam, , p]) => [`My ${fam}.`, `Sometimes.`, `I go alone.`, `To the ${p}, yes.`, `Dad.`] },
    { goal: "Hobbies", banks: [Hob, N, Time, P2], bot: ([h, n, t, p]) => `${n}, after ${t}, where do you practice ${h}: at the ${p}?`, replies: ([h, , , p]) => [`At the ${p}.`, `At home.`, `I love ${h}.`, `Not today.`, `Yes.`] },
    { goal: "Places", banks: [P2, Act2, N, Time], bot: ([p, act, n, t]) => `${n}, ${t} we can only do one thing: ${act} at the ${p}. Deal?`, replies: ([p, act]) => [`Deal.`, `Let's ${act}.`, `At the ${p}.`, `Maybe later.`, `Okay.`] },
    { goal: "Polite talk", banks: [N, Sch, P2, Time], bot: ([n, item, p, t]) => `${n}, ${t} at the ${p}, politely ask to borrow a ${item}.`, replies: ([, item]) => [`May I borrow a ${item}?`, `Please.`, `Thank you.`, `Here.`, `Sure.`] },
    { goal: "Speaking and introductions", banks: [N, City, Hob, Feel], bot: ([n, city, h, feel]) => `Interview ${n}: hometown, hobby, feeling \u2014 ${city}, ${h}, ${feel}?`, replies: ([n, city, h, feel]) => [`I'm from ${city}.`, `I like ${h}.`, `I feel ${feel}.`, `My name is ${n}.`, `Yes.`] },
    { goal: "Speaking and introductions", banks: [N, Feel, Time, Sub], bot: ([n, feel, t, sub]) => `${n}, before ${sub} ${t}, check in: how do you feel? ${cap(feel)}?`, replies: ([, feel, , sub]) => [`I feel ${feel}.`, `Ready for ${sub}.`, `Okay.`, `A bit nervous.`, `Great.`] },
    { goal: "Daily talk", banks: [Obj, N, Time, P2], bot: ([obj, n, t, p]) => `${n}, before leaving for the ${p} ${t}, did you pack your ${obj}?`, replies: ([obj]) => [`Yes.`, `Not yet.`, `It is packed.`, `In my bag.`, `I forgot.`] },
    { goal: "Hobbies", banks: [Hob, Hob, N, Day], bot: ([h1, h2, n, d]) => `${n}, on ${d} you may pick only one club: ${h1} or ${h2}?`, replies: ([h1, h2]) => [`${cap(h1)}.`, `${cap(h2)}.`, `Hard to choose.`, `Both someday.`, `Neither.`] },
    { goal: "Food and likes", banks: [F, F, N, Day], bot: ([f1, f2, n, d]) => `${n}, lunch menu on ${d}: ${f1} versus ${f2}. Vote!`, replies: ([f1, f2]) => [`${cap(f1)}.`, `${cap(f2)}.`, `Skip lunch.`, `Both tiny bits.`, `Fruit.`] },
    { goal: "Places", banks: [P2, P2, N, Fam], bot: ([pa, pb, n, fam]) => `${n}, your ${fam} can drive to one place: the ${pa} or the ${pb}?`, replies: ([pa, pb]) => [`The ${pa}.`, `The ${pb}.`, `Home.`, `Ask again.`, `Either.`] },
    { goal: "Weather", banks: [W, Day, N, Sch], bot: ([w, d, n, item]) => `${n}, on ${d} if it is ${w}, bring your ${item}. Will you?`, replies: ([w, , , item]) => [`Yes.`, `I'll bring the ${item}.`, `If it is ${w}.`, `Maybe.`, `No need.`] },
    { goal: "Family", banks: [Fam, Act2, N, Time], bot: ([fam, act, n, t]) => `${n}, ${t} help your ${fam} ${act}. What do you say first?`, replies: ([fam, act]) => [`I can help.`, `Let me ${act}.`, `Okay, ${fam}.`, `Sure.`, `In a minute.`] },
    { goal: "Polite talk", banks: [N, F, Time, P2], bot: ([n, f, t, p]) => `At the ${p} ${t}, ${n} spills ${f}. What polite words fit?`, replies: ([, f]) => [`I'm sorry.`, `Excuse me.`, `Let me clean the ${f}.`, `Pardon me.`, `Thank you for helping.`] },
    { goal: "School vocabulary", banks: [Sub, Sch, N, P2], bot: ([sub, item, n, p]) => `${n}, return the ${item} to the ${p} after ${sub}. Confirm?`, replies: ([sub, item, , p]) => [`Confirmed.`, `After ${sub}.`, `To the ${p}.`, `I will return the ${item}.`, `Okay.`] },
    { goal: "Daily talk", banks: [Time, Act2, N, Feel], bot: ([t, act, n, feel]) => `${n}, plan ${t}: ${act}, then share if you feel ${feel}.`, replies: ([t, act, , feel]) => [`I will ${act} ${t}.`, `I feel ${feel}.`, `Okay.`, `Done.`, `Not yet.`] },
    { goal: "Speaking and introductions", banks: [N, City, Time, Day], bot: ([n, city, t, d]) => `On ${d} ${t}, introduce ${n} from ${city} to the class.`, replies: ([n, city]) => [`This is ${n}.`, `From ${city}.`, `Welcome!`, `Nice to meet you.`, `Hello.`] },
    { goal: "Hobbies", banks: [Hob, P2, N, Feel], bot: ([h, p, n, feel]) => `${n}, after ${h} at the ${p}, describe your feeling in one word: ${feel}?`, replies: ([h, , , feel]) => [`${cap(feel)}.`, `Tired.`, `Happy.`, `${cap(h)} was fun.`, `Okay.`] },
    { goal: "Food and likes", banks: [F, Time, Fam, N], bot: ([f, t, fam, n]) => `${n}, thank your ${fam} for cooking ${f} ${t}.`, replies: ([f, , fam]) => [`Thank you!`, `Thanks for the ${f}.`, `Thanks, ${fam}.`, `It was yummy.`, `Thanks a lot.`] },
    { goal: "Places", banks: [P2, Obj, N, Time], bot: ([p, obj, n, t]) => `${n}, ${t} leave the ${obj} at the ${p} office. Repeat the instruction.`, replies: ([p, obj, , t]) => [`Leave the ${obj} at the ${p}.`, `${cap(t)} at the office.`, `Okay.`, `I understand.`, `Got it.`] }
  ];
  const L33 = [
    { goal: "Past experiences", banks: [P2, Time, N, Hob], bot: ([p, t, n, h]) => `${n}, summarize yesterday: ${t} at the ${p}, then ${h}? True or false?`, replies: ([p, t, , h]) => [`True.`, `False.`, `I went to the ${p}.`, `I did ${h}.`, `I stayed home.`] },
    { goal: "School life", banks: [Sub, Feel, N, Day], bot: ([sub, feel, n, d]) => `${n}, rank ${d}'s classes: was ${sub} the one that felt ${feel}?`, replies: ([sub, feel]) => [`Yes.`, `${cap(sub)} felt ${feel}.`, `No.`, `Art was better.`, `PE.`] },
    { goal: "Reasons and because", banks: [Hob, Why, N, Time], bot: ([h, r, n, t]) => `${n}, give a reason for liking ${h} ${t} \u2014 is "${r}" enough?`, replies: ([h, r]) => [`Because ${r}.`, `Yes.`, `Also because it is fun.`, `I like ${h}.`, `Not only that.`] },
    { goal: "Comparisons", banks: [A, A, N, P2], bot: ([a1, a2, n, p]) => `${n}, at the ${p} exhibit, compare size: ${a1} vs ${a2}.`, replies: ([a1, a2]) => [`${cap(a1)} is bigger.`, `${cap(a2)} is smaller.`, `Similar.`, `I need a photo.`, `Not sure.`] },
    { goal: "Feelings", banks: [Feel, Time, N, Sub], bot: ([feel, t, n, sub]) => `${n}, after ${sub} ${t}, name your feeling without copying classmates: ${feel}?`, replies: ([feel, , , sub]) => [`I feel ${feel}.`, `${cap(sub)} was fine.`, `Tired.`, `Okay.`, `Proud.`] },
    { goal: "Weekend plans", banks: [P2, Hob, N, Day], bot: ([p, h, n, d]) => `${n}, draft a ${d} plan with only one activity: ${h} at the ${p}.`, replies: ([p, h, , d]) => [`${cap(h)} at the ${p}.`, `On ${d}.`, `Stay home.`, `Maybe.`, `Invite a friend.`] },
    { goal: "Food and preferences", banks: [F, P2, N, Time], bot: ([f, p, n, t]) => `${n}, refuse politely if you don't want ${f} at the ${p} ${t}.`, replies: ([f]) => [`No, thank you.`, `Maybe later.`, `I'm full.`, `I don't like ${f}.`, `Water, please.`] },
    { goal: "Directions", banks: [P2, P2, N, Time], bot: ([pa, pb, n, t]) => `${n}, ${t} give directions from the ${pa} to the ${pb} in two steps.`, replies: ([pa, pb]) => [`Go straight from the ${pa}.`, `Turn left to the ${pb}.`, `Ask a guard.`, `I can show you.`, `Use the map.`] },
    { goal: "Stories", banks: [N, Obj, P2, Time], bot: ([n, obj, p, t]) => `Story prompt: ${n} lost a ${obj} at the ${p} ${t}. Ask one useful question.`, replies: ([, obj, p]) => [`Where did you last see the ${obj}?`, `Was it at the ${p}?`, `Can I help look?`, `Tell the teacher.`, `Don't worry.`] },
    { goal: "Opinions", banks: [Obj, Feel, N, Why], bot: ([obj, feel, n, r]) => `${n}, review this ${obj}: feeling ${feel}, reason "${r}". Agree?`, replies: ([obj, feel, , r]) => [`Agree.`, `Disagree.`, `Because ${r}.`, `The ${obj} is fine.`, `I feel ${feel}.`] },
    { goal: "Daily routines", banks: [Time, Act2, N, P2], bot: ([t, act, n, p]) => `${n}, fix your routine: ${act} at the ${p} only ${t}. Say it back.`, replies: ([t, act, , p]) => [`I ${act} at the ${p} ${t}.`, `Okay.`, `Got it.`, `Every day.`, `On weekdays.`] },
    { goal: "Speaking and introductions", banks: [N, City, Hob, Sub], bot: ([n, city, h, sub]) => `Build a 3-part intro for ${n}: city ${city}, hobby ${h}, subject ${sub}.`, replies: ([n, city, h, sub]) => [`I'm ${n} from ${city}.`, `I like ${h}.`, `My subject is ${sub}.`, `Nice to meet you.`, `Hello.`] },
    { goal: "Past experiences", banks: [Sub, Time, N, Feel], bot: ([sub, t, n, feel]) => `${n}, did finishing ${sub} ${t} make you feel ${feel}? Answer with evidence.`, replies: ([sub, t, , feel]) => [`Yes, I felt ${feel}.`, `I finished ${sub} ${t}.`, `No.`, `A little.`, `Proud.`] },
    { goal: "School life", banks: [Sub, Day, N, Tip], bot: ([sub, d, n, tip]) => `${n}, for ${sub} on ${d}, choose one improvement tip: ${tip}.`, replies: ([sub, , , tip]) => [`I will ${tip}.`, `Okay for ${sub}.`, `Maybe.`, `I already do that.`, `Thanks.`] },
    { goal: "Comparisons", banks: [P2, P2, N, Day], bot: ([pa, pb, n, d]) => `${n}, on ${d} which trip is shorter, to the ${pa} or the ${pb}?`, replies: ([pa, pb]) => [`The ${pa}.`, `The ${pb}.`, `Same time.`, `Depends on traffic.`, `I need a map.`] },
    { goal: "Weekend plans", banks: [Hob, Day, N, Feel], bot: ([h, d, n, feel]) => `${n}, invite a friend to ${h} on ${d} and say you feel ${feel} about it.`, replies: ([h, d, , feel]) => [`Let's do ${h} on ${d}.`, `I feel ${feel}.`, `Are you free?`, `Maybe next week.`, `Yes!`] },
    { goal: "Directions", banks: [P2, Act2, N, Obj], bot: ([p, act, n, obj]) => `${n}, while you ${act} to the ${p}, keep the ${obj} visible. Why?`, replies: ([p, , , obj]) => [`So I don't lose the ${obj}.`, `Safety.`, `Okay.`, `I'll hold it.`, `To the ${p}, got it.`] },
    { goal: "Feelings", banks: [Feel, Sub, N, Time], bot: ([feel, sub, n, t]) => `${n}, replace "I'm fine" with a precise feeling about ${sub} ${t}: ${feel}.`, replies: ([feel, sub]) => [`I feel ${feel} about ${sub}.`, `${cap(feel)}.`, `Still learning.`, `Okay.`, `Thanks.`] },
    { goal: "Opinions", banks: [Hob, Why, N, Day], bot: ([h, r, n, d]) => `${n}, on ${d} debate: is ${h} worth time because ${r}? Take a side.`, replies: ([h, r]) => [`Yes, because ${r}.`, `No.`, `Sometimes.`, `${cap(h)} helps me.`, `I need balance.`] },
    { goal: "Food and preferences", banks: [F, Time, P2, N], bot: ([f, t, p, n]) => `${n}, plan shopping at the ${p} ${t}: put ${f} on the list only if needed.`, replies: ([f, t, p]) => [`Add ${f}.`, `Skip ${f}.`, `At the ${p} ${t}.`, `We have some.`, `Okay.`] },
    { goal: "Daily routines", banks: [Time, Time, N, Act2], bot: ([t1, t2, n, act]) => `${n}, choose wake-up window for ${act}: ${t1} or ${t2}?`, replies: ([t1, t2, , act]) => [`${cap(t1)}.`, `${cap(t2)}.`, `I ${act} early.`, `Weekends differ.`, `Alarm set.`] },
    { goal: "Stories", banks: [N, P2, Time, Feel], bot: ([n, p, t, feel]) => `Continue: ${n} arrived at the ${p} ${t} feeling ${feel}. What happens next?`, replies: ([n, p, , feel]) => [`${n} meets a friend.`, `${n} looks around the ${p}.`, `Then goes home.`, `Still feels ${feel}.`, `Asks for help.`] },
    { goal: "Reasons and because", banks: [Sub, Why, N, Day], bot: ([sub, r, n, d]) => `${n}, explain why ${sub} matters on ${d} using: because ${r}.`, replies: ([sub, r]) => [`Because ${r}.`, `${cap(sub)} is useful.`, `For tests.`, `For fun.`, `I'm unsure.`] },
    { goal: "Past experiences", banks: [Obj, P2, N, Time], bot: ([obj, p, n, t]) => `${n}, report where you left the ${obj} ${t} \u2014 was it the ${p}?`, replies: ([obj, p, , t]) => [`At the ${p}.`, `I left the ${obj} ${t}.`, `Not sure.`, `In my bag.`, `At home.`] }
  ];
  const L4extra = [
    { goal: "Conversations", banks: [Time, P2, N, Act2], bot: ([t, p, n, act]) => `${n}, change the topic: instead of small talk, propose ${act} at the ${p} ${t}.`, replies: ([t, p, , act]) => [`Let's ${act} at the ${p} ${t}.`, `Good idea.`, `Maybe.`, `I'm busy.`, `Okay.`] },
    { goal: "First conditional", banks: [W, P2, N, Hob], bot: ([w, p, n, h]) => `${n}, complete: If it is ${w}, I won't go to the ${p} for ${h}. What's your version?`, replies: ([w, p, , h]) => [`If it is ${w}, I'll stay home.`, `I'll still go to the ${p}.`, `I'll do ${h} indoors.`, `Take a coat.`, `Call a friend.`] },
    { goal: "Advice", banks: [Sub, Tip, N, Feel], bot: ([sub, tip, n, feel]) => `${n}, you feel ${feel} about ${sub}. Offer advice using: ${tip}.`, replies: ([sub, tip, , feel]) => [`You should ${tip}.`, `I feel ${feel} too.`, `Review ${sub}.`, `Ask the teacher.`, `Breathe.`] },
    { goal: "Phrasal verbs", banks: [Obj, N, P2, Time], bot: ([obj, n, p, t]) => `${n}, use "look after": ask someone to look after your ${obj} at the ${p} ${t}.`, replies: ([obj, , p]) => [`Can you look after my ${obj}?`, `At the ${p}, please.`, `Sure.`, `No problem.`, `Okay.`] },
    { goal: "School projects", banks: [Sub, Feel, N, Day], bot: ([sub, feel, n, d]) => `${n}, status update for the ${sub} project on ${d}: feeling ${feel}. Keep it under 8 words.`, replies: ([sub, feel]) => [`${cap(sub)} project: on track.`, `I feel ${feel}.`, `Need more ideas.`, `Part one done.`, `Presenting soon.`] },
    { goal: "Making suggestions", banks: [P2, Hob, N, Time], bot: ([p, h, n, t]) => `${n}, suggest two options ${t}: ${h} OR a walk to the ${p}.`, replies: ([p, h]) => [`How about ${h}?`, `Why don't we go to the ${p}?`, `Either works.`, `Study instead.`, `Snacks first.`] },
    { goal: "Describing people", banks: [N, Hob, Feel, Sub], bot: ([n, h, feel, sub]) => `Describe ${n} without looks: hobby ${h}, mood ${feel}, subject ${sub}.`, replies: ([n, h, feel, sub]) => [`${n} loves ${h}.`, `${n} seems ${feel}.`, `Good at ${sub}.`, `Friendly.`, `Hard-working.`] },
    { goal: "Travel talk", banks: [City, Feel, N, Time], bot: ([city, feel, n, t]) => `${n}, answer in past tense: when you visited ${city} ${t}, you felt ${feel}. Add one detail.`, replies: ([city, feel, , t]) => [`I visited ${city} ${t}.`, `I felt ${feel}.`, `It was crowded.`, `Food was great.`, `I want to return.`] },
    { goal: "Problem solving", banks: [P2, Tip, N, Time], bot: ([p, tip, n, t]) => `${n}, bus to the ${p} is late ${t}. Choose a fix: ${tip}.`, replies: ([p, tip]) => [`We should ${tip}.`, `Walk to the ${p}.`, `Wait.`, `Call home.`, `Next bus.`] },
    { goal: "Opinions and reasons", banks: [Sub, Why, N, Day], bot: ([sub, r, n, d]) => `${n}, on ${d} write a mini opinion: ${sub} matters because ${r}.`, replies: ([sub, r]) => [`${cap(sub)} matters because ${r}.`, `I agree.`, `Not always.`, `Useful daily.`, `For exams.`] }
  ];
  const L53 = [
    { goal: "Teen conversation", banks: [Hob, Feel, N, Time, P2], bot: ([h, feel, n, t, p]) => `${n}, avoid one-word answers: explain your weekend using ${h} at the ${p} and feeling ${feel} ${t}.`, replies: ([h, feel, , t, p]) => [`I did ${h} at the ${p} and felt ${feel}.`, `Busy ${t}.`, `Mostly homework.`, `Hung out.`, `Slept more.`] },
    { goal: "Idioms in chat", banks: [Sub, Feel, N, Time, P2], bot: ([sub, feel, n, t, p]) => `${n}, at the ${p}, reply to "piece of cake" about ${sub} ${t} without repeating the idiom. Feeling ${feel}?`, replies: ([sub, feel]) => [`It was easy.`, `${cap(sub)} was hard for me.`, `I feel ${feel}.`, `Took longer.`, `Need review.`] },
    { goal: "School stress", banks: [Sub, Tip, N, Day, P2], bot: ([sub, tip, n, d, p]) => `${n}, exam plan for ${sub} on ${d} at the ${p}: keep only one action \u2014 ${tip}.`, replies: ([sub, tip]) => [`I will ${tip}.`, `Focus on ${sub}.`, `Still stressed.`, `Timetable done.`, `Past papers.`] },
    { goal: "Hobbies and identity", banks: [Hob, Why, N, P2, Feel], bot: ([h, r, n, p, feel]) => `${n}, at the ${p}, explain identity through ${h} using reason: ${r}. Do you feel ${feel}?`, replies: ([h, r, , , feel]) => [`I enjoy ${h} because ${r}.`, `It relaxes me.`, `I meet people.`, `I feel ${feel}.`, `Years of practice.`] },
    { goal: "Agreeing and disagreeing", banks: [Sub, Why, N, Time, P2], bot: ([sub, r, n, t, p]) => `${n}, ${t} at the ${p}, respond to "homework is useless" about ${sub}. Use because ${r}.`, replies: ([sub, r]) => [`I disagree because ${r}.`, `I partly agree.`, `Depends.`, `${cap(sub)} still helps.`, `Quality matters.`] },
    { goal: "Future goals", banks: [Job, City, N, Sub, Feel], bot: ([job, city, n, sub, feel]) => `${n}, connect school to future: ${sub} \u2192 ${job} in ${city}. One sentence. Feeling ${feel}?`, replies: ([job, city, , sub, feel]) => [`I may become a ${job} in ${city}.`, `${cap(sub)} supports that path.`, `I feel ${feel}.`, `Still deciding.`, `Travel first.`] },
    { goal: "Everyday English", banks: [P2, Time, N, Hob, F], bot: ([p, t, n, h, f]) => `${n}, rewrite a casual invite: hang out ${t} near the ${p} after ${h}, maybe get ${f}.`, replies: ([p, t, , h, f]) => [`Want to hang out ${t}?`, `After ${h} near the ${p}?`, `Some ${f} sounds good.`, `Not today.`, `Message me.`] },
    { goal: "News and society", banks: [Sub, Why, N, Tip, Day], bot: ([sub, r, n, tip, d]) => `${n}, on ${d} policy take: less ${sub} homework because ${r}. Suggest school action: ${tip}.`, replies: ([sub, r, , tip]) => [`Yes, because ${r}.`, `Schools should ${tip}.`, `A little ${sub} is fine.`, `Projects > worksheets.`, `Depends.`] },
    { goal: "Problem talk", banks: [Sub, Tip, N, Feel, P2], bot: ([sub, tip, n, feel, p]) => `${n}, at the ${p}, script a calm line to a teammate skipping ${sub} work. You feel ${feel}; tip: ${tip}.`, replies: ([sub, tip, , feel]) => [`Can we split the ${sub} tasks?`, `I feel ${feel}.`, `Please ${tip}.`, `Let's set a deadline.`, `I'll tell the teacher if needed.`] },
    { goal: "Opinions", banks: [Obj, Feel, N, Why, P2], bot: ([obj, feel, n, r, p]) => `${n}, at the ${p}, give a nuanced review of the ${obj}: feel ${feel}, because ${r}.`, replies: ([obj, feel, , r]) => [`I feel ${feel} about the ${obj}.`, `Because ${r}.`, `Not my favorite.`, `Useful though.`, `I'd pick another.`] },
    ...L4extra.map((p) => ({
      ...p,
      banks: [...p.banks, P2],
      bot: (s) => `${p.bot(s.slice(0, -1))} (setting: ${s[s.length - 1]})`,
      replies: (s) => p.replies(s.slice(0, -1))
    }))
  ];
  const L63 = [
    { goal: "Professional English", banks: [Job, City, N, Sub, Time], bot: ([job, city, n, sub, t]) => `${n}, 20-second intro ${t} linking ${sub} skills to a ${job} path in ${city}.`, replies: ([job, city, n, sub]) => [`I'm ${n}.`, `I study ${sub}.`, `Aiming for ${job} work in ${city}.`, `I improve workplace English.`, `Nice to meet you.`] },
    { goal: "Meetings and collaboration", banks: [Obj, Tip, N, Time, P2], bot: ([obj, tip, n, t, p]) => `${n}, at the ${p}, deadline for ${obj} moved ${t}. Propose one concrete next step: ${tip}.`, replies: ([obj, tip, , t]) => [`We should ${tip}.`, `Reprioritize the ${obj}.`, `Share a new timeline ${t}.`, `Split tasks.`, `Quick huddle.`] },
    { goal: "Academic discussion", banks: [Sub, Why, N, Tip, P2], bot: ([sub, r, n, tip, p]) => `${n}, at the ${p}, define reliability for a ${sub} source (because ${r}) and a check to ${tip}.`, replies: ([sub, r, , tip]) => [`Evidence matters in ${sub}.`, `Because ${r}.`, `We should ${tip}.`, `Watch for bias.`, `Prefer peer review.`] },
    { goal: "Interview English", banks: [Job, Why, N, City, Sub], bot: ([job, r, n, city, sub]) => `${n}, answer "Why this ${job} role in ${city} after ${sub}?" using because ${r}.`, replies: ([job, r, , city, sub]) => [`Because ${r}.`, `It fits my ${job} goals.`, `${city} offers growth.`, `${cap(sub)} prepared me.`, `I want to learn.`] },
    { goal: "Workplace chat", banks: [Obj, Tip, N, Time, P2], bot: ([obj, tip, n, t, p]) => `${n}, from the ${p}, draft a client update about ${obj} delay ${t}; include apology and next step (${tip}).`, replies: ([obj, tip, , t]) => [`Sorry for the delay.`, `We're reviewing the ${obj}.`, `We will ${tip}.`, `Update by end of day ${t}.`, `Thanks for your patience.`] },
    { goal: "Register and tone", banks: [Sub, Tip, N, Job, Time], bot: ([sub, tip, n, job, t]) => `${n}, ${t} rewrite casually\u2192formally: ask a ${job} for more time on ${sub}, and ${tip}.`, replies: ([sub, tip, , job]) => [`Could I request an extension on ${sub}?`, `I can submit a draft soon.`, `Thank you, ${job}.`, `I should ${tip}.`, `Two extra days would help.`] },
    { goal: "Debate and nuance", banks: [P2, Why, N, Sub, Feel], bot: ([p, r, n, sub, feel]) => `${n}, nuanced stance: studying ${sub} at the ${p} vs home, because ${r}. Feeling ${feel}?`, replies: ([p, r, , sub, feel]) => [`It depends.`, `${cap(sub)} needs focus at the ${p}.`, `I feel ${feel}.`, `Because ${r}.`, `Hybrid works.`] },
    { goal: "Social English", banks: [P2, Time, N, Hob, F], bot: ([p, t, n, h, f]) => `${n}, close a meetup at the ${p} ${t} after ${h} with thanks + one takeaway (and ${f} if needed).`, replies: ([p, t, , h]) => [`Thanks, everyone.`, `Useful points today.`, `After ${h} at the ${p}.`, `Let's continue ${t}.`, `I'll revise the notes.`] },
    { goal: "Collocations in context", banks: [Obj, Tip, N, Sub, P2], bot: ([obj, tip, n, sub, p]) => `${n}, at the ${p}, use "make a decision" about the ${obj} for ${sub}; suggest we ${tip}.`, replies: ([obj, tip, , sub]) => [`We need to make a decision on the ${obj}.`, `For ${sub}, yes.`, `We should ${tip}.`, `List pros and cons.`, `Need more data.`] },
    { goal: "Problem solving", banks: [Sub, Tip, N, Obj, P2], bot: ([sub, tip, n, obj, p]) => `${n}, at the ${p}, ${sub} survey on the ${obj} is unclear. Pick a next method: ${tip}.`, replies: ([sub, tip, , obj]) => [`We should ${tip}.`, `Check ${sub} wording.`, `More data on the ${obj}.`, `Compare studies.`, `Rewrite questions.`] },
    { goal: "Future goals", banks: [Job, City, N, Feel, Sub], bot: ([job, city, n, feel, sub]) => `${n}, decide aloud: relocate to ${city} for ${job} after ${sub}? Include feeling ${feel}.`, replies: ([job, city, , feel, sub]) => [`I'd consider ${city}.`, `For a ${job} role, maybe.`, `I feel ${feel}.`, `${cap(sub)} comes first.`, `Need details.`] },
    { goal: "Everyday English", banks: [P2, Hob, N, Time, F], bot: ([p, h, n, t, f]) => `${n}, soft decline or accept: coffee and ${f} near the ${p} ${t} after ${h}.`, replies: ([p, h, , t, f]) => [`Sure, after ${h}.`, `Near the ${p} works.`, `Not ${t}.`, `${cap(f)} sounds good.`, `Let's text.`] },
    { goal: "Meetings and collaboration", banks: [Obj, N, Day, Tip, City], bot: ([obj, n, d, tip, city]) => `${n}, ${city} team sync on ${d} about the ${obj}: one action is ${tip}. Confirm ownership.`, replies: ([obj, , , tip, city]) => [`I own the ${obj}.`, `I will ${tip}.`, `${city} team noted.`, `Confirmed.`, `Need a backup.`] },
    { goal: "Interview English", banks: [Job, N, Feel, Why, Time], bot: ([job, n, feel, r, t]) => `${n}, ${t} follow-up question: why a ${job} path if you feel ${feel}? Because ${r}?`, replies: ([job, , feel, r]) => [`Because ${r}.`, `I still want the ${job} path.`, `I feel ${feel}, but motivated.`, `Growth matters.`, `I can learn fast.`] }
  ];
  const map = {
    1: L13,
    2: L23,
    3: L33,
    4: [...L33, ...L4extra],
    5: L53,
    6: L63
  };
  return map[level];
}
var CACHE = /* @__PURE__ */ new Map();
function gcd(a, b) {
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}
function findMix(total2) {
  let mix = 999983;
  while (gcd(mix, total2) !== 1) mix += 2;
  return mix;
}
function prepare(level) {
  const hit = CACHE.get(level);
  if (hit) return hit;
  const patterns = patternsFor(level);
  const caps = patterns.map(capacityOf);
  const starts = [];
  let total2 = 0;
  for (const c of caps) {
    starts.push(total2);
    total2 += c;
  }
  if (total2 < 1e6) {
    throw new Error(`Level ${level} capacity ${total2} < 1e6 (patterns=${patterns.length})`);
  }
  const prepared = { patterns, caps, starts, total: total2, mix: findMix(total2) };
  CACHE.set(level, prepared);
  return prepared;
}
function generateUniqueChatTurn(level, id, bankSize = 1e6) {
  const size = Math.max(1, Math.floor(bankSize));
  const index = (id % size + size) % size;
  const { patterns, starts, total: total2, mix } = prepare(level);
  const local = Number(BigInt(index) * BigInt(mix) % BigInt(total2));
  let lo = 0;
  let hi = patterns.length - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (starts[mid] <= local) lo = mid;
    else hi = mid - 1;
  }
  const pattern = patterns[lo];
  const slotIndex = local - starts[lo];
  const slots = slotsFor(pattern, slotIndex);
  const seed = level * 1000003 + index * 97;
  const [reply_1, reply_2, reply_3, reply_4, reply_5] = five(pattern.replies(slots), seed);
  const topics = topicsForGoal(pattern.goal, index, level);
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
    topic3: topics.topic3
  };
}

// src/engine/chatTurns.ts
var SUBJECTS2 = [
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
var HOBBIES2 = [
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
var CITIES2 = [
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
var FEELINGS2 = [
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
      `I am from ${pick(CITIES2, c.age)}.`
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
      `I love ${pick(SUBJECTS2, c.age)}.`,
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
      `I like ${pick(HOBBIES2, c.age)}.`,
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
      `I enjoyed ${pick(SUBJECTS2, c.age)}.`,
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
      `I feel ${pick(FEELINGS2, c.age)}.`
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
  return generateUniqueChatTurn(level, id, bankSize);
}

// scripts/export-english-age.ts
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
