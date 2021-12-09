import { Token } from '../tokens/token.js';

export class WR extends Token {
	constructor(gameHeight, gameWidth, order, index) {
		super();
		this.elementId = (order == 2 ? "wr2" : "wr");
		this.elementHTML = "<div id='" + (order == 2 ? "wr2" : "wr") + "' class='token wr'><div class='token-label'>WR</div></div>";
		this.element = null;
		this.gameHeight = gameHeight;
		this.gameWidth = gameWidth;
		this.leftY = gameHeight - 1;
		this.startX = gameWidth - 4;
		this.lCurlRoute = null;
		this.lGoRoute = null;
		this.lCrossingRoute = null;
		this.lDragRoute = null;
		this.rCurlRoute = null;
		this.rGoRoute = null;
		this.rCrossingRoute = null;
		this.rDragRoute = null;
		this.halt = false;
		this.currentRoute = null;
		this.currentTile = null;
		this.order = 0;
		if(order) {
			this.order = order;
			this.index = index;
		} 
		this.createRoutes();
		this.selectRandomRoute();
	}

	addWR(tiles) {
		this.currentTile = tiles[this.currentRoute.nodes[0].y][this.startX + 1];
		this.addElement(this.currentTile.element, this.elementHTML);
	}

	createRoutes() {
		this.lCurlRoute = [{x:this.startX,y:this.leftY},{x:this.startX-1,y:this.leftY},{x:this.startX-2,y:this.leftY},{x:this.startX-3,y:this.leftY},{x:this.startX-3,y:this.leftY-1}];
		this.lGoRoute = [{x:this.startX,y:this.leftY},{x:this.startX-1,y:this.leftY},{x:this.startX-2,y:this.leftY},{x:this.startX-3,y:this.leftY},{x:this.startX-4,y:this.leftY},{x:this.startX-5,y:this.leftY}];
		this.lCrossingRoute = [{x:this.startX,y:this.leftY},{x:this.startX-1,y:this.leftY},{x:this.startX-2,y:this.leftY},{x:this.startX-3,y:this.leftY},{x:this.startX-3,y:this.leftY-1},{x:this.startX-3,y:this.leftY-2}];
		this.lDragRoute = [{x:this.startX,y:this.leftY},{x:this.startX-1,y:this.leftY},{x:this.startX-1,y:this.leftY-1},{x:this.startX-1,y:this.leftY-2}];
		this.rCurlRoute = [{x:this.startX,y:0},{x:this.startX-1,y:0},{x:this.startX-2,y:0},{x:this.startX-3,y:0},{x:this.startX-3,y:1}];
		this.rGoRoute = [{x:this.startX,y:0},{x:this.startX-1,y:0},{x:this.startX-2,y:0},{x:this.startX-3,y:0},{x:this.startX-4,y:0},{x:this.startX-5,y:0}];
		this.rCrossingRoute = [{x:this.startX,y:0},{x:this.startX-1,y:0},{x:this.startX-2,y:0},{x:this.startX-3,y:0},{x:this.startX-3,y:1},{x:this.startX-3,y:2}];
		this.rDragRoute = [{x:this.startX,y:0},{x:this.startX-1,y:0},{x:this.startX-1,y:1},{x:this.startX-1,y:2}];
		if(this.gameWidth > 10) {
			this.lGoRoute.push({x:this.startX-6,y:this.leftY});
			this.lGoRoute.push({x:this.startX-7,y:this.leftY});
			this.rGoRoute.push({x:this.startX-6,y:0});
			this.rGoRoute.push({x:this.startX-7,y:0});
			this.lCrossingRoute = [{x:this.startX,y:this.leftY},{x:this.startX-1,y:this.leftY},{x:this.startX-2,y:this.leftY},{x:this.startX-3,y:this.leftY},{x:this.startX-4,y:this.leftY},{x:this.startX-5,y:this.leftY},{x:this.startX-5,y:this.leftY-1},{x:this.startX-5,y:this.leftY-2}];
			this.rCrossingRoute = [{x:this.startX,y:0},{x:this.startX-1,y:0},{x:this.startX-2,y:0},{x:this.startX-3,y:0},{x:this.startX-4,y:0},{x:this.startX-5,y:0},{x:this.startX-5,y:1},{x:this.startX-5,y:2}];
		}
		if(this.gameHeight > 3) {
			let previous = this.lCrossingRoute[this.lCrossingRoute.length -1];
			this.lCrossingRoute.push({x:previous.x, y:this.leftY-3});
			this.lCrossingRoute.push({x:previous.x, y:this.leftY-4});
			previous = this.rCrossingRoute[this.rCrossingRoute.length -1];
			this.rCrossingRoute.push({x:previous.x, y:3});
			this.rCrossingRoute.push({x:previous.x, y:4});
			previous = this.lDragRoute[this.lDragRoute.length -1];
			this.lDragRoute.push({x:previous.x, y:this.leftY-3});
			this.lDragRoute.push({x:previous.x, y:this.leftY-4});
			previous = this.rDragRoute[this.rDragRoute.length -1];
			this.rDragRoute.push({x:previous.x, y:3});
			this.rDragRoute.push({x:previous.x, y:4});
		}
		this.routes=[{nodes:this.lCurlRoute,name:"Left Curl"}, {nodes:this.lGoRoute,name:"Streak Left"}, {nodes:this.lCrossingRoute,name:"Left Deep Cross"}, {nodes:this.lDragRoute,name:"Left Drag"}, {nodes:this.rCurlRoute,name:"Right Curl"}, {nodes:this.rGoRoute,name:"Streak Right"}, {nodes:this.rCrossingRoute,name:"Right Deep Cross"}, {nodes:this.rDragRoute,name:"Right Drag"}];
	}

	move(tile) {
		if(this.gameWidth > 10 && this.gameHeight > 3) {
			this.currentTile.gScore = 1;
			tile.gScore = 2;
		}
		super.move(tile);
	}
		
	stopRoute() {
		this.removeElement(this.element);
		this.halt = true;
		$("#currentPlay").text("");
	}

	selectRandomRoute() {
		if(this.order > 0) {
			if(this.order == 1) {
				if(this.index == 1) this.currentRoute = this.routes[3];
				else if(this.index == 2) this.currentRoute = this.routes[0];
				else if(this.index == 3) this.currentRoute = this.routes[2];
				else if(this.index == 4) this.currentRoute = this.routes[1];
				$("#currentPlay").append(this.currentRoute.name);
			}
			else if(this.order == 2) {
				if(this.index == 1) this.currentRoute = this.routes[5];
				else if(this.index == 2) this.currentRoute = this.routes[6];
				else if(this.index == 3) this.currentRoute = this.routes[4];
				else if(this.index == 4) this.currentRoute = this.routes[7];
				$("#currentPlay").append(" / " + this.currentRoute.name);
			}
		}
		else {
			var tempInt = Math.floor(Math.random() * 8)
			this.currentRoute = this.routes[tempInt];
			$("#currentPlay").append(this.currentRoute.name);
		}
	}
}