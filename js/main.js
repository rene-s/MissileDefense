enchant();

beams = [];

window.onload = function () {
  console.log(window.innerWidth, window.innerHeight);
  var game = new Core(window.innerWidth, window.innerHeight);
  var middle = {x: innerWidth / 2, y: innerHeight / 2};
  game.fps = 30;
  game.preload("img/chara1.png", "snd/boing_spring.wav", "snd/explosion.wav", "img/explosion2.png");
  game.onload = function () {
    var firstBear = new enchant.Sprite(32, 32), lastOffs = 0, offs = 0;

    firstBear.image = game.assets["img/chara1.png"];
    firstBear.x = 0;
    firstBear.y = middle.y;
    firstBear.frame = 5;
    firstBear.stepX = 2;
    game.rootScene.addChild(firstBear);

    var secondBear = new enchant.Sprite(32, 32);

    secondBear.image = game.assets["img/chara1.png"];
    secondBear.x = 100;
    secondBear.y = middle.y - 10;
    secondBear.frame = 5;
    secondBear.stepX = 1;
    game.rootScene.addChild(secondBear);

    var thirdBear = new enchant.Sprite(32, 32);

    thirdBear.image = game.assets["img/chara1.png"];
    thirdBear.x = middle.x;
    thirdBear.y = middle.y;
    thirdBear.frame = 5;
    thirdBear.stepX = 2;
    game.rootScene.addChild(thirdBear);

    var explosion = new enchant.Sprite(75, 109);

    explosion.image = game.assets["img/explosion2.png"];
    explosion.frame = 0;
    explosion.stepX = 0;

    var beam = new enchant.Beam(window.innerWidth, window.innerHeight);

    beam.stepX = 4;
    beam.stepY = 6;

    game.rootScene.addChild(beam);

    beams.push(beam);

    /**
     * Move the bear
     *
     * @return {void}
     */
    var moveBear = function () {
      this.x += this.stepX;

      if (this.x > window.innerWidth) {
        this.x = 0;
      }

      lastOffs = offs;
      offs = Math.sin(0.1 * this.x);

      this.y = middle.y + offs * 40;

      if ((lastOffs < 0 && lastOffs < offs) || (lastOffs > 0 && lastOffs > offs)) {
        game.assets['snd/boing_spring.wav'].play();
      }

      this.frame = this.age % 2 + 6;
    };

    /**
     * move one beam
     * @param {enchant.Beam} beam Beam instance
     * @param {Array} addBeams Array with beams to be added
     * @param {Boolean} canAddBeams Determines if beams can be added or not
     * @return {void}
     */
    var moveBeam = function (beam, addBeams, canAddBeams) {
      beam.lastX = beam.x;
      beam.lastY = beam.y;

      beam.x += beam.stepX;
      beam.y += beam.stepY;

      if (beam.x >= window.innerWidth) {
        beam.stepX *= -1;
        beam.x = window.innerWidth;
      } else if (beam.x <= 0) {
        beam.stepX *= -1;
        beam.x = 0;
      } else if (beam.y >= window.innerHeight) {
        beam.stepY *= -1;
        beam.y = window.innerHeight;
      } else if (beam.y <= 0) {
        beam.stepY *= -1;
        beam.y = 0;
      }

      beam.draw([beam.x % 255, beam.y % 255, (beam.x + beam.y) % 255, 255], 1);

      if (canAddBeams && (beam.x >= window.innerWidth || beam.x <= 0 || beam.y >= window.innerHeight || beam.y <= 0)) {
        addBeams.push(beam.copy());
      }
    };

    /**
     * Move beams
     *
     * @return {void}
     */
    var moveBeams = function () {

      var addBeams = [], canAddBeams = beams.length < 10;

      for (var i = 0; i < beams.length; i++) {
        moveBeam(beams[i], addBeams, canAddBeams);
      }

      for (var j = 0; j < addBeams.length; j++) {
        beams.push(addBeams[j]);
        game.rootScene.addChild(addBeams[j]);
      }
    };

    /**
     * Move beams for every frame
     */
    game.addEventListener("enterframe", moveBeams);

    /**
     * Move both bears, use same event handler for both of them.
     */
    firstBear.addEventListener("enterframe", moveBear);
    secondBear.addEventListener("enterframe", moveBear);

    /**
     * Additionally, second bear must disappear when colliding with first bear
     */
    secondBear.addEventListener("enterframe", function () {
      detectCollision(firstBear, secondBear);
    });

    /**
     * detect collision between two bears
     * @param {enchant.Sprite} bearOne
     * @param {enchant.Sprite} bearTwo
     * @return {void}
     */
    var detectCollision = function (bearOne, bearTwo) {
      if (bearTwo.intersect(bearOne)) {
        explosion.x = bearTwo.x; // show explosion where the second bear is
        explosion.y = bearTwo.y - (explosion.height / 2); // show explosion where the second bear is with slight offset

        game.assets['snd/explosion.wav'].play();

        game.rootScene.removeChild(bearTwo); // remove second bear, because it has "blown up"
        game.rootScene.addChild(explosion); // show explosion

        explosion.addEventListener("enterframe", function () {
          this.y -= 0.5;
          this.frame = this.age % 75;
        });

        setTimeout(function () { // remove explosion after 1,5 seconds
          game.rootScene.removeChild(explosion);
        }, 1500);
      }
    };

    thirdBear.addEventListener("enterframe", function () {

      console.log(this.x, this.y);
      //this.x -=10;
    });

    /**
     * Does not work, probably because beams canvasses are above bear canvas
     */
    firstBear.addEventListener("touchstart", function () {
      game.rootScene.removeChild(firstBear);
    });

    game.addEventListener(enchant.Event.LEFT_BUTTON_DOWN, function () {
      thirdBear.x -= 10;
      console.log("test");
    });

    game.addEventListener(enchant.Event.RIGHT_BUTTON_DOWN, function () {
      thirdBear.x += 10;
      console.log("test");
    });

    game.addEventListener(enchant.Event.UP_BUTTON_DOWN, function () {
      thirdBear.y -= 10;
      console.log("test");
    });

    game.addEventListener(enchant.Event.DOWN_BUTTON_DOWN, function () {
      thirdBear.y += 10;
      console.log("test");
    });
  };
  game.start();
};