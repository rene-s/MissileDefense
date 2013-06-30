/**
 * Draws a line from x1,y1 to x2,y2 with colors r,g,b,a
 *
 * @param {Object} startCoord Object with attributes x,y that are the start coordinate for the line
 * @param {Object} endCoord Object with attributes x,y that are the end coordinate for the line
 * @param {Array} color Array with RGBA values for the line
 * @return {void}
 */
enchant.Surface.prototype.setLine = function (startCoord, endCoord, color) {
  var ctx = this.context;

  ctx.beginPath();
  ctx.moveTo(startCoord.x + 0.5, startCoord.y + 0.5);
  ctx.lineTo(endCoord.x + 0.5, endCoord.y + 0.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(" + color + ")";
  //ctx.strokeStyle = "rgba("+r+","+g+","+b+","+a+")";
  ctx.stroke();
  ctx.closePath();
};