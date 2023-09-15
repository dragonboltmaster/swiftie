//building the html
//building the blocked table div 
//creating the loading/ blocked table page


var stripe = Stripe('pk_test_51KT7E3HhXiMKCte98eBwpKKOPosTHRIV34uPN0O8Lz3zYJvo5Ieyvd7WYp4REbJA9W6oDrSwf3HRTsdsinnnAXmn00MLwV3z9K', {
    apiVersion: "2020-08-27",
  });

const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        var tableNumber = urlParams.get('param1');
        var restaurantId = urlParams.get('param2');
        var tableId = urlParams.get('param3');
        var resEmail = urlParams.get('param4');
        

var theTaxRate;
var restaurantClientID
var commissionPercent = 0.02; //COMMISION 
var maxCommision = 0.30; //MAXIMUM 
var comish;
var totalCost = 0; 
var payableTotal

const FIREBASE_FUNCTION = 'https://us-central1-swiftie-7efa8.cloudfunctions.net/charge'

var nonTaxTotal = 0;
var theTipValue = {
    type: null, // can either be 'percent' or 'value'
    amount: null 
};

var prButton


  


  db.collection('users').doc(resEmail).onSnapshot((snapshot) => {
    theTaxRate = parseInt(snapshot.data().taxPercentage)/100;
    restaurantClientID = snapshot.data().clientID;
  })

  document.addEventListener('focusout', function(e){
      window.scrollTo(0,0);
  })

  //checks when the window is resized
  window.addEventListener('resize', function(){
    window.scrollTo(0,0);

  });

  //stripe payment request
var paymentRequest = stripe.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: {
      label: 'Total',
      amount: 1000,
    },
    requestPayerName: false,
    requestPayerEmail: false,
  });

  function updatePR(){
    var thyTotal
    if (theTipValue.type === 'percent'){
        thyTotal = Math.round((((nonTaxTotal * (1 + theTaxRate)) * (1 + theTipValue.amount)) + (comish)) * 100)
    }else if (theTipValue.type === 'value'){
        thyTotal = Math.round((((nonTaxTotal * (1 + theTaxRate)) + (theTipValue.amount)) + (comish)) * 100)
    }else{
        thyTotal = Math.round(((nonTaxTotal * (1 + theTaxRate)) + (comish)) * 100)
    }
    console.log(thyTotal);
    payableTotal = thyTotal;
    if (thyTotal === 0 || isNaN(thyTotal)){
        document.getElementById('PaymentDiv').style.display = 'none';
    }else{
        document.getElementById('PaymentDiv').style.display = 'block';
        paymentRequest.update({
            total: {
              label: 'Checkout',
              amount: thyTotal,
            },
        });
    }

  }

//builds blocked text
var blockedTheText = document.createElement("p");
blockedTheText.classList.add('font');
blockedTheText.classList.add('white');
blockedTheText.classList.add('block-table-font');
//builds loading screen
//bottom checkout 
var bottomCheckoutDiv = document.createElement("div");
bottomCheckoutDiv.id = "checkout-bottom-tab";
bottomCheckoutDiv.classList.add('checkout-unselected');

//stores the tip or percentage;

function payFail(){
    alert('Payment Unsuccessful, Please Try Again');
};


   function paySuccess(chargeID){//if payment is successful
    var main = document.createElement('div');
    main.style.backgroundColor = 'rgb(53, 53, 53)';
    main.style.position = 'absolute';
    main.style.width = '100%';
    main.style.height = '100%';
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.alignItems = 'center';
    main.style.justifyContent = 'center';
    main.style.zIndex = '16';
     buildLoadingRing(main);
     var firstText = document.createElement('p');
     firstText.classList.add('white');
     firstText.classList.add('font');
     firstText.innerText = 'Placing your order...';
     firstText.style.marginTop = '50%';
     main.appendChild(firstText);
     document.body.appendChild(main);


    
    var orderArray = [];
    for(var i = 0; i < document.getElementById('cart-list-div').childNodes.length; i++){
        var itemObj = {};
        var topping = [];
        if(document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[0].innerText != ''){// if there is no image
            itemObj.name = document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[0].innerText;
                if(document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].innerText != ''){ //if toppings exist
                    for(var j = 0; j < document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].childNodes.length; j++){
                        console.log(document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].childNodes[j].innerText)
                        topping.push(document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].childNodes[j].innerText);
                    }
                }
        }else{// if there is an image
            itemObj.name = document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].childNodes[0].innerText;
            if(document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].childNodes[1].innerText != ''){//if toppings 
                for(var j=0; j < document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes.length; j++){//appends toppings
                    topping.push(document.getElementById('cart-list-div').childNodes[i].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[j].innerText);
                }
            }
        }
        itemObj.toppings = topping;
        orderArray.push(itemObj);
    }
    
   
    if (theTipValue.type == 'percent'){
        newBalance = ((1 + theTipValue.amount) * ((1 + theTaxRate) * nonTaxTotal)); 
    }else if(theTipValue.type == 'value' && theTipValue.type != 0){
        newBalance = ((theTipValue.amount) + ((1 + theTaxRate) * nonTaxTotal));
    }else{
        newBalance = ((theTipValue.amount) + ((1 + theTaxRate) * nonTaxTotal));
    }
    

    db.collection('orders').add({
     costMake: totalCost,
     revenue: nonTaxTotal,
     salesTax: Math.round((nonTaxTotal * theTaxRate)*100)/100,
     table: tableNumber,
     for: restaurantId,
     chargeId: chargeID,
     type: "active",
     time: new Date(),
     order: orderArray
    }).then(()=>{
        db.collection('users/'+ resEmail + '/finance').where('active', '==', true).get().then((querySnapshot)=>{
            querySnapshot.docs.forEach((doc)=>{
                db.collection('users/'+ resEmail + '/finance').doc(doc.id).update({
                    revenue: firebase.firestore.FieldValue.increment(nonTaxTotal),
                    cost: firebase.firestore.FieldValue.increment(totalCost),
                    salesTax: firebase.firestore.FieldValue.increment(Math.round((nonTaxTotal * theTaxRate)* 100)/100),
                    profit: firebase.firestore.FieldValue.increment(Math.round((((nonTaxTotal * .971)-.3)- totalCost)*100)/100),
                }).then(()=>{
                    if(theTipValue.type == 'percent'){
                        db.collection('users/'+ resEmail + '/waiterRequest').add({
                            amount: parseInt(((theTipValue.amount) * ((1 + theTaxRate) * nonTaxTotal)).toFixed(2)),
                            tableNumber: tableNumber,
                            time: new Date(),
                            tip: true
                        })
                    }else if(theTipValue.type == 'value' && theTipValue.type != 0){
                        db.collection('users/'+ resEmail + '/waiterRequest').add({
                            amount: parseInt(theTipValue.amount.toFixed(2)),
                            tableNumber: tableNumber,
                            time: new Date(),
                            tip: true
                        })
                    }
                   
                })
            })
            main.innerHTML = "";
    main.innerHTML = `<div class="wrapper"> <svg class="animated-check" viewBox="0 0 24 24">
    <path d="M4.1 12.7L9 17.6 20.3 6.3" fill="none" /> </svg>
</div>`
    var firstTextAfter = document.createElement('p');
    firstTextAfter.style.marginTop = "40%";
    firstTextAfter.innerText = 'Thank you for ordering! Your order will be brought to your table shortly.';
    firstTextAfter.classList.add('font');
    firstTextAfter.classList.add('white');
    firstTextAfter.style.textAlign = 'center';
    firstTextAfter.style.width = '80%';
    var poweredBy = document.createElement('p');
    poweredBy.innerText = 'Powered by: ';
    poweredBy.classList.add('white');
    poweredBy.classList.add('font');
    var poweredBySwift = document.createElement('span');
    poweredBySwift.innerText = 'Swifie';
    poweredBySwift.classList.add('pink');
    poweredBySwift.classList.add('font');
    poweredBySwift.addEventListener('click', function(){
        location.href = '/index.html';
    })
    var orderAgainBttn = document.createElement('p');
    orderAgainBttn.innerText = 'Order Again';
    orderAgainBttn.classList.add('font');
    orderAgainBttn.classList.add('pink');
    orderAgainBttn.style.backgroundColor = 'white';
    orderAgainBttn.style.borderRadius = '20px';
    orderAgainBttn.style.fontSize = '150%';
    orderAgainBttn.style.padding = '3%';
    orderAgainBttn.addEventListener('click', function(){
        location.reload();
    })

    poweredBy.appendChild(poweredBySwift);
    main.appendChild(firstTextAfter);
    main.appendChild(poweredBy);
    main.appendChild(orderAgainBttn);


        })



    })
   };

   



function showTipBox(){
    var back = document.createElement('div');
    back.style.width = "100%";
    back.style.height = "100%";
    back.style.position = "absolute";
    back.style.backgroundColor = 'rgb(53, 53, 53, 0.9)';
    back.style.zIndex = '9';
    back.style.display = 'flex';
    back.style.justifyContent = 'center';
    back.style.alignItems = 'center';

    var main = document.createElement('div');
    main.style.width = "93%";
    main.style.height = "80%";
    main.style.backgroundColor = 'rgb(53, 53, 53)';
    main.style.borderRadius = '25px';
    main.style.borderStyle = 'solid';
    main.style.borderWidth = '4px';
    main.style.borderColor = 'rgb(248, 46, 255)';
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.justifyContent = 'space-evenly';

    var exitOutIcon = document.createElement('i');
    exitOutIcon.classList.add('fas');
    exitOutIcon.classList.add('fa-times');
    exitOutIcon.classList.add('fa-3x');
    exitOutIcon.classList.add('pink');
    exitOutIcon.style.position = 'absolute';
    exitOutIcon.style.top = '12%';
    exitOutIcon.style.left = '10%';
    exitOutIcon.addEventListener('click', function(){
        back.remove();
    })

    var pinkAnAmount = document.createElement('div');
    pinkAnAmount.innerText = 'Pick an Amount:';
    pinkAnAmount.style.fontSize = '150%';
    pinkAnAmount.style.textAlign = 'center';
    pinkAnAmount.classList.add('white');
    pinkAnAmount.classList.add('font');

    var percentagesDiv = document.createElement('div');
    percentagesDiv.style.display = 'flex';
    percentagesDiv.style.justifyContent = 'space-evenly';
    percentagesDiv.style.alignItems = 'center';

    function attachPercentages(){
        var fifteenPercent = document.createElement('div');
    fifteenPercent.innerText = '15%';
    fifteenPercent.classList.add('font');
    fifteenPercent.classList.add('pink');
    fifteenPercent.style.fontSize = '300%';
    fifteenPercent.style.padding = '3%';
    fifteenPercent.style.borderRadius = '100%';
    fifteenPercent.style.borderStyle = 'solid';
    fifteenPercent.style.borderWidth = '2px';
    fifteenPercent.style.borderColor = 'white';
    fifteenPercent.addEventListener('click', function(){
        theTipValue.type = 'percent';
            theTipValue.amount = 0.15;
            if((nonTaxTotal * commissionPercent) < maxCommision){
                comish = (nonTaxTotal * commissionPercent);
            }else{
                comish = maxCommision;
            }
            document.getElementById('the-tip-amount').innerText = '(15%) $' + (((nonTaxTotal) * (1+ theTaxRate)) * (theTipValue.amount)).toFixed(2);
            document.getElementById('the-actual-total').innerText = '$' + ((((nonTaxTotal) * (1+ theTaxRate)) * (1+ theTipValue.amount)) + (comish)).toFixed(2);
        back.remove();
        updatePR();
    })
    percentagesDiv.appendChild(fifteenPercent);


    var twentyPercent = document.createElement('div');
    twentyPercent.innerText = '20%';
    twentyPercent.classList.add('font');
    twentyPercent.classList.add('pink');
    twentyPercent.style.fontSize = '300%';
    twentyPercent.style.padding = '3%';
    twentyPercent.style.borderRadius = '100%';
    twentyPercent.style.borderStyle = 'solid';
    twentyPercent.style.borderWidth = '2px';
    twentyPercent.style.borderColor = 'white';
    twentyPercent.addEventListener('click', function(){
            theTipValue.type = 'percent';
            theTipValue.amount = 0.20;
            if((nonTaxTotal * commissionPercent) < maxCommision){
                comish = (nonTaxTotal * commissionPercent);
            }else{
                comish = maxCommision;
            }
            document.getElementById('the-tip-amount').innerText = '(20%) $' + (((nonTaxTotal) * (1+ theTaxRate)) * (theTipValue.amount)).toFixed(2);
            document.getElementById('the-actual-total').innerText = '$' + ((((nonTaxTotal) * (1+ theTaxRate)) * (1+ theTipValue.amount)) + (comish)).toFixed(2);
        back.remove();
        updatePR();
    })
    percentagesDiv.appendChild(twentyPercent);

    var twentyFivePercent = document.createElement('div');
    twentyFivePercent.innerText = '25%';
    twentyFivePercent.classList.add('font');
    twentyFivePercent.classList.add('pink');
    twentyFivePercent.style.fontSize = '300%';
    twentyFivePercent.style.padding = '3%';
    twentyFivePercent.style.borderRadius = '100%';
    twentyFivePercent.style.borderStyle = 'solid';
    twentyFivePercent.style.borderWidth = '2px';
    twentyFivePercent.style.borderColor = 'white';
    twentyFivePercent.addEventListener('click', function(){
        theTipValue.type = 'percent';
            theTipValue.amount = 0.25;
            if((nonTaxTotal * commissionPercent) < maxCommision){
                comish = (nonTaxTotal * commissionPercent);
            }else{
                comish = maxCommision;
            }
            document.getElementById('the-tip-amount').innerText = '(25%) $' + (((nonTaxTotal) * (1+ theTaxRate)) * (theTipValue.amount)).toFixed(2);
            document.getElementById('the-actual-total').innerText = '$' + ((((nonTaxTotal) * (1+ theTaxRate)) * (1+ theTipValue.amount)) + (comish)).toFixed(2);
        back.remove();
        updatePR();
    })
    percentagesDiv.appendChild(twentyFivePercent);
    };
    
    attachPercentages();



    var orText = document.createElement('div');
    orText.innerText = 'or';
    orText.style.fontSize = '150%';
    orText.style.textAlign = 'center';
    orText.classList.add('white');
    orText.classList.add('font');
    orText.addEventListener('click', function(){
            theTipValue.type = 'value';
            theTipValue.amount = parseInt(document.getElementById('tip-amount').value);
            if((nonTaxTotal * commissionPercent) < maxCommision){
                comish = (nonTaxTotal * commissionPercent);
            }else{
                comish = maxCommision;
            }
            document.getElementById('the-actual-total').innerText = '$' + ((((nonTaxTotal) * (1+ theTaxRate)) + (theTipValue.amount)) + (comish)).toFixed(2);
            document.getElementById('the-tip-amount').innerText = '$' + theTipValue.amount.toFixed(2);
        back.remove();
        updatePR();
    })


    var customAmountButton = document.createElement('div');
    customAmountButton.innerText = 'Custom Amount';
    customAmountButton.style.fontSize = '150%';
    customAmountButton.classList.add('pink');
    customAmountButton.classList.add('font');
    customAmountButton.style.textDecoration = 'underline';
    customAmountButton.style.textAlign = 'center';
    customAmountButton.addEventListener('click', function(){
        if(customAmountButton.innerText == 'Custom Amount'){
            percentagesDiv.innerHTML = `<div class="form__group field new-item-input">
            <input type="number" class="form__field" placeholder="Amount(USD)" id="tip-amount" required/>
            <label for="tip-amount" class="form__label">Amount(USD)</label>
          </div>`;
          orText.innerText = 'Submit';
          customAmountButton.innerText = 'Enter Percentage';
          pinkAnAmount.innerText = 'Enter an Amount:';
        }else{
            percentagesDiv.innerHTML = "";
            attachPercentages();
            orText.innerText = 'or';
            customAmountButton.innerText = 'Custom Amount';
            pinkAnAmount.innerText = 'Pick an Amount:';
        }
       
    })

    main.appendChild(exitOutIcon);
    main.appendChild(pinkAnAmount);
    main.appendChild(percentagesDiv);
    main.appendChild(orText);
    main.appendChild(customAmountButton);
    back.appendChild(main);
    document.body.appendChild(back);
}


var cartListDiv = document.createElement("div");//append all the cart items here
cartListDiv.id = "cart-list-div";

var tipAndPaymentDiv = document.createElement("div");//everything below the cart
tipAndPaymentDiv.style.width = "100%";
tipAndPaymentDiv.style.height = "30%";

var tipDiv = document.createElement("div");//the tip box
tipDiv.style.height = "50%";
var actualTipDiv = document.createElement("div");//stores the tip
actualTipDiv.style.height = "50%";
actualTipDiv.style.display = 'flex';
actualTipDiv.style.alignItems = "center";
actualTipDiv.style.justifyContent = 'space-around';
var addATipText = document.createElement("div");//Tip:
addATipText.innerText = "Tip:";
addATipText.classList.add('white');
addATipText.classList.add('font');
addATipText.style.fontSize = '150%';
var theTipAmount = document.createElement("div");// button for tip
theTipAmount.id = 'the-tip-amount';
theTipAmount.style.fontSize = '150%';
theTipAmount.innerText = 'Add a Tip +';
theTipAmount.addEventListener("click", function(){
    showTipBox();
})
var theTotalDiv = document.createElement('div');
theTotalDiv.style.height = "50%";
theTotalDiv.style.display = 'flex';
theTotalDiv.style.alignItems = "center";
theTotalDiv.style.justifyContent = 'space-around';
var totalText = document.createElement('div');
totalText.innerText = 'Total:';
totalText.style.fontSize = '100%';
totalText.classList.add('white');
totalText.classList.add('heading-font');
totalText.style.textAlign = 'left';

var underTotaltext = document.createElement('div');
underTotaltext.innerText = '(with taxes and fees)';
underTotaltext.classList.add('font');
totalText.appendChild(underTotaltext);
var theActualTotal = document.createElement('div');
theActualTotal.id = 'the-actual-total';
theActualTotal.innerText = '$0';
theActualTotal.style.fontSize = '200%';
theActualTotal.classList.add('pink');
theActualTotal.classList.add('heading-font');





theTipAmount.classList.add('pink');
theTipAmount.classList.add('font');

actualTipDiv.appendChild(addATipText);
actualTipDiv.appendChild(theTipAmount);
theTotalDiv.appendChild(totalText);
theTotalDiv.appendChild(theActualTotal);

tipDiv.appendChild(actualTipDiv);
tipDiv.appendChild(theTotalDiv);

var PaymentDiv = document.createElement("div");// the payment options box ATTACH APPLE PAY BUTTON HERE
PaymentDiv.id = 'PaymentDiv';
PaymentDiv.style.height = "50%";
PaymentDiv.style.width = "96%";
PaymentDiv.style.marginLeft = "auto";
PaymentDiv.style.marginRight = "auto";

var paymentStripe = document.createElement("div");
paymentStripe.id = 'payment-request-button';


PaymentDiv.appendChild(paymentStripe);


tipAndPaymentDiv.appendChild(tipDiv);
tipAndPaymentDiv.appendChild(PaymentDiv);


var noItemsInCart = document.createElement("p");//empty cart text line 1
noItemsInCart.innerText = "Looks like there are no items in your cart!";
noItemsInCart.classList.add('white');
noItemsInCart.classList.add('font');

var noItemsInCartJoke = document.createElement("p");//empty cart text line 2
noItemsInCartJoke.innerText = "I mean, you've gotta be hungry for something!";
noItemsInCartJoke.classList.add('white');
noItemsInCartJoke.classList.add('font');

var theJokeDiv = document.createElement('div');//empty cart div
theJokeDiv.style.display = 'flex';
theJokeDiv.style.flexDirection = 'column';
theJokeDiv.style.justifyContent = 'center';
theJokeDiv.style.alignItems = 'center';
theJokeDiv.style.textAlign = 'center';
theJokeDiv.style.height = '100%';

theJokeDiv.appendChild(noItemsInCart);
theJokeDiv.appendChild(noItemsInCartJoke);
//cartListDiv.appendChild(theJokeDiv);



function appendToCart(name, img, toppings, price, cost){
    nonTaxTotal = nonTaxTotal + price;
    totalCost = totalCost + parseInt(cost);
            if((nonTaxTotal * commissionPercent) < maxCommision){
                comish = (nonTaxTotal * commissionPercent);
            }else{
                comish = maxCommision;
            }
    if(theTipValue.type == 'percent'){
        document.getElementById('the-tip-amount').innerText = '(' + (theTipValue.amount)*100 +'%) $' + ((nonTaxTotal * (1 + theTaxRate)) * (theTipValue.amount)).toFixed(2);
        document.getElementById('the-actual-total').innerText ='$' + (((nonTaxTotal * (1 + theTaxRate)) * (1 + theTipValue.amount)) + (comish)).toFixed(2);
    }else if(theTipValue.type == 'value'){
        document.getElementById('the-tip-amount').innerText = '$' + ((nonTaxTotal * (1 + theTaxRate)) + theTipValue.amount).toFixed(2);
        document.getElementById('the-actual-total').innerText ='$' + (((nonTaxTotal * (1 + theTaxRate)) + theTipValue.amount) + (comish)).toFixed(2);
    }else{
        document.getElementById('the-actual-total').innerText ='$' + ((nonTaxTotal * (1 + theTaxRate)) + (comish)).toFixed(2);
    }
   
    var itemDiv = document.createElement('div');// item div for an item in the cart
    itemDiv.style.display = 'flex';
    itemDiv.style.flexDirection = 'column';
    itemDiv.style.width = '96%';
    itemDiv.style.marginLeft = 'auto';
    itemDiv.style.marginRight = 'auto';
    itemDiv.style.marginTop = '5%';
    var aboveAmountDiv = document.createElement('div');//everything above changing quantity
    aboveAmountDiv.style.borderRadius = '16px';
    aboveAmountDiv.style.borderWidth = '3px';
    aboveAmountDiv.style.borderStyle = 'solid';
    aboveAmountDiv.style.borderColor = 'rgb(248, 46, 255)';
    aboveAmountDiv.style.height = '70%';
    aboveAmountDiv.style.display = 'flex';
    aboveAmountDiv.style.justifyContent = 'space-between';
    aboveAmountDiv.style.alignItems = 'center';

    var imageAndNameToppings = document.createElement('div');
    imageAndNameToppings.style.width = '60%';
    if(img != ''){
        var containImgDiv = document.createElement('div');
        var image = document.createElement('img');
        containImgDiv.style.justifyContent = 'center';
        containImgDiv.style.alignItems = 'center';
        containImgDiv.style.width = '50%';
        containImgDiv.style.display = 'flex';
        containImgDiv.style.overflow = 'hidden';
        containImgDiv.style.borderRadius = '14px 0px 0px 14px';
        image.src = img;
        imageAndNameToppings.style.display = 'flex';
        containImgDiv.appendChild(image);
        imageAndNameToppings.appendChild(containImgDiv);
    }
 
    var nameAndToppings = document.createElement('div');
    var Thename = document.createElement('div');
    Thename.classList.add('pink');
    Thename.classList.add('heading-font');
    Thename.style.fontSize = '200%';
    Thename.innerText = name;
    var toppingsDiv = document.createElement('div');// div for toppings list
    if(toppings.length != null){
        for(var i=0; i<toppings.length; i++){
            var theTopping = document.createElement('p');
            theTopping.classList.add('font');
            theTopping.classList.add('white');
            theTopping.innerText = toppings[i];
            toppingsDiv.appendChild(theTopping);
        }
    }

    nameAndToppings.appendChild(Thename);
    nameAndToppings.appendChild(toppingsDiv);


    if(img != ''){
        nameAndToppings.style.marginLeft = '3%';
        image.style.height = '3px';
        imageAndNameToppings.appendChild(nameAndToppings);
        aboveAmountDiv.appendChild(imageAndNameToppings);
    }else{
        nameAndToppings.style.marginLeft = '3%';
        aboveAmountDiv.appendChild(nameAndToppings);
    }
    


    var thePriceDiv = document.createElement('div');
    thePriceDiv.classList.add('font');
    thePriceDiv.classList.add('pink');
    thePriceDiv.innerText = '$' + price.toFixed(2);
    thePriceDiv.style.marginRight = '3%';
    thePriceDiv.style.fontSize = '200%';

    var theCostOfItem = document.createElement('p');
    theCostOfItem.innerText = cost;
    theCostOfItem.style.display = 'none';
    thePriceDiv.appendChild(theCostOfItem);


    
    aboveAmountDiv.appendChild(thePriceDiv);

    var belowBottomDivReal = document.createElement('div');
    belowBottomDivReal.style.justifyContent = 'center';
    var belowAmountDiv = document.createElement('div');//box for changing quantity
    belowAmountDiv.style.display = 'flex';
    belowAmountDiv.style.alignItems = 'center';
    belowAmountDiv.style.width = '50%';
    belowAmountDiv.style.margin = 'auto';
    belowAmountDiv.style.borderWidth = '0 4px 4px 4px';
    belowAmountDiv.style.borderRadius = '0% 0% 20px 20px'
    belowAmountDiv.style.borderStyle = 'solid';
    belowAmountDiv.style.borderColor = 'rgb(248, 46, 255)';
    belowAmountDiv.style.justifyContent = 'space-evenly';
   
    var theQuantityText = document.createElement('p');// the quantity text 
    theQuantityText.style.textAlign = 'center';
    theQuantityText.classList.add('pink');
    theQuantityText.classList.add('heading-font');
    theQuantityText.innerText = 1;
    theQuantityText.style.fontSize = '200%';
    theQuantityText.style.paddingRight = '5%';
    theQuantityText.style.paddingLeft = '5%';
    theQuantityText.style.marginTop = '0%';
    theQuantityText.style.marginBottom = '0%';
    var plusIcon = document.createElement('i');//plus icon 
    plusIcon.classList.add('pink');
    plusIcon.classList.add('fas');
    plusIcon.classList.add('fa-plus');
    plusIcon.classList.add('fa-2x');
    plusIcon.addEventListener('click', function(){
        theQuantityText.innerText = parseInt(theQuantityText.innerText,10) + 1;
        thePriceDiv.innerText = '$' + (price * parseInt(theQuantityText.innerText,10)).toFixed(2);
        nonTaxTotal = nonTaxTotal + price;
        totalCost = totalCost + parseInt(cost);
            if((nonTaxTotal * commissionPercent) < maxCommision){
                comish = (nonTaxTotal * commissionPercent);
            }else{
                comish = maxCommision;
            }
        if(theTipValue.type == 'percent'){
            document.getElementById('the-tip-amount').innerText = '(' + (theTipValue.amount)*100 +'%) $' + ((nonTaxTotal * (1 + theTaxRate)) * (theTipValue.amount)).toFixed(2);
            document.getElementById('the-actual-total').innerText ='$' + (((nonTaxTotal * (1 + theTaxRate)) * (1 + theTipValue.amount)) + (comish)).toFixed(2);
        }else if(theTipValue.type == 'value'){
            document.getElementById('the-tip-amount').innerText = '$' + ((nonTaxTotal * (1 + theTaxRate)) + theTipValue.amount).toFixed(2);
            document.getElementById('the-actual-total').innerText ='$' + (((nonTaxTotal * (1 + theTaxRate)) + theTipValue.amount) + (comish)).toFixed(2);
        }else{
            document.getElementById('the-actual-total').innerText ='$' + (nonTaxTotal * (1 + theTaxRate) + (comish)).toFixed(2);
        }
        document.getElementById('the-shopping-cart-quantity').innerText = parseInt(document.getElementById('the-shopping-cart-quantity').innerText) + 1;
        updatePR();
    })
    var minusIcon = document.createElement('i');// the minus icon
    minusIcon.classList.add('pink');
    minusIcon.classList.add('fas');
    minusIcon.classList.add('fa-minus');
    minusIcon.classList.add('fa-2x');
    minusIcon.addEventListener('click', function(){ //minus button clicked

    theQuantityText.innerText = parseInt(theQuantityText.innerText,10) - 1;
    thePriceDiv.innerText = '$' + (price * parseInt(theQuantityText.innerText,10)).toFixed(2);
    nonTaxTotal = nonTaxTotal - price;
    totalCost = totalCost - parseInt(cost);
    if((nonTaxTotal * commissionPercent) < maxCommision){
        comish = (nonTaxTotal * commissionPercent);
    }else{
        comish = maxCommision;
    }
     if(theTipValue.type == 'percent'){
            document.getElementById('the-tip-amount').innerText = '(' + (theTipValue.amount)*100 +'%) $' + ((nonTaxTotal * (1 + theTaxRate)) * (theTipValue.amount)).toFixed(2);
            document.getElementById('the-actual-total').innerText ='$' + (((nonTaxTotal * (1 + theTaxRate)) * (1 + theTipValue.amount)) + (comish)).toFixed(2);
        }else if(theTipValue.type == 'value'){
            document.getElementById('the-tip-amount').innerText = '$' + ((nonTaxTotal * (1 + theTaxRate)) + theTipValue.amount).toFixed(2);
            document.getElementById('the-actual-total').innerText ='$' + (((nonTaxTotal * (1 + theTaxRate)) + theTipValue.amount) + (comish)).toFixed(2);
        }else{
            document.getElementById('the-actual-total').innerText ='$' + ((nonTaxTotal * (1 + theTaxRate)) + (comish)).toFixed(2);
        }

    document.getElementById('the-shopping-cart-quantity').innerText = parseInt(document.getElementById('the-shopping-cart-quantity').innerText) - 1;
    if (theQuantityText.innerText == '0'){
        itemDiv.remove();
    }
    updatePR();
    })
    itemDiv.appendChild(aboveAmountDiv);
    belowAmountDiv.appendChild(minusIcon);
    belowAmountDiv.appendChild(theQuantityText);
    belowAmountDiv.appendChild(plusIcon);
    belowBottomDivReal.appendChild(belowAmountDiv);
    itemDiv.appendChild(belowBottomDivReal);
    cartListDiv.appendChild(itemDiv);
    var theHeight = nameAndToppings.offsetHeight + 'px';
    if(img != ''){
        image.style.height = theHeight;
    }
    updatePR();
}





var menuItemDetailsDiv = document.createElement('div');// for adding toppings
menuItemDetailsDiv.id = 'menu-item-details-div';
menuItemDetailsDiv.classList.add('menu-item-details-first-down');

var menuItemDetailsEx = document.createElement('i');// the x out of the menu items
menuItemDetailsEx.classList.add('fas');
menuItemDetailsEx.classList.add('fa-times-circle');
menuItemDetailsEx.classList.add('pink');
menuItemDetailsEx.classList.add('fa-3x');
menuItemDetailsEx.style.position = 'absolute';
menuItemDetailsEx.style.top = '2%';
menuItemDetailsEx.style.left = '3%';
menuItemDetailsEx.addEventListener('click', function() {
    menuItemDetailsDiv.classList.remove('menu-item-details-div-up');
    menuItemDetailsDiv.classList.add('menu-item-details-div-down');
    setTimeout(function() {
        document.getElementById('menu-item-details-div').style.display = 'none';
    }, 800);
})


menuItemDetailsDiv.appendChild(menuItemDetailsEx);//image for menu details
var imageDiv = document.createElement('div');
imageDiv.style.display = 'flex';
imageDiv.style.overflow = 'hidden';
imageDiv.style.alignItems = 'center';
imageDiv.style.height = '30%';
imageDiv.style.borderTopRightRadius = '22px';
imageDiv.style.borderTopLeftRadius = '22px';
menuItemDetailsDiv.appendChild(imageDiv);//apends image container to menu details

var toppingsDiv = document.createElement('div');// place to append all things below picture except the add to cart button
toppingsDiv.style.overflowY = 'scroll';
toppingsDiv.id = 'toppings-div-for-all-toppings';
menuItemDetailsDiv.appendChild(toppingsDiv);//apends toppings container to menu details

var addToCartButtonDiv = document.createElement('div'); // add to cart div 
addToCartButtonDiv.id = 'add-cart-div';

var addToCartBttn = document.createElement('div');// add to cart button 
addToCartBttn.id = 'add-cart-btn'
addToCartBttn.innerText = 'Add To Cart';
addToCartBttn.classList.add('pink');
addToCartBttn.classList.add('heading-font');
addToCartButtonDiv.appendChild(addToCartBttn);
menuItemDetailsDiv.appendChild(addToCartButtonDiv)


document.body.appendChild(menuItemDetailsDiv);








//showes that table is blocked
function showBlockedTable(){
    var e = blockTableOrCloseDiv;
    e.innerHTML = "";
    blockedTheText.innerText = "Sorry, unfortunatley this table has been blocked.";
    e.appendChild(blockedTheText);
    e.style.display = "flex";
};

function showClosedRestaurant(){
    var e = blockTableOrCloseDiv;
    e.innerHTML = "";
    blockedTheText.innerText = "Sorry, unfortunatley this restaurant is currently closed.";
    e.appendChild(blockedTheText);
    e.style.display = "flex";
};
function hideBlocked(){
    var e = blockTableOrCloseDiv;
    e.style.display = "none";
}

function addEventListenerToToppings(){
    //create function within a loop to add even listeners for the topping divs

    for(var i = 0; i < document.getElementById('the-actual-toppings').childNodes.length; i++){
        if(document.getElementById('the-actual-toppings').childNodes[i].childNodes[1].innerText == '(Choose one from below)'){//if only one can be chosen
            for(var j = 0; j < document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes.length; j++){
                document.getElementById('the-actual-toppings').childNodes[i].childNodes[3].childNodes[j].addEventListener('click', function(){
                    for(var v = 0; v< document.getElementById('the-actual-toppings').childNodes[i].childNodes[3].childNodes.length; v++){
                        document.getElementById('the-actual-toppings').childNodes[i].childNodes[3].childNodes[v].classList.remove('backround-white');
                    }
                    document.getElementById('the-actual-toppings').childNodes[i].childNodes[3].childNodes[j].classList.add('backround-white');
                })
            }
        }
    }

}

var resOpenStatus
//checks if open or closed
db.collection('users').doc(resEmail).onSnapshot((doc)=>{
    if(doc.data().open){
        hideBlocked();
        db.collection('users/'+ resEmail + '/tables').doc(tableId).get().then((snapshot)=>{
            if(!snapshot.data().active){
                showBlockedTable();
            }
        })
        resOpenStatus = true;
    }else{
        showClosedRestaurant();
        resOpenStatus = false;
    }
})
//checks if table is blocked
db.collection('users/'+ resEmail + '/tables').doc(tableId).onSnapshot((doc)=>{
    if(doc.data().active && resOpenStatus){//if restaurant is open and table is not blocked
        hideBlocked();
    }else if(!resOpenStatus){// if restaurant is closed (if the table is blocked it will still just show closed restaurant)
        showClosedRestaurant();
    }else if(!doc.data().active && resOpenStatus){// if restaurant is open and table is blocked
        showBlockedTable();
    }
})
//----------------building the main div---------------------

var mainDiv = document.createElement("div");//main backround
mainDiv.id = "main-div";
var theTopDiv = document.createElement("div");//top div
theTopDiv.id = "the-top-div";
var textInTop = document.createElement("div");// text box in middle (contains welcome to and restaurant name)
textInTop.id = "text-in-top";
var welcomeToText = document.createElement("p");//welcome to text
welcomeToText.innerText = "Welcome to";
welcomeToText.id = "welcome-to-text";
welcomeToText.classList.add('white');
welcomeToText.classList.add('font');
var restaurantNameText = document.createElement("p");//res name
db.collection('users').doc(resEmail).get().then((snapshot)=>{
    restaurantNameText.innerText = snapshot.data().name;
})
restaurantNameText.id = "restaurant-name-text";
restaurantNameText.classList.add('pink');
restaurantNameText.classList.add('font');

textInTop.appendChild(welcomeToText);// adding everything to the text box in middle
textInTop.appendChild(restaurantNameText);

var leftMenuIcon = document.createElement("i");//menu icon on left
leftMenuIcon.classList.add("fas");
leftMenuIcon.classList.add("fa-bars");
leftMenuIcon.classList.add("pink");
leftMenuIcon.classList.add("fa-2x");
leftMenuIcon.addEventListener('click', function(){
    document.getElementById('abt-swif-menu').style.display = 'flex';
})
document.getElementById('the-ex-menu').addEventListener('click', function(){
    document.getElementById('abt-swif-menu').style.display = 'none';
})
document.getElementById('abt-swifti').addEventListener('click', function(){
    location.href = 'index.html'
})

var bellOnRight = document.createElement("i"); //call waiter bell on right
bellOnRight.classList.add("fas");
bellOnRight.classList.add("fa-bell");
bellOnRight.classList.add("pink");
bellOnRight.classList.add("fa-2x");
bellOnRight.addEventListener('click', function(){

    var callWaiterDiv = document.createElement("div");
    callWaiterDiv.style.position = "absolute";
    callWaiterDiv.style.width = "100%";
    callWaiterDiv.style.height = "100%";
    callWaiterDiv.style.justifyContent = "center";
    callWaiterDiv.style.alignItems = "center";
    callWaiterDiv.style.zIndex = '5';
    var callWaiterBox = document.createElement("div");
    callWaiterBox.style.width = "90%";
    callWaiterBox.style.height = "70%";
    callWaiterBox.style.display = 'flex';
    callWaiterBox.style.flexDirection = 'column';
    callWaiterBox.style.justifyContent = 'space-around';
    callWaiterBox.style.backgroundColor = 'rgb(53, 53, 53)';
    callWaiterBox.style.marginTop = '30%';
    callWaiterBox.style.marginLeft = 'auto';
    callWaiterBox.style.marginRight = 'auto';
    callWaiterBox.style.borderRadius = '25px';
    callWaiterBox.style.borderStyle = 'solid';
    callWaiterBox.style.borderColor = '#F82EFF';
    callWaiterBox.style.borderWidth = '5px';
    var callWaiterText  = document.createElement("div");
    callWaiterText.innerText = 'Would you like to call a waiter to your table?';
    callWaiterText.classList.add('white');
    callWaiterText.classList.add('font');
    callWaiterText.style.textAlign = 'center';
    callWaiterText.style.fontSize = '200%';
    callWaiterText.style.paddingLeft = '3%';
    callWaiterText.style.paddingRight = '3%';
    var buttonsBox = document.createElement('div');
    buttonsBox.style.display = 'flex';
    buttonsBox.style.flexDirection = 'column';
    buttonsBox.style.justifyContent = 'space-around';
    buttonsBox.style.height = '40%';
    var yesButton = document.createElement('div');
    yesButton.style.borderRadius = '15px';
    yesButton.style.paddingTop = '3%';
    yesButton.style.paddingBottom = '3%';
    yesButton.style.backgroundColor = 'white';
    yesButton.classList.add('pink');
    yesButton.style.fontSize = '200%';
    yesButton.classList.add('font');
    yesButton.innerText = 'Yes! I would!';
    yesButton.style.textAlign = 'center';
    yesButton.style.width = '95%';
    yesButton.style.marginLeft = 'auto';
    yesButton.style.marginRight = 'auto';
    yesButton.addEventListener('click', function(){
        callWaiterDiv.remove();
        
        db.collection('users/'+ resEmail + '/waiterRequest').add({
            amount: 0,
            tableNumber: tableNumber,
            time: new Date(),
            tip: false
        })
        
        
    })
    var waiterHasBeenCalled = document.createElement('div');
    waiterHasBeenCalled.innerText = 'Waiter has already been called to this table!';
    waiterHasBeenCalled.classList.add('white');
    waiterHasBeenCalled.classList.add('font');
    waiterHasBeenCalled.style.fontSize = '140%';
    waiterHasBeenCalled.style.textAlign = 'center';
    db.collection('users/'+ resEmail + '/waiterRequest').where("tableNumber", "==", tableNumber).where("tip", "==", false).onSnapshot((querySnapshot)=>{
        buttonsBox.innerHTML = "";
        if(querySnapshot.docs.length == 0){
            buttonsBox.appendChild(yesButton);
        var noButton = document.createElement('div');
        noButton.innerText = 'Actually, nevermind...';
        noButton.style.borderRadius = '15px';
        noButton.style.backgroundColor = 'white';
        noButton.style.fontSize = '170%';
        noButton.style.paddingTop = '3%';
        noButton.style.paddingBottom = '3%';
        noButton.classList.add('pink');
        noButton.classList.add('font');
        noButton.style.textAlign = 'center';
        noButton.style.width = '95%';
        noButton.style.marginLeft = 'auto';
        noButton.style.marginRight = 'auto';
        noButton.addEventListener('click', function(){
            callWaiterDiv.remove();
        })
        buttonsBox.appendChild(noButton);

        }else{
            buttonsBox.appendChild(waiterHasBeenCalled);
            var noButton = document.createElement('div');
        noButton.innerText = 'Okay!';
        noButton.style.borderRadius = '15px';
        noButton.style.backgroundColor = 'white';
        noButton.style.fontSize = '170%';
        noButton.style.paddingTop = '3%';
        noButton.style.paddingBottom = '3%';
        noButton.classList.add('pink');
        noButton.classList.add('font');
        noButton.style.textAlign = 'center';
        noButton.style.width = '95%';
        noButton.style.marginLeft = 'auto';
        noButton.style.marginRight = 'auto';
        noButton.addEventListener('click', function(){
            callWaiterDiv.remove();
        })
        buttonsBox.appendChild(noButton);
        }
       

    })
    
    callWaiterBox.appendChild(callWaiterText);
    callWaiterBox.appendChild(buttonsBox);
    callWaiterDiv.appendChild(callWaiterBox);
    document.body.appendChild(callWaiterDiv);

})

theTopDiv.appendChild(leftMenuIcon);//adding everything to the top div
theTopDiv.appendChild(textInTop);
theTopDiv.appendChild(bellOnRight);

var theCategoriesDiv = document.createElement("div");//the menu categories div 
theCategoriesDiv.id = 'categories-div';

function eraseAllSelectedCategories(){//function that removes selection from categories
var e = document.querySelector('.selected-category');
if (e === null){

}else{
    e.classList.remove('selected-category');
    e.classList.add('unselected-category');
}
};



theMenuItemsDiv = document.createElement("div");// where all the menu items go
theMenuItemsDiv.id = "the-menu-items-div";

var theInstrucitonsDiv = document.createElement("div");
theInstrucitonsDiv.style.position = "absolute";
theInstrucitonsDiv.style.width = "100%";
theInstrucitonsDiv.style.height = "100%";
theInstrucitonsDiv.style.display = 'flex';
theInstrucitonsDiv.style.flexDirection = "column";
theInstrucitonsDiv.style.justifyContent = "center";
theInstrucitonsDiv.style.alignItems = "center";
theInstrucitonsDiv.style.zIndex = "3";
theInstrucitonsDiv.style.pointerEvents = "none";

var thyneArrowUp = document.createElement("i");
thyneArrowUp.classList.add('fas');
thyneArrowUp.classList.add('fa-chevron-up');
thyneArrowUp.classList.add('white');
thyneArrowUp.classList.add('fa-2x');
theInstrucitonsDiv.appendChild(thyneArrowUp);

var textToSelectCategory = document.createElement("p");
textToSelectCategory.classList.add('white');
textToSelectCategory.classList.add('font');
textToSelectCategory.style.fontSize = "100%";
textToSelectCategory.style.width = "90%";
textToSelectCategory.style.textAlign = "center";
textToSelectCategory.innerText = "Choose a category from above to get started!";
theInstrucitonsDiv.appendChild(textToSelectCategory);
document.body.append(theInstrucitonsDiv);

var selectedPrice = 0;
var costToMake = 0;

function createMenuItem(name, price, image, desc, uid, cost){
var menuItem = document.createElement("div"); //menu item box
menuItem.id = "menu-item-box";

var titleOf = document.createElement("p");//title
titleOf.innerText = name;
titleOf.id = "menu-item-name";
titleOf.classList.add('pink');
titleOf.classList.add('heading-font');



var priceOf = document.createElement("div");// price
priceOf.id = "menu-item-price";
priceOf.classList.add("font");
priceOf.classList.add("white");
priceOf.innerText = "$" + price;

var addIcon = document.createElement("i");// plus icon
addIcon.id = "plus-icon";
addIcon.classList.add('pink');
addIcon.classList.add('fas');
addIcon.classList.add('fa-plus');
addIcon.classList.add('fa-2x');

var seperateingDiv = document.createElement("div");
    seperateingDiv.id = 'seperating-div-menu-item';
   
    var divForLoadingRing = document.createElement("div");
    divForLoadingRing.style.display = 'flex';
    divForLoadingRing.style.width = '100%';
    divForLoadingRing.style.height = '5rem';
    divForLoadingRing.style.justifyContent = 'center';
    buildLoadingRing(divForLoadingRing);
    menuItem.appendChild(divForLoadingRing);
    

if (image == ''){
    menuItem.removeChild(menuItem.firstChild);
    menuItem.appendChild(titleOf); //adding all of that to the menu item
    menuItem.appendChild(priceOf);
    menuItem.appendChild(addIcon);
    theMenuItemsDiv.appendChild(menuItem);
}else{
   var picTure = document.createElement("img");
   picTure.src = image;
   picTure.id = 'menu-item-image';

   picTure.addEventListener('load', function(){
    menuItem.removeChild(menuItem.firstChild);
    seperateingDiv.appendChild(picTure);
    var theLowerDiv = document.createElement("div");
    theLowerDiv.id = 'the-lower-div';
    theLowerDiv.appendChild(titleOf); //adding all of that to the menu item
    theLowerDiv.appendChild(priceOf);
    theLowerDiv.appendChild(addIcon);
    seperateingDiv.appendChild(theLowerDiv);
    menuItem.appendChild(seperateingDiv);

   })
  
}


theMenuItemsDiv.appendChild(menuItem);
menuItem.addEventListener("click", function(){
    imageDiv.innerHTML = "";//clears last image from menu details
    document.getElementById("toppings-div-for-all-toppings").innerHTML = ""; // clears all previous text that existed
    selectedPrice = price;
    costToMake = cost;


    db.collection('users/' + resEmail + '/choices').where("for", "==", uid).get().then((querySnapshot)=>{
        if(querySnapshot.docs.length > 0){// if there are toppings
            if (image == ''){
                imageDiv.style.display = "none";
            }else{
                imageDiv.style.display = 'flex';
                var imageforDiv = document.createElement('img');
                imageforDiv.src = image;
                imageforDiv.style.width = '100%';
        
                if (imageDiv.style.height > imageforDiv.style.height){
                    imageDiv.style.height = 'auto';
                }
        
                imageDiv.appendChild(imageforDiv);
        
            }
            var theTitle = document.createElement('p'); //adds the title of the food
            theTitle.classList.add('heading-font');
            theTitle.classList.add('pink');
            theTitle.style.textAlign = 'center';
            theTitle.innerText = name;
            theTitle.style.marginBottom = '1%';
            theTitle.style.fontSize = '250%';
            theTitle.style.letterSpacing = '2px';
            
            toppingsDiv.appendChild(theTitle);
        
            var theDesc = document.createElement("p");
            theDesc.classList.add('font');
            theDesc.classList.add('white');
            theDesc.style.textAlign = 'center';
            theDesc.style.paddingLeft = '10%';
            theDesc.style.paddingRight = '10%';
            theDesc.innerText = desc;
            theDesc.style.textAlign = 'center';
            theDesc.style.fontSize = '100%';
            theDesc.style.marginTop = '0%';
            if (desc != ''){
                toppingsDiv.appendChild(theDesc);
            }

            var theActualToppings = document.createElement('div');
            theActualToppings.id = 'the-actual-toppings';
            theActualToppings.style.width = '100%';
            toppingsDiv.appendChild(theActualToppings);
            
             
            querySnapshot.forEach((doc) => {
                var aTopping = document.createElement('div');
                var nameOfTopping = document.createElement('p');//name of topping selection 
                nameOfTopping.classList.add('font');
                nameOfTopping.classList.add('pink');
                nameOfTopping.style.fontSize = '250%';
                nameOfTopping.style.marginBottom = '0%';
                nameOfTopping.style.marginTop = '0%';
                nameOfTopping.style.marginLeft = '3%';
                nameOfTopping.innerText = doc.data().name;
                aTopping.appendChild(nameOfTopping);
                var numberOfChoices = document.createElement('p');//number of choices (one or many) of topping selection 
                numberOfChoices.classList.add('font');
                numberOfChoices.classList.add('white');
                numberOfChoices.style.marginLeft = '3%';
                numberOfChoices.style.marginTop = '0%';
                if(doc.data().typeOfChoice == 'one choice'){
                    numberOfChoices.innerText = '(Choose one from below)';
                }else{
                    numberOfChoices.innerText = '(Choose as many as you wish from below)';
                }
                aTopping.appendChild(numberOfChoices);
                var divFroAllToppingChoices = document.createElement('div');
                divFroAllToppingChoices.style.width = '100%';
                divFroAllToppingChoices.style.display = 'flex';
                divFroAllToppingChoices.style.flexWrap = 'wrap';
                var choiceLength = doc.data().choices;

                

                for(var i = 0; i< choiceLength.length; i++){
                    db.collection('users/'+ resEmail + '/toppings').doc(choiceLength[i]).get().then((snapshot)=>{
                        if(snapshot.data().visible == true){
                            var divForTopping = document.createElement('div');
                            divForTopping.addEventListener('click', function(){
                                if(numberOfChoices.innerText == '(Choose one from below)'){
                                    for(var z = 0; z < divFroAllToppingChoices.childNodes.length; z++){
                                        if(divFroAllToppingChoices.childNodes[z].classList.contains('backround-white')){
                                            divFroAllToppingChoices.childNodes[z].classList.remove('backround-white');
                                        }
                                    }
                                    divForTopping.classList.add('backround-white');
                                }else{
                                    divForTopping.classList.toggle('backround-white');
                                }
                                
                            })
                                divForTopping.style.borderRadius = '25px';
                                divForTopping.style.borderStyle = 'solid';
                                divForTopping.style.borderWidth = '2px';
                                divForTopping.style.borderColor = 'rgb(248, 46, 255)';
                                divForTopping.style.display = 'flex';
                                divForTopping.style.flexWrap = 'none';
                                divForTopping.style.paddingLeft = '5%';
                                divForTopping.style.paddingRight = '7%';
                                divForTopping.style.marginLeft = '4%';
                                divForTopping.style.marginBottom = '2%';
                                var nameOfTopping = document.createElement('p');//name of topping 
                                nameOfTopping.innerText = snapshot.id;
                                nameOfTopping.classList.add('pink');
                                nameOfTopping.classList.add('font');
                                nameOfTopping.style.float = 'left';
                                nameOfTopping.style.paddingLeft = '2%';
                                nameOfTopping.style.whiteSpace = 'nowrap';
                                divForTopping.appendChild(nameOfTopping);
                            if(snapshot.data().priceSell > 0){
                                var priceOfTopping = document.createElement('p');//price of choice (if free hidden)
                                priceOfTopping.classList.add('pink');
                                priceOfTopping.classList.add('font');
                                priceOfTopping.style.marginLeft = '5%';
                                priceOfTopping.style.marginRight = '5%';
                                priceOfTopping.innerText = ' $' + snapshot.data().priceSell.toFixed(2);
                                divForTopping.appendChild(priceOfTopping);
                            }
                            var thycostToMake = document.createElement('p');
                            thycostToMake.innerText = snapshot.data().priceMake.toFixed(2);
                            thycostToMake.style.display = 'none';
                            divForTopping.appendChild(thycostToMake);
                            divFroAllToppingChoices.appendChild(divForTopping);
                        }
                    })
                }
                aTopping.appendChild(divFroAllToppingChoices);
                theActualToppings.appendChild(aTopping);



            })

            menuItemDetailsDiv.classList.remove('menu-item-details-div-down');
            menuItemDetailsDiv.classList.remove('menu-item-details-first-down');
            document.getElementById('menu-item-details-div').style.display = 'block';
            menuItemDetailsDiv.classList.add('menu-item-details-div-up');


        }else if(desc != ''){// if there are no toppings but there is a description
            if (image == ''){
                imageDiv.style.display = 'none';
            }else{
                imageDiv.style.display = 'flex';
                var imageforDiv = document.createElement('img');
                imageforDiv.src = image;
                imageforDiv.style.width = '100%';
        
                if (imageDiv.style.height > imageforDiv.style.height){
                    imageDiv.style.height = 'auto';
                }
        
                imageDiv.appendChild(imageforDiv);
        
            }
            var theTitle = document.createElement('p'); //adds the title of the food
            theTitle.classList.add('heading-font');
            theTitle.classList.add('pink');
            theTitle.style.textAlign = 'center';
            theTitle.innerText = name;
            theTitle.style.marginBottom = '1%';
            theTitle.style.fontSize = '200%';
            
            toppingsDiv.appendChild(theTitle);
        
            var theDesc = document.createElement("p");
            theDesc.classList.add('font');
            theDesc.classList.add('white');
            theDesc.style.textAlign = 'center';
            theDesc.style.paddingLeft = '10%';
            theDesc.style.paddingRight = '10%';
            theDesc.innerText = desc;
            theDesc.style.textAlign = 'center';
            theDesc.style.fontSize = '100%';
            theDesc.style.marginTop = '0%';
            if (desc != ''){
                toppingsDiv.appendChild(theDesc);
            }
            
            document.getElementById('menu-item-details-div').style.display = 'block';
            menuItemDetailsDiv.classList.add('menu-item-details-div-up');
            menuItemDetailsDiv.classList.remove('menu-item-details-div-down');
            menuItemDetailsDiv.classList.remove('menu-item-details-first-down');


        }else{// if no description or toppings just add item to cart
            appendToCart(name, image, [], parseInt(price), cost);
            document.getElementById('the-shopping-cart-quantity').innerText = parseInt(document.getElementById('the-shopping-cart-quantity').innerText) + 1;
            document.getElementById('added-to-cart').style.opacity = 1;
            setTimeout(function() {document.getElementById('added-to-cart').style.opacity = 0;}, 1500);
        }

       
        if(document.getElementById("toppings-div-for-all-toppings").childNodes.length > 3){
                for( var i = 3; i < document.getElementById("toppings-div-for-all-toppings").childNodes.length; i++){
                    document.getElementById("toppings-div-for-all-toppings").childNodes[i].remove();
                };
           
            
             
        }
       
    })

})

} 

document.getElementById('add-cart-btn').addEventListener('click', function(){// add to cart clicked function (add everything to the cart)
    var allClear = [];
    var isTrue = true;
    var arrayForChosenToppings = [];
    var toppingMissed;
    if(document.getElementById('the-actual-toppings') != null){ //if the menu item has toppings
        for(var i = 0; i< document.getElementById('the-actual-toppings').childNodes.length; i++){
            if(document.getElementById('the-actual-toppings').childNodes[i].childNodes[1].innerText == '(Choose one from below)' && document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].querySelector('.backround-white') == null){
                allClear.push('false');
                toppingMissed = document.getElementById('the-actual-toppings').childNodes[i].childNodes[0].innerText;
            }else{
                allClear.push('true');
            }
            //below is if you have to choose one topping, but one is not chosen
                for(var j = 0; j < document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes.length; j++){
                    if(document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes[j].classList.contains('backround-white')){//selects all the white ones and pushes to array
                        arrayForChosenToppings.push(document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes[j].childNodes[0].innerText);
                        if(document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes[j].childNodes.length == 3){//if a topping costs then adds to total of menu item 
                            var toppingPrice = parseInt(parseInt(document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes[j].childNodes[1].innerText.substring(1)).toFixed(2));
                            selectedPrice = parseInt(selectedPrice) + toppingPrice;
                            console.log(document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes[j].childNodes.length);
                                var toppingCost = parseInt(document.getElementById('the-actual-toppings').childNodes[i].childNodes[2].childNodes[j].childNodes[2].innerText);
                            costToMake = parseInt(costToMake) + toppingCost;
                        }
                    }
                    
                }
                var theName = document.getElementById('menu-item-details-div').childNodes[2].childNodes[0].innerText;
                var theImageSource;
                if(document.getElementById('menu-item-details-div').childNodes[1].childNodes[0]){
                    theImageSource = document.getElementById('menu-item-details-div').childNodes[1].childNodes[0].src;
                }else{
                    theImageSource = '';
                }
            
        }
        for(var x= 0; x < allClear.length; x++){
            if(allClear[x] == 'false'){
                isTrue = false;
            }
        }
        if(isTrue == false){
            alert('Please select a ' + toppingMissed);
        }else{
            appendToCart(theName, theImageSource, arrayForChosenToppings, parseInt(selectedPrice), costToMake);
            document.getElementById('the-shopping-cart-quantity').innerText = parseInt(document.getElementById('the-shopping-cart-quantity').innerText) + 1;
            menuItemDetailsDiv.classList.remove('menu-item-details-div-up');
            menuItemDetailsDiv.classList.add('menu-item-details-div-down');
            setTimeout(function() {
                document.getElementById('menu-item-details-div').style.display = 'none';
            }, 800)
        }
       


    }else{
        var theName = document.getElementById('menu-item-details-div').childNodes[2].childNodes[0].innerText;
        var theImageSource;
        if(document.getElementById('menu-item-details-div').childNodes[1].childNodes[0]){
            theImageSource = document.getElementById('menu-item-details-div').childNodes[1].childNodes[0].src;
        }else{
            theImageSource = '';
        }
    
        appendToCart(theName, theImageSource, arrayForChosenToppings, parseInt(selectedPrice), costToMake);
        document.getElementById('the-shopping-cart-quantity').innerText = parseInt(document.getElementById('the-shopping-cart-quantity').innerText) + 1;
        menuItemDetailsDiv.classList.add('menu-item-details-div-down');
        menuItemDetailsDiv.classList.remove('menu-item-details-div-up');
        setTimeout(function() {
            document.getElementById('menu-item-details-div').style.display = 'none';
        }, 800)
        
    }

})



function loadTheCategories(categoryName){ //function that loads a category
    var main = document.createElement("div");
    main.id = "category-backround";
    main.classList.add('unselected-category');
    main.classList.add('font');
    main.innerText = categoryName;
    theCategoriesDiv.appendChild(main);
    main.addEventListener('click', function(){
       eraseAllSelectedCategories();
       theInstrucitonsDiv.remove();
       theMenuItemsDiv.innerHTML = "";
       main.classList.remove('unselected-category');
       main.classList.add('selected-category');
       db.collection('users/'+ resEmail + '/food').where("section", "==", main.innerText).where("visible", "==", true).orderBy("position").onSnapshot((querySnapshot)=>{
        theMenuItemsDiv.innerHTML = "";
        querySnapshot.forEach((doc) => {
            createMenuItem(doc.data().Name, doc.data().priceSell.toFixed(2), doc.data().imgURL, doc.data().description, doc.id, doc.data().priceMake.toFixed(2));
        })
       });
       
    })
   }

 
   
    

   //loads categories from database
   db.collection('users/' + resEmail + '/sections').where("visible", "==", true).orderBy("position").limit(20).onSnapshot((querySnapshot) =>{
       theCategoriesDiv.innerHTML = "";
       querySnapshot.forEach((doc) => {
           loadTheCategories(doc.id);
       });
   })


   var theTextForBottomDiv = document.createElement("div");//text for bottom
   theTextForBottomDiv.id = "checkout-bottom-button";
   var checkoutBttn = document.createElement("p");//checkout bttn 
   checkoutBttn.classList.add('heading-font');
   checkoutBttn.classList.add('pink');
   checkoutBttn.style.fontSize = "200%";
   checkoutBttn.innerText = "Checkout";
   checkoutBttn.style.marginBottom = "0%";
   checkoutBttn.style.marginTop = "3%";
   theTextForBottomDiv.appendChild(checkoutBttn);

   var itemsInCart = document.createElement("p");
   itemsInCart.classList.add('pink');
   itemsInCart.classList.add('font');
   itemsInCart.innerText = "Items in cart: ";
   itemsInCart.style.marginTop = "0%";
   theTextForBottomDiv.appendChild(itemsInCart);

   var theShoppingCartItems = document.createElement("span");
   theShoppingCartItems.id = 'the-shopping-cart-quantity';
   theShoppingCartItems.innerText = 0;
   itemsInCart.appendChild(theShoppingCartItems);


   var backBttnFromCart = document.createElement("p");//back buttn when cart is raised 
   backBttnFromCart.innerText = "< Back";
   backBttnFromCart.classList.add('hidden');
   backBttnFromCart.classList.add('pink');
   backBttnFromCart.classList.add('heading-font');
   backBttnFromCart.style.fontSize = "200%";
   backBttnFromCart.style.marginBottom = '0%';
   theTextForBottomDiv.appendChild(backBttnFromCart);


   theTextForBottomDiv.addEventListener('click', function(){//whencheckout is clicked
    theInstrucitonsDiv.style.display = 'none';
    bottomCheckoutDiv.classList.toggle('checkout-unselected');
    bottomCheckoutDiv.classList.toggle('checkout-selected');
    checkoutBttn.classList.toggle('hidden');
    itemsInCart.classList.toggle('hidden');
    backBttnFromCart.classList.toggle('hidden');

   })



   bottomCheckoutDiv.appendChild(theTextForBottomDiv);//appends the text to the bottom div
   bottomCheckoutDiv.appendChild(cartListDiv);//appends the cart to the bottom div
   bottomCheckoutDiv.appendChild(tipAndPaymentDiv);


mainDiv.appendChild(theTopDiv);
mainDiv.appendChild(theCategoriesDiv);
mainDiv.appendChild(theMenuItemsDiv);
mainDiv.appendChild(bottomCheckoutDiv);
document.body.appendChild(mainDiv);
updatePR();


    
  var elements = stripe.elements();

     prButton = elements.create('paymentRequestButton', {
  paymentRequest: paymentRequest,
  style: {
    paymentRequestButton: {
      type: 'default',
      // One of 'default', 'book', 'buy', or 'donate'
      // Defaults to 'default'
      theme: 'light',
      // One of 'dark', 'light', or 'light-outline'
      // Defaults to 'dark'
      height: '60px'
      // Defaults to '40px'. The width is always '100%'.
    },
  },
});
// Check the availability of the Payment Request API first.

paymentRequest.canMakePayment().then(function(result) {
    (async () => {
        if (result) {
            prButton.mount('#payment-request-button');
          } else {
            document.getElementById('payment-request-button').style.display = 'none';
            alert('An error occured, please scan the qr code again.');
          }
    })();
  });



  paymentRequest.on('token', async result => {
    // Pass the received token to our Firebase function
    let res = await charge(result.token, payableTotal, "usd", restaurantClientID, Math.round((payableTotal * 0.971) - 30) - Math.round(comish * 100));
    if (res.body.error) {
        result.complete('fail');
        console.log(res.body.error)
        payFail();
    } else {
        // Card successfully charged
        result.complete('success');
        console.log('Card successfully charged')
        console.log(res.body.charge.id);
        paySuccess(res.body.charge.id);
    }
});

 // Function used by all three methods to send the charge data to your Firebase function
 async function charge(token, amount, currency, accountId, resAmount) {
     console.log('running')
     console.log(resAmount);
    const res = await fetch(FIREBASE_FUNCTION, {
        method: 'POST',
        body: JSON.stringify({
            token,
            charge: {
                amount,
                currency,
                accountId,
                resAmount,
            },
        }),
    });
    const data = await res.json();
    data.body = JSON.parse(data.body);
    return data;
}