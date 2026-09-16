// scripts/export-csv.ts
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// src/data/levels.ts
var LEVELS = [
  {
    id: 1,
    title: "Little Stars",
    ages: "3\u20135 years",
    cefr: "Pre-A1",
    tagline: "Colors, animals, numbers, and first words.",
    focus: ["First words", "Colors & animals", "Counting", "Hello & thank you"],
    tutor: {
      name: "Benny Bear",
      role: "Your playful English friend",
      avatar: "\u{1F43B}",
      greeting: "Hi, friend! I am Benny Bear. Let us play with English words! Listen, look, and pick one answer.",
      praise: [
        "Yes! Great job!",
        "Yay! You got it!",
        "Wow! Super star!",
        "Yes! I am so happy!",
        "Good! Let\u2019s do the next one!"
      ],
      retry: [
        "Almost! Try this: look again.",
        "Good try! The right one is this.",
        "Nice try! Let\u2019s learn it together.",
        "That\u2019s okay! Now we know the answer."
      ],
      next: ["Next one!", "Let\u2019s play again!", "One more word!", "Ready? Here we go!"]
    },
    theme: {
      bg: "#fff4e8",
      bg2: "#ffe0f0",
      accent: "#ff6b9d",
      accent2: "#5ec8f0",
      ink: "#4a2c3a",
      card: "#ffffff",
      bubble: "#fff8f0",
      userBubble: "#ffe3ef"
    }
  },
  {
    id: 2,
    title: "Bright Starters",
    ages: "6\u20138 years",
    cefr: "A1",
    tagline: "School, family, simple sentences, and daily talk.",
    focus: ["Simple sentences", "School words", "I like / I can", "Days & weather"],
    tutor: {
      name: "Miss Pip",
      role: "Cheerful classroom tutor",
      avatar: "\u{1F426}",
      greeting: "Hello! I am Miss Pip. We will chat in easy English. Read, listen, and choose the best answer.",
      praise: [
        "Excellent! That\u2019s right.",
        "Well done! You read that carefully.",
        "Yes! Super work!",
        "Perfect! Your English is growing."
      ],
      retry: [
        "Good try. Let\u2019s look at the correct sentence.",
        "Not quite. Here is a better choice.",
        "Almost! Remember this one.",
        "That\u2019s okay. English takes practice!"
      ],
      next: ["Next question!", "Let\u2019s keep going!", "Ready for another?", "Here is a new one!"]
    },
    theme: {
      bg: "#e8f7ff",
      bg2: "#fff6d8",
      accent: "#219ebc",
      accent2: "#ffb703",
      ink: "#12344a",
      card: "#ffffff",
      bubble: "#f3fbff",
      userBubble: "#fff3c9"
    }
  },
  {
    id: 3,
    title: "Word Explorers",
    ages: "9\u201310 years",
    cefr: "A1\u2013A2",
    tagline: "Past tense, comparatives, and short stories.",
    focus: ["Past simple", "Comparatives", "Why / because", "Short reading"],
    tutor: {
      name: "Coach Sam",
      role: "Story and grammar coach",
      avatar: "\u{1F98A}",
      greeting: "Hey there! I\u2019m Coach Sam. We\u2019ll read short stories and pick smart answers. You\u2019ve got this!",
      praise: [
        "That\u2019s the one! Sharp thinking.",
        "Yes \u2014 you understood the story.",
        "Great grammar choice!",
        "Nice work. That was a tricky one."
      ],
      retry: [
        "Close! Check the verb tense again.",
        "Not this time. Let\u2019s look at the clue in the sentence.",
        "Good effort. The story points to another answer.",
        "Remember: look for because, yesterday, and than."
      ],
      next: ["On to the next story!", "Another challenge!", "Let\u2019s keep exploring!", "Ready?"]
    },
    theme: {
      bg: "#e8f6ef",
      bg2: "#fff3d6",
      accent: "#2a9d8f",
      accent2: "#e9c46a",
      ink: "#1b3d36",
      card: "#ffffff",
      bubble: "#f2fbf6",
      userBubble: "#fff6dd"
    }
  },
  {
    id: 4,
    title: "Fluent Builders",
    ages: "11\u201312 years",
    cefr: "A2\u2013B1",
    tagline: "Future plans, conditionals, and real conversations.",
    focus: ["Will / going to", "First conditional", "Phrasal verbs", "Opinions"],
    tutor: {
      name: "Ms. Rivera",
      role: "Middle-school English mentor",
      avatar: "\u{1F989}",
      greeting: "Welcome. I\u2019m Ms. Rivera. We\u2019ll practice natural English: plans, reasons, and conversations. Choose the most natural answer.",
      praise: [
        "Exactly. That\u2019s natural English.",
        "Well reasoned. You used the context well.",
        "Yes \u2014 that conditional is correct.",
        "Strong choice. You\u2019re sounding more fluent."
      ],
      retry: [
        "Not the most natural option. Here\u2019s why.",
        "Almost. Watch the verb form after if / will.",
        "Good thinking, but another phrase fits better.",
        "Let\u2019s compare the options more carefully."
      ],
      next: ["Next conversation.", "Let\u2019s continue.", "Another one.", "Keep going."]
    },
    theme: {
      bg: "#eef0ff",
      bg2: "#ffe9d6",
      accent: "#5b5f97",
      accent2: "#ff9f1c",
      ink: "#1e1f3a",
      card: "#ffffff",
      bubble: "#f5f6ff",
      userBubble: "#ffecd9"
    }
  },
  {
    id: 5,
    title: "Teen Talk",
    ages: "13\u201315 years",
    cefr: "B1\u2013B2",
    tagline: "Idioms, opinions, academic words, and real-life chat.",
    focus: ["Idioms", "Passive voice", "Reported speech", "Teen topics"],
    tutor: {
      name: "Alex",
      role: "Teen English coach",
      avatar: "\u{1F60E}",
      greeting: "Hey! I'm Alex. We'll chat like real people \u2014 school, hobbies, news, and stronger grammar. Pick the answer that sounds right.",
      praise: [
        "Nailed it. That\u2019s how a fluent speaker would say it.",
        "Yes. You caught the idiom.",
        "Solid. That register fits the situation.",
        "Nice \u2014 you understood the implied meaning."
      ],
      retry: [
        "Not quite. In this context, another phrase is more natural.",
        "Close, but the grammar doesn\u2019t match the time frame.",
        "That option is understandable, but not the best English here.",
        "Let\u2019s unpack why the other choice works better."
      ],
      next: ["Let's keep rolling.", "Next one.", "Another scenario.", "Ready for the next?"]
    },
    theme: {
      bg: "#0f172a",
      bg2: "#134e4a",
      accent: "#2dd4bf",
      accent2: "#f59e0b",
      ink: "#e2e8f0",
      card: "#111827",
      bubble: "#1e293b",
      userBubble: "#134e4a"
    }
  },
  {
    id: 6,
    title: "Pro English",
    ages: "15+ years",
    cefr: "B2\u2013C1",
    tagline: "Advanced grammar, collocations, academic and workplace English.",
    focus: ["Collocations", "Register", "Nuance", "Academic writing"],
    tutor: {
      name: "Dr. Morgan",
      role: "Advanced English coach",
      avatar: "\u{1F393}",
      greeting: "Welcome. I\u2019m Dr. Morgan. This level trains precise, adult English \u2014 collocations, tone, and academic choices. Select the best option, not merely a possible one.",
      praise: [
        "Correct. That is the most precise choice.",
        "Yes. The collocation is idiomatic.",
        "Well judged. The register matches the context.",
        "Excellent. You distinguished a subtle contrast."
      ],
      retry: [
        "Understandable, but not idiomatic. The target collocation is different.",
        "The meaning is close, yet the register is off.",
        "A learner might choose that; a proficient speaker would not.",
        "Re-read the cue: one option is clearly stronger."
      ],
      next: ["Continue.", "Next item.", "Another passage.", "Proceed."]
    },
    theme: {
      bg: "#020617",
      bg2: "#0b3b5a",
      accent: "#38bdf8",
      accent2: "#a78bfa",
      ink: "#e2e8f0",
      card: "#0b1220",
      bubble: "#111827",
      userBubble: "#0f3a4d"
    }
  }
];

// src/types.ts
var BANK_SIZE = 1e5;

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
var PRONOUNS = {
  Mia: { subj: "she", obj: "her", poss: "her" },
  Leo: { subj: "he", obj: "him", poss: "his" },
  Sam: { subj: "he", obj: "him", poss: "his" },
  Ana: { subj: "she", obj: "her", poss: "her" },
  Ben: { subj: "he", obj: "him", poss: "his" },
  Yuki: { subj: "she", obj: "her", poss: "her" },
  Omar: { subj: "he", obj: "him", poss: "his" },
  Lara: { subj: "she", obj: "her", poss: "her" },
  Nico: { subj: "he", obj: "him", poss: "his" },
  Hana: { subj: "she", obj: "her", poss: "her" },
  Eli: { subj: "he", obj: "him", poss: "his" },
  Sara: { subj: "she", obj: "her", poss: "her" },
  Ken: { subj: "he", obj: "him", poss: "his" },
  Lila: { subj: "she", obj: "her", poss: "her" },
  Theo: { subj: "he", obj: "him", poss: "his" },
  Maya: { subj: "she", obj: "her", poss: "her" },
  Rui: { subj: "he", obj: "him", poss: "his" },
  Noor: { subj: "she", obj: "her", poss: "her" },
  Luca: { subj: "he", obj: "him", poss: "his" },
  Zoe: { subj: "she", obj: "her", poss: "her" }
};
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
var ANIMAL_EMOJI = {
  cat: "\u{1F431}",
  dog: "\u{1F436}",
  bird: "\u{1F426}",
  fish: "\u{1F41F}",
  duck: "\u{1F986}",
  frog: "\u{1F438}",
  cow: "\u{1F42E}",
  pig: "\u{1F437}",
  horse: "\u{1F434}",
  sheep: "\u{1F411}",
  lion: "\u{1F981}",
  tiger: "\u{1F42F}",
  bear: "\u{1F43B}",
  monkey: "\u{1F435}",
  elephant: "\u{1F418}",
  rabbit: "\u{1F430}",
  mouse: "\u{1F42D}",
  chicken: "\u{1F414}",
  bee: "\u{1F41D}",
  butterfly: "\u{1F98B}",
  turtle: "\u{1F422}",
  snake: "\u{1F40D}",
  giraffe: "\u{1F992}",
  zebra: "\u{1F993}",
  panda: "\u{1F43C}",
  fox: "\u{1F98A}",
  owl: "\u{1F989}",
  whale: "\u{1F40B}",
  dolphin: "\u{1F42C}",
  penguin: "\u{1F427}",
  koala: "\u{1F428}",
  kangaroo: "\u{1F998}",
  goat: "\u{1F410}",
  hen: "\u{1F414}",
  puppy: "\u{1F436}",
  kitten: "\u{1F431}",
  lamb: "\u{1F411}",
  calf: "\u{1F42E}",
  ant: "\u{1F41C}",
  spider: "\u{1F577}\uFE0F",
  swan: "\u{1F9A2}",
  wolf: "\u{1F43A}",
  deer: "\u{1F98C}",
  camel: "\u{1F42B}",
  seal: "\u{1F9AD}",
  crab: "\u{1F980}",
  shark: "\u{1F988}",
  parrot: "\u{1F99C}"
};
var ANIMAL_SOUNDS = {
  cat: "meow",
  dog: "woof",
  bird: "tweet",
  duck: "quack",
  frog: "ribbit",
  cow: "moo",
  pig: "oink",
  horse: "neigh",
  sheep: "baa",
  lion: "roar",
  mouse: "squeak",
  bee: "buzz",
  owl: "hoot",
  snake: "hiss",
  chicken: "cluck",
  hen: "cluck"
};
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
var BODY = [
  "head",
  "eye",
  "ear",
  "nose",
  "mouth",
  "hand",
  "foot",
  "arm",
  "leg",
  "hair",
  "tooth",
  "tummy",
  "finger",
  "knee",
  "back",
  "face"
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
var OPPOSITES = [
  ["big", "small"],
  ["hot", "cold"],
  ["happy", "sad"],
  ["fast", "slow"],
  ["old", "new"],
  ["open", "closed"],
  ["clean", "dirty"],
  ["long", "short"],
  ["loud", "quiet"],
  ["day", "night"],
  ["up", "down"],
  ["in", "out"],
  ["yes", "no"],
  ["good", "bad"],
  ["full", "empty"],
  ["early", "late"]
];
var IRREGULAR = [
  ["go", "went", "gone"],
  ["eat", "ate", "eaten"],
  ["see", "saw", "seen"],
  ["take", "took", "taken"],
  ["make", "made", "made"],
  ["come", "came", "come"],
  ["write", "wrote", "written"],
  ["read", "read", "read"],
  ["give", "gave", "given"],
  ["find", "found", "found"],
  ["buy", "bought", "bought"],
  ["think", "thought", "thought"],
  ["know", "knew", "known"],
  ["get", "got", "gotten"],
  ["have", "had", "had"],
  ["do", "did", "done"],
  ["say", "said", "said"],
  ["tell", "told", "told"],
  ["feel", "felt", "felt"],
  ["leave", "left", "left"],
  ["meet", "met", "met"],
  ["run", "ran", "run"],
  ["sing", "sang", "sung"],
  ["swim", "swam", "swum"],
  ["begin", "began", "begun"],
  ["break", "broke", "broken"],
  ["choose", "chose", "chosen"],
  ["drive", "drove", "driven"],
  ["fly", "flew", "flown"],
  ["forget", "forgot", "forgotten"],
  ["grow", "grew", "grown"],
  ["keep", "kept", "kept"],
  ["lose", "lost", "lost"],
  ["pay", "paid", "paid"],
  ["sleep", "slept", "slept"],
  ["speak", "spoke", "spoken"],
  ["stand", "stood", "stood"],
  ["teach", "taught", "taught"],
  ["understand", "understood", "understood"],
  ["wear", "wore", "worn"]
];
var REGULAR_PAST = [
  "play",
  "watch",
  "visit",
  "clean",
  "cook",
  "help",
  "walk",
  "talk",
  "open",
  "close",
  "start",
  "finish",
  "need",
  "want",
  "call",
  "ask",
  "live",
  "love",
  "work",
  "study"
];
var ADJECTIVES_COMPARE = [
  "tall",
  "short",
  "fast",
  "slow",
  "old",
  "young",
  "big",
  "small",
  "cold",
  "hot",
  "long",
  "quiet",
  "loud",
  "kind",
  "brave",
  "funny"
];
var REASONS = [
  "it was raining",
  "the shop was closed",
  "the bus was late",
  "it was her birthday",
  "the test was tomorrow",
  "he felt tired",
  "the park was busy",
  "the movie was funny",
  "the soup was hot",
  "the room was dark",
  "the baby was sleeping",
  "the homework was easy"
];
var PHRASAL = [
  { verb: "look up", meaning: "search for information", example: "look up a word" },
  { verb: "give up", meaning: "stop trying", example: "give up too soon" },
  { verb: "find out", meaning: "discover", example: "find out the truth" },
  { verb: "turn on", meaning: "start a machine", example: "turn on the light" },
  { verb: "turn off", meaning: "stop a machine", example: "turn off the TV" },
  { verb: "pick up", meaning: "lift or collect", example: "pick up the bag" },
  { verb: "put on", meaning: "wear clothes", example: "put on a jacket" },
  { verb: "take off", meaning: "remove clothes", example: "take off your shoes" },
  { verb: "grow up", meaning: "become an adult", example: "grow up in a city" },
  { verb: "wake up", meaning: "stop sleeping", example: "wake up early" },
  { verb: "come back", meaning: "return", example: "come back later" },
  { verb: "go on", meaning: "continue", example: "go on with the story" },
  { verb: "set up", meaning: "arrange or start", example: "set up a meeting" },
  { verb: "run out of", meaning: "have no more", example: "run out of time" },
  { verb: "look after", meaning: "take care of", example: "look after a pet" },
  { verb: "work out", meaning: "exercise or solve", example: "work out the problem" },
  { verb: "break down", meaning: "stop working", example: "the car broke down" },
  { verb: "check in", meaning: "register at a hotel or airport", example: "check in online" },
  { verb: "fill in", meaning: "complete a form", example: "fill in the form" },
  { verb: "hang out", meaning: "spend time relaxing", example: "hang out with friends" }
];
var IDIOMS = [
  { idiom: "break the ice", meaning: "start a friendly conversation" },
  { idiom: "a piece of cake", meaning: "very easy" },
  { idiom: "under the weather", meaning: "feeling a little sick" },
  { idiom: "hit the books", meaning: "study hard" },
  { idiom: "once in a blue moon", meaning: "very rarely" },
  { idiom: "cost an arm and a leg", meaning: "be very expensive" },
  { idiom: "spill the beans", meaning: "reveal a secret" },
  { idiom: "on the same page", meaning: "agreeing or understanding each other" },
  { idiom: "the ball is in your court", meaning: "it is your decision now" },
  { idiom: "bite off more than you can chew", meaning: "try to do too much" },
  { idiom: "get cold feet", meaning: "become too nervous to continue" },
  { idiom: "see eye to eye", meaning: "agree with someone" },
  { idiom: "call it a day", meaning: "stop working for now" },
  { idiom: "keep an eye on", meaning: "watch carefully" },
  { idiom: "out of the blue", meaning: "unexpectedly" },
  { idiom: "in hot water", meaning: "in trouble" },
  { idiom: "over the moon", meaning: "extremely happy" },
  { idiom: "the last straw", meaning: "the final problem after many others" },
  { idiom: "cut corners", meaning: "do something cheaply or carelessly" },
  { idiom: "hit the nail on the head", meaning: "describe something exactly right" }
];
var COLLOCATIONS = [
  {
    pair: "make a decision",
    correct: "make",
    wrong: ["do", "take", "give", "put"],
    cue: "a decision"
  },
  {
    pair: "do homework",
    correct: "do",
    wrong: ["make", "take", "have", "give"],
    cue: "homework"
  },
  {
    pair: "take a break",
    correct: "take",
    wrong: ["make", "do", "give", "put"],
    cue: "a break"
  },
  {
    pair: "have a look",
    correct: "have",
    wrong: ["make", "do", "give", "take"],
    cue: "a look"
  },
  {
    pair: "pay attention",
    correct: "pay",
    wrong: ["give", "make", "do", "keep"],
    cue: "attention"
  },
  {
    pair: "keep a promise",
    correct: "keep",
    wrong: ["hold", "save", "take", "make"],
    cue: "a promise"
  },
  {
    pair: "raise a question",
    correct: "raise",
    wrong: ["rise", "lift", "make", "open"],
    cue: "a question"
  },
  {
    pair: "catch a cold",
    correct: "catch",
    wrong: ["take", "get on", "hold", "meet"],
    cue: "a cold"
  },
  {
    pair: "strong coffee",
    correct: "strong",
    wrong: ["powerful", "heavy", "hard", "mighty"],
    cue: "coffee"
  },
  {
    pair: "heavy rain",
    correct: "heavy",
    wrong: ["strong", "hard", "thick", "big"],
    cue: "rain"
  },
  {
    pair: "reach a consensus",
    correct: "reach",
    wrong: ["make", "do", "get", "catch"],
    cue: "a consensus"
  },
  {
    pair: "draw a conclusion",
    correct: "draw",
    wrong: ["make", "pull", "take", "write"],
    cue: "a conclusion"
  },
  {
    pair: "pose a threat",
    correct: "pose",
    wrong: ["put", "make", "give", "set"],
    cue: "a threat"
  },
  {
    pair: "meet a deadline",
    correct: "meet",
    wrong: ["catch", "hit", "do", "keep"],
    cue: "a deadline"
  },
  {
    pair: "conduct research",
    correct: "conduct",
    wrong: ["make", "do up", "build", "raise"],
    cue: "research"
  },
  {
    pair: "highly likely",
    correct: "highly",
    wrong: ["high", "hardly", "strongly", "deeply"],
    cue: "likely"
  },
  {
    pair: "widely accepted",
    correct: "widely",
    wrong: ["widelyly", "broad", "big", "openly"],
    cue: "accepted"
  },
  {
    pair: "bitter disappointment",
    correct: "bitter",
    wrong: ["sour", "salty", "sharp", "dark"],
    cue: "disappointment"
  },
  {
    pair: "boost confidence",
    correct: "boost",
    wrong: ["lift up", "grow", "rise", "open"],
    cue: "confidence"
  },
  {
    pair: "address a problem",
    correct: "address",
    wrong: ["speak", "say", "talk", "tell"],
    cue: "a problem"
  }
];
var ACADEMIC_PAIRS = [
  {
    word: "significant",
    meaning: "important or large enough to matter",
    distractors: ["tiny and useless", "only decorative", "secret and illegal", "funny and light"]
  },
  {
    word: "however",
    meaning: "used to introduce a contrast",
    distractors: ["used to add a similar idea", "used to give an example", "used to show time", "used to show place"]
  },
  {
    word: "therefore",
    meaning: "for that reason",
    distractors: ["in spite of that", "for example", "before that", "on the other hand"]
  },
  {
    word: "evaluate",
    meaning: "judge the quality or value of something",
    distractors: ["memorize without thinking", "hide from view", "copy exactly", "delay until later"]
  },
  {
    word: "imply",
    meaning: "suggest something without saying it directly",
    distractors: ["state something loudly", "prove with numbers", "refuse completely", "translate word for word"]
  },
  {
    word: "accurate",
    meaning: "correct in every detail",
    distractors: ["almost finished", "easy to remember", "popular with readers", "written in a hurry"]
  },
  {
    word: "consequence",
    meaning: "a result of an action",
    distractors: ["a first draft", "a lucky guess", "a silent pause", "a borrowed idea"]
  },
  {
    word: "essential",
    meaning: "absolutely necessary",
    distractors: ["optional and extra", "rare but pretty", "old-fashioned", "unclear"]
  },
  {
    word: "interpret",
    meaning: "explain the meaning of something",
    distractors: ["delete extra words", "print in bold", "count the pages", "ignore the details"]
  },
  {
    word: "reliable",
    meaning: "able to be trusted",
    distractors: ["hard to find", "new and untested", "expensive", "only used once"]
  },
  {
    word: "hypothesis",
    meaning: "an idea you can test",
    distractors: ["a final published law", "a random complaint", "a list of names", "a type of graph"]
  },
  {
    word: "contrast",
    meaning: "a clear difference",
    distractors: ["a perfect copy", "a repeated chorus", "a missing page", "a private diary"]
  }
];
var FORMAL_INFORMAL = [
  { informal: "kids", formal: "children", extra: ["guys", "stuff", "mates"] },
  { informal: "a lot of", formal: "a significant number of", extra: ["tons of", "heaps of", "loads of"] },
  { informal: "find out", formal: "determine", extra: ["check out", "figure", "see"] },
  { informal: "get", formal: "obtain", extra: ["grab", "snag", "score"] },
  { informal: "help", formal: "assist", extra: ["give a hand", "sort out", "fix up"] },
  { informal: "buy", formal: "purchase", extra: ["pick up", "grab", "score"] },
  { informal: "ask for", formal: "request", extra: ["beg", "nudge", "ping"] },
  { informal: "show", formal: "demonstrate", extra: ["point out", "flash", "wave"] },
  { informal: "start", formal: "commence", extra: ["kick off", "jump in", "fire up"] },
  { informal: "end", formal: "conclude", extra: ["wrap up", "call it", "cut"] },
  { informal: "need", formal: "require", extra: ["wanna", "gotta", "could use"] },
  { informal: "so", formal: "therefore", extra: ["yeah", "anyway", "like"] }
];

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
function product(sizes) {
  return sizes.reduce((acc, n) => acc * n, 1);
}

// src/engine/helpers.ts
function article(word) {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}
function cap(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function thirdPerson(verb) {
  if (verb === "have") return "has";
  if (verb === "do") return "does";
  if (verb === "go") return "goes";
  if (verb.endsWith("y") && !/[aeiou]y$/i.test(verb)) return `${verb.slice(0, -1)}ies`;
  if (/(s|sh|ch|x|z|o)$/i.test(verb)) return `${verb}es`;
  return `${verb}s`;
}
function gerund(verb) {
  if (verb.endsWith("ie")) return `${verb.slice(0, -2)}ying`;
  if (verb.endsWith("e") && !verb.endsWith("ee")) return `${verb.slice(0, -1)}ing`;
  return `${verb}ing`;
}
function fiveChoices(correct, pool, seed, extras = []) {
  const norm = (s) => s.trim().toLowerCase();
  const seen = /* @__PURE__ */ new Set([norm(correct)]);
  const rand = mulberry32(seed);
  const distractors = [];
  for (const candidate of shuffle([...pool, ...extras], rand)) {
    if (distractors.length >= 4) break;
    const value = candidate.trim();
    if (!value || seen.has(norm(value))) continue;
    seen.add(norm(value));
    distractors.push(value);
  }
  let pad = 1;
  while (distractors.length < 4) {
    const fallback = `option ${pad++}`;
    if (!seen.has(norm(fallback))) {
      seen.add(norm(fallback));
      distractors.push(fallback);
    }
  }
  const answers = shuffle([correct, ...distractors.slice(0, 4)], rand);
  return {
    answers,
    correctIndex: answers.findIndex((item) => norm(item) === norm(correct))
  };
}
function finalize(question) {
  if (question.answers.length !== 5) {
    throw new Error(`Question ${question.id} must have 5 answers`);
  }
  if (question.correctIndex < 0 || question.correctIndex > 4) {
    throw new Error(`Question ${question.id} has an invalid correct index`);
  }
  return question;
}
var GENERIC_NOUNS = [
  "book",
  "chair",
  "window",
  "pencil",
  "garden",
  "river",
  "market",
  "ticket",
  "bottle",
  "jacket",
  "camera",
  "message",
  "project",
  "lesson",
  "village",
  "station",
  "bridge",
  "kitchen",
  "weekend",
  "holiday"
];
var GENERIC_ADJECTIVES = [
  "happy",
  "quiet",
  "busy",
  "friendly",
  "careful",
  "useful",
  "simple",
  "modern",
  "famous",
  "serious",
  "bright",
  "heavy",
  "empty",
  "fresh",
  "honest",
  "lucky",
  "nervous",
  "polite",
  "strange",
  "warm"
];

// src/engine/generate.ts
var SOUND_ANIMALS = Object.keys(ANIMAL_SOUNDS);
var FALLBACK = [...GENERIC_NOUNS, ...GENERIC_ADJECTIVES, ...TOYS, ...SCHOOL_ITEMS];
function spaceOk(sizes, need) {
  if (product(sizes) < need) {
    const extra = Math.ceil(need / Math.max(1, product(sizes)));
    return [...sizes, extra];
  }
  return sizes;
}
function misspell(word, variant) {
  const clean = word.trim();
  const parts = clean.split(" ");
  const target = parts[0];
  if (target.length < 3) return `${target}e${variant}`;
  const chars = [...target];
  const i = variant % (chars.length - 1) + 0;
  let next = target;
  switch (variant % 4) {
    case 0: {
      const j = i + 1 < chars.length ? i + 1 : 0;
      const tmp = chars[i];
      chars[i] = chars[j];
      chars[j] = tmp;
      next = chars.join("");
      break;
    }
    case 1:
      next = target.slice(0, Math.max(1, i)) + target.slice(Math.max(1, i) + 1);
      break;
    case 2:
      next = target.slice(0, i + 1) + target[i] + target.slice(i + 1);
      break;
    default:
      next = target.replace(/[aeiou]/i, (m) => m === "a" ? "e" : "a");
      break;
  }
  if (next.toLowerCase() === target.toLowerCase() || next.length < 2) next = `${target}x`;
  parts[0] = next;
  return parts.join(" ");
}
function regularPast(verb) {
  if (verb.endsWith("e")) return `${verb}d`;
  if (verb.endsWith("y") && !/[aeiou]y$/i.test(verb)) return `${verb.slice(0, -1)}ied`;
  return `${verb}ed`;
}
function superlative(adj) {
  if (adj === "good") return "best";
  if (adj === "bad") return "worst";
  if (adj.endsWith("y") && !/[aeiou]y$/i.test(adj)) return `${adj.slice(0, -1)}iest`;
  if (adj.endsWith("e")) return `${adj}st`;
  if (/[aeiou][b-df-hj-np-tv-z]$/i.test(adj) && adj.length <= 4) return `${adj}${adj.slice(-1)}est`;
  return `${adj}est`;
}
function comparative(adj) {
  if (adj === "good") return "better";
  if (adj === "bad") return "worse";
  if (adj.endsWith("y") && !/[aeiou]y$/i.test(adj)) return `${adj.slice(0, -1)}ier`;
  if (adj.endsWith("e")) return `${adj}r`;
  if (/[aeiou][b-df-hj-np-tv-z]$/i.test(adj) && adj.length <= 4) return `${adj}${adj.slice(-1)}er`;
  return `${adj}er`;
}
function buildQuestion(level, id, skill, prompt, correct, pool, seed, explanation, extras = FALLBACK, passage) {
  const { answers, correctIndex } = fiveChoices(correct, pool, seed, extras);
  return finalize({
    id,
    level,
    skill,
    prompt,
    passage,
    answers,
    correctIndex,
    explanation
  });
}
function genL1(id, seed) {
  if (id < 4e4) {
    const sizes2 = spaceOk([ANIMALS.length, COLORS.length, L1_ACTIONS.length, L1_PLACES.length, 4], 4e4);
    const [ai, ci, vi2, pi, fi] = decodeIndex(id, sizes2);
    const animal = ANIMALS[ai];
    const color = COLORS[ci];
    const action = L1_ACTIONS[vi2];
    const place = L1_PLACES[pi];
    const emoji = ANIMAL_EMOJI[animal] ?? "\u{1F43E}";
    const passage = `Look! ${cap(article(color))} ${color} ${animal} can ${action} in the ${place}. ${emoji}`;
    const focus = fi % 4;
    if (focus === 0) {
      return buildQuestion(1, id, "Reading", "What animal do you see?", animal, ANIMALS, seed, `The animal is a ${animal}.`, ANIMALS, passage);
    }
    if (focus === 1) {
      return buildQuestion(1, id, "Colors", `What color is the ${animal}?`, color, COLORS, seed, `The ${animal} is ${color}.`, COLORS, passage);
    }
    if (focus === 2) {
      return buildQuestion(1, id, "Places", `Where is the ${animal}?`, `in the ${place}`, L1_PLACES.map((p) => `in the ${p}`), seed, `The ${animal} is in the ${place}.`, [], passage);
    }
    return buildQuestion(1, id, "Actions", `What can the ${animal} do?`, action, L1_ACTIONS, seed, `The ${animal} can ${action}.`, L1_ACTIONS, passage);
  }
  if (id < 6e4) {
    const local2 = id - 4e4;
    const sizes2 = spaceOk([SOUND_ANIMALS.length, FOODS.length, BODY.length, TOYS.length, 5], 2e4);
    const [si, fi, bi, ti, qi] = decodeIndex(local2, sizes2);
    const kind = qi % 5;
    if (kind === 0) {
      const animal = SOUND_ANIMALS[si];
      const sound = ANIMAL_SOUNDS[animal];
      return buildQuestion(
        1,
        id,
        "Sounds",
        `${ANIMAL_EMOJI[animal] ?? ""} A ${animal} says\u2026`,
        sound,
        Object.values(ANIMAL_SOUNDS),
        seed,
        `A ${animal} says ${sound}!`
      );
    }
    if (kind === 1) {
      const food = FOODS[fi];
      return buildQuestion(1, id, "Food", `Which one can we eat?`, food, [...ANIMALS, ...TOYS, ...BODY], seed, `We can eat ${article(food)} ${food}.`, []);
    }
    if (kind === 2) {
      const part = BODY[bi];
      return buildQuestion(1, id, "Body", `Which one is a body part?`, part, [...TOYS, ...FOODS, ...COLORS], seed, `${cap(part)} is a part of the body.`, []);
    }
    if (kind === 3) {
      const toy = TOYS[ti];
      return buildQuestion(1, id, "Toys", `Which one is a toy?`, toy, [...FOODS, ...BODY, ...COLORS], seed, `${cap(article(toy))} ${toy} is a toy.`, []);
    }
    const n = si % 10 + 1;
    return buildQuestion(1, id, "Numbers", `What number is this? ${"\u2B50".repeat(n)}`, NUMBER_WORDS[n - 1], NUMBER_WORDS, seed, `There are ${NUMBER_WORDS[n - 1]} stars.`);
  }
  if (id < 8e4) {
    const local2 = id - 6e4;
    const items = [...ANIMALS, ...FOODS, ...TOYS, ...BODY];
    const sizes2 = spaceOk([NAMES.length, items.length, COLORS.length, 4], 2e4);
    const [ni2, ii, ci, qi] = decodeIndex(local2, sizes2);
    const name = NAMES[ni2];
    const item = items[ii];
    const color = COLORS[ci];
    if (qi % 4 === 0) {
      return buildQuestion(1, id, "A / An", `${name} sees ${article(item)} ${item}. Choose a or an.`, article(item), ["a", "an", "the", "and", "to"], seed, `We say ${article(item)} ${item}.`);
    }
    if (qi % 4 === 1) {
      return buildQuestion(1, id, "This is", `Choose the correct sentence.`, `This is ${article(item)} ${item}.`, [
        `This is ${item} ${article(item)}.`,
        `This are ${article(item)} ${item}.`,
        `This ${article(item)} is ${item}.`,
        `These is ${article(item)} ${item}.`
      ], seed, `We say: This is ${article(item)} ${item}.`);
    }
    if (qi % 4 === 2) {
      return buildQuestion(1, id, "I like", `Choose the happy sentence.`, `I like ${item}.`, [
        `I like to ${item}.`,
        `I likes ${item}.`,
        `Me like ${item}.`,
        `I likeing ${item}.`
      ], seed, `A good sentence is: I like ${item}.`);
    }
    return buildQuestion(1, id, "Colors", `The ${item} is ${color}. What color is it?`, color, COLORS, seed, `It is ${color}.`);
  }
  if (id < 9e4) {
    const local2 = id - 8e4;
    const greetings = [
      { q: "You see a friend. What do you say?", a: "Hello!", pool: ["Goodbye!", "Stop!", "Go away!", "I am a cat!"] },
      { q: "You want a cookie. What do you say?", a: "Please.", pool: ["No never.", "Give now!", "I sleep.", "Go home."] },
      { q: "Someone gives you a toy. What do you say?", a: "Thank you!", pool: ["I am sad.", "Go away!", "No please sit.", "I am a bus."] },
      { q: "You bump into a friend. What do you say?", a: "I am sorry.", pool: ["I am a dog.", "Open the sky.", "Count the milk.", "Run the color."] },
      { q: "It is night. What do you say?", a: "Good night.", pool: ["Good morning.", "Happy soup.", "Big thank run.", "Please the sun."] },
      { q: "It is morning. What do you say?", a: "Good morning!", pool: ["Good night.", "I am juice.", "Sit the park.", "Red please."] },
      { q: "You leave home. What do you say?", a: "Goodbye!", pool: ["Eat the shoe.", "Hello night.", "Sorry milk.", "Please jump color."] },
      { q: "You need help. What do you say?", a: "Help me, please.", pool: ["I am table.", "Close the baby.", "Thank the rain.", "Blue you."] }
    ];
    const times = ["morning", "afternoon", "evening", "night"];
    const sizes2 = spaceOk([NAMES.length, L1_PLACES.length, greetings.length, times.length], 1e4);
    const [ni2, pi, gi, ti] = decodeIndex(local2, sizes2);
    const g = greetings[gi];
    const name = NAMES[ni2];
    const passage = `${name} is at the ${L1_PLACES[pi]} in the ${times[ti]}.`;
    return buildQuestion(1, id, "Polite talk", `${g.q}`, g.a, g.pool, seed, `A kind answer is: ${g.a}`, [], passage);
  }
  const local = id - 9e4;
  const words = [...ANIMALS.slice(0, 24), ...COLORS, ...FOODS.slice(0, 16), ...TOYS, ...FAMILY];
  const sizes = spaceOk([words.length, NAMES.length, 6], 1e4);
  const [wi, ni, vi] = decodeIndex(local, sizes);
  const word = words[wi];
  const wrong = [0, 1, 2, 3].map((n) => misspell(word, vi + n + 1));
  return buildQuestion(1, id, "Spelling", `${NAMES[ni]} asks: which spelling is right?`, word, wrong, seed, `The correct word is ${word}.`);
}
function genL2(id, seed) {
  if (id < 4e4) {
    const sizes2 = spaceOk([NAMES.length, L2_ACTIONS.length, L2_OBJECTS.length, L2_PLACES.length, DAYS.length, 4], 4e4);
    const [ni2, ai, oi, pi, di, fi] = decodeIndex(id, sizes2);
    const name = NAMES[ni2];
    const p = PRONOUNS[name];
    const action = L2_ACTIONS[ai];
    const object = L2_OBJECTS[oi];
    const place = L2_PLACES[pi];
    const day = DAYS[di];
    const passage = `${name} ${thirdPerson(action)} ${article(object)} ${object} at the ${place} on ${day}.`;
    const focus = fi % 4;
    if (focus === 0) {
      return buildQuestion(2, id, "Reading", `Who ${thirdPerson(action)} ${article(object)} ${object}?`, name, [...NAMES], seed, `${name} does it.`, NAMES, passage);
    }
    if (focus === 1) {
      return buildQuestion(2, id, "Places", `Where does ${name} ${action} ${article(object)} ${object}?`, `at the ${place}`, L2_PLACES.map((x) => `at the ${x}`), seed, `${cap(p.subj)} does it at the ${place}.`, [], passage);
    }
    if (focus === 2) {
      return buildQuestion(2, id, "Days", `When does ${name} ${action}?`, `on ${day}`, DAYS.map((d) => `on ${d}`), seed, `${name} does it on ${day}.`, [], passage);
    }
    return buildQuestion(2, id, "Present simple", `Choose the correct verb form.`, `${name} ${thirdPerson(action)} ${article(object)} ${object}.`, [
      `${name} ${action} ${article(object)} ${object}.`,
      `${name} ${gerund(action)} ${article(object)} ${object}.`,
      `${name} ${action}s not ${object}.`,
      `${name} are ${action} ${object}.`
    ], seed, `With he/she/it we add -s: ${name} ${thirdPerson(action)}\u2026`, [], passage);
  }
  if (id < 6e4) {
    const local2 = id - 4e4;
    const sizes2 = spaceOk([WEATHER.length, SCHOOL_ITEMS.length, FAMILY.length, FOODS.length, 5], 2e4);
    const [wi2, si, fi, foi, qi] = decodeIndex(local2, sizes2);
    const kind = qi % 5;
    if (kind === 0) {
      const w = WEATHER[wi2];
      return buildQuestion(2, id, "Weather", `The sky is ${w === "sunny" ? "bright" : w}. How is the weather?`, w, WEATHER, seed, `The weather is ${w}.`);
    }
    if (kind === 1) {
      const item = SCHOOL_ITEMS[si];
      return buildQuestion(2, id, "School", `Which word belongs at school?`, item, [...ANIMALS, ...FOODS.slice(10), ...TOYS], seed, `${cap(item)} is a school word.`, []);
    }
    if (kind === 2) {
      const fam = FAMILY[fi];
      return buildQuestion(2, id, "Family", `Which word is a family word?`, fam, [...TOYS, ...COLORS, ...L2_PLACES], seed, `${cap(fam)} is a family word.`, []);
    }
    if (kind === 3) {
      const food = FOODS[foi];
      return buildQuestion(2, id, "I like", `Choose the correct sentence.`, `I like ${food}, but I don\u2019t like ${FOODS[(foi + 3) % FOODS.length]}.`, [
        `I likes ${food}, but I don\u2019t like ${FOODS[(foi + 3) % FOODS.length]}.`,
        `I like ${food}, but I not like ${FOODS[(foi + 3) % FOODS.length]}.`,
        `Me like ${food}, but I don\u2019t like ${FOODS[(foi + 3) % FOODS.length]}.`,
        `I liking ${food}, but I don\u2019t like ${FOODS[(foi + 3) % FOODS.length]}.`
      ], seed, `Use like with I, and don\u2019t like for the opposite.`);
    }
    const [a, b] = OPPOSITES[wi2 % OPPOSITES.length];
    return buildQuestion(2, id, "Opposites", `What is the opposite of ${a}?`, b, OPPOSITES.map((x) => x[1]), seed, `${cap(a)} and ${b} are opposites.`);
  }
  if (id < 8e4) {
    const local2 = id - 6e4;
    const sizes2 = spaceOk([NAMES.length, SCHOOL_ITEMS.length, L2_ACTIONS.length, 5], 2e4);
    const [ni2, si, ai, qi] = decodeIndex(local2, sizes2);
    const name = NAMES[ni2];
    const item = SCHOOL_ITEMS[si];
    const action = L2_ACTIONS[ai];
    const kind = qi % 5;
    if (kind === 0) {
      const useAn = article(item) === "an";
      return buildQuestion(2, id, "A / An", `${name} needs ${article(item)} ${item}. Choose a or an.`, article(item), ["a", "an", "some a", "the an", "any"], seed, `${useAn ? "An" : "A"} is used because ${item} starts with a ${useAn ? "vowel" : "consonant"} sound.`);
    }
    if (kind === 1) {
      return buildQuestion(2, id, "Plurals", `Choose the correct plural.`, item === "teacher" ? "teachers" : `${item}s`.replace(/ss$/, "ses"), [
        `${item}esx`,
        `${item}ies`,
        `${item}'s s`,
        `${item}s's`
      ], seed, `Most nouns add -s in the plural.`);
    }
    if (kind === 2) {
      return buildQuestion(2, id, "Can", `Choose the correct sentence.`, `${name} can ${action} very well.`, [
        `${name} can ${thirdPerson(action)} very well.`,
        `${name} cans ${action} very well.`,
        `${name} can to ${action} very well.`,
        `${name} can ${gerund(action)} very well.`
      ], seed, `After can we use the base verb: can ${action}.`);
    }
    if (kind === 3) {
      return buildQuestion(2, id, "Possessive", `Whose ${item} is this? It is ${PRONOUNS[name].poss}.`, `${PRONOUNS[name].poss} ${item}`, [
        `${PRONOUNS[name].subj} ${item}`,
        `him ${item}`,
        `them ${item}`,
        `they ${item}`
      ], seed, `Use ${PRONOUNS[name].poss} before a noun.`);
    }
    return buildQuestion(2, id, "There is", `Choose the correct sentence.`, `There is ${article(item)} ${item} on the desk.`, [
      `There are ${article(item)} ${item} on the desk.`,
      `There is ${item}s on the desk.`,
      `There be ${article(item)} ${item} on the desk.`,
      `It are ${article(item)} ${item} on the desk.`
    ], seed, `Use there is with one thing.`);
  }
  if (id < 9e4) {
    const local2 = id - 8e4;
    const talks = [
      { q: "Someone says \u201CHow are you?\u201D What can you say?", a: "I\u2019m fine, thank you.", pool: ["I am a pencil.", "Yes, I am seven weather.", "My name is running.", "It is a bag you."] },
      { q: "You want to join a game. What can you say?", a: "Can I play, please?", pool: ["I am the weather.", "Close your Monday.", "Give me the sky.", "I don\u2019t school."] },
      { q: "You don\u2019t understand. What can you say?", a: "Can you say that again, please?", pool: ["I am yesterday.", "Stop the teacher milk.", "Thank you I am rain.", "Please the homework eat."] },
      { q: "It is time for lunch. What can you say?", a: "Let\u2019s eat lunch.", pool: ["Let\u2019s sleep the book.", "Open the weather.", "I can Monday.", "She are bag."] },
      { q: "Your friend is sad. What can you say?", a: "Are you okay?", pool: ["You are a window?", "Eat the classroom.", "I am two blue.", "Please the opposite."] },
      { q: "You meet a new classmate. What can you say?", a: "Hi, my name is\u2026 What\u2019s your name?", pool: ["I don\u2019t like I am.", "How old is the weather?", "Can you Monday me?", "This is eat."] },
      { q: "You need a pencil. What can you say?", a: "May I borrow a pencil?", pool: ["May I borrow a weather?", "I am the pencil eat.", "Please jump the bag.", "My brother is a ruler sad."] },
      { q: "Class is finished. What can you say?", a: "See you tomorrow!", pool: ["See you yesterday!", "I am closed.", "Thank you the floor.", "Play the teacher."] }
    ];
    const sizes2 = spaceOk([NAMES.length, L2_PLACES.length, talks.length, DAYS.length], 1e4);
    const [ni2, pi, ti, di] = decodeIndex(local2, sizes2);
    const t = talks[ti];
    const passage = `${NAMES[ni2]} is at the ${L2_PLACES[pi]} on ${DAYS[di]}.`;
    return buildQuestion(2, id, "Conversation", t.q, t.a, t.pool, seed, `A natural answer is: ${t.a}`, [], passage);
  }
  const local = id - 9e4;
  const words = [...SCHOOL_ITEMS, ...L2_OBJECTS, ...WEATHER, ...FAMILY];
  const sizes = spaceOk([words.length, NAMES.length, 8], 1e4);
  const [wi, ni, vi] = decodeIndex(local, sizes);
  const word = words[wi];
  return buildQuestion(2, id, "Spelling", `${NAMES[ni]} wrote a word. Which spelling is correct?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 2)), seed, `The correct spelling is ${word}.`);
}
function genL3(id, seed) {
  if (id < 4e4) {
    const verbs = IRREGULAR.filter(
      ([base2]) => ["go", "come", "drive", "fly", "run", "leave", "take", "buy", "find", "meet", "see", "make", "eat", "write"].includes(base2)
    );
    const sizes2 = spaceOk([NAMES.length, verbs.length, L2_PLACES.length, REASONS.length, L2_OBJECTS.length, 4], 4e4);
    const [ni2, vi2, pi, ri, oi, fi] = decodeIndex(id, sizes2);
    const name = NAMES[ni2];
    const [base, past] = verbs[vi2];
    const place = L2_PLACES[pi];
    const reason = REASONS[ri];
    const object = L2_OBJECTS[oi];
    const p = PRONOUNS[name];
    const motion = ["go", "come", "drive", "fly", "run", "leave"].includes(base);
    const passage = motion ? `Yesterday, ${name} ${past} to the ${place} because ${reason}.` : `Yesterday, ${name} ${past} ${article(object)} ${object} at the ${place} because ${reason}.`;
    const focus = fi % 4;
    if (focus === 0) {
      return buildQuestion(3, id, "Past simple", `What is the past form of ${base}?`, past, verbs.map((x) => x[1]), seed, `${cap(base)} \u2192 ${past}.`, verbs.map((x) => x[1]), passage);
    }
    if (focus === 1) {
      return buildQuestion(3, id, "Reading", `Where was ${name}?`, `at the ${place}`, L2_PLACES.map((x) => `at the ${x}`), seed, `${cap(p.subj)} was at the ${place}.`, [], passage);
    }
    if (focus === 2) {
      return buildQuestion(3, id, "Because", `Why did that happen?`, `because ${reason}`, REASONS.map((x) => `because ${x}`), seed, `The reason is: ${reason}.`, [], passage);
    }
    return buildQuestion(3, id, "Time words", `Which word shows the action is in the past?`, "Yesterday", ["Tomorrow", "Now", "Every day", "Next week"], seed, `Yesterday tells us it already happened.`, [], passage);
  }
  if (id < 6e4) {
    const local2 = id - 4e4;
    const sizes2 = spaceOk([NAMES.length, ADJECTIVES_COMPARE.length, ANIMALS.length, 4], 2e4);
    const [ni2, ai, ani, qi] = decodeIndex(local2, sizes2);
    const name = NAMES[ni2];
    const adj = ADJECTIVES_COMPARE[ai];
    const other = NAMES[(ni2 + 3) % NAMES.length];
    const animal = ANIMALS[ani];
    const otherAnimal = ANIMALS[(ani + 5) % ANIMALS.length];
    if (qi % 4 === 0) {
      return buildQuestion(3, id, "Comparatives", `Choose the correct sentence.`, `${name} is ${comparative(adj)} than ${other}.`, [
        `${name} is ${adj} than ${other}.`,
        `${name} is more ${comparative(adj)} than ${other}.`,
        `${name} is ${adj}erest than ${other}.`,
        `${name} is the ${comparative(adj)} than ${other}.`
      ], seed, `Short adjectives add -er + than: ${comparative(adj)} than.`);
    }
    if (qi % 4 === 1) {
      return buildQuestion(3, id, "Comparatives", `A ${animal} is ${comparative("big")} than a ${otherAnimal}? Choose the comparative of big.`, "bigger", ["biger", "more big", "biggest than", "bigly"], seed, `Big \u2192 bigger (double the g).`);
    }
    if (qi % 4 === 2) {
      return buildQuestion(3, id, "Superlatives", `Choose the correct sentence.`, `${name} is the ${superlative(adj)} in the class.`, [
        `${name} is the more ${adj} in the class.`,
        `${name} is ${comparative(adj)} in the class.`,
        `${name} is most ${adj}er in the class.`,
        `${name} is the ${adj} than the class.`
      ], seed, `Use the + -est for the top one in a group.`);
    }
    return buildQuestion(3, id, "Reading", `${name} is ${comparative(adj)} than ${other}. Who is more ${adj}?`, name, [other, "both", "nobody", "the teacher"], seed, `${name} is ${comparative(adj)}.`);
  }
  if (id < 8e4) {
    const local2 = id - 6e4;
    const sizes2 = spaceOk([NAMES.length, REGULAR_PAST.length, IRREGULAR.length, 5], 2e4);
    const [ni2, ri, ii, qi] = decodeIndex(local2, sizes2);
    const name = NAMES[ni2];
    const reg = REGULAR_PAST[ri];
    const irr = IRREGULAR[ii];
    const kind = qi % 5;
    if (kind === 0) {
      return buildQuestion(3, id, "Regular past", `What is the past form of ${reg}?`, regularPast(reg), REGULAR_PAST.map(regularPast), seed, `${cap(reg)} \u2192 ${regularPast(reg)}.`);
    }
    if (kind === 1) {
      return buildQuestion(3, id, "Questions", `Choose the correct question.`, `Did ${name} ${reg} yesterday?`, [
        `Did ${name} ${regularPast(reg)} yesterday?`,
        `Does ${name} ${regularPast(reg)} yesterday?`,
        `${name} did ${regularPast(reg)} yesterday?`,
        `Did ${name} ${thirdPerson(reg)} yesterday?`
      ], seed, `After did, use the base verb: Did ${name} ${reg}\u2026`);
    }
    if (kind === 2) {
      return buildQuestion(3, id, "Negatives", `Choose the correct negative.`, `${name} didn\u2019t ${irr[0]} the book.`, [
        `${name} didn\u2019t ${irr[1]} the book.`,
        `${name} doesn\u2019t ${irr[1]} the book.`,
        `${name} not ${irr[0]} the book.`,
        `${name} didn\u2019t ${irr[2]} the book.`
      ], seed, `After didn\u2019t, use the base form ${irr[0]}.`);
    }
    if (kind === 3) {
      return buildQuestion(3, id, "Prepositions", `${name} put the book ___ the bag.`, "in", ["on to in", "at", "from", "of"], seed, `We put things in a bag.`);
    }
    return buildQuestion(3, id, "Frequency", `Choose the sentence with the adverb in a natural place.`, `${name} always ${thirdPerson(reg)} after school.`, [
      `${name} ${thirdPerson(reg)} always after school.`,
      `Always ${name} ${thirdPerson(reg)} after school the.`,
      `${name} ${thirdPerson(reg)} after always school.`,
      `${name} is always ${reg} after school yesterday.`
    ], seed, `Put always before the main verb: always ${thirdPerson(reg)}.`);
  }
  if (id < 9e4) {
    const local2 = id - 8e4;
    const talks = [
      { q: "You missed the bus. What can you say?", a: "I missed the bus, so I was late.", pool: ["I miss the bus tomorrow so I am old.", "The bus did I.", "I am missing yesterday bus.", "Late I the bus because."] },
      { q: "A friend asks \u201CWhat did you do last weekend?\u201D", a: "I visited my grandparents.", pool: ["I visit my grandparents tomorrow.", "I visiting my grandparents now yesterday.", "I will visited my grandparents.", "I am visit my grandparents last."] },
      { q: "You want to suggest a plan.", a: "Why don\u2019t we go to the museum?", pool: ["Why we don\u2019t going museum?", "Don\u2019t why we go?", "We no go museum why?", "Why does we going?"] },
      { q: "Someone looks taller than you. What can you say?", a: "You\u2019re taller than me.", pool: ["You\u2019re more taller me.", "You taller I.", "You\u2019re tallest than me.", "You are more tall I."] },
      { q: "You need a reason. Complete: I stayed home\u2026", a: "because I felt sick.", pool: ["because I will sick.", "because I am yesterday.", "so I felt because.", "than I felt sick."] },
      { q: "The teacher asks about last night\u2019s homework.", a: "I finished it after dinner.", pool: ["I finish it after dinner yesterday not.", "I am finish it.", "I finishing after.", "I did finished it."] },
      { q: "You want to compare two books.", a: "This book is more interesting than that one.", pool: ["This book is interestinger.", "This book more interesting that.", "This book is the more interesting than.", "This book interestingest."] },
      { q: "A classmate lost a bag. What can you say?", a: "Where did you last see it?", pool: ["Where you did saw it?", "Where do you saw it last?", "Where did you saw it?", "Where you see it did?"] }
    ];
    const sizes2 = spaceOk([NAMES.length, L2_PLACES.length, talks.length, DAYS.length], 1e4);
    const [ni2, pi, ti, di] = decodeIndex(local2, sizes2);
    const t = talks[ti];
    const passage = `${NAMES[ni2]} was at the ${L2_PLACES[pi]} last ${DAYS[di]}.`;
    return buildQuestion(3, id, "Conversation", t.q, t.a, t.pool, seed, `A clear answer is: ${t.a}`, [], passage);
  }
  const local = id - 9e4;
  const words = [...IRREGULAR.map((x) => x[1]), ...REGULAR_PAST.map(regularPast), ...ADJECTIVES_COMPARE.map(comparative)];
  const sizes = spaceOk([words.length, NAMES.length, 8], 1e4);
  const [wi, ni, vi] = decodeIndex(local, sizes);
  const word = words[wi];
  return buildQuestion(3, id, "Spelling", `Which form is spelled correctly? (${NAMES[ni]}\u2019s notebook)`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 1)), seed, `The correct form is ${word}.`);
}
function genL4(id, seed) {
  if (id < 4e4) {
    const sizes2 = spaceOk([NAMES.length, L2_ACTIONS.length, L2_PLACES.length, L2_OBJECTS.length, 4], 4e4);
    const [ni2, ai, pi, oi, fi] = decodeIndex(id, sizes2);
    const name = NAMES[ni2];
    const p = PRONOUNS[name];
    const action = L2_ACTIONS[ai];
    const place = L2_PLACES[pi];
    const object = L2_OBJECTS[oi];
    const passage = `If ${name} ${thirdPerson(action)} ${article(object)} ${object} tonight, ${p.subj} will go to the ${place} tomorrow.`;
    const focus = fi % 4;
    if (focus === 0) {
      return buildQuestion(4, id, "First conditional", `Choose the correct pair of verb forms.`, `If ${name} ${thirdPerson(action)}\u2026, ${p.subj} will go\u2026`, [
        `If ${name} will ${action}\u2026, ${p.subj} will go\u2026`,
        `If ${name} ${action}\u2026, ${p.subj} goes\u2026`,
        `If ${name} ${gerund(action)}\u2026, ${p.subj} will going\u2026`,
        `If ${name} ${thirdPerson(action)}\u2026, ${p.subj} going\u2026`
      ], seed, `If + present, will + base verb.`, [], passage);
    }
    if (focus === 1) {
      return buildQuestion(4, id, "Future", `What will ${name} do tomorrow if the plan works?`, `go to the ${place}`, L2_PLACES.map((x) => `go to the ${x}`), seed, `${cap(p.subj)} will go to the ${place}.`, [], passage);
    }
    if (focus === 2) {
      return buildQuestion(4, id, "Going to", `Choose the sentence about a plan.`, `${name} is going to ${action} ${article(object)} ${object}.`, [
        `${name} going to ${action} ${article(object)} ${object}.`,
        `${name} is go to ${action} ${article(object)} ${object}.`,
        `${name} will going ${action} ${article(object)} ${object}.`,
        `${name} is going ${thirdPerson(action)} ${object}.`
      ], seed, `Plan: am/is/are going to + base verb.`);
    }
    return buildQuestion(4, id, "Reading", `When will ${name} go to the ${place}?`, "tomorrow", ["yesterday", "last week", "two years ago", "just now"], seed, `The sentence says tomorrow.`, [], passage);
  }
  if (id < 6e4) {
    const local2 = id - 4e4;
    const sizes2 = spaceOk([PHRASAL.length, NAMES.length, L2_OBJECTS.length, 4], 2e4);
    const [phi, ni2, oi, qi] = decodeIndex(local2, sizes2);
    const ph = PHRASAL[phi];
    const name = NAMES[ni2];
    const object = L2_OBJECTS[oi];
    if (qi % 4 === 0) {
      return buildQuestion(4, id, "Phrasal verbs", `What does \u201C${ph.verb}\u201D mean?`, ph.meaning, PHRASAL.map((x) => x.meaning), seed, `${cap(ph.verb)} means \u201C${ph.meaning}\u201D.`);
    }
    if (qi % 4 === 1) {
      return buildQuestion(4, id, "Phrasal verbs", `${name} wants to ${ph.example}. Which phrasal verb fits?`, ph.verb, PHRASAL.map((x) => x.verb), seed, `The natural phrase is ${ph.verb}.`);
    }
    if (qi % 4 === 2) {
      return buildQuestion(4, id, "Present continuous vs simple", `Choose the best sentence for a plan happening now.`, `${name} is ${gerund("pack")} ${article(object)} ${object} right now.`, [
        `${name} ${thirdPerson("pack")} ${article(object)} ${object} right now.`,
        `${name} pack ${article(object)} ${object} right now.`,
        `${name} is pack ${article(object)} ${object} right now.`,
        `${name} will packing ${object} right now.`
      ], seed, `Right now \u2192 present continuous: is packing.`);
    }
    return buildQuestion(4, id, "Will vs going to", `The sky is full of dark clouds. Choose the most natural sentence.`, "It\u2019s going to rain.", [
      "It will raining.",
      "It rains tomorrow yesterday.",
      "It going rain.",
      "It will to rain now ago."
    ], seed, `Evidence now \u2192 going to.`);
  }
  if (id < 8e4) {
    const local2 = id - 6e4;
    const sizes2 = spaceOk([NAMES.length, GENERIC_ADJECTIVES.length, GENERIC_NOUNS.length, 5], 2e4);
    const [ni2, ai, oi, qi] = decodeIndex(local2, sizes2);
    const name = NAMES[ni2];
    const adj = GENERIC_ADJECTIVES[ai];
    const noun = GENERIC_NOUNS[oi];
    const kind = qi % 5;
    if (kind === 0) {
      return buildQuestion(4, id, "Relative clauses", `Choose the most natural sentence.`, `${name} met a teacher who is ${adj}.`, [
        `${name} met a teacher which is ${adj}.`,
        `${name} met a teacher who are ${adj}.`,
        `${name} met a teacher whose is ${adj}.`,
        `${name} met a teacher who ${adj} is.`
      ], seed, `Use who for people.`);
    }
    if (kind === 1) {
      return buildQuestion(4, id, "Opinions", `Choose a polite opinion.`, `I think this ${noun} is ${adj}.`, [
        `I thinking this ${noun} is ${adj}.`,
        `I am think this ${noun} ${adj}.`,
        `For me is this ${noun} ${adj}.`,
        `I thinks this ${noun} is ${adj}.`
      ], seed, `I think + sentence.`);
    }
    if (kind === 2) {
      return buildQuestion(4, id, "Modals", `Choose the best advice.`, `${name} should take the ${noun} to the teacher.`, [
        `${name} should to take the ${noun}.`,
        `${name} should taking the ${noun}.`,
        `${name} should takes the ${noun}.`,
        `${name} musts take the ${noun}.`
      ], seed, `Should + base verb.`);
    }
    if (kind === 3) {
      return buildQuestion(4, id, "Present perfect intro", `Choose the sentence that connects past and now.`, `${name} has lost the ${noun}.`, [
        `${name} have lost the ${noun}.`,
        `${name} has lose the ${noun}.`,
        `${name} has losing the ${noun}.`,
        `${name} is lost the ${noun} yesterday has.`
      ], seed, `He/She + has + past participle.`);
    }
    return buildQuestion(4, id, "Connectors", `Complete: ${name} was tired, ___ ${PRONOUNS[name].subj} finished the ${noun}.`, "but", ["because of", "so that", "if not", "during"], seed, `But shows contrast.`);
  }
  if (id < 9e4) {
    const local2 = id - 8e4;
    const talks = [
      { q: "A friend asks about weekend plans. What sounds natural?", a: "I\u2019m going to visit my cousin if I finish my project.", pool: ["I will going visit my cousin if I will finish.", "I going visit if I finished.", "I am visit cousin if finish.", "If I will finish I going."] },
      { q: "You disagree politely.", a: "I see your point, but I don\u2019t quite agree.", pool: ["You wrong totally forever.", "I not agree you point.", "My idea is more you.", "No, your sentence bad."] },
      { q: "You need to postpone.", a: "Could we put the meeting off until Friday?", pool: ["Could we put off until the meeting Friday?", "We delay Friday the meet?", "Put we the meeting Friday off?", "Could we the meeting put?"] },
      { q: "You offer help.", a: "If you want, I can look after your bag.", pool: ["If you will want, I looking after.", "I can looking your bag if.", "If you want I look your bag after.", "I after look your bag can."] },
      { q: "You make a prediction with evidence.", a: "Look at those clouds \u2014 it\u2019s going to rain.", pool: ["Look at those clouds \u2014 it will raining.", "Those clouds rain it will to.", "It rains going those clouds.", "Going to it rain look."] },
      { q: "You ask for an opinion.", a: "What would you do in my situation?", pool: ["What you would do in situation my?", "What do you would?", "What you do would my situation?", "Would what you doing?"] },
      { q: "You explain a rule.", a: "If you press this button, the machine will start.", pool: ["If you will press this button, the machine starts.", "If you pressing, the machine will starting.", "If you press, the machine going start.", "If you pressed, the machine start will."] },
      { q: "You talk about experience.", a: "I\u2019ve already seen that film.", pool: ["I already have see that film.", "I have already saw that film.", "I already seeing that film.", "I have see already that film."] }
    ];
    const sizes2 = spaceOk([NAMES.length, L2_PLACES.length, talks.length, PHRASAL.length], 1e4);
    const [ni2, pi, ti] = decodeIndex(local2, sizes2);
    const t = talks[ti];
    const passage = `${NAMES[ni2]} is talking with a friend at the ${L2_PLACES[pi]}.`;
    return buildQuestion(4, id, "Conversation", t.q, t.a, t.pool, seed, `The most natural choice is: ${t.a}`, [], passage);
  }
  const local = id - 9e4;
  const words = [...PHRASAL.map((x) => x.verb), ...GENERIC_NOUNS, ...GENERIC_ADJECTIVES];
  const sizes = spaceOk([words.length, NAMES.length, 8], 1e4);
  const [wi, ni, vi] = decodeIndex(local, sizes);
  const word = words[wi];
  return buildQuestion(4, id, "Spelling", `Which option is spelled correctly in ${NAMES[ni]}\u2019s essay?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 3)), seed, `The correct spelling is ${word}.`);
}
function genL5(id, seed) {
  if (id < 4e4) {
    const sizes2 = spaceOk([NAMES.length, IDIOMS.length, L2_PLACES.length, GENERIC_NOUNS.length, 4], 4e4);
    const [ni2, ii, pi, oi, fi] = decodeIndex(id, sizes2);
    const name = NAMES[ni2];
    const p = PRONOUNS[name];
    const idiom = IDIOMS[ii];
    const place = L2_PLACES[pi];
    const noun = GENERIC_NOUNS[oi];
    const passage = `${name} was at the ${place} when everything went wrong with the ${noun}. At first ${p.subj} wanted to call it a day, but then a classmate helped ${p.obj} break the ice with the new group. In the end ${p.subj} felt over the moon.`;
    const focus = fi % 4;
    if (focus === 0) {
      return buildQuestion(5, id, "Idioms", `What does \u201C${idiom.idiom}\u201D mean?`, idiom.meaning, IDIOMS.map((x) => x.meaning), seed, `\u201C${idiom.idiom}\u201D means ${idiom.meaning}.`, [], passage);
    }
    if (focus === 1) {
      return buildQuestion(5, id, "Reading", `How did ${name} feel at the end?`, "extremely happy", ["very angry", "too sleepy to move", "completely bored", "afraid of the dark"], seed, `Over the moon = extremely happy.`, [], passage);
    }
    if (focus === 2) {
      return buildQuestion(5, id, "Passive", `Choose the passive form.`, `The ${noun} was left at the ${place}.`, [
        `The ${noun} was leave at the ${place}.`,
        `The ${noun} were left at the ${place}.`,
        `The ${noun} was lefted at the ${place}.`,
        `The ${noun} is been leave at the ${place}.`
      ], seed, `Past passive: was/were + past participle.`);
    }
    return buildQuestion(5, id, "Reported speech", `${name} said, \u201CI am tired.\u201D Choose the reported form.`, `${name} said ${p.subj} was tired.`, [
      `${name} said ${p.subj} is tired.`,
      `${name} said ${p.subj} am tired.`,
      `${name} told that ${p.subj} is tired.`,
      `${name} said ${p.subj} were tired I.`
    ], seed, `Am/is usually becomes was in reported speech.`);
  }
  if (id < 6e4) {
    const local2 = id - 4e4;
    const sizes2 = spaceOk([IDIOMS.length, NAMES.length, IRREGULAR.length, 4], 2e4);
    const [ii, ni2, vi2, qi] = decodeIndex(local2, sizes2);
    const idiom = IDIOMS[ii];
    const name = NAMES[ni2];
    const irr = IRREGULAR[vi2];
    if (qi % 4 === 0) {
      return buildQuestion(5, id, "Idioms", `${name} used the idiom \u201C${idiom.idiom}\u201D. What does it mean?`, idiom.meaning, IDIOMS.map((x) => x.meaning), seed, `Here the idiom means: ${idiom.meaning}.`);
    }
    if (qi % 4 === 1) {
      const habit = ["go", "went", "gone"];
      const used = ["go", "run", "swim", "sleep", "speak", "write", "eat", "drive", "sing"].includes(irr[0]) ? irr : habit;
      return buildQuestion(5, id, "Second conditional", `Choose the correct second conditional.`, `If ${name} ${used[1]} more often, ${PRONOUNS[name].subj} would feel better.`, [
        `If ${name} ${used[0]} more often, ${PRONOUNS[name].subj} would feel better.`,
        `If ${name} would ${used[0]} more often, ${PRONOUNS[name].subj} will feel better.`,
        `If ${name} ${used[2]} more often, ${PRONOUNS[name].subj} would felt better.`,
        `If ${name} ${used[1]} more often, ${PRONOUNS[name].subj} will feel better.`
      ], seed, `Second conditional: If + past, would + base.`);
    }
    if (qi % 4 === 2) {
      return buildQuestion(5, id, "Passive", `Rewrite: People speak English here.`, "English is spoken here.", [
        "English is speak here.",
        "English are spoken here.",
        "English spoken is here.",
        "English is speaking here by people now here."
      ], seed, `Present passive: is/are + past participle.`);
    }
    return buildQuestion(5, id, "Tone", `A teacher asks why your homework is late. Which reply is most appropriate?`, "I\u2019m sorry \u2014 I underestimated the time it would take, but I can submit it today.", [
      "Whatever, it\u2019s just homework.",
      "You never told us anything.",
      "I didn\u2019t do it because I slept, lol.",
      "That\u2019s your problem, not mine."
    ], seed, `Own the mistake and offer a solution.`);
  }
  if (id < 8e4) {
    const local2 = id - 6e4;
    const sizes2 = spaceOk([ACADEMIC_PAIRS.length, NAMES.length, GENERIC_NOUNS.length, 5], 2e4);
    const [ai, ni2, oi, qi] = decodeIndex(local2, sizes2);
    const item = ACADEMIC_PAIRS[ai];
    const name = NAMES[ni2];
    const noun = GENERIC_NOUNS[oi];
    const kind = qi % 5;
    if (kind === 0) {
      return buildQuestion(5, id, "Academic vocabulary", `What does \u201C${item.word}\u201D mean?`, item.meaning, item.distractors, seed, `${cap(item.word)}: ${item.meaning}.`);
    }
    if (kind === 1) {
      return buildQuestion(5, id, "Word choice", `${name} needs a precise word meaning \u201C${item.meaning}\u201D.`, item.word, ACADEMIC_PAIRS.map((x) => x.word), seed, `The best word is ${item.word}.`);
    }
    if (kind === 2) {
      return buildQuestion(5, id, "Relative clauses", `Choose the most accurate sentence.`, `The ${noun} that ${name} found was damaged.`, [
        `The ${noun} who ${name} found was damaged.`,
        `The ${noun} that ${name} found were damaged.`,
        `The ${noun} which ${name} found was damage.`,
        `The ${noun} that ${name} finding was damaged.`
      ], seed, `Use that/which for things; keep verb agreement.`);
    }
    if (kind === 3) {
      return buildQuestion(5, id, "Connectors", `Complete: The result was unexpected; ____, the team continued.`, "however", ["therefore because", "for example of", "such as if", "in order the"], seed, `However introduces contrast.`);
    }
    return buildQuestion(5, id, "Gerunds / infinitives", `Choose the natural sentence.`, `${name} suggested checking the ${noun}.`, [
      `${name} suggested to check the ${noun}.`,
      `${name} suggested check the ${noun}.`,
      `${name} suggested to checking the ${noun}.`,
      `${name} suggested that checking to the ${noun}.`
    ], seed, `Suggest + gerund (or that-clause).`);
  }
  if (id < 9e4) {
    const local2 = id - 8e4;
    const talks = [
      { q: "A classmate is stressed about exams. What sounds supportive and natural?", a: "If I were you, I\u2019d make a revision timetable and start with the hardest topic.", pool: ["If I was you I will cram all night and cry.", "You should to panic more.", "Exams are whatever, skip them.", "If I were you I would made nothing."] },
      { q: "You need to report what the coach said: \u201CPractice starts at 5.\u201D", a: "The coach said practice started at 5.", pool: ["The coach said practice starts at 5 always now then.", "The coach told practice start at 5.", "The coach said that practice starting at 5.", "The coach said practice has start at 5."] },
      { q: "Someone used an idiom: \u201CDon\u2019t cut corners.\u201D They mean:", a: "Don\u2019t rush and do a careless job.", pool: ["Don\u2019t walk near corners.", "Don\u2019t spend any money.", "Don\u2019t talk to strangers.", "Don\u2019t arrive early."] },
      { q: "You disagree in a group project.", a: "I get what you mean, but the data doesn\u2019t really support that yet.", pool: ["That\u2019s dumb and you\u2019re wrong.", "I am not agree you.", "Your idea no good.", "We no use data."] },
      { q: "You write a caption for a science fair project.", a: "The results suggest that temperature has a significant effect on growth.", pool: ["The results suggest temperature do effect growth significant.", "Results is suggesting temperature effect.", "The results suggesting significant growth temperature.", "Temperature significant the results growth."] },
      { q: "A friend spilled the beans about a surprise party. They:", a: "revealed the secret", pool: ["cooked too many beans", "cleaned the kitchen", "arrived too early", "bought expensive tickets"] },
      { q: "Choose the most natural complaint at a restaurant.", a: "Excuse me \u2014 I think this bill might be wrong.", pool: ["Hey you, this bill stupid.", "The bill are mistake.", "You gave wrong I think bill.", "This bill no correct, give new."] },
      { q: "You describe a movie without spoiling it.", a: "It\u2019s slower than I expected, but the ending really stays with you.", pool: ["It slower I expect but ending stay.", "It is more slow I thought ending.", "Ending stay you but slow it.", "The movie are slow ending stay."] }
    ];
    const sizes2 = spaceOk([NAMES.length, IDIOMS.length, talks.length, L2_PLACES.length], 1e4);
    const [ni2, ii, ti, pi] = decodeIndex(local2, sizes2);
    const t = talks[ti];
    const passage = `${NAMES[ni2]} is chatting near the ${L2_PLACES[pi]} after someone mentioned \u201C${IDIOMS[ii].idiom}\u201D.`;
    return buildQuestion(5, id, "Teen conversation", t.q, t.a, t.pool, seed, `The strongest choice is: ${t.a}`, [], passage);
  }
  const local = id - 9e4;
  const words = [...IDIOMS.map((x) => x.idiom), ...ACADEMIC_PAIRS.map((x) => x.word)];
  const sizes = spaceOk([words.length, NAMES.length, 8], 1e4);
  const [wi, ni, vi] = decodeIndex(local, sizes);
  const word = words[wi];
  return buildQuestion(5, id, "Spelling", `Which option matches standard English in ${NAMES[ni]}\u2019s article?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 4)), seed, `The standard form is ${word}.`);
}
function genL6(id, seed) {
  if (id < 4e4) {
    const sizes2 = spaceOk([COLLOCATIONS.length, NAMES.length, GENERIC_NOUNS.length, ACADEMIC_PAIRS.length, 4], 4e4);
    const [ci, ni2, oi, ai, fi] = decodeIndex(id, sizes2);
    const col = COLLOCATIONS[ci];
    const name = NAMES[ni2];
    const p = PRONOUNS[name];
    const noun = GENERIC_NOUNS[oi];
    const academic = ACADEMIC_PAIRS[ai];
    const passage = `${name} argued that the ${noun} was ${academic.word}, yet the committee still needed to ${col.pair} before publishing the findings. ${cap(p.subj)} refused to cut corners, even under a tight schedule.`;
    const focus = fi % 4;
    if (focus === 0) {
      return buildQuestion(6, id, "Collocations", `Choose the verb/adjective that collocates with \u201C${col.cue}\u201D.`, col.correct, col.wrong, seed, `The idiomatic collocation is ${col.pair}.`, [], passage);
    }
    if (focus === 1) {
      return buildQuestion(6, id, "Academic vocabulary", `In this passage, \u201C${academic.word}\u201D is closest in meaning to:`, academic.meaning, academic.distractors, seed, `${cap(academic.word)} means ${academic.meaning}.`, [], passage);
    }
    if (focus === 2) {
      return buildQuestion(6, id, "Reading inference", `What can be inferred about ${name}?`, `${cap(p.subj)} prioritized quality over speed.`, [
        `${cap(p.subj)} wanted to finish at any cost.`,
        `${cap(p.subj)} refused to publish anything.`,
        `${cap(p.subj)} ignored the committee.`,
        `${cap(p.subj)} cut corners to meet the deadline.`
      ], seed, `Refusing to cut corners means ${p.subj} would not sacrifice quality.`, [], passage);
    }
    return buildQuestion(6, id, "Reference", `What does \u201Cthe findings\u201D most likely refer to?`, `the results of the work on the ${noun}`, [
      "a holiday plan",
      "a restaurant bill",
      "a sports score",
      "a private diary entry with no research"
    ], seed, `The academic context points to research results.`, [], passage);
  }
  if (id < 6e4) {
    const local2 = id - 4e4;
    const sizes2 = spaceOk([FORMAL_INFORMAL.length, COLLOCATIONS.length, NAMES.length, 4], 2e4);
    const [fi, ci, ni2, qi] = decodeIndex(local2, sizes2);
    const pair = FORMAL_INFORMAL[fi];
    const col = COLLOCATIONS[ci];
    const name = NAMES[ni2];
    if (qi % 4 === 0) {
      return buildQuestion(6, id, "Register", `Choose the most formal equivalent of \u201C${pair.informal}\u201D.`, pair.formal, [pair.informal, ...pair.extra], seed, `In academic/workplace English, prefer ${pair.formal}.`);
    }
    if (qi % 4 === 1) {
      return buildQuestion(6, id, "Register", `Which option is too informal for a research paper?`, pair.informal, [pair.formal, "subsequently", "nevertheless", "in contrast"], seed, `\u201C${pair.informal}\u201D is conversational.`);
    }
    if (qi % 4 === 2) {
      return buildQuestion(6, id, "Collocations", `${name} must ___ ${col.cue} before Friday.`, col.correct, col.wrong, seed, `Use ${col.pair}.`);
    }
    return buildQuestion(6, id, "Nuance", `Which sentence is most precise?`, `The evidence strongly suggests a causal link, but it does not prove one.`, [
      `The evidence proves maybe a link or not, whatever.`,
      `The evidence are suggesting prove.`,
      `The evidence strongly suggest a causal link but do not proves.`,
      `The evidence is prove of causal.`
    ], seed, `Academic English separates suggestion from proof.`);
  }
  if (id < 8e4) {
    const local2 = id - 6e4;
    const sizes2 = spaceOk([NAMES.length, IRREGULAR.length, GENERIC_NOUNS.length, 5], 2e4);
    const [ni2, ii, oi, qi] = decodeIndex(local2, sizes2);
    const name = NAMES[ni2];
    const irr = IRREGULAR[ii];
    const noun = GENERIC_NOUNS[oi];
    const kind = qi % 5;
    if (kind === 0) {
      return buildQuestion(6, id, "Mixed conditionals", `Choose the most accurate mixed conditional.`, `If ${name} had ${irr[2]} the ${noun} earlier, ${PRONOUNS[name].subj} would not be in trouble now.`, [
        `If ${name} ${irr[1]} the ${noun} earlier, ${PRONOUNS[name].subj} will not be in trouble now.`,
        `If ${name} had ${irr[0]} the ${noun} earlier, ${PRONOUNS[name].subj} would not be in trouble now.`,
        `If ${name} has ${irr[2]} the ${noun} earlier, ${PRONOUNS[name].subj} would not been in trouble now.`,
        `If ${name} would have ${irr[2]} the ${noun} earlier, ${PRONOUNS[name].subj} would not be in trouble now.`
      ], seed, `Past condition + present result: had + past participle, would + base.`);
    }
    if (kind === 1) {
      return buildQuestion(6, id, "Inversion", `Choose the more formal inverted form.`, `Had ${name} ${irr[2]} sooner, the ${noun} would have been saved.`, [
        `Had ${name} ${irr[0]} sooner, the ${noun} would have been saved.`,
        `Had ${name} would ${irr[2]} sooner, the ${noun} would have been saved.`,
        `Did ${name} had ${irr[2]} sooner, the ${noun} would have been saved.`,
        `Have ${name} ${irr[2]} sooner, the ${noun} would been saved.`
      ], seed, `Formal inversion: Had + subject + past participle.`);
    }
    if (kind === 2) {
      return buildQuestion(6, id, "Cleft sentences", `Choose the cleft sentence that emphasizes the ${noun}.`, `It was the ${noun} that caused the delay.`, [
        `It were the ${noun} that caused the delay.`,
        `It was the ${noun} which cause the delay.`,
        `It is been the ${noun} that caused the delay.`,
        `It was the ${noun} that causing the delay.`
      ], seed, `Cleft: It was X that + clause.`);
    }
    if (kind === 3) {
      return buildQuestion(6, id, "Participles", `Choose the sentence with a correct participle clause.`, `Having ${irr[2]} the ${noun}, ${name} left the office.`, [
        `Having ${irr[0]} the ${noun}, ${name} left the office.`,
        `Having ${irr[1]} the ${noun}, ${name} left the office.`,
        `Have ${irr[2]} the ${noun}, ${name} left the office.`,
        `Having ${irr[2]} the ${noun}, ${name} leaving the office.`
      ], seed, `Having + past participle.`);
    }
    return buildQuestion(6, id, "Subject-verb agreement", `Choose the grammatically precise sentence.`, `The committee has reached a decision on the ${noun}.`, [
      `The committee have reach a decision on the ${noun}.`,
      `The committee has reach a decision on the ${noun}.`,
      `The committee has reached a decision on the ${noun}s is.`,
      `The committee reaching has a decision on the ${noun}.`
    ], seed, `In American academic English, committee is usually singular: has.`);
  }
  if (id < 9e4) {
    const local2 = id - 8e4;
    const talks = [
      { q: "You are emailing a professor to request an extension. Which is best?", a: "Would it be possible to request a short extension? I can submit a complete draft by Thursday.", pool: ["Hey, I need more time, thx.", "Give me extension now please because reasons.", "I was wondering you give time or what.", "Can haz extra days lol."] },
      { q: "In a meeting, a colleague interrupts with a weak claim. You respond professionally:", a: "Could we look at the data again? I\u2019m not sure that conclusion is fully supported yet.", pool: ["That\u2019s nonsense and you know it.", "Your idea is stupid frankly.", "No way that works, bro.", "I am not agree you conclusion."] },
      { q: "Which sentence belongs in an academic essay?", a: "This paper examines the extent to which urban design influences public health outcomes.", pool: ["This paper gonna talk about cities and health stuff.", "I will tell you what I think about cities.", "Cities are like, really important, you know?", "We gonna look at health in the city yeah."] },
      { q: "Choose the most idiomatic collocation.", a: "The policy poses a threat to smaller businesses.", pool: ["The policy puts a threat to smaller businesses.", "The policy makes a threat to smaller businesses.", "The policy does a threat to smaller businesses.", "The policy gives a threat to smaller businesses."] },
      { q: "You need to concede a point without abandoning your argument.", a: "While the method has limitations, the overall pattern remains consistent.", pool: ["The method has limitations so my whole argument is dead.", "Limitations whatever, I still win.", "The method limitation but pattern consistent remaining.", "While the method has limitations, but the pattern remains."] },
      { q: "Which option has the most precise hedging?", a: "The findings appear to indicate a modest improvement.", pool: ["The findings totally prove everything forever.", "The findings appear indicate modest improve.", "The findings are prove a modest improvement.", "The findings indicating modest improvement appear to."] },
      { q: "A client is unhappy. Choose the most professional reply.", a: "Thank you for flagging this. I\u2019ll look into the issue and get back to you by 3 p.m.", pool: ["Not my fault, talk to someone else.", "Wow chill, it\u2019s not that serious.", "I\u2019ll try maybe later if I remember.", "You should have read the email."] },
      { q: "Choose the sentence with correct parallel structure.", a: "The role requires analyzing data, presenting findings, and writing reports.", pool: ["The role requires analyzing data, to present findings, and write reports.", "The role requires analyze data, presenting findings, and to write reports.", "The role requires analyzing data, presenting findings, and to writing reports.", "The role requires analyzing data, present findings, and wrote reports."] }
    ];
    const sizes2 = spaceOk([NAMES.length, talks.length, COLLOCATIONS.length, FORMAL_INFORMAL.length], 1e4);
    const [ni2, ti, ci] = decodeIndex(local2, sizes2);
    const t = talks[ti];
    const passage = `${NAMES[ni2]} is reviewing a draft that currently overuses \u201C${FORMAL_INFORMAL[ci % FORMAL_INFORMAL.length].informal}\u201D and misses the collocation ${COLLOCATIONS[ci].pair}.`;
    return buildQuestion(6, id, "Professional English", t.q, t.a, t.pool, seed, `The most proficient choice is: ${t.a}`, [], passage);
  }
  const local = id - 9e4;
  const words = [...COLLOCATIONS.map((x) => x.pair), ...ACADEMIC_PAIRS.map((x) => x.word), ...FORMAL_INFORMAL.map((x) => x.formal)];
  const sizes = spaceOk([words.length, NAMES.length, 8], 1e4);
  const [wi, ni, vi] = decodeIndex(local, sizes);
  const word = words[wi];
  return buildQuestion(6, id, "Accuracy", `Which form is standard in ${NAMES[ni]}\u2019s final draft?`, word, [0, 1, 2, 3].map((n) => misspell(word, vi + n + 5)), seed, `The standard form is ${word}.`);
}
var GENERATORS = {
  1: genL1,
  2: genL2,
  3: genL3,
  4: genL4,
  5: genL5,
  6: genL6
};
function generateQuestion(level, id) {
  const index = (id % BANK_SIZE + BANK_SIZE) % BANK_SIZE;
  const seed = level * 1000003 + index * 97;
  return GENERATORS[level](index, seed);
}

// scripts/export-csv.ts
var root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
var outDir = path.join(root, "csv");
var HEADER = [
  "question_id",
  "level",
  "ages",
  "tutor",
  "skill",
  "passage",
  "prompt",
  "answer_a",
  "answer_b",
  "answer_c",
  "answer_d",
  "answer_e",
  "correct_letter",
  "correct_answer",
  "correct_index",
  "explanation"
];
var FILES = [
  { level: 1, file: "level-1-ages-3-5.csv" },
  { level: 2, file: "level-2-ages-6-8.csv" },
  { level: 3, file: "level-3-ages-9-10.csv" },
  { level: 4, file: "level-4-ages-11-12.csv" },
  { level: 5, file: "level-5-ages-13-15.csv" },
  { level: 6, file: "level-6-ages-15-plus.csv" }
];
function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
function writeLevel(level, filePath) {
  const meta = LEVELS[level - 1];
  const stream = createWriteStream(filePath, { encoding: "utf8" });
  const letters = ["A", "B", "C", "D", "E"];
  return new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.write("\uFEFF");
    stream.write(`${HEADER.join(",")}
`);
    let index = 0;
    const chunkSize = 250;
    const pump = () => {
      let chunk = "";
      const end = Math.min(BANK_SIZE, index + chunkSize);
      for (; index < end; index++) {
        const q = generateQuestion(level, index);
        chunk += [
          q.id + 1,
          q.level,
          meta.ages,
          meta.tutor.name,
          q.skill,
          q.passage ?? "",
          q.prompt,
          q.answers[0] ?? "",
          q.answers[1] ?? "",
          q.answers[2] ?? "",
          q.answers[3] ?? "",
          q.answers[4] ?? "",
          letters[q.correctIndex] ?? "",
          q.answers[q.correctIndex] ?? "",
          q.correctIndex,
          q.explanation
        ].map(csvCell).join(",");
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
await mkdir(outDir, { recursive: true });
for (const item of FILES) {
  const filePath = path.join(outDir, item.file);
  const started = Date.now();
  process.stdout.write(`Writing ${item.file}...
`);
  await writeLevel(item.level, filePath);
  process.stdout.write(`Done ${item.file} in ${((Date.now() - started) / 1e3).toFixed(1)}s
`);
}
process.stdout.write(`CSV files saved in ${outDir}
`);
