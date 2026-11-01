export type BananaTeam = {
  id: string;
  name: string;
  animal: string;
  color: string;
  bananas: number;
  streak: number;
};

export type BananaQuestion = {
  letter: string | null;
  prompt: string;
  answer: string;
};

export const BANANA_TEAMS = [
  { id: 'panda', name: 'Panda Pals', animal: '🐼', color: '#e74c3c' },
  { id: 'koala', name: 'Koala Crew', animal: '🐨', color: '#7c3aed' },
  { id: 'raccoon', name: 'Raccoon Raiders', animal: '🦝', color: '#22a66f' },
  { id: 'monkey', name: 'Monkey Movers', animal: '🐵', color: '#ec4899' },
] as const;

export const BANANA_GOAL_DEFAULT = 6;
export const BANANA_GOAL_MIN = 3;
export const BANANA_GOAL_MAX = 10;
export const GOLDEN_LETTERS = ['A', 'M', 'S', 'Y'];

export const DEFAULT_QUESTION_TEXT = [
  'What planet is known as the Red Planet? | Mars',
  'What is the opposite of empty? | Full',
  'How many sides does a triangle have? | Three',
  'Which animal is the largest on Earth? | Blue whale',
  'What do bees make? | Honey',
  'Which ocean is the largest? | Pacific Ocean',
  'What is the past tense of go? | Went',
  'Name a word that rhymes with light. | Answers vary',
];

/** Accepts either `question | answer` or `letter | question | answer` rows. */
export function parseBananaQuestions(source: string): BananaQuestion[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim());
      if (parts.length >= 3 && /^[a-z]$/i.test(parts[0])) {
        return { letter: parts[0].toUpperCase(), prompt: parts[1], answer: parts.slice(2).join(' | ') || 'Teacher decides' };
      }
      return { letter: null, prompt: parts[0], answer: parts.slice(1).join(' | ') || 'Teacher decides' };
    })
    .filter((question) => question.prompt.length > 0);
}

/** Prefer a question written for the chosen letter; otherwise rotate the general bank. */
export function getBananaQuestion(questions: BananaQuestion[], letter: string, questionNumber: number): BananaQuestion {
  const exact = questions.find((question) => question.letter === letter.toUpperCase());
  if (exact) return exact;

  const general = questions.filter((question) => !question.letter);
  if (general.length) return general[Math.max(0, questionNumber) % general.length];

  if (questions.length) return questions[Math.max(0, questionNumber) % questions.length];
  return { letter: letter.toUpperCase(), prompt: `Say a word that begins with ${letter.toUpperCase()}.`, answer: 'Teacher decides' };
}

export function createBananaTeams(names: string[], count: number): BananaTeam[] {
  return BANANA_TEAMS.slice(0, count).map((preset, index) => ({
    ...preset,
    name: names[index]?.trim() || preset.name,
    bananas: 0,
    streak: 0,
  }));
}

export function calculateBananaAccuracy(correct: number, answered: number): number {
  return answered > 0 ? Math.round((correct / answered) * 100) : 0;
}

/** Point the top pointer at the selected wheel segment after several full turns. */
export function getSpinnerRotation(teamIndex: number, teamCount: number): number {
  const segmentSize = 360 / Math.max(1, teamCount);
  const segmentCenter = (teamIndex + 0.5) * segmentSize;
  return 360 * 5 + ((360 - segmentCenter) % 360);
}
