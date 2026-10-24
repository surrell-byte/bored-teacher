export const EMOJI_CATEGORIES = [
  {
    id: "food",
    label: "Food",
    icon: "🍽️",
    items: [
      { id: "apple", emoji: "🍎", word: "Apple" },
      { id: "banana", emoji: "🍌", word: "Banana" },
      { id: "pizza", emoji: "🍕", word: "Pizza" },
      { id: "carrot", emoji: "🥕", word: "Carrot" },
      { id: "bread", emoji: "🍞", word: "Bread" },
      { id: "cheese", emoji: "🧀", word: "Cheese" },
      { id: "cake", emoji: "🎂", word: "Cake" },
      { id: "orange", emoji: "🍊", word: "Orange" },
      { id: "strawberry", emoji: "🍓", word: "Strawberry" },
      { id: "egg", emoji: "🍳", word: "Egg" },
      { id: "ice-cream", emoji: "🍦", word: "Ice cream" },
      { id: "sandwich", emoji: "🥪", word: "Sandwich" },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    icon: "🚌",
    items: [
      { id: "train", emoji: "🚆", word: "Train" },
      { id: "bus", emoji: "🚌", word: "Bus" },
      { id: "airplane", emoji: "✈️", word: "Airplane" },
      { id: "bicycle", emoji: "🚲", word: "Bicycle" },
      { id: "boat", emoji: "🚢", word: "Boat" },
      { id: "car", emoji: "🚗", word: "Car" },
      { id: "rocket", emoji: "🚀", word: "Rocket" },
      { id: "taxi", emoji: "🚕", word: "Taxi" },
      { id: "helicopter", emoji: "🚁", word: "Helicopter" },
      { id: "scooter", emoji: "🛴", word: "Scooter" },
      { id: "tractor", emoji: "🚜", word: "Tractor" },
      { id: "motorcycle", emoji: "🏍️", word: "Motorcycle" },
      { id: "truck", emoji: "🚚", word: "Truck" },
    ],
  },
  {
    id: "animals",
    label: "Animals",
    icon: "🐾",
    items: [
      { id: "cat", emoji: "🐱", word: "Cat" },
      { id: "dog", emoji: "🐶", word: "Dog" },
      { id: "lion", emoji: "🦁", word: "Lion" },
      { id: "turtle", emoji: "🐢", word: "Turtle" },
      { id: "fish", emoji: "🐟", word: "Fish" },
      { id: "penguin", emoji: "🐧", word: "Penguin" },
      { id: "frog", emoji: "🐸", word: "Frog" },
      { id: "elephant", emoji: "🐘", word: "Elephant" },
      { id: "monkey", emoji: "🐒", word: "Monkey" },
      { id: "rabbit", emoji: "🐰", word: "Rabbit" },
      { id: "whale", emoji: "🐳", word: "Whale" },
      { id: "bear", emoji: "🐻", word: "Bear" },
      { id: "butterfly", emoji: "🦋", word: "Butterfly" },
    ],
  },
  {
    id: "nature",
    label: "Nature",
    icon: "🌿",
    items: [
      { id: "sun", emoji: "☀️", word: "Sun" },
      { id: "tree", emoji: "🌳", word: "Tree" },
      { id: "flower", emoji: "🌼", word: "Flower" },
      { id: "cloud", emoji: "☁️", word: "Cloud" },
      { id: "mountain", emoji: "⛰️", word: "Mountain" },
      { id: "leaf", emoji: "🍃", word: "Leaf" },
      { id: "rainbow", emoji: "🌈", word: "Rainbow" },
      { id: "moon", emoji: "🌙", word: "Moon" },
      { id: "star", emoji: "⭐", word: "Star" },
      { id: "volcano", emoji: "🌋", word: "Volcano" },
      { id: "snowflake", emoji: "❄️", word: "Snowflake" },
      { id: "waterfall", emoji: "🏞️", word: "Waterfall" },
      { id: "cactus", emoji: "🌵", word: "Cactus" },
    ],
  },
];

export const EMOJI_SORT_DIFFICULTIES = {
  easy: { label: "Easy", items: 3 },
  medium: { label: "Medium", items: 5 },
  hard: { label: "Hard", items: 7 },
};

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function createEmojiCategoryRound(difficulty, random = Math.random) {
  const setting = EMOJI_SORT_DIFFICULTIES[difficulty];
  if (!setting) throw new RangeError(`Unknown emoji sorting difficulty: ${difficulty}`);

  const categories = shuffle(EMOJI_CATEGORIES, random);
  const firstFromEach = categories.map((category) => shuffle(category.items, random)[0]);
  const selected = firstFromEach.slice(0, setting.items);
  if (selected.length < setting.items) {
    const selectedIds = new Set(selected.map((item) => item.id));
    const remaining = EMOJI_CATEGORIES.flatMap((category) => category.items)
      .filter((item) => !selectedIds.has(item.id));
    selected.push(...shuffle(remaining, random).slice(0, setting.items - selected.length));
  }
  return shuffle(selected, random).map((item) => ({
    ...item,
    categoryId: EMOJI_CATEGORIES.find((category) => category.items.some((entry) => entry.id === item.id)).id,
  }));
}

export function createEmojiWordQuestions(categoryId, random = Math.random) {
  const category = EMOJI_CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) throw new RangeError(`Unknown emoji sorting category: ${categoryId}`);
  const allItems = EMOJI_CATEGORIES.flatMap((entry) => entry.items);
  return shuffle(category.items, random).map((item) => {
    const distractors = shuffle(allItems.filter((entry) => entry.id !== item.id), random).slice(0, 3);
    return {
      ...item,
      categoryId: category.id,
      choices: shuffle([item, ...distractors], random),
    };
  });
}
