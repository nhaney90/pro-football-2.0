import { Config } from '../config/config.js';
import { Defender } from '../tokens/defender.js';

export class S extends Defender {
	constructor(tile, gameWidth, gameHeight, free) {
		super(gameWidth, gameHeight);
		this.elementId = (free ? "fs" : "ss" )
		this.elementHTML = "<div id='" + this.elementId + "' class='token defender'><div class='token-label'>" + (free ? "FS" : "SS") + "</div></div>";
		this.element = null;
		this.currentTile = tile 
		this.addElement(this.currentTile.element, this.elementHTML);
		this.reactZone= Config.defenders.fs.reactZone;
		this.interval= Config.defenders.fs.interval;
	}
}