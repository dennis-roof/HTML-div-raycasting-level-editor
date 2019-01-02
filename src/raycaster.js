function Raycaster()
{
    this.viewPixelWidth;
    this.halfViewPixelWidth;
    this.viewPixelHeight;
    this.halfViewPixelHeight;
    this.sliceStep;
    this.fieldOfVisionRadians;
    this.halfFieldOfVisionRadians;
    this.playerDistance;
    this.angleStep;
    this.fullRadiansCycle;

    this.quadrant1 = 90 * Math.PI / 180;
    this.quadrant2 = 180 * Math.PI / 180;
    this.quadrant3 = 270 * Math.PI / 180;
    this.quadrant4 = 360 * Math.PI / 180;
    
    this.normalizeDistanceConstant = null;
    
    this.wallDistanceHeightLookup = [];

    this.init = function initializeConstants(fieldObject)
    {
        this.halfViewPixelWidth = this.viewPixelWidth / 2;
        this.halfViewPixelHeight = this.viewPixelHeight / 2;
        this.halfFieldOfVisionRadians = this.fieldOfVisionRadians / 2;
        this.playerDistance = (this.halfViewPixelWidth) / Math.tan(this.halfFieldOfVisionRadians);
        this.normalizeDistanceConstant = fieldObject.blockSize * this.playerDistance * 0.5; // divided in half, somehow looks better
        this.angleStep = (this.fieldOfVisionRadians / this.viewPixelWidth) * (1 << this.sliceStep);
        this.fullRadiansCycle = 2*Math.PI;
        
        var angleOffset = -(this.halfFieldOfVisionRadians);
		while (angleOffset < this.halfFieldOfVisionRadians) {
		  var row = [];
		  
		  var i = 0;
		  var prevH = 0;
		  for (c=0; c < 1000; c++) {
		    var d = this.fishEyesCorrection(angleOffset, c);
		    var h = this.normalizeDistance(d) >> 0;
		    
		    //var max = (c)*(c);
		    //var hSlope = (h - prevH) / (max-i);
		    //while (i<max) {
		    	row[c] = h;
		    	//row[i] = prevH;
		   	//	i += 1;
		   	//	prevH += hSlope;
		    //}
		  }
		  
	      this.wallDistanceHeightLookup[ ((angleOffset+this.halfFieldOfVisionRadians)*1000)>>0 ] = row;
		  angleOffset += this.angleStep;
		}
		
		//console.log(this.wallDistanceHeightLookup[0].length);
    }

    this.castRays = function(cameraObject, fieldObject)
    {
        var angleOffset = -(this.halfFieldOfVisionRadians);

        var wallDistanceArray = [];

        var count = 0;
        while (angleOffset < this.halfFieldOfVisionRadians) {
            var currentAngle = cameraObject.rotationRadians + angleOffset;
            var realAngle = (currentAngle + this.fullRadiansCycle) % this.fullRadiansCycle;

            var foundWalls = this.castRay3(cameraObject, fieldObject, realAngle);
            var correctedWalls = [];
            for (var wallIndex in foundWalls) {
                //var correctedDistance = this.fishEyesCorrection(angleOffset, foundWalls[wallIndex][0]);
                //var normalizedDistance = this.normalizeDistance(correctedDistance) >> 0;
                
                var a = ((angleOffset+this.halfFieldOfVisionRadians)*1000) >> 0;
				var d = (foundWalls[wallIndex][0]>this.wallDistanceHeightLookup[0].length ? this.wallDistanceHeightLookup[0].length-1 : foundWalls[wallIndex][0]);

				var normalizedDistance = this.wallDistanceHeightLookup[a][d];
				
				//console.log('index: ' + d + ' and wall height: ' + normalizedDistance);

                correctedWalls.push([normalizedDistance, foundWalls[wallIndex][1]]);
            }

            wallDistanceArray.push(correctedWalls);

            angleOffset += this.angleStep;
            count++;
        }


        return wallDistanceArray;
    };
    
    this.castRay = function(cameraObject, fieldObject, angle) {
        var x = cameraObject.getPixelX();
        var y = cameraObject.getPixelY();
	    
	    //var xStep = Math.cos(angle);
	    var xStep = this.getCosAngle(angle);
	    //var yStep = Math.sin(angle);
	    var yStep = this.getSinAngle(angle);
	    
        var wall = 0;
	    var distance = 0;
	    
	    hit = fieldObject.getPosition(x, y);
	    while (hit == 0) {
	        x = x + xStep;
	        y = y + yStep;
	        distance += 1;
	        hit = fieldObject.getPosition(x, y);
	    }
		
	    return [[distance, {'wall':hit, 'x':x>>0, 'y':y>>0, 'realDistance':distance}]];
	},
	
	this.cosAngleCache = {},
	this.getCosAngle = function(angle) {
		var cachedValue = this.cosAngleCache[angle];
		
		if (cachedValue === undefined) {
			cachedValue = Math.cos(angle);
			this.cosAngleCache[angle] = cachedValue;
		}
		
		return cachedValue;
	},

	this.sinAngleCache = {},
	this.getSinAngle = function(angle) {
		var cachedValue = this.sinAngleCache[angle];
		
		if (cachedValue === undefined) {
			cachedValue = Math.sin(angle);
			this.sinAngleCache[angle] = cachedValue;
		}
		
		return cachedValue;
	},

/*
    this.castRay2 = function(cameraObject, fieldObject, angle)
    {
        var x = cameraObject.getPixelX();
        var y = cameraObject.getPixelY();

        var wall = 0;
        var distance = 0;



        var angleTan = Math.tan(angle);
       

        var xOffsetLeft = (x % fieldObject.blockSize);
        var yOffsetDown = (y % fieldObject.blockSize);
        var xOffsetRight = fieldObject.blockSize - (x % fieldObject.blockSize);
        var yOffsetUp = fieldObject.blockSize - (y % fieldObject.blockSize);

        var up = (angle > 0 && angle < this.quadrant2);
        var right = (angle < this.quadrant1 || angle > this.quadrant3);

        var wallNumber1 = 0;
        var wallNumber2 = 0;
        var notDone = true;
        
        if (right) {
            var tempX1 = x + xOffsetRight+1;
            var tempY1 = y + ((xOffsetRight)*angleTan);
            var distance1 = Math.sqrt( Math.pow(xOffsetRight+1, 2) + Math.pow((xOffsetRight*angleTan), 2) );
        } else {
            var tempX1 = x - xOffsetLeft;
            var tempY1 = y - ((xOffsetLeft)*angleTan);
            var distance1 = Math.sqrt( Math.pow(xOffsetLeft, 2) + Math.pow((xOffsetLeft*angleTan), 2) );
        }
        
        if (up) {
            tempX2 = x + (yOffsetUp / angleTan);
            tempY2 = y + yOffsetUp+1;
            var distance2 = Math.sqrt( Math.pow((yOffsetUp/angleTan), 2) + Math.pow(yOffsetUp+1, 2) );
        } else {
            tempX2 = x - (yOffsetDown / angleTan);
            tempY2 = y - yOffsetDown;
            var distance2 = Math.sqrt( Math.pow((yOffsetDown/angleTan), 2) + Math.pow(yOffsetDown, 2) );
        }
       
        var xStep = fieldObject.blockSize / angleTan;
        var yStep = fieldObject.blockSize * angleTan;
        var totalDistance1 = distance1;
        var totalDistance2 = distance2;
        var distance1 = Math.sqrt( Math.pow(fieldObject.blockSize, 2) + Math.pow(yStep, 2) );
        var distance2 = Math.sqrt( Math.pow(xStep, 2) + Math.pow(fieldObject.blockSize, 2) );

        var walls = [];
        var wallWasHit = false;
        var hitWallNumber = 0;
        while (notDone) {
            wallNumber1 = fieldObject.getPosition(tempX1, tempY1);
            wallNumber2 = fieldObject.getPosition(tempX2, tempY2);
            wallHeight = 0;
            if ((wallWasHit || wallNumber1 > 0) && totalDistance1 < totalDistance2) {
                if (wallWasHit) {
                    wallWasHit = false;
                 
                    wallHeight = fieldObject.fieldDetails[hitWallNumber]['height'];
                    var nextWall = [totalDistance1, {'wall':hitWallNumber, 'x':Math.ceil(tempX1), 'y':Math.ceil(tempY1), 'realDistance':totalDistance1}];
                    walls.unshift(nextWall);
                } else {
                    wallWasHit = true;
                    hitWallNumber = wallNumber1;
                }
                
                if (wallNumber1 > 0) {
                    wallHeight = fieldObject.fieldDetails[wallNumber1]['height'];
                    var nextWall = [totalDistance1, {'wall':wallNumber1, 'x':Math.ceil(tempX1), 'y':Math.ceil(tempY1), 'realDistance':totalDistance1}];
                    walls.unshift(nextWall);
                }

                if (wallHeight == 1) {
                    notDone = false;
                    continue;
                }
            } else if ((wallWasHit || wallNumber2 > 0) && totalDistance2 < totalDistance1) {
                if (wallWasHit) {
                    wallWasHit = false;
     
                    wallHeight = fieldObject.fieldDetails[hitWallNumber]['height'];
                    var nextWall = [totalDistance2, {'wall':hitWallNumber, 'x':Math.ceil(tempX2), 'y':Math.ceil(tempY2), 'realDistance':totalDistance2}];
                    walls.unshift(nextWall);
                } else {
                    wallWasHit = true;
                    hitWallNumber = wallNumber2;
                }
                
                
                if (wallNumber2 > 0) {
                    wallHeight = fieldObject.fieldDetails[wallNumber2]['height'];
                      var nextWall = [totalDistance2, {'wall':wallNumber2, 'x':Math.ceil(tempX2), 'y':Math.ceil(tempY2), 'realDistance':totalDistance2}];
                    walls.unshift(nextWall);
                }

                if (wallHeight == 1) {
                    notDone = false;
                    continue;
                }
            }

            if (totalDistance1 < totalDistance2) {
                if (right) {
                    tempX1 += fieldObject.blockSize;
                    tempY1 += yStep;
                } else {
                    tempX1 -= fieldObject.blockSize;
                    tempY1 -= yStep;
                }
                totalDistance1 += distance1;
            } else {
                if (up) {
                    tempX2 += xStep;
                    tempY2 += fieldObject.blockSize;
                } else {
                    tempX2 -= xStep;
                    tempY2 -= fieldObject.blockSize;
                }
                totalDistance2 += distance2;
            }
        }



        //return {'distance':distance, 'wall':1, 'x':finalX, 'y':finalY};
        
        return walls;
    };
    */

	this.tanAngleCache = {};
	this.getTanAngle = function(angle) {
		var cachedValue = this.tanAngleCache[angle];
		
		if (cachedValue === undefined) {
			cachedValue = Math.tan(angle);
			this.tanAngleCache[angle] = cachedValue;
		}
		
		return cachedValue;
	};
	
	this.getDistance = function calculateDistance(x1, y1, x2, y2)
    {
        //return Math.sqrt( Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) );
        return (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
    };
    
    this.approx_distance = function( dx, dy )
	{
	   var min = 0;
	   var max = 0;
	   
	   if ( dx < 0 ) { dx = -dx; }
	   if ( dy < 0 ) { dy = -dy; }
	
	
	   if ( dx < dy )
	   {
	      min = dx;
	      max = dy;
	   } else {
	      min = dy;
	      max = dx;
	   }
	
	   // coefficients equivalent to ( 123/128 * max ) and ( 51/128 * min )
	   return ((( max << 8 ) + ( max << 3 ) - ( max << 4 ) - ( max << 1 ) +
	
	            ( min << 7 ) - ( min << 5 ) + ( min << 3 ) - ( min << 1 )) >> 8 );
	};
	
	this.uniqueId = 0;
	this.getUniqueId = function() {
		this.uniqueId += 1;
		
		return this.uniqueId;
	}
	
    this.castRay3 = function(cameraObject, fieldObject, angle)
    {
        var x = cameraObject.getPixelX();
        var y = cameraObject.getPixelY();

        var wall = 0;
        var distance = 0;

        /*
         * Definition of up: going down on the map, meaning adding to y
         */

        //var angleTan = Math.tan(angle);
        var angleTan = this.getTanAngle(angle);
       
        var xOffsetLeft = (x % fieldObject.blockSize);
        var yOffsetDown = (y % fieldObject.blockSize);
        var xOffsetRight = fieldObject.blockSize - (x % fieldObject.blockSize);
        var yOffsetUp = fieldObject.blockSize - (y % fieldObject.blockSize);

        var up = (angle > 0 && angle < this.quadrant2);
        var right = (angle < this.quadrant1 || angle > this.quadrant3);

        if (right) {
            var tempX1 = x + xOffsetRight+1;
            var tempY1 = y + ((xOffsetRight)*angleTan);
            var distance1 = Math.sqrt( (xOffsetRight+1)*(xOffsetRight+1) + (xOffsetRight*angleTan)*(xOffsetRight*angleTan) );
            //var distance1 = (xOffsetRight+1)*(xOffsetRight+1) + (xOffsetRight*angleTan)*(xOffsetRight*angleTan);
            //var distance1 = this.approx_distance(xOffsetRight+1, xOffsetRight*angleTan);
            //var tempX1 = x - xOffsetLeft+1;
            //var tempY1 = y - ((xOffsetLeft)*angleTan);
            //var distance1 = Math.sqrt( Math.pow(xOffsetLeft+1, 2) + Math.pow((xOffsetLeft*angleTan), 2) );
        } else {
            //var tempX1 = x + xOffsetRight;
            //var tempY1 = y + ((xOffsetRight)*angleTan);
            //var distance1 = Math.sqrt( Math.pow(xOffsetRight, 2) + Math.pow((xOffsetRight*angleTan), 2) );
            var tempX1 = x - xOffsetLeft;
            var tempY1 = y - ((xOffsetLeft)*angleTan);
            var distance1 = Math.sqrt( xOffsetLeft*xOffsetLeft + (xOffsetLeft*angleTan)*(xOffsetLeft*angleTan) );
            //var distance1 = xOffsetLeft*xOffsetLeft + (xOffsetLeft*angleTan)*(xOffsetLeft*angleTan);
            //var distance1 = this.approx_distance(xOffsetLeft, xOffsetLeft*angleTan);
        }
        
        if (up) {
            tempX2 = x + (yOffsetUp / angleTan);
            tempY2 = y + yOffsetUp+1;
            var distance2 = Math.sqrt( (yOffsetUp/angleTan)*(yOffsetUp/angleTan) + (yOffsetUp+1)*(yOffsetUp+1) );
            //var distance2 = (yOffsetUp/angleTan)*(yOffsetUp/angleTan) + (yOffsetUp+1)*(yOffsetUp+1);
            //var distance2 = this.approx_distance(yOffsetUp/angleTan, yOffsetUp+1);
        } else {
            tempX2 = x - (yOffsetDown / angleTan);
            tempY2 = y - yOffsetDown;
            var distance2 = Math.sqrt( (yOffsetDown/angleTan)*(yOffsetDown/angleTan) + yOffsetDown*yOffsetDown );
            //var distance2 = (yOffsetDown/angleTan)*(yOffsetDown/angleTan) + yOffsetDown*yOffsetDown;
            //var distance2 = this.approx_distance(yOffsetDown/angleTan, yOffsetDown);
        }

        var wallNumber1 = 0;
        var wallNumber2 = 0;
        var notDone = true;
       
        var xStep = fieldObject.blockSize / angleTan;
        var yStep = fieldObject.blockSize * angleTan;
        var totalDistance1 = distance1;
        var totalDistance2 = distance2;
        var distance1 = Math.sqrt( fieldObject.blockSize*fieldObject.blockSize + yStep*yStep );
        //var distance1 = fieldObject.blockSize*fieldObject.blockSize + yStep*yStep;
        //var distance1 = this.approx_distance(fieldObject.blockSize, yStep);
        var distance2 = Math.sqrt( xStep*xStep + fieldObject.blockSize*fieldObject.blockSize );
        //var distance2 = xStep*xStep + fieldObject.blockSize*fieldObject.blockSize;
        //var distance2 = this.approx_distance(xStep, fieldObject.blockSize);
        
        var first = true;

        var walls = [];
        var wallWasHit = 1;
        var hitWallNumber = fieldObject.getPosition(x, y);
        
        var minHeight = 0;
        
        while (notDone) {
            wallNumber1 = fieldObject.getPosition(tempX1, tempY1);
            wallNumber2 = fieldObject.getPosition(tempX2, tempY2);
            
            if (totalDistance1 < totalDistance2) {
                if (wallWasHit) {
                    var wallHeight = fieldObject.fieldDetails[hitWallNumber]['height'];
                    var nextWall = [totalDistance1 >> 0, {id:tempX1>>6+'-'+tempY1>>6, 'wall':hitWallNumber, 'x':tempX1 | tempX1, 'y':tempY1 | tempY1}];
                    walls.unshift(nextWall);

                   	//hitWallNumber = wallNumber1;
                   	wallWasHit = false;
                }
                
                var wallHeight = fieldObject.fieldDetails[wallNumber1]['height'];
                if (minHeight < cameraObject.eyeHeight || wallHeight >= minHeight) {
		            var nextWall = [totalDistance1 >> 0, {id:tempX1>>6+'-'+tempY1>>6, 'wall':wallNumber1, 'x':tempX1 | tempX1, 'y':tempY1 | tempY1}];
		            walls.unshift(nextWall);
		            
                    wallWasHit = true;
                    hitWallNumber = wallNumber1;
                    //minHeight = wallHeight;
                }

                if (wallHeight == 1) {
                    notDone = false;
                    continue;
                }
            } else if (totalDistance2 < totalDistance1) {
                if (wallWasHit) {
                    var wallHeight = fieldObject.fieldDetails[hitWallNumber]['height'];
                    var nextWall = [totalDistance2 >> 0, {id:tempX2>>6+'-'+tempY2>>6, 'wall':hitWallNumber, 'x':tempX2 | tempX2, 'y':tempY2 | tempY2}];
                    walls.unshift(nextWall);
                	
                	//hitWallNumber = wallNumber2;
                	wallWasHit = false;
                }
                
                var wallHeight = fieldObject.fieldDetails[wallNumber2]['height'];
                if (minHeight < cameraObject.eyeHeight || wallHeight >= minHeight) {
	                var nextWall = [totalDistance2 >> 0, {id:tempX2>>6+'-'+tempY2>>6, 'wall':wallNumber2, 'x':tempX2 | tempX2, 'y':tempY2 | tempY2}];
	                walls.unshift(nextWall);

                    wallWasHit = true;
                    hitWallNumber = wallNumber2;
                    //minHeight = wallHeight;
                }

                if (wallHeight == 1) {
                    notDone = false;
                    continue;
                }
            }

            if (totalDistance1 < totalDistance2) {
                if (right) {
                    tempX1 += fieldObject.blockSize;
                    tempY1 += yStep;
                } else {
                    tempX1 -= fieldObject.blockSize;
                    tempY1 -= yStep;
                }
                totalDistance1 += distance1;
            } else {
                if (up) {
                    tempX2 += xStep;
                    tempY2 += fieldObject.blockSize;
                } else {
                    tempX2 -= xStep;
                    tempY2 -= fieldObject.blockSize;
                }
                totalDistance2 += distance2;
            }
        }

        /*
        if (totalDistance1 < totalDistance2) {
            wall = wallNumber1;
            distance = totalDistance1;
            var finalX = Math.ceil(tempX1);
            var finalY = Math.ceil(tempY1);
        } else {
            wall = wallNumber2;
            distance = totalDistance2;
            var finalX = Math.ceil(tempX2);
            var finalY = Math.ceil(tempY2);
        }
        */

        //return {'distance':distance, 'wall':1, 'x':finalX, 'y':finalY};
        return walls;
    };

    this.normalizeDistance = function(distance) { return this.normalizeDistanceConstant / distance; };

    this.fishEyesCorrection = function(angleOffset, distance) {
    	return distance * Math.cos(angleOffset / (this.fieldOfVisionRadians));
    	//return distance * Math.cos(angleOffset);
    };
}
