enchant();

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
	
		var enterFrameHandler = function(){
            this.x+=5;
		
			if(this.x>window.innerWidth) { this.x = 0; }
		
			lastOffs = offs;
			offs = Math.sin(0.1*this.x);
		
			this.y = middle+offs*40;
			
			if(lastOffs<0 && lastOffs< offs) {
				game.assets['snd/boing_spring.wav'].play();
			}
			
            this.frame = this.age % 2 + 6;
        };
		
        bear.addEventListener("enterframe", enterFrameHandler);

        bear.addEventListener("touchstart", function(){
            game.rootScene.removeChild(bear);
        });
    };
    game.start();
};