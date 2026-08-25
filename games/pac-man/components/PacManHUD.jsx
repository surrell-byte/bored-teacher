export function PacManHUD({ score, lives }) {
  return <header className="pacman-hud"><span>⭐ {score}</span><strong>PAC-MAN</strong><span>{Array.from({ length: 3 }, (_, index) => index < lives ? '💛' : '🖤').join('')}</span></header>;
}
