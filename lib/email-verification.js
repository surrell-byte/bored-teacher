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
  const sender = process.env.GMAIL_USER?.trim().toLowerCase() || 'boredteacherapp@gmail.com';
  return sender === 'boredteacherapp@gmail.com' && Boolean(process.env.GMAIL_APP_PASSWORD?.trim());
}

module.exports = {
  getWelcomeGiftChoices,
  getAvatarGiftOptions,
  isEmailDeliveryConfigured,
};
