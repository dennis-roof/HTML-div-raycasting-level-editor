var game;

jQuery(function()
{
	var $view = jQuery('#view');
	var $control = jQuery('#control');

    var fieldMap =   [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
    fieldMap.push(    [1,0,2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
    fieldMap.push(    [1,0,2,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
    fieldMap.push(    [1,0,3,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
    fieldMap.push(    [1,0,4,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
    fieldMap.push(    [1,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1]);
    fieldMap.push(    [1,1,5,1,1,1,1,1,5,5,8,0,7,0,8,0,7,0,8,0,5,5,1]);
    fieldMap.push(    [1,4,5,0,1,1,1,1,5,1,0,0,0,0,0,0,0,0,0,0,1,5,1]);
    fieldMap.push(    [1,3,5,0,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,5,1]);
    fieldMap.push(    [1,2,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,4,1]);
    fieldMap.push(    [1,0,5,0,5,0,1,0,5,0,1,1,1,1,1,1,1,1,1,1,1,3,1]);
    fieldMap.push(    [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,2,1]);
    fieldMap.push(    [1,1,1,0,5,0,5,0,5,0,1,1,1,1,1,0,0,0,0,0,0,0,1]);
    fieldMap.push(    [1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1]);

    var fieldDetails = {
        0 : { 'texture':$('wall'), 'height':0, 'wallRGB': [222,1,1], 'floorRGB': [200, 100, 100] },
        1 : { 'texture':$('wall'), 'height':1, 'editorColor':'#000', 'editorName':'solid wall', 'wallRGB': [150,100,50], 'floorRGB': [100, 100, 100] },
        2 : { 'texture':$('wall'), 'height':0.1, 'editorColor':'#ddd', 'editorName':'open', 'wallRGB': [200,200,200], 'floorRGB': [200, 180, 150] },
        3 : { 'texture':$('wall'), 'height':0.2, 'editorColor':'#bbb', 'editorName':'low wall', 'wallRGB': [100,50,1], 'floorRGB': [150, 200, 255] },
        4 : { 'texture':$('wall'), 'height':0.3, 'editorColor':'#999', 'editorName':'medium wall', 'wallRGB': [100,50,1], 'floorRGB': [150, 200, 255] },
        5 : { 'texture':$('wall'), 'height':0.4, 'editorColor':'#777', 'editorName':'high wall', 'wallRGB': [100,50,1], 'floorRGB': [150, 200, 190] },
        6 : { 'texture':$('wall'), 'height':0.3, 'minHeight': 0.2, 'maxHeight': 0.4, 'heightDirection': 0.01, 'editorColor':'#966', 'editorName':'low moving wall', 'wallRGB': [100,50,1], 'floorRGB': [150, 200, 255] },
        7 : { 'texture':$('wall'), 'height':0.4, 'minHeight': 0.4, 'maxHeight': 0.8, 'heightDirection': 0.01, 'editorColor':'#933', 'editorName':'medium moving wall', 'wallRGB': [100,50,1], 'floorRGB': [150, 200, 255] },
        8 : { 'texture':$('wall'), 'height':0.8, 'minHeight': 0.4, 'maxHeight': 0.8, 'heightDirection': -0.01, 'editorColor':'#339', 'editorName':'medium moving wall (opposite)', 'wallRGB': [100,50,1], 'floorRGB': [150, 200, 255] }
    };

    var blockSize = 64;
    
    // beware, sliceStep is a binary shift number
    // 1 == 2, 2 == 4, 3 == 8, 4 == 16 etcetera
    var sliceStep = 2;

    var fieldObject = new Field();
    fieldObject.fieldMap = fieldMap;
    fieldObject.fieldDetails= fieldDetails;
    fieldObject.blockSize = blockSize;
    
    var $grid = jQuery('#grid');
    var y = 0;
    for (y = 0; y < fieldObject.fieldMap.length; y++) {
    	for (x = 0; x < fieldObject.fieldMap[y].length; x++) {
    		var squareColor = fieldObject.fieldDetails[ fieldObject.fieldMap[y][x] ]['editorColor'];
    		$grid.append('<div id="square-'+x+'-'+y+'" class="square" style="background-color: '+squareColor+';"></div>');
    	}
		$grid.append('<div style="clear: left;"></div>');

    }
    
    var $menu = jQuery('#menu');
    var menuItem = undefined;
    for (menuItem in fieldObject.fieldDetails) {
		var name = fieldObject.fieldDetails[ menuItem ]['editorName'];
		var color = fieldObject.fieldDetails[ menuItem ]['editorColor'];
		$menu.append('<div id="menu-item-'+menuItem+'" class="menu-item"><div class="menu-item-icon" style="background-color: '+color+';"></div><span>'+name+'</span></div>');
    }
    
    var selectedItem = 1;
    jQuery('.menu-item').click( function() {
    	jQuery('.menu-item').css('border', '1px solid #fff');
    	jQuery(this).css('border', '1px solid #f00');
    	
    	selectedItem = parseInt( jQuery(this).attr('id').split('-')[2] );
    });
    
    var clicked = false;
    jQuery(document).mousedown(function() { clicked = true });
    jQuery(document).mouseup(function() { clicked = false });
    jQuery('.square').mousemove( function() {
    	if (clicked) {
			var x = parseInt( $(this).attr('id').split('-')[1] );
			var y = parseInt( $(this).attr('id').split('-')[2] );
		
			var color = fieldObject.fieldDetails[ selectedItem ]['editorColor'];
		    jQuery(this).css('background-color', color);
		    fieldObject.fieldMap[y][x] = selectedItem;
		    
		    var newLevelCode = '';
		    		    
		    var i = 0;
		    for (i = 0; i < fieldObject.fieldMap.length; i++) {
		    	newLevelCode += btoa(fieldObject.fieldMap[i]) + '|';
		    }
		    newLevelCode = newLevelCode.substring(0, newLevelCode.length-1);
		    
		    jQuery('#level-code').val(newLevelCode);
		}
    });
    jQuery('.square').mousedown( function() {
		var x = parseInt( $(this).attr('id').split('-')[1] );
		var y = parseInt( $(this).attr('id').split('-')[2] );
	
		var color = fieldObject.fieldDetails[ selectedItem ]['editorColor'];
	    jQuery(this).css('background-color', color);
	    fieldObject.fieldMap[y][x] = selectedItem;
	    
	    var newLevelCode = '';
	    		    
	    var i = 0;
	    for (i = 0; i < fieldObject.fieldMap.length; i++) {
	    	newLevelCode += btoa(fieldObject.fieldMap[i]) + '|';
	    }
	    newLevelCode = newLevelCode.substring(0, newLevelCode.length-1);
	    
	    jQuery('#level-code').val(newLevelCode);
    });    
    jQuery('#level-code').change(function() {
    	var codes = jQuery(this).val().split('|');
    	
    	var newFieldMap = [];
    	
    	var replaceMap = true;
    	
    	var i = 0;
    	for (i = 0; i < codes.length; i++) {
    		try {
    			var row = atob(codes[i]).split(',');
    		} catch(e) {
    			replaceMap = false;
    			break;
    		}
    		
    		var j = 0;
    		for (j = 0; j < row.length; j++) {
    			row[j] = parseInt( row[j] );
    		}
    		
    		if (row.length > 0) {
    			newFieldMap.push(row);
    		}
    	}
    	
    	if (replaceMap) {
    		//console.log(newFieldMap.length);
    		fieldObject.fieldMap = newFieldMap;
    		
    		for (j = 0; j < newFieldMap.length; j++) {
    			for (i = 0; i < newFieldMap[j].length; i++) {
    				var squareColor = fieldObject.fieldDetails[ newFieldMap[j][i] ]['editorColor'];
    				var id = '#square-'+i+'-'+j;
    				//console.log(id + ': ' + squareColor);
    				jQuery(id).css('background', squareColor);
    			}
    		}
    	}
    });

	var startIndexX = 2;
	var startIndexY = 1;

    var cameraObject = new Camera(fieldObject);
    cameraObject.setIndexX( startIndexX );
    cameraObject.setIndexY( startIndexY );
    cameraObject.eyeHeightOffset = 0.25;
    cameraObject.eyeHeight = fieldDetails[ fieldMap[ startIndexY ][ startIndexX ] ]['height'] + cameraObject.eyeHeightOffset;
    cameraObject.rotationRadians = 0.5*Math.PI;
    cameraObject.metadata = {'health':100};

    var raycasterObject = new Raycaster();
    raycasterObject.viewPixelWidth = parseInt($view.attr('width'));
    raycasterObject.viewPixelHeight = parseInt($view.attr('height'));
    raycasterObject.sliceStep = sliceStep;
    raycasterObject.fieldOfVisionRadians = 0.35*Math.PI;
    raycasterObject.init(fieldObject);

    var light1 = new Light(fieldObject);
    light1.setIndexX(2);
    light1.setIndexY(4);
    light1.range = 7;
    //light1.color = [0,122,122];

    var light2 = new Light(fieldObject);
    light2.setIndexX(2);
    light2.setIndexY(10);
    light2.range = 7;
    //light1.color = [0,122,122];
    light2.addWaypoint(2, 8);
    light2.addWaypoint(2, 10);
    light2.addWaypoint(4, 10);
    light2.addWaypoint(4, 12);
    light2.addWaypoint(8, 12);
    light2.addWaypoint(8, 8);

    var light3 = new Light(fieldObject);
    light3.setIndexX(10);
    light3.setIndexY(5);
    light3.range = 7;
    //light1.color = [0,122,122];
    light3.addWaypoint(10, 5);
    light3.addWaypoint(19, 5);

    var light4 = new Light(fieldObject);
    light4.setIndexX(19);
    light4.setIndexY(7);
    light4.range = 7;
    //light1.color = [0,122,122];
    light4.addWaypoint(19, 7);
    light4.addWaypoint(10, 7);


    var ghost1 = new EnemySprite(fieldObject);
    ghost1.setIndexX(13);
    ghost1.setIndexY(2);
    ghost1.image = $('ghost');
    ghost1.type = 'enemy';
    ghost1.metadata = {'activationRange':3*blockSize, 'health':100, 'speed':5, 'shootChance':0.1, 'shotDamage':5, 'minimapColor':'#ff0000'};
    
    var ghost2 = new EnemySprite(fieldObject);
    ghost2.setIndexX(7);
    ghost2.setIndexY(10);
    ghost2.image = $('ghost');
    ghost2.type = 'enemy';
    ghost2.metadata = {'activationRange':3*blockSize, 'health':100, 'speed':5, 'shootChance':0.1, 'shotDamage':5, 'minimapColor':'#ff0000'};
    
    var portal = new PortalSprite(fieldObject);
    portal.setIndexX(2);
    portal.setIndexY(10);
    portal.image = $('portal');
    portal.type = 'portal';
    portal.metadata = {'objectiveNumber':4, 'toX':21*blockSize, 'toY':2*blockSize, 'toAngle':Math.PI, 'range':0.5*blockSize, 'minimapColor':'#0000ff'};
    
    var medkit1 = new ItemSprite(fieldObject);
    medkit1.setIndexX(7);
    medkit1.setIndexY(11);
    medkit1.image = $('health_item');
    medkit1.type = 'item';
    medkit1.metadata = {'health':50, 'pickedUp':false, 'range':0.5*blockSize, 'minimapColor':'#00ff00', 'minimapColor':'#00ff00'};
    
    var npc1 = new NpcSprite(fieldObject);
    npc1.setIndexX(19);
    npc1.setIndexY(2);
    npc1.image = $('ghost_npc');
    npc1.type = 'npc';
    npc1.metadata = {'range':blockSize, 'color':'rgba(170,130,240,0.65)', 'backgroundColor':'rgba(120,180,180,0.2)', 'message':'Thank you for      playing!', 'minimapColor':'#ffffff'};
    
    var npc2 = new NpcSprite(fieldObject);
    npc2.setIndexX(18);
    npc2.setIndexY(12);
    npc2.image = null;
    npc2.type = 'npc';
    npc2.metadata = {'range':blockSize, 'color':'rgba(170,130,240,0.65)', 'backgroundColor':'rgba(120,180,180,0.2)', 'message':'Welcome to the      ghosthunt demo!'};
    
    var npc3 = new NpcSprite(fieldObject);
    npc3.setIndexX(17);
    npc3.setIndexY(10);
    npc3.image = null;
    npc3.type = 'npc';
    npc3.metadata = {'range':blockSize, 'color':'rgba(170,130,240,0.65)', 'backgroundColor':'rgba(120,180,180,0.2)', 'message':'Go to your right   and find the exit portal!'};
    
    var tree = new NpcSprite(fieldObject);
    tree.setIndexX(16);
    tree.setIndexY(5);
    tree.image = $('tree');
    tree.type = 'object';
    tree.metadata = {'minimapColor':'#555555'};
    
    var kuerbis = new EnemySprite(fieldObject);
    kuerbis.setIndexX(8);
    kuerbis.setIndexY(5);
    kuerbis.image = $('kuerbis');
    kuerbis.type = 'object';
    kuerbis.metadata = {};

    var gravestone2 = new Sprite(fieldObject);
    gravestone2.setIndexX(5);
    gravestone2.setIndexY(6);
    gravestone2.image = $('gravestone2');
    gravestone2.type = 'object';
    gravestone2.metadata = {'minimapColor':'#555555'};
    
    var gravestone3 = new Sprite(fieldObject);
    gravestone3.setIndexX(7);
    gravestone3.setIndexY(6);
    gravestone3.image = $('gravestone3');
    gravestone3.type = 'object';
    gravestone3.metadata = {'minimapColor':'#555555'};
    
    var gravestone4 = new Sprite(fieldObject);
    gravestone4.setIndexX(6);
    gravestone4.setIndexY(6);
    gravestone4.image = $('gravestone4');
    gravestone4.type = 'object';
    gravestone4.metadata = {'minimapColor':'#555555'};
  
    var gravestone6 = new Sprite(fieldObject);
    gravestone6.setIndexX(5);
    gravestone6.setIndexY(5);
    gravestone6.image = $('gravestone6');
    gravestone6.type = 'object';
    gravestone6.metadata = {'minimapColor':'#555555'};
   
    var gravestone7 = new Sprite(fieldObject);
    gravestone7.setIndexX(6);
    gravestone7.setIndexY(5);
    gravestone7.image = $('gravestone7');
    gravestone7.type = 'object';
    gravestone7.metadata = {'minimapColor':'#555555'};
   
    var gravestone8 = new Sprite(fieldObject);
    gravestone8.setIndexX(7);
    gravestone8.setIndexY(5);
    gravestone8.image = $('gravestone8');
    gravestone8.type = 'object';
    gravestone8.metadata = {'minimapColor':'#555555'};
  
    var key_red = new ItemSprite(fieldObject);
    key_red.setIndexX(12);
    key_red.setIndexY(2);
    key_red.image = $('key_red');
    key_red.type = 'item';
    key_red.metadata = {'keyId':'key_red', 'objectiveNumber':1, 'pickedUp':false, 'range':0.5*blockSize, 'minimapColor':'#00ff00'};
    
    var key_green = new ItemSprite(fieldObject);
    key_green.setIndexX(8);
    key_green.setIndexY(8);
    key_green.image = $('key_green');
    key_green.type = 'item';
    key_green.metadata = {'keyId':'key_green', 'objectiveNumber':3, 'pickedUp':false, 'range':0.5*blockSize, 'minimapColor':'#00ff00'};
    
    var key_blue = new ItemSprite(fieldObject);
    key_blue.setIndexX(13);
    key_blue.setIndexY(10);
    key_blue.image = $('key_blue');
    key_blue.type = 'item';
    key_blue.metadata = {'keyId':'key_blue', 'objectiveNumber':2, 'pickedUp':false, 'range':0.5*blockSize, 'minimapColor':'#00ff00'};

    var drawObject = new Draw();
    drawObject.init(fieldObject, raycasterObject);
    drawObject.sliceStep = sliceStep;
    drawObject.floorColor = 'rgb(0,0,35)';
    drawObject.lightArray = [/*light1,*/ light2, light3, light4];
    drawObject.spriteArray = [kuerbis, gravestone2,gravestone3,gravestone4,gravestone6,gravestone7,gravestone8, tree, portal, ghost1, ghost2, npc1, npc2, npc3, key_red, key_green, key_blue];
    //drawObject.spriteArray = [medkit1];

    game = new Game();
    //game.minimapContext = minimap.getContext('2d');
    game.viewContext = view; //document.getElementById('view').getContext('2d');
    game.fieldObject = fieldObject;
    game.cameraObject = cameraObject;
    game.raycasterObject = raycasterObject;
    game.drawObject = drawObject;

/*
    var imageSlice = newCanvas.getImageData(10, 0, 1, 64);

    var newImage = game.viewContext.createImageData(1, 200);

    var index = 64 / (newImage.data.length);
    for (var i=0; i < newImage.data.length; i += 4) {
        newImage.data[i] = imageSlice.data[Math.floor(index*i)*4];
        newImage.data[i+1] = imageSlice.data[Math.floor(index*i)*4+1];
        newImage.data[i+2] = imageSlice.data[Math.floor(index*i)*4+2];
        newImage.data[i+3] = imageSlice.data[Math.floor(index*i)*4+3];
    }

    game.viewContext.fillRect(10, 10, 5, 100);
    game.viewContext.putImageData(newImage, 20, 20);
    game.viewContext.putImageData(imageSlice, 21, 20);
*/
	document.onkeydown = function(e)
	{
		if (!e) {
			e = window.event;
		}
		
		var keyCode = e.keyCode || e.which;
		//console.log(keyCode);
      	var arrow = {left: 37, up: 38, right: 39, down: 40 };
      	var arrow2 = {left: 65, up: 87, right: 68, down: 83 };
      	
	    if (keyCode == arrow.up || keyCode == arrow2.up) {
	        game.cameraObject.moveUpDown = "up";
	    }
	    if (keyCode == arrow.down || keyCode == arrow2.down) {
	        game.cameraObject.moveUpDown = "down";
	    }
	    if (keyCode == arrow.left || keyCode == arrow2.left) {
	        game.cameraObject.moveLeftRight = "left";
	    }
	    if (keyCode == arrow.right || keyCode == arrow2.right) {
	        game.cameraObject.moveLeftRight = "right";
	    }
	    if (keyCode == 70) {
	        $('player-attack').play();
	        game.drawObject.shootSprite(game.cameraObject);
	    }
	}
	
	document.onkeyup = function(e)
	{
		if (!e) {
			e = window.event;
		}
		
		var keyCode = e.keyCode || e.which;
      	var arrow = {left: 37, up: 38, right: 39, down: 40 };
      	var arrow2 = {left: 65, up: 87, right: 68, down: 83 };
	    
	    if (keyCode == arrow.up || keyCode == arrow.down || keyCode == arrow2.up || keyCode == arrow2.down) {
	        game.cameraObject.moveUpDown = "";
	    }
	    if (keyCode == arrow.left || keyCode == arrow.right || keyCode == arrow2.left || keyCode == arrow2.right) {
	        game.cameraObject.moveLeftRight = "";
	    }
	}

	var controlWidth = parseInt( $control.css('width') );
	var controlLeft = controlWidth / 4;
	var controlRight = 3 * controlLeft;

	var controlHeight = parseInt( $control.css('height') );
	var controlUp = controlHeight / 4 * 3;

	$control.on('mousedown', function(event) {
		var x = event.pageX - this.offsetLeft;
		//var y = event.pageY - this.offsetTop;
		
		if (x < controlLeft) {
	        game.cameraObject.moveLeftRight = "left";
		} else if (x > controlRight) {
	        game.cameraObject.moveLeftRight = "right";
		} else {
	        game.cameraObject.moveUpDown = "up";
		}
	});
	$control.on('touchstart', function(event) {
		var x = event.originalEvent.touches[0].pageX - this.offsetLeft;
		//var y = event.pageY - this.offsetTop;
		
		if (x < controlLeft) {
	        game.cameraObject.moveLeftRight = "left";
		} else if (x > controlRight) {
	        game.cameraObject.moveLeftRight = "right";
		} else {
	        game.cameraObject.moveUpDown = "up";
		}
	});

	$control.on('mouseup touchend', function(event) {
        game.cameraObject.moveLeftRight = "";
        game.cameraObject.moveUpDown = "";
	});

	var frameRatePerSecond = 20;
    window.setInterval('cycle()', 1000 / frameRatePerSecond);
    //cycle();
    
});

var frameRatePerSecond = 20;
var frame = 0;
var time = 0;
function cycle()
{
    var timeStart = new Date();
    game.cycle();
    var timeEnd = new Date();
    time += (timeEnd.getTime() - timeStart.getTime());
    frame += 1;

    if (frame % 10 == 0) {
        //myLog('fps: ' + (frame / (time/1000)));
        //console.log('fps: ' + (frame / (time/1000)));
    }
}
/*
document.onkeydown = function(e)
{
    if (e.keyCode == 87) {
        game.cameraObject.moveUpDown = "up";
    }
    if (e.keyCode == 83) {
        game.cameraObject.moveUpDown = "down";
    }
    if (e.keyCode == 65) {
        game.cameraObject.moveLeftRight = "left";
    }
    if (e.keyCode == 68) {
        game.cameraObject.moveLeftRight = "right";
    }
    if (e.keyCode == 70) {
        $('player-attack').play();
        game.drawObject.shootSprite(game.cameraObject);
    }
}

document.onkeyup = function(e)
{
    if (e.keyCode == 87 || e.keyCode == 83) {
        game.cameraObject.moveUpDown = "";
    }
    if (e.keyCode == 65 || e.keyCode == 68) {
        game.cameraObject.moveLeftRight = "";
    }
}

jQuery(function() {

});
*/
