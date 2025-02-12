// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD36qSJ8YAPc3A4FL9jlBGlpiWwj530SPQ",
  authDomain: "guessthesinger10.firebaseapp.com",
  databaseURL: "https://guessthesinger10-default-rtdb.firebaseio.com",
  projectId: "guessthesinger10",
  storageBucket: "guessthesinger10.firebasestorage.app",
  messagingSenderId: "97201023235",
  appId: "1:97201023235:web:ab111d9acb43ef7d4be136",
  measurementId: "G-3R005HTKEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle login form submission
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent page reload

  // Retrieve form values
  const email = document.getElementById('newEmail').value;
  const password = document.getElementById('newPassword').value;

  // Sign in the user
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Save the user's UID to local storage
      localStorage.setItem("userId", user.uid);
      console.log("User logged in with UID:", user.uid);
      // Redirect to the play page
      window.location.href = 'HISTORY/day74.html';
    })
    .catch((error) => {
      console.error('Login error:', error.code, error.message);
      alert(`Login failed: ${error.message}`);
    });
});
