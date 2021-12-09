import { Token } from '../tokens/token.js';
import { Ball } from '../tokens/ball.js';
import { Config } from '../config/config.js';

export class Player extends Token {
	constructor(tile, gameWidth, gameHeight, label) {
		super();
		this.elementId = "player";
		this.elementHTML = "<div id='player' class='token player'><div class='token-label'>" + (label ? label : "QB") + "</div></div>";
		this.element = null;
		this.currentTile = tile 
		this.addElement(this.currentTile.element, this.elementHTML);
		this.canPass = false;
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
	}

	move(tile) {
		if(this.gameWidth > 10 && this.gameHeight > 3) {
			this.currentTile.gScore = 1;
			tile.gScore = 0;
		}
		super.move(tile);
	}
				
	pass(game) {
		var ball = new Ball(this.currentTile, game);
		return new Promise(function(resolve, reject) {
			resolve(ball.fly());
		});
	}

	// The player attempts to kick a field goal. The maximum distance is 67 yards.
	kick(yardline) {
		var randomValue = Math.floor(Math.random() * Config.fieldSize.lengthInYards) + 1;
		//y = 0.0013x**3 - 0.3229x**2 + 28.122x - 757.77
		var equation = Config.fieldSize.lengthInYards - ((0.0013 * (yardline * yardline * yardline)) - (0.3229 * (yardline * yardline)) + (28.122 * yardline) - 757.77);
			
		if(randomValue > equation) return true;
		else return false;
	}

	setLabel(label) {
		//Use this because remove element fails for some reason
		$("#player").remove();
		let temp = "<div id='player' class='token player'><div class='token-label'>" + label  + "</div></div>";
		this.elementHTML = temp;
		this.addElement(this.currentTile.element, this.elementHTML);
	}
}