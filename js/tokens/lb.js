import { Config } from '../config/config.js';
import { Defender } from '../tokens/defender.js';

export class LB extends Defender {
	constructor(tile, gameWidth, gameHeight, id, label, playerTeam, zone) {
		super(gameWidth, gameHeight);
			
		this.elementId = "lb" + id
		this.elementHTML = "<div id='" + this.elementId + "' class='token " + (playerTeam ? "wr" : "defender") + "'><div class='token-label'>" + label + "</div></div>";
		this.element = null;
		this.currentTile = tile 
		this.addElement(this.currentTile.element, this.elementHTML);
		this.reactZone= (zone ? zone : Config.defenders.lb.reactZone);
		this.moveInterval = Math.floor(Math.random() * 3) + (this.gameHeight > 3 ? 1 : 2);
		this.throwingLaneTile = null;
	}
	
	//The LB can move one space in any direction at random
	enterThrowingLane(game) {
		var temp = Math.floor(Math.random() * 4);
		if(temp == 0 && game.tiles[this.currentTile.y - 1]) this.throwingLaneTile = game.tiles[this.currentTile.y - 1][this.currentTile.x];
		else if(temp == 1 && game.tiles[this.currentTile.y + 1]) this.throwingLaneTile = game.tiles[this.currentTile.y + 1][this.currentTile.x];
		else if(temp == 2 && [this.currentTile.x+1]) this.throwingLaneTile = game.tiles[this.currentTile.y][this.currentTile.x+1];
		else if(game.tiles[this.currentTile.x-1]) this.throwingLaneTile = game.tiles[this.currentTile.y][this.currentTile.x-1];
	}
}