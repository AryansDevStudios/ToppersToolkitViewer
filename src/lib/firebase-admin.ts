'use server';
import * as admin from 'firebase-admin';
import 'dotenv/config';

if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (e: any) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string. Error: ' + e.message);
  }

  // Replace escaped newlines
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Failed to initialize Firebase Admin SDK: ' + error.message);
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
