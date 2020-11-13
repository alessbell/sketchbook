/**
 * makin mazes
 *
 *
 * @author Alessia Bellisario (https://github.com/alessbell)
 */

const canvasSketch = require("canvas-sketch");
const { polylinesToSVG, pathsToSVG } = require("canvas-sketch-util/penplot");
// const pickRandom = require("canvas-sketch-util/random");
// const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [25, 25],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in",
};

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
    this.links[cell.row + "#" + cell.column] = true;
    if (bidi) cell.link(this, false);
  }

  unlink(cell, bidi = true) {
    delete this.links[cell.row + "#" + cell.column];
    if (bidi) cell.unlink(this, false);
  }

  links() {
    return Object.keys(this.links);
  }

  isLinked(cell) {
    return this.links.hasOwnProperty(cell.row + "#" + cell.column);
  }

  neighbors() {
    let list = [];
    if (this.north) list.push(this.north);
    if (this.south) list.push(this.south);
    if (this.east) list.push(this.east);
    if (this.west) list.push(this.west);
    return list;
  }
}

class Grid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;

    this.prepare_grid();
    this.configure_cells();
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

  to_img(ctx, cellSize) {
    ctx.strokeStyle = "red";

    let cell_gen = this.each_cell();
    while (true) {
      let cell = cell_gen.next().value;
      if (!cell) break;

      let marginLeft = 1;
      let marginTop = 1;
      let x1 = cell.column * cellSize + marginLeft;
      let y1 = cell.row * cellSize + marginTop;
      let x2 = (cell.column + 1) * cellSize + marginLeft;
      let y2 = (cell.row + 1) * cellSize + marginTop;


      if (!cell.north) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.stroke();
        lines.push([[x1, y1], [x2, y1]]);
      }
      if (!cell.west) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.stroke();
        lines.push([[x1, y1], [x1, y2]]);
      }
      if ((cell.east && !cell.isLinked(cell.east)) || !cell.east) {
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        lines.push([[x2, y1], [x2, y2]]);
      }
      if ((cell.south && !cell.isLinked(cell.south)) || !cell.south) {
        ctx.moveTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        lines.push([[x1, y2], [x2, y2]]);
      }
    }
  }
}


class BinaryTree {
	on(grid) {
		let cell_gen = grid.each_cell()
		while (true) {
			let cell = cell_gen.next().value
			if (!cell) break

			let neighbors = []
			if (cell.north) neighbors.push(cell.north)
			if (cell.east) neighbors.push(cell.east)

			let index = Math.floor(Math.random() * neighbors.length)
			let neighbor = neighbors[index]

			if (neighbor) cell.link(neighbor)
		}
	}
}

// function to generate a random number between min and max
// const random = (min, max) => Math.random() * (max - min) + min;
// const palette = pickRandom.pick(palettes);

const sketch = (context) => {
  // let marginBetweenElements = 0.05;
  // let elementWidth = 0.25;
  // let elementHeight = 0.25;
  // position drawing in center of page
  // let drawingWidth =
  //   columns * (elementWidth + marginBetweenElements) - marginBetweenElements;
  // let drawingHeight =
  //   rows * (elementHeight + marginBetweenElements) - marginBetweenElements;
  // let marginPageLeft = (context.width - drawingWidth) / 2;
  // let marginPageTop = (context.height - drawingHeight) / 2;

  var maze = new BinaryTree();
  let grid = new Grid(20, 20);

  maze.on(grid);

  console.log(grid.toString())

  return ({ context, width, height, units }) => {
    // black background
    // context.strokeStyle = rainbow[pos];
    context.lineWidth = 0.2;
    context.lineCap = "square";
    // context.lineJoin = "miter";
    grid.to_img(context, 1);

    console.log(width, height, units)
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
