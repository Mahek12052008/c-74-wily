import firebase from 'firebase';

require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyD7a9zBKt7G6Qa8Xp8nFDfMu2CmPpd-xUw",
    authDomain: "wily-a110c.firebaseapp.com",
    projectId: "wily-a110c",
    storageBucket: "wily-a110c.appspot.com",
    messagingSenderId: "208761819130",
    appId: "1:208761819130:web:d8aa9d3ecb330ba41a9e43"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();