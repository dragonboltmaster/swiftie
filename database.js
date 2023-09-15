

 //configure firebase 
 var config = {
  apiKey: "AIzaSyDGg2VpIt8SFI5HkZfs35b4CRZ1qv7ArXY",
  authDomain: "swiftie-e973c.firebaseapp.com",
  databaseURL: "https://swiftie-e973c-default-rtdb.firebaseio.com",
  projectId: "swiftie-e973c",
  storageBucket: "swiftie-e973c.appspot.com",
  messagingSenderId: "303591026077",
  appId: "1:303591026077:web:2fc0c2bd3c0fedf9515374",
  measurementId: "G-7WDXF909V5"
  };

 
 // Initialize Firebase

 firebase.initializeApp(config);
  firebase.analytics();
 //const analytics = getAnalytics(app);
  var database = firebase.database();
  var auth = firebase.auth();
  var db = firebase.firestore();
  db.settings({ timestampsInSnapshots: true, merge: true });
  
  //-----------------------------------

  var storageRef = firebase.storage().ref();





  


  

//NOTES FOR FB USE BELOW
/*
  loginBttnAdmin.addEventListener('click', e =>{
    var email = userAdmin.value;
    var pass = passAdmin.value;
    auth.signInWithEmailAndPassword(email,pass);
  });

  //sign out user with button 
  logOutAdminBttn.addEventListener('click', e => {
    firebase.auth().signOut();

  });
  

  auth.onAuthStateChanged (firebaseUser => {
    if(firebaseUser){
    logOutAdminBttn.classList.remove("hidden");
    adminLoginForm.classList.add("hidden");
    console.log(firebaseUser);


    } else{
      logOutAdminBttn.classList.add("hidden");
      adminLoginForm.classList.remove("hidden");

    }


  });
*/