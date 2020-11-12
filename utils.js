const getPosition = (position) => {
  const [row, col] = position;
  return row * columns + col;
};

// const size = columns * rows;
// const rainbow = new Array(size);

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
