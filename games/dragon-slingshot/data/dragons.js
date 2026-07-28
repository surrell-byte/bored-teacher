export const DRAGONS = [
  { id: 'ember', name: 'Ember', emoji: '🐉', color: '#ff6030', ability: 'Fire Burst', description: 'Destroys nearby enemies.' },
  { id: 'frost', name: 'Frost', emoji: '❄️', color: '#44aaff', ability: 'Freeze Smash', description: 'Shatters every block.' },
  { id: 'storm', name: 'Storm', emoji: '⚡', color: '#aa66ff', ability: 'Chain Lightning', description: 'Zaps every enemy.' },
  { id: 'shadow', name: 'Shadow', emoji: '🌑', color: '#9944cc', ability: 'Ghost Phase', description: 'Doubles flight speed.' },
  { id: 'nature', name: 'Nature', emoji: '🌿', color: '#55cc22', ability: 'Vine Smash', description: 'Destroys three blocks and bounces.' },
];

export const dragonFor = id => DRAGONS.find(dragon => dragon.id === id) ?? DRAGONS[0];
