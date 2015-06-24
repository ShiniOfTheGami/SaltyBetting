// ==UserScript==
// @name ShiniOfTheGami's automated Tournament mode!
// @namespace https://github.com/ShiniOfTheGami/SaltyBetting
// @description A script that bets during saltybet tournaments for you.
// @version 1.1.2
// @match *://www.saltybet.com
// @grant none
// @updateURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// @downloadURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// ==/UserScript==

var CSS_ID = "saltybetting-css";
var TOGGLE_BUTTON_CONTAINER_ID = "saltybetting-toggle-button-container";
var TOGGLE_BUTTON_ID = "saltybetting-toggle-button";
var REMOVE_HTML_BUTTON_ID = "saltybetting-remove-html-button";

var cssURL = "http://rawgit.com/ShiniOfTheGami/SaltyBetting/master/script.css";

var isAlreadyRunning = false;
var enabled = getPreferenceBoolean("enableBetting",false);

var lastMatch = {
	red: "none",
	blue: "none",
	winner: "none"
}

var buttonHTML = "<div class=\"onoffswitch\">" + 
"<input type=\"checkbox\" name=\"onoffswitch\" class=\"onoffswitch-checkbox\" id=\""+TOGGLE_BUTTON_ID+"\">" +
    "<label class=\"onoffswitch-label\" for=\""+TOGGLE_BUTTON_ID+"\">" +
        "<span class=\"onoffswitch-inner\"></span>" +
        "<span class=\"onoffswitch-switch\"></span>" +
    "</label>" +
"</div>";

var removeExtraHTMLButton = "<div style=\"color:#4db044;cursor:pointer;\" onclick=\"javascript:$('#sbettorswrapper').remove();$('#stream').remove();$('#chat-wrapper').remove();$('#bottomcontent').width('100%');\">Remove extra HTML</div>";


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

function doTheThing() {
	updateLastMatchData();
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
	bet(1, getRandomSide());
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
	$("div#nav-menu > ul > li:first-child").before("<li id=\""+REMOVE_HTML_BUTTON_ID+"\">"+removeExtraHTMLButton+"</li>");
}

function removeHTMLButton(){
	$("#" + REMOVE_HTML_BUTTON_ID).remove();
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


var setup = function(){
	addCSS();
	addToggleButton();
	addHTMLButton();
}();
var thingTimer = window.setInterval(doTheThing, 1000);
