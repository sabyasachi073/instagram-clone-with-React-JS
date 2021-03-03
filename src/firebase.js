import firebase from "firebase";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyBCWrrcoe1v_VXSMl7rW6rpSB6REvpJCpc",
  authDomain: "instagram-clone-56afa.firebaseapp.com",
  projectId: "instagram-clone-56afa",
  storageBucket: "instagram-clone-56afa.appspot.com",
  messagingSenderId: "317699933828",
  appId: "1:317699933828:web:e14bcc3ceaf76c17a6e4d1",
  measurementId: "G-BXYFY38TYM",
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };


