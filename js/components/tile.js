export class Tile {
	constructor(rowid,tileid,x,y) {
		this.fScore = null;
		this.gScore = 1;
		this.hScore = null;
		this.los = false
		this.firstDown = false;
		this.opponentEndzone = false;
		this.endZone = false;
		this.x = x
		this.y = y
		this.element = $("<th class='tile'></th>");
		this.addTile(rowid);
		this.id = tileid;
	}

	//Uses the A* Search algorithm - https://en.wikipedia.org/wiki/A*_search_algorithm
		
	calculateHScore(targetX,targetY) {
		this.hScore =  Math.abs(this.x - targetX) + Math.abs(this.y - targetY);
		return this.hScore;
	}
		
	calculateFScore(targetX, targetY) {
		this.fScore = this.gScore + this.calculateHScore(targetX, targetY);
	}
		
	addTile(id) {
		$("#" + id).append(this.element);
	}
}
	
	