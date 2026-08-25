import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CATEGORIES, MAX_ATTEMPTS, MODE_ORDER } from '../data/animals';
import { article, buildOptionSet, capitalize, shuffleArray } from '../utils/zooUtils';

const DEFAULT_CATEGORY = 'zoo';
const DEFAULT_TAB = 'guess';

export function useZooGame() {
  const [currentCategory, setCurrentCategory] = useState(DEFAULT_CATEGORY);
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [score, setScore] = useState(0);
  const [categoryIndices, setCategoryIndices] = useState({ farm: 0, zoo: 0, sea: 0 });
  const [categoryComplete, setCategoryComplete] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState('');

  const guessTimerRef = useRef(null);
  const lookTimerRef = useRef(null);
  const actTimerRef = useRef(null);

  const currentAnimals = useMemo(() => CATEGORIES[currentCategory]?.animals ?? [], [currentCategory]);
  const currentIndex = categoryIndices[currentCategory] ?? 0;
  const currentAnimal = currentAnimals[currentIndex] ?? null;

  const [guessState, setGuessState] = useState({
    options: [],
    attemptsUsed: 0,
    attempted: false,
    revealed: false,
    feedback: '🤔 Which animal is it? Click to guess!',
  });

  const [actState, setActState] = useState({
    done: false,
    revealed: false,
    feedback: '👆 Act it out, then press the button!',
  });

  const [lookState, setLookState] = useState({
    options: [],
    attemptsUsed: 0,
    answered: false,
    revealed: false,
    feedback: '🔤 Choose the right word to complete the sentence!',
    blank: '⋯',
    article: 'a',
    hintDisabled: false,
  });

  const clearTimers = useCallback(() => {
    [guessTimerRef, lookTimerRef, actTimerRef].forEach((ref) => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  }, []);

  const advanceCurrentQuestion = useCallback(() => {
    const nextIndex = (categoryIndices[currentCategory] ?? 0) + 1;
    setCategoryIndices((prev) => ({
      ...prev,
      [currentCategory]: nextIndex,
    }));

    if (nextIndex >= currentAnimals.length) {
      const label = CATEGORIES[currentCategory].name;
      setCategoryComplete(true);
      setVictoryMessage(`🏆 ${capitalize(label)} Level Complete!`);
      return;
    }

    if (activeTab === 'guess') {
      const nextAnimal = CATEGORIES[currentCategory].animals[nextIndex];
      setGuessState({
        options: buildOptionSet(CATEGORIES[currentCategory].animals, nextIndex, nextAnimal.name),
        attemptsUsed: 0,
        attempted: false,
        revealed: false,
        feedback: '🤔 Which animal is it? Click to guess!',
      });
    }

    if (activeTab === 'act') {
      const nextAnimal = CATEGORIES[currentCategory].animals[nextIndex];
      setActState({
        done: false,
        revealed: false,
        feedback: `🎭 Act like a ${nextAnimal.name}! Say: "I see ${article(nextAnimal.name)} ${nextAnimal.name}."`,
      });
    }

    if (activeTab === 'look') {
      const nextAnimal = CATEGORIES[currentCategory].animals[nextIndex];
      setLookState({
        options: buildOptionSet(CATEGORIES[currentCategory].animals, nextIndex, nextAnimal.name),
        attemptsUsed: 0,
        answered: false,
        revealed: false,
        feedback: `🔤 Choose the right word: "I see ${article(nextAnimal.name)} ___ in the zoo."`,
        blank: '⋯',
        article: article(nextAnimal.name),
        hintDisabled: false,
      });
    }
  }, [activeTab, categoryIndices, currentAnimals.length, currentCategory]);

  const setupCategoryQuestion = useCallback((categoryKey = currentCategory, index = categoryIndices[categoryKey] ?? 0) => {
    const animals = CATEGORIES[categoryKey].animals;
    const animal = animals[index];

    if (!animal) {
      setCategoryComplete(true);
      setVictoryMessage(`🏆 ${capitalize(CATEGORIES[categoryKey].name)} Level Complete!`);
      return;
    }

    setGuessState({
      options: buildOptionSet(animals, index, animal.name),
      attemptsUsed: 0,
      attempted: false,
      revealed: false,
      feedback: '🤔 Which animal is it? Click to guess!',
    });

    setActState({
      done: false,
      revealed: false,
      feedback: `🎭 Act like a ${animal.name}! Say: "I see ${article(animal.name)} ${animal.name}."`,
    });

    setLookState({
      options: buildOptionSet(animals, index, animal.name),
      attemptsUsed: 0,
      answered: false,
      revealed: false,
      feedback: `🔤 Choose the right word: "I see ${article(animal.name)} ___ in the zoo."`,
      blank: '⋯',
      article: article(animal.name),
      hintDisabled: false,
    });
  }, [categoryIndices, currentCategory]);

  const resetCategory = useCallback((categoryKey = currentCategory) => {
    clearTimers();
    setCategoryIndices((prev) => ({ ...prev, [categoryKey]: 0 }));
    setCategoryComplete(false);
    setVictoryMessage('');
    setupCategoryQuestion(categoryKey, 0);
  }, [clearTimers, currentCategory, setupCategoryQuestion]);

  const switchCategory = useCallback((categoryKey) => {
    clearTimers();
    setCurrentCategory(categoryKey);
    setCategoryComplete(false);
    setVictoryMessage('');
    setActiveTab(DEFAULT_TAB);
    setupCategoryQuestion(categoryKey, categoryIndices[categoryKey] ?? 0);
  }, [categoryIndices, clearTimers, setupCategoryQuestion]);

  const selectTab = useCallback((tabKey) => {
    clearTimers();
    setActiveTab(tabKey);
    setCategoryComplete(false);
    setVictoryMessage('');
    const idx = categoryIndices[currentCategory] ?? 0;
    setupCategoryQuestion(currentCategory, idx);
  }, [categoryIndices, clearTimers, currentCategory, setupCategoryQuestion]);

  useEffect(() => {
    setupCategoryQuestion(currentCategory, categoryIndices[currentCategory] ?? 0);
  }, [currentCategory, categoryIndices, setupCategoryQuestion]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleGuessAnswer = useCallback((optionName) => {
    if (!currentAnimal || guessState.attempted) return;

    if (optionName === currentAnimal.name) {
      setGuessState((prev) => ({
        ...prev,
        attempted: true,
        revealed: true,
        options: prev.options.map((option) => ({
          ...option,
          status: option.name === currentAnimal.name ? 'correct' : 'default',
          disabled: true,
        })),
        feedback: `🎉 Correct! It's a ${capitalize(currentAnimal.name)}!`,
      }));
      setScore((prev) => prev + 1);
      guessTimerRef.current = setTimeout(() => {
        advanceCurrentQuestion();
      }, 1800);
      return;
    }

    const nextAttempts = guessState.attemptsUsed + 1;
    const nextOptions = guessState.options.map((option) => {
      if (option.name === optionName) {
        return { ...option, status: 'wrong', disabled: true };
      }
      if (option.name === currentAnimal.name) {
        return { ...option, status: 'correct', disabled: true };
      }
      return option;
    });

    if (nextAttempts >= MAX_ATTEMPTS) {
      setGuessState({
        options: nextOptions,
        attemptsUsed: nextAttempts,
        attempted: true,
        revealed: true,
        feedback: `👀 It's a ${capitalize(currentAnimal.name)}! Next time you'll get it!`,
      });
      guessTimerRef.current = setTimeout(() => {
        advanceCurrentQuestion();
      }, 2400);
      return;
    }

    setGuessState({
      ...guessState,
      options: nextOptions,
      attemptsUsed: nextAttempts,
      feedback: `❌ Not quite! ${MAX_ATTEMPTS - nextAttempts} ${MAX_ATTEMPTS - nextAttempts === 1 ? 'try' : 'tries'} left...`,
    });
  }, [advanceCurrentQuestion, currentAnimal, guessState]);

  const handleLookAnswer = useCallback((optionName) => {
    if (!currentAnimal || lookState.answered) return;

    if (optionName === currentAnimal.name) {
      setLookState((prev) => ({
        ...prev,
        answered: true,
        revealed: true,
        blank: capitalize(currentAnimal.name),
        feedback: `✅ Perfect! "I see ${article(currentAnimal.name)} ${currentAnimal.name} in the zoo." ⭐ +1`,
        options: prev.options.map((option) => ({
          ...option,
          status: option.name === currentAnimal.name ? 'correct' : 'default',
          disabled: true,
        })),
        hintDisabled: true,
      }));
      setScore((prev) => prev + 1);
      lookTimerRef.current = setTimeout(() => {
        advanceCurrentQuestion();
      }, 1800);
      return;
    }

    const nextAttempts = lookState.attemptsUsed + 1;
    const nextOptions = lookState.options.map((option) => {
      if (option.name === optionName) {
        return { ...option, status: 'wrong', disabled: true };
      }
      if (option.name === currentAnimal.name) {
        return { ...option, status: 'correct', disabled: true };
      }
      return option;
    });

    if (nextAttempts >= MAX_ATTEMPTS) {
      setLookState({
        ...lookState,
        options: nextOptions,
        attemptsUsed: nextAttempts,
        answered: true,
        revealed: true,
        blank: capitalize(currentAnimal.name),
        feedback: `👀 It's "${capitalize(currentAnimal.name)}"! Next time you'll get it!`,
        hintDisabled: true,
      });
      lookTimerRef.current = setTimeout(() => {
        advanceCurrentQuestion();
      }, 2400);
      return;
    }

    setLookState({
      ...lookState,
      options: nextOptions,
      attemptsUsed: nextAttempts,
      feedback: `❌ Oops! ${MAX_ATTEMPTS - nextAttempts} ${MAX_ATTEMPTS - nextAttempts === 1 ? 'try' : 'tries'} left...`,
    });
  }, [advanceCurrentQuestion, currentAnimal, lookState]);

  const handleActAnswer = useCallback(() => {
    if (!currentAnimal || actState.done) return;
    setActState({
      done: true,
      revealed: true,
      feedback: `🌟 Great job! You acted and said "I see ${article(currentAnimal.name)} ${currentAnimal.name}." ⭐ +1`,
    });
    setScore((prev) => prev + 1);
    actTimerRef.current = setTimeout(() => {
      advanceCurrentQuestion();
    }, 2500);
  }, [actState.done, advanceCurrentQuestion, currentAnimal]);

  const handleLookHint = useCallback(() => {
    if (!currentAnimal || lookState.answered) return;
    setLookState((prev) => ({
      ...prev,
      feedback: `💡 Hint: It starts with "${capitalize(currentAnimal.name.charAt(0))}" and has ${currentAnimal.name.length} letters.`,
      hintDisabled: true,
    }));
  }, [currentAnimal, lookState.answered]);

  const questionCounterText = useMemo(() => {
    if (categoryComplete) {
      return `${CATEGORIES[currentCategory].name} level complete`;
    }

    const remaining = Math.max(0, currentAnimals.length - (categoryIndices[currentCategory] ?? 0));
    return `${remaining} questions left in ${CATEGORIES[currentCategory].name}`;
  }, [categoryComplete, currentAnimals.length, currentCategory, categoryIndices]);

  return {
    categories: CATEGORIES,
    categoryOrder: Object.keys(CATEGORIES),
    currentCategory,
    activeTab,
    setActiveTab: selectTab,
    setCurrentCategory: switchCategory,
    score,
    categoryComplete,
    victoryMessage,
    currentAnimal,
    currentIndex,
    questionCounterText,
    guessState,
    actState,
    lookState,
    handleGuessAnswer,
    handleActAnswer,
    handleLookAnswer,
    handleLookHint,
    resetCategory,
    setGuessState,
    setActState,
    setLookState,
    MAX_ATTEMPTS,
    MODE_ORDER,
    article,
    capitalize,
    shuffleArray,
  };
}
