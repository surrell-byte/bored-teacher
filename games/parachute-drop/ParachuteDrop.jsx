'use client';

import { useEffect, useState } from 'react';

const STRINGS = { left: [1, 3, 5], right: [2, 4, 6] };
const NAMES = { left: 'Leo', right: 'Mia' };
const TARGET_SCORE = 3;

function pickFace() {
  return Math.random() < 0.1 ? 'shield' : 1 + Math.floor(Math.random() * 6);
}

export default function ParachuteDrop({ onComplete }) {
  const [current, setCurrent] = useState('left');
  const [cut, setCut] = useState({ left: [], right: [] });
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [face, setFace] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [status, setStatus] = useState("Leo's turn - roll, then stop whenever you dare!");
  const [modal, setModal] = useState(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!rolling) return undefined;
    const timer = setInterval(() => setFace(pickFace()), 90);
    return () => clearInterval(timer);
  }, [rolling]);

  function stopRoll() {
    if (!rolling || modal) return;
    const result = pickFace();
    setRolling(false);
    setFace(result === 'shield' ? 1 : result);
    if (result === 'shield') {
      setStatus('🛡 Shield! No ropes cut.');
      setCurrent(side => side === 'left' ? 'right' : 'left');
      return;
    }

    const side = result % 2 ? 'left' : 'right';
    const name = NAMES[side];
    if (cut[side].includes(result)) {
      setStatus(`Rolled a ${result} - that rope is already gone. Safe roll for ${name}!`);
      setCurrent(side === 'left' ? 'right' : 'left');
      return;
    }

    const nextCut = { ...cut, [side]: [...cut[side], result] };
    setCut(nextCut);
    const remaining = STRINGS[side].length - nextCut[side].length;
    if (remaining <= 0) {
      const winner = side === 'left' ? 'right' : 'left';
      const nextScore = { ...score, [winner]: score[winner] + 1 };
      setScore(nextScore);
      setStatus(`${name}'s last string snapped!`);
      if (nextScore[winner] >= TARGET_SCORE) {
        setModal({ title: `${NAMES[winner]} wins! 🏆`, text: `Final score: ${nextScore.left} - ${nextScore.right}` });
        onComplete?.(nextScore[winner] * 100, 100);
      } else {
        setModal({ title: `${NAMES[winner]} wins the round!`, text: `First to ${TARGET_SCORE} wins the tournament.` });
      }
    } else {
      setStatus(`Rolled a ${result} - snip! ${name} loses a string.`);
      setCurrent(side === 'left' ? 'right' : 'left');
    }
  }

  function restart() {
    setCurrent('left'); setCut({ left: [], right: [] }); setScore({ left: 0, right: 0 });
    setFace(1); setRolling(false); setModal(null); setStatus("Leo's turn - roll, then stop whenever you dare!");
  }

  return <div className="parachute-drop"><style>{CSS}</style>
    <div className="pd-hud"><div><b>🧒 Leo</b><span>{'❤️'.repeat(3 - cut.left.length)}{'🖤'.repeat(cut.left.length)}</span><small>🏆 {score.left}</small></div><div className="pd-die">{face === 'shield' ? '🛡' : `⚄ ${face}`}</div><div><b>Mia 👧</b><span>{'❤️'.repeat(3 - cut.right.length)}{'🖤'.repeat(cut.right.length)}</span><small>🏆 {score.right}</small></div></div>
    <div className="pd-stage"><div className={`pd-rig pd-left ${cut.left.length ? `cut-${cut.left.length}` : ''}`}>🪂<strong>Leo</strong></div><div className="pd-center"><button className="pd-roll" onClick={() => rolling ? stopRoll() : setRolling(true)} disabled={Boolean(modal)}>{rolling ? '✋ Stop the die' : `🎲 Roll for ${NAMES[current]}`}</button><button className="pd-mute" onClick={() => setMuted(value => !value)}>{muted ? '🔇' : '🔈'}</button><p aria-live="polite">{status}</p></div><div className={`pd-rig pd-right ${cut.right.length ? `cut-${cut.right.length}` : ''}`}>🪂<strong>Mia</strong></div></div>
    <div className="pd-ocean">🌊　 🦈　 🌊　 🐟　 🌊</div>
    {modal && <div className="pd-modal"><div><h2>{modal.title}</h2><p>{modal.text}</p><button className="pd-roll" onClick={restart}>🔄 Play again</button></div></div>}
  </div>;
}

const CSS = `
.parachute-drop{min-height:100%;height:100%;padding:18px;color:#0b2942;background:linear-gradient(#bfe9ff,#eaf9ff 62%,#168cc5);font-family:var(--font-body,sans-serif);overflow:hidden}.pd-hud{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center}.pd-hud>div{padding:12px 16px;border-radius:16px;background:#ffffffdd;box-shadow:0 8px 22px #0b29421c}.pd-hud>div:last-child{text-align:right}.pd-hud span,.pd-hud small{display:block;margin-top:4px}.pd-die{font-size:2rem!important;background:#fff!important;border-radius:50%!important;width:94px;height:94px;display:grid;place-items:center}.pd-stage{height:calc(100% - 180px);display:grid;grid-template-columns:1fr 220px 1fr;align-items:center;gap:14px}.pd-rig{text-align:center;font-size:clamp(5rem,13vw,10rem);filter:drop-shadow(0 14px 8px #0b294240);animation:pdfloat 2.7s ease-in-out infinite}.pd-rig strong{display:block;font-size:1rem}.pd-rig.cut-1{transform:rotate(-9deg) translateY(35px)}.pd-rig.cut-2{transform:rotate(-18deg) translateY(90px);opacity:.7}.pd-rig.cut-3{transform:translateY(220px) rotate(25deg);opacity:.15}.pd-right{animation-delay:-1.2s}.pd-center{text-align:center}.pd-roll,.pd-mute{border:0;border-radius:14px;padding:13px 18px;font-weight:800;cursor:pointer;background:linear-gradient(160deg,#3ddc84,#1f9d57);color:#06321a;box-shadow:0 8px 18px #1f9d5740}.pd-mute{display:block;margin:10px auto;background:#fff;color:#0b2942}.pd-center p{padding:12px;border-radius:14px;background:#ffffffdd;font-weight:700;line-height:1.4}.pd-ocean{height:55px;margin:0 -18px;padding-top:8px;text-align:center;font-size:1.8rem;background:#0a6e9e;color:#dff8ff}.pd-modal{position:fixed;inset:0;display:grid;place-items:center;padding:20px;background:#06142199;z-index:5}.pd-modal>div{max-width:380px;width:100%;padding:30px;text-align:center;border-radius:22px;background:#fff;box-shadow:0 22px 70px #0006}.pd-modal h2{margin:0 0 10px}.pd-modal p{margin:0 0 20px}@keyframes pdfloat{50%{transform:translateY(-12px)}}@media(max-width:700px){.pd-stage{grid-template-columns:1fr;height:calc(100% - 220px);gap:6px}.pd-rig{font-size:4.5rem}.pd-center{order:3}.pd-die{width:70px;height:70px;font-size:1.3rem!important}.pd-hud{gap:6px}.pd-hud>div{padding:8px;font-size:.8rem}}
`;
