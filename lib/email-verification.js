const VERIFICATION_WINDOW_MS = 48 * 60 * 60 * 1000;

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isVerificationExpired(sentAtMs) {
  const parsed = typeof sentAtMs === 'number' ? sentAtMs : typeof sentAtMs === 'string' ? Number(sentAtMs) : 0;
  if (!parsed || Number.isNaN(parsed)) return true;
  return Date.now() - parsed > VERIFICATION_WINDOW_MS;
}

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
  VERIFICATION_WINDOW_MS,
  generateVerificationCode,
  isVerificationExpired,
  getWelcomeGiftChoices,
  getAvatarGiftOptions,
  isEmailDeliveryConfigured,
};
