/**
 * A Canvas2D + SVG Pen Plotter example of "Cubic Disarray"
 * (a recreation of an artwork by Georg Nees in 1968-71).
 *
 * @author Stephane Tombeur (https://github.com/stombeur)
 */

const canvasSketch = require("canvas-sketch");
const { polylinesToSVG } = require("canvas-sketch-util/penplot");
const pickRandom = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const lines = [];

const settings = {
  dimensions: "A4",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm"
};

let columns = 8;
let rows = 14;

// function to generate a random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;
const palette = pickRandom.pick(palettes);

const generatePosition = position => {
  const [row, col] = position;
  return row * columns + col;
};

var size = columns * rows;
var rainbow = new Array(size);

for (var i = 0; i < size; i++) {
  var red = sin_to_hex(i, (0 * Math.PI * 2) / 3); // 0   deg
  var blue = sin_to_hex(i, (1 * Math.PI * 2) / 3); // 120 deg
  var green = sin_to_hex(i, (2 * Math.PI * 2) / 3); // 240 deg

  rainbow[i] = "#" + red + green + blue;
}

function sin_to_hex(i, phase = 120) {
  var sin = Math.sin((Math.PI / size) * 2 * i + phase);
  var int = Math.floor(sin * 127) + 128;
  var hex = int.toString(16);

  return hex.length === 1 ? "0" + hex : hex;
}

const sketch = context => {
  let marginBetweenElements = 0.05;
  let elementWidth = 1.5;
  let elementHeight = 1.5;

  // position drawing in center of page
  let drawingWidth =
    columns * (elementWidth + marginBetweenElements) - marginBetweenElements;
  let drawingHeight =
    rows * (elementHeight + marginBetweenElements) - marginBetweenElements;
  let marginPageLeft = (context.width - drawingWidth) / 2;
  let marginPageTop = (context.height - drawingHeight) / 2;

  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let angle = 0;
      let move = 0;
      if (r >= 2) {
        angle = random(-r, r); // introduce a random rotation
        move = random(0, r * 0.1); // introduce a random movement
      }
      o[r].push({ angle, move });
    }
  }

  return ({ context, width, height, units }) => {
    // white background
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    let posX = marginPageLeft;
    let posY = marginPageTop;

    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < columns; i++) {
        drawSquare(
          context,
          posX,
          posY + o[r][i].move,
          elementWidth,
          o[r][i].angle,
          [r, i]
        );
        posX = posX + elementWidth + marginBetweenElements;
      }
      posX = marginPageLeft;
      posY = posY + elementHeight + marginBetweenElements;
    }

    return [
      context.canvas,
      {
        data: polylinesToSVG(lines, {
          width,
          height,
          units
        }),
        extension: ".svg"
      }
    ];
  };

  // rotate [x,y] around the center [cx, cy] with angle in degrees
  // and y-axis moving downward
  function rotate(cx, cy, x, y, angle) {
    if (angle === 0) return [x, y];

    var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (x - cx) - sin * (y - cy) + cx,
      ny = cos * (y - cy) + sin * (x - cx) + cy;
    return [nx, ny];
  }

  // draw a square in a single line
  // and rotate it if needed
  function drawSquare(context, cx, cy, width, angle, position) {
    // console.log(rainbow);
    // calculate rotated coordinates
    let xy1 = rotate(cx, cy, cx, cy, angle);
    let xy2 = rotate(cx, cy, cx + width, cy, angle);
    let xy3 = rotate(cx, cy, cx + width, cy + width, angle);
    let xy4 = rotate(cx, cy, cx, cy + width, angle);

    const getPosition = generatePosition(position);

    context.beginPath();
    // context.strokeStyle = palette[Math.floor(random(1, 4))];
    context.strokeStyle = rainbow[getPosition];
    context.lineWidth = 0.04;
    context.lineCap = "square";
    context.lineJoin = "miter";

    // draw square on context
    context.moveTo(...xy1);
    context.lineTo(...xy2);
    context.lineTo(...xy3);
    context.lineTo(...xy4);
    context.lineTo(...xy1);
    context.stroke();

    // draw square for svg polylines
    lines.push([xy1, xy2]);
    lines.push([xy2, xy3]);
    lines.push([xy3, xy4]);
    lines.push([xy4, xy1]);
  }
};

canvasSketch(sketch, settings);
