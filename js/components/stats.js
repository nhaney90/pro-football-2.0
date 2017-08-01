/*************************************************************************************************************************
Class used to manage game statistics, record the outcome of drives and set the game score
*************************************************************************************************************************/

define (["js/components/drive.js","js/components/play.js", "js/components/clock.js", "js/utils/enums.js"],function(Drive, Play, Clock, Enums) {
	return class Stats {
		constructor(playerName) {
			this.drives = [];
			this.currentDrive = null;
			this.clock = new Clock();
			this.score = {playerScore:0, computerScore:0};
			this.setScore();
			this.readyForKickoff = true;
			
			//This property keeps track of all stats for the game
			this.boxScore = {passing:0, compAtt:{comp:0, atts:0}, passTds:0, interceptions:0, sacks:0, rushing:0, rushAtts:0, rushTds:0, firstDowns:0, byRushing:0, byPassing:0,thirdDowns:{atts:0, convert:0}, fourthDowns:{atts:0, convert:0}, longestRun:0, longestPass:0, longestFieldGoal:0, fieldGoals:0, returnYards:0, returns:0, longestReturn:0, returnTds:0};
			
			//This property will keep track of all the highscores for this single playthrough
			this.highScores = {completionPercentage: 0, completions: 0, fieldGoals:0, firstDowns: 0, fourthDowns: 0, fieldGoals: 0, interceptions: 0,
				longestFieldGoal: 0, longestPass: 0, longestRun: 0, margin: 0, passAttempts:0, passingTDs: 0, passingYards:0, points: 0, pointsAllowed: 0, rushingTDs: 0, rushingYards: 0, rushAttempts:0, sacks: 0, yards: 0, yardsPerPass: 0, yardsPerRush: 0, returnYards: 0, longestReturn: 0, yardsPerReturn: 0, returnTDs:0}
				
			this.setBoxScore();
			this.playerName = playerName;
			this.setScoreboardLabels("--", "--", "Opp 35");
			$("#playerNameScoreboardLabel").text(this.playerName);
		}
		
		//This method checks to see how the play ended and how that effects the drive (first down would keep the drive going while a turnover would end it)
		checkDriveStatus(endedBy) {
			
			//Add the play to the currentDrive's list of plays and return the result
			var result = this.currentDrive.addPlay(endedBy, this.boxScore, this.playerName);
			this.boxScore = result.boxScore;
			this.setBoxScore();
			
			//Show the result on the play as text in the GUI
			$("#playResult").text(result.playSummary);
			
			//Add a new Item to the play by play list
			$("#playByPlayTable").append('<tr><td class="playByPlayItem">' + (this.createLabelFriendlyDownNumber(this.currentDrive.currentPlay.down)) + ': ' + result.playSummary + '</td></tr>');
			
			//If the QB was sacked, give the computer 2 points
			if(endedBy == Enums.playEndedBy.sack) {
				this.score.computerScore += 2;
				this.setScore();
			}
			
			//If the play was a turnover the drive would be ended and the computer would score 4 points. 
			if(result.playResult == Enums.playResult.turnover) {
				this.score.computerScore += 4;
				this.setScore();
				this.endDrive();
				this.readyForKickoff = true;
			}
			
			//Check to see if the drive has ended. If the drive is over prepare for kickoff
			//If the play ended in a touchdown, the drive would be over and the player would score 7 points
			else if(result.playResult == Enums.playResult.touchdown) {
				this.score.playerScore += 7;
				this.setScore();
				this.endDrive();
				this.readyForKickoff = true;
			}
			
			//If the play resulted in a made field goal, the drive would be over and the player would score 3 points
			else if(result.playResult == Enums.playResult.fieldGoal) {
				this.score.playerScore += 3;
				this.setScore();
				this.endDrive();
				this.readyForKickoff = true;
			}
			
			//If the play did not end the drive, update the down and distance markers
			else {
				this.setScoreboardLabels(this.currentDrive.currentDown, this.currentDrive.currentDistance, this.currentDrive.getNormalizedYardLine(this.currentDrive.currentYardLine));
			}
		}
		
		//Start a new drive at the specified yardline
		createDrive(start) {
			$("#playByPlayTable").append('<tr><td class="playByPlayHeading">Drive ' + (this.drives.length + 1) + '</td></tr>');
			this.currentDrive = new Drive(start, this.clock);
			this.setScoreboardLabels(1, 10, this.currentDrive.getNormalizedYardLine(start));
		}
		
		//End the current drive
		endDrive(result) {
			this.currentDrive.driveResult = result;
			this.currentDrive.clock = null;
			this.drives.push(this.currentDrive);
		}
		
		//Helper method to change the down number to a readable value. Ex: "1" becomes "1st Down"
		createLabelFriendlyDownNumber(down) {
			if(down == 1) return "1st Down";
			else if(down == 2) return "2nd Down";
			else if(down == 3) return "3rd Down";
			else if(down == 4) return "4th Down";
			else if(down == 0) return "Kickoff";
			return "error";
		}
		
		//Update the down, distance and yardLine labels on the scoreboard
		setScoreboardLabels(down, distance, yardLine) {
			$("#yardLineLabel").text(yardLine);
			$("#downLabel").text(down);
			$("#distanceLabel").text(distance);
		}
		
		//Update the score
		setScore() {
			$("#playerScoreLabels").text(this.score.playerScore);
			$("#computerScoreLabel").text(this.score.computerScore);
		}
		
		//When the game has ended update all of the highScore values if the player has won the game. In the database file we will check to see if any all time records have been broken
		finalizeStats() {
			if(this.score.playerScore >= this.score.computerScore) {
				this.highScores.yards = this.boxScore.passing + this.boxScore.rushing;
				this.highScores.passingYards = this.boxScore.passing;
				this.highScores.passAttempts = this.boxScore.compAtt.atts;
				this.highScores.completionPercentage = (Math.round((this.boxScore.compAtt.comp / this.boxScore.compAtt.atts) * 10) / 10) * 100;
				this.highScores.yardsPerPass = this.highScores.passAttempts > 7 ? Math.round((this.boxScore.passing / this.boxScore.compAtt.atts) * 10) / 10 : 0;
				this.highScores.passingTDs = this.boxScore.passTds;
				this.highScores.rushingTDs = this.boxScore.rushTds;
				this.highScores.interceptions = this.boxScore.interceptions;
				this.highScores.sacks = this.boxScore.sacks;
				this.highScores.rushingYards = this.boxScore.rushing;
				this.highScores.rushAttempts = this.boxScore.rushAtts;
				this.highScores.yardsPerRush = this.highScores.rushAttempts > 4 ? Math.round((this.boxScore.rushing / this.boxScore.rushAtts) * 10) / 10 : 0;
				this.highScores.firstDowns = this.boxScore.firstDowns;
				this.highScores.fourthDowns = this.boxScore.fourthDowns.convert;
				this.highScores.longestRun = this.boxScore.longestRun;
				this.highScores.longestPass = this.boxScore.longestPass;
				this.highScores.completions = this.boxScore.compAtt.comp;
				this.highScores.pointsAllowed =  this.score.computerScore;
				this.highScores.points = this.score.playerScore;
				this.highScores.margin = this.highScores.points - this.highScores.pointsAllowed;
				this.highScores.fieldGoals = this.boxScore.fieldGoals;
				this.highScores.longestFieldGoal = this.boxScore.longestFieldGoal;
				this.highScores.returnYards = this.boxScore.returnYards;
				this.highScores.longestReturn = this.boxScore.longestReturn;
				this.highScores.yardsPerReturn = Math.round((this.boxScore.returnYards / this.boxScore.returns) * 10) / 10;
				this.highScores.returnTDs  = this.boxScore.returnTds;
			}
		}

		//Update the box score values
		setBoxScore() {
			$("#totalYardsCell").text(this.boxScore.passing + this.boxScore.rushing);
			$("#passingYardsCell").text(this.boxScore.passing);
			$("#compAttsCell").text(this.boxScore.compAtt.comp + " / " + this.boxScore.compAtt.atts);
			$("#yppCell").text(Math.round((this.boxScore.passing / this.boxScore.compAtt.atts) * 10) / 10);
			$("#passingTdsCell").text(this.boxScore.passTds);
			$("#interceptionsCell").text(this.boxScore.interceptions);
			$("#sacksCell").text(this.boxScore.sacks);
			$("#rushingYardsCell").text(this.boxScore.rushing);
			$("#rushingAttsCell").text(this.boxScore.rushAtts);
			$("#yprCell").text(Math.round((this.boxScore.rushing / this.boxScore.rushAtts) * 10) / 10);
			$("#rushingTdsCell").text(this.boxScore.rushTds);
			$("#kickReturnYardsCell").text(this.boxScore.returnYards);
			$("#kickReturnsCell").text(this.boxScore.returns);
			$("#longReturnCell").text(this.boxScore.longestReturn);
			$("#averageReturnCell").text(Math.round((this.boxScore.returnYards / this.boxScore.returns) * 10) / 10);
			$("#kickReturnTdsCell").text(this.boxScore.returnTds);
			$("#firstDownsCell").text(this.boxScore.firstDowns);
			$("#byRushingCell").text(this.boxScore.byRushing);
			$("#byPassingCell").text(this.boxScore.byPassing);
			$("#thirdDownsCell").text(this.boxScore.thirdDowns.convert + " / " + this.boxScore.thirdDowns.atts);
			$("#fourthDownsCell").text(this.boxScore.fourthDowns.convert);
		}
	}
});