export function getSequenceProgress(sequence, playerSequence, phase) {
  if (phase === "showing") return 0;

  let correctCount = 0;
  while (
    correctCount < playerSequence.length &&
    correctCount < sequence.length &&
    playerSequence[correctCount] === sequence[correctCount]
  ) {
    correctCount += 1;
  }
  return correctCount;
}
