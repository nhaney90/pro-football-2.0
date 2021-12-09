/****************************************************************************************************************************************************
Class that represents a single drive. Also determines the outcome of a drive, keeps track of individual plays and determines the outcome of each play
*****************************************************************************************************************************************************/
import { Play } from '../components/play.js';
import { Enums } from '../utils/enums.js';
import { Config } from '../config/config.js';

export class Drive {
	constructor(yardLine, clock) {
		this.plays = [];
		this.startingYardLine = yardLine;
		this.driveResult = null;
		this.yards = 0;
		this.totalPlays = 0;
		this.passPlays = 0;
		this.runPlays = 0;
		this.timeElapsed = null;
		this.startTime = null;
		this.endTime = null;
		this.currentDown = Config.rules.startingDown;
		this.currentDistance = Config.rules.yardsToFirstDown;
		this.currentYardLine = this.startingYardLine;
		this.currentPlay = null;
		this.clock = clock;
	}
		
	//Creates a new play and updates the currentPlay property
	startPlay() {
		this.currentPlay = new Play();
		//If the play's length is zero, this is a kickoff return 
		if(this.plays.length == 0) this.currentPlay.yards = 0;
		//If the play is not a kickoff return, start the player two yards behind the line of scrimmage
		else this.currentPlay.yards = Config.gameplay.playerStartingPosition;
		this.currentPlay.startTime = this.clock.getCurrentTime();
		this.currentPlay.down = this.currentDown;
		this.currentPlay.distance = this.currentDistance;
		this.currentPlay.yardLine = this.currentYardLine;
	}
		
	//Add the current play to the plays array
	//Also determines the outcome of the play and returns the result to the instance of the Stats class that called it
	addPlay(endedBy, boxScore, playerName) {
		this.totalPlays++;
			
		//If the player kicked and made a field goal
		if(endedBy == Enums.playEndedBy.madeFieldGoal) {
			var fieldGoalLength = (Config.fieldSize.lengthInYards - this.currentYardLine) + Config.kicking.addedFieldGoalLength;
			this.currentPlay.down++;
			this.currentPlay.playSummary = "" + fieldGoalLength + " yard field goal attempt is good!";
			this.currentPlay.result = Enums.playResult.fieldGoal;
			this.clock.runOffClock();
			this.clock.createTimeLabel();
			if(boxScore.longestFieldGoal < fieldGoalLength) boxScore.longestFieldGoal = fieldGoalLength;
			boxScore.fieldGoals++;
		}
			
		//If the player kicked and missed a field goal
		else if(endedBy == Enums.playEndedBy.missedFieldGoal) {
			this.currentPlay.down++;
			this.currentPlay.playSummary = "" + ((Config.fieldSize.lengthInYards - this.currentYardLine) + Config.kicking.addedFieldGoalLength) + " yard field goal attempt is no good!";
			this.currentPlay.result = Enums.playResult.turnover;
			this.clock.runOffClock();
			this.clock.createTimeLabel();
		}
			
		//If this is the first play of the drive, the play was a kick return
		else if(this.plays.length == 0) {
			this.currentPlay.down=0;
			this.currentPlay.result = Enums.playResult.kickReturn;
				
			//If player returned the kick
			if(this.currentYardLine >= 0 ) {
				boxScore.returns++;
				boxScore.returnYards += this.currentPlay.yards;
				this.setCurrentYardLine(this.currentPlay.yards);
				if(boxScore.longestReturn < this.currentPlay.yards) boxScore.longestReturn = this.currentPlay.yards;
				this.currentPlay.playSummary = playerName + " returns the kickoff " + this.currentPlay.yards + " yards to the " + this.getNormalizedYardLine() + ".";
				//If the player returned the kick for a touchdown
				if(endedBy == Enums.playEndedBy.touchdown) {
					boxScore.returnTds++;
					this.currentPlay.playSummary += " for a touchdown!";
					this.currentPlay.result = Enums.playResult.touchdown;
				}
			}
			//If the kick was downed in the endzone
			else {
				this.currentPlay.playSummary = playerName + " downs the ball in the endzone for a touchback";
				this.currentYardLine = Config.gameplay.touchbackYardLine;
			}
		}
			
		//This was not a special teams play
		else {
			this.yards += this.currentPlay.yards;
			if(this.currentPlay.down == 3) boxScore.thirdDowns.atts++;
			else if(this.currentPlay.down == 4) boxScore.fourthDowns.atts++;
				
			//Indicates this was a pass play
			if(this.currentPlay.type) {
				if(boxScore.longestPass < this.currentPlay.yards) boxScore.longestPass = this.currentPlay.yards;
				this.passPlays++;
				boxScore.compAtt.atts++;
				boxScore.compAtt.comp++;
			}
				
			//Indicates this was a run play
			else {
				if(boxScore.longestRun < this.currentPlay.yards) boxScore.longestRun = this.currentPlay.yards;
				this.currentPlay.type = Enums.playType.run;
				this.runPlays++;
				boxScore.rushAtts++;
				boxScore.rushing += this.currentPlay.yards;
			}
				
			//Move the line of scrimmage based on the yards gained during the play
			this.setCurrentYardLine(this.currentPlay.yards);
				
			//Check if the player was sacked
			if(endedBy == Enums.playEndedBy.sack) {
				this.currentPlay.playSummary = playerName + " sacked at the " + this.getNormalizedYardLine() + " for a loss of " + this.currentPlay.yards + " yards!";
				this.currentDown++;
				this.currentPlay.result = Enums.playResult.none;
				this.currentDistance -= this.currentPlay.yards;
				boxScore.sacks++;
			}
				
			//Check to see if the player threw an incomplete pass
			else if(endedBy == Enums.playEndedBy.incomplete) {
				this.currentPlay.playSummary = "Incomplete pass";
				this.currentPlay.result = Enums.playResult.none;
				this.currentDown++;
				boxScore.compAtt.comp--;
			}

			//Check to see if the WR dropped the pass
			else if(endedBy == Enums.playEndedBy.dropped) {
				this.currentPlay.playSummary = "Dropped pass";
				this.currentPlay.result = Enums.playResult.none;
				this.currentDown++;
				boxScore.compAtt.comp--;
			}
				
			//Check to see if the player threw an interception
			else if(endedBy == Enums.playEndedBy.interception) {
				this.currentPlay.playSummary = playerName + " pass intercepted!";
				this.currentPlay.result = Enums.playResult.turnover
				boxScore.compAtt.comp--;
				boxScore.interceptions++;
			}
				
			//Cool, you were not sacked, intercepted or threw an incompletion
			else {
				//You have either gained or lost yards
				this.currentPlay.playSummary = playerName + " " + (this.currentPlay.type == 0 ? "runs" : "passes") + " for " +  this.currentPlay.yards + " yards";
				if(this.currentPlay.type == Enums.playType.pass) boxScore.passing += this.currentPlay.yards;
				boxScore.totalYards += this.currentPlay.yards;
					
				//If the play resulted in a first down or a touchdown
				if(endedBy == Enums.playEndedBy.touchdown || (this.currentDistance - this.currentPlay.yards) <= 0) {
						
					//Touchdown
					if(endedBy == Enums.playEndedBy.touchdown) {
						this.currentPlay.playSummary += " for a touchdown!";
						this.currentPlay.result = Enums.playResult.touchdown;
						this.currentPlay.type == Enums.playType.run ? boxScore.rushTds++ : boxScore.passTds++;
					}
						
					//First down
					else {
						this.currentDown = Config.rules.startingDown;
						this.currentDistance = Config.rules.yardsToFirstDown;
						this.currentPlay.result = Enums.playResult.firstDown;
						this.currentPlay.playSummary += " to the " + this.getNormalizedYardLine() + " for a first down!";
						boxScore.firstDowns++;
						this.currentPlay.type == Enums.playType.run ? boxScore.byRushing++ : boxScore.byPassing++;
					}
						
					//Yes, I count touchdowns as first downs
					if(this.currentPlay.down == 3) boxScore.thirdDowns.convert++;
					else if(this.currentPlay.down == 4) boxScore.fourthDowns.convert++;
				}
					
				//The play did not result in a first down or touchdown
				else {
					this.currentDistance -= this.currentPlay.yards;
					this.currentDown++;
					this.currentPlay.result = Enums.playResult.none;
					this.currentPlay.playSummary += " to the " + this.getNormalizedYardLine() + ".";
				}
			}
			
			//If you failed to convert a 4th down
			if(this.currentDown > 4) {
				if(this.currentPlay.result != Enums.playResult.firstDown && this.currentPlay.result != Enums.playResult.touchdown) {
					this.currentPlay.result = Enums.playResult.turnover;
					this.currentPlay.playSummary += " Turnover on downs!";
				}
			}
		}
			
		//Get the time the play ended
		this.currentPlay.endTime = this.clock.getCurrentTime();
		this.plays.push(this.currentPlay);
			
		//Return an object representing the outcome of the play and the up-to-date boxscore
		return {playSummary:this.currentPlay.playSummary, playResult: this.currentPlay.result, boxScore:boxScore};
	}
		
		//Add the yards gained to the current yard line
	setCurrentYardLine(yards) {
		this.currentYardLine += yards;
	}
		
	//As I record all yards as 0 - 100, this is a helper method to convert this number to the +- 50 yard values we are used to
	getNormalizedYardLine() {
		//If the value is greater than 50 it needs to be converted
		if(this.currentYardLine > 50) {
			return "Opp " + (50-(this.currentYardLine - 50));
		}
		else return this.currentYardLine;
	}
}