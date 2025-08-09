import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      if (!error.message.includes('Must be called from a server')) {
        console.error('Firebase admin initialization error', error.stack);
      }
      throw error; // Re-throw the error to stop execution if initialization fails
    }
  }
  db = admin.firestore();
}

export const getAdminDb = () => {
  if (!db) {
    initializeAdmin();
  }
  return db;
};
