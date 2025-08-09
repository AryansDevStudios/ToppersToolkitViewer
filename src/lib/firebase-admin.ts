import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';

// This is a robust singleton pattern for Firebase Admin initialization in a Next.js environment.
// It ensures that the app is initialized only once per server instance.
let app: App;

if (!admin.apps.length) {
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be correctly formatted. The replace function handles the newline characters.
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    // Throwing the error is important to know that something is critically wrong.
    throw error;
  }
} else {
  app = admin.app();
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
