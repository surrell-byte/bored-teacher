export const QUIZ_ROUNDS = [
  {
    id: 1,
    title: "Round One",
    subtitle: "Warm-up questions",
    icon: "🌍",
    prizes: [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000],
    questions: [
      { prompt: "How long is an Olympic swimming pool?", answers: ["40 metres", "30 metres", "50 metres", "60 metres"], correct: "50 metres", images: ["olympic-swimming-pool-1.jpg", "olympic-swimming-pool-2.jpg"] },
      { prompt: "Cynophobia is a fear of which animal?", answers: ["Rats", "Dogs", "Spiders", "Birds"], correct: "Dogs", images: ["cynophobia-1.jpg", "cynophobia-2.jpg"] },
      { prompt: "Which religion worships Krishna?", answers: ["Christianity", "Buddhism", "Islam", "Hinduism"], correct: "Hinduism", images: ["krishna-1.jpg", "krishna-2.jpg"] },
      { prompt: "What does the Arabic word “qamar” mean?", answers: ["Wood", "Moon", "Fire", "Lighthouse"], correct: "Moon", images: ["qamar-1.jpg", "qamar-2.jpg"] },
      { prompt: "Which soft drink was taken into space first?", answers: ["Coca-Cola", "Pepsi", "Sprite", "Fanta"], correct: "Coca-Cola", images: ["space-cola-1.jpg", "space-cola-2.jpg"] },
      { prompt: "Which country is credited with inventing ice cream?", answers: ["The United States", "Russia", "Angola", "China"], correct: "China", images: ["ice-cream-1.jpg", "ice-cream-2.jpg"] },
      { prompt: "Gouda cheese comes from which country?", answers: ["Taiwan", "Australia", "The Netherlands", "Venezuela"], correct: "The Netherlands", images: ["gouda-cheese-1.jpg", "gouda-cheese-2.jpg"] },
      { prompt: "Which Disney princess is known for talking with animals?", answers: ["Moana", "Snow White", "Elsa", "Ariel"], correct: "Snow White", images: ["disney-princess-1.jpg", "disney-princess-2.jpg"] },
    ],
  },
  {
    id: 2,
    title: "Round Two",
    subtitle: "A little more challenging",
    icon: "🧠",
    prizes: [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 600_000, 750_000, 1_000_000],
    questions: [
      { prompt: "Thanos comes from which planet?", answers: ["Asgard", "Titan", "Vormir", "Knowhere"], correct: "Titan", images: ["thanos-1.jpg", "thanos-2.jpg"] },
      { prompt: "What is (7 × 9) + (12 × 3) − 8 − 2?", answers: ["79", "89", "91", "99"], correct: "89", images: ["maths-question-1.jpg", "maths-question-2.jpg"] },
      { prompt: "Which sport is often called the “king of sports”?", answers: ["Football", "Hockey", "Basketball", "Tennis"], correct: "Football", images: ["king-of-sports-1.jpg", "king-of-sports-2.jpg"] },
      { prompt: "Havana is the capital of which country?", answers: ["Colombia", "Mexico", "Cuba", "Morocco"], correct: "Cuba", images: ["havana-1.jpg", "havana-2.jpg"] },
      { prompt: "What is a common collective noun for a group of kangaroos?", answers: ["A troop", "A flock", "A nest", "A school"], correct: "A troop", images: ["kangaroos-group-1.jpg", "kangaroos-group-2.jpg"] },
      { prompt: "Which country has the most natural lakes?", answers: ["Botswana", "Canada", "India", "New Zealand"], correct: "Canada", images: ["natural-lakes-1.jpg", "natural-lakes-2.jpg"] },
      { prompt: "Which animal is famous for producing exceptionally loud calls?", answers: ["Mockingbird", "Great white shark", "Bald eagle", "Sperm whale"], correct: "Sperm whale", images: ["loudest-animal-1.jpg", "loudest-animal-2.jpg"] },
      { prompt: "Spell the word: a feeling of excitement or anticipation.", spelling: "excitement", images: ["excitement-1.jpg", "excitement-2.jpg"] },
      { prompt: "Spell the word: having or showing a lot of knowledge.", spelling: "knowledgeable", images: ["knowledgeable-1.jpg", "knowledgeable-2.jpg"] },
      { prompt: "Spell the word: very large.", spelling: "gigantic", images: ["gigantic-1.jpg", "gigantic-2.jpg"] },
    ],
  },
  {
    id: 3,
    title: "Round Three",
    subtitle: "Final challenge",
    icon: "🏆",
    prizes: [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000],
    questions: [
      { prompt: "A computer mouse’s movement is measured in “Mickeys”. What is being measured?", answers: ["Size", "Weight", "Speed", "Price"], correct: "Speed", images: ["mickeys-1.jpg", "mickeys-2.png"] },
      { prompt: "About how long is Ninety Mile Beach in New Zealand?", answers: ["60 miles", "55 miles", "70 miles", "90 miles"], correct: "55 miles", images: ["ninety-mile-1.jpg", "ninety-mile-2.jpg"] },
      { prompt: "What kind of animal is a Flemish giant?", answers: ["Goat", "Rabbit", "Pigeon", "Elephant"], correct: "Rabbit", images: ["flemish-giant-1.jpg", "flemish-giant-2.jpg"] },
      { prompt: "What does “hippopotamus” mean?", answers: ["River horse", "Water donkey", "River donkey", "Water horse"], correct: "River horse", images: ["hippopotamus-1.jpg", "hippopotamus-2.jpg"] },
      { prompt: "What is the hottest planet in our solar system?", answers: ["Saturn", "Jupiter", "Earth", "Venus"], correct: "Venus", images: ["solar-system-1.jpg", "solar-system-2.jpg"] },
      { prompt: "What is a duel involving three people sometimes called?", answers: ["A trial", "A truel", "A triel", "A tririri"], correct: "A truel", images: ["truel-1.jpg", "truel-2.jpg"] },
      { prompt: "A famous trivia claim associates a fork-related fried chicken ordinance with which U.S. state?", answers: ["Alabama", "Georgia", "Florida", "Tennessee"], correct: "Georgia", images: ["georgia-1.jpg", "georgia-2.jpg"] },
      { prompt: "Who was the first woman to fly solo across the Atlantic Ocean?", answers: ["Hillary Clinton", "Margot Robbie", "Amelia Earhart", "Zoe Saldana"], correct: "Amelia Earhart", images: ["amelia-1.jpg", "amelia-2.jpg"] },
    ],
  },
];

const QUESTION_IMAGE_ROOT = "/assets/games/general-knowledge-quiz/questions/";
for (const round of QUIZ_ROUNDS) {
  for (const question of round.questions) {
    if (question.images) question.images = question.images.map((filename) => `${QUESTION_IMAGE_ROOT}${filename}`);
  }
}

export function formatPrize(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

export function normalizeAnswer(value) {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}
