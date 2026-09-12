import React, { useEffect, useRef, useState } from 'react';

import { GuessPanel } from './components/GuessPanel';
import { ActPanel } from './components/ActPanel';
import { LookPanel } from './components/LookPanel';
import { VictoryOverlay } from './components/VictoryOverlay';
import { useZooGame } from './hooks/useZooGame';
import './styles/zooGame.css';

export default function ZooGame({ themeId = 'savanna', onComplete }) {
  const {
    categories,
    categoryOrder,
    currentCategory,
    activeTab,
    setCurrentCategory,
    setActiveTab,
    score,
    questionCounterText,
    currentAnimal,
    guessState,
    actState,
    lookState,
    handleGuessAnswer,
    handleActAnswer,
    handleLookAnswer,
    handleLookHint,
    categoryComplete,
    victoryMessage,
    resetCategory,
    MODE_ORDER,
  } = useZooGame();
  const [showMenu, setShowMenu] = useState(true);
  const [menuCategory, setMenuCategory] = useState(currentCategory);
  const [menuMode, setMenuMode] = useState(activeTab);
  const completionReportedRef = useRef(false);

  useEffect(() => {
    const openMenu = () => setShowMenu(true);
    window.addEventListener('zoo-game:main-menu', openMenu);
    return () => window.removeEventListener('zoo-game:main-menu', openMenu);
  }, []);

  useEffect(() => {
    if (!categoryComplete) {
      completionReportedRef.current = false;
      return;
    }

    if (completionReportedRef.current || !onComplete) return;
    completionReportedRef.current = true;
    const totalQuestions = categories[currentCategory].animals.length;
    onComplete(score, Math.round((score / totalQuestions) * 100));
  }, [categoryComplete, categories, currentCategory, onComplete, score]);

  const startGame = () => {
    const category = menuCategory;
    const mode = menuMode;
    setCurrentCategory(category);
    setActiveTab(mode);
    setShowMenu(false);
  };

  if (showMenu) {
    return (
      <div className={`zoogame-root zoo-theme-${themeId}`}>
        <div className="zoo-main-menu" role="main" aria-label="Zoo Game main menu">
          <div className="zoo-menu-hero">
            <div className="zoo-menu-icon">🦁</div>
            <p className="zoo-menu-kicker">Welcome to the wild</p>
            <h1>Zoo Game</h1>
            <p>Choose a habitat and a level to begin.</p>
          </div>
          <div className="zoo-menu-section">
            <h2>Choose a habitat</h2>
            <div className="zoo-menu-grid zoo-menu-categories">
              {categoryOrder.map((key) => (
                <button key={key} type="button" className={menuCategory === key ? 'selected' : ''} onClick={() => setMenuCategory(key)}>
                  {categories[key].emoji} {categories[key].name}
                  <small>{categories[key].animals.length} questions</small>
                </button>
              ))}
            </div>
          </div>
          <div className="zoo-menu-section">
            <h2>Choose a level</h2>
            <div className="zoo-menu-grid zoo-menu-modes">
              {MODE_ORDER.map((mode) => (
                <button key={mode} type="button" className={menuMode === mode ? 'selected' : ''} onClick={() => setMenuMode(mode)}>
                  {mode === 'guess' ? '🤔 Guess & Say' : mode === 'act' ? '🎭 Act & Say' : '👀 Look, Listen & Say'}
                  <small>{mode === 'guess' ? 'Identify the animal' : mode === 'act' ? 'Speak and act it out' : 'Complete the sentence'}</small>
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="zoo-menu-start" onClick={startGame}>Start Adventure</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`zoogame-root zoo-theme-${themeId}`}>
      <div className="game-wrapper" role="main" aria-label="Zoo animal guessing game">
        <div className="question-counter">{questionCounterText}</div>
        <span id="scoreDisplay" hidden>{score}</span>

        <VictoryOverlay
          visible={categoryComplete}
          message={victoryMessage}
          onReplay={() => {
            resetCategory(currentCategory);
            setActiveTab('guess');
          }}
        />

        {activeTab === 'guess' ? (
          <GuessPanel
            currentAnimal={currentAnimal}
            guessState={guessState}
            onSelect={handleGuessAnswer}
          />
        ) : null}

        {activeTab === 'act' ? (
          <ActPanel
            currentAnimal={currentAnimal}
            actState={actState}
            onCheck={handleActAnswer}
          />
        ) : null}

        {activeTab === 'look' ? (
          <LookPanel
            currentAnimal={currentAnimal}
            lookState={lookState}
            onSelect={handleLookAnswer}
            onHint={handleLookHint}
          />
        ) : null}
      </div>
    </div>
  );
}
