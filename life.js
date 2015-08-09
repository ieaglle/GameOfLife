var life = (function(){
	
	var generation = 0;
	
	var config = {
		canvasId: 'canvas',
		width: 150,
		height: 60,
		cellWidth: 10,
		cellHeight: 10,
		gridColor: '#ccc',
		aliveCellColor: '#000',
		get pixelWidth() {return 1 + (this.width*this.cellWidth);},
		get pixelHeight() {return 1 + (this.height*this.cellWidth);},
		stepDuration: 50,
		cellType: 'circle'
	};
	
	var canvas,
		drawingContext,
		aliveCells = [];
	
	function getCursorPosition(e) {
		var x = e.pageX - e.target.offsetLeft;
			y = e.pageY - e.target.offsetTop;
		return {x: Math.floor(x/config.cellWidth), y: Math.floor(y/config.cellHeight)};
	}
	
	function cellExists(x, y) {
		for (var i = 0, len = aliveCells.length; i < len; i++) {
			if ((aliveCells[i].y == y) && 
				(aliveCells[i].x == x)) {
				return i;
			}	
		}
		return -1;
	}
	
	function onCanvasClick(e) {
		var cell = getCursorPosition(e);
		var index = cellExists(cell.x, cell.y);
		if (index != -1){
			aliveCells.splice(index, 1);
		}
		else {
			aliveCells.push(cell);
		}
		drawBoard();
	}
	
	function drawAliveCellCircle(cell) {
		var x = (cell.x * config.cellWidth) + (config.cellWidth/2);
		var y = (cell.y * config.cellHeight) + (config.cellHeight/2);
		var radius = (config.cellWidth/2) - (config.cellWidth/10);
		drawingContext.beginPath();
		drawingContext.arc(x, y, radius, 0, Math.PI*2, false);
		drawingContext.closePath();
		drawingContext.strokeStyle = config.aliveCellColor;
		drawingContext.stroke();
		drawingContext.fillStyle = config.aliveCellColor;
		drawingContext.fill();
	}
	
	function drawAliveCellRect(cell) {
		var x = cell.x * config.cellWidth;
		var y = cell.y * config.cellHeight;
		
		drawingContext.fillStyle = config.aliveCellColor;
		drawingContext.fillRect(x + 1, y + 1, config.cellWidth - 1, config.cellHeight - 1)
	}
	
	function getDrawFunc(cellType) {
		switch (cellType) {
			case 'circle':
				return drawAliveCellCircle;
			case 'rect':
				return drawAliveCellRect;
			default:
				return drawAliveCellCircle;
		}
	}
	
	function drawBoard() {
		drawingContext.clearRect(0, 0, config.pixelWidth, config.pixelHeight);
		drawingContext.beginPath();
		for (var x = 0; x <= config.pixelWidth; x += config.cellWidth) {
			drawingContext.moveTo(0.5 + x, 0);
			drawingContext.lineTo(0.5 + x, config.pixelHeight);
		}
		for (var y = 0; y <= config.pixelHeight; y += config.cellHeight) {
			drawingContext.moveTo(0, 0.5 + y);
			drawingContext.lineTo(config.pixelWidth, 0.5 +  y);
		}
		drawingContext.strokeStyle = config.gridColor;
		drawingContext.stroke();
	
		var draw = getDrawFunc(config.cellType)
		for (var i = 0, len = aliveCells.length; i < len; i++) {
			draw(aliveCells[i]);
		}
	}
	
	function calcNeigbNum(col, row){
		var num = 0;
		
		var rowStart = Math.max(0, row - 1);
		var rowEnd = Math.min(config.height, row + 1);
		var colStart = Math.max(0, col - 1);
		var colEnd = Math.min(config.width, col + 1);
		
		for (var y = rowStart; y <= rowEnd; y++){
			for (var x = colStart; x <= colEnd; x++){
				if (y == row && x == col)
					continue;
			
				if(cellExists(x, y) != -1)
					num++;
			}
		}
		return num;
	}
	
	function iterate() {
		var del = [],
		    add = [];
		
		for(var row = 0; row < config.height; row++)
			for (var col = 0; col < config.width; col++){
			{
				var index = cellExists(col, row);
				var num = calcNeigbNum(col, row);
				
				//lone or starvation death
				if (index != -1 && (num <=1 || num >= 4)){
					del.push(index);
				}
				//create life
				if (index == -1 && num == 3){
					add.push({x: col, y: row});
				}
			}
		}
		
		del.sort(function(a, b){return b-a});
		
		for (var i = 0, len = del.length; i < len; i++) {
			aliveCells.splice(del[i], 1);
		}
		for (var i = 0, len = add.length; i < len; i++) {
			aliveCells.push(add[i]);
		}
		drawBoard();
		generation++;
	}
	
	function initialize() {
		canvas = document.getElementById(config.canvasId);
		canvas.width = config.pixelWidth;
		canvas.height = config.pixelHeight;
		canvas.addEventListener("click", onCanvasClick, false);
		drawingContext = canvas.getContext("2d");
		drawBoard();
	}
	
	function run() {
		initialize();
		intervalId = setInterval(iterate, config.stepDuration);
	}
	
	function pause() {
		clearInterval(intervalId);
	}
	
	function clear() {
		clearInterval(intervalId);
		aliveCells = [];
		drawBoard();
	}
	
	function setFigure(offset, cells) {
		offset = offset || 0;
		
		for (var i = 0, len = cells.length; i < len; i++) {
			cells[i].x = offset.x + cells[i].x;
			cells[i].y = offset.y + cells[i].y;
		}
		
		aliveCells = cells;
		drawBoard();
	}

	return {
		init: function(options){
			for(var prop in options){
				config[prop] = options[prop];
			}
			initialize();
		},
		run: run,
		pause: pause,
		clear: clear,
		generation: generation,
		setFigure: setFigure
	}
})();
