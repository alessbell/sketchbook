// /**
//  * triangle moiré
//  *
//  *
//  * @author Alessia Bellisario (https://github.com/alessbell)
//  */

// const canvasSketch = require("canvas-sketch");
// const { pathsToSVG } = require("canvas-sketch-util/penplot");

// const settings = {
//   dimensions: [5, 7],
//   orientation: "portrait",
//   pixelsPerInch: 300,
//   scaleToView: true,
//   units: "in",
// };

// const lines = [];

// function rotate(cx, cy, x, y, angle) {
//   if (angle === 0) return [x, y];

//   var radians = (Math.PI / 180) * angle,
//     cos = Math.cos(radians),
//     sin = Math.sin(radians),
//     nx = cos * (x - cx) - sin * (y - cy) + cx,
//     ny = cos * (y - cy) + sin * (x - cx) + cy;
//   return [nx, ny];
// }

// function drawTriangle(context, cx, cy, width, angle) {
//   // calculate rotated coordinates
//   let xy1 = rotate(cx, cy, cx, cy, angle);
//   let xy2 = rotate(cx, cy, cx + width, cy, angle);
//   let xy3 = rotate(cx, cy, cx + width, cy + width, angle);

//   context.beginPath();
//   context.strokeStyle = "black";
//   context.lineWidth = 0.02;
//   context.lineCap = "square";
//   context.lineJoin = "miter";

//   // draw square on context
//   context.moveTo(...xy1);
//   context.lineTo(...xy2);
//   context.lineTo(...xy3);
//   context.lineTo(...xy4);
//   context.lineTo(...xy1);
//   context.stroke();

//   // draw square for svg polylines
//   // lines.push([xy1, xy2]);
//   // lines.push([xy2, xy3]);
//   // lines.push([xy3, xy4]);
// }

// const sketch = () => {
//   return ({ context, width, height, units }) => {
//     // let marginPageLeft = (context.width - drawingWidth) / 2;
//     // let marginPageTop = (context.height - drawingHeight) / 2;

//     let posX = 0;
//     let posY = 0;

//     context.lineWidth = 0.015;
//     context.lineCap = "square";
//     context.lineJoin = "miter";

//     for (let i = 0; i < 30; i++) {
//       // drawTriangle(context, posX, posY);
//       // context.beginPath();
//       context.strokeStyle = "black";
//       context.lineWidth = 0.01;
//       context.lineCap = "square";
//       context.lineJoin = "miter";

//       const side = 2;
//       const h = side * (Math.sqrt(3) / 2);
//       context.strokeStyle = "#ff0000";

//       // context.save();
//       context.translate(width / 2, height / 2);

//       context.beginPath();
//       const rotation = 1.5;
//       context.moveTo(0, (-h / 2) * rotation);
//       context.lineTo(-side / 2, (h / 2) * rotation);
//       context.lineTo(side / 2, (h / 2) * rotation);
//       context.lineTo(0, (-h / 2) * rotation);

//       context.stroke();

//       // draw square on context
//       // context.moveTo(...xy1);
//       // context.lineTo(...xy2);
//       // context.lineTo(...xy3);
//       // context.lineTo(...xy4);
//       // context.lineTo(...xy1);
//       // context.stroke();
//     }

//     return [
//       context.canvas,
//       {
//         data: pathsToSVG(lines, {
//           width,
//           height,
//           units,
//         }),
//         extension: ".svg",
//       },
//     ];
//   };
// };

// canvasSketch(sketch, settings);

const canvasSketch = require("canvas-sketch");
const ln = require("@lnjs/core");

const settings = {
  dimensions: "A5",
  orientation: "portrait",
  scaleToView: true,
  // pixelsPerInch: 300,
  // parent: false,
};

const sketch = () => {
  const scene = new ln.Scene();
  const n = 4;
  return ({ context, width, height, bleed }) => {
    // let eye = new ln.Vector(2.75, 3.25, 7.5);
    // let center = new ln.Vector(0, 0, 0);
    // let up = new ln.Vector(0, 0, 1);

    // for (let x = -n; x <= n; x++) {
    //   for (let y = -n; y <= n; y++) {
    //     const p = Math.random() * 0.25 + 0.2;
    //     let z = Math.random() * 3;
    //     const fx = x;
    //     const fy = y;
    //     const fz = Math.random() * 3 + 1;
    //     if (x === 2 && y === 1) {
    //       continue;
    //     }
    //     const shape = new ln.Cube(
    //       new ln.Vector(fx - p, fy - p, 0),
    //       new ln.Vector(fx + p, fy + p, fz)
    //     );
    //     scene.add(shape);
    //   }
    // }

    // let paths = scene.render(
    //   eye,
    //   center,
    //   up,
    //   width,
    //   height,
    //   100,
    //   0.01,
    //   10,
    //   0.01
    // );
    // let svg = ln.toSVG(paths, width - bleed * 2, height - bleed * 2);

    // console.log(paths);

    // document.body.innerHTML = svg;

    const scene = new ln.Scene();
    const n = 5;
    for (let x = -n; x <= n; x++) {
      for (let y = -n; y <= n; y++) {
        const p = Math.random() * 0.25 + 0.2;
        const dx = Math.random() * 0.5 - 0.25;
        const dy = Math.random() * 0.5 + 0.25;
        const z = 3;
        const fx = x;
        const fy = y;
        const fz = Math.random() * 3 + 1;
        if (x === 2 && y === 1) {
          continue;
        }
        const shape = new ln.Cube(
          new ln.Vector(fx - p, fy - p, 0),
          new ln.Vector(fx + p, fy + p, fz)
        );
        scene.add(shape);
      }
    }

    let eye = new ln.Vector(1.75, 1.25, 6);
    let center = new ln.Vector(0, 0, 0);
    let up = new ln.Vector(0, 0, 1);

    let paths = scene.render(
      eye,
      center,
      up,
      width,
      height,
      100,
      0.1,
      100,
      0.01
    );
    let svg = ln.toSVG(paths, width, height);
    document.body.innerHTML = svg;
  };
};

canvasSketch(sketch, settings);
