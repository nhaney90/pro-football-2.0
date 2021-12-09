import { Config } from './config/config.js';
import { Tile } from './components/tile.js';
import { Player } from './tokens/player.js';
import { LB } from './tokens/lb.js';
import { DE } from './tokens/de.js';
import { CB } from './tokens/cb.js';
import { S } from './tokens/s.js';
import { WR } from './tokens/wr.js';
import { Enums } from './utils/enums.js';
import { Stats } from './components/stats.js';
import { SpecialTeams } from './components/specialTeams.js';
import { Database } from './components/database.js';


// Core class that contains the logic which allows the game to be played. Class has ballooned over time and might need to be broken down into smaller pieces
export class Game {
	constructor(playerName, height, width) {
		this.height = height;
		this.width = width;
		this.database = new Database(this.width, this.height);
		this.tiles = [];
		this.fieldElementId = "field";
		this.fieldElement = $("<table id='field'><tr id='row1'></tr><tr id='row2'><tr id='row3'></table>");
		this.field = null;
		this.rows = null;
		this.ballSnapped = false;
		this.defenders = {RDE:null,LDE:null,DT:null,DT2:null,LB:null,MLB:null,CB:null,FS:null,SS:null}
		this.passDefenders = null
		this.player = null;
		this.ballInAir = false;
		this.stats = new Stats(playerName);
		this.playPaused = true;
		this.gameLoopCounter = 0;
		this.currentKeyCode = null;
		this.gameLoopSeconds = 0;
		this.validKeys = [13,32,37,38,39,40,75];
		this.kicking = new SpecialTeams(this);
		this.defenderOccupiedTileIds = [];
		this.wr = null;
		this.wr2 = null;
		this.gameLoop();
	}

	// Start the game! Yay!
	start() {
		this.createField("fieldContainer");
		this.createFieldTiles();
		this.kicking.addKickoffTokens();
		this.readUserInput();
	}

	// Adds a white border representing the line of scrimmage. Used as a reference for the player.
	addLOS() {
		for(let i = 0; i < this.height; i++) {
			$(this.tiles[i][this.width -3].element).addClass("los");
		}
	}

	// Removes the line of scrimmage
	removeLOS() {
		$(".tile").removeClass('los');
	}

	// Adds a single defender to the board
	addDefender(type, defender) {
		this.defenders[type] = defender;
		this.defenderOccupiedTileIds.push(defender.currentTile.id);
	}
	
	// Adds defenders to the board based on size and current defence
	addDefenders() {
		// default positions for defenders.
		let dlX = this.width - 4;
		let lbX = this.width - 6;
		let cbX = (this.width > 10 ? this.width - 10 : this.width - 8);
		let ssX = (this.width > 10 ? 2 : 0);
		let ldeY = 0;
		let rdeY = 2;
		let dtY = 1;
		let lbY = 1;
		let cbY = 0;
		let ssY = 2;
		// The default field size 3 x 10 has 3 set defences
		if(this.height == 3) {
			let dFormation = Math.floor(Math.random() * (5 - 1 + 1) + 1);
			if(dFormation == 1) {
				cbX = (this.width > 10 ? 2 : 0);
				ssX = this.width - 8;
			}
			else if(dFormation == 2) {
				ssY = 1;
				lbX--;
				lbY++;
			} 
		}
		// If the field height is greater than 3, there are 4 possible defences for front line defenders and 4 for the secondary.
		if(this.height > 3) {
			rdeY = 4;
			let dt2Y = 3;
			let dt2X = dlX;
			dtY = 2;
			ldeY = 1;
			lbY = 2;
			ssY = 4;
			let mlbY = 3;
			let mlbX = this.width - 6;

			// Positions for the front line defenders
			let frontPos = Math.floor(Math.random() * (5 - 1 + 1) + 1);
			if(frontPos == 1) {
				rdeY = 3;
				dt2Y = 2;
				dtY = 1;
				ldeY = 0;
				mlbY = 4;
			}
			else if(frontPos == 2) {
				mlbY = 4;
				mlbX = dlX;
				rdeY = 3;
				dt2Y = 2;
				dtY = 1;
				ldeY = 0;
			}
			else if(frontPos == 3) {
				rdeY = 4;
				dt2Y = 2;
				dtY = 1;
				ldeY = 0;
			}

			// Positions for the secondary
			let backPos = Math.floor(Math.random() * (5 - 1 + 1) + 1);
			if(backPos  == 1) {
				ssX = cbX;
			}
			else if(backPos  == 2) {
				ssX = cbX;
				lbX = cbX;
			}
			else if(backPos  == 3) {
				lbY = 0;
				ssY = 2;
				ssX = cbX;
			}

			// Fields with a height greater than 3 have an extra linebacker and defender
			this.addDefender("DT2", new DE(this.tiles[dt2Y][dt2X],this.width, this.height, "m2"));
			this.addDefender("MLB", new LB(this.tiles[mlbY][mlbX], this.width, this.height, "m2", "LB"));
		}
		if(this.width > 10) {
			// Fields with a length greater than 10 have an extra safety
			this.addDefender("FS",new S(this.tiles[Math.trunc(this.tiles.length / 2)][0], this.width, this.height,true));
		}
		this.addDefender("LDE", new DE(this.tiles[ldeY][dlX],this.width, this.height,"l"));
		this.addDefender("RDE", new DE(this.tiles[rdeY][dlX],this.width, this.height,"r"));
		this.addDefender("DT", new DE(this.tiles[dtY][dlX],this.width, this.height,"m"));
		this.addDefender("LB", new LB(this.tiles[lbY][lbX], this.width, this.height, "", "LB"));
		this.addDefender("CB", new CB(this.tiles[cbY][cbX],this.width, this.height));
		this.addDefender("SS", new S(this.tiles[ssY][ssX],this.width, this.height));
	}
	
	//Calculate the F Score of each tile. The F Score is used in the path finding algorithm
	calculateFScores() {
		for(var i = 0; i < this.height; i++) {
			for(var j = 0; j < this.width; j++) {
				this.tiles[i][j].calculateFScore(this.player.currentTile.x, this.player.currentTile.y);
			}
		}
	}
	
	//While the ball is in the air, check it's status
	checkBallStatus(status) {
		this.ballInAir = false;
		// Ball is caught by WR 1
		if(status == "caught") {
			this.swapWRAndPlayer();
		}
		// Ball is caught by WR 2
		else if(status == "caught-2") {
			this.swapWRAndPlayer(true);
		}
		// If the ball is intercepted, dropped or incomplete, the play is immediately stopped
		else if(status == "intercepted") {
			this.stopPlay(Enums.playEndedBy.interception);
		}
		else if(status == "dropped") {
			this.stopPlay(Enums.playEndedBy.dropped);
		}
		else {
			this.stopPlay(Enums.playEndedBy.incomplete);
		}
	}
	
	// Players and defenders cannot move into occupied tiles so let's check to see the tile is occupied.
	checkOccupiedTiles(tile, type) {
		if(type == Enums.tokenEnum.player) {
			//player is tackled
			if(this.defenderOccupiedTileIds.includes(tile.id)) return Enums.tileEnum.defender;
			//player moves forward
			else return Enums.tileEnum.open;
		}
		else if(type == Enums.tokenEnum.defender) {
			//player is tackled
			if(tile.id == this.player.currentTile.id) return Enums.tileEnum.player;
			//space is occupied by defender
			else if(this.defenderOccupiedTileIds.includes(tile.id)) return Enums.tileEnum.defender;
			//space is occupied by WR
			else if((this.wr && tile.id == this.wr.currentTile.id) || this.wr2 && tile.id == this.wr2.currentTile.id){
				return Enums.tileEnum.wr;
			}
			//receiver or ball
			else return Enums.tileEnum.open;
		}
		else if(type == Enums.tokenEnum.wr) {
			//WRs can move through defenders at the line of scrimmage
			if(this.defenderOccupiedTileIds.includes(tile.id) && tile.x <= this.width-5 )return Enums.tileEnum.defender;
			else return Enums.tileEnum.open;
		}
	}
	
	//Check to see what key was pressed on the keyboard during a play
	checkCode() {
		switch(this.currentKeyCode) {
			//space - pass ball
			case 32: {
				// Make sure the player is able to bass the ball
				if(this.player.canPass && this.ballInAir == false){
					this.ballInAir = true;
					this.stats.currentDrive.currentPlay.type = Enums.playType.pass;
					(function(game){
						game.player.pass(game).then(function(response) {game.checkBallStatus(response);});
					}(this));
				}
				break;
			}
			//move left
			case 37: this.movePlayer(Enums.playerMovement.left); break;
			//move up
			case 38: this.movePlayer(Enums.playerMovement.up); break;
			//move right
			case 39: this.movePlayer(Enums.playerMovement.right); break;
			//move down
			case 40: this.movePlayer(Enums.playerMovement.down); break;
		}
		this.currentKeyCode = null;
	}
	
	// This controls all movement during a player
	coreGameLogic() {
		//Means the player has started the play
		if(this.ballSnapped){
			this.calculateFScores();
			//Check to see if the player is moving or has passed the ball
			if(this.currentKeyCode) this.checkCode();
			//This is a normal play and not a kickoff;
			if(this.kicking.kickReturn == false) {

				//Move an additional defender after 7 seconds on larger boards
				if(this.gameLoopCounter == 0 && this.gameLoopSeconds > 7 && this.height > 3) {
					this.moveDefender();
				}

				//Regardless of whether the player can pass or not move a defender at game loop 3
				if(this.gameLoopCounter == 3) {
					this.moveDefender();
				}

				// Move additional defenders after some amount of time has passed or and if the board is larger.
				if(this.gameLoopCounter == 8 && (this.player.canPass == false || (this.gameLoopSeconds > 3 && this.height > 3))) {
					this.moveDefender();
					// Move yet another defender on the largest game board
					if(this.height > 3 && this.length > 10) {
						this.moveDefender();
					}
				}

				//Checks to make if the player can still pass
				if(this.player.canPass) {
					//Check to see if the LB, MLB or DL can move at random to disrupt passing or running plays
					if(this.passDefenders == null) {
						this.passDefenders = ["LB"];
						if(this.defenders.MLB) this.passDefenders.push('MLB');
						if(this.height > 3) {
							//Select a random defensive lineman
							//A lineman will only move 50% of the time
							let odds = Math.floor(Math.random() * 8);
							if(odds == 0)  this.passDefenders.push("DT");
							else if(odds == 1) this.passDefenders.push("RDE");
							else if(odds == 2) this.passDefenders.push("LDE");
							else if(odds == 3) this.passDefenders.push("DT2");
						}
					}
					else {
						//Loop through the passDefenders list
						let i = this.passDefenders.length;;
						while(i--) {
							let def = this.defenders[this.passDefenders[i]];
							if(this.gameLoopSeconds >= def.moveInterval) {
								def.enterThrowingLane(this);
								if(def.throwingLaneTile) {
									this.determineOutcomeDefender(this.checkOccupiedTiles(def.throwingLaneTile, Enums.tokenEnum.defender), def.throwingLaneTile, def);
									this.passDefenders.splice(i, 1);
								}
							}
						}
					}

					//Make the WR run his route
					if(this.gameLoopCounter == 0) {
						if((this.wr && !this.wr.halt) || (this.wr2 && !this.wr2.halt)) this.runRoute();
					}
				}
				else {
					// On larger fields or after 5 seconds move an additional defender
					if(this.gameLoopCounter == 5 && (this.gameLoopSeconds > 5 || this.height > 3)) {
						this.moveDefender();
						// On the largest field move an additonal defender
						if(this.height > 3 && this.length > 10) {
							this.moveDefender();
						}
					}
				}
			}
			// Kickoff coverage
			else {
				if(this.gameLoopCounter == 1 && this.gameLoopSeconds > 0) {
					if(this.gameLoopSeconds < (this.width > 5 ? 9 : 6)) {
						this.kicking.addRandomDefender((this.width > 5 ? this.gameLoopSeconds + 2 : this.gameLoopSeconds));
					}
					if(this.gameLoopSeconds > 6) {
						this.moveDefender();
					}
				}
				if(this.gameLoopCounter == 3 && this.gameLoopSeconds > 4) {
					this.moveDefender();
				}
				if(this.gameLoopCounter == 5 && this.gameLoopSeconds > 2) {
					this.moveDefender();
				}
				if(this.gameLoopCounter == 8 ) {
					this.moveDefender();
				}
			}
			// If the loop counter is 9 then 1 second has passed
			if(this.gameLoopCounter == 9){
				this.gameLoopCounter = 0;
				this.gameLoopSeconds++;
				this.stats.clock.decrementTime();
			}
			// Otherwise 100 milliseconds has passed and we need to increment the loop counter
			else {
				this.gameLoopCounter++;
			}
		}
		// If the ball is not in play and the user has pressed enter to reset the code
		else if(this.currentKeyCode == 13 && this.kicking.kickReturn == false){
			this.currentKeyCode = null;
			if(this.playPaused == true) {
				this.playPaused = false;
				if(this.stats.readyForKickoff == true) {
					this.stats.readyForKickoff = false;
					this.kicking.kickoffBall();
				}
				else this.startPlay();
			}
			else {
				this.resetTokens();
				this.removeLOS();
				this.playPaused = true;
				this.gameLoopCounter = 0;
				this.gameLoopSeconds = 0;
				if(this.stats.readyForKickoff == false)this.setFieldTokens();
				else this.kicking.addKickoffTokens();
			}
		}
		// The user has pressed 'k' and is trying to kick a fieldgoal
		else if(this.currentKeyCode == 75 && this.playPaused) {
			this.removeWRRoutes();
			this.currentKeyCode = null;
			this.resetTokens();
			let playerY = 0;
			if(this.height == 5) playerY = 1;
			this.player = new Player(this.tiles[playerY][this.width - 3],this.width, this.height);
			this.kicking.addFieldGoalTokens();
			this.stats.currentDrive.startPlay();
			this.kicking.kickFieldGoal().then(() => {
				var fieldGoalResult = this.player.kick(this.stats.currentDrive.currentYardLine);
				if(fieldGoalResult) this.stopPlay(Enums.playEndedBy.madeFieldGoal);
				else this.stopPlay(Enums.playEndedBy.missedFieldGoal);
				this.playPaused = false;
			});
		}
	}
	
	// Create the field based on the height and width specified by the player
	createField(div) {
		if(this.height > 3) {
			this.fieldElement = $("<table id='field'><tr id='row1'></tr><tr id='row2'><tr id='row3'><tr id='row4'><tr id='row5'></table>");
			$(".sidePanels").css("height","535px");
			$(".sidePanelContainer").css("height","435px");
		}
		if(this.width > 10) {
			console.log("here");
			$("#centerColumn").css("max-width","890px");
		}
		$("#" + div).append(this.fieldElement);
		this.field = $("#" + this.fieldElementId);
	}
		
	createFieldTiles() {
		for(var i = 0; i < this.height; i++) {
			var row = [];
			var rowId = this.field.children(0).children()[i].id;
			for(var j = 0; j < this.width; j++) {
				var tile = new Tile(rowId,(i.toString()+j.toString()), j, i);
				row.push(tile);
			}
			this.tiles.push(row);
		}
	}
	
	// Determine if the defender is able to move and if he tackles the player
	determineOutcomeDefender(status, tile, defender) {
		if(status == Enums.tileEnum.player && this.ballInAir == false) {
			this.tackled();
			defender.addBlink();
		}
		else if(status == Enums.tileEnum.open) {
			let index = this.defenderOccupiedTileIds.indexOf(defender.currentTile.id);
			this.defenderOccupiedTileIds.splice(index, 1);
			defender.move(tile);
			this.defenderOccupiedTileIds.push(tile.id);
		}
	}
	
	// Determine if the player is tackled or not
	determineOutcomePlayer(status, tile, direction) {
		// If the player has run into a defender and the ball is not current in the air
		if(status == Enums.tileEnum.defender && this.ballInAir == false) this.tackled();
		else if(status == Enums.tileEnum.open) {
			this.player.move(tile);
			if(direction == Enums.playerMovement.left) this.stats.currentDrive.currentPlay.yards += 1;
			else if(direction == Enums.playerMovement.right) this.stats.currentDrive.currentPlay.yards -=1;
			//If the player has advanced beyond the los, remove the WR
			if(tile.x < this.width - 3 && this.wr) {
				this.player.canPass = false;
				if(this.wr.element) this.wr.stopRoute();
				if(this.wr2 && this.wr2.element) this.wr2.stopRoute();
			}
			//If the player has reached the endzone, end the play
			if(this.stats.currentDrive.currentPlay.yards + this.stats.currentDrive.currentYardLine >= Config.fieldSize.lengthInYards) this.stopPlay(Enums.playEndedBy.touchdown);
			//Otherwise, refresh the F scores for all the tiles.
			else this.calculateFScores();
		}
	}
	
	findSmallestFScore(currentValue, newValue) {
		if(currentValue == null || currentValue.fScore > newValue.fScore) return newValue;
		else return currentValue;
	}
	
	// Controls the game loop
	async gameLoop() {
		while(!(this.stats.clock.gameOver == true && this.ballSnapped == false)) {
			await this.waitInterval();
			this.coreGameLogic();
		}
		alert("Game Over");
		this.stats.finalizeStats();
		this.database.checkHighScores(this.stats.highScores, this.stats.playerName);
	}

	waitInterval() {
		return new Promise((resolve, reject) => setTimeout(resolve, Config.gameplay.gameLoopInterval));
	}
		
	moveDefender() {
		var success = false;
		let defender = null;
		let loops = 0;
		while(success == false) {
			var smallest = null;
			//If the program has tried to find a defender 4 times and has failed, just grab the linebacker
			if(loops > 4) {
				defender = this.defenders.LB;
				success = true;
			}
			else {
				defender = this.defenders[this.selectRandomDefender()];
			}
			//If a defender has been selected
			if(defender) {
				//Look at the 4 possible directions the defender can move and find the tile with the smallest f score
				if(defender.currentTile.x + 1 < this.width) {
					smallest = this.findSmallestFScore(smallest, this.tiles[defender.currentTile.y][defender.currentTile.x+1]);
				}
				if(defender.currentTile.x - 1 > -1) {
					smallest = this.findSmallestFScore(smallest, this.tiles[defender.currentTile.y][defender.currentTile.x-1]);
				}
				if(defender.currentTile.y + 1 < this.height) {
					smallest = this.findSmallestFScore(smallest, this.tiles[defender.currentTile.y + 1][defender.currentTile.x]);
				}
				if(defender.currentTile.y - 1 > -1) {
					smallest = this.findSmallestFScore(smallest, this.tiles[defender.currentTile.y - 1][defender.currentTile.x]);
				}
				//Make sure the fscore is within the limits of the defender's reaction zone
				if(smallest.fScore <= defender.reactZone) {
					success = true;
				}
				//Ignore reaction zones on kickoffs until the board has begun to fill up with defenders
				if(this.kicking.kickReturn == true && this.kicking.kickReturnDefense.length < 6) {
					success = true;
				}
			}
			loops++;
		}
		//If a tile and a defender have been found, move the defender
		if(success == true && smallest) {
			this.determineOutcomeDefender(this.checkOccupiedTiles(smallest, Enums.tokenEnum.defender), smallest, defender);
		}
	}
		
	//Move the player to the new position
	movePlayer(direction) {
		//Prevent the player from moving if the ball has already been thrown
		if(this.ballInAir == false) {
			if(direction == Enums.playerMovement.left) {
				//wrap the player around the screen to the right
				if(this.player.currentTile.x == 0) {
					this.determineOutcomePlayer(this.checkOccupiedTiles(this.tiles[this.player.currentTile.y][this.width - 1], Enums.tokenEnum.player), this.tiles[this.player.currentTile.y][this.width - 1], direction);
					this.removeLOS();
				}
				//move the player one space to the left
				else {
					this.determineOutcomePlayer(this.checkOccupiedTiles(this.tiles[this.player.currentTile.y][this.player.currentTile.x - 1], Enums.tokenEnum.player), this.tiles[this.player.currentTile.y][this.player.currentTile.x - 1], direction);
				}
			}
			else if(direction == Enums.playerMovement.up) {
				if((this.player.currentTile.y - 1) > -1 && this.ballSnapped) this.determineOutcomePlayer(this.checkOccupiedTiles(this.tiles[this.player.currentTile.y - 1][this.player.currentTile.x], Enums.tokenEnum.player), this.tiles[this.player.currentTile.y - 1][this.player.currentTile.x], direction);
			}
			else if(direction == Enums.playerMovement.right) {
				//Check to see the player can move backwards
				if(this.player.currentTile.x + 1 < this.width && this.ballSnapped) this.determineOutcomePlayer(this.checkOccupiedTiles(this.tiles[this.player.currentTile.y][this.player.currentTile.x + 1], Enums.tokenEnum.player), this.tiles[this.player.currentTile.y][this.player.currentTile.x + 1],direction);
				else if(this.player.currentTile.x + 1 > this.width-1 && this.ballSnapped && this.player.canPass == false) this.determineOutcomePlayer(this.checkOccupiedTiles(this.tiles[this.player.currentTile.y][0], Enums.tokenEnum.player), this.tiles[this.player.currentTile.y][0],direction);
			}
			else if(direction == Enums.playerMovement.down) {
				if((this.player.currentTile.y + 1) < this.height && this.ballSnapped) this.determineOutcomePlayer(this.checkOccupiedTiles(this.tiles[this.player.currentTile.y + 1][this.player.currentTile.x], Enums.tokenEnum.player), this.tiles[this.player.currentTile.y + 1][this.player.currentTile.x],direction);
			}
		}
	}
		
	//Read the user input.
	readUserInput() {
		$(window).on("keydown", (evt) => {
			$(".helpBtns.btn.btn-default").blur();
			//Hold the last valid key that was pressed in the currentKeyCode variable
			if(this.validKeys.indexOf(evt.keyCode) > -1) this.currentKeyCode = evt.keyCode;
		});
	}

	//Remove the highlighted routes from the board
	removeWRRoutes() {
		$(".tile").removeClass('wr-route');
		$(".tile").removeClass('wr2-route');
	}
		
	//Resets tokens to their initial location
	resetTokens() {
		this.kicking.removeKickingTeam();
		this.player.removeElement(this.player.element);
		this.player = null;
		this.ball = null;
		if(this.wr)this.wr.stopRoute();
		if(this.wr2) this.wr2.stopRoute();
		this.wr = null;
		this.wr2 = null;
		this.ballInAir = false;
		for(var defender in this.defenders) {
			if(this.defenders.hasOwnProperty(defender) && this.defenders[defender]) {
				this.defenders[defender].removeElement(this.defenders[defender].element);
			}
		}
		//Just to make sure all defenders have been removed
		$(".defender").remove();
		this.defenders = {RDE:null,LDE:null,DT:null,DT2:null,LB:null,MLB:null,CB:null,SS:null,FS:null};
		this.passDefenders = null;
		this.defenderOccupiedTileIds = [];
		$("#playResult").text('');
	}
		
	//Reads from the WRs predetermined route and moves the WR
	runRoute() {
		//If the WR has not yet finished his route
		if(this.wr.currentRoute.nodes.length > 0) {
			//Get the next route position
			var node = this.wr.currentRoute.nodes[0];
			//If next route position is unoccupied
			if(this.checkOccupiedTiles(this.tiles[node.y][node.x], Enums.tokenEnum.wr) == Enums.tileEnum.open) {
				this.wr.currentRoute.nodes.shift();
				this.wr.move(this.tiles[node.y][node.x]);
			}
		}
		if(this.wr2 && this.wr2.currentRoute.nodes.length > 0) {
			//Get the next route position
			var node = this.wr2.currentRoute.nodes[0];
			//If next route position is unoccupied
			if(this.checkOccupiedTiles(this.tiles[node.y][node.x], Enums.tokenEnum.wr) == Enums.tileEnum.open) {
				this.wr2.currentRoute.nodes.shift();
				this.wr2.move(this.tiles[node.y][node.x]);
			}
		}
	}
		
	//Select a random defender to move
	selectRandomDefender() {
		//If the player is in the pocket only move the defensive line
		if(this.player.canPass == true) {
			var random = Math.floor(Math.random() * 5)
			if(random < 2) return "RDE";
			else if(random == 2 || random == 3) return "LDE";
			else return "DT";
		}
		//If it's a kick return, just get one at random
		else if(this.kicking.kickReturn == true) {
			var randomDefender = null;
			while(randomDefender == null) {
				var randomNumber = Math.floor(Math.random() * this.kicking.kickReturnDefense.length);
				randomDefender = this.kicking.kickReturnDefense[randomNumber];
			}
			return randomDefender;
		}
		//If the player has moved beyond the LOS all defenders can chase the player
		else {
			let halfWidth = Math.trunc((this.width - 1) / 2);
			let random = Math.floor(Math.random() * 7);
			// When the player is in secondary
			if(this.player.currentTile.x < (halfWidth + 1)) {
				//On long fields when the player is near the end of the field just move the secondary
				if(this.width > 10 && this.player.currentTile.x < 4) {
					let random = Math.floor(Math.random() * 4);
					if(random == 0 || random == 1) return "FS";
					else if(random == 2) return "CB";
					else return "SS";
				}
				//Otherwise move the LBs too
				else {	
					if(random == 0) return "LB";
					else if(random == 1 || random == 2) {
						if(this.defenders.MLB) return "MLB";
						else return "LB";
					}
					else if(random == 3 || random == 4) return "CB";
					else if(random >  4) return "SS";
				}
			}
			//When the player is near the defensive front just move the front defenders
			else {
				if(random < 1) return "LB";
				else if(random == 1 ) return "DT";
				else if(random == 2 || random == 3) return "RDE";
				else if(random == 4 || random == 5) return "LDE";
				else if(random == 6) {
					if(this.defenders.DT2) return "DT2";
					else return "DT";
				}
			}
		}
	}
		
	//Add tokens to the field
	setFieldTokens() {
		let playerY = (this.height == 5 ? 2 : 1);
		this.player = new Player(this.tiles[playerY][this.width - 1],this.width,this.height);
		this.calculateFScores();
		this.addDefenders();
		if(this.width > 10 && this.height > 3) {
			let routeTree = Math.floor(Math.random() * (4) + 1);
			this.wr = new WR(this.height, this.width, 1, routeTree);
			this.wr.addWR(this.tiles);
			this.wr2 = new WR(this.height, this.width, 2, routeTree);
			this.wr2.addWR(this.tiles);
		}
		else {
			this.wr = new WR(this.height, this.width);
			this.wr.addWR(this.tiles);
		}
		this.showWRRoute(false);
		if(this.wr2) this.showWRRoute(true);
		this.addLOS();
	}

	showWRRoute(second) {
		let wr = "wr";
		let cssClass = "wr-route";
		if(second) {
			cssClass = "wr2-route";
			wr = "wr2";
		}
		for(let i = 0; i < this[wr].currentRoute.nodes.length; i++) {
			//Height before width
			this.tiles[this[wr].currentRoute.nodes[i].y][this[wr].currentRoute.nodes[i].x].element.addClass(cssClass);
		}
	}
		
	startPlay() {
		this.player.canPass = true;
		this.ballSnapped = true;
		this.removeWRRoutes();
		this.stats.currentDrive.startPlay();
	}
		
	//End the play
	stopPlay(endedBy) {
		this.kicking.kickReturn = false;
		this.ballSnapped = false;
		//Immediately stop the WR from running his route
		if(this.wr) this.wr.halt = true;
		this.stats.checkDriveStatus(endedBy);
	}
		
	//After the player competes a pass the QB and the WR are swapped.
	swapWRAndPlayer(second) {
		let wr = "wr";
		if(second) wr = "wr2";
		this.player.canPass = false;
		this.stats.currentDrive.currentPlay.yards += (this.player.currentTile.x - this[wr].currentTile.x);
		this.player.move(this[wr].currentTile);
		this.player.setLabel("WR");
		this.wr.stopRoute();
		if(this.wr2) this.wr2.stopRoute();
		if(this.stats.currentDrive.currentPlay.yards + this.stats.currentDrive.currentYardLine >= Config.fieldSize.lengthInYards) this.stopPlay(Enums.playEndedBy.touchdown);
	}
		
	//Call when the player is tackled
	tackled() {
		this.player.addBlink();
		//Determine if the player was sacked
		if(this.player.canPass) this.stopPlay(Enums.playEndedBy.sack);
		else this.stopPlay(Enums.playEndedBy.tackle);
	}
}
