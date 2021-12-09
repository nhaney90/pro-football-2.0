import { Token } from '../tokens/token.js';

export class Defender extends Token {
	constructor(gameWidth, gameHeight) {
		super();
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
	}

	move(tile) {
		if(this.gameWidth > 10 && this.gameHeight > 3) {
			this.currentTile.gScore = 1;
			tile.gScore = 2;
		}
		super.move(tile);
	}
}