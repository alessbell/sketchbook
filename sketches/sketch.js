const canvasSketch = require("canvas-sketch");
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
          color: palette[2],
          rotation: random.noise2D(u, v),
          position: [u, v]
        });
      }
    }
    return points;
  };

  const points = createGrid();
  const margin = 400;

  return ({ context, width, height }) => {
    context.fillStyle = palette[0];
    context.fillRect(0, 0, width, height);

    points.forEach(({ position, radius, color, rotation }) => {
      const [u, v] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);
      console.log({ x, y });

      context.font = `20px "Roboto Mono for Powerline"`;
      context.rotate(rotation);
      context.lineWidth = 10;
      context.strokeStyle = palette[4];
      context.fillStyle = palette[3];
      // context.fillText("—", 0, 0);
      // context.translate(x, y);
      context.beginPath();
      context.rect(x, y, Math.PI * u * 50, Math.PI * v * 50);
      context.fillRect(x, y, Math.PI * v * 50, Math.PI * u * 50);
      context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
