import { Config } from "../config/config.js";
import { Token } from '../tokens/token.js';

export class Ball extends Token {
	constructor(tile, game) {
		super();
		this.elementId = "ball";
		this.elementHTML = "<div id='ball' class='tile ball'></div>";
		this.element = null;
		this.currentTile = tile
		this.game = game
		this.addElement(this.currentTile.element, this.elementHTML);
	}

	// This method moves the ball through the air
	fly() {
		return new Promise(async (resolve, reject) => {
			let finished = false;
			let resolveType = null;
			while(!finished) {
				//If the balls files off the edge of the board this means it is incomplete
				if(this.currentTile.x - 1 < 0) finished = true;
				//Good, it has not moved off the board
				else {
					this.move(this.game.tiles[this.currentTile.y][this.currentTile.x - 1]);
					//If the ball interects a WR 1
					if(this.game.wr.currentTile == this.currentTile) {
						resolveType = "caught";
					}
					//If the ball interects a WR 2
					else if(this.game.wr2 && this.game.wr2.currentTile == this.currentTile) {
						resolveType = "caught-2";
					}
					//If the ball did not fly off the board and did not hit a WR, it must have been intercepted
					if(resolveType) {
						let odds = Math.floor(Math.random() * (20 - 1 + 1) + 1);
						//If the dice roll is an 19, the ball is dropped
						if(odds == 19) resolveType = "dropped";
						finished = true;
					}
					else {
						for(var defender in this.game.defenders) {
							if(this.game.defenders.hasOwnProperty(defender)) {
								if(this.game.defenders[defender] && this.game.defenders[defender].currentTile == this.currentTile){
									//This makes sure the ball is not intercepted by a defender that has advanced past the line of scrimmage towards the quarterback
									if(this.currentTile.x < (this.game.width - 3)) {
										this.game.defenders[defender].addBlink();
										resolveType = "intercepted";
										finished = true;
										break;
									}
								}
							}
						}
					}
				}
				await this.restInterval();
			}
			this.removeElement(this.element);
			if(resolveType) resolve(resolveType);
			else {
				resolve("incomplete");
			}
		});
	}

	//Used to animate the ball on kickoffs
	kickOff(remove) {
		return new Promise(async (resolve, reject) => {
			let finished = false;
			while(!finished) {
				await this.restInterval();
				if(this.currentTile.x == (this.game.width - 1)) finished = true;
				else this.move(this.game.tiles[this.currentTile.y][this.currentTile.x + 1]);
			}
			if(remove) this.removeElement(this.element);
			resolve("complete");
		});
	}
	
	// Used to animate the ball on fieldgoal attempts
	fieldGoal() {
		return new Promise(async (resolve, reject) => {
			let finished = false;
			while(!finished) {
				await this.restInterval();
				if(this.currentTile.x - 1 < 0) finished = true;
				else this.move(this.game.tiles[this.currentTile.y][this.currentTile.x - 1])
			}
			this.removeElement(this.element);
			resolve("complete");
		});
	}

	// Used to pause the game between ball movements
	restInterval() {
		return new Promise((resolve, reject) => setTimeout(resolve, Config.gameplay.ballMovementSpeed));
	}

	// The overwrites the move method in the base token class
	// On larger game boards the gScore of the token occupied by the ball is lowered increasing the likihood of a defender moving into the ball's path and intercepting it.
	move(tile) {
		this.currentTile.gScore = 1;
		if(this.game.width > 10 && this.game.height > 3) {
			tile.gScore = -2;
		}
		else if(this.game.width > 10) {
			tile.gScore = -1;
		}
		else if(this.game.height > 3) {
			tile.gScore = -1;
		}
		super.move(tile);
	}
}