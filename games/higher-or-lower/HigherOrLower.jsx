import RoundChallenge from '@/games/shared/RoundChallenge';

export default function HigherOrLower(props) {
  return <RoundChallenge {...props} title="Higher or Lower" icon="🃏" prompt="Will the next card be higher or lower?" variant="higher-lower" />;
}
