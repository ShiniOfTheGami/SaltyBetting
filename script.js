// ==UserScript==
// @name ShiniOfTheGami's automated Tournament mode!
// @namespace https://github.com/ShiniOfTheGami/SaltyBetting
// @description A script that bets during saltybet tournaments for you.
// @version 1.0.2
// @match *://www.saltybet.com
// @grant none
// @updateURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// @downloadURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// ==/UserScript==

var CSS_ID = "saltybetting-css";
var TOGGLE_BUTTON_CONTAINER_ID = "saltybetting-toggle-button-container";
var TOGGLE_BUTTON_ID = "saltybetting-toggle-button";

var cssURL = "http://rawgit.com/ShiniOfTheGami/SaltyBetting/master/script.css";

var isAlreadyRunning = false;
var enabled = false;

var buttonHTML = "<div class=\"onoffswitch\">" + 
"<input type=\"checkbox\" name=\"onoffswitch\" class=\"onoffswitch-checkbox\" id=\""+TOGGLE_BUTTON_ID+"\">" +
    "<label class=\"onoffswitch-label\" for=\""+TOGGLE_BUTTON_ID+"\">" +
        "<span class=\"onoffswitch-inner\"></span>" +
        "<span class=\"onoffswitch-switch\"></span>" +
    "</label>" +
"</div>";


if(thingTimer){
	window.clearInterval(thingTimer);
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

function doTheThing() {
	checkBettingStateChange();
	if(!enabled){
		return;
	}
    if(!isAlreadyRunning){
		isAlreadyRunning = true;
		
		if(!(bettingClosed() || playerHasBet())) {
			if(isTournamentMode()) {
				handleTournament();
			}else{
				handleNormalMode();
			}
		}
		
		isAlreadyRunning = false;
	}
}

function handleNormalMode(){
// TODO
}

function handleTournament() {
    console.log("Tournament mode - bets open and no bet by player yet");
	console.log("Choosing random side");
	var side = getRandomSide();
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
	$("div#nav-menu > ul > li:first-child").before("<li id=\""+TOGGLE_BUTTON_CONTAINER_ID+"\">"+buttonHTML+"</li>");
}

function removeToggleButton(){
	$("#" + TOGGLE_BUTTON_CONTAINER_ID).remove();
}

function bet(amount, side){
	if(bettingClosed()){
		console.log("Betting is closed, aborting bet!");
		return;
	}
	$("#wager").val(amount);
	if(side === "red"){
		$('#player1').click();
	}else if(side === "blue"){
		$('#player2').click();
	}else{
		console.log("Invalid side : " + side);
		return;
	}
	console.log("Betting " + amount + "$ on " + side); 
}

function allIn(side){
	bet(balance, side);
}

function bettingClosed() {
	return betstate === "locked";
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
	return checkExists('#tournament-note');
}

function checkExists(element) {
	if($(element).length){
	return true;
	}
	return false;
}

var setup = function(){
	addCSS();
	addToggleButton();
}();
var thingTimer = window.setInterval(doTheThing, 10000);
