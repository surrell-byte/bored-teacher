'use client';

import React, { useState } from 'react';

const correctSentence = ['Cats', 'are', 'cute'];
const words = ['are', 'cute', 'Cats'];

export default function SentenceBuilder({ onComplete }) {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(50);
  const [streak, setStreak] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [message, setMessage] = useState('');

  const addWord = word => {
    if (selectedWords.length >= correctSentence.length) return;
    setSelectedWords(current => [...current, word]);
    setMessage('');
  };
  const removeWord = index => setSelectedWords(current => current.filter((_, i) => i !== index));
  const clearSentence = () => { setSelectedWords([]); setMessage(''); };
  const checkSentence = () => {
    const correct = JSON.stringify(selectedWords) === JSON.stringify(correctSentence);
    if (correct) {
      setScore(current => current + 1);
      setCoins(current => current + 10);
      setStreak(current => current + 1);
      setMessage('Great job!');
      onComplete?.(100, 100);
    } else {
      setStreak(0);
      setMessage('Almost! Try again.');
    }
  };

  return (
    <div className="sentence-builder-game">
      <header className="sentence-builder-header">
        <div className="sentence-builder-title"><span aria-hidden="true">📝</span><div><h1>Sentence Builder</h1><p>MASTER THE LANGUAGE</p></div></div>
        <div className="sentence-builder-stats"><span>⭐ <b>{score}</b><small> BEST</small></span><span>🔥 <b>{streak}</b><small> STREAK</small></span><span>🪙 <b>{coins}</b></span></div>
      </header>
      <main className="sentence-builder-content">
        <section className="sentence-builder-panel">
          <div className="sentence-builder-level"><div><small>CURRENT LEVEL</small><strong>LEVEL 1</strong></div><span>EASY</span></div>
          <div className="sentence-builder-progress"><div><span>Progress</span><b>0 / 10</b></div><i><em /></i></div>
          <div className="sentence-builder-instruction"><span>🧩</span><div><b>Build the sentence</b><p>Put the words in the correct order.</p></div></div>
          <div className="sentence-builder-sentence"><label>YOUR SENTENCE</label><div className="sentence-builder-slots">{[0, 1, 2].map(index => { const word = selectedWords[index]; return <button type="button" key={index} className={`sentence-builder-slot${word ? ' filled' : ''}`} onClick={() => word && removeWord(index)}>{word || <small>{index + 1}</small>}{word && <span aria-hidden="true">×</span>}</button>; })}</div></div>
          <div className="sentence-builder-bank"><label>WORD BANK <small>DRAG OR CLICK</small></label><div>{words.map((word, index) => <button type="button" key={word} className={`sentence-builder-word word-${index}`} onClick={() => addWord(word)}>{word}</button>)}</div></div>
          {message && <div className={`sentence-builder-feedback ${message.startsWith('Great') ? 'success' : 'try-again'}`} role="status">{message}</div>}
          <div className="sentence-builder-controls"><button type="button" className="secondary-button" onClick={clearSentence}>↻ Clear</button><button type="button" className="hint-button" onClick={() => setMessage('Hint: start with Cats.')}>💡 Hint</button><button type="button" className="check-button" onClick={checkSentence}>✓ Check</button></div>
        </section>
        <section className="sentence-builder-character-area"><img src="/assets/images/sentence-builder-character.svg" alt="Learning character" className="sentence-builder-character" /><div className="sentence-builder-bubble"><b>👋 Ready?</b><p>Build the sentence and earn rewards!</p></div></section>
      </main>
    </div>
  );
}
