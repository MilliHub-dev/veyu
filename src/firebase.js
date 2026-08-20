import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'];

/** Firebase here only powers Google sign-in, so the rest of auth must work without it. */
export const isFirebaseConfigured = REQUIRED_KEYS.every((key) => Boolean(firebaseConfig[key]));

let auth = null;

if (isFirebaseConfigured) {
  try {
    // Reuse the existing app when one is already registered, otherwise a hot
    // reload re-runs this module and Firebase throws on duplicate init.
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
    auth = firebase.auth(app);
  } catch (error) {
    // firebase.auth() throws synchronously on a bad key. Login and Signup import
    // this module at the top level, so letting it escape unmounts the whole page.
    console.error('Firebase auth is unavailable — Google sign-in is disabled.', error);
    auth = null;
  }
} else if (import.meta.env.DEV) {
  console.warn(
    '[firebase] VITE_FIREBASE_* env vars are missing, so Google sign-in is disabled. ' +
    'Copy .env.example to .env and fill in your Firebase web app config to enable it. ' +
    'Email/password sign-in is unaffected.'
  );
}

export { auth };
