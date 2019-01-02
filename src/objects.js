function Camera(fieldObject)
{
    this.blockSize = fieldObject.blockSize;
    this.positionPixelX;
    this.positionPixelY;
    
    this.previousIndexX = 0;
    this.previousIndexY = 0;

    this.inventory = [];
    
    this.setIndexX = function(x) { this.positionPixelX = x * this.blockSize - (this.blockSize / 2); };
    this.setIndexY = function(y) { this.positionPixelY = y * this.blockSize - (this.blockSize / 2); };
    //this.getIndexX = function() { return Math.ceil(this.positionPixelX / this.blockSize); };
    //this.getIndexY = function() { return Math.ceil(this.positionPixelY / this.blockSize); };
    this.getIndexX = function() { var indexX = this.positionPixelX >> 6; return indexX | indexX; };
    this.getIndexY = function() { var indexY = this.positionPixelY >> 6; return indexY | indexY; };
    
    this.setPixelX = function(x) { this.positionPixelX = x; }; 
    this.setPixelY = function(y) { this.positionPixelY = y; };
    this.getPixelX = function() { return this.positionPixelX; };
    this.getPixelY = function() { return this.positionPixelY; };
    
    this.rotationRadians;
    this.eyeHeight;
    this.eyeHeightOffset;

    this.moveUpDown = "";
    this.moveLeftRight = "";
    
    this.acceleration = 0.1;
    this.deceleration = 0.2;
    this.maxVelocity = 1;
    
    this.moveVelocity = 0;
    this.turnVelocity = 0;
    this.verticalVelocity = 0;
    
    this.jumping = false;

    this.metadata = {};

    this.moveCamera = function(fieldObject)
    {
        switch (this.moveUpDown) {
            case 'up':
                this.moveForward();
                break;
            case 'down':
                this.moveBackward();
                break;
            default:
            	this.stopMoving();
            	break;
        }
        switch (this.moveLeftRight) {
            case 'left':
                this.turnLeft();
                break;
            case 'right':
                this.turnRight();
                break;
            default:
            	this.stopTurning();
            	break;
        }
        
        var newPixelX = this.positionPixelX + (this.moveVelocity * Math.cos(this.rotationRadians) * 10);
        var newPixelY = this.positionPixelY + (this.moveVelocity * Math.sin(this.rotationRadians) * 10);

        var wallHeight = fieldObject.getWallHeight(this, newPixelX, newPixelY);
        var heightDifference = (wallHeight+this.eyeHeightOffset) - this.eyeHeight;

        this.gravity(newPixelX, newPixelY, wallHeight, heightDifference);
        this.move(newPixelX, newPixelY, wallHeight, heightDifference);
        this.showMapLocation();
    };

    this.moveForward = function()
    {
    	/*
        var newPixelX = this.positionPixelX + Math.cos(this.rotationRadians) * 10;
        var newPixelY = this.positionPixelY + Math.sin(this.rotationRadians) * 10;
        //if (fieldObject.isNotHit(this, newPixelX, newPixelY)) {
        
        var wallHeight = fieldObject.getWallHeight(this, newPixelX, newPixelY);
        var heightDifference = wallHeight - (this.eyeHeight-this.eyeHeightOffset);
        if (heightDifference < 0.2) {
            this.positionPixelX = newPixelX;
            this.positionPixelY = newPixelY;
            this.eyeHeight = wallHeight + this.eyeHeightOffset;
        }*/
        if (this.moveVelocity < this.maxVelocity && !this.jumping) {
       		this.moveVelocity += this.acceleration;
        }
    };

    this.moveBackward = function()
    {
    	/*
        var newPixelX = this.positionPixelX - Math.cos(this.rotationRadians) * 10;
        var newPixelY = this.positionPixelY - Math.sin(this.rotationRadians) * 10;
        //if (fieldObject.isNotHit(this, newPixelX, newPixelY)) {

        var wallHeight = fieldObject.getWallHeight(this, newPixelX, newPixelY);
        var heightDifference = wallHeight - (this.eyeHeight-this.eyeHeightOffset);
        if (Math.abs(heightDifference) < 0.2) {
            this.positionPixelX = newPixelX;
            this.positionPixelY = newPixelY;
            this.eyeHeight = wallHeight + this.eyeHeightOffset;
        }
        */
        if (this.moveVelocity > -1 * this.maxVelocity) {
       		this.moveVelocity -= this.acceleration;
        }
    };
    
    this.stopMoving = function()
    {
    	if (Math.abs(this.moveVelocity) < this.deceleration) {
    		this.moveVelocity = 0;
    	} else if (this.moveVelocity > 0) {
    		this.moveVelocity -= (this.deceleration / 2);
    	} else if (this.moveVelocity < 0) {
    		this.moveVelocity += (this.deceleration / 2);    		
    	}
    };

    this.turnLeft = function()
    {
        //this.rotationRadians -= 0.17;
        if (this.turnVelocity > (-1 * this.maxVelocity)) {
        	this.turnVelocity -= this.acceleration;
        }
    };

    this.turnRight = function()
    {
        //this.rotationRadians += 0.17;
        if (this.turnVelocity < this.maxVelocity) {
        	this.turnVelocity += this.acceleration;
        }
    };
    
    this.stopTurning = function()
    {
    	if (Math.abs(this.turnVelocity) < this.deceleration) {
    		this.turnVelocity = 0;
    	} else if (this.turnVelocity > 0) {
    		this.turnVelocity -= this.deceleration;
    	} else if (this.turnVelocity < 0) {
    		this.turnVelocity += this.deceleration;
    	}
    };
    
    this.move = function(newPixelX, newPixelY, wallHeight, heightDifference) {
    	//if (this.moveVelocity !== 0) {
	        //var newPixelX = this.positionPixelX + (this.moveVelocity * Math.cos(this.rotationRadians) * 10);
	        //var newPixelY = this.positionPixelY + (this.moveVelocity * Math.sin(this.rotationRadians) * 10);
	        //if (fieldObject.isNotHit(this, newPixelX, newPixelY)) {
	
	        //var wallHeight = fieldObject.getWallHeight(this, newPixelX, newPixelY);
	        //var heightDifference = wallHeight - (this.eyeHeight-this.eyeHeightOffset);
	        //console.log(heightDifference);
	        if (heightDifference < 0.2) {
	            this.positionPixelX = newPixelX;
	            this.positionPixelY = newPixelY;
	            
	            if (heightDifference > 0) {
            		this.eyeHeight = wallHeight + this.eyeHeightOffset;
            	}
	    	}
	    //}
	    
	    if (this.turnVelocity !== 0) {
	    	this.rotationRadians += this.turnVelocity * 0.17;
	    }
	    
	    if (this.verticalVelocity !== 0) {
	    	if (heightDifference <= -0.2 && this.verticalVelocity < 0 && ! this.jumping) {
	    		this.verticalVelocity = 0.4;
	    		this.moveVelocity = 1.2;
	    		this.jumping = true;
	    	}
	    	
	    	this.eyeHeight += this.verticalVelocity;
			if (this.eyeHeight-this.eyeHeightOffset < wallHeight) {
	            this.eyeHeight = wallHeight + this.eyeHeightOffset;
	            this.verticalVelocity = 0;
	            this.jumping = false;
	            
	            if (this.moveVelocity > this.maxVelocity) {
	            	this.moveVelocity = 0.2;
	            }
			}
	    }
    };
    
    this.gravity = function(newPixelX, newPixelY, wallHeight, heightDifference) {
        //var wallHeight = fieldObject.getWallHeight(this, newPixelX, newPixelY);
        //var heightDifference = wallHeight - (this.eyeHeight-this.eyeHeightOffset);
        //var absHeightDifference = Math.abs(heightDifference);
        if (heightDifference < 0) {
        //	this.verticalVelocity = -1 * absHeightDifference;
        //if (heightDifference < 0) {
        	//console.log('falling');
            this.verticalVelocity -= this.acceleration;
		}
		/*
		if (this.eyeHeight-this.eyeHeightOffset < wallHeight) {
			//console.log('getting up');
            this.eyeHeight = wallHeight + this.eyeHeightOffset;
            this.verticalVelocity = 0;
		}
		*/
    }
    
    this.showMapLocation = function() {
    	var x = this.getIndexX() + 1;
    	var y = this.getIndexY() + 1;
    	if (x !== this.previousIndexX || y !== this.previousIndexY) {
    		$('#square-'+this.previousIndexX+'-'+this.previousIndexY).css('border', '1px solid #000');
    		$('#square-'+x+'-'+y).css('border', '1px solid #F00');
    		this.previousIndexX = x;
    		this.previousIndexY = y;
    		//console.log('done!');
    	}
    }
}

function Field()
{
    this.fieldMap;
    this.fieldDetails;
    this.blockSize;
    this.getPosition = function(xPixel, yPixel) {
        var xIndex = Math.ceil(xPixel / this.blockSize);
        var yIndex = Math.ceil(yPixel / this.blockSize);
        if (yIndex > this.fieldMap.length-1 || yIndex < 0 || xIndex > this.fieldMap[0].length-1 || xIndex < 0) {
            return 1;
        } else {
            return this.fieldMap[ yIndex ][ xIndex ];
        }
    };

    this.isNotHit = function(cameraObject, xPixel, yPixel)
    {
        var wall = this.getPosition(xPixel, yPixel);
        var requirement = this.fieldDetails[wall]['requiresKeyId'];

        if (requirement != undefined) {
            var found = false;
            for (var inventoryIndex in cameraObject.inventory) {
                if (cameraObject.inventory[inventoryIndex] == requirement) {
                    found = true;
                    break;
                }
            }

            if (found) {
                var xIndex = Math.ceil(xPixel / this.blockSize);
                var yIndex = Math.ceil(yPixel / this.blockSize);
                this.fieldMap[ yIndex ][ xIndex ] = 0;

                return true;
            }
        } else if ( wall == 0) {
            return true;
        }

        return false;
    }
    
    this.getWallHeight = function(cameraObject, xPixel, yPixel)
    {
        var wall = this.getPosition(xPixel, yPixel);
        
        return this.fieldDetails[wall]['height'];    	
    }
}

function Light(fieldObject)
{
    this.blockSize = fieldObject.blockSize;
    this.positionPixelX;
    this.positionPixelY;
    
    this.movements = [];
    this.movementIndex = 0;
    
    this.intensity = 1.25;
    this.color = undefined;
    this.range = 600;
    
    this.setIndexX = function(x) { this.positionPixelX = x * this.blockSize - (this.blockSize / 2); };
    this.setIndexY = function(y) { this.positionPixelY = y * this.blockSize - (this.blockSize / 2); };
    this.getIndexX = function() { return Math.ceil(this.positionPixelX / this.blockSize); };
    this.getIndexY = function() { return Math.ceil(this.positionPixelY / this.blockSize); };
    
    this.setPixelX = function(x) { this.positionPixelX = x; }; 
    this.setPixelY = function(y) { this.positionPixelY = y; };
    this.getPixelX = function() { return this.positionPixelX; };
    this.getPixelY = function() { return this.positionPixelY; };

    this.addWaypoint = function(x, y) { this.movements.push([x * this.blockSize - (this.blockSize / 2), y * this.blockSize - (this.blockSize / 2)]); };

    
    this.move = function() {
    	if (this.movements.length > 0) {
    		//console.log('moving');
			if (this.movementIndex === this.movements.length) {
				this.movementIndex = 0;
			}
    		var destinationX = this.movements[this.movementIndex][0];
    		var destinationY = this.movements[this.movementIndex][1];

    		if (Math.abs(destinationX - this.positionPixelX) < 4 && Math.abs(destinationY - this.positionPixelY) < 4) {
    			//console.log('reached!');
    			this.movementIndex += 1;
    		}

    		
    		if (destinationX > this.positionPixelX) {
    			this.positionPixelX += 4;
    		} else if (destinationX < this.positionPixelX) {
    			this.positionPixelX -= 4;
    		}
    		
    		if (destinationY > this.positionPixelY) {
    			this.positionPixelY += 4;
    		} else if (destinationY < this.positionPixelY) {
    			this.positionPixelY -= 4;
    		}
    	}
    };
}

function Sprite(fieldObject)
{
    this.blockSize = fieldObject.blockSize;
    this.positionPixelX;
    this.positionPixelY;
    this.image;
    this.type;
    this.metadata;
    
    this.setIndexX = function(x) { this.positionPixelX = x * this.blockSize - (this.blockSize / 2); };
    this.setIndexY = function(y) { this.positionPixelY = y * this.blockSize - (this.blockSize / 2); };
    this.getIndexX = function() { return Math.ceil(this.positionPixelX / this.blockSize); };
    this.getIndexY = function() { return Math.ceil(this.positionPixelY / this.blockSize); };
    
    this.setPixelX = function(x) { this.positionPixelX = x; }; 
    this.setPixelY = function(y) { this.positionPixelY = y; };
    this.getPixelX = function() { return this.positionPixelX; };
    this.getPixelY = function() { return this.positionPixelY; };

    this.activate = function(viewContext, cameraObject, drawObject, raycasterObject, fieldObject)
    {
    }
}

function ItemSprite(fieldObject)
{
    this.blockSize = fieldObject.blockSize;
    this.positionPixelX;
    this.positionPixelY;
    this.image;
    this.inventoryImage;
    this.type;
    this.metadata = {};
    
    this.setIndexX = function(x) { this.positionPixelX = x * this.blockSize - (this.blockSize / 2); };
    this.setIndexY = function(y) { this.positionPixelY = y * this.blockSize - (this.blockSize / 2); };
    this.getIndexX = function() { return Math.ceil(this.positionPixelX / this.blockSize); };
    this.getIndexY = function() { return Math.ceil(this.positionPixelY / this.blockSize); };
    
    this.setPixelX = function(x) { this.positionPixelX = x; }; 
    this.setPixelY = function(y) { this.positionPixelY = y; };
    this.getPixelX = function() { return this.positionPixelX; };
    this.getPixelY = function() { return this.positionPixelY; };

    this.activate = function(viewContext, cameraObject, drawObject, raycasterObject, fieldObject)
    {
        if (this.metadata["pickedUp"] == false) {
            x = this.getPixelX();
            y = this.getPixelY();
            range = this.metadata["range"];
            distance = drawObject.getDistance(x, y, cameraObject.getPixelX(), cameraObject.getPixelY());
            if (distance < range) {
                if (this.metadata['health'] != undefined) {
                    cameraObject.metadata["health"] += this.metadata["health"];
                } else if (this.metadata['keyId'] != undefined) {
                    cameraObject.inventory.push(this.metadata["keyId"]);
                }
                this.metadata["pickedUp"] = true;
                this.inventoryImage = this.image;
                this.image = null;

                var objectiveNumber = this.metadata['objectiveNumber'];
                if (objectiveNumber != undefined && drawObject.objectiveNumber+1 == objectiveNumber) {
                    drawObject.objectiveNumber = objectiveNumber;
                }

                drawObject.flash = "rgba(0,255,0, 0.5)";
            }
        }
    }
}

function EnemySprite(fieldObject)
{
    this.blockSize = fieldObject.blockSize;
    this.positionPixelX;
    this.positionPixelY;
    this.image;
    this.type;
    this.metadata;
    
    this.setIndexX = function(x) { this.positionPixelX = x * this.blockSize - (this.blockSize / 2); };
    this.setIndexY = function(y) { this.positionPixelY = y * this.blockSize - (this.blockSize / 2); };
    this.getIndexX = function() { return Math.ceil(this.positionPixelX / this.blockSize); };
    this.getIndexY = function() { return Math.ceil(this.positionPixelY / this.blockSize); };
    
    this.setPixelX = function(x) { this.positionPixelX = x; }; 
    this.setPixelY = function(y) { this.positionPixelY = y; };
    this.getPixelX = function() { return this.positionPixelX; };
    this.getPixelY = function() { return this.positionPixelY; };

    this.activate = function(viewContext, cameraObject, drawObject, raycasterObject, fieldObject)
    {
        var health = this.metadata["health"];
        if (health > 0) {
            var x = this.getPixelX();
            var y = this.getPixelY();
            var enemyDistance = drawObject.getDistance(x, y, cameraObject.getPixelX(), cameraObject.getPixelY());
            if (enemyDistance < this.metadata["activationRange"]) {
                var angle = drawObject.objectAngle(cameraObject, x, y);
                var actionChance = Math.random();
                if (actionChance < this.metadata["shootChance"]) {
                    var wallDistance = raycasterObject.castRay2(cameraObject, fieldObject, angle);
                    if (enemyDistance < wallDistance[0][1]['realDistance']) {
                        cameraObject.metadata["health"] -= this.metadata["shotDamage"];
                        drawObject.flash = "rgba(255,0,0,0.5)";
                        $('enemy-attack').play();
                    }
                } else {
                    var speed = this.metadata["speed"];
                    var x = this.getPixelX();
                    var y = this.getPixelY();
                    this.move(fieldObject, angle, speed);
                }
            }
        }
    }
    
    this.move = function(fieldObject, rotation, distance)
    {
        rotation = rotation + Math.PI;
    
        if (rotation > 2*Math.PI) {
            rotation -= 2*Math.PI;
        }
        if (rotation < 0) {
            rotation += 2*Math.PI;
        }
        var newX = this.getPixelX() + Math.cos(rotation) * (distance);
        var newY = this.getPixelY() + Math.sin(rotation) * (distance);
        var newXoffset = this.getPixelX() + Math.cos(rotation) * (distance+30);
        var newYoffset = this.getPixelY() + Math.sin(rotation) * (distance+30);
        if (fieldObject.getPosition(newXoffset, newYoffset) == 0 /*&& !doorIsHit(newX, newY)*/) {
            this.setPixelX(newX);
            this.setPixelY(newY);
        }
    }
}

function PortalSprite(fieldObject)
{
    this.blockSize = fieldObject.blockSize;
    this.positionPixelX;
    this.positionPixelY;
    this.image;
    this.type;
    this.metadata;
    
    this.setIndexX = function(x) { this.positionPixelX = x * this.blockSize - (this.blockSize / 2); };
    this.setIndexY = function(y) { this.positionPixelY = y * this.blockSize - (this.blockSize / 2); };
    this.getIndexX = function() { return Math.ceil(this.positionPixelX / this.blockSize); };
    this.getIndexY = function() { return Math.ceil(this.positionPixelY / this.blockSize); };
    
    this.setPixelX = function(x) { this.positionPixelX = x; }; 
    this.setPixelY = function(y) { this.positionPixelY = y; };
    this.getPixelX = function() { return this.positionPixelX; };
    this.getPixelY = function() { return this.positionPixelY; };

    this.activate = function(viewContext, cameraObject, drawObject, raycasterObject, fieldObject)
    {
        var x = this.getPixelX();
        var y = this.getPixelY();
        var range = this.metadata["range"];
        var distance = drawObject.getDistance(x, y, cameraObject.getPixelX(), cameraObject.getPixelY());
        if (distance < range) {
            var toX = this.metadata["toX"];
            var toY = this.metadata["toY"];
            var toAngle = this.metadata["toAngle"];
            if (fieldObject.getPosition(toX, toY) == 0) {
                cameraObject.setPixelX(toX);
                cameraObject.setPixelY(toY);
                cameraObject.rotationRadians = toAngle;
                drawObject.flash = "rgba(0,0,0,1)";
                drawObject.flashDuration = 5;
            }
        }
    }
}

function NpcSprite(fieldObject)
{
    this.blockSize = fieldObject.blockSize;
    this.positionPixelX;
    this.positionPixelY;
    this.image;
    this.type;
    this.metadata;
    
    this.setIndexX = function(x) { this.positionPixelX = x * this.blockSize - (this.blockSize / 2); };
    this.setIndexY = function(y) { this.positionPixelY = y * this.blockSize - (this.blockSize / 2); };
    this.getIndexX = function() { return Math.ceil(this.positionPixelX / this.blockSize); };
    this.getIndexY = function() { return Math.ceil(this.positionPixelY / this.blockSize); };
    
    this.setPixelX = function(x) { this.positionPixelX = x; }; 
    this.setPixelY = function(y) { this.positionPixelY = y; };
    this.getPixelX = function() { return this.positionPixelX; };
    this.getPixelY = function() { return this.positionPixelY; };

    this.activate = function(viewContext, cameraObject, drawObject, raycasterObject, fieldObject)
    {
        var x = this.getPixelX();
        var y = this.getPixelY();
        var range = this.metadata["range"];
        var distance = drawObject.getDistance(x, y, cameraObject.getPixelX(), cameraObject.getPixelY());
        if (distance < range) {
            var message = this.metadata["message"];
            var color = this.metadata["color"];
            var backgroundColor = this.metadata["backgroundColor"];
            drawObject.drawText(viewContext, raycasterObject, message, color, backgroundColor);
        }
    }
}

function Game()
{
    this.minimapContext;
    this.viewContext;
    this.fieldObject;
    this.cameraObject;
    this.raycasterObject;
    this.drawObject;
    this.fullRadiansCycle = 2*Math.PI;

    this.cycle = function() {
    	//this.cameraObject.eyeHeight += 0.01;
    	//console.log(this.cameraObject.eyeHeight);
        //this.drawObject.lightArray[0].positionPixelY += 1;
        this.cameraObject.moveCamera(this.fieldObject);
        if (this.cameraObject.rotationRadians >= this.fullRadiansCycle) {
            this.cameraObject.rotationRadians -= this.fullRadiansCycle;
        } else if (this.cameraObject.rotationRadians < 0) {
            this.cameraObject.rotationRadians += this.fullRadiansCycle;
        }
        
        var i = 0;
        for (i = 0; i < this.drawObject.lightArray.length; i++) {
        	this.drawObject.lightArray[i].move();
        }
        
        
        var i = 0;
        for (i in this.fieldObject.fieldDetails) {
        	if (this.fieldObject.fieldDetails[i]['minHeight'] !== undefined && this.fieldObject.fieldDetails[i]['minHeight'] !== undefined) {
        		this.fieldObject.fieldDetails[i]['height'] += this.fieldObject.fieldDetails[i]['heightDirection'];
        	}
        	
        	if (this.fieldObject.fieldDetails[i]['height'] > this.fieldObject.fieldDetails[i]['maxHeight'] || this.fieldObject.fieldDetails[i]['height'] < this.fieldObject.fieldDetails[i]['minHeight']) {
        		this.fieldObject.fieldDetails[i]['heightDirection'] *= -1;
        	}
        }
        //this.drawObject.clearScreen(this.viewContext, this.raycasterObject.viewPixelWidth, this.raycasterObject.viewPixelHeight);
        var wallDistanceArray = this.raycasterObject.castRays(this.cameraObject, this.fieldObject);
        
        //console.log(wallDistanceArray[150].length);

        //this.drawObject.drawFloor(this.viewContext, this.raycasterObject.viewPixelWidth, this.raycasterObject.halfViewPixelHeight);
        //this.drawObject.drawSimpleLight(this.viewContext, this.cameraObject, this.raycasterObject, $('floor'));
        
        this.drawObject.drawWalls2(this.viewContext, this.fieldObject, wallDistanceArray, this.raycasterObject.viewPixelWidth, this.raycasterObject.viewPixelHeight, this.cameraObject);
       
        //this.drawObject.regenerateHealth(this.cameraObject);
        //this.drawObject.drawSprites(this.viewContext, this.cameraObject, this.raycasterObject, wallDistanceArray);
        //this.drawObject.activateSprites(this.viewContext, this.cameraObject, this.raycasterObject, this.fieldObject);
        //this.drawObject.activateFlash(this.viewContext, this.raycasterObject);
        //this.drawObject.drawInterface(this.viewContext, this.cameraObject, this.raycasterObject);
        //this.drawObject.drawMinimap(this.viewContext, this.minimapContext, this.fieldObject, this.cameraObject);
    };
}

