import { useState } from "react";

const SEASONS = ["spring", "summer", "fall", "winter"];
const E = { spring: "🌸", summer: "🏖️", fall: "🍂", winter: "⛄" };
const SPELL = [["jacket","🧥"],["juice","🧃"],["jump","🤸"],["jungle","🌴"],["windy","🌬️"],["sunny","☀️"],["winter","⛄"],["summer","🏖️"]];
const SIL = [["jacket","🧥"],["juice","🧃"],["dress","👗"],["banana","🍌"],["jungle","🌴"],["winter","⛄"],["fall","🍂"],["windy","🌬️"],["sunny","☀️"],["spring","🌸"]];
const MAX = [9, 24, 24];

const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const shuffleSeasons = () => {
  let p = shuffle(SEASONS);
  while (p.join() === SEASONS.join()) p = shuffle(SEASONS);
  return p;
};

let ac = null;
function beep(f, d = 0.15) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = f; o.type = "triangle"; g.gain.value = 0.12;
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + d);
  } catch (e) {}
}
const good = () => { beep(660); setTimeout(() => beep(880), 120); };
const bad = () => beep(180, 0.25);
const starRow = (n) => "⭐".repeat(n) + "☆".repeat(3 - n);

/* ---------- shared pieces ---------- */
function Head({ title, i, n, total, onHome }) {
  return (
    <>
      <div className="top">
        <button className="back" onClick={onHome}>← Menu</button>
        <span className="tot">⭐ {total}</span>
      </div>
      <h2>{title}</h2>
      <div className="dots">
        {Array.from({ length: n }, (_, k) => <i key={k} className={k < i ? "on" : ""} />)}
      </div>
    </>
  );
}

function Level({ title, count, total, onHome, onFinish, children }) {
  const [r, setR] = useState(0);
  const [earned, setEarned] = useState(0);
  const done = (mist) => {
    const e = earned + Math.max(1, 3 - mist);
    setEarned(e);
    if (r + 1 < count) setR(r + 1);
    else onFinish(e);
  };
  return (
    <>
      <Head title={title} i={r} n={count} total={total} onHome={onHome} />
      {children(r, done)}
    </>
  );
}

/* ---------- Level 1: order the seasons ---------- */
function Round1({ r, done, toast }) {
  const [pool] = useState(shuffleSeasons);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [mist, setMist] = useState(0);
  const [locked, setLocked] = useState(false);
  const [flash, setFlash] = useState(null);
  const lab = (w) => (r === 0 ? E[w] + " " : "") + w;

  const tap = (w) => {
    if (locked) return;
    const k = slots.indexOf(null);
    if (k < 0) return;
    const s = [...slots]; s[k] = w; setSlots(s);
  };
  const untap = (i) => {
    if (locked) return;
    const s = [...slots]; s[i] = null; setSlots(s);
  };
  const check = () => {
    if (locked) return;
    const wrong = slots.map((s, i) => s !== SEASONS[i]);
    setLocked(true);
    if (!wrong.includes(true)) {
      setFlash({ type: "ok" }); good(); toast("Great! ⭐");
      setTimeout(() => done(mist), 1100);
    } else {
      setMist(mist + 1); bad(); setFlash({ type: "bad", wrong });
      setTimeout(() => {
        setSlots((s) => s.map((x, i) => (wrong[i] ? null : x)));
        setLocked(false); setFlash(null);
      }, 800);
    }
  };
  return (
    <>
      <p>{r === 0 ? "Tap the seasons: 1, 2, 3, 4. Start with spring!" : r === 1 ? "No pictures this time. Start with spring!" : "Last round. You can do it!"}</p>
      <div className="slots">
        {slots.map((s, i) => (
          <button key={i} onClick={() => untap(i)}
            className={"slot " + (s ? "f " : "") + (flash?.type === "ok" ? "ok" : flash?.wrong?.[i] ? "bad" : "")}>
            <b>{i + 1}</b>{s ? lab(s) : ""}
          </button>
        ))}
      </div>
      <div className="tiles">
        {pool.map((w) => (
          <button key={w} className="tile" disabled={slots.includes(w)} onClick={() => tap(w)}>{lab(w)}</button>
        ))}
      </div>
      <button className="go" disabled={slots.includes(null)} onClick={check}>Check</button>
    </>
  );
}

/* ---------- Level 2: spelling ---------- */
function Round2({ item, done, toast }) {
  const [w, em] = item;
  const [letters] = useState(() => shuffle(w.split("").map((c, i) => ({ c, i }))));
  const [ans, setAns] = useState([]);
  const [mist, setMist] = useState(0);
  const [locked, setLocked] = useState(false);
  const [cls, setCls] = useState("");
  const letterOf = (id) => letters.find((l) => l.i === id).c;

  const pick = (id) => {
    if (locked) return;
    beep(520, 0.08);
    const next = [...ans, id];
    setAns(next);
    if (next.length === w.length) {
      setLocked(true);
      if (next.map(letterOf).join("") === w) {
        setCls("ok"); good(); toast(w + "! ⭐");
        setTimeout(() => done(mist), 1200);
      } else {
        setMist(mist + 1); bad(); setCls("bad");
        setTimeout(() => { setAns([]); setCls(""); setLocked(false); }, 800);
      }
    }
  };
  return (
    <>
      <div className="stage">{em}</div>
      <div className="boxes">
        {w.split("").map((_, k) => (
          <div key={k} className={"box " + cls}>{ans[k] !== undefined ? letterOf(ans[k]) : ""}</div>
        ))}
      </div>
      <div className="tiles">
        {letters.map((l) => (
          <button key={l.i} className="tile letter" disabled={ans.includes(l.i)} onClick={() => pick(l.i)}>{l.c}</button>
        ))}
      </div>
      <button className="back" onClick={() => !locked && setAns(ans.slice(0, -1))}>⌫ Delete</button>
    </>
  );
}

/* ---------- Level 3: silhouettes ---------- */
function Round3({ item, done }) {
  const [w, em] = item;
  const [opts] = useState(() =>
    shuffle([w, ...shuffle(SIL.map((s) => s[0]).filter((x) => x !== w)).slice(0, 3)])
  );
  const [mist, setMist] = useState(0);
  const [wrongs, setWrongs] = useState([]);
  const [won, setWon] = useState(false);

  const guess = (o) => {
    if (won || wrongs.includes(o)) return;
    if (o === w) {
      setWon(true); good();
      setTimeout(() => done(mist), 1300);
    } else {
      setMist(mist + 1); bad(); setWrongs([...wrongs, o]);
    }
  };
  return (
    <>
      <div className="stage"><span className={"sil " + (won ? "rev" : "")}>{em}</span></div>
      <p>Guess the word!</p>
      <div className="opts">
        {opts.map((o) => (
          <button key={o} disabled={wrongs.includes(o)}
            className={"opt " + (won && o === w ? "ok" : wrongs.includes(o) ? "bad" : "")} 
            onClick={() => guess(o)}>{o}</button>
        ))}
      </div>
    </>
  );
}

/* ---------- App ---------- */
export default function SeasonStars({ onComplete, profileName = "" }) {
  const [screen, setScreen] = useState("splash");
  const [player, setPlayer] = useState(profileName || "");
  const [shake, setShake] = useState(false);
  const [sc, setSc] = useState([0, 0, 0]);
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(0);
  const [msg, setMsg] = useState(null);
  const total = sc.reduce((a, b) => a + b, 0);

  const toast = (t) => { setMsg(t); setTimeout(() => setMsg(null), 1000); };
  const play = (lv) => { setRun((x) => x + 1); setScreen("l" + lv); };
  const home = () => setScreen("home");
  const finish = (lv) => (earned) => {
    setSc((s) => {
      const next = [...s];
      next[lv] = earned;
      const nextTotal = next.reduce((a, b) => a + b, 0);
      const maxTotal = MAX.reduce((a, b) => a + b, 0);
      onComplete?.(nextTotal, Math.round((nextTotal / maxTotal) * 100));
      return next;
    });
    setResult({ lv, earned }); setScreen("end"); good();
  };
  const submitName = () => {
    if (!player.trim()) { setShake(true); bad(); setTimeout(() => setShake(false), 400); return; }
    setPlayer(player.trim()); home();
  };

  const common = { total, onHome: home, toast };
  let body;
  if (screen === "splash") {
    body = (
      <div className="splash">
        <div className="seasons"><span>🌸</span><span>🏖️</span><span>🍂</span><span>⛄</span></div>
        <h1 className="hero">Season Stars</h1>
        <p>Order the seasons, spell the words and guess the shadows!</p>
        <button className="big" onClick={() => setScreen("name")}>Tap to start</button>
      </div>
    );
  } else if (screen === "name") {
    body = (
      <div className="splash">
        <div className="seasons"><span>🐻</span></div>
        <h2>What’s your name?</h2>
        <input className={"name " + (shake ? "bad" : "")} maxLength={14} autoFocus autoComplete="off"
          placeholder="Type your name" value={player}
          onChange={(e) => setPlayer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitName()} />
        <button className="big" onClick={submitName}>Let’s go!</button>
      </div>
    );
  } else if (screen === "home") {
    const L = [["🔢", "Level 1", "Put the seasons in order"], ["✏️", "Level 2", "Spell the word"], ["🕵️", "Level 3", "Who’s in the shadow?"]];
    body = (
      <>
        <h1>Hi, {player}!</h1>
        <p>Pick a level to play.</p>
        <div className="menu">
          {L.map((l, i) => (
            <button key={i} className="lv" onClick={() => play(i + 1)}>
              <span className="ic">{l[0]}</span>
              <span><b>{l[1]}</b><small>{l[2]}</small></span>
              <span className="st">{sc[i]}/{MAX[i]} ⭐</span>
            </button>
          ))}
        </div>
      </>
    );
  } else if (screen === "l1") {
    body = (
      <Level key={run} title="Put the seasons in order" count={3} {...common} onFinish={finish(0)}>
        {(r, done) => <Round1 key={r} r={r} done={done} toast={toast} />}
      </Level>
    );
  } else if (screen === "l2") {
    body = <Level2 key={run} {...common} onFinish={finish(1)} />;
  } else if (screen === "l3") {
    body = <Level3 key={run} {...common} onFinish={finish(2)} />;
  } else if (screen === "end" && result) {
    const { lv, earned } = result;
    const pct = earned / MAX[lv];
    const n = pct > 0.85 ? 3 : pct > 0.55 ? 2 : 1;
    body = (
      <>
        <h1>{lv < 2 ? "Level complete" : "All levels done"}, {player}!</h1>
        <div className="stars">{starRow(n)}</div>
        <p>You got {earned} of {MAX[lv]} stars.</p>
        {lv < 2 && <button className="big" onClick={() => play(lv + 2)}>Next level</button>}
        <p>
          <button className="go" onClick={() => play(lv + 1)}>Play again</button>{" "}
          <button className="back" onClick={home}>Menu</button>
        </p>
      </>
    );
  }

  return (
    <div className="ss">
      <style>{CSS}</style>
      <main className="app">{body}</main>
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}

function Level2(p) {
  const [words] = useState(() => shuffle(SPELL));
  return (
    <Level title="Spell the word" count={words.length} {...p}>
      {(r, done) => <Round2 key={r} item={words[r]} done={done} toast={p.toast} />}
    </Level>
  );
}
function Level3(p) {
  const [qs] = useState(() => shuffle(SIL).slice(0, 8));
  return (
    <Level title="Who’s in the shadow?" count={qs.length} {...p}>
      {(r, done) => <Round3 key={r} item={qs[r]} done={done} />}
    </Level>
  );
}

const CSS = `
.ss{--bg:#e9f9d9;--card:#fff;--ink:#2b3a2b;--g:#2bb673;--gd:#1c8a55;--or:#f28c28;--bad:#e5484d;--soft:#c9efb0;--stage:#fff4c9;
background:var(--bg);color:var(--ink);font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;min-height:100vh}
@media (prefers-color-scheme:dark){.ss{--bg:#17261d;--card:#22362a;--ink:#eaf6e4;--g:#3fcf8a;--gd:#2bb673;--soft:#2e4a37}}
.ss *{box-sizing:border-box}
.ss .app{max-width:980px;margin:0 auto;padding:28px 22px 60px;text-align:center}
.ss h1{font-size:4.2rem;margin:.3em 0 .1em;color:var(--g)}
.ss h1.hero{font-size:5.6rem;margin:.2em 0}
.ss h2{font-size:2.4rem;margin:.2em 0}
.ss p{margin:.4em 0 1em;font-size:1.7rem}
.ss button{font:inherit;color:inherit;cursor:pointer;border:0}
.ss button:focus-visible,.ss input:focus-visible{outline:3px solid var(--or);outline-offset:2px}
.ss .menu{display:grid;gap:14px;margin-top:18px}
.ss .lv{background:var(--card);border-radius:30px;padding:30px;display:flex;align-items:center;gap:24px;text-align:left;box-shadow:0 4px 0 var(--soft);font-size:2rem}
.ss .lv .ic{font-size:4.4rem}.ss .lv small{display:block;opacity:.75}
.ss .lv .st{margin-left:auto;font-weight:700;color:var(--or);white-space:nowrap}
.ss .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.ss .back{background:var(--card);border-radius:18px;padding:14px 24px;font-weight:700;font-size:1.5rem}
.ss .tot{font-weight:700;color:var(--or);font-size:2rem}
.ss .dots{display:flex;gap:10px;justify-content:center;margin:10px 0 18px}
.ss .dots i{width:22px;height:22px;border-radius:50%;background:var(--soft)}.ss .dots i.on{background:var(--g)}
.ss .slots,.ss .tiles,.ss .opts{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin:14px 0}
.ss .slot{width:calc(50% - 8px);min-height:120px;background:var(--card);border:3px dashed var(--g);border-radius:28px;font-size:2.4rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;padding:8px}
.ss .slot b{background:var(--g);color:#fff;border-radius:50%;width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;font-size:1.7rem}
.ss .slot.f{border-style:solid}
.ss .slot.bad,.ss .box.bad,.ss input.name.bad{border-color:var(--bad);animation:ssh .4s}
.ss .slot.ok,.ss .box.ok{border-color:var(--g);background:var(--soft)}
.ss .tile,.ss .opt,.ss .go,.ss .big{background:var(--g);color:#fff;border-radius:26px;padding:22px 36px;font-size:2.3rem;font-weight:700;box-shadow:0 4px 0 var(--gd)}
.ss .tile:active,.ss .opt:active,.ss .go:active,.ss .big:active{transform:translateY(3px);box-shadow:0 1px 0 var(--gd)}
.ss .tile:disabled{opacity:.25;box-shadow:none}
.ss .go{background:var(--or);box-shadow:0 4px 0 #b4631a;margin-top:8px}.ss .go:disabled{opacity:.4}
.ss .letter{min-width:96px;font-size:3rem;padding:18px 0}
.ss .stage{background:var(--stage);border-radius:40px;width:min(360px,80vw);height:min(360px,80vw);margin:8px auto;display:flex;align-items:center;justify-content:center;font-size:12rem}
.ss .sil{transition:filter .5s,transform .5s;filter:brightness(0)}.ss .sil.rev{filter:none;transform:scale(1.12)}
.ss .boxes{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:14px 0}
.ss .box{width:82px;height:104px;background:var(--card);border:3px solid var(--g);border-radius:20px;font-size:3.4rem;font-weight:700;display:flex;align-items:center;justify-content:center}
.ss .opt{background:var(--card);color:var(--ink);box-shadow:0 4px 0 var(--soft);border:3px solid var(--g);min-width:44%}
.ss .opt.ok{background:var(--g);color:#fff}.ss .opt.bad{background:var(--bad);color:#fff;border-color:var(--bad);opacity:.7}
.ss .toast,.toast{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);background:var(--card,#fff);color:var(--ink,#222);border:4px solid #f28c28;border-radius:24px;padding:30px 48px;font-size:2.8rem;font-weight:700;z-index:9;box-shadow:0 8px 30px rgba(0,0,0,.25);animation:ssp .35s}
.ss .stars{font-size:5rem;margin:10px 0;letter-spacing:6px}
.ss .splash{min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
.ss .seasons{font-size:7rem;display:flex;gap:20px;justify-content:center}
.ss .seasons span{animation:ssf 2.4s ease-in-out infinite}
.ss .seasons span:nth-child(2){animation-delay:.3s}.ss .seasons span:nth-child(3){animation-delay:.6s}.ss .seasons span:nth-child(4){animation-delay:.9s}
.ss input.name{font:inherit;font-size:2.6rem;padding:22px 28px;border-radius:26px;border:4px solid var(--g);background:var(--card);color:var(--ink);width:min(560px,100%);text-align:center}
@keyframes ssh{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
@keyframes ssp{from{transform:translate(-50%,-50%) scale(.6);opacity:0}}
@keyframes ssf{50%{transform:translateY(-14px)}}
@media (max-width:600px){
.ss h1{font-size:3rem}.ss h1.hero{font-size:3.6rem}.ss p{font-size:1.3rem}.ss h2{font-size:1.8rem}
.ss .seasons{font-size:4rem;gap:10px}.ss .lv{font-size:1.4rem;padding:20px}.ss .lv .ic{font-size:3rem}
.ss .slot{width:100%;min-height:90px;font-size:2rem}.ss .tile,.ss .opt,.ss .go,.ss .big{font-size:1.7rem;padding:16px 24px}
.ss .letter{min-width:68px;font-size:2.2rem}.ss .stage{font-size:9rem}.ss .box{width:54px;height:72px;font-size:2.3rem}
.ss .opt{min-width:100%}.ss .stars{font-size:3.5rem}.ss input.name{font-size:1.9rem}}
@media (prefers-reduced-motion:reduce){.ss *{animation:none!important;transition:none!important}}
`;
