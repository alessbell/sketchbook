/**
 * makin mazes
 *
 *
 * @author Alessia Bellisario (https://github.com/alessbell)
 */

const canvasSketch = require("canvas-sketch");
const { pathsToSVG } = require("canvas-sketch-util/penplot");
const pickRandom = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [5, 7],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in",
};

const random = (min, max) => Math.random() * (max - min) + min;
const palette = pickRandom.pick(palettes);

const lines = [];

class Cell {
  constructor(row, column) {
    this.row = row;
    this.column = column;
    this.links = {};
    this.north = null;
    this.south = null;
    this.east = null;
    this.west = null;
  }

  link(cell, bidi = true) {
    this.links[cell.get_id()] = cell;
    if (bidi) cell.link(this, false);
  }

  unlink(cell, bidi = true) {
    delete this.links[cell.get_id()];
    if (bidi) cell.unlink(this, false);
  }

  get_links() {
    return Object.keys(this.links);
  }

  isLinked(cell) {
    return this.links.hasOwnProperty(cell.get_id());
  }

  neighbors() {
    let list = [];
    if (this.north) list.push(this.north);
    if (this.south) list.push(this.south);
    if (this.east) list.push(this.east);
    if (this.west) list.push(this.west);
    return list;
  }

  get_id() {
    return this.row + "#" + this.column;
  }

  distances() {
    let distances = new Distances(this);
    let frontier = [this];

    while (frontier.length > 0) {
      let new_frontier = [];

      for (let i = 0; i < frontier.length; i += 1) {
        let cell = frontier[i];
        for (let link in cell.links) {
          let linkedCell = cell.links[link];
          if (linkedCell && distances.get_cell(linkedCell) == undefined) {
            distances.set_cell(linkedCell, distances.get_cell(cell) + 1);
            new_frontier.push(linkedCell);
          }
        }
      }

      frontier = new_frontier;
    }

    return distances;
  }
}

class Grid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;

    this.prepare_grid();
    this.configure_cells();
  }

  set_distances(distances) {
    this.distances = distances;
    let farthest_id;
    [farthest_id, this.maximum] = distances.max();
  }

  background_color_for(cell) {
    let distance = this.distances.get_cell(cell);
    let intensity = ((this.maximum - distance) * 1.0) / this.maximum;
    let dark = Math.floor(255 * intensity);
    let bright = Math.floor(2 + 2 * intensity);
    return `rgb(${dark},${bright},${dark})`;
  }

  prepare_grid() {
    this.grid = new Array(this.rows);
    for (let i = 0; i < this.rows; i += 1) {
      this.grid[i] = new Array(this.columns);
      for (let j = 0; j < this.columns; j += 1) {
        this.grid[i][j] = new Cell(i, j);
      }
    }
  }

  configure_cells() {
    for (let i = 0; i < this.rows; i += 1) {
      for (let j = 0; j < this.columns; j += 1) {
        let cell = this.get_cell(i, j);
        if (cell == null) continue;
        let row = cell.row;
        let col = cell.column;
        if (row > 0) cell.north = this.get_cell(row - 1, col);
        if (row < this.rows - 1) cell.south = this.get_cell(row + 1, col);
        if (col > 0) cell.west = this.get_cell(row, col - 1);
        if (col < this.columns - 1) cell.east = this.get_cell(row, col + 1);
      }
    }
  }

  get_cell(row, column) {
    if (row < 0 || row > this.rows - 1) return null;
    if (column < 0 || column > this.columns - 1) return null;
    return this.grid[row][column];
  }

  get_random_cell() {
    let row = Math.floor(Math.random() * this.rows);
    let column = Math.floor(Math.random() * this.grid[row].length);

    return this.get_cell(row, column);
  }

  size() {
    return this.rows * this.columns;
  }

  *each_row() {
    for (let i = 0; i < this.rows; i += 1) {
      yield this.grid[i];
    }
  }

  *each_cell() {
    let row_gen = this.each_row();
    for (let i = 0; i < this.rows; i += 1) {
      let row = row_gen.next().value;
      for (let j = 0; j < row.length; j += 1) {
        if (row[j]) yield row[j];
      }
    }
  }

  contents_of(cell) {
    return " ";
  }

  toString() {
    let output = "";
    output += "+" + "---+".repeat(this.columns) + "\n";
    let row_gen = this.each_row();
    while (true) {
      let row = row_gen.next().value;
      if (!row) break;

      let top = "|";
      let bottom = "+";

      for (let j = 0; j < row.length; j += 1) {
        let cell = row[j];
        if (!cell) cell = new Cell(-1, -1);

        let body = "   ";
        let east_boundary = cell.east && cell.isLinked(cell.east) ? " " : "|";
        top += body + east_boundary;

        let south_boundary =
          cell.south && cell.isLinked(cell.south) ? "   " : "---";
        let corner = "+";
        bottom += south_boundary + corner;
      }

      output += top + "\n";
      output += bottom + "\n";
    }
    return output;
  }

  toImg(ctx, cellSize) {
    ctx.strokeStyle = palette[0];

    let cell_gen = this.each_cell();
    while (true) {
      let cell = cell_gen.next().value;
      if (!cell) break;

      let margin = 0.05;
      let x1 = cell.column * cellSize + margin;
      let y1 = cell.row * cellSize + margin;
      let x2 = (cell.column + 1) * cellSize + margin;
      let y2 = (cell.row + 1) * cellSize + margin;

      // console.log(this.background_color_for(cell));
      // ctx.beginPath();
      // ctx.rect(x1, y1, x2, y2);
      // ctx.stroke();
      // ctx.fillStyle = this.background_color_for(cell);
      // ctx.fillRect(x1, y1, x2, y2);

      if (!cell.north) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.stroke();
        lines.push([
          [x1, y1],
          [x2, y1],
        ]);
      }
      if (!cell.west) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.stroke();
        lines.push([
          [x1, y1],
          [x1, y2],
        ]);
      }
      if ((cell.east && !cell.isLinked(cell.east)) || !cell.east) {
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        lines.push([
          [x2, y1],
          [x2, y2],
        ]);
      }
      if ((cell.south && !cell.isLinked(cell.south)) || !cell.south) {
        ctx.moveTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        lines.push([
          [x1, y2],
          [x2, y2],
        ]);
      }
    }
  }
  deadends() {
    let list = [];

    let cell_gen = this.each_cell();
    while (true) {
      let cell = cell_gen.next().value;
      if (!cell) break;
      if (cell.get_links().length == 1) {
        list.push(cell);
      }
    }

    return list;
  }
}

class Distances {
  constructor(root) {
    this.root = root;
    this.cells = {};
    this.cells[this.root.get_id()] = 0;
  }

  get_cell(cell) {
    return this.cells[cell.get_id()];
  }

  set_cell(cell, distance) {
    this.cells[cell.get_id()] = distance;
  }

  get_cells() {
    return Object.keys(this.cells);
  }

  path_to(goal) {
    let current = goal;

    let breadcrumbs = new Distances(this.root);
    breadcrumbs.set_cell(current, this.get_cell(current));

    while (current.get_id() !== this.root.get_id()) {
      for (let link in current.links) {
        let neighbor = current.links[link];
        if (this.get_cell(neighbor) < this.get_cell(current)) {
          breadcrumbs.set_cell(neighbor, this.get_cell(neighbor));
          current = neighbor;
          break;
        }
      }
    }

    return breadcrumbs;
  }

  max() {
    let max_distance = 0;
    let max_cell_id = this.root.get_id();

    for (let cell_id in this.cells) {
      let distance = this.cells[cell_id];
      if (distance > max_distance) {
        max_cell_id = cell_id;
        max_distance = distance;
      }
    }

    return [max_cell_id, max_distance];
  }
}

class BinaryTree {
  on(grid) {
    let cell_gen = grid.each_cell();
    while (true) {
      let cell = cell_gen.next().value;
      if (!cell) break;

      let neighbors = [];
      if (cell.north) neighbors.push(cell.north);
      if (cell.east) neighbors.push(cell.east);

      let index = Math.floor(Math.random() * neighbors.length);
      let neighbor = neighbors[index];

      if (neighbor) cell.link(neighbor);
    }
  }
}

const sketch = (context) => {
  var maze = new BinaryTree();
  let grid = new Grid(45, 32);

  maze.on(grid);

  console.log(grid.toString());
  let start = grid.get_cell(
    Math.floor(grid.rows / 2),
    Math.floor(grid.columns / 2)
  );

  grid.set_distances(start.distances());

  return ({ context, width, height, units }) => {
    context.lineWidth = 0.015;
    context.lineCap = "round";
    // context.lineJoin = "miter";
    grid.toImg(context, 0.15);

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
};

canvasSketch(sketch, settings);
