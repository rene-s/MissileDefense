enchant();

beams = [];

window.onload = function () {
  console.log(window.innerWidth, window.innerHeight);
  var game = new Core(window.innerWidth, window.innerHeight);
  var middle = {x: innerWidth / 2, y: innerHeight / 2};

  game.fps = 30;
  game.preload("img/ball.png", "img/chara1.png", "snd/boing_spring.wav", "snd/explosion.wav", "img/explosion2.png");
  game.onload = function () {
    var firstBear = new enchant.Sprite(32, 32),
      lastOffs = 0,
      offs = 0,
      ball,
      balls = [];

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

    /*context.beginPath();
     context.arc(middle.x, middle.y, radius, 0, 2 * Math.PI, false);
     context.lineWidth = 2;
     context.strokeStyle = '#000000';
     context.stroke();
     */
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
     * Remove entity, show explosion, remove explosion.
     *
     * @param {enchant.Sprite|enchant.Beam} entity Bear entity
     * @return void
     */
    var explode = function (entity) {
      explosion.x = entity.x; // show explosion where the second bear is
      explosion.y = entity.y - (explosion.height / 2); // show explosion where the second bear is with slight offset

      game.assets['snd/explosion.wav'].clone().play(); // clone sound, then play so we can have 1+ explosions at the same time

      game.rootScene.removeChild(entity); // remove second bear, because it has "blown up"
      game.rootScene.addChild(explosion); // show explosion instead

      // we re-use the explosion object for two explosions in quick succession.
      // for that, we always reset attributes frame and age.
      explosion.frame = explosion.age = 0;
    };

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
        [ // array with rgba color values, fake-"randomized"
          Math.randomInt(0, 255),
          Math.randomInt(0, 255),
          Math.randomInt(0, 255),
          Math.randomInt(0, 255)
        ],
        10 // lineWidth
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
      var addBeams = [],
        canAddBeams = beams.length < 30,
        deleteBeams = [],
        collPartners = balls.concat([firstBear, /*secondBear,*/ thirdBear]); // merge all possible collision "partners" into one array so we can iterate over them more easily

      for (var i = 0; i < beams.length; i++) {
        moveBeam(beams[i], addBeams, canAddBeams);

        for (var j = 0; j < collPartners.length; j++) {
          if (beams[i].intersect(collPartners[j])) {
            deleteBeams.push({i: i, o: beams[i]});
          }
        }
      }

      for (j = 0; j < deleteBeams.length; j++) {
        explode(deleteBeams[j]["o"]);
        beams.remove(deleteBeams[j]["i"]);
      }

      for (j = 0; j < addBeams.length; j++) {
        beams.push(addBeams[j]);
        game.rootScene.addChild(addBeams[j]);
      }
    };

    /**
     * Move single ball
     *
     * @param {number} i Index of ball in balls. Needed for removal of ball.
     * @param {enchant.Sprite} ball Ball to move
     */
    var moveBall = function (i, ball) {
      ball.rotate(5);
      ball.x += ball.stepX;
      ball.y += ball.stepY;

      detectCollision(firstBear, ball);
      detectCollision(secondBear, ball);
      detectCollision(thirdBear, ball);

      // remove ball from balls and from scene when it moves to of view
      if (ball.x >= window.innerWidth || ball.x <= -32 || ball.y >= window.innerHeight || ball.y <= -32) {
        game.rootScene.removeChild(ball);
        balls.remove(i);
      }
    };

    /**
     * Event Handler: Move balls
     *
     * @return {void}
     */
    var moveBalls = function () {
      for (var i = 0; i < balls.length; i++) {
        moveBall(i, balls[i]);
      }
    };

    /**
     * Event Handler: detect collision between two sprites
     *
     * @param {enchant.Sprite} projectile
     * @param {enchant.Sprite} victim
     * @return {void}
     */
    var detectCollision = function (projectile, victim) {
      // before checking for a collision, check if victim is actually still in the rootScene. If not, do not do anything.
      // @todo Remove check and remove detectionCollision eventHandler for victim on removeChild(). That's more elegant.
      if (game.rootScene.childNodes.indexOf(victim) !== -1 && victim.intersect(projectile)) {
        explode(victim);
      }
    };

    /**
     * Move beams and beams for every frame
     */
    game.addEventListener("enterframe", moveBeams);
    game.addEventListener("enterframe", moveBalls);

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
      detectCollision(thirdBear, secondBear);
      detectCollision(thirdBear, firstBear);
    });

    /**
     * Remove first bear on click
     */
    firstBear.addEventListener("touchstart", function () {
      game.rootScene.removeChild(firstBear);
    });

    game.addEventListener(enchant.Event.LEFT_BUTTON_DOWN, function () {
      thirdBear.x -= 10;
      thirdBear.rotate(-5);
      thirdBear.frame = thirdBear.age % 2 + 6;
    });

    game.addEventListener(enchant.Event.RIGHT_BUTTON_DOWN, function () {
      thirdBear.x += 10;
      thirdBear.rotate(5);
      thirdBear.frame = thirdBear.age % 2 + 6;
    });

    game.addEventListener(enchant.Event.UP_BUTTON_DOWN, function () {
      thirdBear.y -= 10;
      thirdBear.rotate(-5);
      thirdBear.frame = thirdBear.age % 2 + 6;
    });

    game.addEventListener(enchant.Event.DOWN_BUTTON_DOWN, function () {
      thirdBear.y += 10;
      thirdBear.rotate(5);
      thirdBear.frame = thirdBear.age % 2 + 6;
    });

    thirdBear.addEventListener("touchstart", function () {
      var ball = new enchant.Sprite(32, 32), randomInt = 0;

      ball.image = game.assets["img/ball.png"];
      ball.frame = 1;

      do {
        randomInt = Math.randomInt(-5, 5);
      } while (randomInt == 0);

      ball.stepX = 2 * randomInt;

      do {
        randomInt = Math.randomInt(-5, 5);
      } while (randomInt == 0);

      ball.stepY = 2 * randomInt;

      ball.x = thirdBear.x + (32 * (ball.stepX > 0 ? 1 : -1)); // place ball with offset
      ball.y = thirdBear.y + (32 * (ball.stepY > 0 ? 1 : -1));

      game.rootScene.addChild(ball);
      balls.push(ball);
    });

    /**
     * Add only 1 enterframe event handler for the explosion and not n (n=amount of explosions).
     */
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
  };
  game.start();
};