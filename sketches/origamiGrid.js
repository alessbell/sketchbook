const canvasSketch = require("canvas-sketch");
const { pathsToSVG } = require("canvas-sketch-util/penplot");

const COLORS = [
  "#914E72",
  "#00A95C",
  "#3255A4",
  "#F15060",
  "#00838A",
  "#407060",
  "#FF665E",
  "#FFE800",
  "#FF6C2F",
  "#FF48B0",
  "#88898A",
  "#AC936E",
  "#E45D50",
  "#FF7477",
  "#62A8E5",
  "#435060",
  "#B8C7C4",
  "#A5AAA8",
  "#70747C",
  "#5F8289",
  "#5E695E",
  "#00AA93",
  "#19975D",
  "#397E58",
  "#516E5A",
  "#68724D",
  "#169B62",
  "#2F6165",
  "#6C5D80",
  "#F65058",
  "#E3ED55",
  "#FFB511",
  "#FF6F4C",
  "#B49F29",
  "#F2CDCF",
  "#E6B5C9",
  "#928D88",
  "#FF8E91",
  "#5EC8E5",
  "#82D8D5",
  "#FFE900",
  "#FF4C65",
];

const lines = [];

const settings = {
  dimensions: [11, 14],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in",
};

// function to generate a random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;

const sketch = (context) => {
  let marginBetweenElements = 0.075;
  let elementWidth = 0.65;
  let elementHeight = 0.65;
  let columns = 10;
  let rows = 14;

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
      if (r >= 1) {
        angle = random(-r, r); // introduce a random rotation
        move = random(0, r * 0.03); // introduce a random movement
      }
      o[r].push({ angle, move });
    }
  }

  return ({ context, width, height, units }) => {
    // white background
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    let posX = marginPageLeft;
    let posY = marginPageTop;

    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < columns; i++) {
        if (i % 2) {
          drawSquare(
            context,
            posX,
            posY + o[r][i].move,
            elementWidth,
            o[r][i].angle
          );
        } else {
          drawTriangle(
            context,
            posX,
            posY + o[r][i].move,
            elementWidth,
            o[r][i].angle
          );
        }
        posX = posX + elementWidth + marginBetweenElements;
      }
      posX = marginPageLeft;
      posY = posY + elementHeight + marginBetweenElements;
    }

    return [
      context.canvas,
      {
        data: pathsToSVG(lines, {
          width,
          height,
          units,
        }),
        extension: ".svg",
      },
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

  function drawTriangle(context, cx, cy, width, angle) {
    // calculate rotated coordinates
    console.log(angle);
    let xy1 = rotate(cx, cy, cx, cy, angle);
    let xy2 = rotate(cx, cy, cx + width, cy, angle);
    let xy3 = rotate(cx, cy, cx + width, cy + width, angle);
    // let xy4 = rotate(cx, cy, cx, cy + width, angle);

    context.beginPath();
    context.strokeStyle = "blue";
    context.lineWidth = 0.05;
    context.lineCap = "round";
    context.lineJoin = "round";

    // draw square on context
    context.moveTo(...xy1);
    context.lineTo(...xy2);
    context.lineTo(...xy3);
    // context.lineTo(...xy4);
    context.lineTo(...xy1);
    context.stroke();

    // draw square for svg polylines
    lines.push([xy1, xy2]);
    lines.push([xy2, xy3]);
    // lines.push([xy3, xy4]);
    // lines.push([xy4, xy1]);
  }

  // draw a square in a single line
  // and rotate it if needed
  function drawSquare(context, cx, cy, width, angle) {
    // calculate rotated coordinates
    console.log(angle);
    let xy1 = rotate(cx, cy, cx, cy, angle);
    let xy2 = rotate(cx, cy, cx + width, cy, angle);
    let xy3 = rotate(cx, cy, cx + width, cy + width, angle);
    let xy4 = rotate(cx, cy, cx, cy + width, angle);

    context.beginPath();
    context.strokeStyle = "blue";
    context.lineWidth = 0.05;
    context.lineCap = "round";
    context.lineJoin = "round";

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
