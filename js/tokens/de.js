import { Config } from '../config/config.js';
import { Defender } from '../tokens/defender.js';

export class DE extends Defender {
	constructor(tile,gameWidth, gameHeight, id) {
		super(gameWidth,gameHeight);
		this.elementId = id + "de"
		this.elementHTML = "<div id='" + this.elementId + "' class='token defender'><div class='token-label'>DL</div></div>";
		this.element = null;
		this.currentTile = tile 
		this.addElement(this.currentTile.element, this.elementHTML);
		this.reactZone= Config.defenders.de.reactZone;
		this.moveInterval = Math.floor(Math.random() * 3) + 1;
		this.throwingLaneTile = null;
	}

	//Defenders can drop back into coverage
	enterThrowingLane(game) {
		this.throwingLaneTile = game.tiles[this.currentTile.y][this.currentTile.x-1];
	}
}