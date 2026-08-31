import React, { useEffect, useRef } from 'react';

/**
 * TankWars
 * Auto-converted from tank-wars__2_.html into a self-contained React component.
 * The original HTML markup is injected via a ref + innerHTML, the original
 * <style> block is scoped inside the component via a <style> tag, and the
 * original vanilla-JS game logic runs unmodified inside a useEffect after
 * mount (it manipulates the DOM directly, exactly as it did in the static
 * HTML page).
 */
const TankWars_HTML = `<div id="app">
  <div id="topbar">
    <h1>⚔️ TANK WARS</h1>
    <div id="roundInfo">Round 1</div>
  </div>

  <div id="battle">
    <div class="side player" id="playerSide">
      <div class="nameTag">YOU</div>
      <div class="hpBarOuter"><div class="hpBarInner" id="playerHP"></div><div class="hpText" id="playerHPText">100%</div></div>
      <div class="tankWrap" id="playerTankWrap">
        <div class="tank" id="playerTank">🚙</div>
      </div>
      <div class="typedBox" id="playerTypedBox">&nbsp;</div>
      <div class="keyboard" id="playerKeyboard"></div>
    </div>

    <div id="centerCol">
      <div id="countdown" class="hidden">3</div>
      <div id="flashcard" class="hidden">
        <div id="flashEmoji">🍎</div>
        <div id="flashWord">? ? ? ? ?</div>
        <div id="comboTag"></div>
        <div id="playerInputRow">
          <input id="playerInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type here...">
          <div id="hint">Type the word and hit Enter!</div>
        </div>
      </div>
    </div>

    <div class="side ai" id="aiSide">
      <div class="nameTag">AI OPPONENT</div>
      <div class="hpBarOuter"><div class="hpBarInner" id="aiHP"></div><div class="hpText" id="aiHPText">100%</div></div>
      <div class="tankWrap" id="aiTankWrap">
        <div class="tank" id="aiTank">🚙</div>
      </div>
      <div class="typedBox" id="aiTypedBox">&nbsp;</div>
      <div class="keyboard ai-kb" id="aiKeyboard"></div>
    </div>
  </div>
</div>

<div id="overlay">
  <h1>⚔️ TANK WARS</h1>
  <p>Race the AI to type the flashcard word. First to finish fires a shot! Reduce your opponent's HP to zero to win.</p>
  <div>
    <div style="margin-bottom:8px; font-size:var(--text-sm); opacity:0.8;">Choose difficulty:</div>
    <div class="diffRow" id="diffRow">
      <button class="diffBtn" data-diff="easy">Easy (40 WPM)</button>
      <button class="diffBtn selected" data-diff="medium">Medium (60 WPM)</button>
      <button class="diffBtn" data-diff="hard">Hard (85 WPM)</button>
      <button class="diffBtn" data-diff="expert">Expert (110 WPM)</button>
    </div>
  </div>
  <button class="btn" id="startBtn">Start Battle</button>
</div>`;

const TankWars_CSS = `:root{
    --bg-dark:#1a2233;
    --bg-mid:#233047;
    --panel:#2c3b57;
    --accent-blue:#4d9fff;
    --accent-red:#ff5c5c;
    --accent-green:#4dff88;
    --accent-yellow:#ffd24d;
    --text-light:#eef3ff;
    --space-sm: clamp(4px, 0.6vw, 10px);
    --space-md: clamp(8px, 1.2vw, 20px);
    --space-lg: clamp(16px, 2.4vw, 36px);
    --text-sm: clamp(0.7rem, 1.2vw, 0.95rem);
    --text-md: clamp(0.9rem, 1.6vw, 1.2rem);
    --text-lg: clamp(1.4rem, 3vw, 2.2rem);
    --text-xl: clamp(2rem, 5vw, 3.5rem);
  }
  *{box-sizing:border-box;}
  html,body{
    margin:0; padding:0; height:100%;
    background:radial-gradient(circle at 50% 20%, var(--bg-mid), var(--bg-dark));
    color:var(--text-light);
    font-family:'Segoe UI', system-ui, sans-serif;
    overflow:hidden;
    user-select:none;
  }
  #app{
    display:flex; flex-direction:column;
    height:100vh; width:100vw;
    padding:var(--space-md);
  }

  /* ---------- TOP BAR ---------- */
  #topbar{
    display:flex; justify-content:space-between; align-items:center;
    padding:0 var(--space-md); margin-bottom:var(--space-sm);
  }
  #topbar h1{
    font-size:var(--text-lg); margin:0;
    letter-spacing:1px;
    text-shadow:0 0 12px rgba(77,159,255,0.6);
  }
  #roundInfo{ font-size:var(--text-sm); opacity:0.8; }

  /* ---------- MAIN BATTLE AREA ---------- */
  #battle{
    flex:1;
    display:grid;
    grid-template-columns: 1fr minmax(220px, 460px) 1fr;
    gap:var(--space-md);
    min-height:0;
  }

  .side{
    display:flex; flex-direction:column; align-items:center;
    background:var(--panel);
    border-radius:16px;
    padding:var(--space-md);
    position:relative;
    overflow:hidden;
    border:2px solid rgba(255,255,255,0.05);
    min-height:0;
  }
  .side.hitshake{ animation: shake 0.35s ease; }
  @keyframes shake{
    0%,100%{transform:translateX(0);}
    20%{transform:translateX(-10px);}
    40%{transform:translateX(8px);}
    60%{transform:translateX(-6px);}
    80%{transform:translateX(4px);}
  }

  .nameTag{
    font-weight:700; font-size:var(--text-md);
    margin-bottom:var(--space-sm);
    letter-spacing:1px;
  }
  .side.player .nameTag{ color:var(--accent-blue); }
  .side.ai .nameTag{ color:var(--accent-red); }

  .hpBarOuter{
    position:relative;
    width:90%; height:clamp(16px,2.4vw,26px);
    background:#111a2b;
    border-radius:20px;
    overflow:hidden;
    border:2px solid rgba(255,255,255,0.15);
    margin-bottom:var(--space-md);
  }
  .hpBarInner{
    height:100%; width:100%;
    transition: width 0.5s ease;
  }
  .hpText{
    position:absolute;
    inset:0;
    display:flex; align-items:center; justify-content:center;
    font-size:clamp(0.6rem, 1.1vw, 0.85rem);
    font-weight:700;
    color:#fff;
    text-shadow:0 1px 3px rgba(0,0,0,0.8);
    pointer-events:none;
  }
  .side.player .hpBarInner{ background:linear-gradient(90deg,#2e78ff,#4d9fff); }
  .side.ai .hpBarInner{ background:linear-gradient(90deg,#ff2e2e,#ff5c5c); }

  .tankWrap{
    position:relative;
    width:100%;
    flex:1;
    display:flex; align-items:center; justify-content:center;
    min-height:60px;
  }
  .tank{
    font-size:clamp(2.5rem, 7vw, 5rem);
    filter: drop-shadow(0 6px 6px rgba(0,0,0,0.4));
    transition: transform 0.15s ease;
  }
  .side.player .tank{ transform:scaleX(-1); }
  .tank.fire{ animation: recoilAI 0.25s ease; }
  .side.player .tank.fire{ animation: recoil 0.25s ease; }
  @keyframes recoil{
    0%{ transform: scaleX(-1) translateX(0); }
    30%{ transform: scaleX(-1) translateX(18px) rotate(3deg); }
    100%{ transform: scaleX(-1) translateX(0); }
  }
  @keyframes recoilAI{
    0%{ transform: translateX(0); }
    30%{ transform: translateX(-18px) rotate(-3deg); }
    100%{ transform: translateX(0); }
  }
  .tank.tankhit{ animation: tankHitAnim 0.4s ease; }
  @keyframes tankHitAnim{
    0%{ filter:none; }
    20%{ filter: brightness(2.2) saturate(0.4); transform: translateX(6px) scale(0.94); }
    40%{ filter: brightness(1.4); transform: translateX(-10px) scale(1.05); }
    60%{ filter: brightness(1.8); transform: translateX(4px) scale(0.97); }
    100%{ filter:none; transform: translateX(0) scale(1); }
  }
  .side.player .tank.tankhit{ animation-name: tankHitAnimFlipped; }
  @keyframes tankHitAnimFlipped{
    0%{ filter:none; transform: scaleX(-1); }
    20%{ filter: brightness(2.2) saturate(0.4); transform: scaleX(-1) translateX(-6px) scale(0.94); }
    40%{ filter: brightness(1.4); transform: scaleX(-1) translateX(10px) scale(1.05); }
    60%{ filter: brightness(1.8); transform: scaleX(-1) translateX(-4px) scale(0.97); }
    100%{ filter:none; transform: scaleX(-1) translateX(0) scale(1); }
  }
  .shell{
    position:absolute;
    top:50%;
    font-size:1.5rem;
    z-index:5;
    pointer-events:none;
  }
  .explosion{
    position:absolute;
    font-size:3rem;
    z-index:6;
    pointer-events:none;
    animation: pop 0.5s ease forwards;
  }
  @keyframes pop{
    0%{ transform:scale(0.2); opacity:1; }
    60%{ transform:scale(1.3); opacity:1; }
    100%{ transform:scale(1.6); opacity:0; }
  }

  .typedBox{
    width:90%;
    background:#111a2b;
    border:2px solid rgba(255,255,255,0.15);
    border-radius:10px;
    padding:var(--space-sm) var(--space-md);
    font-size:var(--text-md);
    min-height:2em;
    text-align:center;
    letter-spacing:2px;
    margin-top:var(--space-sm);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .typedBox.correct{
    border-color:var(--accent-green);
    box-shadow:0 0 18px rgba(77,255,136,0.6);
  }
  .typedBox.wrong{
    border-color:var(--accent-red);
    animation: flashRed 0.3s ease;
  }
  @keyframes flashRed{
    0%,100%{ background:#111a2b; }
    50%{ background:#4a1414; }
  }

  .keyboard{
    margin-top:var(--space-sm);
    display:flex; flex-direction:column; align-items:center;
    gap:4px;
    width:100%;
  }
  .krow{ display:flex; gap:4px; justify-content:center; }
  .key{
    background:#374a6b;
    border-radius:6px;
    padding:6px 0;
    width:clamp(18px, 2.6vw, 32px);
    text-align:center;
    font-size:clamp(0.6rem, 1vw, 0.85rem);
    font-weight:600;
    box-shadow:0 2px 0 rgba(0,0,0,0.3);
  }
  .key.active{
    background:var(--accent-yellow);
    color:#222;
    transform:translateY(2px);
    box-shadow:none;
  }

  /* ---------- CENTER FLASHCARD ---------- */
  #centerCol{
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:var(--space-md);
    min-width:0;
  }
  #countdown{
    font-size:var(--text-xl);
    font-weight:800;
    text-shadow:0 0 20px rgba(255,210,77,0.8);
  }
  #flashcard{
    background:var(--panel);
    border-radius:20px;
    padding:var(--space-lg);
    display:flex; flex-direction:column; align-items:center; gap:var(--space-sm);
    border:2px solid rgba(255,255,255,0.08);
    width:100%;
  }
  #flashEmoji{ font-size:clamp(3.5rem, 9vw, 7rem); }
  #flashWord{
    font-size:var(--text-sm);
    opacity:0.6;
    letter-spacing:3px;
    text-transform:uppercase;
  }
  #comboTag{
    font-size:var(--text-sm);
    color:var(--accent-yellow);
    font-weight:700;
    min-height:1.4em;
  }
  #playerInputRow{
    width:100%;
    display:flex; flex-direction:column; align-items:center;
    gap:var(--space-sm);
  }
  #playerInput{
    width:90%;
    font-size:var(--text-md);
    text-align:center;
    padding:var(--space-sm);
    border-radius:10px;
    border:2px solid var(--accent-blue);
    background:#111a2b;
    color:var(--text-light);
    outline:none;
  }
  #hint{ font-size:var(--text-sm); opacity:0.6; }

  /* ---------- MENU / OVERLAY ---------- */
  #overlay{
    position:fixed; inset:0;
    background:rgba(10,14,24,0.92);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:var(--space-md);
    z-index:50;
    text-align:center;
    padding:var(--space-md);
  }
  #overlay h1{ font-size:var(--text-xl); margin:0; text-shadow:0 0 20px rgba(77,159,255,0.7); }
  #overlay p{ font-size:var(--text-md); max-width:500px; opacity:0.85; }
  .btn{
    background:var(--accent-blue);
    color:#0a0f1a;
    border:none;
    padding:var(--space-sm) var(--space-lg);
    font-size:var(--text-md);
    font-weight:700;
    border-radius:10px;
    cursor:pointer;
    transition: transform 0.15s ease, background 0.15s ease;
  }
  .btn:hover{ transform:translateY(-2px); background:#6cb2ff; }
  .btn.secondary{ background:var(--panel); color:var(--text-light); border:2px solid rgba(255,255,255,0.2); }

  .diffRow{ display:flex; gap:var(--space-sm); flex-wrap:wrap; justify-content:center; }
  .diffBtn{
    background:var(--panel);
    border:2px solid rgba(255,255,255,0.15);
    color:var(--text-light);
    padding:var(--space-sm) var(--space-md);
    border-radius:10px;
    cursor:pointer;
    font-size:var(--text-sm);
  }
  .diffBtn.selected{ border-color:var(--accent-yellow); background:#3a3320; }

  .hidden{ display:none !important; }

  @media (max-width:760px){
    #battle{
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr;
    }
    .side.ai{ order:2; }
    #centerCol{ order:1; }
    .side.player{ order:3; }
    .side .keyboard.ai-kb{ display:none; }
  }`;

export default function TankWars() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `(function() {
(function(){
  "use strict";

  /* ---------------- SOUND (Web Audio API, no files) ---------------- */
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const actx = new AudioCtx();
  function beep(freq, dur, type, vol, when){
    when = when || 0;
    const t0 = actx.currentTime + when;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime((vol!==undefined?vol:0.15), t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(actx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }
  function sfxKey(){ beep(600 + Math.random()*200, 0.04, 'square', 0.05); }
  function sfxCorrect(){ beep(880,0.08,'triangle',0.12); beep(1320,0.12,'triangle',0.1,0.08); }
  function sfxWrong(){ beep(140,0.15,'sawtooth',0.12); }
  function sfxFire(){ beep(90,0.2,'square',0.2); beep(60,0.3,'sawtooth',0.15,0.02); }
  function sfxHit(){ beep(200,0.25,'sawtooth',0.2); beep(80,0.35,'square',0.2,0.03); }
  function sfxWin(){ [0,1,2].forEach(i=>beep(440+i*220,0.2,'triangle',0.12,i*0.15)); }
  function sfxLose(){ [0,1,2].forEach(i=>beep(300-i*80,0.25,'sawtooth',0.12,i*0.15)); }
  function sfxCountdown(){ beep(500,0.1,'sine',0.12); }
  function sfxGo(){ beep(900,0.2,'triangle',0.15); }

  /* ---------------- FLASHCARDS ---------------- */
  const CARDS = [
    {word:"apple", emoji:"🍎"}, {word:"banana", emoji:"🍌"}, {word:"cat", emoji:"🐱"},
    {word:"dog", emoji:"🐶"}, {word:"elephant", emoji:"🐘"}, {word:"fish", emoji:"🐟"},
    {word:"grape", emoji:"🍇"}, {word:"house", emoji:"🏠"}, {word:"ice cream", emoji:"🍦"},
    {word:"juice", emoji:"🧃"}, {word:"kite", emoji:"🪁"}, {word:"lemon", emoji:"🍋"},
    {word:"moon", emoji:"🌙"}, {word:"nest", emoji:"🪺"}, {word:"orange", emoji:"🍊"},
    {word:"pizza", emoji:"🍕"}, {word:"princess", emoji:"👸"}, {word:"rabbit", emoji:"🐰"},
    {word:"sun", emoji:"☀️"}, {word:"tree", emoji:"🌳"}, {word:"umbrella", emoji:"☂️"},
    {word:"van", emoji:"🚐"}, {word:"watermelon", emoji:"🍉"}, {word:"guitar", emoji:"🎸"},
    {word:"sailboat", emoji:"⛵"}, {word:"zebra", emoji:"🦓"}, {word:"star", emoji:"⭐"},
    {word:"book", emoji:"📕"}, {word:"clock", emoji:"⏰"}, {word:"train", emoji:"🚂"}
  ];
  function shuffled(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  /* ---------------- STATE ---------------- */
  const DIFF = {
    easy:   { wpm:40,  dmg:10, mistakeChance:0.35 },
    medium: { wpm:60,  dmg:15, mistakeChance:0.22 },
    hard:   { wpm:85,  dmg:20, mistakeChance:0.12 },
    expert: { wpm:110, dmg:25, mistakeChance:0.05 }
  };

  const state = {
    diff: 'medium',
    playerHP: 100,
    aiHP: 100,
    round: 1,
    combo: 0,
    deck: [],
    deckIndex: 0,
    current: null,
    roundActive: false,
    aiTimer: null,
    aiTypedText: '',
  };

  /* ---------------- DOM REFS ---------------- */
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const diffRow = document.getElementById('diffRow');
  const roundInfo = document.getElementById('roundInfo');
  const countdownEl = document.getElementById('countdown');
  const flashcardEl = document.getElementById('flashcard');
  const flashEmoji = document.getElementById('flashEmoji');
  const flashWord = document.getElementById('flashWord');
  const comboTag = document.getElementById('comboTag');
  const playerInput = document.getElementById('playerInput');
  const playerHPBar = document.getElementById('playerHP');
  const aiHPBar = document.getElementById('aiHP');
  const playerHPText = document.getElementById('playerHPText');
  const aiHPText = document.getElementById('aiHPText');
  const playerTypedBox = document.getElementById('playerTypedBox');
  const aiTypedBox = document.getElementById('aiTypedBox');
  const playerSide = document.getElementById('playerSide');
  const aiSide = document.getElementById('aiSide');
  const playerTank = document.getElementById('playerTank');
  const aiTank = document.getElementById('aiTank');
  const playerTankWrap = document.getElementById('playerTankWrap');
  const aiTankWrap = document.getElementById('aiTankWrap');
  const playerKeyboard = document.getElementById('playerKeyboard');
  const aiKeyboard = document.getElementById('aiKeyboard');

  /* ---------------- KEYBOARD UI ---------------- */
  const ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
  function buildKeyboard(container, idPrefix){
    ROWS.forEach(row=>{
      const rowEl = document.createElement('div');
      rowEl.className='krow';
      row.split('').forEach(ch=>{
        const k = document.createElement('div');
        k.className='key';
        k.textContent = ch;
        k.id = idPrefix + ch;
        rowEl.appendChild(k);
      });
      container.appendChild(rowEl);
    });
  }
  buildKeyboard(playerKeyboard, 'pk-');
  buildKeyboard(aiKeyboard, 'ak-');

  function flashKey(idPrefix, ch){
    const el = document.getElementById(idPrefix + ch.toUpperCase());
    if(!el) return;
    el.classList.add('active');
    setTimeout(()=>el.classList.remove('active'), 120);
  }

  /* ---------------- DIFFICULTY SELECT ---------------- */
  diffRow.addEventListener('click', (e)=>{
    const btn = e.target.closest('.diffBtn');
    if(!btn) return;
    [...diffRow.children].forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    state.diff = btn.dataset.diff;
  });

  startBtn.addEventListener('click', ()=>{
    if(actx.state === 'suspended') actx.resume();
    overlay.classList.add('hidden');
    startGame();
  });

  /* ---------------- GAME FLOW ---------------- */
  function startGame(){
    state.playerHP = 100;
    state.aiHP = 100;
    state.round = 1;
    state.combo = 0;
    state.deck = shuffled(CARDS);
    state.deckIndex = 0;
    updateHP();
    nextRound();
  }

  function updateHP(){
    const pHP = Math.max(0,state.playerHP);
    const aHP = Math.max(0,state.aiHP);
    playerHPBar.style.width = pHP + '%';
    aiHPBar.style.width = aHP + '%';
    playerHPText.textContent = pHP + '%';
    aiHPText.textContent = aHP + '%';
    if(state.playerHP <= 30){ playerHPBar.style.background = 'linear-gradient(90deg,#ff2e2e,#ff8c2e)'; }
    if(state.aiHP <= 30){ aiHPBar.style.background = 'linear-gradient(90deg,#ff2e2e,#ff8c2e)'; }
  }

  function nextRound(){
    roundInfo.textContent = 'Round ' + state.round;
    flashcardEl.classList.add('hidden');
    countdownEl.classList.remove('hidden');
    playerInput.value = '';
    playerTypedBox.textContent = '\u00A0';
    aiTypedBox.textContent = '\u00A0';
    playerTypedBox.className = 'typedBox';
    aiTypedBox.className = 'typedBox';
    comboTag.textContent = '';

    let count = 3;
    countdownEl.textContent = count;
    sfxCountdown();
    const iv = setInterval(()=>{
      count--;
      if(count > 0){
        countdownEl.textContent = count;
        sfxCountdown();
      } else {
        clearInterval(iv);
        countdownEl.textContent = 'GO!';
        sfxGo();
        setTimeout(()=>{
          countdownEl.classList.add('hidden');
          beginTyping();
        }, 400);
      }
    }, 700);
  }

  function beginTyping(){
    if(state.deckIndex >= state.deck.length){
      state.deck = shuffled(CARDS);
      state.deckIndex = 0;
    }
    state.current = state.deck[state.deckIndex++];
    flashEmoji.textContent = state.current.emoji;
    flashWord.textContent = state.current.word.split('').map(()=> '_').join(' ');
    flashcardEl.classList.remove('hidden');
    state.roundActive = true;
    playerInput.disabled = false;
    playerInput.value = '';
    playerInput.focus();

    startAITyping(state.current.word);
  }

  /* ---------------- PLAYER INPUT ---------------- */
  playerInput.addEventListener('input', ()=>{
    if(!state.roundActive) return;
    const val = playerInput.value;
    const lastChar = val.slice(-1);
    if(lastChar) { sfxKey(); flashKey('pk-', lastChar); }
    playerTypedBox.textContent = val || '\u00A0';

    const target = state.current.word.toLowerCase();
    if(val.toLowerCase() === target){
      playerTypedBox.classList.add('correct');
      resolveRound('player');
    }
  });

  playerInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && state.roundActive){
      const val = playerInput.value.trim().toLowerCase();
      const target = state.current.word.toLowerCase();
      if(val === target){
        playerTypedBox.classList.add('correct');
        resolveRound('player');
      } else {
        playerTypedBox.classList.remove('correct');
        playerTypedBox.classList.add('wrong');
        sfxWrong();
        setTimeout(()=>playerTypedBox.classList.remove('wrong'), 300);
      }
    }
  });

  /* ---------------- AI TYPING SIMULATION ---------------- */
  function startAITyping(word){
    const conf = DIFF[state.diff];
    const msPerChar = (60000 / (conf.wpm * 5)) * 2; // ~5 chars per "word" at WPM, slowed 50%
    state.aiTypedText = '';
    let plan = word.split('');

    // maybe insert a mistake: type a wrong-ish letter then backspace
    const willMistake = Math.random() < conf.mistakeChance && word.length > 2;
    let mistakeAtIndex = -1;
    if(willMistake){
      mistakeAtIndex = 1 + Math.floor(Math.random() * (word.length - 2));
    }

    let i = 0;
    let mistakeDone = false;

    function typeNext(){
      if(!state.roundActive) return;
      if(i >= plan.length){
        return; // AI finished all chars, resolveRound will have been triggered on last char
      }

      if(willMistake && !mistakeDone && i === mistakeAtIndex){
        // type a wrong letter
        const wrongChar = String.fromCharCode(97 + Math.floor(Math.random()*26));
        state.aiTypedText += wrongChar;
        renderAI();
        mistakeDone = true;
        state.aiTimer = setTimeout(()=>{
          // backspace it
          state.aiTypedText = state.aiTypedText.slice(0, -1);
          renderAI();
          state.aiTimer = setTimeout(typeNext, msPerChar * 1.3);
        }, msPerChar * 2);
        return;
      }

      state.aiTypedText += plan[i];
      renderAI();
      i++;

      if(i >= plan.length){
        // finished typing correctly
        if(state.roundActive){
          resolveRound('ai');
        }
        return;
      }
      state.aiTimer = setTimeout(typeNext, msPerChar * (0.7 + Math.random()*0.6));
    }

    function renderAI(){
      aiTypedBox.textContent = state.aiTypedText || '\u00A0';
      const last = state.aiTypedText.slice(-1);
      if(last){ flashKey('ak-', last); }
    }

    state.aiTimer = setTimeout(typeNext, msPerChar * (1 + Math.random()));
  }

  /* ---------------- ROUND RESOLUTION ---------------- */
  function resolveRound(winner){
    if(!state.roundActive) return;
    state.roundActive = false;
    playerInput.disabled = true;
    clearTimeout(state.aiTimer);

    flashWord.textContent = state.current.word.toUpperCase();

    if(winner === 'player'){
      sfxCorrect();
      state.combo++;
      fireShot('player', ()=>{
        const conf = DIFF[state.diff];
        let dmg = conf.dmg + (state.combo-1)*5;
        state.aiHP = Math.max(0, state.aiHP - dmg);
        updateHP();
        hitFlash(aiSide);
        comboTag.textContent = state.combo > 1 ? ('🔥 Combo x' + state.combo + '!') : '';
        checkGameOver();
      });
    } else {
      sfxWrong();
      state.combo = 0;
      aiTypedBox.classList.add('correct');
      fireShot('ai', ()=>{
        const conf = DIFF[state.diff];
        state.playerHP = Math.max(0, state.playerHP - conf.dmg);
        updateHP();
        hitFlash(playerSide);
        checkGameOver();
      });
    }
  }

  function fireShot(who, onImpact){
    const tank = who === 'player' ? playerTank : aiTank;
    const fromWrap = who === 'player' ? playerTankWrap : aiTankWrap;
    const toWrap = who === 'player' ? aiTankWrap : playerTankWrap;

    tank.classList.add('fire');
    sfxFire();
    setTimeout(()=> tank.classList.remove('fire'), 260);

    // shell travels across screen (simplified: just show at source then explode at target)
    const shell = document.createElement('div');
    shell.className = 'shell';
    shell.textContent = '💥'.length ? '●' : '●';
    shell.style.left = who === 'player' ? '85%' : '5%';
    fromWrap.appendChild(shell);

    const travelMs = 350;
    shell.style.transition = \`left \${travelMs}ms linear\`;
    requestAnimationFrame(()=>{
      shell.style.left = who === 'player' ? '200%' : '-100%';
    });

    setTimeout(()=>{
      shell.remove();
      const explosion = document.createElement('div');
      explosion.className = 'explosion';
      explosion.textContent = '💥';
      explosion.style.left = '45%';
      explosion.style.top = '35%';
      toWrap.appendChild(explosion);
      sfxHit();
      setTimeout(()=>explosion.remove(), 500);
      if(onImpact) onImpact();
    }, travelMs);
  }

  function hitFlash(sideEl){
    sideEl.classList.add('hitshake');
    setTimeout(()=>sideEl.classList.remove('hitshake'), 350);
    const tankEl = sideEl.querySelector('.tank');
    if(tankEl){
      tankEl.classList.add('tankhit');
      setTimeout(()=>tankEl.classList.remove('tankhit'), 400);
    }
  }

  function checkGameOver(){
    if(state.aiHP <= 0){
      setTimeout(()=> endGame('player'), 700);
    } else if(state.playerHP <= 0){
      setTimeout(()=> endGame('ai'), 700);
    } else {
      state.round++;
      setTimeout(nextRound, 1200);
    }
  }

  function endGame(winner){
    if(winner === 'player'){ sfxWin(); } else { sfxLose(); }
    overlay.classList.remove('hidden');
    overlay.replaceChildren();

    const title = document.createElement('h1');
    title.textContent = winner === 'player' ? '🏆 VICTORY!' : '💀 DEFEAT';

    const message = document.createElement('p');
    message.textContent = winner === 'player'
      ? 'You destroyed the enemy tank!'
      : 'Your tank was destroyed. Better luck next time!';

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.id = 'playAgainBtn';
    btn.textContent = 'Play Again';
    btn.addEventListener('click', () => {
      location.reload();
    });

    overlay.appendChild(title);
    overlay.appendChild(message);
    overlay.appendChild(btn);
  }

})();
})();`;
    container.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <>
      <style>{TankWars_CSS}</style>
      <div
        ref={containerRef}
        className="tankwars-root"
        dangerouslySetInnerHTML={{ __html: TankWars_HTML }}
      />
    </>
  );
}
