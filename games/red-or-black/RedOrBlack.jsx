import RoundChallenge from '@/games/shared/RoundChallenge';

export default function RedOrBlack(props) {
  return <RoundChallenge {...props} title="Red or Black" icon="🎴" prompt="Call the colour before the card flips." variant="red-black" />;
}
