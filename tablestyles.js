function loadTheDatabase(){

  window.onload = () => {

    var firstLoadingScreen = document.createElement("script");
    //----------
    firstLoadingScreen.innerHTML = `
    var blockTableOrCloseDiv = document.createElement("div");
    blockTableOrCloseDiv.classList.add('grey');
    blockTableOrCloseDiv.id = 'block-table';
    function buildLoadingRing(parent){
      var main = document.createElement("div");
      main.classList.add('lds-ring');
      main.id = "the-ring";
      var a = document.createElement("div");
      var b = document.createElement("div");
      var c = document.createElement("div");
      var d = document.createElement("div");
      main.appendChild(a);
      main.appendChild(b);
      main.appendChild(c);
      main.appendChild(d);
      parent.appendChild(main);
  };
  
  buildLoadingRing(blockTableOrCloseDiv);

  var funFacts = ["Hot water will turn into ice faster than cold water.", "The strongest muscle in the body is the tongue.", "Ant's take rest for around 8 Minutes in 12 hour period."];

  var theFunFact = document.createElement("div");
  theFunFact.style.textAlign = "center";
  theFunFact.style.width = "80%";
  theFunFact.style.position = "absolute";
  theFunFact.style.top = "60%";
  var theFunFactText = document.createElement("span");
  theFunFactText.innerText = 'Fun Fact: ';
  theFunFactText.classList.add("pink");
  theFunFactText.classList.add("font");
  theFunFact.appendChild(theFunFactText);

  var theActualFunFactText = document.createElement("span");
  theActualFunFactText.innerText = funFacts[Math.floor(Math.random() * (funFacts.length))];
  theActualFunFactText.classList.add("white");
  theActualFunFactText.classList.add("font");
  theFunFact.appendChild(theActualFunFactText);
  
  blockTableOrCloseDiv.appendChild(theFunFact);

  


  document.body.appendChild(blockTableOrCloseDiv);
    `
    document.body.appendChild(firstLoadingScreen);
    


    //------
    var databaseJS = document.createElement("script");
    databaseJS.innerHTML = `
    var config = {
    apiKey: "AIzaSyCpJRBleEomjGo1GMB8SG05lZTaxk8omDA",
    authDomain: "swiftie-7efa8.firebaseapp.com",
    databaseURL: "https://swiftie-7efa8-default-rtdb.firebaseio.com",
    projectId: "swiftie-7efa8",
    storageBucket: "swiftie-7efa8.appspot.com",
    messagingSenderId: "330956550409",
    appId: "1:330956550409:web:d20ac3926a74fe732563d8",
    measurementId: "G-LT21EZ7Z8R"
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

  var storageRef = firebase.storage().ref();`;
  var s = document.createElement('script');
  s.src = "/tablescript.js"

  document.body.appendChild(s);
  document.body.appendChild(databaseJS);
  

  }
}


function loadScripts(callback){
//google font variables
var preconnetGoogleAPI = document.createElement("link");
preconnetGoogleAPI.rel = 'preconnect';
preconnetGoogleAPI.href = 'https://fonts.googleapis.com';
var googleFontsGStatic = document.createElement("link");
googleFontsGStatic.setAttribute("rel", "preconnect");
googleFontsGStatic.href = "https://fonts.gstatic.com";
var googleInterFont = document.createElement("link");
googleInterFont.rel = "stylesheet";
googleInterFont.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap";
var googleHeeboFont = document.createElement("link");
googleHeeboFont.rel = "stylesheet";
googleHeeboFont.href = 'https://fonts.googleapis.com/css2?family=Heebo:wght@900&display=swap';
var fontAwesomeStyleSheet = document.createElement("script");
fontAwesomeStyleSheet.src = 'https://kit.fontawesome.com/46a9aec258.js';
var stripeApi = document.createElement("script");
stripeApi.src = 'https://js.stripe.com/v3/';



//swiftie stylesheet
var swiftieStlyes = document.createElement("link");
swiftieStlyes.rel = "stylesheet";
swiftieStlyes.type = "text/css";
swiftieStlyes.href = "/tablestyles.css";
//appending everything to head




var x = document.head;

x.appendChild(preconnetGoogleAPI);
x.appendChild(googleFontsGStatic);
x.appendChild(googleInterFont);
x.appendChild(googleHeeboFont);
x.appendChild(fontAwesomeStyleSheet);
x.appendChild(swiftieStlyes);
x.appendChild(stripeApi);


//callback (after this is all done)
callback();
};


loadScripts(loadTheDatabase);


