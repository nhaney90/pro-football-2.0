//base class for defenders, wrs, the ball and the player
export class Token {
	constructor() {
		this.currentTile = null;
	}
					
	addElement(tile, elementHTML) {
		this.element = $(elementHTML)
		tile.append(this.element);
	}
					
	removeElement(element) {
		if(element)element.remove();
		this.element = null;
	}
		
	move(tile) {
		this.removeElement(this.element);
		this.addElement(tile.element, this.elementHTML);
		this.currentTile = tile;
	}
		
	addBlink() {
		$("#" + this.elementId).addClass("blink");
	}
		
	removeBlink() {
		$("#" + this.elementId).removeClass("blink");
	}		
}