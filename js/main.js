enchant();

beams = [];

window.onload = function(){	
	console.log(window.innerWidth, window.innerHeight);
    var game = new Core(window.innerWidth, window.innerHeight), middle = window.innerHeight/2;
    game.fps = 60;
    game.preload("img/chara1.png","snd/boing_spring.wav");
    game.onload = function(){
        var bear = new Sprite(32, 32), lastOffs = 0, offs = 0;
        bear.image = game.assets["img/chara1.png"];
        bear.x = 0;
        bear.y = window.innerHeight/2;
        bear.frame = 5;
        game.rootScene.addChild(bear);
		
		var beam = new Beam(window.innerWidth, window.innerHeight);
		beam.stepX = 4;
		beam.stepY = 6;
		game.rootScene.addChild(beam);
		
		beams.push(beam);
	
		/**
		 * Test
		 */
		var moveBear = function(){
            this.x+=1;
		
			if(this.x>window.innerWidth) { this.x = 0; }
		
			lastOffs = offs;
			offs = Math.sin(0.1*this.x);
		
			this.y = middle+offs*40;
			
			if((lastOffs<0 && lastOffs< offs) || (lastOffs>0 && lastOffs > offs)) {
				game.assets['snd/boing_spring.wav'].play();
			}
			
            this.frame = this.age % 2 + 6;
        };
		
		var moveBeam = function() {
			
			var addBeams = [], canAddBeams = beams.length < 10;
				
			for (var i = 0; i < beams.length; i++)
			{
				beams[i].lastX = beams[i].x;
				beams[i].lastY = beams[i].y;
				
				beams[i].x = beams[i].x+beams[i].stepX;
				beams[i].y = beams[i].y+beams[i].stepY;
				
				if (beams[i].x >= window.innerWidth)
				{
					beams[i].stepX *= -1;
					beams[i].x = window.innerWidth;
				}
				
				if (beams[i].x <= 0)
				{
					beams[i].stepX *= -1;
					beams[i].x = 0;
				}
				
				if (beams[i].y >= window.innerHeight)
				{
					beams[i].stepY *= -1;
					beams[i].y = window.innerHeight;
				}
				
				if (beams[i].y <= 0)
				{
					beams[i].stepY *= -1;
					beams[i].y = 0;
				}
				
				beams[i].draw([beams[i].x % 255, beams[i].y % 255, (beams[i].x + beams[i].y) % 255, 255]);
				
				if (canAddBeams && (beams[i].x >= window.innerWidth || beams[i].x <= 0 || beams[i].y >= window.innerHeight || beams[i].y <= 0))
				{
					addBeams.push(splitBeam(beams, beams[i]));
				}
			}
			
			for(var j = 0; j<addBeams.length; j++) {
				beams.push(addBeams[j]);
				game.rootScene.addChild(addBeams[j]);
			}
		};
		
		var splitBeam = function(beams, beam) {
			var splittedBeam = new Beam(beam.width, beam.height);
			
			splittedBeam.x = beam.x;
			splittedBeam.y = beam.y;
			
			splittedBeam.stepX = beam.stepX + 1;
			splittedBeam.stepY = beam.stepY + 2;
			
			console.log(splittedBeam);
			return splittedBeam;
		};
		
        bear.addEventListener("enterframe", moveBear);
		bear.addEventListener("enterframe", moveBeam);
		
        bear.addEventListener("touchstart", function(){
            game.rootScene.removeChild(bear);
        });
    };
    game.start();
};