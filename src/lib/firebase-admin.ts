import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app;
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    if (getApps().length === 0) {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        app = getApp();
    }
}

const auth = app ? getAuth(app) : null;

export { auth };
