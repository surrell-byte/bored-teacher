export default function GameHud({ hud }) {
  return <div className="dragon-sling-hud"><span>Score <b>{hud.score}</b></span><span>Level <b>{hud.level}</b></span><span>Dragons <b>{hud.dragons}</b></span><span className="dragon-sling-ability">✦ {hud.ability}</span></div>;
}
