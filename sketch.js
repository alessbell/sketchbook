const canvasSketch = require("canvas-sketch");
const { renderPolylines } = require("canvas-sketch-util/penplot");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

random.setSeed(random.getRandomSeed());
// random.setSeed('676889');
// console.log(random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: [2000, 2000]
};

const sketch = () => {
  const colorCount = random.rangeFloor(2, 6);
  const palette = random.pick(palettes);
  // const palette = palettes[2];

  const createGrid = () => {
    const points = [];
    const count = 20;
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = x / (count - 1);
        const v = y / (count - 1);
        points.push({
          // color: palette[2],
          rotation: random.noise2D(u, v),
          position: [u, v]
        });
      }
    }
    return points;
  };

  const points = createGrid();
  const margin = 400;
  const lines = [];

  points.forEach(({ position, radius, color, rotation }) => {
    const [u, v] = position;
    const x = lerp(margin, u - margin, u);
    const y = lerp(margin, v - margin, v);
    console.log({ x, y });

    // context.font = `20px "Roboto Mono for Powerline"`;
    // context.rotate(rotation);
    // context.lineWidth = 10;
    // context.strokeStyle = palette[4];
    // context.fillStyle = palette[3];
    // // context.fillText("—", 0, 0);
    // // context.translate(x, y);
    // context.beginPath();
    // context.rect(x, y, Math.PI * u * 50, Math.PI * v * 50);
    // context.fillRect(x, y, Math.PI * v * 50, Math.PI * u * 50);
    // context.stroke();
    lines.push(x, y);
  });
  return props => renderPolylines(lines, props);

  // return ({ context, width, height }) => {
  //   context.fillStyle = palette[0];
  //   context.fillRect(0, 0, width, height);

  //   points.forEach(({ position, radius, color, rotation }) => {
  //     const [u, v] = position;
  //     const x = lerp(margin, width - margin, u);
  //     const y = lerp(margin, height - margin, v);
  //     console.log({ x, y });

  //     context.font = `20px "Roboto Mono for Powerline"`;
  //     context.rotate(rotation);
  //     context.lineWidth = 10;
  //     context.strokeStyle = palette[4];
  //     context.fillStyle = palette[3];
  //     // context.fillText("—", 0, 0);
  //     // context.translate(x, y);
  //     context.beginPath();
  //     context.rect(x, y, Math.PI * u * 50, Math.PI * v * 50);
  //     context.fillRect(x, y, Math.PI * v * 50, Math.PI * u * 50);
  //     context.stroke();
  //   });
  // };
};

canvasSketch(sketch, settings);

// const canvasSketch = require("canvas-sketch");
// const { renderPolylines } = require("canvas-sketch-util/penplot");
// const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");

// const settings = {
//   dimensions: "A4",
//   orientation: "portrait",
//   pixelsPerInch: 300,
//   scaleToView: true,
//   units: "cm"
// };

// const sketch = ({ width, height }) => {
//   // List of polylines for our pen plot
//   let lines = [];

//   // Draw some circles expanding outward
//   const steps = 5;
//   const count = 20;
//   const spacing = Math.min(width, height) * 0.05;
//   const radius = Math.min(width, height) * 0.25;
//   for (let j = 0; j < count; j++) {
//     const r = radius + j * spacing;
//     const circle = [];
//     for (let i = 0; i < steps; i++) {
//       const t = i / Math.max(1, steps - 1);
//       const angle = Math.PI * 2 * t;
//       circle.push([
//         width / 2 + Math.cos(angle) * r,
//         height / 2 + Math.sin(angle) * r
//       ]);
//     }
//     lines.push(circle);
//   }

//   // Clip all the lines to a margin
//   const margin = 1.0;
//   const box = [margin, margin, width - margin, height - margin];
//   lines = clipPolylinesToBox(lines, box);

//   // The 'penplot' util includes a utility to render
//   // and export both PNG and SVG files
//   return props => renderPolylines(lines, props);
// };

// canvasSketch(sketch, settings);
