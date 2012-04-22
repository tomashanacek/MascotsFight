/**
 * @author Tomas Hanacek
 */


/**
 * @class Debugger static class to debug code
 */
var Debugger = function() {}
Debugger.log = function(message) {
    try {
        console.log(message);
    } catch (exception) {
        alert(exception);
        return;
    }
}

// Handle event window load

window.addEventListener("load", eventWindowLoaded, false);

/**
 * function execute game
 */
function eventWindowLoaded() {
    MascotsFight("canvasOne");
}

/**
 * function check canvas support in browser
 */
function canvasSupport() {
    return Modernizr.canvas;
}

/**
 * GAME MASCOTS FIGHT CODE
 */
function MascotsFight(canvasElementId) {
    if (!canvasSupport()) {
        return;
    }
    
    var preloadImages = [
    	{"name": "background", "image": "background.png"},
        {"name": "button", "image": "button0.png"},
        {"name": "construction_site", "image": "construction_site.png"},
        {"name": "for_a_good_night", "image": "for_a_good_night.png"},
        {"name": "night_workshift", "image": "night_workshift.png"},
        {"name": "in_a_captivity_of_8-bit", "image": "in_a_captivity_of_8-bit.png"},
        {"name": "tuxup", "image": "tux8.png"},
        {"name": "tuxdown", "image": "tux2.png"},
        {"name": "tuxleft", "image": "tux4.png"},
        {"name": "tuxright", "image": "tux6.png"},
        {"name": "simpleleft", "image": "icon.gun.simple.left.png"},
        {"name": "simpleright", "image": "icon.gun.simple.right.png"},
        {"name": "scatterleft", "image": "icon.gun.scatter.left.png"},
        {"name": "scatterright", "image": "icon.gun.scatter.right.png"},
        {"name": "tommyleft", "image": "icon.gun.tommy.left.png"},
        {"name": "tommyright", "image": "icon.gun.tommy.right.png"},
        {"name": "cross", "image": "cross.png"},
    ];
    
    var preloadSounds = [
    	{"name": "dead", "sound": "dead2.ogg"},
    	{"name": "explozion", "sound": "explozion.ogg"},
    	{"name": "simple", "sound": "gun_revolver.ogg"},
    	{"name": "scatter", "sound": "gun_scatter.ogg"},
    	{"name": "tommy", "sound": "gun_tommy.ogg"},
    	{"name": "put_mine", "sound": "put_mine.ogg"},
    ];
    
    // get canvas
    var theCanvas = document.getElementById(canvasElementId);
    var context = theCanvas.getContext("2d");

    // globals variables and constants
    var imagesContainer = {};
    var soundsContainer = {};
    
    // KEY_CODE = [LEFT, UP, RIGHT, DOWN, SHOT, BOMB]
    const KEY_CODES = [[37, 38, 39, 40, 78, 77], [65, 87, 68, 83, 70, 71]];
    const UP = "up", DOWN = "down", RIGHT = "right", LEFT = "left";
    const GUN_SIMPLE = "simple";
    const SPEED = 3;
    const ALIVE = 1, DEAD = 2;
    const GAME_STATE_TITLE = 1, GAME_STATE_PLAY_LEVEL = 2, GAME_STATE_MAP_SELECTION = 3, GAME_STATE_GAME_OVER = 4, GAME_STATE_CONTROLS = 5; 
    
    // application structures
    
    /**
     * Create inherits function
     */
    var inherits = function(child, parent) {
		var F = function() {};
		F.prototype = parent.prototype;
		child.prototype = new F();
		child._superClass = parent.prototype;
		child.prototype.constructor = child;
	};
    
    /**
     * @class class for working with map structure
     */
    var Map = function(name) {
        this.map = null;
        this.name = name;
        this.background = null;
        this.width = 800;
        this.height = 600;
        this.images = {};
        this.wallsUnder = [];
        this.wallsAbove = [];
    };
    Map.prototype.load = function(map) {
        this.map = map;
        this.background = this.map.background;
        this.width = this.map.width;
        this.height = this.map.height;
        this.preloadImages();
        this.loadWalls();
    };
    Map.prototype.preloadImages = function() {
        var image = null
        for (var i = 0, length = this.map.images.length; i < length; i++) {
            image = this.map.images[i];
            this.images[image.name] = new Image();
            this.images[image.name].src = "maps/"+this.name+"/"+image.file;
        }
    }
    Map.prototype.loadWalls = function() {
        var wall = null;
        for (var i = 0, length = this.map.walls.length; i < length; i++) {
            wall = this.map.walls[i];
            switch (wall.layer) {
                case 0:
                    this.wallsUnder.push(wall);
                    break;
                case 1:
                    this.wallsAbove.push(wall);
                    break;
            }
        }
    };
    Map.prototype.renderUnder = function() {
        context.drawImage(this.images[this.background], 0, 0, this.width, this.height);
        
        var wall = null;
        for (var i = 0, length = this.wallsUnder.length; i < length; i++) {
            wall = this.wallsUnder[i];
            context.drawImage(this.images[wall.image], wall.img_x, wall.img_y, wall.img_width, wall.img_height);
        }
    };
    Map.prototype.renderAbove = function() {
        var wall = null;
        for (var i = 0, length = this.wallsAbove.length; i < length; i++) {
            wall = this.wallsAbove[i];
            context.drawImage(this.images[wall.image], wall.img_x, wall.img_y, wall.img_width, wall.img_height);
        }
    };
    
    /**
     * @class General player class
     */
    var Player = function() {
    	this.width = 40;
        this.height = 54;
        
        this.x = 0;
        this.y = 0;
        this.xMovement = 0;
        this.yMovement = 0;
        
        this.direction = UP;
        this.walking = false;
        
        this.state = ALIVE;
        this.counter = 0;
        
        this.gun = null;
        this.bombs = [];
        
        this.score = {
            "kill": 0,
            "killed": 0
        };
        
        this.randomPosition();
    };
    Player.prototype.move = function() {
        if (this.xMovement != 0) {
            this.x += this.xMovement;
        }
        if (this.yMovement != 0) {
            this.y += this.yMovement;
        }
    }
    Player.prototype.reset = function() {
        this.xMovement = 0;
        this.yMovement = 0;

        this.gun.setDirection(this.direction);
    }
    Player.prototype.distance = function() {
        this.x -= this.xMovement;
        this.y -= this.yMovement;
    }
    Player.prototype.render = function() {
        context.save();
        context.translate(this.x, this.y);

        switch (this.state) {
            case ALIVE:
                // render gun
                this.gun.render(this.x, this.y);

                // render tux
                context.drawImage(
                    imagesContainer["tux"+this.direction],
                    this.counter * 40, 0,
                    this.width,
                    this.height,
                    0,
                    0,
                    this.width,
                    this.height
                    );

                // simulate walk
                this.walk();
                break;
            case DEAD:
                // render tux
                context.drawImage(
                    imagesContainer["cross"],
                    0, 0, this.width, this.height);
                this.checkRevive();
                break;
        }

        context.restore();
    }
    Player.prototype.setGun = function(gun) {
        this.gun = gun;
    }
    Player.prototype.walk = function() {
        if (this.walking) {
            if (this.counter == 8) {
                this.counter = 0;
            }
            this.counter++;
        }
    }
    Player.prototype.dropBomb = function() {
        if (this.bomb) {
            Debugger.log('bomb');
        }
    }
    Player.prototype.randomPosition = function() {
        var object = RandomPositionGenerator.generate(this.width, this.height);
        this.x = object.x;
        this.y = object.y;
    }
    Player.prototype.dead = function() {
        this.score.killed++;
        this.state = DEAD;
        this.counter = 0;
        this.width = 30;
        this.height = 40;
        soundsContainer["dead"].play();
    }
    Player.prototype.isAlive = function() {
        if (this.state == ALIVE) {
            return true;
        }
        return false;
    }
    Player.prototype.checkRevive = function() {
        this.counter++;
        if (this.counter == FRAME_RATE) {
            this.state = ALIVE;
            this.counter = 0;
            this.width = 40;
            this.height = 54;
            this.randomPosition();
        }
    }

    /**
     * @class MascotPlayer
     * @param {array} [LEFT, UP, RIGHT, DOWN]
     */
    var MascotPlayer = function(keyCodes) {
    	Player.call(this);
    	
        this.keyCodes = keyCodes;
    };
    inherits(MascotPlayer, Player);
    
    MascotPlayer.prototype.handleKeyPressedList = function() {
        // left
        if (keyPressList[this.keyCodes[0]]) {
            this.direction = LEFT;
            this.xMovement = -SPEED;
            this.walking = true;
        }
        // up
        if (keyPressList[this.keyCodes[1]]) {
            this.direction = UP;
            this.yMovement = -SPEED;
            this.walking = true;
        }
        // right
        if (keyPressList[this.keyCodes[2]]) {
            this.direction = RIGHT;
            this.xMovement = SPEED;
            this.walking = true;
        }
        // down
        if (keyPressList[this.keyCodes[3]]) {
            this.direction = DOWN;
            this.yMovement = SPEED;
            this.walking = true;
        }
        if (this.isAlive()) {
            // shot
            if (keyPressList[this.keyCodes[4]] > 0) {
                this.gun.shot();
                keyPressList[this.keyCodes[4]]--;
            }
            // bomb
            if (keyPressList[this.keyCodes[5]] > 0) {
                this.dropBomb();
            }
        }
    }
	
	/**
	 * @class MascotEnemy
	 * @TODO dodelat umelou inteligenci
	 */
	var MascotEnemy = function() {
		Player.call(this);
	};
	inherits(MascotEnemy, Player);
	
	var consoleCounter = 0;
	MascotEnemy.prototype.move = function() {
		var player = null,
			enemy = null,
			difference = 10000,
			tempDifference = 0,
			xDifference = 0
			yDifference = 0;
		
		for (var i = 0; i < playersCount; i++) {
			player = playersContainer[i];
			if (player != this) {
				xDifference = this.x - player.x;
				yDifference = this.y - player.y;
				tempDifference = Math.sqrt(xDifference * xDifference + yDifference * yDifference);
				if (tempDifference < difference) {
					difference = tempDifference;
					enemy = player;
				}
			}
		}
		// -------------------
		if (consoleCounter == 0) {
			console.log(this, enemy);
			consoleCounter++;
		}
		// -------------------
		
		xDifference = Math.abs(this.x - enemy.x);
		yDifference = Math.abs(this.y - enemy.y);
		
		if (xDifference > (this.width + 2)  && xDifference > yDifference) {
			if (this.x != enemy.x) {
				if (this.x > enemy.x) {
					this.direction = LEFT;
					this.xMovement = -SPEED;	
				} else {
					this.direction = RIGHT;
					this.xMovement = SPEED;
				}
				
				this.walking = true;
			} else {
				this.walking = false;
			}
		}  
		
		if (yDifference > 2) {
			if (this.y != enemy.y) {
				if (this.y > enemy.y) {
					this.direction = UP;
					this.yMovement = -SPEED;
				} else {
					this.direction = DOWN;
					this.yMovement = SPEED;
				}
				
				this.walking = true;
			} else {
				this.walking = false;
			}
		}
		
		Player.prototype.move.call(this);
	}
	var consoleCounter2 = 0;
	MascotEnemy.prototype.distance = function(collideObject) {
		if (collideObject == undefined) {
			this.x -= this.xMovement;
        	this.y -= this.yMovement;
			return;
		}
        
		var left1 = this.x;
        var left2 = collideObject.x;
		var right1 = this.x + this.width;
		var right2 = collideObject.x + collideObject.width;
		var top1 = this.y;
		var top2 = collideObject.y;
		var bottom1 = this.y + this.height;
		var bottom2 = collideObject.y + collideObject.height;
		
		var difference = 0,
			left = false,
			top = false;
		
		this.x -= this.xMovement;
        this.y -= this.yMovement;
        
        console.log(this.direction);
        
        if (this.direction == LEFT || this.direction == RIGHT) {
        	this.y += SPEED;
		}
		/*
		difference = Math.abs(right1 - left2);

		if (top1 > top2 - this.height && bottom1 < bottom2 + this.height && difference <= 3 && right1 >= left2 && left2 - left1 > 0 && left2 - left1 <= this.width) {
        	left = true;
        }
        
        difference = Math.abs(top1 - bottom2);
        
        if (left1 > left2 - this.width && right1 < right2 + this.width && difference <= 3 && top1 <= bottom2 && bottom1 - bottom2 > 0 && bottom1 - bottom2 <= this.height) {
        	top = true;
        }
        
        difference = Math.abs(bottom1 - top2);
        
        if (left1 > left2 - this.width && right1 < right2 + this.width && difference <= 3 && bottom1 >= top2 && Math.abs(top1 - top2) <= this.height) {
        	top = true;
        }
        */
        
        console.log("--------");
        
		// -------------------
		if (consoleCounter2 == 0) {
			console.log("width: "+this.width+" height: "+this.height);
			console.log("Enemy: ", "left: ", left1, "right: ", right1, "top: ",top1, "bottom: ",bottom1);
			console.log("Object: ", "left: ", left2, "right: ",right2, "top: ",top2, "bottom: ",bottom2);
			consoleCounter2++;
		}
		// -------------------
    }
	
    /**
     * @class Gun structure
     * @TODO dodelat obnoveni naboju po 2 sekundach
     */
    var Gun = function() {
        this.type = "simple";
        
        this.width = 50;
        this.height = 14;
        
        this.x = 0;
        this.y = 0;
        
        this.playerAxisX = 0;
        this.playerAxisY = 0;
        
        this.direction = RIGHT;
        
        this.projectilesCtr = 5;
        this.projectilesContainer = [];
    };
    Gun.prototype.setDirection = function(direction) {
        this.direction = direction;
        this.setAxisByDirection();
    }
    Gun.prototype.setAxisByDirection = function() {
    	switch (this.direction) {
            case UP:
                this.x = 31;
                this.y = 7;
                break;
            case DOWN:
                this.x = 31;
                this.y = 33;
                break;
            case RIGHT:
                this.x = 11;
                this.y = 21;
                break;
            case LEFT:
                this.x = -17;
                this.y = 21;
                break;
        }
    }
    Gun.prototype.render = function(playerX, playerY) {
        this.playerAxisX = playerX;
        this.playerAxisY = playerY;
        context.fillStyle = "#000";

        if (this.direction == LEFT || this.direction == RIGHT) {
            context.drawImage(
                imagesContainer[this.type+this.direction],
                this.x,
                this.y,
                this.width,
                this.height
                ); 
        } else if (this.direction == UP) {
            context.fillRect(
                this.x,
                this.y,
                4,
                17
                );
        }
    }
    Gun.prototype.shot = function() {
        if (this.projectilesCtr) {
        	if (!soundsContainer[this.type].ended) {
        		var tempSound = new Audio(soundsContainer[this.type].src);
        		tempSound.play();
        		delete tempSound;
        	} else {
        		soundsContainer[this.type].play();
        	}
            this.projectilesContainer.push(
                new Projectile(this.direction, this.playerAxisX, this.playerAxisY));
            //this.projectilesCtr--;
        }
    }
    Gun.prototype.removeProjectile = function(projectile) {
        var projectileIndex = this.projectilesContainer.indexOf(projectile);
        this.projectilesContainer.splice(projectileIndex, 1);
        delete projectile;
    }
    Gun.prototype.randomPosition = function() {
        var object = RandomPositionGenerator.generate(this.width, this.height);
        this.x = object.x;
        this.y = object.y;
    }
    
    /**
     * @class ScatterGun
     */
    var ScatterGun = function() {
    	Gun.call(this); 
    	this.type = "scatter";
    };
    inherits(ScatterGun, Gun);
    //@TODO bude vystrelovat 5 naboju najednou, kazdy s jinym uhlem
    
    /**
     * @class TommyGun
     */
    var TommyGun = function() {
    	Gun.call(this);
    	this.type = "tommy";
    };
    inherits(TommyGun, Gun);
    //@TODO bude vystrelovat 3 naboje za sebou
    
    /**
     * @class Projectile
     */
    var Projectile = function(direction, playerAxisX, playerAxisY) {
        this.width = 4;
        this.height = 4;
        
        this.x = 0;
        this.y = 0;
        
        this.direction = null;
        
        this.speed = 12;
        
        this.setDirection(direction, playerAxisX, playerAxisY);
    };
    Projectile.prototype.render = function() {
        context.save();
        
        context.translate(this.x, this.y);
        
        context.fillStyle = "#000";
        context.fillRect(0, 0, this.width, this.height);
        
        context.restore();
        
        this.update();
    }
    Projectile.prototype.update = function() {
        if (this.direction == UP || this.direction == DOWN) {
            this.y += this.speed;
        } else {
            this.x += this.speed;
        }
    }
    Projectile.prototype.setDirection = function(direction, playerAxisX, playerAxisY) {
        this.direction = direction;
        this.x = playerAxisX;
        this.y = playerAxisY;
        
        switch (this.direction) {
            case UP:
                this.x += 31;
                this.speed = -this.speed;
                break;
            case DOWN:
                this.x += 15;
                this.y += 20;
                break;
            case RIGHT:
                this.y += 21;
                this.x += 40;
                break;
            case LEFT:
                this.y += 21;
                this.speed = -this.speed;
                break;
        }
    }
    
    /**
     * @class Button
     */
    var Button = function(id, text) {
        this.y = id * 50;
        
        this.width = 125;
        this.height = 36;
        this.x = theCanvas.width/2 - this.width/2;
        
        this.text = '';

        this.setText(text);
        
        this.click = null;
    }
    Button.prototype.setText = function(text) {
        this.text = text;
    }
    Button.prototype.render = function() {
        context.save();
        if (LANG == "cs") {
            context.scale(1.2, 1);
        }
        context.drawImage(imagesContainer["button"], 0, this.y, this.width, this.height);
        context.restore();
        context.fillText(this.text, 15, this.y+9);
    }

    /**
     * @class Map selection button
     */
    var MapButton = function(name, id) {
        this.name = name;

        this.width = 160;
        this.height = 106;

        var xMultiplier = (id % 2);
        var yMultiplier = Math.floor(id/2);

        this.x = xMultiplier * this.width + xMultiplier * 40;
        this.y = yMultiplier * this.height + yMultiplier * 40;

        this.click = null;
        this.hover = 0;
    };
    MapButton.prototype.render = function() {
        context.drawImage(imagesContainer[this.name], this.width*this.hover, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    }
    MapButton.prototype.mouseOver = function() {
        this.hover = 1;
    }
    MapButton.prototype.mouseOut = function() {
        this.hover = 0;
    }
    
    /**
     * @class Level timer
     */
    var LevelTimer = function(levelMaxTime) {
        this.levelTime = levelMaxTime;
        this.lastTime = null;
        
        this.callbackInterval = 10;
        this.callbackTimer = 1;
        
        this.callbackFunction = null;
        this.callbackEndGameFunction = null;
    };
    LevelTimer.prototype.run = function() {
        var dateTemp = new Date();
        this.lastTime = dateTemp.getTime();
        delete dateTemp;
    }
    LevelTimer.prototype.check = function() {
        var dateTemp = new Date();

        if (dateTemp.getTime() >= this.lastTime + 1000) {
            this.lastTime = dateTemp.getTime();
            if (this.callbackInterval == this.callbackTimer) {
                this.callbackFunction();
                this.callbackTimer = 1;
            }
            
            if (this.levelTime == 0) {
            	this.callbackEndGameFunction();
            } else {
            	this.levelTime--;
            	this.callbackTimer++;	
            }
        }

        delete dateTemp;
    }
    LevelTimer.prototype.render = function() {
        var dateTemp = new Date(this.levelTime*1000);
        context.fillStyle = "#fff";
        context.font = "20px _sans";
        context.textBaseline = "top";
        context.fillText(dateTemp.getMinutes()+":"+formatSeconds(dateTemp.getSeconds().toString()), theCanvas.width/2, 10);
        delete dateTemp;
    }
    LevelTimer.prototype.setCallback = function(callbackObject, callbackMethod) {
        this.callbackFunction = function() {
            return callbackMethod.apply(callbackObject);
        }
    }
    LevelTimer.prototype.setEndGameCallback = function(callbackObject, callbackMethod) {
    	this.callbackEndGameFunction = function() {
            return callbackMethod.apply(callbackObject);
        }
    }
    
    function formatSeconds(seconds) {
        if (seconds.length == 1) {
            seconds = "0"+seconds;
        }
        return seconds;
    }
    
    /**
     * Random position generator
     */
    var RandomPositionGenerator = {
    	generate: function(width, height) {
	    	var set = false;
	        var object = null;
	        
	        while (!set) {
	            object = {
	                "x": Math.floor(Math.random() * (theCanvas.width - width)),
	                "y": Math.floor(Math.random() * (theCanvas.height - height)),
	                "width": width,
	                "height": height
	            }
	            
	            for (var i = 0, length = map.wallsUnder.length; i < length; i++) {
	                if (boundingBoxCollide(object, map.wallsUnder[i])) {
	                    set = false;
	                    break;
	                } else {
	                    set = true;
	                }
	            }
	            
	            if (set) {
		            for (var i = 0, length = playersContainer.length; i < length; i++) {
		            	if (boundingBoxCollide(object, playersContainer[i])) {
		                    set = false;
		                    break;
		                } else {
		                    set = true;
		                }
		            }
	            }
	        }
	        
	        return object;
	    }
    };

    // APPLICATION CODE
 
    // set constants and variables
    
    const LEVEL_MAX_TIME = 210; // level max time in seconds
    
    // frame per second
    const FRAME_RATE = 33;
    var intervalTime = 1000/FRAME_RATE;
    var frameRateCounter = new FrameRateCounter();
    
    // game state
    var currentGameState = 0;
    var currentGameStateFunction = null;

    switchGameState(GAME_STATE_TITLE);
    
    // buttons
    var buttonsContainer = [];

    // maps buttons
    var mapButtonsContainer = [];
    
    // canvas axis
    var x = 0, y = 0,
    keyPressList = [];
    
    // set map
    var mapName = "";
        map = null;

    // player
    var playersCount = 2; // @TODO
    var playersContainer = [];
    
    // objects container
    var objectsContainer = [];
    
    // level timer
    var levelTimer = new LevelTimer(LEVEL_MAX_TIME);
    levelTimer.setCallback(this, handleSelectRandomObject);
    levelTimer.setEndGameCallback(this, handleEndGame);
    var playInterval = null;
	
    // preload images
    loadImages();
    
    runGame();

    // events
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);
    theCanvas.addEventListener("click", handleClick, false);
    theCanvas.addEventListener("mousemove", handleMouseMove, false);

    // methods
    
    function handleKeyDown(e) {
    	if (currentGameState == GAME_STATE_PLAY_LEVEL) {
	        e = e ? e : window.event;
	        var keyCodeIndex = -1;
	        var player = null;
	        for (var i = 0; i < playersCount; i++) {
	        	player = playersContainer[i];
	            if (player && player instanceof MascotPlayer) {
	                keyCodeIndex = player.keyCodes.indexOf(e.keyCode);
	                if (keyCodeIndex > -1) {
	                    if (keyCodeIndex < 4) {
	                        keyPressList[e.keyCode] = true;
	                    } else {
	                        if (keyPressList[e.keyCode] == undefined) {
	                            keyPressList[e.keyCode] = 1;
	                        } else {
	                            keyPressList[e.keyCode] += 1;
	                        }
	                    }
	                }
	            }
	        }
	    }
    }
    
    function handleKeyUp(e) {
		if (currentGameState == GAME_STATE_PLAY_LEVEL) {
	        e = e ? e : window.event;
	        var keyCodeIndex = -1;
	        var player = null;
	        for (var i = 0; i < playersCount; i++) {
	        	player = playersContainer[i];
	            if (player.keyCodes && player instanceof MascotPlayer) {
	                keyCodeIndex = player.keyCodes.indexOf(e.keyCode);
	                if (keyCodeIndex > -1) {
	                    if (keyCodeIndex < 4) {
	                        keyPressList[e.keyCode] = false;
	                        playersContainer[i].walking = false;
	                    }
	                }
	            }
	        }
       	}
    }
    
    function handleClick(e) {
		mouseX = e.clientX-theCanvas.offsetLeft;
		mouseY = e.clientY-theCanvas.offsetTop;
		
        switch (currentGameState) {
            case GAME_STATE_TITLE:
                mouseY -= 100;
                var row = Math.floor(mouseY/50);
                var button = buttonsContainer[row];
                if (button instanceof Button) {
                    button.click();
                }
                break;
            case GAME_STATE_MAP_SELECTION:
                mouseY -= theCanvas.height/2 - 73*Math.ceil(mapButtonsContainer.length/2);
                mouseX -= theCanvas.width/2 - 180;
                var row = Math.floor(mouseY/146);
                if (row > 0) {
                    row += 1;
                }
                var coll = Math.floor(mouseX/200);
                if (coll < 2) {
                    var mapButton = mapButtonsContainer[row+coll];
                    if (mapButton instanceof MapButton) {
                        mapName = mapButton.name;
                        mapButton.click();
                    }
                }
                break;
            case GAME_STATE_CONTROLS:
            	switchGameState(GAME_STATE_TITLE);
        		runGame();
        		break;
        	case GAME_STATE_GAME_OVER:
        		window.location = "";
        		break;
        }
	}

    function handleMouseMove(e) {
		mouseX = e.clientX-theCanvas.offsetLeft;
		mouseY = e.clientY-theCanvas.offsetTop;
		
        if (currentGameState == GAME_STATE_MAP_SELECTION) {
            // remove hover from actual map
            var length = mapButtonsContainer.length;
            for (var i = 0; i < length; i++) {
                mapButtonsContainer[i].mouseOut();
            }
            
            length /= 2;
            mouseY -= theCanvas.height/2 - 73*Math.ceil(length);
            mouseX -= theCanvas.width/2 - 180;
            var row = Math.floor(mouseY/146);
            if (row > 0) {
                row += 1;
            }
            var coll = Math.floor(mouseX/200);
            if (coll > -1 && coll < 2 && row <= length) {
                var mapButton = mapButtonsContainer[row+coll];
                if (mapButton instanceof MapButton) {
                    mapButton.mouseOver();
                    gameStateMapSelectionRender();
                }
            }
        }
	}
    
    function runGame() {
        currentGameStateFunction();
    }

    function switchGameState(newState) {
        currentGameState = newState;
        switch (currentGameState) {
            case GAME_STATE_TITLE:
                currentGameStateFunction = gameStateTitle;
                break;
            case GAME_STATE_MAP_SELECTION:
                currentGameStateFunction = gameStateMapSelection;
                break;
            case GAME_STATE_PLAY_LEVEL:
                currentGameStateFunction = gameStatePlayLevel;
                break;
            case GAME_STATE_GAME_OVER:
                currentGameStateFunction = gameStateGameOver;
                break;
            case GAME_STATE_CONTROLS:
            	currentGameStateFunction = gameStateControls;
                break;
        }
    }
    
    function renderBackground() {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, theCanvas.width, theCanvas.height);
        context.drawImage(imagesContainer["background"], 0, 300, 400, 300);
        
        context.strokeStyle = "#000";
        context.strokeRect(0, 0, theCanvas.width, theCanvas.height);
    }
    
    function gameStateTitle() {
        // create buttons
        var button = new Button(0, dictionary["SINGLE_PLAYER"]);
        button.click = handleSinglePlayer;
        buttonsContainer.push(button);
        button = new Button(1, dictionary["MULTI_PLAYER"]);
        button.click = handleMultiPlayer;
        buttonsContainer.push(button);
        button = new Button(2, dictionary["CONTROLS"]);
        button.click = handleControls;
        buttonsContainer.push(button);
        
        x = theCanvas.width/2 - 70;
        
        // render background
        renderBackground();
        
        context.fillStyle = "#000";
        context.font = "20px _sans";
        context.textBaseline = "top";
        context.fillText("MascotsFight", x+10, 20);
        
        // render buttons
        context.save();
        
        context.translate(x, 100);
        
        context.fillStyle = "#fff";
        context.font = "17px _sans";
        context.textBaseline = "top";
        
        for (var i = 0, length = buttonsContainer.length; i < length; i++) {
            buttonsContainer[i].render();
        }

        context.restore();
    }
    
    function handleSinglePlayer() {
        alert("Připravuje se");
        //@TODO
    }
    
    function handleMultiPlayer() {
        switchGameState(GAME_STATE_MAP_SELECTION);
        runGame();
    }
    
    function handleControls() {
    	switchGameState(GAME_STATE_CONTROLS);
        runGame();
    }
    
    function handleEndGame() {
    	switchGameState(GAME_STATE_GAME_OVER);
        runGame();
	}
    
    function gameStateGameOver() {
    	clearInterval(playInterval);
    	
    	// render background
        renderBackground();
        
        context.fillStyle = "#000";
	    context.font = "20px _sans";
	    context.textBaseline = "top";
	    
	    context.fillText(dictionary["SCORE"]+":", x, 30);
        
        // draw tux
        var player = null;
        var xTemp = 0;
        for (var i = 0; i < playersCount; i++) {
            player = playersContainer[i];
            
            xTemp = 400*i+30;
            
            // render score
            context.fillText(dictionary["PLAYER"]+" "+(i+1), xTemp, 100);
            
            context.fillText(dictionary["KILL"], xTemp, 140);
            context.fillText(player.score.kill, xTemp+60, 140);
            context.fillText(dictionary["DEATH"], xTemp, 170);
            context.fillText(player.score.killed, xTemp+60, 170);
        }
        
        context.fillText(dictionary["NEW_GAME"], 360, 500);
    }
    
    function gameStateControls() {
    	// render background
        renderBackground();
        
        context.fillStyle = "#000";
        context.font = "20px _sans";
        context.textBaseline = "top";
        context.fillText("MascotsFight", x+10, 20);
        
        context.fillText(dictionary["PLAYER"]+" 1", 30, 60);
        context.fillText(dictionary["PLAYER"]+" 2", 430, 60);
        
        context.fillText(dictionary["BACK"], 360, 500);
        
        context.font = "15px _sans";
        
        // player one
        context.fillText(dictionary["KEY_UP"], 30, 90);
        context.fillText(dictionary["KEY_LEFT"], 30, 120);
        context.fillText(dictionary["KEY_DOWN"], 30, 150);
        context.fillText(dictionary["KEY_RIGHT"], 30, 180);
        context.fillText(dictionary["KEY_FIRE"], 30, 210);
        
        context.fillText(dictionary["KEY_UP"], 160, 90);
        context.fillText(dictionary["KEY_LEFT"], 160, 120);
        context.fillText(dictionary["KEY_DOWN"], 160, 150);
        context.fillText(dictionary["KEY_RIGHT"], 160, 180);
        context.fillText("N", 160, 210);
        
        // player two
        context.fillText(dictionary["KEY_UP"], 430, 90);
        context.fillText(dictionary["KEY_LEFT"], 430, 120);
        context.fillText(dictionary["KEY_DOWN"], 430, 150);
        context.fillText(dictionary["KEY_RIGHT"], 430, 180);
        context.fillText(dictionary["KEY_FIRE"], 430, 210);
        
        context.fillText("W", 560, 90);
        context.fillText("A", 560, 120);
        context.fillText("S", 560, 150);
        context.fillText("D", 560, 180);
        context.fillText("F", 560, 210);
    }
 
    function gameStateMapSelection() { 
        var maps = ["construction_site", "for_a_good_night", "in_a_captivity_of_8-bit", "night_workshift"];
        var mapButton = null;

        for (var i = 0, length = maps.length; i < length; i++) {
            mapButton = new MapButton(maps[i], i);
            mapButton.click = handlePlayGame;
            mapButtonsContainer.push(mapButton);
        }
        
        gameStateMapSelectionRender();
    }
    
    function gameStateMapSelectionRender() {
        var x = theCanvas.width/2 - 180;
        var y = theCanvas.height/2 - 73*Math.ceil(mapButtonsContainer.length/2);

        // render background
        renderBackground();

        // render buttons
        context.save();

        context.translate(x, y);
        
        for (var i = 0, length = mapButtonsContainer.length; i < length; i++) {
            mapButtonsContainer[i].render();
        }

        context.restore();
    }

    function handlePlayGame() {
        // load map
        loadMap();

        // create players 
        for (var i = 0; i < playersCount; i++) {
            playersContainer.push(new MascotPlayer(KEY_CODES[i]));
            playersContainer[i].setGun(new Gun());
        }

        // run game
        switchGameState(GAME_STATE_PLAY_LEVEL);
        
        levelTimer.run();
        
        runGame();
    }
    
    function handleSelectRandomObject() {
    	var randomObjectsContainer = ["Gun", "TommyGun", "ScatterGun"];
    	var index = Math.floor(Math.random() * randomObjectsContainer.length);
    	var current = randomObjectsContainer[index];
    	var gun = null;
    	switch (current) {
    		case "Gun":
    			gun = new Gun();
    			break;
    		case "ScatterGun":
    			gun = new ScatterGun();
    			break;
    		case "TommyGun":
    			gun = new TommyGun();
    			break;
    	}
        gun.randomPosition();
        objectsContainer.push(gun);
    }
    
    function gameStatePlayLevel() {
        // run
        playInterval = setInterval(update, intervalTime);
    }
    
    function update() {
    	if (levelTimer.levelTime == 0) {
    		handleEndGame();
    	} else {
	    	// count frames
	        frameRateCounter.countFrames();
	
	        // handle key press
	        handleKeyPressedList();
	
	        // update current state
	        resolveConflict();
	        
	        // level timer
	        levelTimer.check();
	
	        // render scene
	        render();
	      }
    }

    function handleKeyPressedList() {
        for (var i = 0; i < playersCount; i++) {
        	if (playersContainer[i] instanceof MascotPlayer) {
            	playersContainer[i].handleKeyPressedList();
			}
        }
    }
    
    /**
     * Bounding box collide
     */
    function boundingBoxCollide(object1, object2) {
        if (object1 && object2) {
            var left1 = object1.x;
            var left2 = object2.x;
            var right1 = object1.x + object1.width;
            var right2 = object2.x + object2.width;
            var top1 = object1.y;
            var top2 = object2.y;
            var bottom1 = object1.y + object1.height;
            var bottom2 = object2.y + object2.height;

            if (bottom1 < top2) return false;
            if (top1 > bottom2) return false;

            if (right1 < left2) return false;
            if (left1 > right2) return false;

            return true;
        }
    };

    /**
     * Conflict resolver
     */
    function resolveConflict() {
        var player = null;
        
        for (var i = 0; i < playersCount; i++) {
            player = playersContainer[i];
            
            if (player.isAlive()) {
            
                player.move();

                // wall
                if (player.x <= 0 || player.x + player.width >= theCanvas.width
                    || player.y <= 0 || player.y + player.height >= theCanvas.height) {
                    player.distance();
                }

                // objects
                var wall = null;
                for (var j = 0, length = map.wallsUnder.length; j < length; j++) {
                    wall = map.wallsUnder[j];
                    if (boundingBoxCollide(player, wall)) {
                    	if (player instanceof MascotEnemy) {
                    		player.distance(wall);
                    	} else {
                        	player.distance();
                        }
                    } 
                }
                
                // guns
                var gun = null;
                var gunIndex = -1;
                for (var j = 0, length = objectsContainer.length; j < length; j++) {
                    gun = objectsContainer[j];
                    if (boundingBoxCollide(player, gun)) {
                    	gunIndex = objectsContainer.indexOf(gun);
                    	objectsContainer.splice(gunIndex, 1);
                        player.setGun(gun);
                    } 
                }

                // players
                var enemy = null;
                for (var j = 0; j < playersCount; j++) {
                    enemy = playersContainer[j];
                    if (enemy != player) {
                        if (boundingBoxCollide(player, enemy)) {
                            player.distance();
                        }
                        // enemy projectils
                        for (var k = 0, length = enemy.gun.projectilesContainer.length; k < length; k++) {
                            if (boundingBoxCollide(player, enemy.gun.projectilesContainer[k])) {
                                enemy.score.kill++;
                                enemy.gun.removeProjectile(enemy.gun.projectilesContainer[k]);
                                player.dead();
                            }
                        }
                    }
                }

                // projectiles
                var projectile = null;
                for (var j = 0, length = player.gun.projectilesContainer.length; j < length; j++) {
                    projectile = player.gun.projectilesContainer[j];
                    for (var k = 0, lengthK = map.wallsUnder.length; k < lengthK; k++) {
                        if (boundingBoxCollide(projectile, map.wallsUnder[k])) {
                            player.gun.removeProjectile(projectile);
                        } 
                    }
                }

                player.reset();
            }
        }
    }
    
    /**
     * Render scene
     */
    function render() {
        // background
        map.renderUnder();

        // frame rate
        context.fillStyle = "#fff";
        context.font = "20px _sans";
        context.textBaseline = "top";
        context.fillText("FPS: "+frameRateCounter.lastFrameCount, 10, 5);
        
        // level timer
        levelTimer.render();

        // draw tux
        var player = null;
        for (var i = 0; i < playersCount; i++) {
            player = playersContainer[i];
            player.render();
            
            // render projectiles
            for (var j = 0, length = player.gun.projectilesContainer.length; j < length; j++) {
                player.gun.projectilesContainer[j].render();
            }
            
            const fromX = 200;
            
            // render score
            context.fillStyle = "#fff";
            context.font = "20px _sans";
            context.textBaseline = "top";
            
            context.fillText(dictionary["SCORE"]+":", fromX*i + 20, theCanvas.height - 30);
            
            context.drawImage(imagesContainer["simpleright"], fromX*i+70, theCanvas.height - 30, 50, 14);
            context.fillText(player.score.kill, fromX*i+115, theCanvas.height - 30);
            
            context.drawImage(imagesContainer["cross"], fromX*i+140, theCanvas.height - 44, 30, 40);
            context.fillText(player.score.killed, fromX*i+180, theCanvas.height - 30);
        }
        
        for (var i = 0, length = objectsContainer.length; i < length; i++) {
            objectsContainer[i].render();
        }
        
        // object over tux
        map.renderAbove();
    }

    /**
     * Preload images
     */
    function loadImages() {
        var image = null;
        for (var i = 0, length = preloadImages.length; i < length; i++) {
            image = preloadImages[i];
            imagesContainer[image.name] = new Image();
            imagesContainer[image.name].src = "images/"+image.image;
        }
    }
    
    /**
     * Preload sounds
     */
    loadSounds();
    function loadSounds() {
    	var sound = null;
    	for (var i = 0, length = preloadSounds.length; i < length; i++) {
    		sound = preloadSounds[i];
    		soundsContainer[sound.name] = document.createElement("audio");
    		document.body.appendChild(soundsContainer[sound.name]);
			soundsContainer[sound.name].setAttribute("src", "sound/"+sound.sound);
    	}
    }
    
    function loadMap() {
        map = new Map(mapName);
        map.load(maps[mapName]);
    }
   
    //runGame();
}
    