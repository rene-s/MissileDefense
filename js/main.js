enchant();

beam = {x:0, y:0, stepX:5, stepY:5};
lastCoord = {x:0, y:0};

window.onload = function(){console.log(window);	
    var game = new Core(window.innerWidth, window.innerHeight), middle = window.innerHeight/2;
    game.fps = 30;
    game.preload("img/chara1.png","snd/boing_spring.wav");
    game.onload = function(){
        var bear = new Sprite(32, 32), lastOffs = 0, offs = 0;
        bear.image = game.assets["img/chara1.png"];
        bear.x = 0;
        bear.y = window.innerHeight/2;
        bear.frame = 5;
        game.rootScene.addChild(bear);
		
		var sky = new Surface(window.innerWidth, window.innerHeight);
		game.rootScene.addChild(sky);
	
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
			lastCoord = {x:beam.x, y:beam.y};
			
			beam.x = beam.x+beam.stepX;
			beam.y = beam.y+beam.stepY;
			
			if (beam.x > window.innerWidth || beam.x < 0)
			{
				beam.stepX *= -1;
			}
			
			if (beam.y > window.innerHeight || beam.y < 0)
			{
				beam.stepY *= -1;
			}
			
			sky.setLine(lastCoord, beam, [beam.x % 255, beam.y % 255, (beam.x + beam.y) % 255, 255]);
		};
		
        bear.addEventListener("enterframe", moveBear);
		bear.addEventListener("enterframe", moveBeam);
		
        bear.addEventListener("touchstart", function(){
            game.rootScene.removeChild(bear);
        });
    };
    game.start();
};