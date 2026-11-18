export const TIDAL_ACTIONS = [
  { id: 'paddle', label: 'Paddle', icon: '🚣' },
  { id: 'anchor', label: 'Anchor', icon: '⚓' },
  { id: 'steer', label: 'Steer', icon: '🧭' },
];

export const TIDAL_SIGNALS = [
  {
    id: 'surge',
    name: 'Surge',
    icon: '🌊',
    message: 'A powerful wave is building!',
    actionId: 'paddle',
  },
  {
    id: 'slack',
    name: 'Slack tide',
    icon: '🫧',
    message: 'The water is calm and still.',
    actionId: 'anchor',
  },
  {
    id: 'crosscurrent',
    name: 'Crosscurrent',
    icon: '🌀',
    message: 'A sideways current is pulling the boat.',
    actionId: 'steer',
  },
];

export function createTidalSignal(random = Math.random, previousId) {
  const choices = TIDAL_SIGNALS.filter(({ id }) => id !== previousId);
  const index = Math.min(choices.length - 1, Math.floor(random() * choices.length));
  return choices[index];
}

export function resolveTidalTurn(scores, playerIndex, actionId, signalId, target = 5) {
  const signal = TIDAL_SIGNALS.find(({ id }) => id === signalId);
  const correct = Boolean(signal && signal.actionId === actionId);
  const nextScores = scores.map((score, index) => (
    index === playerIndex && correct ? score + 1 : score
  ));

  return {
    correct,
    scores: nextScores,
    winnerIndex: nextScores.findIndex((score) => score >= target),
    expectedAction: signal?.actionId ?? null,
  };
}
