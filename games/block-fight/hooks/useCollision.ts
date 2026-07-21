import { intersects } from '../systems/collisions';
import { type GameState, type GameUi } from '../systems/types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

export function updateCollectibles(state: GameState, setUi: UiSetter) {
  const player = state.player;

  state.coins.forEach(coin => {
    if (!coin.collected && intersects(player, { x: coin.x, y: coin.y, w: 16, h: 16 })) {
      coin.collected = true;
      state.score += 10;
      setUi(ui => ({ ...ui, score: state.score }));
    }
  });
}
