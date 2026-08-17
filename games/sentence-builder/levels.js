export const LEVELS = [
  {
    emoji: '🟢',
    name: 'Level 1 — Very Easy',
    sentences: [
      "The cat sat on a mat.",
      "The boy kicked the ball.",
      "She opened the door.",
      "The dog chased the bird.",
      "I ate an apple.",
      "The sun is shining.",
      "He reads a book.",
      "We walked to school.",
      "The baby is sleeping.",
      "They played a game."
    ]
  },
  {
    emoji: '🟡',
    name: 'Level 2 — Easy',
    sentences: [
      "The little girl found a coin.",
      "My brother likes chocolate cake.",
      "The teacher wrote on the board.",
      "We watched a movie last night.",
      "The dog slept under the table.",
      "Sarah bought a new red dress.",
      "The children played in the garden.",
      "I left my keys on the kitchen table.",
      "The old man walked slowly down the street.",
      "They visited their grandparents on Sunday."
    ]
  },
  {
    emoji: '🟠',
    name: 'Level 3 — Intermediate',
    sentences: [
      "The boy was reading a book when his mother called him.",
      "We went to the park because the weather was beautiful.",
      "Maria forgot her umbrella, so she got completely wet.",
      "The students finished their homework before they went outside.",
      "I saw a strange bird sitting on the roof this morning.",
      "Although it was raining, the children continued playing outside.",
      "James bought a sandwich because he was hungry after school.",
      "The woman who lives next door has a beautiful garden.",
      "When the bell rang, everyone quickly returned to the classroom.",
      "My sister usually walks to work, but today she took the bus."
    ]
  },
  {
    emoji: '🔵',
    name: 'Level 4 — Upper Intermediate',
    sentences: [
      "The students were excited because their teacher had planned a special activity.",
      "After we finished dinner, we went for a walk along the beach.",
      "The man who repaired our car gave us some useful advice.",
      "Although Sarah was tired, she decided to finish her project before going to bed.",
      "I couldn't find my phone because I had accidentally left it in the restaurant.",
      "When I arrived at the station, the train had already left.",
      "The children became quiet when they realized that someone was watching them.",
      "If you practice every day, you will become much more confident.",
      "The book that you gave me last week was more interesting than I expected.",
      "Because the road was closed, we had to take a different route home."
    ]
  },
  {
    emoji: '🔴',
    name: 'Level 5 — Advanced',
    sentences: [
      "Although he had never visited the city before, Daniel managed to find his way around without getting lost.",
      "The scientist explained that the experiment had failed because the equipment had not been properly prepared.",
      "If I had known that the meeting would take so long, I would have brought something to eat.",
      "The woman sitting beside me on the train told me about a village that she had visited many years ago.",
      "After they had finished repairing the old house, the family decided to turn it into a small guesthouse.",
      "Even though the weather forecast predicted heavy rain, the organizers decided to continue with the outdoor event.",
      "The teacher asked the students to explain why they believed the character had made such a difficult decision.",
      "Unless we leave before sunrise, we probably won't arrive at the mountain before the weather becomes dangerous.",
      "Having forgotten to charge his phone the night before, Michael had no way of contacting his friends when he arrived at the airport.",
      "Although the project seemed impossible at first, the team eventually succeeded because everyone was willing to work together and solve problems as they appeared."
    ]
  }
];

export const ROUNDS = LEVELS.flatMap(level => level.sentences.map(text => ({ words: text.split(' '), level })));
export const MAX_ATTEMPTS = 3;
