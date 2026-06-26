import React from 'react';
import { moneyText } from '../../utils/helpers';

interface LedgerProps {
  eyebrow: string;
  amountChange: number | null;
  actorName: string;
  message: string;
}

export function Ledger({ eyebrow, amountChange, actorName, message }: LedgerProps) {
  const showAmount = amountChange !== null;
  const sign = amountChange != null ? (amountChange > 0 ? '+' : amountChange < 0 ? '-' : '') : '';

  return (
    <div className="ledger" id="ledgerCard">
      <div className="ledger-rule" />
      <div className="ledger-eyebrow">{eyebrow}</div>
      {showAmount && (
        <div className="ledger-amount">
          {sign}{moneyText(Math.abs(amountChange as number))}
        </div>
      )}
      <div className="ledger-text">{message}</div>
      {showAmount && <div className="ledger-name">{actorName}</div>}
    </div>
  );
}
