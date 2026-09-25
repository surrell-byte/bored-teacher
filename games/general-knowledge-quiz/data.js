export const QUIZ_ROUNDS = [
  {
    id: 1,
    title: "Round One",
    subtitle: "Warm-up questions",
    icon: "🌍",
    prizes: [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000],
    questions: [
      { prompt: "How long is an Olympic swimming pool?", answers: ["40 metres", "30 metres", "50 metres", "60 metres"], correct: "50 metres" },
      { prompt: "Cynophobia is a fear of which animal?", answers: ["Rats", "Dogs", "Spiders", "Birds"], correct: "Dogs" },
      { prompt: "Which religion worships Krishna?", answers: ["Christianity", "Buddhism", "Islam", "Hinduism"], correct: "Hinduism" },
      { prompt: "What does the Arabic word “qamar” mean?", answers: ["Wood", "Moon", "Fire", "Lighthouse"], correct: "Moon" },
      { prompt: "Which soft drink was taken into space first?", answers: ["Coca-Cola", "Pepsi", "Sprite", "Fanta"], correct: "Coca-Cola" },
      { prompt: "Which country is credited with inventing ice cream?", answers: ["The United States", "Russia", "Angola", "China"], correct: "China" },
      { prompt: "Gouda cheese comes from which country?", answers: ["Taiwan", "Australia", "The Netherlands", "Venezuela"], correct: "The Netherlands" },
      { prompt: "Which Disney princess is known for talking with animals?", answers: ["Moana", "Snow White", "Elsa", "Ariel"], correct: "Snow White" },
    ],
  },
  {
    id: 2,
    title: "Round Two",
    subtitle: "A little more challenging",
    icon: "🧠",
    prizes: [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 600_000, 750_000, 1_000_000],
    questions: [
      { prompt: "Thanos comes from which planet?", answers: ["Asgard", "Titan", "Vormir", "Knowhere"], correct: "Titan" },
      { prompt: "What is (7 × 9) + (12 × 3) − 8 − 2?", answers: ["79", "89", "91", "99"], correct: "89" },
      { prompt: "Which sport is often called the “king of sports”?", answers: ["Football", "Hockey", "Basketball", "Tennis"], correct: "Football" },
      { prompt: "Havana is the capital of which country?", answers: ["Colombia", "Mexico", "Cuba", "Morocco"], correct: "Cuba" },
      { prompt: "What is a common collective noun for a group of kangaroos?", answers: ["A troop", "A flock", "A nest", "A school"], correct: "A troop" },
      { prompt: "Which country has the most natural lakes?", answers: ["Botswana", "Canada", "India", "New Zealand"], correct: "Canada" },
      { prompt: "Which animal is famous for producing exceptionally loud calls?", answers: ["Mockingbird", "Great white shark", "Bald eagle", "Sperm whale"], correct: "Sperm whale" },
      { prompt: "Spell the word: a feeling of excitement or anticipation.", spelling: "excitement" },
      { prompt: "Spell the word: having or showing a lot of knowledge.", spelling: "knowledgeable" },
      { prompt: "Spell the word: very large.", spelling: "gigantic" },
    ],
  },
  {
    id: 3,
    title: "Round Three",
    subtitle: "Final challenge",
    icon: "🏆",
    prizes: [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000],
    questions: [
      { prompt: "A computer mouse’s movement is measured in “Mickeys”. What is being measured?", answers: ["Size", "Weight", "Speed", "Price"], correct: "Speed" },
      { prompt: "About how long is Ninety Mile Beach in New Zealand?", answers: ["60 miles", "55 miles", "70 miles", "90 miles"], correct: "55 miles" },
      { prompt: "What kind of animal is a Flemish giant?", answers: ["Goat", "Rabbit", "Pigeon", "Elephant"], correct: "Rabbit" },
      { prompt: "What does “hippopotamus” mean?", answers: ["River horse", "Water donkey", "River donkey", "Water horse"], correct: "River horse" },
      { prompt: "What is the hottest planet in our solar system?", answers: ["Saturn", "Jupiter", "Earth", "Venus"], correct: "Venus" },
      { prompt: "What is a duel involving three people sometimes called?", answers: ["A trial", "A truel", "A triel", "A tririri"], correct: "A truel" },
      { prompt: "What is the capital of the U.S. state of Georgia?", answers: ["Savannah", "Atlanta", "Augusta", "Columbus"], correct: "Atlanta" },
      { prompt: "Who was the first woman to fly solo across the Atlantic Ocean?", answers: ["Hillary Clinton", "Margot Robbie", "Amelia Earhart", "Zoe Saldana"], correct: "Amelia Earhart" },
    ],
  },
];

export function formatPrize(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

export function normalizeAnswer(value) {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}
