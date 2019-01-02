function Draw()
{
    this.halfViewPixelHeight;
    this.blockSize;
    this.lightArray = [];
    this.spriteArray = [];
    this.flash = "";
    this.flashDuration = 1;
    this.floorColor = "";
    this.objectiveNumber = 0;

    this.init = function initialize(fieldObject, raycasterObject)
    {
        this.halfViewPixelHeight = Math.round(raycasterObject.viewPixelHeight / 2);
        this.blockSize = fieldObject.blockSize;
    }

    this.clearScreen = function(context, width, height)
    {
        //context.clearRect(0, 0, width, height);
        //context.fillStyle = "rgb(0,0,0)";
        //context.fillRect(0, 0, width, height);
    };

/*
    this.drawFloor = function(viewContext, viewPixelWidth, halfViewPixelHeight)
    {
        viewContext.fillStyle = this.floorColor;
        viewContext.fillRect(0, halfViewPixelHeight, viewPixelWidth, halfViewPixelHeight);
    }
*/

    this.drawText = function(viewContext, raycasterObject, text, color, backgroundColor)
    {
        var maxTextLength = 18;
        var length = text.length;
        var height = Math.ceil(length / maxTextLength);
        var index = 0;
        viewContext.fillStyle = backgroundColor;
        var topBottomOffset = Math.floor(raycasterObject.viewPixelHeight / 5);
        var leftRightOffset = Math.floor(raycasterObject.viewPixelWidth / 64);
        var lineHeight = Math.floor(raycasterObject.viewPixelHeight / 6);
        viewContext.fillRect(0, topBottomOffset, raycasterObject.viewPixelWidth, raycasterObject.viewPixelHeight-(topBottomOffset*2));
        viewContext.fillStyle = color;
        while (index < height) {
          var substring = text.substring(index*maxTextLength, (index+1)*maxTextLength);
          viewContext.fillStyle = color;

          viewContext.fillText(substring, leftRightOffset, index*lineHeight+(topBottomOffset*2));
          index++;
        }
    }

    this.drawWalls = function(viewContext, fieldObject, wallDistanceArray, viewPixelWidth, viewPixelHeight)
    {
        //var sliceStep = 5;
        for (columnIndex = 0; columnIndex+this.sliceStep < viewPixelWidth; columnIndex+=this.sliceStep) {
        //for (columnIndex = 0; columnIndex < wallDistanceArray.length; columnIndex+=1) {
            var wallsInColumn = wallDistanceArray[Math.ceil(columnIndex/this.sliceStep)];
            
            //console.log(wallsInColumn.length);

            for (var wallIndex = 0; wallIndex < wallsInColumn.length; wallIndex+=1) {
                if (wallIndex != 0) {
                    //var texturedWallIndex = wallIndex+1;
                    var texturedWallIndex = wallIndex;
                    var floorVisible = true;
                } else {
                    var texturedWallIndex = 0;
                    var floorVisible = false;
                }
                
                //console.log(wallsInColumn);
                //console.log(texturedWallIndex);
                var wallNumber = wallsInColumn[texturedWallIndex][1]['wall'];
                
                
                var wallHeight = fieldObject.fieldDetails[wallNumber]['height'];
                var wallTexture = fieldObject.fieldDetails[wallNumber]['texture'];

                var wallBottom = this.halfViewPixelHeight + wallsInColumn[texturedWallIndex][0];
                var wallTop = wallBottom - (wallsInColumn[texturedWallIndex][0] * 2 * wallHeight);
                if (floorVisible) {
                    var wallFloorBottom = this.halfViewPixelHeight + wallsInColumn[wallIndex][0];
                    var wallFloorTop = wallFloorBottom - (wallsInColumn[wallIndex][0] * 2 * wallHeight);
                } else {
                    var wallFloorBottom = null;
                    var wallFloorTop = null;
                }
                
                var sliceXmin = Math.abs(wallsInColumn[texturedWallIndex][1]['x'] % this.blockSize);
                var sliceYmin = Math.abs(wallsInColumn[texturedWallIndex][1]['y'] % this.blockSize);
                
                if (sliceXmin < 2 || sliceXmin > 62) {
                    var currentSliceMin = sliceYmin;
                } else {
                    var currentSliceMin = sliceXmin;
                }

                var sliceCoordinate = currentSliceMin;

                //myLogArray([columnIndex, sliceCoordinate, sliceSize]);
                viewContext.drawImage(wallTexture, sliceCoordinate, 0, /*sliceSize*/ 1, 64/*wall.height*/, columnIndex, wallTop, this.sliceStep, (wallBottom - wallTop));

                
                if (floorVisible) {
                    var gradient = viewContext.createLinearGradient(columnIndex, wallFloorTop, columnIndex+1, wallTop);
                    gradient.addColorStop(0, "rgb(30,30,30)");
                    gradient.addColorStop(1, "rgb(20,20,20)");
                    viewContext.fillStyle = gradient;
                    viewContext.fillRect(columnIndex, wallFloorTop, this.sliceStep, (wallTop - wallFloorTop));
                }
                

                /*
                var wallX = wallsInColumn[texturedWallIndex][1]['x'];
                var wallY = wallsInColumn[texturedWallIndex][1]['y'];
                var lightDistance = 100000;
                var lightRange = 0;
                for (var lightIndex in this.lightArray) {
                    var distance = this.getDistance(wallX, wallY, this.lightArray[lightIndex].getPixelX(), this.lightArray[lightIndex].getPixelY());
                    if (lightDistance > distance) {
                        lightDistance = distance;
                        lightRange = this.lightArray[lightIndex].range;
                    }
                }
               
                if (lightDistance > lightRange) {
                    var alpha = 1;
                } else if (lightDistance < (lightRange/10)) {
                    var alpha = 0;
                } else {
                    var alpha = 1 - ((lightRange/10) / lightDistance);
                }
                viewContext.beginPath();
                viewContext.fillStyle = "rgba(0,0,0, " + alpha + ")";
                viewContext.fillRect(columnIndex, wallTop, this.sliceStep, wallsInColumn[texturedWallIndex][0]*2*wallHeight);
                */

                if (wallIndex != 0) {
                    wallIndex += 1;
                }
            }
        }
    };
    
    
	/* This is much faster than using (el.innerHTML = str) when there are many
	existing descendants, because in some browsers, innerHTML spends much longer
	removing existing elements than it does creating new ones. */
	this.replaceHtml = function(el, html) {
	        var oldEl = (typeof el === "string" ? document.getElementById(el) : el);
	        var newEl = document.createElement(oldEl.nodeName);
	        // Preserve the element's id and class (other properties are lost)
	        newEl.id = oldEl.id;
	        newEl.className = oldEl.className;
	        // Replace the old with the new
	        newEl.innerHTML = html;
	        oldEl.parentNode.replaceChild(newEl, oldEl);
	        /* Since we just removed the old element from the DOM, return a reference
	        to the new element, which can be used to restore variable references. */
	        return newEl;
	};
	
	this.getLightAlpha = function(wallIndex, wallsInColumn) {
    	var wallX = wallsInColumn[wallIndex][1]['x'];
        var wallY = wallsInColumn[wallIndex][1]['y'];
        var lightDistance = 1000000;
        var lightRange = 0;
        var lightColor = undefined;
        var lightIntensity = 0;
        for (var lightIndex in this.lightArray) {
        	var dx = this.lightArray[lightIndex].getPixelX()-wallX;
        	var dy = this.lightArray[lightIndex].getPixelY()-wallY;
        	
        	if (dx > 128 || dy > 128) {
        		continue;
        	}
            
            var distance = this.approx_distance(dx, dy);
            //var distance = Math.sqrt( this.getDistance(dx, dy) );
            
            if (lightDistance > distance) {
                lightDistance = distance;
                lightRange = this.lightArray[lightIndex].range;
                lightColor = this.lightArray[lightIndex].color;
                //lightIntensity = this.lightArray[lightIndex].intensity;
            }
        }
        
        //var alpha = (Math.sqrt(lightDistance) << 7) >> lightRange;
        if (lightRange !== 7) {
        	var alpha = (lightDistance << 7) >> lightRange;
        } else {
        	var alpha = lightDistance >> 0;
        }
        
        alpha = (alpha > 128 ? 128 : alpha);
        //alpha = (alpha > 16384 ? 16384 : alpha);
        //alpha = lightIntensity - (alpha * lightIntensity);
        alpha = 128 - alpha + 24;
        //alpha = 16384 - alpha + 576;
        alpha = (alpha < 24 ? 24 : alpha);
        //console.log(Math.sqrt(alpha) / 16384);
        return {alpha: alpha / 128, lightColor: lightColor};
        //return {alpha: alpha / 16384, lightColor: lightColor};
	};
	
	this.getWallDiv = function(fieldObject, wallNumber, unseenWall, wallHeight, nextWallHeight, lightColor, alpha, wallIndex, columnIndex, wallTop, wallBottom)
	{
		if (! unseenWall && wallHeight !== nextWallHeight) {
        	var wallColor = fieldObject.fieldDetails[wallNumber]['wallRGB'];
        	var wallRed = wallColor[0];
        	var wallGreen = wallColor[1];
        	var wallBlue = wallColor[2];
        	
            if (lightColor !== undefined) {
                wallRed = (wallRed + lightColor[0]) >> 1;
                wallGreen = (wallGreen + lightColor[1]) >> 1;
                wallBlue = (wallBlue + lightColor[2]) >> 1;
            }

            wallRed = wallRed * alpha;
            wallRed = wallRed >> 0;
            wallRed = (wallRed > 255 ? 255 : wallRed);
            wallRed = (wallRed).toString(16);

            wallGreen = wallGreen * alpha;
            wallGreen = wallGreen >> 0;
            wallGreen = (wallGreen > 255 ? 255 : wallGreen);
            wallGreen = (wallGreen).toString(16);

            wallBlue = wallBlue * alpha;
            wallBlue = wallBlue >> 0;
            wallBlue = (wallBlue > 255 ? 255 : wallBlue);
            wallBlue = (wallBlue).toString(16);

        	wallRed = (wallRed.length < 2 ? '0' + wallRed : wallRed);
        	wallGreen = (wallGreen.length < 2 ? '0' + wallGreen : wallGreen);
        	wallBlue = (wallBlue.length < 2 ? '0' + wallBlue : wallBlue);
        	
        	return '<div style="position: absolute; z-index: '+wallIndex+'; left: '+columnIndex+'px; top: '+wallTop+'px; width: '+(1<<this.sliceStep)+'px; height: '+(wallBottom-wallTop)+'px; background-color: #'+wallRed+wallGreen+wallBlue+';"></div>';
        }
        
        return '';
    };
    
    this.getFloorDiv = function(floorVisible, wallFloorTop, wallFloorBottom, fieldObject, wallNumber, lightColor, alpha, wallIndex, columnIndex)
    {
        if ((floorVisible) && (wallFloorTop < wallFloorBottom)) {
            var floorHeight = (wallFloorBottom - wallFloorTop);
            
        	var floorColor = fieldObject.fieldDetails[wallNumber]['floorRGB'];
        	var floorRed = floorColor[0];
        	var floorGreen = floorColor[1];
        	var floorBlue = floorColor[2];                    
            
            if (lightColor !== undefined) {
                floorRed = (floorRed + lightColor[0]) >> 1;
                floorGreen = (floorGreen + lightColor[1]) >> 1;
                floorBlue = (floorBlue + lightColor[2]) >> 1;
            }
            
            floorRed = floorRed * alpha;
            floorRed = floorRed >> 0;
            floorRed = (floorRed > 255 ? 255 : floorRed);
            floorRed = (floorRed).toString(16);

            floorGreen = floorGreen * alpha;
            floorGreen = floorGreen >> 0;
            floorGreen = (floorGreen > 255 ? 255 : floorGreen);
            floorGreen = (floorGreen).toString(16);

            floorBlue = floorBlue * alpha;
            floorBlue = floorBlue >> 0;
            floorBlue = (floorBlue > 255 ? 255 : floorBlue);
            floorBlue = (floorBlue).toString(16);

        	return '<div style="position: absolute; z-index: '+wallIndex+'; left: '+columnIndex+'px; top: '+wallFloorTop+'px; width: '+(1<<this.sliceStep)+'px; height: '+floorHeight+'px; background-color: #'+floorRed+floorGreen+floorBlue+';"></div>';
        }
        
        return '';
    };
    
    this.drawWalls2 = function(viewContext, fieldObject, wallDistanceArray, viewPixelWidth, viewPixelHeight, cameraObject)
    {
    	//console.log(viewPixelWidth / this.sliceStep / 2);
    	//viewHtml = '<div style="position: absolute; top: '+this.halfViewPixelHeight+'px; height: '+this.halfViewPixelHeight+'px; width: 636px; background-color: #400;"></div>';
    	var floorColors = {};
    	
    	viewHtml = '';
        for (columnIndex = 0; columnIndex+(1<<this.sliceStep) < viewPixelWidth; columnIndex+=(1<<this.sliceStep)) {
            var wallsInColumn = wallDistanceArray[ columnIndex>>this.sliceStep ];
	        
			var maxTop = this.halfViewPixelHeight << 1;
			var skipNext = false;

			var unseenWall = false;
			var unseenFloor = false;
			
			var firstFloor = true;
            //for (var wallIndex = 0; wallIndex < wallsInColumn.length; wallIndex+=1) {
            for (var wallIndex = wallsInColumn.length-1; wallIndex >= 0; wallIndex-=1) {
            	var unseenFloor = false;
            	
                var wallNumber = wallsInColumn[wallIndex][1]['wall'];
                
                //console.log(wallNumber);
                if (wallNumber === 0) { continue; }

                var wallId = fieldObject.fieldDetails[wallNumber]['id'];
                var wallHeight = fieldObject.fieldDetails[wallNumber]['height'];
                var wallTexture = fieldObject.fieldDetails[wallNumber]['texture'];
                var floorColor = fieldObject.fieldDetails[wallNumber]['floorRGB'];

                var wallHeightOffset = (wallsInColumn[wallIndex][0]) * (cameraObject.eyeHeight - cameraObject.eyeHeightOffset - 0.25);
                wallHeightOffset = wallHeightOffset >> 0;
                
                var wallBottom = this.halfViewPixelHeight + wallsInColumn[wallIndex][0] + wallHeightOffset;
                var wallTop = wallBottom - ((wallsInColumn[wallIndex][0] << 1) * wallHeight);
                wallTop = wallTop >> 0;
                


                if (wallIndex % 2 === 0) {
                	unseenWall = false;
                } else {
                	unseenWall = true;
                }
                

                var nextWallNumber = undefined;
                var nextWallHeight = undefined;
                if (wallIndex+1 < wallsInColumn.length) {
                	var nextWallNumber = wallsInColumn[wallIndex+1][1]['wall'];
                	var nextWallHeight = fieldObject.fieldDetails[nextWallNumber]['height'];
                }
                

                var floorVisible = false;
                if (wallIndex !== 0 && ! unseenWall) {
                	floorVisible = true;
                } else if (wallIndex !== 0 && !firstFloor) {
                	continue;
                }
                

                var wallFloorBottom = null;
                var wallFloorTop = null;
                if (floorVisible || (firstFloor && wallIndex !== 0)) {
                	if (wallsInColumn[wallIndex-1] !== undefined) {
		            	var prevWallHeightOffset = (wallsInColumn[wallIndex-1][0]) * (cameraObject.eyeHeight - (cameraObject.eyeHeightOffset*2));
		            	var prevWallBottom = this.halfViewPixelHeight + wallsInColumn[wallIndex-1][0] + prevWallHeightOffset;
		            	var prevWallTop = prevWallBottom - ((wallsInColumn[wallIndex-1][0] << 1) * wallHeight);
                		prevWallTop = prevWallTop >> 0;
		                
		                wallFloorBottom = wallTop;
		                wallFloorTop = prevWallTop;
                	}
                }
                
                if (prevWallTop > maxTop && wallIndex !== 0 /*&& skipNext*/) {
                	unseenFloor = true;
                	continue;
                //} else if (wallTop > maxTop) {
                //	skipNext = true;
                } else {
                	maxTop = prevWallTop;
                	//skipNext = false;
                }
                
                /*
                var sliceXmin = Math.abs(wallsInColumn[wallIndex][1]['x'] % this.blockSize);
                var sliceYmin = Math.abs(wallsInColumn[wallIndex][1]['y'] % this.blockSize);
                
                if (sliceXmin < 2 || sliceXmin > 62) {
                    var currentSliceMin = sliceYmin;
                } else {
                    var currentSliceMin = sliceXmin;
                }
 
                var sliceCoordinate = currentSliceMin;
				*/

            	//var wallColor = fieldObject.fieldDetails[wallNumber]['wallRGB'];
            	//var wallRed = wallColor[0];
            	//var wallGreen = wallColor[1];
            	//var wallBlue = wallColor[2];
            	
            	/*
            	var wallX = wallsInColumn[wallIndex][1]['x'];
                var wallY = wallsInColumn[wallIndex][1]['y'];
                var lightDistance = 1000;
                var lightRange = 0;
                var lightColor = undefined;
                var lightIntensity = 0;
                for (var lightIndex in this.lightArray) {
                    var distance = this.getDistance(wallX, wallY, this.lightArray[lightIndex].getPixelX(), this.lightArray[lightIndex].getPixelY());
                    if (lightDistance > distance) {
                        lightDistance = distance;
                        lightRange = this.lightArray[lightIndex].range;
                        lightColor = this.lightArray[lightIndex].color;
                        lightIntensity = this.lightArray[lightIndex].intensity;
                    }
                }
                
                var alpha = lightDistance / lightRange;
                alpha = (alpha > 1 ? 1 : alpha);
                alpha = lightIntensity - (alpha * lightIntensity);
                alpha = (alpha < 0.18 ? 0.18 : alpha);
                */
                var light = this.getLightAlpha(wallIndex, wallsInColumn);
                var alpha = light['alpha'];
                var lightColor = light['lightColor'];
                
                viewHtml += this.getWallDiv(fieldObject, wallNumber, unseenWall, wallHeight, nextWallHeight, lightColor, alpha, wallIndex, columnIndex, wallTop, wallBottom);
                /*
				if (! unseenWall && wallHeight !== nextWallHeight) {
	                if (lightColor !== undefined) {
		                wallRed = (wallRed + lightColor[0]) >> 1;
		                wallGreen = (wallGreen + lightColor[1]) >> 1;
		                wallBlue = (wallBlue + lightColor[2]) >> 1;
	                }

	                wallRed = wallRed * alpha;
	                wallRed = wallRed | wallRed;
	                wallRed = (wallRed > 255 ? 255 : wallRed);
	                wallRed = (wallRed).toString(16);

	                wallGreen = wallGreen * alpha;
	                wallGreen = wallGreen | wallGreen;
	                wallGreen = (wallGreen > 255 ? 255 : wallGreen);
	                wallGreen = (wallGreen).toString(16);

	                wallBlue = wallBlue * alpha;
	                wallBlue = wallBlue | wallBlue;
	                wallBlue = (wallBlue > 255 ? 255 : wallBlue);
	                wallBlue = (wallBlue).toString(16);

                	wallRed = (wallRed.length < 2 ? '0' + wallRed : wallRed);
                	wallGreen = (wallGreen.length < 2 ? '0' + wallGreen : wallGreen);
                	wallBlue = (wallBlue.length < 2 ? '0' + wallBlue : wallBlue);
                	
                	viewHtml += '<div style="position: absolute; z-index: '+wallIndex+'; left: '+columnIndex+'px; top: '+wallTop+'px; width: '+(1<<this.sliceStep)+'px; height: '+(wallBottom-wallTop)+'px; background-color: #'+wallRed+wallGreen+wallBlue+';"></div>';
                }
                */
               
               /*
                if ((floorVisible) && (wallFloorTop < wallFloorBottom)) {
                    var floorHeight = (wallFloorBottom - wallFloorTop);
                    
                	var floorColor = fieldObject.fieldDetails[wallNumber]['floorRGB'];
                	var floorRed = floorColor[0];
                	var floorGreen = floorColor[1];
                	var floorBlue = floorColor[2];                    
                    
	                if (lightColor !== undefined) {
		                floorRed = (floorRed + lightColor[0]) >> 1;
		                floorGreen = (floorGreen + lightColor[1]) >> 1;
		                floorBlue = (floorBlue + lightColor[2]) >> 1;
	                }
                    
	                floorRed = floorRed * alpha;
	                floorRed = floorRed | floorRed;
	                floorRed = (floorRed > 255 ? 255 : floorRed);
	                floorRed = (floorRed).toString(16);

	                floorGreen = floorGreen * alpha;
	                floorGreen = floorGreen | floorGreen;
	                floorGreen = (floorGreen > 255 ? 255 : floorGreen);
	                floorGreen = (floorGreen).toString(16);

	                floorBlue = floorBlue * alpha;
	                floorBlue = floorBlue | floorBlue;
	                floorBlue = (floorBlue > 255 ? 255 : floorBlue);
	                floorBlue = (floorBlue).toString(16);

                	viewHtml += '<div style="position: absolute; z-index: '+wallIndex+'; left: '+columnIndex+'px; top: '+wallFloorTop+'px; width: '+(1<<this.sliceStep)+'px; height: '+floorHeight+'px; background-color: #'+floorRed+floorGreen+floorBlue+';"></div>';
                }
                */
                
                if (firstFloor && unseenWall && wallIndex !== 0) {
                	//console.log(wallFloorBottom + ' to ' + (this.halfViewPixelHeight << 1));
                    viewHtml += this.getFloorDiv(true, wallFloorBottom, this.halfViewPixelHeight << 1, fieldObject, wallNumber, lightColor, alpha, wallIndex, columnIndex);
                    firstFloor = false;
                } else {
                	firstFloor = false;
                }
                
                //if (wallNumber === 2) {
                	viewHtml += this.getFloorDiv(floorVisible, wallFloorTop, wallFloorBottom, fieldObject, wallNumber, lightColor, alpha, wallIndex, columnIndex);
               	//}
            }
        }
        //viewContext.innerHTML = viewHtml;
        this.replaceHtml('view', viewHtml);
    };

    this.getDistance = function calculateDistance(dx, dy)
    {
        //return Math.sqrt( Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) );
        return dx*dx + dy*dy;
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

/*
    this.drawSimpleLight = function drawSimpleLightDot(viewContext, cameraObject, raycasterObject)
    {
        for (var lightIndex in this.lightArray) {
            var lightX = this.lightArray[lightIndex].getPixelX();
            var lightY = this.lightArray[lightIndex].getPixelY();
            var visible = this.isSpriteWithinFieldOfVision(cameraObject, raycasterObject, lightX, lightY);

            if (visible) {
                var xPosition = this.findSpritePositionX(cameraObject, raycasterObject, this.lightArray[lightIndex]);
                var lightDistance = this.getDistance(lightX, lightY, cameraObject.getPixelX(), cameraObject.getPixelY());
                var lightSize = raycasterObject.normalizeDistance(lightDistance);
                var yPosition = raycasterObject.halfViewPixelHeight+(lightSize/2);

                var lightRange = this.lightArray[lightIndex].range;
                
                // to prevent the floor light to be drawn above the horizon...
                var topPositionY = yPosition-(lightRange/2);
                if (topPositionY < raycasterObject.halfViewPixelHeight) {
                    topPositionY = raycasterObject.halfViewPixelHeight;
                }
                
                //viewContext.save();
                //viewContext.scale(1, 0.75);
                gradObj = viewContext.createRadialGradient(xPosition, yPosition, 0, xPosition, yPosition, (lightRange/2));
                gradObj.addColorStop(0, "rgba(255,255,255, 0.25)");
                gradObj.addColorStop(1, "rgba(0,0,0, 0)");
                viewContext.fillStyle = gradObj;
                viewContext.rect(xPosition-(lightRange/2), topPositionY, lightRange, lightRange);
                viewContext.fill();
                //viewContext.restore();
            }
        }
    }
*/

    this.activateSprites = function(viewContext, cameraObject, raycasterObject, fieldObject)
    {
        for (var spriteIndex in this.spriteArray) {
            this.spriteArray[spriteIndex].activate(viewContext, cameraObject, this, raycasterObject, fieldObject);
        }
    }

/*
    this.regenerateHealth = function(cameraObject)
    {
        if (cameraObject.metadata["health"] > 0 && cameraObject.metadata["health"] < 100) {
            cameraObject.metadata["health"] += 0.2;
        }
    }
*/

    this.shootSprite = function(cameraObject)
    {
        for (var spriteIndex in this.spriteArray) {
            if (this.spriteArray[spriteIndex].metadata["health"] != undefined) {
                if (this.spriteArray[spriteIndex].metadata["health"] > 0) {
                    var x = this.spriteArray[spriteIndex].getPixelX();
                    
                    var y = this.spriteArray[spriteIndex].getPixelY();
                    var angle = this.objectAngle(cameraObject, x, y);
                    if (angle < (cameraObject.rotationRadians+Math.PI/16) && angle > (cameraObject.rotationRadians-Math.PI/16)) {
                        this.spriteArray[spriteIndex].metadata["health"] -= cameraObject.metadata["shotDamage"];
                    }
                }
            }
        }
    }

/*
    this.drawSprites = function drawSpritesOnScreen(viewContext, cameraObject, raycasterObject, wallDistanceArray)
    {
        spriteObjectArray = this.orderSprites(cameraObject, this.spriteArray);
        for (var spriteIndex in spriteObjectArray)
        {
            var spriteX = spriteObjectArray[spriteIndex].getPixelX();
            var spriteY = spriteObjectArray[spriteIndex].getPixelY();
            var visible = this.isSpriteWithinFieldOfVision(cameraObject, raycasterObject, spriteX, spriteY);

            var health = spriteObjectArray[spriteIndex].metadata["health"];
            
            if (visible && (health == undefined || health > 0)) {
                var xPosition = this.findSpritePositionX(cameraObject, raycasterObject, spriteObjectArray[spriteIndex]);
                var spriteDistance = this.getDistance(spriteX, spriteY, cameraObject.getPixelX(), cameraObject.getPixelY()); // round ?
                var spriteSize = raycasterObject.normalizeDistance(spriteDistance); // round ?
                spriteDistance = Math.round(spriteDistance);
                spriteSize = Math.round(spriteSize*2);

                offsetLeft = this.getLeftCrop(raycasterObject, wallDistanceArray, xPosition, spriteSize, spriteDistance);
                offsetRight = this.getRightCrop(raycasterObject, wallDistanceArray, xPosition, spriteSize, spriteDistance);
                
                if (spriteSize - offsetLeft - offsetRight > 0) {
                    this.drawSprite(viewContext, raycasterObject, xPosition, spriteSize, spriteObjectArray[spriteIndex].image, offsetLeft, offsetRight);
                }
            }
        }
    }
*/

    this.orderSprites = function(cameraObject, sprites)
    {
        orderedSprites = [];
        
        for (i in sprites) {
            x = sprites[i].getPixelX();
            y = sprites[i].getPixelY();
            // distance is now squared, make the appropriate code changes!
            distance = this.getDistance(x, y, cameraObject.getPixelX(), cameraObject.getPixelY());
            orderedSprites.push([distance, sprites[i]]);
        }
        
        orderedSprites.sort(this.sortArray);
        
        newSprites = [];
        for (j in orderedSprites) {
            newSprites.unshift(orderedSprites[j][1]);
        }

        return newSprites;
    }

    this.sortArray = function(a, b)
    {
        var difference = a[0]-b[0];
        if (difference != 0) {
            return Math.abs(difference)/difference;
        } else  {
            return 0;
        }
    }

    this.drawSprite = function drawSpriteOnScreen(viewContext, raycasterObject, xSpritePosition, spriteSize, spriteImage, spriteOffsetLeft, spriteOffsetRight)
    {
        if (spriteImage == null) {
            return false;
        }

        var imageWidth = spriteImage.width;
        var imageHeight = spriteImage.height;
        var imageCanvasSize = spriteSize - spriteOffsetLeft - spriteOffsetRight;
        var imageWidthFraction = Math.round(imageWidth / (spriteSize / imageCanvasSize));
        var imageLeftFractionStart = Math.round(imageWidth - (imageWidth / (spriteSize / (spriteSize - spriteOffsetLeft))));
        var halfSize = spriteSize / 2;
        var yPosition = raycasterObject.halfViewPixelHeight - halfSize;
        var xPosition = xSpritePosition - halfSize;
        var xPositionOffset = xPosition + spriteOffsetLeft;
        viewContext.beginPath();
        viewContext.drawImage(spriteImage, imageLeftFractionStart, 0, imageWidthFraction, imageHeight, xPositionOffset, yPosition, imageCanvasSize, spriteSize);
        viewContext.closePath();
   }

    this.getLeftCrop = function findLeftCrop(raycasterObject, wallDistanceArray, xPosition, width, distance)
    {
        offsetCount = 0;
        index = Math.floor(xPosition - (width / 2));
        if (index < 0){
            offsetCount = Math.abs(index);
            index = 0;
        }

        while (index < raycasterObject.viewPixelWidth && wallDistanceArray[index][0][1]['realDistance'] < distance && offsetCount < width) {
            offsetCount++;
            index++;
        }
        return offsetCount;
    }

    this.getRightCrop = function findRightCrop(raycasterObject, wallDistanceArray, xPosition, width, distance)
    {
        offsetCount = 0;
        index = Math.floor(xPosition + (width / 2));
        if (index > raycasterObject.viewPixelWidth){
            offsetCount = index - raycasterObject.viewPixelWidth;
            index = index - offsetCount - 1;
        }
        while (index > 0 && wallDistanceArray[index][0][1]['realDistance'] < distance && offsetCount < width) {
            offsetCount++;
            index--;
        }
        return offsetCount;
    }

    this.objectAngle = function findObjectAngle(cameraObject, x, y)
    {
        if (x == cameraObject.getPixelX()) {
            if (y > cameraObject.getPixelY()) {
                return 0.5 * Math.PI;
            } else if (y < cameraObject.getPixelY()) {
                return 1.5 * Math.PI;
            }
        }
        if (y == cameraObject.getPixelY()) {
            if (x > cameraObject.getPixelX()) {
                return 0;
            } else if (x < cameraObject.getPixelX()) {
                return Math.PI;
            }
        }
        var realX = x - cameraObject.getPixelX();
        var realY = y - cameraObject.getPixelY();
        var tangent = realY / realX; 
        
        var a = (Math.atan( (tangent) ) + (2*Math.PI) ) % (2*Math.PI);
        var b = (a + Math.PI ) % (2*Math.PI);


        if (realY > 0) {
            if (a <= Math.PI) {
                return a;
            } else {
                return b;
            }
        } else {
            if (a >= Math.PI) {
                return a;
            } else {
                return b;
            }
        }
    }
    
    this.findRelativeObjectAngle = function relativeObjectAngle(cameraObject, raycasterObject, x, y)
    {
        var minimumObjectAngle = cameraObject.rotationRadians - raycasterObject.halfFieldOfVisionRadians;
        if (minimumObjectAngle < 0) {
            minimumObjectAngle += 2*Math.PI;
        }
       
        var normalizedObjectAngle = (this.objectAngle(cameraObject, x, y) - minimumObjectAngle + (2*Math.PI)) % (2*Math.PI);

        return normalizedObjectAngle;
    }

    this.isSpriteWithinFieldOfVision = function objectWithinFov(cameraObject, raycasterObject, x, y)
    {
        var relativeSpriteAngle = this.findRelativeObjectAngle(cameraObject, raycasterObject, x, y);
        
        //var fieldOfVisionBorder = 1.0*Math.PI;
        if (relativeSpriteAngle <= raycasterObject.fieldOfVisionRadians/*+fieldOfVisionBorder*/) {
            return true;
        } else {
            return false;
        }
    }

    this.findSpritePositionX = function spritePositionX(cameraObject, raycasterObject, spriteObject)
    {
        var relativeSpriteAnglePosition = this.findRelativeObjectAngle(cameraObject, raycasterObject, spriteObject.getPixelX(), spriteObject.getPixelY());
        
        //myLogArray(['cameraRotation', cameraObject.rotationRadians, 'fovRadians', raycasterObject.halfFieldOfVisionRadians, 'minRotation', minRotation, 'relativeObjectAngle', relativeObjectAngle]);
        var xSpritePosition = relativeSpriteAnglePosition / raycasterObject.angleStep;

        return xSpritePosition;
    }

    this.findSpriteSize = function spriteSize(cameraObject, raycasterObject, spriteObject)
    {
        return normalizedSpriteDistance;
    }

    this.activateFlash = function(viewContext, raycasterObject)
    {
        if (this.flash != "") {
            viewContext.fillStyle = this.flash;
            viewContext.fillRect(0, 0, raycasterObject.viewPixelWidth, raycasterObject.viewPixelHeight);
            if (this.flashDuration == 1) {
                this.flash = "";
            } else {
                this.flashDuration -= 1;
            }
        }
    }

    this.drawInterface = function(viewContext, cameraObject, raycasterObject)
    {
        var fontsize = Math.floor(raycasterObject.viewPixelWidth/10);
        viewContext.font = /*"bold " +*/ fontsize + "px century gothic";

        
        // draw health status as red glow
        var healthAlpha = 1 - (Math.round(cameraObject.metadata["health"]) / 100);
        viewContext.fillStyle = 'rgba(255,0,0,' + healthAlpha + ')';
        viewContext.fillRect(0, 0, raycasterObject.viewPixelWidth, raycasterObject.viewPixelHeight);
        
        //viewContext.fillText(cameraObject.metadata["health"], 70, 58);

        
        // draw crosshair
        var xScreenCenter = Math.round(raycasterObject.halfViewPixelWidth);
        var yScreenCenter = Math.round(raycasterObject.halfViewPixelHeight);
        viewContext.strokeStyle = 'rgb(230, 230, 230)';
        viewContext.beginPath();
        viewContext.moveTo(xScreenCenter-10, yScreenCenter);
        viewContext.lineTo(xScreenCenter+10, yScreenCenter);
        viewContext.moveTo(xScreenCenter, yScreenCenter-10);
        viewContext.lineTo(xScreenCenter, yScreenCenter+10);
        viewContext.stroke();

        // draw inventory
        var itemSize = Math.floor(raycasterObject.viewPixelWidth / 6);
        var itemPositionX = Math.floor(raycasterObject.viewPixelWidth / 6 * 5);
        var itemPositionY = 0;
        for (var inventoryIndex in cameraObject.inventory) {
            var keyId = cameraObject.inventory[inventoryIndex];
            for (var spriteIndex in this.spriteArray) {
                var spriteKeyId = this.spriteArray[spriteIndex].metadata['keyId'];
                if (spriteKeyId != undefined && spriteKeyId == keyId) {
                    viewContext.drawImage(this.spriteArray[spriteIndex].inventoryImage, itemPositionX, itemPositionY, itemSize, itemSize);
                    itemPositionY += itemSize;
                }
            }
        }

        // draw objective compass
        var objective = null;
        for (var spriteIndex in this.spriteArray) {
            var spriteObjectiveNumber = this.spriteArray[spriteIndex].metadata['objectiveNumber'];
            if (spriteObjectiveNumber != undefined && this.objectiveNumber+1 == spriteObjectiveNumber) {
                objective = this.spriteArray[spriteIndex];
                break;
            }
        }
        var objectiveAngle = this.findRelativeObjectAngle(cameraObject, raycasterObject, objective.getPixelX(), objective.getPixelY());
        var definiteAngle = cameraObject.rotationRadians - (Math.PI / 2) - objectiveAngle;
        if (definiteAngle < 0) {
            definiteAngle += Math.PI * 2;
        }
        viewContext.save();
        viewContext.translate(raycasterObject.viewPixelWidth/2, 30);
        viewContext.rotate(objectiveAngle);
        viewContext.drawImage($('arrow'), -20, -20, 40, 40);
        viewContext.restore();
        
    }

    this.drawMinimap = function(viewContext, minimapContext, fieldObject, cameraObject)
    {
        var scale = 2;

        minimapContext.clearRect(0, 0, 320, 240);
        minimapContext.save();
        minimapContext.translate((320/2)-Math.floor(cameraObject.getPixelX()/scale)-8, (240/2)-Math.floor(cameraObject.getPixelY()/scale)-8);
        //minimapContext.rotate(cameraObject.rotationRadians);
        
        var x = 0;
        var y = 0;
        var objectBlocksize = 16;
        var halfObjectBlocksize = objectBlocksize / 2;
        var scaledBlocksize = this.blockSize / scale;
        var halfScaledBlocksize = scaledBlocksize / 2 + halfObjectBlocksize;;
        for (var row in fieldObject.fieldMap) {
            x = 0;
            for (var column in fieldObject.fieldMap[row]) {
                var block = fieldObject.fieldMap[row][column];
                var blockColor = fieldObject.fieldDetails[block]['minimapColor'];
                if (blockColor != undefined) {
                    minimapContext.fillStyle = blockColor;
                    minimapContext.fillRect(x-halfScaledBlocksize, y-halfScaledBlocksize, scaledBlocksize, scaledBlocksize);
                }

                x += scaledBlocksize;
            }
            y += scaledBlocksize;
        }
    
        for (var spriteIndex in this.spriteArray) {
            var spriteX = this.spriteArray[spriteIndex].getIndexX() * scaledBlocksize;
            var spriteY = this.spriteArray[spriteIndex].getIndexY() * scaledBlocksize;
            var minimapColor = this.spriteArray[spriteIndex].metadata['minimapColor'];
            var health = this.spriteArray[spriteIndex].metadata['health'];
            var pickedUp = this.spriteArray[spriteIndex].metadata['pickedUp'];
            if (minimapColor != undefined && (health == undefined || health > 0) && (pickedUp == undefined || pickedUp == false)) {
                minimapContext.fillStyle = minimapColor;
                minimapContext.fillRect(spriteX-halfObjectBlocksize, spriteY-halfObjectBlocksize, objectBlocksize, objectBlocksize);
            }
        }
    
        minimapContext.restore();

        minimapContext.fillStyle = "rgb(150,30,100)";
        minimapContext.fillRect(320/2-halfObjectBlocksize, 240/2-halfObjectBlocksize, objectBlocksize, objectBlocksize);

        var trueRotation = (Math.PI*2) - (cameraObject.rotationRadians + (Math.PI/2));
        if (trueRotation > 2*Math.PI) {
            trueRotation -= 2*Math.PI;
        }
        viewContext.save();
        viewContext.translate(100, 380);
        viewContext.rotate(trueRotation);
        //viewContext.fillStyle = "rgba(255,255,255,0.5)";
        //viewContext.fillRect(-50, -50, 100, 100);
        viewContext.drawImage($('minimap'), -50, -50, 100, 100);
        viewContext.restore();
    };

}
