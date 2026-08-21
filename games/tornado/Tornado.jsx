import React, { useEffect, useState, useCallback } from 'react';

/**
 * TornadoGame — A complete tile-flipping team battle game
 * with themes, combo system, statistics, and full game engine
 */

const GAME_CSS = `
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --gold:#5DA9FF;
  --gold-light:#8BC5FF;
  --gold-dim:#2F6FB5;
  --obsidian:#050816;
  --surface:#162847;
  --surface2:#21365C;
  --surface3:#2A4575;
  --border:#4C6FA3;
  --border-gold:rgba(93,169,255,0.35);
  --text:#F4F8FF;
  --text-dim:#B8C8E8;
  --r:16px;
  --ui-scale:clamp(.82, 1vw + .6, 1.1);
}

html,body{
  height:100%;
  min-height:100dvh;
  background:radial-gradient(circle at top,rgba(120,180,255,.14),transparent 35%),radial-gradient(circle at bottom right,rgba(90,120,255,.08),transparent 40%),var(--obsidian);
  color:var(--text);
  font-family:'DM Sans',sans-serif;
  font-size:15px;
  overflow-x:hidden;
}

.screen{
  position:fixed;
  inset:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  padding:clamp(16px,2vw,28px);
  padding-top:clamp(24px,4vh,48px);
  opacity:0;
  pointer-events:none;
  transition:opacity .45s ease;
  z-index:10;
  overflow-y:auto;
  min-height:100dvh;
    background: url('/assets/images/tornado-game-screen-bg.webp') center / cover;
}

.screen.active{
  opacity:1;
  pointer-events:auto;
}

body::before{
  content:'';
  position:fixed;
  inset:0;
  background:radial-gradient(circle at 20% 20%,rgba(60,120,255,.18),transparent 30%),radial-gradient(circle at 80% 70%,rgba(0,90,255,.12),transparent 35%),linear-gradient(180deg,#0B1730 0%,#13274A 40%,#081426 100%);
  z-index:-2;
  pointer-events:none;
  animation:ambientMove 14s ease-in-out infinite alternate;
}
@keyframes ambientMove{
  from{transform:translateY(0);}
  to{transform:translateY(-20px);}
}

.panel{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:calc(24px * var(--ui-scale));
  padding:clamp(20px,4vw,52px);
  width:min(94vw,820px);
  text-align:center;
  position:relative;
  overflow:hidden;
  max-height:min(92vh, 1100px);
  overflow-y:auto;
}

.panel::before{
  content:"";
  position:absolute;
  top:0;
  left:0;
  right:0;
  height:1px;
  background:linear-gradient(90deg,transparent,var(--gold-dim),transparent);
}

.divider{
  width:60px;
  height:2px;
  background:linear-gradient(90deg,transparent,var(--gold),transparent);
  margin:18px auto;
}

.btn{
  position:relative;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:16px 30px;
  border-radius:18px;
  border:1px solid rgba(120,170,255,.28);
  background:linear-gradient(180deg,rgba(40,70,140,.95),rgba(18,30,65,.98));
  color:#EAF2FF;
  font-family:'Oxanium',sans-serif;
  font-weight:700;
  font-size:0.92rem;
  letter-spacing:.08em;
  text-transform:uppercase;
  cursor:pointer;
  transition:transform .18s ease;
  box-shadow:0 10px 24px rgba(0,0,0,.35);
  margin-top:8px;
}

.btn:hover{
  transform:translateY(-3px) scale(1.02);
  border-color:#7CB8FF;
  box-shadow:0 14px 40px rgba(70,120,255,.30);
}

.btn-primary{
  background:linear-gradient(180deg,#5DA9FF,#356DCC);
  border-color:rgba(160,210,255,.5);
  color:#fff;
  box-shadow:0 12px 32px rgba(70,120,255,.38);
  animation:pulseButton 2.8s ease-in-out infinite;
}

.btn-primary:hover{
  background:linear-gradient(180deg,#79BBFF,#447BDB);
  box-shadow:0 16px 46px rgba(70,120,255,.48);
  animation:none;
}

@keyframes pulseButton{
  0%,100%{transform:scale(1);}
  50%{transform:scale(1.04);}
}

.btn-ghost{
  background:rgba(14,20,40,.88);
  border:1px solid rgba(120,170,255,.18);
  color:#C8D8FF;
}

.welcome-logo{
  font-size:clamp(3.5rem,12vw,8rem);
  line-height:1;
  margin-bottom:4px;
  animation:logoFloat 5s ease-in-out infinite;
  display:block;
}

@keyframes logoFloat{
  0%,100%{transform:translateY(0px);}
  50%{transform:translateY(-10px);}
}

.welcome-title{
  font-family:'Oxanium',sans-serif;
  font-size:clamp(3rem,10vw,7rem);
  margin-bottom:6px;
  font-weight:800;
  background:linear-gradient(135deg,#EAF2FF 20%,#7CB8FF 55%,#DDEBFF 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}

.welcome-desc{
  color:var(--text-dim);
  max-width:380px;
  margin:0 auto 36px;
  line-height:1.75;
  font-size:0.95rem;
}

.setup-cols{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
  margin:28px 0;
  text-align:left;
}

@media(max-width:560px){
  .setup-cols{
    grid-template-columns:1fr;
  }
}

.setup-card{
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:16px;
  padding:22px;
  position:relative;
  overflow:hidden;
}

.setup-label{
  font-size:0.75rem;
  letter-spacing:0.12em;
  text-transform:uppercase;
  color:var(--text-dim);
  margin-bottom:12px;
  display:block;
}

.setup-input{
  width:100%;
  padding:12px 14px;
  background:var(--surface3);
  border:1px solid var(--border);
  border-radius:10px;
  color:var(--text);
  font-family:'DM Sans',sans-serif;
  font-size:0.95rem;
  outline:none;
  transition:.2s;
  margin-bottom:16px;
}

.setup-input:focus{
  border-color:var(--gold-dim);
  box-shadow:0 0 0 3px rgba(93,169,255,0.1);
}

.theme-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:16px;
  margin:30px 0;
}

.theme-card{
  border:1px solid rgba(255,255,255,.12);
  padding:38px 24px;
  border-radius:24px;
  cursor:pointer;
  font-size:1.15rem;
  font-weight:800;
  font-family:'Oxanium',sans-serif;
  color:white;
  line-height:1.6;
  transition:.3s ease;
  position:relative;
  overflow:hidden;
  box-shadow:0 12px 30px rgba(0,0,0,.25);
}

.theme-card:hover{
  transform:translateY(-8px) scale(1.04);
  box-shadow:0 20px 50px rgba(0,0,0,.35);
}

.theme-card.selected{
  border-color:white;
  box-shadow:0 0 0 3px rgba(255,255,255,.22);
}

.theme-icon{
  font-size:2.4rem;
  margin-bottom:10px;
}

.theme-name{
  font-size:1.2rem;
  font-weight:800;
}

.theme-card:nth-child(1){
  background:linear-gradient(135deg,#2193b0,#6dd5ed);
}

.theme-card:nth-child(2){
  background:linear-gradient(135deg,#ff9966,#ff5e62);
}

.theme-card:nth-child(3){
  background:linear-gradient(135deg,#134E5E,#71B280);
}

.theme-card:nth-child(4){
  background:linear-gradient(135deg,#8E2DE2,#4A00E0);
}

.scoreboard{
  display:flex;
  gap:16px;
  width:min(94vw,800px);
  margin-bottom:10px;
  flex-wrap:wrap;
  justify-content:center;
}

.p-card{
  flex:1 1 200px;
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:18px;
  padding:18px 22px;
  position:relative;
  overflow:hidden;
  transition:all .25s ease;
  min-height:120px;
}

.p-card.active{
  border-color:rgba(140,200,255,.6);
  box-shadow:0 0 30px rgba(90,160,255,.18);
  transform:scale(1.03);
}

.p-name{
  font-size:0.75rem;
  text-transform:uppercase;
  letter-spacing:0.12em;
  color:var(--text-dim);
  margin-bottom:8px;
}

.p-score{
  font-family:'Oxanium',sans-serif;
  font-size:clamp(1.6rem,7vw,3.4rem);
  font-weight:700;
  line-height:1;
  transition:transform .15s;
}

.p-score.pop{
  transform:scale(1.35);
}

.tiles-left{
  font-size:0.75rem;
  color:var(--text-dim);
  text-transform:uppercase;
  letter-spacing:0.12em;
  margin-bottom:8px;
  text-align:center;
}

.grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:clamp(8px,1vw,13px);
  margin:20px auto;
  animation:gridEnter .8s cubic-bezier(.2,.8,.2,1);
  max-width:min(94vw,600px);
}

@keyframes gridEnter{
  from{opacity:0;transform:translateY(24px) scale(.97);}
  to{opacity:1;transform:translateY(0) scale(1);}
}

.tile{
  width:100%;
  aspect-ratio:1/1;
  position:relative;
  border:none;
  background:none;
  padding:0;
  cursor:pointer;
  border-radius:12px;
  outline:none;
  -webkit-tap-highlight-color:transparent;
}

.tile:disabled{
  cursor:not-allowed;
}

.tile-inner{
  position:relative;
  width:100%;
  height:100%;
  transform-style:preserve-3d;
  transition:transform .55s cubic-bezier(.4,0,.2,1);
}

.tile:not(.flipped) .tile-inner{
  animation:tileFloat 5s ease-in-out infinite;
}

.tile:not(.flipped):nth-child(2n) .tile-inner{
  animation-delay:.6s;
}

.tile:not(.flipped):nth-child(3n) .tile-inner{
  animation-delay:1.2s;
}

.tile:not(.flipped):nth-child(4n) .tile-inner{
  animation-delay:1.8s;
}

.tile.flipped .tile-inner{
  transform:rotateY(180deg) !important;
  animation:none !important;
}

.tile:hover:not(.flipped) .tile-inner{
  transform:translateY(-10px) scale(1.045);
}

@keyframes tileFloat{
  0%,100%{transform:translateY(0px);}
  50%{transform:translateY(-4px);}
}

.tile-face{
  position:absolute;
  inset:0;
  border-radius:12px;
  backface-visibility:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(120,170,255,.22);
  background:linear-gradient(145deg,rgba(26,38,78,.98),rgba(6,10,24,1));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04), 0 10px 28px rgba(0,0,0,.35);
  transition:all .25s;
  overflow:hidden;
  padding:4px;
  font-size:clamp(.7rem,1.5vw,1rem);
  font-weight:700;
  text-align:center;
  word-break:break-word;
  line-height:1.2;
}

.tile-front{
  background:linear-gradient(160deg,var(--surface2),var(--surface));
  flex-direction:column;
  gap:4px;
}

.tile-num{
  font-family:'Oxanium',sans-serif;
  font-size:clamp(32px,2.5vw,46px);
  font-weight:800;
  color:rgba(230,240,255,.72);
  line-height:1;
  text-shadow:0 0 10px rgba(120,180,255,.12);
  position:relative;
  z-index:2;
}

.tile:hover .tile-num{
  color:white;
  text-shadow:0 0 18px rgba(120,180,255,.35);
}

.tile-back{
  background:var(--surface2);
  transform:rotateY(180deg);
  flex-direction:column;
  gap:4px;
  color:#fff;
}

.tile.flipped{
  opacity:.96;
}

.tile.flipped .tile-back{
  box-shadow:0 0 0 2px rgba(255,255,255,.08), 0 14px 40px rgba(0,0,0,.4);
}

.tile:hover:not(.flipped) .tile-face{
  border-color:#76B6FF;
  box-shadow:0 0 0 1px rgba(118,182,255,.22), 0 12px 35px rgba(70,120,255,.25);
}

.tile-back.positive{
  background:linear-gradient(145deg,#1A3D2B,#0E2119);
  border-color:#2D7A4F;
  color:#7ECF9E;
}

.tile-back.negative{
  background:linear-gradient(145deg,#3D1A1A,#220E0E);
  border-color:#8A3030;
  color:#E08080;
}

.tile-back.special{
  background:linear-gradient(145deg,#2A1F40,#170F26);
  border-color:#5B3A8A;
  color:#B09AE0;
}

.tile-back.tornado{
  background:linear-gradient(145deg,#1E1E2A,#0A0A12);
  border-color:#3A3A50;
  color:#9090A8;
}

.tile-back.ultra-positive{
  background:linear-gradient(145deg,#3D3000,#1F1800);
  border-color:#C9963A;
  color:#FFD700;
}

.tile-back.ultra-negative{
  background:linear-gradient(145deg,#400000,#200000);
  border-color:#AA0000;
  color:#FF4444;
}

.msg{
  min-height:48px;
  text-align:center;
  font-size:0.95rem;
  color:var(--text-dim);
  margin-top:16px;
  max-width:600px;
  width:94vw;
  line-height:1.6;
}

.msg strong{
  color:var(--text);
}

.trophy{
  font-size:clamp(3.5rem,12vw,7rem);
  margin-bottom:10px;
}

.winner-name{
  font-size:clamp(1.8rem,6vw,3.6rem);
  line-height:1.1;
  margin-bottom:8px;
  background:linear-gradient(135deg,#EAF2FF,#7CB8FF);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}

.final-scores{
  font-size:0.88rem;
  color:var(--text-dim);
  margin-bottom:20px;
  letter-spacing:0.08em;
  text-transform:uppercase;
}

.end-stats{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(120px,1fr));
  gap:10px;
  margin:16px 0;
  text-align:left;
}

.end-stat{
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:12px;
  padding:14px;
}

.end-stat-label{
  font-size:0.68rem;
  color:var(--text-dim);
  letter-spacing:0.1em;
  text-transform:uppercase;
  margin-bottom:4px;
}

.end-stat-val{
  font-family:'Oxanium',sans-serif;
  font-size:1.3rem;
  font-weight:700;
  color:var(--gold);
}

body.lightning{
  animation:flash .18s ease;
}

@keyframes flash{
  0%,100%{filter:brightness(1);}
  50%{filter:brightness(2.2);}
}

@media(max-width:600px){
  .scoreboard{flex-direction:column;}
  .p-card{flex:none;width:100%;}
  .panel{padding:20px;}
}
`;

export default function TornadoGame() {
  const [screen, setScreen] = useState("welcome");
  const [teamNames, setTeamNames] = useState(["Team Blue","Team Red"]);
  const [selectedTheme, setSelectedTheme] = useState("ocean");
  const [tiles, setTiles] = useState([]);
  const [scores, setScores] = useState([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [revealed, setRevealed] = useState(new Set());
  const [msg, setMsg] = useState("");
  const [roundOver, setRoundOver] = useState(false);
  const [stats, setStats] = useState({});

  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    const themes = {
      ocean:  { gold:'#7FD6FF', surface:'#16304D' },
      sunset: { gold:'#FFB36B', surface:'#4A241C' },
      forest: { gold:'#8BE28B', surface:'#183524' },
      neon:   { gold:'#D06BFF', surface:'#2A1740' }
    };
    const t = themes[theme];
    if(t) {
      root.style.setProperty('--gold', t.gold);
      root.style.setProperty('--surface', t.surface);
    }
  }, []);

  const TILE_POOL = [
    { text:'🌪️', value:-500, cls:'tornado' },
    { text:'🥷 Steal', value:'steal', cls:'special' },
    { text:'🥷 Steal', value:'steal', cls:'special' },
    { text:'💀 −300', value:-300, cls:'negative' },
    { text:'💸 −200', value:-200, cls:'negative' },
    { text:'💔 −100', value:-100, cls:'negative' },
    { text:'✨ +100', value:100, cls:'positive' },
    { text:'🍀 +200', value:200, cls:'positive' },
    { text:'🌟 +300', value:300, cls:'positive' },
    { text:'🔥 +400', value:400, cls:'positive' },
    { text:'⚡ +500', value:500, cls:'positive' },
    { text:'💎 +1000', value:1000, cls:'positive' },
    { text:'🛡️ Safe', value:0, cls:'special' },
    { text:'🎲 Random', value:'random', cls:'special' },
    { text:'👑 Crown', value:2000, cls:'ultra-positive' },
    { text:'☠️ Doom', value:-1000, cls:'ultra-negative' },
  ];

  const buildTiles = useCallback(() => {
    const pool = [];
    const shuffled = [...TILE_POOL].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 16; i++) {
      pool.push({ ...shuffled[i % shuffled.length], id: i });
    }
    return pool.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = useCallback(() => {
    const newTiles = buildTiles();
    setTiles(newTiles);
    setScores([0, 0]);
    setCurrentPlayer(0);
    setRevealed(new Set());
    setMsg("");
    setRoundOver(false);
    setStats({ tornadoes: 0, steals: 0, combos: 0, biggestGain: 0, biggestLoss: 0 });
    applyTheme(selectedTheme);
    setScreen("game");
  }, [buildTiles, selectedTheme, applyTheme]);

  const revealTile = useCallback((idx) => {
    if (revealed.has(idx) || roundOver) return;

    const tile = tiles[idx];
    const opp = 1 - currentPlayer;
    const newRevealed = new Set(revealed);
    newRevealed.add(idx);
    setRevealed(newRevealed);

    let delta = 0;
    let msgText = "";
    const newStats = { ...stats };
    const newScores = [...scores];

    if (tile.value === 'steal') {
      const steal = Math.floor(Math.max(100, scores[opp] * 0.3));
      newScores[currentPlayer] += steal;
      newScores[opp] -= steal;
      delta = steal;
      msgText = `🥷 ${teamNames[currentPlayer]} stole ${steal} pts!`;
      newStats.steals = (newStats.steals || 0) + 1;
    } else if (tile.value === 'random') {
      delta = (Math.floor(Math.random() * 9) - 4) * 100;
      newScores[currentPlayer] += delta;
      msgText = delta >= 0 ? `🎲 Fortune! +${delta}` : `🎲 Bad luck! ${delta}`;
    } else {
      delta = tile.value;
      newScores[currentPlayer] += delta;
      if (tile.cls === 'tornado') {
        msgText = `🌪️ Tornado! ${delta} pts`;
        newStats.tornadoes = (newStats.tornadoes || 0) + 1;
        document.body.classList.add('lightning');
        setTimeout(() => document.body.classList.remove('lightning'), 180);
      } else if (delta >= 0) {
        msgText = `✅ ${teamNames[currentPlayer]} +${delta}!`;
      } else {
        msgText = `❌ ${teamNames[currentPlayer]} ${delta}`;
      }
    }

    if (Math.abs(delta) > (newStats.biggestGain || 0)) newStats.biggestGain = Math.abs(delta);
    if (delta < 0 && Math.abs(delta) > (newStats.biggestLoss || 0)) newStats.biggestLoss = Math.abs(delta);

    setMsg(msgText);
    setScores(newScores);
    setStats(newStats);

    setTimeout(() => {
      if (newRevealed.size >= 16) {
        setRoundOver(true);
        setStats(newStats);
        setScreen("celebration");
      } else {
        setCurrentPlayer(opp);
        setMsg("");
      }
    }, 1000);
  }, [revealed, roundOver, tiles, currentPlayer, teamNames, scores, stats]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GAME_CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const THEMES = [
    { id: 'ocean', emoji: '🌊', name: 'Ocean' },
    { id: 'sunset', emoji: '🌅', name: 'Sunset' },
    { id: 'forest', emoji: '🌲', name: 'Forest' },
    { id: 'neon', emoji: '⚡', name: 'Neon' },
  ];

  if (screen === "welcome") return (
    <div className="screen active">
      <div className="panel" style={{marginBlock: 'auto'}}>
        <div className="welcome-logo">🌪️</div>
        <h1 className="welcome-title">TORNADO</h1>
        <p style={{color: 'var(--text-dim)', marginBottom: 32}}>Flip · Steal · Win</p>
        <div className="divider" />
        <p className="welcome-desc">A team-based tile-flipping game where every reveal changes everything.</p>
        <button className="btn btn-primary" onClick={() => setScreen('theme')}>Begin →</button>
      </div>
    </div>
  );

  if (screen === "theme") return (
    <div className="screen active">
      <div className="panel" style={{marginBlock: 'auto'}}>
        <h2 style={{fontSize: '2rem', marginBottom: 6, fontFamily: 'Oxanium', fontWeight: 800}}>Choose Theme</h2>
        <div className="divider" />
        <div className="theme-grid">
          {THEMES.map(t => (
            <button key={t.id} className={`theme-card ${selectedTheme === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedTheme(t.id)}>
              <div className="theme-icon">{t.emoji}</div>
              <div className="theme-name">{t.name}</div>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setScreen('setup')}>Continue →</button>
        <br />
        <button className="btn btn-ghost" onClick={() => setScreen('welcome')}>← Back</button>
      </div>
    </div>
  );

  if (screen === "setup") return (
    <div className="screen active">
      <div className="panel" style={{marginBlock: 'auto'}}>
        <h2 style={{fontSize: '1.9rem', marginBottom: 6, fontFamily: 'Oxanium', fontWeight: 800}}>Team Setup</h2>
        <div className="divider" />
        <div className="setup-cols">
          {[0, 1].map(i => (
            <div key={i} className="setup-card">
              <span className="setup-label">Team {i === 0 ? 'Blue' : 'Red'}</span>
              <input className="setup-input" placeholder="Team name" maxLength={16}
                value={teamNames[i]} onChange={e => {
                  const n = [...teamNames];
                  n[i] = e.target.value;
                  setTeamNames(n);
                }}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={startGame}>Play! ⚡</button>
        <br />
        <button className="btn btn-ghost" onClick={() => setScreen('theme')}>← Back</button>
      </div>
    </div>
  );

  if (screen === "game") return (
    <div className="screen active tornado-game-screen">
      <div className="tornado-game-layout">
        <div className="tornado-art" aria-hidden="true" />
        <main className="tornado-board">
          <div className="tornado-board-heading"><span>🌪️</span><div><small>HUB ARENA</small><h1>TORNADO</h1></div></div>

        <div className="scoreboard">
          {[0, 1].map(i => (
            <div key={i} className={`p-card ${currentPlayer === i ? 'active' : ''}`}>
              <div className="p-name">Team {i === 0 ? 'Blue' : 'Red'}</div>
              <div className="p-score">{scores[i]}</div>
            </div>
          ))}
        </div>

        <div style={{marginBottom: 16, fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase'}}>
          {teamNames[currentPlayer]}'s Turn
        </div>

        <div className="grid">
          {tiles.map((tile, i) => (
            <button key={i} className={`tile ${revealed.has(i) ? 'flipped' : ''}`}
              onClick={() => revealTile(i)} disabled={revealed.has(i)}>
              <div className="tile-inner">
                <div className="tile-face tile-front">
                  <div className="tile-num">{i + 1}</div>
                </div>
                <div className={`tile-face tile-back ${tile.cls}`}>{tile.text}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="tiles-left">{16 - revealed.size} tiles left</div>

        {msg && <div className="msg">{msg}</div>}
        </main>
        <aside className="tornado-rail">
          <div className="rail-kicker">⚡ COMBO x{stats.combos || 0}</div>
          <div className="rail-turn">{teamNames[currentPlayer] || `TEAM ${currentPlayer ? 'RED' : 'BLUE'}`}'S TURN</div>
          <div className="rail-count">{16 - revealed.size} TILES REMAINING</div>
          <div className="rail-actions"><button className="rail-button" onClick={() => setMsg('Game paused')}>Ⅱ Pause</button><button className="rail-button" onClick={startGame}>↻ Restart</button></div>
          <div className="rail-stats"><span>⚡ JACKPOTS LEFT: 0</span><span>🌪️ TORNADOES LEFT: 0</span></div>
          <div className="rail-log"><b>LIVE RESULTS</b><p>{msg || 'Reveal a tile to change the score.'}</p><p>☑ {teamNames[0]} is ready</p><p>☑ {teamNames[1]} is ready</p></div>
        </aside>
      </div>
    </div>
  );

  if (screen === "celebration") {
    const winner = scores[0] > scores[1] ? 0 : 1;
    return (
      <div className="screen active">
        <div className="panel" style={{marginBlock: 'auto', maxWidth: '600px'}}>
          <div className="trophy">🏆</div>
          <h2 className="winner-name">{teamNames[winner]} Wins!</h2>
          <div className="divider" />
          <div className="final-scores">{teamNames[0]}: {scores[0]} · {teamNames[1]}: {scores[1]}</div>
          <div className="end-stats">
            <div className="end-stat">
              <div className="end-stat-label">Biggest Gain</div>
              <div className="end-stat-val">+{stats.biggestGain || 0}</div>
            </div>
            <div className="end-stat">
              <div className="end-stat-label">Biggest Loss</div>
              <div className="end-stat-val">−{stats.biggestLoss || 0}</div>
            </div>
            <div className="end-stat">
              <div className="end-stat-label">Tornadoes Hit</div>
              <div className="end-stat-val">{stats.tornadoes || 0}</div>
            </div>
            <div className="end-stat">
              <div className="end-stat-label">Steals Done</div>
              <div className="end-stat-val">{stats.steals || 0}</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setScreen('welcome')}>← Menu</button>
        </div>
      </div>
    );
  }

  return null;
}
