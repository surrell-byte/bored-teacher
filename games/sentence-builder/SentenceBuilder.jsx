import React, { useEffect, useState } from 'react';

export default function SentenceBuilder() {
  useEffect(() => {
    // Original page script ported to run on client-side inside useEffect
    // Slightly adapted so it initializes after component mounts.
    (function() {
      // ----- CONFIGURATION -----
      const LEVELS = [
        {
          emoji: '🟢',
          name: 'Level 1 — Very Easy',
          sentences: [
            "The cat sat on a mat.",
            "The boy kicked the ball.",
            "She opened the door.",
            "The dog chased the bird.",
            "I ate an apple.",
            "The sun is shining.",
            "He reads a book.",
            "We walked to school.",
            "The baby is sleeping.",
            "They played a game."
          ]
        },
        {
          emoji: '🟡',
          name: 'Level 2 — Easy',
          sentences: [
            "The little girl found a coin.",
            "My brother likes chocolate cake.",
            "The teacher wrote on the board.",
            "We watched a movie last night.",
            "The dog slept under the table.",
            "Sarah bought a new red dress.",
            "The children played in the garden.",
            "I left my keys on the kitchen table.",
            "The old man walked slowly down the street.",
            "They visited their grandparents on Sunday."
          ]
        },
        {
          emoji: '🟠',
          name: 'Level 3 — Intermediate',
          sentences: [
            "The boy was reading a book when his mother called him.",
            "We went to the park because the weather was beautiful.",
            "Maria forgot her umbrella, so she got completely wet.",
            "The students finished their homework before they went outside.",
            "I saw a strange bird sitting on the roof this morning.",
            "Although it was raining, the children continued playing outside.",
            "James bought a sandwich because he was hungry after school.",
            "The woman who lives next door has a beautiful garden.",
            "When the bell rang, everyone quickly returned to the classroom.",
            "My sister usually walks to work, but today she took the bus."
          ]
        },
        {
          emoji: '🔵',
          name: 'Level 4 — Upper Intermediate',
          sentences: [
            "The students were excited because their teacher had planned a special activity.",
            "After we finished dinner, we went for a walk along the beach.",
            "The man who repaired our car gave us some useful advice.",
            "Although Sarah was tired, she decided to finish her project before going to bed.",
            "I couldn't find my phone because I had accidentally left it in the restaurant.",
            "When I arrived at the station, the train had already left.",
            "The children became quiet when they realized that someone was watching them.",
            "If you practice every day, you will become much more confident.",
            "The book that you gave me last week was more interesting than I expected.",
            "Because the road was closed, we had to take a different route home."
          ]
        },
        {
          emoji: '🔴',
          name: 'Level 5 — Advanced',
          sentences: [
            "Although he had never visited the city before, Daniel managed to find his way around without getting lost.",
            "The scientist explained that the experiment had failed because the equipment had not been properly prepared.",
            "If I had known that the meeting would take so long, I would have brought something to eat.",
            "The woman sitting beside me on the train told me about a village that she had visited many years ago.",
            "After they had finished repairing the old house, the family decided to turn it into a small guesthouse.",
            "Even though the weather forecast predicted heavy rain, the organizers decided to continue with the outdoor event.",
            "The teacher asked the students to explain why they believed the character had made such a difficult decision.",
            "Unless we leave before sunrise, we probably won't arrive at the mountain before the weather becomes dangerous.",
            "Having forgotten to charge his phone the night before, Michael had no way of contacting his friends when he arrived at the airport.",
            "Although the project seemed impossible at first, the team eventually succeeded because everyone was willing to work together and solve problems as they appeared."
          ]
        }
      ];

      const ROUNDS = [];
      LEVELS.forEach(level => {
        level.sentences.forEach(text => {
          ROUNDS.push({ words: text.split(' '), level });
        });
      });

      const MAX_ATTEMPTS = 3;
      // -------------------------

      let roundIndex = 0;
      let attempts = 0;
      let revealed = false;
      let sentence = ROUNDS[roundIndex].words;

      const wordBank = document.getElementById('wordBank');
      const sentenceArea = document.getElementById('sentenceArea');
      const checkBtn = document.getElementById('checkBtn');
      const resetBtn = document.getElementById('resetBtn');
      const nextBtn = document.getElementById('nextBtn');
      const resultDiv = document.getElementById('result');
      const progressLabel = document.getElementById('progressLabel');
      const levelBadge = document.getElementById('levelBadge');
      const roundMeta = document.getElementById('roundMeta');
      const attemptsLabel = document.getElementById('attemptsLabel');

      let wordBankWords = [];
      let slots = [];

      function createSlots() {
        sentenceArea.innerHTML = '';
        slots = [];
        for (let i = 0; i < sentence.length; i++) {
          const slot = document.createElement('div');
          slot.className = 'slot';
          slot.dataset.index = i;
          slot.dataset.wordId = '';

          const wordSpan = document.createElement('span');
          wordSpan.className = 'slot-word';
          slot.appendChild(wordSpan);

          const hint = document.createElement('span');
          hint.className = 'remove-hint';
          hint.textContent = '×';
          slot.appendChild(hint);

          const idx = document.createElement('span');
          idx.className = 'slot-index';
          idx.textContent = String(i + 1).padStart(2, '0');
          slot.appendChild(idx);

          slot.addEventListener('click', handleSlotClick);
          slot.addEventListener('dragover', handleDragOver);
          slot.addEventListener('dragenter', handleDragEnter);
          slot.addEventListener('dragleave', handleDragLeave);
          slot.addEventListener('drop', handleDrop);
          slot.addEventListener('touchmove', handleTouchMove, { passive: false });
          slot.addEventListener('touchend', handleTouchEnd);

          sentenceArea.appendChild(slot);
          slots.push(slot);
        }
        updateProgress();
      }

      function buildWordBank() {
        wordBank.innerHTML = '';
        wordBankWords = sentence.map((word, index) => ({
          id: `word-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          text: word
        }));

        const shuffled = [...wordBankWords];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        while (arraysEqual(shuffled.map(w => w.text), sentence)) {
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
        }

        shuffled.forEach(wordObj => {
          const wordEl = createWordElement(wordObj);
          wordBank.appendChild(wordEl);
        });
      }

      function createWordElement(wordObj) {
        const el = document.createElement('div');
        el.className = 'word';
        el.textContent = wordObj.text;
        el.dataset.wordId = wordObj.id;
        el.draggable = true;

        el.addEventListener('dragstart', handleDragStart);
        el.addEventListener('dragend', handleDragEnd);
        el.addEventListener('click', handleWordClick);
        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);

        return el;
      }

      function placeWordInNextSlot(wordEl) {
        if (revealed) return false;
        const slot = slots.find(s => !s.dataset.wordId);
        if (!slot) return false;
        const wordId = wordEl.dataset.wordId;
        const text = wordEl.textContent;
        fillSlot(slot, wordId, text);
        wordEl.remove();
        return true;
      }

      function handleWordClick(e) {
        if (suppressClick) return;
        placeWordInNextSlot(e.currentTarget);
      }

      function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        return a.every((val, idx) => val === b[idx]);
      }

      function getWordFromBank(wordId) {
        return Array.from(wordBank.children).find(el => el.dataset.wordId === wordId);
      }

      function clearAllSlots() {
        slots.forEach(slot => {
          slot.innerHTML = '';
          slot.dataset.wordId = '';
          slot.classList.remove('filled', 'correct-slot', 'incorrect-slot');
          const wordSpan = document.createElement('span');
          wordSpan.className = 'slot-word';
          slot.appendChild(wordSpan);
          const hint = document.createElement('span');
          hint.className = 'remove-hint';
          hint.textContent = '×';
          slot.appendChild(hint);
          const idx = document.createElement('span');
          idx.className = 'slot-index';
          idx.textContent = String(Number(slot.dataset.index) + 1).padStart(2, '0');
          slot.appendChild(idx);
        });
        updateProgress();
      }

      function resetAll() {
        clearAllSlots();
        wordBank.innerHTML = '';
        resultDiv.innerHTML = '';
        buildWordBank();
      }

      function loadRound(index) {
        roundIndex = index;
        sentence = ROUNDS[roundIndex].words;
        attempts = 0;
        revealed = false;
        createSlots();
        wordBank.innerHTML = '';
        buildWordBank();
        resultDiv.innerHTML = '';
        updateRoundLabel();
        updateAttemptsLabel();
        nextBtn.classList.remove('show');
        checkBtn.disabled = false;
        checkBtn.style.display = '';
        resetBtn.style.display = '';
      }

      function revealAnswer() {
        revealed = true;
        wordBank.innerHTML = '';
        sentence.forEach((word, i) => {
          const slot = slots[i];
          slot.innerHTML = '';
          slot.classList.remove('correct-slot', 'incorrect-slot');
          const wordSpan = document.createElement('span');
          wordSpan.className = 'slot-word';
          wordSpan.textContent = word;
          slot.appendChild(wordSpan);
          slot.dataset.wordId = 'revealed-' + i;
          slot.classList.add('filled', 'revealed');
        });
        updateProgress();
        updateAttemptsLabel();

        resultDiv.innerHTML = '';
        const seal = document.createElement('div');
        seal.className = 'seal reveal';
        seal.innerHTML = `<span><span class="seal-icon">✕</span> Out of attempts</span><span class="reveal-sentence">"${sentence.join(' ')}"</span>`;
        resultDiv.appendChild(seal);

        checkBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        showNextOrFinish();
      }

      function showNextOrFinish() {
        if (roundIndex < ROUNDS.length - 1) {
          nextBtn.textContent = 'Next Sentence';
          nextBtn.classList.add('show');
        } else {
          nextBtn.classList.remove('show');
          const done = document.createElement('div');
          done.className = 'seal complete';
          done.innerHTML = '<span class="seal-icon">✓</span> All rounds complete';
          resultDiv.appendChild(done);
          resetBtn.style.display = '';
          resetBtn.textContent = 'Play Again';
        }
      }

      function returnWordToBank(wordId, wordText) {
        if (getWordFromBank(wordId)) return;
        const wordObj = { id: wordId, text: wordText };
        const wordEl = createWordElement(wordObj);
        wordBank.appendChild(wordEl);
      }

      function removeWordFromSlot(slot) {
        const wordId = slot.dataset.wordId;
        const wordSpan = slot.querySelector('.slot-word');
        const wordText = wordSpan ? wordSpan.textContent : '';
        if (!wordId) return;
        slot.innerHTML = '';
        slot.dataset.wordId = '';
        slot.classList.remove('filled', 'correct-slot', 'incorrect-slot');
        const newWordSpan = document.createElement('span');
        newWordSpan.className = 'slot-word';
        slot.appendChild(newWordSpan);
        const hint = document.createElement('span');
        hint.className = 'remove-hint';
        hint.textContent = '×';
        slot.appendChild(hint);
        const idx = document.createElement('span');
        idx.className = 'slot-index';
        idx.textContent = String(Number(slot.dataset.index) + 1).padStart(2, '0');
        slot.appendChild(idx);
        returnWordToBank(wordId, wordText);
        updateProgress();
      }

      function clearSlotFeedback() {
        slots.forEach(s => s.classList.remove('correct-slot', 'incorrect-slot'));
      }

      function fillSlot(slot, wordId, text) {
        const wordSpan = slot.querySelector('.slot-word');
        if (wordSpan) {
          wordSpan.textContent = text;
        }
        slot.dataset.wordId = wordId;
        slot.classList.add('filled');
        slot.classList.remove('correct-slot', 'incorrect-slot');
        if (!slot.querySelector('.remove-hint')) {
          const hint = document.createElement('span');
          hint.className = 'remove-hint';
          hint.textContent = '×';
          slot.appendChild(hint);
        }
        updateProgress();
      }

      function updateProgress() {
        const filled = slots.filter(s => s.dataset.wordId).length;
        progressLabel.textContent = `${filled} / ${sentence.length} set`;
      }

      function updateRoundLabel() {
        const level = ROUNDS[roundIndex].level;
        const posInLevel = level.sentences.indexOf(sentence.join(' ')) + 1;
        levelBadge.textContent = `${level.emoji} ${level.name}`;
        roundMeta.textContent = `Sentence ${posInLevel} of ${level.sentences.length} · Round ${roundIndex + 1} of ${ROUNDS.length}`;
      }

      function updateAttemptsLabel() {
        if (attempts > 0 && !revealed && attempts < MAX_ATTEMPTS) {
          const remaining = MAX_ATTEMPTS - attempts;
          attemptsLabel.textContent = `${remaining} attempt${remaining === 1 ? '' : 's'} remaining before the answer is revealed`;
          attemptsLabel.classList.add('show');
        } else {
          attemptsLabel.classList.remove('show');
          attemptsLabel.textContent = '';
        }
      }

      // ---------- Drag handlers ----------
      let suppressClick = false;

      function handleDragStart(e) {
        const wordEl = e.target;
        wordEl.classList.add('dragging');
        suppressClick = true;
        e.dataTransfer.setData('text/plain', JSON.stringify({
          wordId: wordEl.dataset.wordId,
          text: wordEl.textContent
        }));
        e.dataTransfer.effectAllowed = 'move';
      }

      function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        setTimeout(() => { suppressClick = false; }, 0);
      }

      function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }

      function handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('highlight');
        sentenceArea.classList.add('drag-over');
      }

      function handleDragLeave(e) {
        e.currentTarget.classList.remove('highlight');
        if (!sentenceArea.querySelector('.slot.highlight')) {
          sentenceArea.classList.remove('drag-over');
        }
      }

      function handleDrop(e) {
        e.preventDefault();
        const slot = e.currentTarget;
        slot.classList.remove('highlight');
        sentenceArea.classList.remove('drag-over');
        if (revealed) return;

        const rawData = e.dataTransfer.getData('text/plain');
        if (!rawData) return;
        const data = JSON.parse(rawData);
        const { wordId, text } = data;

        const sourceWordEl = getWordFromBank(wordId);
        if (!sourceWordEl) return;

        if (slot.dataset.wordId) {
          removeWordFromSlot(slot);
        }

        fillSlot(slot, wordId, text);
        sourceWordEl.remove();
      }

      function handleSlotClick(e) {
        if (revealed) return;
        const slot = e.currentTarget;
        if (!slot.dataset.wordId) return;
        removeWordFromSlot(slot);
      }

      // ---------- Touch support ----------
      let draggedElement = null;
      let touchTargetSlot = null;
      let touchStartX = 0;
      let touchStartY = 0;
      let touchMoved = false;
      const TAP_MOVE_THRESHOLD = 10; // px

      function handleTouchStart(e) {
        draggedElement = e.target.closest('.word');
        if (!draggedElement) return;
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchMoved = false;
        draggedElement.classList.add('dragging');
      }

      function handleTouchMove(e) {
        if (!draggedElement) return;
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.sqrt(dx * dx + dy * dy) > TAP_MOVE_THRESHOLD) {
          touchMoved = true;
        }
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const slotUnder = elements.find(el => el.classList && el.classList.contains('slot'));
        if (touchTargetSlot) touchTargetSlot.classList.remove('highlight');
        if (slotUnder) {
          slotUnder.classList.add('highlight');
          touchTargetSlot = slotUnder;
        } else {
          touchTargetSlot = null;
        }
      }

      function handleTouchEnd(e) {
        if (!draggedElement) return;
        e.preventDefault();
        draggedElement.classList.remove('dragging');

        if (!touchMoved) {
          const wordEl = draggedElement;
          draggedElement = null;
          touchTargetSlot = null;
          placeWordInNextSlot(wordEl);
          return;
        }

        if (touchTargetSlot && !revealed) {
          touchTargetSlot.classList.remove('highlight');
          const wordId = draggedElement.dataset.wordId;
          const text = draggedElement.textContent;
          const slot = touchTargetSlot;

          const sourceWordEl = getWordFromBank(wordId);
          if (!sourceWordEl) {
            draggedElement = null;
            touchTargetSlot = null;
            return;
          }

          if (slot.dataset.wordId) removeWordFromSlot(slot);
          fillSlot(slot, wordId, text);
          sourceWordEl.remove();
        }
        draggedElement = null;
        touchTargetSlot = null;
      }

      // ---------- Ink flecks (celebration) ----------
      function fireInkBurst() {
        const burst = document.createElement('div');
        burst.className = 'stamp-burst';
        sentenceArea.appendChild(burst);
        const colors = ['var(--brass)', 'var(--sage)', 'var(--brass-bright)'];
        for (let i = 0; i < 18; i++) {
          const fleck = document.createElement('span');
          fleck.className = 'fleck';
          const angle = Math.random() * Math.PI * 2;
          const dist = 40 + Math.random() * 90;
          fleck.style.setProperty('--fx', `${Math.cos(angle) * dist}px`);
          fleck.style.setProperty('--fy', `${Math.sin(angle) * dist}px`);
          fleck.style.left = `${50 + (Math.random() * 40 - 20)}%`;
          fleck.style.top = `${50 + (Math.random() * 20 - 10)}%`;
          fleck.style.background = colors[i % colors.length];
          fleck.style.animationDelay = `${Math.random() * 0.15}s`;
          burst.appendChild(fleck);
        }
        setTimeout(() => burst.remove(), 1100);
      }

      // ---------- Check answer ----------
      function checkAnswer() {
        if (revealed) return;
        const studentAnswer = slots.map(slot => {
          const wordSpan = slot.querySelector('.slot-word');
          return wordSpan ? wordSpan.textContent : '';
        });
        resultDiv.innerHTML = '';
        const seal = document.createElement('div');

        if (studentAnswer.join(' ') === sentence.join(' ')) {
          clearSlotFeedback();
          seal.className = 'seal good';
          seal.innerHTML = '<span class="seal-icon">✓</span> Correctly Set';
          fireInkBurst();
          resultDiv.appendChild(seal);
          updateAttemptsLabel();
          checkBtn.style.display = 'none';
          resetBtn.style.display = 'none';
          showNextOrFinish();
          return;
        }

        slots.forEach((slot, i) => {
          slot.classList.remove('correct-slot', 'incorrect-slot');
          if (!slot.dataset.wordId) return;
          if (studentAnswer[i] === sentence[i]) {
            slot.classList.add('correct-slot');
          } else {
            slot.classList.add('incorrect-slot');
          }
        });

        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          revealAnswer();
          return;
        }

        seal.className = 'seal bad';
        seal.innerHTML = '<span class="seal-icon">✕</span> Reset the Type — Try Again';
        resultDiv.appendChild(seal);
        updateAttemptsLabel();
      }

      checkBtn.addEventListener('click', checkAnswer);
      resetBtn.addEventListener('click', () => {
        if (resetBtn.textContent === 'Play Again') {
          loadRound(0);
          resetBtn.textContent = 'Reset';
          return;
        }
        resetAll();
      });
      nextBtn.addEventListener('click', () => {
        if (roundIndex < ROUNDS.length - 1) {
          loadRound(roundIndex + 1);
        }
      });

      wordBank.addEventListener('dragover', e => {
        e.preventDefault();
        wordBank.classList.add('drag-over');
      });
      wordBank.addEventListener('dragleave', () => {
        wordBank.classList.remove('drag-over');
      });
      wordBank.addEventListener('drop', e => {
        e.preventDefault();
        wordBank.classList.remove('drag-over');
        if (revealed) return;
        const rawData = e.dataTransfer.getData('text/plain');
        if (!rawData) return;
        const { wordId, text } = JSON.parse(rawData);
        const slotWithWord = slots.find(slot => slot.dataset.wordId === wordId);
        if (slotWithWord) removeWordFromSlot(slotWithWord);
        if (!getWordFromBank(wordId)) returnWordToBank(wordId, text);
      });

      function init() {
        loadRound(0);
      }

      init();
    })();
  }, []);

  const bgOptions = [
    { key: 'welcome-screen-bg.webp', label: 'Welcome' },
    { key: 'home-screen-bg.webp', label: 'Home' },
    { key: 'how-to-play-bg.webp', label: 'How to Play' },
    { key: 'user-input-screen-bg.webp', label: 'Input' },
    { key: 'game-screen-bg.webp', label: 'Game' }
  ];

  const [bg, setBg] = useState(() => {
    try {
      return localStorage.getItem('sb-bg') || bgOptions[0].key;
    } catch (e) {
      return bgOptions[0].key;
    }
  });

  const [size, setSize] = useState(() => {
    try { return localStorage.getItem('sb-thumb-size') || 'medium'; } catch (e) { return 'medium'; }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('sb-bg', bg); } catch (e) {}
  }, [bg]);
  useEffect(() => {
    try { localStorage.setItem('sb-thumb-size', size); } catch (e) {}
  }, [size]);

  useEffect(() => {
    function onKey(e){ if(e.key === 'Escape') setModalOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('sb-bg', bg); } catch (e) {}
  }, [bg]);

  return (
    <div>
      <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 60 }}>
        <div style={{ display: 'flex', gap: 8, padding: 6, borderRadius: 8, background: 'rgba(255,255,255,0.85)', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', paddingBottom: 4 }}>
            {bgOptions.map(o => (
              const sizeMap = { small: [64, 40], medium: [88, 52], large: [140, 84] };
              const [w, h] = sizeMap[size] || sizeMap.medium;
              return (
                <div key={o.key} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setBg(o.key)}
                    aria-label={`Select ${o.label} background`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      padding: 6,
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="sb-thumb" style={{
                      width: w,
                      height: h,
                      backgroundImage: `url('/games/sentence-builder/${o.key}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 6,
                      boxShadow: bg === o.key ? '0 10px 28px rgba(0,0,0,0.18)' : '0 3px 8px rgba(0,0,0,0.08)',
                      outline: bg === o.key ? '3px solid rgba(201,162,76,0.18)' : 'none',
                      transition: 'transform .14s ease, box-shadow .14s ease'
                    }} />
                    <div style={{ fontSize: '0.66rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-soft)' }}>{o.label}</div>
                  </button>

                  <button
                    onClick={() => { setModalImage(o.key); setModalOpen(true); }}
                    aria-label={`Preview ${o.label}`}
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: 6,
                      padding: 4,
                      borderRadius: 6,
                      border: 'none',
                      background: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.12)'
                    }}
                  >
                    ◷
                  </button>
                </div>
              );
            })}
            ))}
          </div>
        </div>
      </div>
      {/* Size toggle and modal markup */}
      <div style={{ position: 'absolute', top: 86, right: 18, zIndex: 60 }}>
        <div style={{ background: 'rgba(255,255,255,0.85)', padding: 6, borderRadius: 8, display: 'flex', gap: 6 }}>
          {['small','medium','large'].map(s => (
            <button key={s} onClick={() => setSize(s)} style={{ padding: '6px 8px', borderRadius: 6, border: size===s ? '2px solid var(--brass)' : '1px solid rgba(0,0,0,0.08)', background: size===s ? 'var(--brass-bright)' : 'transparent' }}>{s[0].toUpperCase()}</button>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset:0, background: 'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }} onClick={() => setModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:10, padding:18, maxWidth:'90%', maxHeight:'85%', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ width: '100%', height: '60vh', backgroundImage: `url('/games/sentence-builder/${modalImage}')`, backgroundSize:'cover', backgroundPosition:'center', borderRadius:6 }} />
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => { setBg(modalImage); setModalOpen(false); }} style={{ padding:'10px 14px', borderRadius:6, background:'var(--sage)', color:'#fff', border:'none' }}>Apply</button>
              <button onClick={() => setModalOpen(false)} style={{ padding:'10px 14px', borderRadius:6, background:'transparent', border:'1px solid var(--paper-line)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
/* CSS copied from original page; kept intact for visual parity */
  :root{ --ink:#1B2A41; --ink-soft:#2E3F5C; --parchment:#F6F0E4; --parchment-deep:#EEE4D0; --brass:#C9A24C; --brass-bright:#E0BE6E; --sage:#5F8368; --coral:#C1604E; --paper-line: rgba(27,42,65,0.14); --shadow-ink: rgba(27,42,65,0.25); }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ height:100%; }
  body{ font-family:'Inter', sans-serif; background: radial-gradient(circle at 15% 10%, rgba(201,162,76,0.10), transparent 45%), radial-gradient(circle at 85% 90%, rgba(95,131,104,0.08), transparent 40%), var(--parchment); color:var(--ink); min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; position:relative; overflow-x:hidden; }
  body::before{ content:""; position:fixed; inset:0; pointer-events:none; opacity:0.5; mix-blend-mode:multiply; background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(27,42,65,0.012) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(27,42,65,0.012) 3px); }
  .press-frame{ width:100%; max-width:760px; position:relative; z-index:1; }
  .masthead{ text-align:center; margin-bottom:38px; }
  .eyebrow{ font-family:'JetBrains Mono', monospace; font-size:0.72rem; letter-spacing:0.32em; text-transform:uppercase; color:var(--brass); font-weight:500; display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:14px; }
  .eyebrow::before, .eyebrow::after{ content:""; width:34px; height:1px; background:linear-gradient(90deg, transparent, var(--brass)); }
  .eyebrow::after{ background:linear-gradient(90deg, var(--brass), transparent); }
  h1{ font-family:'Fraunces', serif; font-weight:600; font-size:clamp(2.1rem, 5vw, 3rem); letter-spacing:-0.01em; color:var(--ink); }
  .subtitle{ margin-top:10px; font-size:0.95rem; color:var(--ink-soft); opacity:0.7; font-style:italic; font-family:'Fraunces', serif; }
  .round-meta{ margin-top:12px; font-family:'JetBrains Mono', monospace; font-size:0.68rem; letter-spacing:0.08em; text-transform:uppercase; color:var(--ink-soft); opacity:0.5; }
  .galley-wrap{ position:relative; margin-bottom:30px; }
  .galley-label{ font-family:'JetBrains Mono', monospace; font-size:0.68rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink-soft); opacity:0.55; margin-bottom:10px; display:flex; justify-content:space-between; }
  #sentenceArea{ display:flex; flex-wrap:wrap; align-items:center; gap:10px; min-height:92px; background:linear-gradient(180deg, #FFFDF8, #FBF6EA); border:1px solid var(--paper-line); border-radius:4px; padding:22px 24px; position:relative; box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(27,42,65,0.06), 0 12px 30px -18px rgba(27,42,65,0.35); transition: box-shadow .25s ease, border-color .25s ease; }
  #sentenceArea::before{ content:""; position:absolute; left:24px; right:24px; bottom:14px; height:1px; background:repeating-linear-gradient(90deg, var(--paper-line) 0 6px, transparent 6px 11px); pointer-events:none; }
  #sentenceArea.drag-over{ border-color:var(--brass); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 3px rgba(201,162,76,0.16), 0 14px 34px -18px rgba(27,42,65,0.4); }
  .slot{ display:inline-flex; align-items:center; justify-content:center; min-width:96px; min-height:52px; padding:10px 18px; font-family:'Fraunces', serif; font-size:1.35rem; font-weight:500; color:var(--ink); border-radius:3px; background:transparent; border-bottom:2px solid var(--paper-line); cursor:pointer; position:relative; transition: all .18s cubic-bezier(.2,.7,.3,1); }
  .slot.filled{ background:linear-gradient(180deg, #ffffff, #fbf4e4); border-bottom:2px solid var(--brass); box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 3px 8px -3px var(--shadow-ink); }
  .slot.filled:hover{ transform:translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 14px -6px var(--shadow-ink); }
  .slot.highlight{ background:rgba(201,162,76,0.14); border-bottom-color:var(--brass-bright); transform:scale(1.04); }
  .slot .remove-hint{ display:none; position:absolute; top:-9px; right:-9px; background:var(--coral); color:#fff; border-radius:50%; width:20px; height:20px; font-size:12px; line-height:20px; text-align:center; font-family:'Inter',sans-serif; box-shadow:0 2px 5px rgba(0,0,0,0.25); }
  .slot.filled:hover .remove-hint{ display:block; }
  .slot-index{ position:absolute; bottom:-19px; left:50%; transform:translateX(-50%); font-family:'JetBrains Mono', monospace; font-size:0.6rem; color:var(--ink-soft); opacity:0.28; }
  .case-label{ font-family:'JetBrains Mono', monospace; font-size:0.68rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink-soft); opacity:0.55; margin-bottom:10px; }
  .case-hint{ text-transform:none; letter-spacing:0; font-style:italic; opacity:0.85; }
  #wordBank{ display:flex; flex-wrap:wrap; justify-content:center; gap:12px; padding:24px; background: linear-gradient(180deg, rgba(27,42,65,0.03), rgba(27,42,65,0.015)), var(--parchment-deep); border:1px solid var(--paper-line); border-radius:4px; min-height:76px; margin-bottom:34px; transition: background .2s ease, border-color .2s ease; }
  #wordBank.drag-over{ border-color:var(--brass); background: linear-gradient(180deg, rgba(201,162,76,0.08), rgba(201,162,76,0.04)), var(--parchment-deep); }
  .word{ background:var(--ink); color:var(--parchment); padding:13px 22px; border-radius:3px; cursor:grab; user-select:none; font-family:'Fraunces', serif; font-size:1.3rem; font-weight:500; letter-spacing:0.01em; box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset, 0 4px 10px -3px rgba(27,42,65,0.4); transition: transform .14s cubic-bezier(.2,.7,.3,1), box-shadow .14s ease, opacity .18s ease; display:inline-block; position:relative; }
  .word::after{ content:""; position:absolute; inset:0; border-radius:3px; background:linear-gradient(135deg, rgba(224,190,110,0.0), rgba(224,190,110,0.0)); transition: background .18s ease; pointer-events:none; }
  .word:hover{ transform:translateY(-3px); box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 10px 18px -6px rgba(27,42,65,0.45); }
  .word:hover::after{ background:linear-gradient(135deg, rgba(224,190,110,0.16), rgba(224,190,110,0)); }
  .word:active{ cursor:grabbing; }
  .word.dragging{ opacity:0.35; transform:scale(0.94); }
  .controls{ display:flex; justify-content:center; gap:14px; flex-wrap:wrap; margin-bottom:8px; }
  button{ font-family:'JetBrains Mono', monospace; font-size:0.78rem; letter-spacing:0.1em; text-transform:uppercase; font-weight:500; padding:15px 30px; border:none; border-radius:3px; cursor:pointer; transition: transform .12s ease, box-shadow .12s ease, background .18s ease; }
  #checkBtn{ background:var(--ink); color:var(--parchment); box-shadow:0 6px 16px -6px rgba(27,42,65,0.55); }
  #checkBtn:hover{ background:var(--ink-soft); transform:translateY(-2px); box-shadow:0 10px 20px -8px rgba(27,42,65,0.6); }
  #checkBtn:active{ transform:translateY(0) scale(0.98); }
  #resetBtn{ background:transparent; color:var(--ink-soft); border:1px solid var(--paper-line); }
  #resetBtn:hover{ border-color:var(--ink-soft); background:rgba(27,42,65,0.03); transform:translateY(-2px); }
  #resetBtn:active{ transform:translateY(0) scale(0.98); }
  #result{ margin-top:26px; min-height:60px; display:flex; align-items:center; justify-content:center; }
  .seal{ display:inline-flex; align-items:center; gap:10px; font-family:'Fraunces', serif; font-weight:600; font-size:1.15rem; padding:12px 26px; border-radius:3px; opacity:0; transform:translateY(6px) scale(0.98); animation: sealIn .5s cubic-bezier(.2,.8,.3,1) forwards; }
  .seal.good{ color:var(--sage); background:rgba(95,131,104,0.1); border:1px solid rgba(95,131,104,0.35); }
  .seal.bad{ color:var(--coral); background:rgba(193,96,78,0.08); border:1px solid rgba(193,96,78,0.3); animation: sealIn .5s cubic-bezier(.2,.8,.3,1) forwards, shake .4s ease .5s; }
  .seal.reveal{ color:var(--ink-soft); background:rgba(27,42,65,0.05); border:1px solid var(--paper-line); flex-direction:column; gap:4px; text-align:center; padding:16px 26px; }
  .seal.reveal .reveal-sentence{ font-family:'Fraunces', serif; font-style:italic; font-size:1.05rem; color:var(--ink); }
  .seal.complete{ color:var(--brass); background:rgba(201,162,76,0.1); border:1px solid rgba(201,162,76,0.35); }
  .seal-icon{ font-size:1.1rem; }
  .attempts-label{ font-family:'JetBrains Mono', monospace; font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--coral); opacity:0; text-align:center; margin-top:14px; transition:opacity .2s ease; }
  .attempts-label.show{ opacity:0.85; }
  #nextBtn{ background:var(--sage); color:#fff; box-shadow:0 6px 16px -6px rgba(95,131,104,0.55); display:none; }
  #nextBtn:hover{ background:#527359; transform:translateY(-2px); }
  #nextBtn:active{ transform:translateY(0) scale(0.98); }
  #nextBtn.show{ display:inline-block; }
  .slot.revealed{ background:linear-gradient(180deg, #f4ede0, #ece0c9); border-bottom:2px solid var(--ink-soft); cursor:default; }
  .word.locked{ opacity:0.45; cursor:default; pointer-events:none; }
  .slot.correct-slot{ background:linear-gradient(180deg, #f2f8f3, #e6f2e8); border-bottom:2px solid var(--sage); box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 3px 8px -3px rgba(95,131,104,0.3); }
  .slot.incorrect-slot{ background:linear-gradient(180deg, #fbf1ee, #f7e3de); border-bottom:2px solid var(--coral); animation: slotShake .4s ease; }
  @keyframes slotShake{ 0%,100%{ transform:translateX(0); } 25%{ transform:translateX(-3px); } 75%{ transform:translateX(3px); } }
  @keyframes sealIn{ to{ opacity:1; transform:translateY(0) scale(1); } }
  @keyframes shake{ 0%,100%{ transform:translateX(0); } 25%{ transform:translateX(-4px); } 75%{ transform:translateX(4px); } }
  .stamp-burst{ position:absolute; inset:0; pointer-events:none; overflow:visible; }
  .fleck{ position:absolute; width:5px; height:5px; border-radius:50%; background:var(--brass); opacity:0; animation: fleckFly 0.9s ease-out forwards; }
  @keyframes fleckFly{ 0%{ opacity:1; transform:translate(0,0) scale(1); } 100%{ opacity:0; transform: translate(var(--fx), var(--fy)) scale(0.3); } }
  @media (max-width: 560px){ .word, .slot{ font-size:1.05rem; padding:10px 15px; min-width:78px; } button{ padding:14px 22px; font-size:0.72rem; } }
  @media (prefers-reduced-motion: reduce){ *{ animation-duration:0.001ms !important; transition-duration:0.001ms !important; } }
` }} />

      <div
        className="press-frame"
        id="sb-press-frame"
        style={{
          backgroundImage: `url('/games/sentence-builder/${bg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="masthead">
          <div className="eyebrow" id="levelBadge">🟢 Level 1 — Very Easy</div>
          <h1>Build the Sentence</h1>
          <div className="subtitle">Set the type in the correct order</div>
          <div className="round-meta" id="roundMeta">Sentence 1 of 10 · Round 1 of 50</div>
        </div>

        <div className="galley-wrap">
          <div className="galley-label"><span>The Galley</span><span id="progressLabel">0 / 5 set</span></div>
          <div id="sentenceArea"></div>
        </div>

        <div>
          <div className="case-label">The Type Case <span className="case-hint">— tap a word or drag it into place</span></div>
          <div id="wordBank"></div>
        </div>

        <div className="controls">
          <button id="checkBtn">Check Answer</button>
          <button id="resetBtn">Reset</button>
          <button id="nextBtn">Next Sentence</button>
        </div>

        <div id="result"></div>
        <div className="attempts-label" id="attemptsLabel"></div>
      </div>
    </div>
  );
}
