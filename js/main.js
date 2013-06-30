enchant();

beams = [];

window.onload = function () {
  console.log(window.innerWidth, window.innerHeight);
  var game = new Core(window.innerWidth, window.innerHeight), middle = window.innerHeight / 2;
  game.fps = 30;
  game.preload("img/chara1.png", "snd/boing_spring.wav");
  game.onload = function () {
    var bear = new Sprite(32, 32), lastOffs = 0, offs = 0;

    bear.image = game.assets["img/chara1.png"];
    bear.x = 0;
    bear.y = window.innerHeight / 2;
    bear.frame = 5;
    game.rootScene.addChild(bear);

    var beam = new Beam(window.innerWidth, window.innerHeight);

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
      this.x += 1;

      if (this.x > window.innerWidth) {
        this.x = 0;
      }

      lastOffs = offs;
      offs = Math.sin(0.1 * this.x);

      this.y = middle + offs * 40;

      if ((lastOffs < 0 && lastOffs < offs) || (lastOffs > 0 && lastOffs > offs)) {
        game.assets['snd/boing_spring.wav'].play();
      }

      this.frame = this.age % 2 + 6;
    };

    /**
     * move one beam
     * @param {Beam} beam Beam instance
     * @param {Array} addBeams Array with beams to be added
     * @param {Boolean} canAddBeams Determines if beams can be added or not
     * @return {void}
     */
    var moveBeam = function(beam, addBeams, canAddBeams) {
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

      beam.draw([beam.x % 255, beam.y % 255, (beam.x + beam.y) % 255, 255]);

      if (canAddBeams && (beam.x >= window.innerWidth || beam.x <= 0 || beam.y >= window.innerHeight || beam.y <= 0)) {
        addBeams.push(splitBeam(beams, beam));
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
     * Create copy of a beam instance
     *
     * @param beams
     * @param beam
     * @returns {Beam}
     */
    var splitBeam = function (beams, beam) { // @todo Move this function into Beam.copy()
      var splittedBeam = new Beam(beam.width, beam.height);

      splittedBeam.x = beam.x;
      splittedBeam.y = beam.y;

      splittedBeam.stepX = beam.stepX + 1;
      splittedBeam.stepY = beam.stepY + 2;

      console.log(splittedBeam);
      return splittedBeam;
    };

    bear.addEventListener("enterframe", moveBear);
    bear.addEventListener("enterframe", moveBeams);

    bear.addEventListener("touchstart", function () {
      game.rootScene.removeChild(bear);
    });
  };
  game.start();
};