// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Your web app's Firebase configuration
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
const auth = getAuth(app);  // Firebase Authentication
const database = getDatabase(app); // Firebase Realtime Database

document.getElementById('signupForm').addEventListener('submit', submitForm);

function submitForm(e) {
  e.preventDefault();  // Prevent page reload on form submission

  // Get form values
  var newUsername = getElementVal('newUsername');
  var newEmail = getElementVal('newEmail');
  var newPassword = getElementVal('newPassword');

  // Create the user in Firebase Authentication
  createUserWithEmailAndPassword(auth, newEmail, newPassword)
    .then((userCredential) => {
      // Successfully created user
      const user = userCredential.user;
      console.log('User created: ', user);

      // Optionally, save username in the Realtime Database (you could also do this using Firestore)
      saveUserInfo(newUsername, newEmail, user.uid);

      // Redirect to login or another page after successful sign-up
      window.location.href = 'login.html'; // Redirect to the login page
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error: ${errorCode}, ${errorMessage}`);
      
      // Display the error message to the user
      alert(`Error: ${errorMessage}`);
    });
}

// Function to save username and email in Realtime Database
const saveUserInfo = (newUsername, newEmail, userId) => {
  // Reference to the path in the database where the user info will be saved
  const userRef = ref(database, 'signupForm/' + userId);
  
  // Set the data
  set(userRef, {
    newUsername: newUsername,
    newEmail: newEmail,
    userId: userId
  });
}

// Helper function to get form element values
const getElementVal = (id) => {
  return document.getElementById(id).value;
}
