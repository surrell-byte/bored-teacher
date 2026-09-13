import RoundChallenge from '@/games/shared/RoundChallenge';

export default function TreasureChest(props) {
  return <RoundChallenge {...props} title="Treasure Chest Showdown" icon="🏴‍☠️" prompt="Roll the dice and race to the hidden treasure." variant="race" />;
}
