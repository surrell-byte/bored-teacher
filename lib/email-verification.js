function getWelcomeGiftChoices() {
  return ['avatar-astronaut', 'avatar-dragon', 'avatar-unicorn'];
}

function getAvatarGiftOptions() {
  return [
    { id: 'avatar-astronaut', name: 'Astro Explorer', emoji: '🧑‍🚀' },
    { id: 'avatar-dragon', name: 'Sky Dragon', emoji: '🐉' },
    { id: 'avatar-unicorn', name: 'Rainbow Unicorn', emoji: '🦄' },
  ];
}

function isEmailDeliveryConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

module.exports = {
  getWelcomeGiftChoices,
  getAvatarGiftOptions,
  isEmailDeliveryConfigured,
};
