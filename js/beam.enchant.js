/**
 * @fileOverview
 * beam.enchant.js
 * @version 0.0 (2013/06/29)
 * @requires enchant.js v0.7.0 or later
 * @author Stefanie Schmidt/Rene Schmidt
 *
 * @description
 * beam class that inherits from enchant.Surface
 */

/**
 * Beam
 * @scope enchant.Beam.prototype
 */
enchant.Beam = enchant.Class.create(enchant.Surface, {
  /**
   * @type {int} x position of the beam
   */
  x: 0,

  /**
   * @type {int} y position of the beam
   */
  y: 0,

  /**
   * @type {int} lastX last x position of the beam
   */
  lastX: 0,

  /**
   * @type {int} last y position of the beam
   */
  lastY: 0,

  /**
   * @type {int} x step of the beam
   */
  stepX: 1,

  /**
   * @type {int} y step of the beam
   */
  stepY: 1,

  /**
   * Constructor of beam
   * @constructs
   * @param {int} width
   * @param {int} height
   */
  initialize: function (width, height) {
    enchant.Surface.call(this, width, height);
  },

  /**
   * Create copy of a beam instance
   *
   * @returns {Beam}
   */
  copy: function () {
    var copy = new enchant.Beam(this.width, this.height);

    copy.x = this.x;
    copy.y = this.y;

    copy.stepX = this.stepX + 1;
    copy.stepY = this.stepY + 2;

    return copy;
  },

  /**
   * Draw line
   *
   * @param {Array} color RGBA color array
   * @return void
   */
  draw: function (color) {
    this.setLine({x: this.lastX, y: this.lastY}, {x: this.x, y: this.y}, color);
  }
});