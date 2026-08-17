"use client";
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ROUNDS, MAX_ATTEMPTS } from './levels';
import './sentence-builder.css';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBank(words) {
  const tiles = words.map((text, i) => ({
    id: `word-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text
  }));
  let shuffled = shuffle(tiles);
  while (words.length > 1 && shuffled.map(t => t.text).join(' ') === words.join(' ')) {
    shuffled = shuffle(tiles);
  }
  return shuffled;
}

function emptySlots(len) { return Array.from({ length: len }, () => null); }

export default function SentenceBuilder() {
  const [roundIndex, setRoundIndex] = useState(0);
  const round = ROUNDS[roundIndex];
  const sentence = round.words;
  const level = round.level;

  const [bank, setBank] = useState(() => makeBank(sentence));
  const [slots, setSlots] = useState(() => emptySlots(sentence.length));
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [dragOverBank, setDragOverBank] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [resetLabel, setResetLabel] = useState('Reset');

  const draggedWordId = useRef(null);
  const touchState = useRef({ dragging: null, startX: 0, startY: 0, moved: false, overSlot: null });

  const filledCount = slots.filter(Boolean).length;
  const posInLevel = level.sentences.indexOf(sentence.join(' ')) + 1;

  useEffect(() => {
    setBank(makeBank(sentence));
    setSlots(emptySlots(sentence.length));
  }, [roundIndex]);

  function loadRound(index) {
    const r = ROUNDS[index];
    setRoundIndex(index);
    setBank(makeBank(r.words));
    setSlots(emptySlots(r.words.length));
    setAttempts(0);
    setRevealed(false);
    setFeedback(null);
    setResult(null);
    setShowNext(false);
    setResetLabel('Reset');
  }

  function resetAll() {
    setBank(makeBank(sentence));
    setSlots(emptySlots(sentence.length));
    setResult(null);
    setFeedback(null);
  }

  function placeWord(wordId, text, slotIndex) {
    if (revealed) return;
    setSlots(prev => {
      const next = [...prev];
      const displaced = next[slotIndex];
      next[slotIndex] = { wordId, text };
      if (displaced) setBank(b => [...b, displaced]);
      return next;
    });
    setBank(prev => prev.filter(w => w.id !== wordId));
    setFeedback(null);
  }

  function placeInNextEmptySlot(wordId, text) {
    if (revealed) return;
    setSlots(prev => {
      const idx = prev.findIndex(s => !s);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { wordId, text };
      return next;
    });
    setBank(prev => prev.filter(w => w.id !== wordId));
  }

  function removeFromSlot(slotIndex) {
    if (revealed) return;
    setSlots(prev => {
      const word = prev[slotIndex];
      if (!word) return prev;
      setBank(b => [...b, word]);
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setFeedback(null);
  }

  function onWordDragStart(e, wordId, text) {
    draggedWordId.current = { wordId, text };
    e.dataTransfer.setData('text/plain', wordId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  }
  function onWordDragEnd(e) { e.currentTarget.classList.remove('dragging'); setDragOverSlot(null); setDragOverBank(false); }
  function onSlotDragOver(e, i) { e.preventDefault(); setDragOverSlot(i); }
  function onSlotDragLeave() { setDragOverSlot(null); }
  function onSlotDrop(e, i) {
    e.preventDefault(); setDragOverSlot(null);
    if (revealed || !draggedWordId.current) return;
    const { wordId, text } = draggedWordId.current;
    placeWord(wordId, text, i);
    draggedWordId.current = null;
  }
  function onBankDragOver(e) { e.preventDefault(); setDragOverBank(true); }
  function onBankDragLeave() { setDragOverBank(false); }
  function onBankDrop(e) {
    e.preventDefault(); setDragOverBank(false);
    if (revealed || !draggedWordId.current) return;
    const { wordId } = draggedWordId.current;
    setSlots(prev => {
      const idx = prev.findIndex(s => s && s.wordId === wordId);
      if (idx === -1) return prev;
      const word = prev[idx];
      setBank(b => (b.some(w => w.id === wordId) ? b : [...b, word]));
      const next = [...prev]; next[idx] = null; return next;
    });
    draggedWordId.current = null;
  }

  function onWordClick(wordId, text) { placeInNextEmptySlot(wordId, text); }
  function onSlotClick(i) { if (slots[i]) removeFromSlot(i); }

  const TAP_MOVE_THRESHOLD = 10;
  function onWordTouchStart(e, wordId, text) { touchState.current = { dragging: { wordId, text }, startX: e.touches[0].clientX, startY: e.touches[0].clientY, moved: false, overSlot: null }; }
  function onTouchMove(e) {
    const ts = touchState.current; if (!ts.dragging) return; const touch = e.touches[0]; const dx = touch.clientX - ts.startX; const dy = touch.clientY - ts.startY; if (Math.sqrt(dx*dx + dy*dy) > TAP_MOVE_THRESHOLD) ts.moved = true; const el = document.elementsFromPoint(touch.clientX, touch.clientY).find(el => el.classList && el.classList.contains('sb-slot')); const idx = el ? Number(el.dataset.index) : null; if (idx !== ts.overSlot) { ts.overSlot = idx; setDragOverSlot(idx); }
  }
  function onTouchEnd() {
    const ts = touchState.current; if (!ts.dragging) return; setDragOverSlot(null); if (!ts.moved) { placeInNextEmptySlot(ts.dragging.wordId, ts.dragging.text); } else if (ts.overSlot !== null && !revealed) { placeWord(ts.dragging.wordId, ts.dragging.text, ts.overSlot); } touchState.current = { dragging: null, startX: 0, startY: 0, moved: false, overSlot: null };
  }

  function checkAnswer() {
    if (revealed) return;
    const studentAnswer = slots.map(s => (s ? s.text : ''));
    if (studentAnswer.join(' ') === sentence.join(' ')) {
      setFeedback(null); setResult({ type: 'good' }); setBurstKey(k => k + 1); finishOrNext(); return;
    }
    setFeedback(studentAnswer.map((w, i) => (slots[i] ? (w === sentence[i] ? 'correct' : 'incorrect') : null)));
    const nextAttempts = attempts + 1; setAttempts(nextAttempts);
    if (nextAttempts >= MAX_ATTEMPTS) { revealAnswer(); return; }
    setResult({ type: 'bad' });
  }

  function revealAnswer() { setRevealed(true); setBank([]); setSlots(sentence.map(w => ({ wordId: 'revealed', text: w }))); setFeedback(null); setResult({ type: 'reveal', text: sentence.join(' ') }); finishOrNext(); }
  function finishOrNext() { if (roundIndex < ROUNDS.length - 1) setShowNext(true); else { setShowNext(false); setResult({ type: 'complete' }); setResetLabel('Play Again'); } }
  function handleReset() { if (resetLabel === 'Play Again') { loadRound(0); setResetLabel('Reset'); return; } resetAll(); }
  function handleNext() { if (roundIndex < ROUNDS.length - 1) loadRound(roundIndex + 1); }

  const remaining = MAX_ATTEMPTS - attempts;
  const showAttemptsLabel = attempts > 0 && !revealed && attempts < MAX_ATTEMPTS;
  const showControls = !revealed && !(result && (result.type === 'good' || result.type === 'reveal'));

  return (
    <div className="sb-body">
      <div className="sb-press-frame" style={{ backgroundImage: `url('/games/sentence-builder/welcome-screen-bg.webp')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="sb-masthead">
          <div className="sb-eyebrow">{level.emoji} {level.name}</div>
          <h1>Build the Sentence</h1>
          <div className="sb-subtitle">Set the type in the correct order</div>
          <div className="sb-round-meta">Sentence {posInLevel} of {level.sentences.length} · Round {roundIndex + 1} of {ROUNDS.length}</div>
        </div>

        <div className="sb-galley-wrap">
          <div className="sb-galley-label"><span>The Galley</span><span>{filledCount} / {sentence.length} set</span></div>
          <div className={`sb-sentence-area${dragOverSlot !== null ? ' drag-over' : ''}`} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {burstKey > 0 && result?.type === 'good' && <InkBurst key={burstKey} />}
            {slots.map((word, i) => (
              <div key={i} data-index={i} className={[ 'sb-slot', word ? 'filled' : '', dragOverSlot === i ? 'highlight' : '', revealed ? 'revealed' : '', feedback && feedback[i] === 'correct' ? 'correct-slot' : '', feedback && feedback[i] === 'incorrect' ? 'incorrect-slot' : '' ].filter(Boolean).join(' ')} onClick={() => onSlotClick(i)} onDragOver={e => onSlotDragOver(e, i)} onDragEnter={e => onSlotDragOver(e, i)} onDragLeave={onSlotDragLeave} onDrop={e => onSlotDrop(e, i)}>
                <span className="sb-slot-word">{word ? word.text : ''}</span>
                {word && !revealed && <span className="sb-remove-hint">×</span>}
                <span className="sb-slot-index">{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sb-case-label">The Type Case <span className="sb-case-hint">— tap a word or drag it into place</span></div>
          <div className={`sb-word-bank${dragOverBank ? ' drag-over' : ''}`} onDragOver={onBankDragOver} onDragLeave={onBankDragLeave} onDrop={onBankDrop}>
            {bank.map(w => (
              <div key={w.id} className="sb-word" draggable onDragStart={e => onWordDragStart(e, w.id, w.text)} onDragEnd={onWordDragEnd} onClick={() => onWordClick(w.id, w.text)} onTouchStart={e => onWordTouchStart(e, w.id, w.text)} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>{w.text}</div>
            ))}
          </div>
        </div>

        {showControls && (
          <div className="sb-controls">
            <button className="sb-check-btn" onClick={checkAnswer}>Check Answer</button>
            <button className="sb-reset-btn" onClick={handleReset}>{resetLabel}</button>
          </div>
        )}
        {!showControls && result?.type === 'complete' && (
          <div className="sb-controls"><button className="sb-reset-btn" onClick={handleReset}>{resetLabel}</button></div>
        )}

        <div className="sb-result">
          {result?.type === 'good' && <div className="sb-seal good"><span className="sb-seal-icon">✓</span> Correctly Set</div>}
          {result?.type === 'bad' && <div className="sb-seal bad"><span className="sb-seal-icon">✕</span> Reset the Type — Try Again</div>}
          {result?.type === 'reveal' && <div className="sb-seal reveal"><span><span className="sb-seal-icon">✕</span> Out of attempts</span><span className="sb-reveal-sentence">"{result.text}"</span></div>}
          {result?.type === 'complete' && <div className="sb-seal complete"><span className="sb-seal-icon">✓</span> All rounds complete</div>}
        </div>

        {showAttemptsLabel && <div className="sb-attempts-label show">{remaining} attempt{remaining === 1 ? '' : 's'} remaining before the answer is revealed</div>}

        {showNext && (<div className="sb-controls" style={{ marginTop: 8 }}><button className="sb-next-btn show" onClick={handleNext}>Next Sentence</button></div>)}
      </div>
    </div>
  );
}

function InkBurst() {
  const flecks = useRef(Array.from({ length: 18 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    return { fx: Math.cos(angle) * dist, fy: Math.sin(angle) * dist, left: 50 + (Math.random() * 40 - 20), top: 50 + (Math.random() * 20 - 10), delay: Math.random() * 0.15, color: ['var(--sb-brass)', 'var(--sb-sage)', 'var(--sb-brass-bright)'][i % 3] };
  })).current;

  return (
    <div className="sb-stamp-burst">
      {flecks.map((f, i) => (
        <span key={i} className="sb-fleck" style={{ ['--fx']: `${f.fx}px`, ['--fy']: `${f.fy}px`, left: `${f.left}%`, top: `${f.top}%`, background: f.color, animationDelay: `${f.delay}s` }} />
      ))}
    </div>
  );
}
