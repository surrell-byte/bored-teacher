export const ESL_SENTENCES = [
  { before: 'I eat an', after: 'every morning.', answer: 'apple' },
  { before: 'The cat is sleeping on the', after: '.', answer: 'mat' },
  { before: 'Please close the', after: 'when you leave.', answer: 'door' },
  { before: 'We drink water from a', after: '.', answer: 'glass' },
  { before: 'Birds can', after: 'in the sky.', answer: 'fly' },
  { before: 'She is reading a', after: 'about a dragon.', answer: 'book' },
  { before: 'Put on your coat. It is', after: 'outside.', answer: 'cold' },
  { before: 'We brush our teeth with a', after: '.', answer: 'toothbrush' },
  { before: 'A fish lives in the', after: '.', answer: 'water' },
  { before: 'I write with a', after: 'at school.', answer: 'pencil' },
  { before: 'The opposite of up is', after: '.', answer: 'down' },
  { before: 'A young dog is called a', after: '.', answer: 'puppy' },
  { before: 'You wear shoes on your', after: '.', answer: 'feet' },
  { before: 'The day after Monday is', after: '.', answer: 'Tuesday' },
  { before: 'We use an umbrella when it', after: '.', answer: 'rains' },
  { before: 'The soup is too hot. Let it', after: 'for a minute.', answer: 'cool' },
];

export function normalizeEslAnswer(value) {
  return String(value).trim().toLocaleLowerCase().replace(/[.!?]+$/, '');
}
