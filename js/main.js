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
     * Event Handler: Move the bear
     *
     * @return {void}
     */
    var moveBear = function () {
      this.x += this.stepX;

      if (this.x > window.innerWidth) {
        this.x = 0;
      }

      lastOffs = offs;

      var xDamped = 0.1 * this.x;

      offs = Math.sin(xDamped);
      this.y = middle.y + offs * 40;

      // make some effort to reduce multiple parallel playing of BOING sound. still is highly dependent on dampening factor.
      if (offs > 0.95 && lastOffs > 0.95 && lastOffs > offs && Math.cos(xDamped) < -0.12) {
        game.assets['snd/boing_spring.wav'].play();
        console.log("yo");
      }

      this.frame = this.age % 2 + 6; // advance bear sprite
    };

    /**
     * Event Handler: move one beam
     *
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

      beam.draw(
        [beam.x % 255, beam.y % 255, (beam.x + beam.y) % 255, 255], // array with rgba color values, fake-"randomized"
        1 // lineWidth
      );

      if (canAddBeams && (beam.x >= window.innerWidth || beam.x <= 0 || beam.y >= window.innerHeight || beam.y <= 0)) {
        addBeams.push(beam.copy());
      }
    };

    /**
     * Event Handler: Move beams
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
     * Event Handler: detect collision between two bears
     *
     * @param {enchant.Sprite} bearOne
     * @param {enchant.Sprite} bearTwo
     * @return {void}
     */
    var detectCollision = function (bearOne, bearTwo) {
      // before checking for a collision, check if bearTwo is actually still in the rootScene. If not, do not do anything.
      // @todo Remove check and remove detectionCollision eventHandler for bearTwo on removeChild(). That's more elegant.
      if (game.rootScene.childNodes.indexOf(bearTwo) !== -1 && bearTwo.intersect(bearOne)) {
        explosion.x = bearTwo.x; // show explosion where the second bear is
        explosion.y = bearTwo.y - (explosion.height / 2); // show explosion where the second bear is with slight offset

        game.assets['snd/explosion.wav'].clone().play(); // clone sound, then play so we can have 1+ explosions at the same time

        game.rootScene.removeChild(bearTwo); // remove second bear, because it has "blown up"
        game.rootScene.addChild(explosion); // show explosion instead

        // we re-use the explosion object for two explosions in quick succession.
        // for that, we always reset attributes frame and age.
        explosion.frame = explosion.age = 0;
        explosion.addEventListener("enterframe", function () {
          this.y -= 2; // blow "up". looks more "natural".
          // just increment until we run out of frames.
          if (this.frame < 45) {
            this.frame++;
          } else {
            // if there are no frames left, we are done. remove the sprite.
            game.rootScene.removeChild(explosion);
          }
        });
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
     * Additionally, first bear must disappear when colliding with third bear
     */
    thirdBear.addEventListener("enterframe", function () {
      detectCollision(thirdBear, secondBear); // @todo Fix "locking" bug when switching bears and colliding both.
      detectCollision(thirdBear, firstBear); // @todo Fix "locking" bug when switching bears and colliding both.
    });

    /**
     * Does not work, probably because beams canvasses are above bear canvas
     */
    /*firstBear.addEventListener("touchstart", function () {
     game.rootScene.removeChild(firstBear);
     });*/

    game.addEventListener(enchant.Event.LEFT_BUTTON_DOWN, function () {
      thirdBear.x -= 10;
      thirdBear.frame = thirdBear.age % 2 + 6;
    });

    game.addEventListener(enchant.Event.RIGHT_BUTTON_DOWN, function () {
      thirdBear.x += 10;
      thirdBear.frame = thirdBear.age % 2 + 6;
    });

    game.addEventListener(enchant.Event.UP_BUTTON_DOWN, function () {
      thirdBear.y -= 10;
      thirdBear.frame = thirdBear.age % 2 + 6;
    });

    game.addEventListener(enchant.Event.DOWN_BUTTON_DOWN, function () {
      thirdBear.y += 10;
      thirdBear.frame = thirdBear.age % 2 + 6;
    });
  };
  game.start();
};