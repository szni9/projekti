import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBz_MCaaJxlv7830c10hnLv1TahZO7hPXk",
  authDomain: "fgscoretracker.firebaseapp.com",
  projectId: "fgscoretracker",
  storageBucket: "fgscoretracker.firebasestorage.app",
  messagingSenderId: "642886002191",
  appId: "1:642886002191:web:79674863255a745d62657a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
