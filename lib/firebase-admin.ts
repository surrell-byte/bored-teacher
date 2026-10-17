import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const ADMIN_APP_NAME = 'bored-teacher-server';

function getAdminApp() {
  const existing = getApps().find(app => app.name === ADMIN_APP_NAME);
  if (existing) return existing;

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is not configured.');
  }

  let serviceAccount: unknown;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON must contain valid JSON.');
  }

  if (
    typeof serviceAccount !== 'object'
    || serviceAccount === null
    || !('project_id' in serviceAccount)
    || typeof serviceAccount.project_id !== 'string'
    || !('client_email' in serviceAccount)
    || typeof serviceAccount.client_email !== 'string'
    || !('private_key' in serviceAccount)
    || typeof serviceAccount.private_key !== 'string'
  ) {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is missing required service-account fields.');
  }

  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (clientProjectId && serviceAccount.project_id !== clientProjectId) {
    throw new Error('The Firebase Admin service account must belong to the configured Firebase project.');
  }

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    projectId: serviceAccount.project_id,
  }, ADMIN_APP_NAME);
}

export function getFirebaseAdminServices() {
  const app = getAdminApp();
  return { auth: getAuth(app), firestore: getFirestore(app) };
}
