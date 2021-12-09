import { Config } from '../config/config.js';
import { Defender } from '../tokens/defender.js';

export class CB extends Defender {
	constructor(tile, gameWidth, gameHeight) {
		super(gameWidth, gameHeight);
		this.elementId = "cb";
		this.elementHTML = "<div id='cb' class='token defender'><div class='token-label'>CB</div></div>";
		this.element = null;
		this.currentTile = tile 
		this.addElement(this.currentTile.element, this.elementHTML);
		this.reactZone= Config.defenders.cb.reactZone;
	}
}