/**
 * makin mazes
 *
 *
 * @author Alessia Bellisario (https://github.com/alessbell)
 */

const canvasSketch = require("canvas-sketch");
const { polylinesToSVG } = require("canvas-sketch-util/penplot");
// const pickRandom = require("canvas-sketch-util/random");
// const palettes = require("nice-color-palettes");

const lines = [];

const settings = {
  dimensions: [5, 7],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in",
};

let columns = 13;
let rows = 16;

class Cell {
  constructor(row, column) {
    this.row = row;
    this.column = column;
    this.links = {}; // todo :P
    // this.north = row - 1
  }
}

class Grid {
  constructor(height = 10, width = 10) {
    this.height = height;
    this.width = width;
    this.cells = new Array(width * height)
      .fill(0)
      .map((_, i) => new Cell(Math.floor(i / height), i % width));
  }
}

// function to generate a random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;
// const palette = pickRandom.pick(palettes);

const sketch = (context) => {
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

  const { cells } = new Grid();
  console.log(cells);
  // cells[70].testMethod();

  return ({ context, width, height, units }) => {
    // black background
    // context.fillStyle = "black";
    // context.fillRect(0, 0, width, height);
    // let posX = marginPageLeft;
    // let posY = marginPageTop;
    // for (let r = 0; r < rows; r++) {
    //   for (let i = 0; i < columns; i++) {
    //     drawSquare(
    //       context,
    //       posX,
    //       posY + o[r][i].move,
    //       elementWidth,
    //       o[r][i].angle,
    //       [r, i]
    //     );
    //     posX = posX + elementWidth + marginBetweenElements;
    //   }
    //   posX = marginPageLeft;
    //   posY = posY + elementHeight + marginBetweenElements;
    // }
    // return [
    //   context.canvas,
    //   {
    //     data: polylinesToSVG(lines, {
    //       width,
    //       height,
    //       units,
    //     }),
    //     extension: ".svg",
    //   },
    // ];
  };
};

canvasSketch(sketch, settings);
