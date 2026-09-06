import fs from 'node:fs';
import path from 'node:path';

const localEnvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(localEnvPath)) {
  for (const line of fs.readFileSync(localEnvPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missing = required.filter((key) => {
  const value = process.env[key]?.trim();
  return !value || value.includes('your-') || value.includes('replace-me');
});

if (missing.length) {
  console.error(`Missing Firebase environment variables: ${missing.join(', ')}`);
  console.error('Configure the environment for this deployment and restart the Next.js server.');
  process.exit(1);
}

console.log(`Firebase environment validated for project ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.`);
