// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGa03Vq5sUJmAopQ8J6HcNjU-WXAJ_Q7E",
  authDomain: "any-transparency.firebaseapp.com",
  projectId: "any-transparency",
  storageBucket: "any-transparency.firebasestorage.app",
  messagingSenderId: "973206847544",
  appId: "1:973206847544:web:c9dde85b34705533e9e6cd",
  measurementId: "G-PSH7MCFC9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);