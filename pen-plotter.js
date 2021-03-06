/**
 * A Canvas2D + SVG Pen Plotter example of "Cubic Disarray"
 * (a recreation of an artwork by Georg Nees in 1968-71).
 *
 * @author Stephane Tombeur (https://github.com/stombeur)
 */

const canvasSketch = require("canvas-sketch");
const { polylinesToSVG } = require("canvas-sketch-util/penplot");
// const pickRandom = require("canvas-sketch-util/random");
// const palettes = require("nice-color-palettes");

const lines = [];
const tree = [
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], // 1 - 1
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0], // 2 - 3
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0], // 3 - 5
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0], // 4 - 3
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0], // 5 - 5
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // 6 - 7
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0], // 7 - 5
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // 8 - 7
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0], // 9 - 9
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // 10 - 7
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0], // 11 - 9
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 12 - 11
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 13 - 13
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], // 14 - 3
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], // 15 - 3
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0] // 16 - 3
];

const settings = {
  dimensions: [5, 7],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in"
};

let columns = 13;
let rows = 16;

// function to generate a random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;
// const palette = pickRandom.pick(palettes);

const getPosition = position => {
  const [row, col] = position;
  return row * columns + col;
};

const size = columns * rows;
const rainbow = new Array(size);

for (let i = 0; i < size; i++) {
  const red = sin_to_hex(i, (0 * Math.PI * 2) / 3); // 0   deg
  const blue = sin_to_hex(i, (1 * Math.PI * 2) / 3); // 120 deg
  const green = sin_to_hex(i, (2 * Math.PI * 2) / 3); // 240 deg

  rainbow[i] = "#" + red + green + blue;
}

function sin_to_hex(i, phase = 120) {
  const sin = Math.sin((Math.PI / size) * 2 * i + phase);
  const int = Math.floor(sin * 127) + 128;
  const hex = int.toString(16);

  return hex.length === 1 ? "0" + hex : hex;
}

const sketch = context => {
  let marginBetweenElements = 0.05;
  let elementWidth = 0.25;
  let elementHeight = 0.25;

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
        move = random(0, r * 0.025); // introduce a random movement
      }
      o[r].push({ angle, move });
    }
  }

  return ({ context, width, height, units }) => {
    // black background
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

    const radians = (Math.PI / 180) * angle,
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

    const pos = getPosition(position);
    const [x, y] = position;
    console.log(position);
    if (tree[x][y] === 0) {
      return;
    }

    context.beginPath();
    // context.strokeStyle = palette[Math.floor(random(1, 4))];
    context.strokeStyle = rainbow[pos];
    context.lineWidth = 0.01;
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
