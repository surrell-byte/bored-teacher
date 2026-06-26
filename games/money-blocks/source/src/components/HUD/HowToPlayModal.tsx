import React from 'react';
import { Modal } from '../Common/Modal';

const ROWS: { type: string; icon: string; name: string; desc: string }[] = [
  { type: 'green', icon: '💵', name: 'Green — Gain', desc: 'Bank a cash windfall of $25K–$150K. A hidden multiplier may double or triple the amount.' },
  { type: 'red', icon: '💸', name: 'Red — Loss', desc: 'Suffer a setback of $25K–$100K, with a chance the multiplier magnifies the hit.' },
  { type: 'blue', icon: '🥷', name: 'Blue — Raid', desc: "Steal $25K–$100K directly from your opponent's account. Blocked if they hold a Guard." },
  { type: 'yellow', icon: '💎', name: 'Yellow — Wild', desc: 'Draw a wild reward — $250K, $500K, or double your entire holdings instantly.' },
  { type: 'purple', icon: '🛡️', name: 'Purple — Guard', desc: "Raise a shield. Your next Raid from the opponent is automatically deflected." },
  { type: 'black', icon: '🎲', name: 'Black — Wild Card', desc: 'Spin the wheel: Jackpot (+$300K), Inheritance (+$500K), Swap (exchange balances), Encore (extra turn), Audit (-$200K), Robbery (-$150K), or Bankrupt (halved).' },
];

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="htp-header">
        <div>
          <div className="htp-eyebrow">Private Table</div>
          <h2 className="htp-title">How to Play</h2>
        </div>
        <button className="htp-close" onClick={onClose}>✕</button>
      </div>
      <div className="htp-rule" />
      <div className="htp-body">
        <p className="htp-intro">
          Two players take turns picking hidden tiles from the board. Each tile conceals a
          coloured block — and every colour triggers a different event. First to reach{' '}
          <strong>$1,000,000</strong> wins. If the board empties first, the richer player takes
          the table.
        </p>
        <div className="htp-rule htp-rule-sm" />
        <div className="htp-grid">
          {ROWS.map((row) => (
            <div className="htp-row" key={row.type}>
              <span className={`htp-icon type-${row.type}`}>{row.icon}</span>
              <div>
                <div className="htp-block-name">{row.name}</div>
                <div className="htp-block-desc">{row.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="htp-rule htp-rule-sm" />
        <div className="htp-tips">
          <div className="htp-tip">🔠 Each tile shows a letter A–Z. The letter is a mystery — it gives no clue about the colour hidden beneath.</div>
          <div className="htp-tip">⚡ A hidden multiplier (×2 or ×3) lurks behind some tiles — revealed only after you click.</div>
          <div className="htp-tip">🌈 One tile is Rainbow — a special Black wild card with animated colour.</div>
        </div>
      </div>
      <button className="htp-start" onClick={onClose}>Got It — Let's Play</button>
    </Modal>
  );
}
