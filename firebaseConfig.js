// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDS-4uTHhmxGQlhjkn3s3iZw6ainDhrbkg",
  authDomain: "backend-produtos-40849.firebaseapp.com",
  projectId: "backend-produtos-40849",
  storageBucket: "backend-produtos-40849.firebasestorage.app",
  messagingSenderId: "329062044742",
  appId: "1:329062044742:web:867a25498d0c71a62de647",
  measurementId: "G-VBM0BHMNM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
