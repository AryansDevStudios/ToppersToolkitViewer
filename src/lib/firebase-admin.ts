'use server';
import * as admin from 'firebase-admin';
import 'dotenv/config';
import type {Auth} from 'firebase-admin/auth';
import type {Firestore} from 'firebase-admin/firestore';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (e: any) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string. Error: ' + e.message);
  }

  // This check is crucial for some environments that mishandle newline characters.
  if (serviceAccount.private_key && !serviceAccount.private_key.includes('\n')) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const app = initializeFirebaseAdmin();
const auth: Auth = app.auth();
const db: Firestore = app.firestore();

export { auth, db };
