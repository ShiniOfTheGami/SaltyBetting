// ==UserScript==
// @name ShiniOfTheGami's automated Tournament mode!
// @namespace https://github.com/ShiniOfTheGami/SaltyBetting
// @description A script that bets during saltybet tournaments for you.
// @version 0.0.2
// @match *://www.saltybet.com
// @grant none
// @updateURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// @downloadURL https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.js
// ==/UserScript==

var isAlreadyRunning = false;
var enabled = false;

var CSS_ID = "saltybetting-css";
var TOGGLE_BUTTON_ID = "saltybetting-toggle-button";

var cssURL = "https://raw.githubusercontent.com/ShiniOfTheGami/SaltyBetting/master/script.css";

var buttonHTML = "<div class=\"onoffswitch\">" + 
"<input type=\"checkbox\" name=\"onoffswitch\" class=\"onoffswitch-checkbox\" id=\"myonoffswitch\">" +
    "<label class=\"onoffswitch-label\" for=\"myonoffswitch\">" +
        "<span class=\"onoffswitch-inner\"></span>" +
        "<span class=\"onoffswitch-switch\"></span>" +
    "</label>" +
"</div>";


if(thingTimer){
    window.clearInterval(thingTimer);
	removeToggleButton();
	removeCSS();
}

function doTheThing() {
	if(!enabled){
		console.log("Script not enabled, returning");
		return;
	}
    if(!isAlreadyRunning){
		isAlreadyRunning = true;
		
		if(!(bettingClosed() || playerHasBet())) {
            if(isTournamentMode()) {
                handleTournament();
            }
        }
		
		isAlreadyRunning = false;
	}
}

function handleTournament() {
    console.log("tournament mode - bets open and no bet by player yet");
}

function addCSS(){
	$("head").append("<link rel=\"stylesheet\" type=\"text/css\" href=\""+cssURL+"\" id=\""+CSS_ID+"\" />");
}

function removeCSS(){
	$("#" + CSS_ID).remove();
}

function addToggleButton(){
	$("div#nav-menu > ul > li:first-child").before("<li>"+buttonHTML+"</li>");
}

function removeToggleButton(){
	$("#" + TOGGLE_BUTTON_ID).remove();
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
	console.log("Bet " + amount + "$ on " + side); 
	
}

function allIn(side){
	bet(balance, side);
}

function bettingClosed() {
    return betstate === "locked";
}

function getRandomSide(){

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

var thingTimer = window.setInterval(doTheThing, 1000);
addCSS();
addToggleButton();