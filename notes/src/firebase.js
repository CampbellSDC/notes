
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC4L2LNy74ox3C3fK8cPoqrwizIIye4_HY",
  authDomain: "notes-5b74e.firebaseapp.com",
  projectId: "notes-5b74e",
  storageBucket: "notes-5b74e.appspot.com",
  messagingSenderId: "532646252793",
  appId: "1:532646252793:web:4bf826976058501497d228"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
export const notesCollection = collection(db, "notes")