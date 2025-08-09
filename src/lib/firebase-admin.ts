import admin from 'firebase-admin';

// This is a global cache for the initialized Firebase Admin app.
let app: admin.app.App;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    throw new Error('Firebase service account key is not defined. Please set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
  }

  try {
    const credentials = JSON.parse(serviceAccount);
    app = admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    return app;
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.message);
    throw new Error("Failed to initialize Firebase Admin SDK: " + error.message);
  }
}

function getAdminApp() {
  if (app) {
    return app;
  }
  return initializeAdmin();
}

export function getAdminDb() {
  return getAdminApp().firestore();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}
