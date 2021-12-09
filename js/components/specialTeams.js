import { Ball } from '../tokens/ball.js';
import { LB } from '../tokens/lb.js';
import { Player } from '../tokens/player.js';
import { Enums } from '../utils/enums.js';
import { Config } from '../config/config.js';

export class SpecialTeams {
	constructor(game) {
		this.game = game;
		this.ball = null;
		this.kickingTeam = null;
		this.kickReturn = false;
		this.kickReturnDefense = [];
	}
	
    // Put the kickoff tokens on the gameboard
	addKickoffTokens() {
		let ballY = 1;
		let yMod = 0;
		if(this.game.height == 5) {
			yMod = 1;
		}
        //3 defenders
		this.kickingTeam = [new LB(this.game.tiles[0+yMod][0], this.game.width, this.game.height, "", "DB"), new LB(this.game.tiles[1+yMod][0], this.game.width, this.game.height, "", "K"), new LB(this.game.tiles[2+yMod][0], this.game.width, this.game.height, "", "DB")];
		//The ball is sitting on the T
        this.ball = new Ball(this.game.tiles[ballY + yMod][3], this.game);
	}
		
	addFieldGoalTokens() {
		let ballY = 1;
		let yMod = 0;
		if(this.game.height == 5) {
			yMod = 1;
		}
		this.kickReturnDefence = [new LB(this.game.tiles[0+yMod][this.game.width - 6], this.game.width, this.game.height, "", "DL"), new LB(this.game.tiles[1+yMod][this.game.width - 6], this.game.width, this.game.height, "", "DL"), new LB(this.game.tiles[2+yMod][this.game.width - 6], this.game.width, this.game.height, "", "DL")];
		this.kickingTeam = [new LB(this.game.tiles[1+yMod][this.game.width - 1], this.game.width, this.game.height, "", "K",true), new LB(this.game.tiles[0+yMod][this.game.width - 5], this.game.width, this.game.height, "", "OL",true), new LB(this.game.tiles[1+yMod][this.game.width - 5], this.game.width, this.game.height, "", "OL",true), new LB(this.game.tiles[2+yMod][this.game.width - 5], this.game.width, this.game.height, "", "OL",true)];
		this.ball = new Ball(this.game.tiles[ballY + yMod][this.game.width - 3], this.game);
	}
	
    // Gets the distance the ball was kicked
	getKickoffDistance() {
		let distance = Math.floor(Math.random() * 30);
        if(distance > 20) return -1;
        else return distance;
	}
	
    // Add a defender at a random location during kickoff returns
	addRandomDefender(index) {
		var success = false;
        // Keep looping until a defender is successfully placed in an open tile
		while(success == false) { 
			var y = Math.floor(Math.random() * this.game.height);
			if(this.game.height > 3) {
				let chance = Math.floor(Math.random() * 5);
                //If it is a tall board there is a 40% chance the defender will spawn on the same row as the player.
				if(chance == 2 || chance == 4) y = this.game.player.currentTile.y;
			}
			var x = Math.floor(Math.random() * this.game.width);
			if(this.game.checkOccupiedTiles(this.game.tiles[y][x], Enums.tokenEnum.defender) == Enums.tileEnum.open){
				this.game.addDefender([Object.keys(this.game.defenders)[index]], new LB(this.game.tiles[y][x], this.game.width, this.game.height, index, "DB", null, 6));
				this.kickReturnDefense.push(Object.keys(this.game.defenders)[index]);
				success = true;
			}
		}
	}
		
	kickoffBall() {
		this.game.removeLOS();
		this.game.stats.setScoreboardLabels("--", "--", "OPP " + Config.kicking.kickoffLine);
		this.kickReturn = true;
		this.kickReturnDefense = [];
		this.kickoffAnimation();
	}
		
	kickFieldGoal() {
		return new Promise(async(resolve, reject) => {
			await this.restInterval();
			this.fieldGoalAnimation().then(() => {
				resolve(true);
			});
		});
	}
		
	removeKickingTeam() {
		for(var i = 0; i < this.kickingTeam.length; i++) {
			this.kickingTeam[i].removeElement(this.kickingTeam[i].element);
		}
	}
		
	fieldGoalAnimation() {
		return new Promise(async(resolve, reject) => {
			let kicked = false;
			while(!kicked) {
				await this.restInterval();
				if(this.kickingTeam[0].currentTile.x == (this.game.width - 3)) kicked = true;
				else {
					this.kickingTeam[0].move(this.game.tiles[this.kickingTeam[0].currentTile.y][this.kickingTeam[0].currentTile.x - 1]);
				}
			}
			this.kickBall("fieldGoal").then(()=> {
				resolve(true);
			});
		});
	}
		
	async kickoffAnimation() {
		let kicked = false;
		while(!kicked) {
			await this.restInterval();
			if(this.kickingTeam[0].currentTile.x == 3) kicked = true;
			else {
				this.kickingTeam[0].move(this.game.tiles[this.kickingTeam[0].currentTile.y][this.kickingTeam[0].currentTile.x + 1]);
				this.kickingTeam[1].move(this.game.tiles[this.kickingTeam[1].currentTile.y][this.kickingTeam[1].currentTile.x + 1]);
				this.kickingTeam[2].move(this.game.tiles[this.kickingTeam[2].currentTile.y][this.kickingTeam[2].currentTile.x + 1]);
			}
		}
		this.kickBall("first");
	}

    // Used to pause the game during kicking animations
	restInterval() {
		return new Promise((resolve, reject) => setTimeout(resolve, Config.kicking.animationSpeed));
	}
		
	kickBall(param) {
		return new Promise((resolve, reject) => {
			let playerY = 1;
			if(this.game.height > 3) playerY = 2;
            //This is where the ball is fielded by the player
			if(param == "second") {
				this.ball.kickOff(true).then(() => {
					this.game.ballSnapped = true;
					var kickoffDistance = this.getKickoffDistance();
                    //A kickoff counts as the beginning of a drive
					this.game.stats.createDrive(kickoffDistance);
					this.game.stats.currentDrive.startPlay();
                    // This indicates the kick was a touchback
					if(kickoffDistance < 0) {
						this.game.stopPlay(0);
					}
                    //If it is a tall board there will be 3 initial defenders
					if(this.game.height > 3) {
						let d1X = Math.floor(Math.random() * 3);
						let d1Y = Math.floor(Math.random() * 2);
						this.game.addDefender([Object.keys(this.game.defenders)[0]], new LB(this.game.tiles[d1Y][d1X], this.game.width, this.game.height, 0, "DB"));
						this.kickReturnDefense.push(Object.keys(this.game.defenders)[0]);
						let d2X = Math.floor(Math.random() * 3);
						this.game.addDefender([Object.keys(this.game.defenders)[1]], new LB(this.game.tiles[playerY][d2X], this.game.width, this.game.height, 1, "DB"));
						this.kickReturnDefense.push(Object.keys(this.game.defenders)[1]);
						let d3X = Math.floor(Math.random() * 3);
						let d3Y = Math.floor(Math.random() * 2) + 3;
						this.game.addDefender([Object.keys(this.game.defenders)[2]], new LB(this.game.tiles[d3Y][d3X], this.game.width, this.game.height, 2, "DB"));
						this.kickReturnDefense.push(Object.keys(this.game.defenders)[2]);
					}
                    //Othersie there will be one initial defender
					else {
						this.game.addDefender([Object.keys(this.game.defenders)[0]], new LB(this.game.tiles[playerY][0], this.game.width, this.game.height, 0, "DB"));
						this.kickReturnDefense.push(Object.keys(this.game.defenders)[0]);
					}
					resolve(true);
				});
			}
            //This is where the ball is kicked by the kicking team
			else if (param == "first") {
				this.ball.kickOff(false).then(() => {
					this.removeKickingTeam();
					this.ball.move(this.game.tiles[playerY][0]);
					this.game.player = new Player(this.game.tiles[playerY][this.game.width - 1],this.game.width, this.game.height,"KR");
					this.game.player.canPass = false;
					this.kickBall("second");
				});
			}
			else {
				this.ball.fieldGoal().then(() => {
					resolve(true);
				});
			}
		});
	}
}