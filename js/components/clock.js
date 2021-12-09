/**********************************************
Class used to manage the game clock
**********************************************/
import { Config } from '../config/config.js';

export class Clock {
	constructor() {
		this.timeRemaining = Config.gameplay.quarterLength;
		this.createTimeLabel();
		this.gameOver = false;
	}
		
	getCurrentTime() {
		return this.currentTime;
	}
		
	//Run 5 seconds off of the clock after each field goal attempt to represent the time it took for the play to run
	runOffClock() {
		for(var i = 0; i < 5; i++) {
			//Check to see if this runoff ended the game
			if(!this.gameOver) this.decrementTime();
		}
	}
		
	//Run 1 second off the clock
	decrementTime() {
		//If the time goes below Zero it means the game is over
		if(this.timeRemaining - 1 >= 0) this.timeRemaining--;
		else this.gameOver = true;
		this.createTimeLabel();
	}
		
	//Helper method to create a human friendly label for the time
	createTimeLabel() {
		var minutes = 0;
		var seconds = 0;
		//Indicates there is a need to indicate the minutes left
		if(this.timeRemaining >= 60) {
			minutes = Math.floor(this.timeRemaining / 60);
			seconds = this.timeRemaining - (minutes * 60);
			if(seconds < 10) {
				seconds = "0" + seconds;
			}
		}
		else seconds = this.timeRemaining;
		$("#timeLabel").text(minutes + ":" + seconds);
	}
}