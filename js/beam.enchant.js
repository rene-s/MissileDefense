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
   * @param {Number} lineWidth Optional line width
   * @return void
   */
  draw: function (color, lineWidth) {
    this.setLine({x: this.lastX, y: this.lastY}, {x: this.x, y: this.y}, color, lineWidth);
  },

  /**
   * get bounding box
   *
   * @returns {{x1: number, y1: number, x2: number, y2: number}}
   */
  getBoundingBox: function () {
    return {x1: this.x - 5, y1: this.y - 5, x2: this.x + 5, y2: this.y + 5};
  },

  /**
   * check intersection with entity
   *
   * @param {enchant.Entity} entity Entity to detect intersection with
   * @returns {boolean}
   */
  intersect: function (entity) {
    var boundingBox = this.getBoundingBox(); // bounding box of beam
    var entityBoundingBox = {x1: entity.x, y1: entity.y, x2: entity.x + entity.width, y2: entity.y + entity.height};

    return (boundingBox.x1 < entityBoundingBox.x2 && boundingBox.y1 < entityBoundingBox.y2)
      && (boundingBox.y2 > entityBoundingBox.y1 && boundingBox.x2 > entityBoundingBox.x1);
  }
});