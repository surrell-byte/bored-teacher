import RoundChallenge from '@/games/shared/RoundChallenge';

export default function SuperWings(props) {
  return <RoundChallenge {...props} title="Super Wings Races" icon="✈️" prompt="Roll the dice and race your plane across the sky." variant="race" />;
}
