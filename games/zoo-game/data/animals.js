export const CATEGORIES = {
  farm: {
    name: 'Farm',
    emoji: '🚜',
    animals: [
      { emoji: '🐄', name: 'cow' },
      { emoji: '🐖', name: 'pig' },
      { emoji: '🐑', name: 'sheep' },
      { emoji: '🐴', name: 'horse' },
      { emoji: '🐔', name: 'chicken' },
      { emoji: '🐐', name: 'goat' },
      { emoji: '🦆', name: 'duck' },
      { emoji: '🦃', name: 'turkey' },
      { emoji: '🐓', name: 'rooster' },
      { emoji: '🐰', name: 'rabbit' },
    ],
  },
  zoo: {
    name: 'Zoo',
    emoji: '🦁',
    animals: [
      { emoji: '🦁', name: 'lion' },
      { emoji: '🐯', name: 'tiger' },
      { emoji: '🐘', name: 'elephant' },
      { emoji: '🦒', name: 'giraffe' },
      { emoji: '🐵', name: 'monkey' },
      { emoji: '🦓', name: 'zebra' },
      { emoji: '🦍', name: 'gorilla' },
      { emoji: '🐼', name: 'panda' },
      { emoji: '🦘', name: 'kangaroo' },
      { emoji: '🦛', name: 'hippo' },
      { emoji: '🦏', name: 'rhino' },
      { emoji: '🐨', name: 'koala' },
    ],
  },
  sea: {
    name: 'Sea',
    emoji: '🐠',
    animals: [
      { emoji: '🐟', name: 'fish' },
      { emoji: '🦈', name: 'shark' },
      { emoji: '🐋', name: 'whale' },
      { emoji: '🐬', name: 'dolphin' },
      { emoji: '🐙', name: 'octopus' },
      { emoji: '🦀', name: 'crab' },
      { emoji: '🦞', name: 'lobster' },
      { emoji: '🦑', name: 'squid' },
      { emoji: '🦭', name: 'seal' },
      { emoji: '🐢', name: 'turtle' },
    ],
  },
};

export const MAX_ATTEMPTS = 3;
export const MODE_ORDER = ['guess', 'act', 'look'];
