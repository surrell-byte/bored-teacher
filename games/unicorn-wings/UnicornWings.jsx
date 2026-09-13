import RoundChallenge from '@/games/shared/RoundChallenge';

export default function UnicornWings(props) {
  return <RoundChallenge {...props} title="Unicorn Wing Races" icon="🦄" prompt="Roll the dice and race your unicorn home." variant="race" />;
}
