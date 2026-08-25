import React from 'react';

import { CategoryTabs } from './components/CategoryTabs';
import { ModeTabs } from './components/ModeTabs';
import { GuessPanel } from './components/GuessPanel';
import { ActPanel } from './components/ActPanel';
import { LookPanel } from './components/LookPanel';
import { VictoryOverlay } from './components/VictoryOverlay';
import { useZooGame } from './hooks/useZooGame';
import './styles/zooGame.css';

export default function ZooGame({ themeId = 'savanna' }) {
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

        <CategoryTabs
          categories={categories}
          categoryOrder={categoryOrder}
          activeCategory={currentCategory}
          onChange={setCurrentCategory}
        />

        <ModeTabs modes={MODE_ORDER} activeTab={activeTab} onChange={setActiveTab} />

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
