import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
// If you're importing the same 'app' from signup.js, make sure it’s a properly exported Firebase config
import { app } from "/signup.js";

// Listen for changes to the user's authentication state
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    console.log("User logged in:", user.uid);
    // Optionally redirect to a “profile” or “home” page, or show user’s name, etc.
    // window.location.href = 'profile.html';
  } else {
    // User is logged out
    console.log("No user logged in");
  }
});

// 1. Grab the login form
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 2. Get email and password from form
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // 3. Log in with Firebase Auth
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        console.log("Successfully logged in:", userCredential.user);

        // Optionally redirect after login
        window.location.href = 'home.html'; // or stats page, etc.
      })
      .catch((error) => {
        console.error("Error logging in:", error.code, error.message);
        alert("Login failed. " + error.message);
      });
  });
}
