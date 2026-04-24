// Import the functions you need from the SDKs you need
import firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuPkOTVxrhgia9hQVRbPDDt5o9H3VQJDE",
  authDomain: "meuapptreino-ddf7e.firebaseapp.com",
  projectId: "meuapptreino-ddf7e",
  storageBucket: "meuapptreino-ddf7e.firebasestorage.app",
  messagingSenderId: "1670211541",
  appId: "1:1670211541:web:d0a855274f1f46be553f5c",
  measurementId: "G-16RDWHR8YE"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;