angular.module('starter.controllers',[])

.controller('MyController', function($scope, $timeout,$ionicModal, $http, $ionicLoading, $ionicActionSheet, $cordovaLocalNotification, $cordovaAppRate, $cordovaMedia, $cordovaNativeAudio){

var contains = function(needle) {
  // Per spec, the way to identify NaN is that it is not equal to itself
  var findNaN = needle !== needle;
  var indexOf;

  if(!findNaN && typeof Array.prototype.indexOf === 'function') {
    indexOf = Array.prototype.indexOf;
  } else {
    indexOf = function(needle) {
      var i = -1, index = -1;

      for(i = 0; i < this.length; i++) {
        var item = this[i];

        if((findNaN && item !== item) || item === needle) {
          index = i;
          break;
        }
      }
      return index;
    };
  }
  return indexOf.call(this, needle) > -1;
};

//////////////////////////////////////////////////////////////  

document.addEventListener('deviceready', function () {

  if ($scope.currentPlatform == "ios")
  {
    ionic.Platform.fullScreen()
    $scope.checkInstallation()
    $scope.addLocalNotification()
  }

  if ($scope.currentPlatform == "android")
  {
    $scope.checkInstallation()
    $scope.addLocalNotification()
  }

  if ($scope.iapVersion == false)
  {
    initAd();
    window.plugins.AdMob.createBannerView();
    // window.plugins.AdMob.createInterstitialView();
    $timeout(function(){window.plugins.AdMob.showAd(true, function(){},function(e){console.log(e);});}, 2000);
    // $scope.inAppPurchase()
  }

  $cordovaNativeAudio.preloadSimple('wager', 'js/wager.mp4');
  $cordovaNativeAudio.preloadSimple('winsmall', 'js/winsmall.mp4');
  $cordovaNativeAudio.preloadSimple('winbig', 'js/winbig.mp4');
  $cordovaNativeAudio.preloadSimple('losesmall', 'js/losesmall.mp4');
  $cordovaNativeAudio.preloadSimple('redeem', 'js/redeem.mp4');

  cordova.getAppVersion.getVersionNumber().then(function (version) {
    // got version and build, choose
    console.log(version)
    if (version > "0.0.13")
    {
      console.log("higher version")
    }
    else
    {
      console.log("lower version")
    }

  }); 

  AppRate.preferences = {
    openStoreInApp: false,
    displayAppName: 'Mind Our English',
    promptAgainForEachNewVersion: false,
    storeAppURL: {
      ios: '1200368140',
      android: 'market://details?id=com.spm.mindourenglish'
    },
    customLocale: {
      title: "Rate Mind Our English",
      message: "If you find this app useful, would you mind taking a moment to rate it? Thanks for your support!",
      rateButtonLabel: "Rate Now", // button 1
      cancelButtonLabel: "Never", // button 3
      laterButtonLabel: "Later" // button 2
    },
    callbacks: {
      onButtonClicked: function(buttonIndex){
        console.log("onButtonClicked -> " + buttonIndex);
        if (buttonIndex == 1 || buttonIndex == 3)
        {
          localStorage.setItem('askForRating','false')
        }
      }
    }
  };
})

window.addEventListener('native.keyboardshow', function(){
  document.body.classList.add('keyboard-open');
});

document.addEventListener("resume", onResume, false);

$scope.iapVersion = true
$scope.leftSwipes = 0
$scope.backgroundCount = localStorage.getItem('backgroundCount') || "1"
$scope.myBackground = "background_" + $scope.backgroundCount
$scope.loadingError = false
$scope.currentPlatform = ionic.Platform.platform();
getNotes()
$scope.answerPlaceholder="Type your answer here"
//https://jsonblob.com/1f61f57a-b1d6-11e6-871b-330772562403
$scope.noscreenshot = true;
$scope.swipeTutorial = localStorage.getItem('swipeTutorial') || 'false';
$scope.iapLink = "http://sample-env-1.jvngvxxqxm.us-west-2.elasticbeanstalk.com/index.html"
$scope.backgroundTutorial = localStorage.getItem('backgroundTutorial') || "true"
$scope.doubleTapTutorial = localStorage.getItem('doubleTapTutorial') || "true"
$scope.showWagerTutorial = localStorage.getItem('showWagerTutorial') || "true"
$scope.swipeQuestion = localStorage.getItem('askSwipeQuestion') || "true"
$scope.myStarPoints = parseInt(localStorage.getItem('starPoints') || 25)
$scope.currentWage = localStorage.getItem('currentWage') || 5
$scope.lastId = localStorage.getItem('lastId') || ""
$scope.revealQuestionId = localStorage.getItem('revealQuestionId') || ""
$scope.lastReadingId = localStorage.getItem('lastReadingId') || ""
$scope.showRedeemBonus = 0
getMaxWager()

if ($scope.revealQuestionId == $scope.lastId) $scope.hideQuestion = null

if ($scope.backgroundTutorial == "true")
{
  $timeout(function()
  {
    $ionicLoading.show({
      template: '<div class="bgTutorial">Press <i class="ion-easel" style="color:#00e461"></i> to change background</div>',
      duration: 2000
    })
  }, 60000)
}


if (localStorage.getItem('achievements') == undefined) 
{
  localStorage.setItem('achievements','[]');
}

if (localStorage.getItem('correctAnswers') == undefined) 
{
  localStorage.setItem('correctAnswers','[]');
}

if (localStorage.getItem('wrongAnswers') == undefined) 
{
  localStorage.setItem('wrongAnswers','[]');
}

$ionicModal.fromTemplateUrl('templates/search.html', {
   scope: $scope,
   animation: 'none'
 }).then(function(modal) {
   $scope.searchModal = modal;
   console.log("created")
 });

$ionicModal.fromTemplateUrl('templates/category.html', {
  scope: $scope,
  animation: 'none'
}).then(function(modal) {
  $scope.categoryModal = modal;
  console.log("created cat")
});

$ionicModal.fromTemplateUrl('templates/statistic.html', {
  scope: $scope,
  animation: 'none'
}).then(function(modal) {
  $scope.statisticModal = modal;
  console.log("created stat")
});

$ionicModal.fromTemplateUrl('templates/privacy.html', {
  scope: $scope,
  animation: 'none'
}).then(function(modal) {
  $scope.privacyModal = modal;
});

$scope.search = function() {
  if ($scope.things[$scope.indexToShow].mcqanswer && !$scope.hideQuestion && $scope.showInputBox == "true")
  {
    $scope.blockWagerEscape()    
    return
  }  
  $scope.searchThings();
  $scope.searchModal.show();
}

$scope.closeSearch = function() {
  $scope.searchModal.hide();
}

$scope.category = function() {
  if ($scope.things[$scope.indexToShow].mcqanswer && !$scope.hideQuestion && $scope.showInputBox == "true")
  {
    $scope.blockWagerEscape()    
    return
  }
  $scope.findUniqueCategory();
  $scope.categoryModal.show();
}

$scope.closeCategory = function() {
  $scope.categoryModal.hide();
}

$scope.statistic = function() {
  if ($scope.things[$scope.indexToShow].mcqanswer && !$scope.hideQuestion && $scope.showInputBox == "true")
  {
    $scope.blockWagerEscape()    
    return
  }  
  $scope.lastQuestionId = localStorage.getItem('lastQuestionId') || ""
  // $scope.findUniquePracticeCode();
  $scope.statisticModal.show();
}

$scope.closeStatistic = function() {
  $scope.statisticModal.hide();
}

$scope.privacy = function() {
  $scope.privacyModal.show();
}

$scope.closePrivacy = function() {
  $scope.privacyModal.hide();
}

$scope.showRatingDialog = function() {
  AppRate.promptForRating();
}

$scope.background = function() {
  localStorage.setItem('backgroundTutorial','false')
  $scope.backgroundCount = localStorage.getItem('backgroundCount') || 1
  $scope.backgroundCount = parseInt($scope.backgroundCount) + 1
  if ($scope.backgroundCount > 14) $scope.backgroundCount = 1
  localStorage.setItem('backgroundCount', $scope.backgroundCount)
  $scope.myBackground = "background_" + $scope.backgroundCount
}

$scope.askDoubleTap = function() {
  if ($scope.doubleTapTutorial == "true")
  {
    $timeout(function()
    {
      $ionicLoading.show({
        template: '<div class="bgTutorial">Double tap to select answer</div>',
        duration: 2000
      }) 
    }, 1000)
  }
}

$scope.askSetWager = function() {
  if ($scope.showWagerTutorial == "true")
  {
    // $timeout(function()
    // {
      $ionicLoading.show({
        template: '<div class="bgTutorial">Set your wager for the next question</div>',
        duration: 2500
      }) 
    // }, 1000)
  }
}

$scope.askSwipeQuestion = function() {
  console.log($scope.swipeQuestion)
  if ($scope.swipeQuestion == "true")
  {
    console.log("hello")
    $timeout(function()
    {
      $ionicLoading.show({
        template: '<div class="bgTutorial">Swipe left for next question</div>',
        duration: 2500
      }) 
    }, 2000)
  }
}

function askSwipeTutorial() {
  if ($scope.swipeTutorial == "false")
  {
    console.log("hello")
    $timeout(function()
    {
      $ionicLoading.show({
        template: '<div class="bgTutorial">Swipe left for next example</div>',
        duration: 2500
      }) 
    }, 3000)
  }
}

$scope.findUniqueCategory = function() {
  var lookup = {};
  var items = $scope.things;
  var result = [];

  for (var item, i = 0; item = items[i++];) {
    var name = item.category;

    if (!(name in lookup) && !item.mcqanswer) {
      lookup[name] = 1;
      result.push(name);
    }
  }  
  $scope.chapters = result
  console.log($scope.chapters)
}

$scope.searchThings = function() {
  var answeredQuestions = JSON.parse(localStorage.getItem('achievements','[]'));
  var answeredQuestionsCount = answeredQuestions.length
  
  var lookup = {};
  var items = $scope.things;
  var result = [];

  for (var item, i = 0; item = items[i++];) {
    var name = item.mcqanswer;
    if (!item.mcqanswer) 
    {
      result.push({"id":item.id,"category":item.category,"title":item.title,"item":item.item,"hashtag":item.hashtag});
    }
    else if (item.mcqanswer && answeredQuestionsCount > 0)
    {
      var answeredQuestionsExisted = false;
      answeredQuestionsExisted = contains.call(answeredQuestions, item.id);
      if (answeredQuestionsExisted == true)
      {
        result.push({"id":item.id,"category":item.category,"title":item.title,"item":item.item,"mcqanswer":item.mcqanswer});
      }
    }
  }  
  $scope.searchSample = result
  console.log($scope.searchSample)
}

$scope.findUniquePracticeCode = function() {

  var correctAnswers = JSON.parse(localStorage.getItem('correctAnswers','[]'));
  var wrongAnswers = JSON.parse(localStorage.getItem('wrongAnswers','[]'));

  var lookup = {};
  var items = $scope.things;
  var result = [];

  for (var item, i = 0; item = items[i++];) {
    var threeCharName = (item.id).substr(0,3);
    if (threeCharName == "mcq")
    {
      var code = (item.id).substr(0,6);

      if (!(code in lookup)) {
        lookup[code] = 1;
        result.push({"code":code,"category":item.category,"correct":0,"wrong":0,"questionCount":0});
      }
    }
  }  

  $scope.practiceCode = result
  
  for(var i=0;i<$scope.practiceCode.length;i++) 
  {
    for(var j=0;j<correctAnswers.length;j++)
    {
      if ((correctAnswers[j]).substr(0,6) == $scope.practiceCode[i].code)
      {
        $scope.practiceCode[i].correct = parseInt($scope.practiceCode[i].correct) + 1
      }
    }
    for(var k=0;k<wrongAnswers.length;k++)
    {
      if ((wrongAnswers[k]).substr(0,6) == $scope.practiceCode[i].code)
      {
        $scope.practiceCode[i].wrong = parseInt($scope.practiceCode[i].wrong) + 1
      }
    }    
    for(var l=0;l<items.length;l++)
    {
      if ((items[l]).id.substr(0,6) == $scope.practiceCode[i].code)
      {
        $scope.practiceCode[i].questionCount = parseInt($scope.practiceCode[i].questionCount) + 1
      }
    }     
  }

  console.log($scope.practiceCode)
}

function getMaxWager() {
  $scope.minWager = 5;
  $scope.maxWager = 5;
  // $scope.maxWager = Math.max(Math.floor($scope.myStarPoints / 500) * 100, 50);
  // if ($scope.myStarPoints<800) $scope.maxWager = 50;
  if ($scope.myStarPoints>=150) $scope.maxWager = 10;
  if ($scope.myStarPoints>=500) $scope.maxWager = 50;
  if ($scope.myStarPoints>=1500) $scope.maxWager = 100;
  if ($scope.myStarPoints>=8000) $scope.maxWager = 500;
  if ($scope.myStarPoints>=45000) $scope.maxWager = 1000;
  if ($scope.myStarPoints>=100000) $scope.maxWager = 5000;
  if ($scope.myStarPoints>=500000) $scope.maxWager = 10000;
  if ($scope.myStarPoints>=1300000) $scope.maxWager = 20000;
  if ($scope.myStarPoints>=2500000) $scope.maxWager = 50000;
  if ($scope.myStarPoints>=7800000) $scope.maxWager = 100000;
  if ($scope.currentWage > $scope.maxWager) 
    {
      $scope.currentWage = $scope.maxWager
      localStorage.setItem('currentWage',parseInt($scope.currentWage))
    }  
}

$scope.addWager = function(valueToAdd){
  if(valueToAdd>0)
  {
    if (($scope.currentPlatform == "ios" || $scope.currentPlatform == "android") && $scope.currentWage < $scope.maxWager) $cordovaNativeAudio.play('wager');
    if (valueToAdd <= $scope.maxWager)
    {
      $scope.currentWage = parseInt($scope.currentWage) + valueToAdd
      if ($scope.currentWage > $scope.maxWager) 
        {
          $scope.currentWage = $scope.maxWager
        }
    }
    else
    {
      console.log("coin disabled")
    }
  }
  else
  {
    $scope.currentWage = $scope.minWager
  }
  localStorage.setItem('currentWage',parseInt($scope.currentWage))
}

$scope.redeemBonus = function(bonusPoints) {
  $http.get('http://www.google.com', { timeout: 6000 })
  .success(function () 
  {
    // $scope.previousInputBoxStatus = null;
    window.plugins.AdMob.createInterstitialView();
    window.plugins.AdMob.showInterstitialAd(true, 
      function()
      {
        $scope.myStarPoints = parseInt($scope.myStarPoints) + parseInt(bonusPoints)
        localStorage.setItem('starPoints',$scope.myStarPoints)
        $scope.showRedeemBonus = 0
        $scope.$apply();
        $cordovaNativeAudio.play('redeem');
      },
      function(e)
      {
        $scope.myStarPoints = parseInt($scope.myStarPoints) + parseInt(bonusPoints)
        localStorage.setItem('starPoints',$scope.myStarPoints)
        $scope.showRedeemBonus = 0
        $scope.$apply();
        $cordovaNativeAudio.play('redeem');
        console.log(e);
      }
    );  
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    console.log(error);
    window.plugins.toast.showWithOptions(
      {message: "Ensure good internet connection",duration: 2500,position: "bottom",addPixelsY: -40,styling: {backgroundColor: '#bb0000',textColor: '#FFFFFF'} }
    )
  });
  // window.plugins.AdMob.createInterstitialView();
}

$scope.wagerNow = function(myQuestionId){
  $scope.hideQuestion = null
  $scope.showWagerTutorial = "false"
  localStorage.setItem('revealQuestionId',$scope.things[$scope.indexToShow].id)
  localStorage.setItem('showWagerTutorial','false')
  if ($scope.things[$scope.indexToShow].mcqanswer && $scope.doubleTapTutorial == "true" && $scope.showInputBox == "true") $scope.askDoubleTap()
}

$scope.blockWagerEscape = function(){
  console.log("Not answered yet")
  if ($scope.currentPlatform == "ios" || $scope.currentPlatform =="android")
  {
    if (!$scope.hideQuestion || $scope.hideQuestion == null)
    {
      window.plugins.toast.showWithOptions(
        {message: "Answer the current question",duration: 2500,position: "center",addPixelsY: -40,styling: {backgroundColor: '#ff0000',textColor: '#FFFFFF'} }
      ) 
    }
    else
    {
      window.plugins.toast.showWithOptions(
        {message: "Tap Let's Go",duration: 2500,position: "center",addPixelsY: -40,styling: {backgroundColor: '#ff0000',textColor: '#FFFFFF'} }
      )       
    }
  }    
}

$scope.change = function(direction){
	$scope.answerPlaceholder="Type your answer" 
  $scope.originalIndexToShow = $scope.indexToShow
  if ($scope.things[$scope.indexToShow].mcqanswer) 
    {
      $scope.isQuiz = "true"
    }
  else
    {
      $scope.isQuiz = "false"
    }
  if ($scope.things[$scope.indexToShow].mcqanswer && $scope.showInputBox == "true" && (direction == "left" || (direction == "right" && !$scope.hideQuestion)))
  {
    $scope.blockWagerEscape()    
    return
  }  
	if (direction == "left" && $scope.loadingError == false)
	{
    getMaxWager()
    $scope.leftSwipes = $scope.leftSwipes + 1
    $scope.askForRating = localStorage.getItem('askForRating') || "true";
    if ($scope.askForRating == "true" && $scope.leftSwipes % 35 == false)
    {
      $scope.showRatingDialog()
    }
    if ($scope.showRedeemBonus == 0 && $scope.leftSwipes <= 100 && $scope.leftSwipes % 17 == false)
    {
      $scope.showRedeemBonus = parseInt($scope.leftSwipes) * 10
    }  
    $scope.indexToShow = parseInt($scope.indexToShow) + 1;
		if ($scope.indexToShow == $scope.things.length && $scope.isQuiz == "true")
		{
      getFirstQuestionIndex()
		}
    else if ($scope.isQuiz == "false")
    {
      if ($scope.indexToShow == $scope.things.length || $scope.things[$scope.indexToShow].mcqanswer)
      {
        $scope.indexToShow = 0
      }
    }
    // clear swipe left tutorial for quiz
    if (!$scope.hideQuestion && $scope.isQuiz == "true" && $scope.swipeQuestion == "true")
    {
      $scope.swipeQuestion = "false"
      localStorage.setItem('askSwipeQuestion','false')
    }    
    $scope.thing = $scope.things[$scope.indexToShow]
    $scope.pageNumber = parseInt($scope.indexToShow) + 1
	}
	if (direction == "right" && $scope.loadingError == false)
	{
    $scope.indexToShow = parseInt($scope.indexToShow) - 1;
		if ($scope.indexToShow < 0)
		{
      if ($scope.isQuiz == "false")
      {
        getFirstQuestionIndex()
        if ($scope.jsonHasQuestion == false)
        {
          $scope.indexToShow = $scope.things.length - 1
        }
        else
        {
          $scope.indexToShow = $scope.indexToShow - 1; //the index just before first question
        }
      }
      else
      {
        $scope.indexToShow = $scope.things.length - 1
      }
		}  
    if ($scope.isQuiz == "true" && !$scope.things[$scope.indexToShow].mcqanswer)
    {
      $scope.indexToShow = $scope.things.length - 1
    }
    if ($scope.isQuiz == "true" && $scope.things[$scope.indexToShow].mcqanswer)
    {
      indexIsAnswered = isQuestionAnswered($scope.things[$scope.indexToShow].id)
      console.log(indexIsAnswered)
      if (indexIsAnswered == "false") 
      {
        $scope.indexToShow = $scope.originalIndexToShow
      }
    }    
    $scope.thing = $scope.things[$scope.indexToShow]
    $scope.pageNumber = parseInt($scope.indexToShow) + 1
	}
  if ($scope.isQuiz == "false" && $scope.swipeTutorial !== "true")
  {
    localStorage.setItem('swipeTutorial','true')
    $scope.swipeTutorial = "true"
  }
  if ($scope.indexToShow >= 0)
  {
    localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id)
    if (!$scope.things[$scope.indexToShow].mcqanswer)
    {
      localStorage.setItem('lastReadingId','')
      $scope.lastReadingId = null
    }
    answerModule();
    if ($scope.things[$scope.indexToShow].mcqanswer && $scope.showWagerTutorial == "true" && $scope.showInputBox == "true") $scope.askSetWager()
  }
};

function answerModule() {
  $scope.showInputBox = "false"
  var achievements = JSON.parse(localStorage.getItem('achievements','[]'));
  var achievementsCount = achievements.length
  var achievementExisted = false;
  $scope.hideQuestion = null  
  getMaxWager()
  if ($scope.things[$scope.indexToShow].answer || ($scope.things[$scope.indexToShow].structured && $scope.things[$scope.indexToShow].structured.length>0) || ($scope.things[$scope.indexToShow].moreexample && $scope.things[$scope.indexToShow].moreexample.length>0))
  {
    if (achievementsCount>0)
    {
      achievementExisted = contains.call(achievements, $scope.things[$scope.indexToShow].id);
    }
    if (achievementExisted == false && $scope.iapVersion == false)
    {
      $scope.showInputBox = "true"
    } 
    console.log($scope.showInputBox)
  }
  if ($scope.things[$scope.indexToShow].mcqanswer)
  {
    if (achievementsCount>0)
    {
      achievementExisted = contains.call(achievements, $scope.things[$scope.indexToShow].id);
    }    
    if (achievementExisted == false)
    {
      $scope.showInputBox = "true"
      if ($scope.revealQuestionId == $scope.things[$scope.indexToShow].id)
      {
        $scope.hideQuestion = null
      }  
      else
      {
        $scope.hideQuestion = "true"
      }    
    } 
    else
    {
      //nothing
    }   
  }
  else
  {
    askSwipeTutorial()
  }
  $scope.previousInputBoxStatus = $scope.showInputBox
}

$scope.submitAnswer = function(userAnswer) {
  if (userAnswer == undefined) userAnswer = "";
  console.log($scope.things[$scope.indexToShow].answer.toLowerCase().trim(), userAnswer.toLowerCase().trim())
  if ($scope.things[$scope.indexToShow].answer.toLowerCase().trim() == userAnswer.toLowerCase().trim())
  {
   var achievements = []
   achievements = JSON.parse(localStorage.getItem('achievements'));
   console.log(achievements)
   achievementExisted = contains.call(achievements, $scope.things[$scope.indexToShow].id);
   if (achievementExisted == false)
    {
      achievements.push($scope.things[$scope.indexToShow].id)
      localStorage.setItem('achievements',JSON.stringify(achievements))
    }
    $scope.showInputBox = "false"
  }
  else
  {
    $scope.answerPlaceholder="Try again. Or Get Answer"
  }
}

$scope.fillAnswer = function(thingId) {
  $http.get('http://www.google.com', { timeout: 6000 })
  .success(function () 
  {
    $scope.previousInputBoxStatus = null;
    window.plugins.AdMob.createInterstitialView();
    window.plugins.AdMob.showInterstitialAd(true, 
      function()
      {
        $scope.showInputBox = "false";
        $scope.$apply();
      },
      function(e)
      {
        $scope.showInputBox = "false";
        $scope.$apply();
        console.log(e);
      }
    );  
    var achievements = []
    achievements = JSON.parse(localStorage.getItem('achievements'));  
    achievements.push($scope.things[$scope.indexToShow].id)
    localStorage.setItem('achievements',JSON.stringify(achievements))
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    console.log(error);
    window.plugins.toast.showWithOptions(
      {message: "Ensure good internet connection",duration: 2500,position: "bottom",addPixelsY: -40,styling: {backgroundColor: '#bb0000',textColor: '#FFFFFF'} }
    )
  });
  // window.plugins.AdMob.createInterstitialView();
}

$scope.fillStructured = function(thingId) {
  $scope.structuredShowAd = true
  var structuredCount = JSON.parse(localStorage.getItem('structuredCount') || 0);
  if (structuredCount % 10 || structuredCount == 0) $scope.structuredShowAd = false //triggers when have remainder
  var newstructuredCount = structuredCount + 1

  if ($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") 
  {
    testUrl = "http://www.google.com"
  }
  else
  {
    testUrl = "https://jsonblob.com/api/jsonblob/1f61f57a-b1d6-11e6-871b-330772562403"
  }

  $http.get(testUrl, { timeout: 6000 })
  .success(function () 
  {
    localStorage.setItem('structuredCount',newstructuredCount)
    $scope.previousInputBoxStatus = null;
    if ($scope.structuredShowAd == true)
    {
      window.plugins.AdMob.createInterstitialView();
      window.plugins.AdMob.showInterstitialAd(true, 
        function()
        {
          $scope.showInputBox = "false";
          $scope.$apply();
        },
        function(e)
        {
          $scope.showInputBox = "false";
          $scope.$apply();
          console.log(e);
        }
      );
    }
    else
    {
      $scope.showInputBox = "false";
    }
    var achievements = []
    achievements = JSON.parse(localStorage.getItem('achievements'));  
    achievements.push($scope.things[$scope.indexToShow].id)
    localStorage.setItem('achievements',JSON.stringify(achievements))
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    // console.log(error);
    if ($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") 
    {
      window.plugins.toast.showWithOptions(
        {message: "Ensure good internet connection",duration: 2500,position: "bottom",addPixelsY: -40,styling: {backgroundColor: '#FF0000',textColor: '#FFFFFF'} }
      )
    }
  });
  // window.plugins.AdMob.createInterstitialView();
}


$scope.inAppPurchase = function() {
  var pingURL = ""
  $scope.showIAPMessage = "false"
  if ($scope.currentPlatform == "android" || $scope.currentPlatform == "ios")
  {
    pingURL = "https://s3-us-west-2.amazonaws.com/mindourenglish/iapMindOurEnglish.txt"
  }
  else
  {
    pingURL = "https://jsonblob.com/api/jsonblob/1f61f57a-b1d6-11e6-871b-330772562403"
  }
  
  $http.get(pingURL, { timeout: 6000 })
  .success(function () 
  {
    $scope.showIAPMessage = "true"
    if ($currentPlatform == "ios") $scope.$apply()
    console.log("show upgrade now")
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    console.log(error);
  });
}

$scope.checkAnswer = function(userAnswer) {
  achievements = JSON.parse(localStorage.getItem('achievements'));
  achievements.push($scope.things[$scope.indexToShow].id)
  localStorage.setItem('achievements',JSON.stringify(achievements))  
  localStorage.setItem('lastQuestionId',$scope.things[$scope.indexToShow].id)
  $scope.showInputBox = "false"
  console.log(userAnswer)
  if ($scope.things[$scope.indexToShow].mcqanswer.toLowerCase().trim() == userAnswer.toLowerCase().trim())
  {
    $scope.correctAnswer()
  }
  else
  {
    $scope.wrongAnswer()
  }
  if ($scope.doubleTapTutorial == "true")
  {
    localStorage.setItem('doubleTapTutorial','false')
    $scope.doubleTapTutorial = "false" 
  }
  $scope.previousInputBoxStatus = "false"
  $scope.askSwipeQuestion()
}

$scope.correctAnswer = function() {
  console.log($scope.thing.mcqanswer)
    $ionicLoading.show({
      template: '<div><img src="img/correct_1.gif"></div>',
      duration: 4200,
      showBackdrop: false
    })
    if ($scope.currentPlatform == "ios" || $scope.currentPlatform == "android") 
      {
        if ($scope.currentWage <= 100)
        {
          $cordovaNativeAudio.play('winsmall');
        }
        else
        {
          $cordovaNativeAudio.play('winbig');
        }
      }
    $scope.myStarPoints = $scope.myStarPoints + parseInt($scope.currentWage)
    localStorage.setItem('starPoints',$scope.myStarPoints)
    correctAnswers = JSON.parse(localStorage.getItem('correctAnswers'));
    correctAnswers.push($scope.things[$scope.indexToShow].id)
    localStorage.setItem('correctAnswers',JSON.stringify(correctAnswers))    
}

$scope.wrongAnswer = function() { 
  $ionicLoading.show({
    template: '<div class="moneyfly">Wrong!</div><div><img src="img/wrong_1.gif" class="moneywings"></div>',
    duration: 5000,
    showBackdrop: false
  }) 
   if ($scope.currentPlatform == "ios" || $scope.currentPlatform == "android") 
    {
      $cordovaNativeAudio.play('losesmall'); 
    }  
  $scope.myStarPoints = $scope.myStarPoints - parseInt($scope.currentWage)
  localStorage.setItem('starPoints',$scope.myStarPoints)  
  wrongAnswers = JSON.parse(localStorage.getItem('wrongAnswers'));
  wrongAnswers.push($scope.things[$scope.indexToShow].id)
  localStorage.setItem('wrongAnswers',JSON.stringify(wrongAnswers))      
}

$scope.jumpToId = function(Id) {
  for(var i=0;i<$scope.things.length;i++) 
  {
    if ($scope.things[i].id == Id) $scope.indexToShow = i;
  }  
  console.log($scope.indexToShow)
  $scope.thing = $scope.things[$scope.indexToShow]
  $scope.pageNumber = parseInt($scope.indexToShow) + 1
  localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id)
  if (!$scope.things[$scope.indexToShow].mcqanswer)
  {
    localStorage.setItem('lastReadingId','')
    $scope.lastReadingId = null
  }  
  answerModule()
  if ($scope.searchModal.isShown()) $scope.searchModal.hide();
  if ($scope.categoryModal.isShown()) $scope.categoryModal.hide();
}

$scope.jumpToQuestionId = function(Id) {
  if (!$scope.things[$scope.indexToShow].mcqanswer)
  {
    localStorage.setItem('lastReadingId',$scope.things[$scope.indexToShow].id)
    $scope.lastReadingId = $scope.things[$scope.indexToShow].id
  }
  if (Id == "")
  {
    getFirstQuestionIndex()   
    if ($scope.jsonHasQuestion == true)
    {
      var max = $scope.things.length - 1
      var min = $scope.indexToShow
      $scope.indexToShow = Math.floor(Math.random()*(max-min+1)+min);
    }    
  }
  else
  {
    for(var i=0;i<$scope.things.length;i++) 
    {
      if ($scope.things[i].id == Id) 
        {
          $scope.indexToShow = i + 1;
          if ($scope.indexToShow == $scope.things.length) 
            {
              getFirstQuestionIndex()
            }
          break;
        }
    }
  } 
  console.log($scope.indexToShow)
  $scope.thing = $scope.things[$scope.indexToShow]
  $scope.pageNumber = parseInt($scope.indexToShow) + 1
  localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id)
  answerModule()
  $scope.statisticModal.hide();
}

$scope.jumpToCategory = function(category) {
  console.log(category)
  var categoryFound = false
  for(var i=0;i<$scope.things.length;i++) 
  {
   // console.log($scope.things[i].category)
   if ($scope.things[i].category == category) 
    {
      $scope.indexToShow = i;
      categoryFound = true
      break
    }
  }  
  if (categoryFound == false) console.log("Not found")
  console.log($scope.indexToShow)
  $scope.thing = $scope.things[$scope.indexToShow]
  $scope.pageNumber = parseInt($scope.indexToShow) + 1
  localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id)
  localStorage.setItem('lastReadingId','')
  $scope.lastReadingId = null
  answerModule()
  $scope.categoryModal.hide();
}

$scope.checkInstallation = function() {
  if ($scope.currentPlatform == "ios")
  {
    appAvailability.check(
        'whatsapp://', // URI Scheme
        function() {  // Success callback
            $scope.hasWhatsApp = "true"
        },
        function() {  // Error callback
            console.log('WhatsApp is not available');
        }
    );
    appAvailability.check(
        'twitter://', // URI Scheme
        function() {  // Success callback
            $scope.hasTwitter = "true"
        },
        function() {  // Error callback
            console.log('Twitter is not available');
        }
    );        
    appAvailability.check(
        'fb://', // URI Scheme
        function() {  // Success callback
            $scope.hasFacebook = "true"
        },
        function() {  // Error callback
            console.log('Facebook is not available');
        }
    );
    appAvailability.check(
        'instagram://', // URI Scheme
        function() {  // Success callback
            $scope.hasInstagram = "true"
        },
        function() {  // Error callback
            console.log('Instagram is not available');
        }
    );     
  }
  if ($scope.currentPlatform == "android")
  {
    appAvailability.check(
        'com.whatsapp', // URI Scheme
        function() {  // Success callback
            $scope.hasWhatsApp = "true"
        },
        function() {  // Error callback
            console.log('WhatsApp is not available');
        }
    );
    appAvailability.check(
        'com.twitter.android', // URI Scheme
        function() {  // Success callback
            $scope.hasTwitter = "true"
        },
        function() {  // Error callback
            console.log('Twitter is not available');
        }
    );        
    appAvailability.check(
        'com.facebook.katana', // URI Scheme
        function() {  // Success callback
            $scope.hasFacebook = "true"
        },
        function() {  // Error callback
            console.log('Facebook is not available');
        }
    );
    appAvailability.check(
        'com.instagram.android', // URI Scheme
        function() {  // Success callback
            $scope.hasInstagram = "true"
        },
        function() {  // Error callback
            console.log('Instagram is not available');
        }
    );    
  }  
}

$scope.screenshot = function(socialMedia,myTitle,myUrl) {
  $scope.previousInputBoxStatus = $scope.showInputBox
  $scope.showInputBox = "true"
  $scope.noscreenshot = false
  $scope.nowSharing = true
  // ionic.Platform.fullScreen()
  $scope.hideBanner()
  $timeout(function()
  {
    navigator.screenshot.URI(function(error,res){
      if(error){
        console.error(error);
      }
      else
      {
        // iOS link – "/private/var/mobile/Containers/Data/Application/08C1C25C-9EB1-4A03-B266-9FF5BAFEAA84/tmp/myScreenShot.jpg"
        if (socialMedia == "WhatsApp") 
        {
          $scope.shareWhatsApp(res.URI,myTitle,myUrl)
        }
        if (socialMedia == "Twitter") 
        {
          //override from page.html
          myTitle = "#english #learnenglish #englishcourse #toefl #ielts #toeic #inglese #grammar #vocabulary"
          $scope.shareTwitter(res.URI,myTitle,myUrl)
        }
        if (socialMedia == "Facebook") 
        {
          //override from page.html
          myTitle = "#english #englishclass #learnenglish #englishlearning #languagelearning #englishteacher #englishstudents #englishcourse #englishlesson #twinglish #tefl #toefl #tesol #ielts #toeic #ieltswriting #ieltstest #toefltest #ieltspreparation #improveyourenglish #grammar #vocabulary #idiom #idioms #inglese"
          $scope.shareFacebook(res.URI,myTitle,myUrl)
        }
        if (socialMedia == "Instagram") 
        {
          //override from page.html
          myTitle = "#english #englishclass #learnenglish #englishlearning #languagelearning #englishteacher #englishstudents #englishcourse #englishlesson #twinglish #tefl #toefl #tesol #ielts #toeic #ieltswriting #ieltstest #toefltest #ieltspreparation #improveyourenglish #grammar #vocabulary #idiom #idioms #inglese"
          $scope.shareInstagram(res.URI,myTitle,myUrl)
        }        
      }
    },'png',20); // 'myScreenShot' parameter added if use .save method
  },800);
}

$scope.showActions = function() {
  var shareOptions = []

 if ($scope.hasWhatsApp) shareOptions.push({text:'WhatsApp'});
 if ($scope.hasTwitter) shareOptions.push({text:'Twitter'});
 if ($scope.hasFacebook) shareOptions.push({text:'Facebook'});
 if ($scope.hasInstagram) shareOptions.push({text:'Instagram'});
 var hideSheet = $ionicActionSheet.show({
   buttons: shareOptions,
   // destructiveText: 'Delete',
   titleText: 'Share in',
   cancelText: 'Cancel',
   cancel: function() {
        // add cancel code..
      },
   destructiveButtonClicked: function() {
        // add delete code..
      },        
   buttonClicked: function(index) {
     switch (index){
      case 0 :
        $scope.screenshot('WhatsApp','','');
        console.log (index);
        return true;
      case 1 :
        $scope.screenshot('Twitter','','');
        console.log (index);
        return true;
      case 2 :
        $scope.screenshot('Facebook','','');
        console.log (index);
        return true;
      case 3 :
        $scope.screenshot('Instagram','','');
        console.log (index);
        return true;        
      }  
     return true;
   }
 });
 // $timeout(function() {
   // hideSheet();
 // }, 3000);
};

$scope.shareWhatsApp = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaWhatsApp(myTitle.trim(), image, myUrl, 
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.shareTwitter = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaTwitter(myTitle.trim(), image, myUrl, 
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.shareFacebook = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaFacebookWithPasteMessageHint(myTitle.trim(), image, null, 'If you like, you can paste the title',
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.shareInstagram = function(image,myTitle,myUrl) {
  window.plugins.socialsharing
  .shareViaInstagram(myTitle.trim(), image, 
  function() { if ($scope.currentPlatform == "ios") refreshScreen(); }, 
  function(errormsg) { if ($scope.currentPlatform == "ios") refreshScreen(); })
}

$scope.addLocalNotification = function() {
    var taskId = 'MindOurEnglish001'
    var projectTitle = 'Mind Our English'
    var taskTitle = 'We miss you.'
    var addTime = 86400000 * 14
    var currentDate = (new Date)
    var alarmTime = new Date(currentDate.getTime() + addTime)    
    if (alarmTime)
    {
      $cordovaLocalNotification.add({
          id: taskId,
          at: alarmTime,
          text: taskTitle,
          title: projectTitle,
          icon: "file://img/icon.png",
          sound: "res://platform_default",
          led: "00FF00",
          data: ""
      }).then(function () {
          console.log(alarmTime)
      });
    }
};

$scope.textToSpeech = function(textToReadOut) {
  TTS.speak({text:textToReadOut,locale:'en-GB',rate:1.00}, function () {
          console.log(textToReadOut);
      }, function (reason) {
        window.plugins.toast.showWithOptions(
          {message: reason,duration: 2500,position: "bottom",addPixelsY: -40,styling: {backgroundColor: '#bb0000',textColor: '#FFFFFF'} }
        )
      });   
}

$scope.hideBanner = function() {
  window.plugins.AdMob.destroyBannerView();
}

$scope.showBannerAgain = function() {
  if ($scope.nowSharing == true && $scope.iapVersion == false)
  {
    console.log("try to create banner view")
    $scope.nowSharing = false
    initAd();
    window.plugins.AdMob.createBannerView();
    $timeout(function(){window.plugins.AdMob.showAd(true, function(){},function(e){console.log(e);});}, 2000); 
  }

}


/////////////////////////////////////////////

function initAd(){
  if ( window.plugins && window.plugins.AdMob ) 
  {
    var ad_units = {
      ios : {
        banner: 'ca-app-pub-1139669262221691/6210622163',
        interstitial: 'ca-app-pub-1139669262221691/9164088560'
      },
      android : {
        banner: 'ca-app-pub-1139669262221691/4594288163',
        interstitial: 'ca-app-pub-1139669262221691/6071021365'
      },
      wp8 : {
        banner: 'ca-app-pub-6869992474017983/8878394753',
        interstitial: 'ca-app-pub-6869992474017983/1355127956'
      }
    };
    var admobid = "";
    if( /(android)/i.test(navigator.userAgent) ) {
      admobid = ad_units.android;
    } else if(/(iphone|ipad)/i.test(navigator.userAgent)) {
      admobid = ad_units.ios;
    } else {
      admobid = ad_units.wp8;
    }
    window.plugins.AdMob.setOptions( {
      publisherId: admobid.banner,
      interstitialAdId: admobid.interstitial,
            bannerAtTop: false, // set to true, to put banner at top
            overlap: true, // set to true, to allow banner overlap webview
            offsetTopBar: true, // set to true to avoid ios7 status bar overlap
            isTesting: false, // receiving test ad
            autoShow: true // auto show interstitial ad when loaded
          });
      registerAdEvents();
  } else {
    console.log('admob plugin not ready');
  }
}

// optional, in case respond to events
function registerAdEvents() {
  document.addEventListener('onReceiveAd', function(){});
  document.addEventListener('onFailedToReceiveAd', function(data){});
  document.addEventListener('onPresentAd', function(){});
  document.addEventListener('onDismissAd', function(){ });
  document.addEventListener('onLeaveToAd', function(){ });
  document.addEventListener('onReceiveInterstitialAd', function(){ });
  document.addEventListener('onPresentInterstitialAd', function(){ });
  document.addEventListener('onDismissInterstitialAd', function(){ });
}

function getNotes() {
  $scope.things = JSON.parse(localStorage.getItem('things')) || [];
  $scope.lastId = localStorage.getItem('lastId') || '';
  // var osLocalJsonPath = ""
  if($scope.currentPlatform == "android") osLocalJsonPath = "/android_asset/www/js/mindourenglish2.txt"
  if($scope.currentPlatform == "ios") osLocalJsonPath = "js/mindourenglish2.txt"

  if(($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") && ($scope.things == "" || $scope.things.length < 1000)){
      $http
      .get(osLocalJsonPath)
      .then(function(response)
        { 
          console.log(response.data); 
          localStorage.setItem('things',JSON.stringify(response.data)); 
          loadThingsLocalStorage();
          $timeout(function()
          {
            setThingMobileDeviceLocalStorage();
          }, 7000);
        });
  }
  else if (($scope.currentPlatform == "android" || $scope.currentPlatform == "ios") && $scope.things != "")
  {
    loadThingsLocalStorage();
    $timeout(function()
    {
      setThingMobileDeviceLocalStorage();
    }, 7000);    
  }
  else
  {
    setThingDesktopDeviceLocalStorage();
  }
}

$scope.filterByMCQAnswer = function(pages) {
  return pages.mcqanswer == null
}

function getFirstQuestionIndex() {
  $scope.indexToShow = 0
  $scope.jsonHasQuestion = false
  for(var i=0;i<$scope.things.length;i++) 
  {
    if ($scope.things[i].mcqanswer) 
      {
        $scope.indexToShow = i;
        $scope.jsonHasQuestion = true;
        break;
      }
  }  
  console.log($scope.indexToShow)
}

function isQuestionAnswered(indexId) {
  var answeredQuestions = JSON.parse(localStorage.getItem('achievements','[]'));
  var answeredQuestionsCount = answeredQuestions.length
  var answeredQuestionsExisted = false;
  if (answeredQuestionsCount > 0)
  {
    answeredQuestionsExisted = contains.call(answeredQuestions, indexId);    
    if (answeredQuestionsExisted == true) return "true"    
  }
  return "false"
}

function loadThingsLocalStorage() {
  $scope.things = JSON.parse(localStorage.getItem('things')) || [];

  for(var i=0;i<$scope.things.length;i++) 
  {
    if ($scope.things[i].id == $scope.lastId) 
      {
        $scope.indexToShow = i;
        break;
      }
  } 
  if (!$scope.indexToShow) 
  {
    getFirstQuestionIndex()
    if ($scope.jsonHasQuestion == true)
    {
      var max = $scope.things.length - 1
      var min = $scope.indexToShow
      $scope.indexToShow = Math.floor(Math.random()*(max-min+1)+min);
    }
    localStorage.setItem('lastId',$scope.things[$scope.indexToShow].id)
  }

  console.log($scope.indexToShow)
  // $scope.indexToShow = 449
  $scope.thing = $scope.things[$scope.indexToShow]
  $scope.pageNumber = parseInt($scope.indexToShow) + 1
  answerModule() 
  if ($scope.things[$scope.indexToShow].mcqanswer && $scope.doubleTapTutorial == "true" && $scope.showInputBox == "true" && !$scope.hideQuestion) $scope.askDoubleTap()
}

function setThingMobileDeviceLocalStorage() {
  var myRandomNumber = Math.floor(Math.random() * 60000) + 1  
  var notesAwsLink = "https://s3-us-west-2.amazonaws.com/mindourenglish/mindourenglish2.txt?r=" + myRandomNumber
  $http.get(notesAwsLink, { timeout: 30000 })
  .success(function (fullnotes) 
  {
    localStorage.setItem('things',JSON.stringify(fullnotes));
    console.log("got notes")
    //reset things according to cloud
    $scope.things = JSON.parse(localStorage.getItem('things')) || [];
  })
  .catch(function(error) {
    // Catch and handle exceptions from success/error/finally functions
    console.log(error);
  });
}

function setThingDesktopDeviceLocalStorage() {
  // var notesLink = "https://jsonblob.com/api/jsonblob/cb9ae5b0-b3d9-11e6-871b-8f073a81e66e" // adelene
  var notesLink = "https://jsonblob.com/api/jsonblob/1f61f57a-b1d6-11e6-871b-330772562403" // benny
  // var notesLink = "js/document.json"
  $http.get(notesLink, { timeout: 30000 })
  .success(function (fullnotes) 
  {
    localStorage.setItem('things',JSON.stringify(fullnotes));
    loadThingsLocalStorage()
  });
}

function onResume() {
  if ($scope.currentPlatform == "android")
  {
    refreshScreen()
  }
}  

function refreshScreen() {
  if ($scope.previousInputBoxStatus)
  {
    $scope.showInputBox = $scope.previousInputBoxStatus
    console.log($scope.showInputBox)
  }
  $scope.noscreenshot = true; 
  $scope.showBannerAgain(); 
  $scope.$apply();  
}

})