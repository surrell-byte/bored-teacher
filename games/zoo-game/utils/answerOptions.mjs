export function markAnswerOptions(options, selectedName, correctName, revealCorrect) {
  return options.map((option) => {
    if (option.name === selectedName) {
      return { ...option, status: 'wrong', disabled: true };
    }

    if (revealCorrect && option.name === correctName) {
      return { ...option, status: 'correct', disabled: true };
    }

    return option;
  });
}
