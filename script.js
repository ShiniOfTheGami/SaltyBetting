// ==UserScript==
// @name ShiniOfTheGami's automated Tournament mode!
// @namespace https://github.com/ShiniOfTheGami/SaltyBetting
// @description A script that bets during saltybet tournaments for you.
// @version 1.5
// @match *://www.saltybet.com
// @grant none
// @updateURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// @downloadURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// ==/UserScript==

var CSS_ID = "saltybetting-css",
TOGGLE_BUTTON_CONTAINER_ID = "saltybetting-toggle-button-container",
TOGGLE_BUTTON_ID = "saltybetting-toggle-button",
REMOVE_HTML_BUTTON_ID = "saltybetting-remove-html-button",
PREDICTION_URL = "http://saltybetting.thedreamsanctuary.com/getPrediction.php",
cssURL = "http://rawgit.com/ShiniOfTheGami/SaltyBetting/master/script.css",
isAlreadyRunning = false,
baseBet = 100,
minBetValue = 10,
enabled = getPreferenceBoolean("enableBetting",false),
hideHTML = getPreferenceBoolean("hideHTML",false),
prediction = {
	side: "none",
	odds: 0.5
},
lastMatch = {
	red: "none",
	blue: "none",
	winner: "none",
};


var buttonHTML = "<div class=\"onoffswitch\">" +
"<input type=\"checkbox\" name=\"onoffswitch\" class=\"onoffswitch-checkbox\" id=\""+TOGGLE_BUTTON_ID+"\">" +
    "<label class=\"onoffswitch-label\" for=\""+TOGGLE_BUTTON_ID+"\">" +
        "<span class=\"onoffswitch-inner\"></span>" +
        "<span class=\"onoffswitch-switch\"></span>" +
    "</label>" +
"</div>",
removeExtraHTMLButton = "<div style=\"color:#4db044;cursor:pointer;\">Remove extra HTML</div>";


if(thingTimer){
	window.clearInterval(thingTimer);
	removeHTMLButton();
	removeToggleButton();
	removeCSS();
}

function checkBettingStateChange(){
	var previous = enabled;
	enabled = $('#' + TOGGLE_BUTTON_ID).prop("checked");
	if(!(previous === enabled)){
		if(enabled){
			console.log("Enabled SaltyBetting Script");
		}else{
			console.log("Disabled SaltyBetting Script");
		}
	}
}

function getPrediction(red, blue, doneFct){
	var dataObject = {
		red: red,
		blue: blue
	}
	$.ajax({ type: "POST",
			 url: PREDICTION_URL,
			 data: dataObject,
			 dataType:"json",
			 cache: false,
			 success: function(response)
			 {
				 if(response.status=="success"){
					 prediction.side = response.prediction;
					 prediction.odds = response.odds;
					 console.log("Prediction:" + response.prediction + ", Odds: " + response.odds);
				 }else{
					 prediction.side = "none";
					 prediction.odds = 0.5;
					 console.log("No Prediction : " + response.msg);
				 }
			 }
	}).always(function(){
		if(doneFct != undefined){
			doneFct();
		}
	});
}

function doTheThing() {
	updateLastMatchData();
	if(!(enabled && isLoggedIn())){
		return;
	}
    if(!isAlreadyRunning){
		isAlreadyRunning = true;

		if(!(bettingClosed() || playerHasBet())) {
			console.log("Getting Prediction.");
			getPrediction(getCharacter("red"), getCharacter("blue"), function(){
				console.log("Done fetching prediction, betting.");
				if(isTournamentMode()) {
					handleTournament();
				}else{
					handleNormalMode();
				}
				console.log("Resetting isAlreadyRunning flag.");
				isAlreadyRunning = false;
			});
		}else{
			isAlreadyRunning = false;
		}
	}
}

function handleNormalMode(){
	if(prediction.side != "none"){
		var amount = Math.round(baseBet*prediction.odds);
		amount = (amount < minBetValue) ? minBetValue : amount;
		bet(amount, prediction.side);
	}else{
		bet(minBetValue, getRandomSide());
	}
}

function handleTournament() {
  console.log("Tournament mode - bets open and no bet by player yet");
	var side;
	if(prediction.side != "none"){
		side = prediction.side;
	}else{
		console.log("Choosing random side");
		side = getRandomSide();
	}
	console.log("Side : " + side);
	allIn(side);
}

function addCSS(){
	console.log("Appending custom CSS");
	$("head").append("<link rel=\"stylesheet\" type=\"text/css\" href=\""+cssURL+"\" id=\""+CSS_ID+"\" />");
}

function removeCSS(){
	$("#" + CSS_ID).remove();
}

function addToggleButton(){
	console.log("Appending toggle button");
	$("ul.nav > li:first-child").before("<li id=\""+TOGGLE_BUTTON_CONTAINER_ID+"\">"+buttonHTML+"</li>");
	if(enabled){
		$("#" + TOGGLE_BUTTON_ID).prop('checked', true);
	}
	$("#" + TOGGLE_BUTTON_ID).change(function(){
		if($(this).is(":checked")){
			enabled = true;
			setPreference("enableBetting", true);
			return;
		}
		enabled = false;
		setPreference("enableBetting", false);
	});
}

function removeToggleButton(){
	$("#" + TOGGLE_BUTTON_CONTAINER_ID).remove();
}

function addHTMLButton(){
	console.log("Appending HTML removal button");
	$("ul.nav > li:first-child").before("<li id=\""+REMOVE_HTML_BUTTON_ID+"\">"+removeExtraHTMLButton+"</li>");
	if(hideHTML){
		$('#' + REMOVE_HTML_BUTTON_ID + " > div").click(function(){
				window.location.reload();
				setPreference("hideHTML", false);
		});
		$('#' + REMOVE_HTML_BUTTON_ID + " > div").text("Re-add extra html");
		removeExtraHTML();
	}else{
		$('#' + REMOVE_HTML_BUTTON_ID + " > div").click(function(){
			setPreference("hideHTML", true);
			removeExtraHTML();
			$(this).text("Re-add extra html");
			$(this).unbind("click");
			$(this).click(function(){
					window.location.reload();
					setPreference("hideHTML", false);
			});
		});
	}

}

function removeHTMLButton(){
	$("#" + REMOVE_HTML_BUTTON_ID).remove();
}

function bet(amount, side){
	if(bettingClosed()){
		console.log("Betting is closed, aborting bet!");
		return;
	}
	amount = (amount > balance) ? balance : amount;
	$("#wager").val(amount);
	if(side === "red"){
		$('#player1').click();
	}else if(side === "blue"){
		$('#player2').click();
	}else{
		console.log("Invalid side : " + side);
		return;
	}
	console.log("Betting " + amount + "$ on " + side + " : " + getCharacter(side) + " on the match: " + getMatch());
}

function allIn(side){
	bet(balance, side);
}

function bettingClosed() {
	return betstate === "locked" || !betStateContains("OPEN");
}

function betStateContains(content){
	return ($('#betstatus').html().indexOf(content)> -1);
}

function getMatch(){
	return p1n + " vs. " + p2n;
}

function getCharacter(side){
	if(side == "red"){
		return p1n;
	}else{
		return p2n;
	}
}

function getRandomSide(){
	var selection = getRandomNumber(1,2);
	if(selection === 1){
		return "red";
	}else{
		return "blue";
	}
}

function getRandomNumber(min, max){
	return Math.floor((Math.random() * max) + min);
}

function playerHasBet() {
	return checkExists('#betconfirm');
}

function isTournamentMode() {
	return checkExists('#tournament-note') || checkExists('span#balance.dollar.purpletext');
}

function updateLastMatchData(){
	var winner = getWinner();
	if(winner === ""){
		return;
	}
	if(lastMatch["red"] === p1n && lastMatch["blue"] === p2n){
		return;
	}

	lastMatch["red"] = p1n;
	lastMatch["blue"] = p2n;
	lastMatch["winner"] = winner;
	console.log("Winner: " + winner + " on " + p1n + " vs. " + p2n + " | ODDS: " + getOdds("both"));
}

function getOdds(side){
	if(side == "red"){
		return p1te;
	}else if(side == "blue"){
		return p2te;
	}else{
		return p1te + " <> " + p2te;
	}
}

function getWinner(){
	if($('#betstatus').length){
		var content = $('#betstatus').html();
		if(content.indexOf("wins!") > -1){
			var winner = content.split(" wins!")[0];
			return winner;
		}
	}
	return "";
}

function checkExists(element) {
	if($(element).length){
	return true;
	}
	return false;
}

function setPreference(key, value) {
	try {
		if (localStorage !== undefined) {
			localStorage.setItem('steamdb-minigame/' + key, value);
		}
	} catch (e) {
		console.log(e); // silently ignore error
	}
}

function getPreference(key, defaultValue) {
	try {
		if (localStorage !== undefined) {
			var result = localStorage.getItem('steamdb-minigame/' + key);
			return (result !== null ? result : defaultValue);
		}
	} catch (e) {
		console.log(e); // silently ignore error
		return defaultValue;
	}
}

function getPreferenceBoolean(key, defaultValue) {
	return (getPreference(key, defaultValue.toString()) == "true");
}

function removeExtraHTML(){
	$('#sbettorswrapper').remove();
	$('#stream').remove();
	$('#chat-wrapper').remove();
	$('#bottomcontent').width('100%');
}

function setBaseBetValue(){
	var modifier = 1;
	if(balance > 10000000){ //10 million
		modifier = 1000;
	}else if(balance > 2000000){ //2 million
		modifier = 100;
	}else if(balance > 200000){ //200 k
		modifier = 10;
	}
	baseBet *= modifier;
	minBetValue *= modifier;
}

function isLoggedIn(){
	return (balance != 0);
}

var setup = function(){
	addCSS();
	addToggleButton();
	addHTMLButton();
	setBaseBetValue();
}();
var thingTimer = window.setInterval(doTheThing, 1000);
