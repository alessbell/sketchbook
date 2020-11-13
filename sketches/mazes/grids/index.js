const { Cell, SimpleOverCell, UnderCell } = require("../cells");

export class Grid {
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
    let bright = Math.floor(128 + 127 * intensity);
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

  to_img(ctx, cellSize = 10, inset = 0) {
    ctx.strokeStyle = "black";

    inset = Math.floor(cellSize * inset) || 0.0225;

    let cell_gen = this.each_cell();
    while (true) {
      let cell = cell_gen.next().value;
      if (!cell) break;

      let x = cell.column * cellSize;
      let y = cell.row * cellSize;

      if (inset > 0) {
        this.to_img_with_inset(ctx, cell, cellSize, x, y, inset);
      } else {
        this.to_img_without_inset(ctx, cell, cellSize, x, y);
      }
    }
  }
  to_img_without_inset(ctx, cell, cellSize, x, y) {
    let x1 = x;
    let y1 = y;
    let x2 = x1 + cellSize;
    let y2 = y1 + cellSize;

    if (!cell.north) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y1);
      ctx.stroke();
    }
    if (!cell.west) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1, y2);
      ctx.stroke();
    }
    if ((cell.east && !cell.isLinked(cell.east)) || !cell.east) {
      ctx.moveTo(x2, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    if ((cell.south && !cell.isLinked(cell.south)) || !cell.south) {
      ctx.moveTo(x1, y2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  cell_coordinates_with_inset(x, y, cellSize, inset) {
    let x1 = x;
    let x4 = x + cellSize;
    let x2 = x1 + inset;
    let x3 = x4 - inset;

    let y1 = y;
    let y4 = y + cellSize;
    let y2 = y1 + inset;
    let y3 = y4 - inset;

    return [x1, x2, x3, x4, y1, y2, y3, y4];
  }

  to_img_with_inset(ctx, cell, cellSize, x, y, inset) {
    let x1, x2, x3, x4, y1, y2, y3, y4;
    [x1, x2, x3, x4, y1, y2, y3, y4] = this.cell_coordinates_with_inset(
      x,
      y,
      cellSize,
      inset
    );

    if (cell.north && cell.isLinked(cell.north)) {
      ctx.moveTo(x2, y1);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x3, y1);
      ctx.lineTo(x3, y2);
      ctx.stroke();
    } else {
      ctx.moveTo(x2, y2);
      ctx.lineTo(x3, y2);
      ctx.stroke();
    }
    if (cell.south && cell.isLinked(cell.south)) {
      ctx.moveTo(x2, y3);
      ctx.lineTo(x2, y4);
      ctx.moveTo(x3, y3);
      ctx.lineTo(x3, y4);
      ctx.stroke();
    } else {
      ctx.moveTo(x2, y3);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }
    if (cell.west && cell.isLinked(cell.west)) {
      ctx.moveTo(x1, y2);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x1, y3);
      ctx.lineTo(x2, y3);
      ctx.stroke();
    } else {
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2, y3);
      ctx.stroke();
    }
    if (cell.east && cell.isLinked(cell.east)) {
      ctx.moveTo(x3, y2);
      ctx.lineTo(x4, y2);
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y3);
      ctx.stroke();
    } else {
      ctx.moveTo(x3, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }
  }

  // toImg(ctx, cellSize, strokeStyle = "red") {
  //   const lines = [];
  //   ctx.strokeStyle = strokeStyle;
  //   let cell_gen = this.each_cell();

  //   while (true) {
  //     let cell = cell_gen.next().value;
  //     if (!cell) break;

  //     let margin = 0.05;
  //     let x1 = cell.column * cellSize + margin;
  //     let y1 = cell.row * cellSize + margin;
  //     let x2 = (cell.column + 1) * cellSize + margin;
  //     let y2 = (cell.row + 1) * cellSize + margin;

  //     // console.log(this.background_color_for(cell));
  //     // ctx.beginPath();
  //     // ctx.rect(x1, y1, x2, y2);
  //     // ctx.stroke();
  //     // ctx.fillStyle = this.background_color_for(cell);
  //     // ctx.fillRect(x1, y1, x2, y2);

  //     if (!cell.north) {
  //       ctx.moveTo(x1, y1);
  //       ctx.lineTo(x2, y1);
  //       ctx.stroke();
  //       lines.push([
  //         [x1, y1],
  //         [x2, y1],
  //       ]);
  //     }
  //     if (!cell.west) {
  //       ctx.moveTo(x1, y1);
  //       ctx.lineTo(x1, y2);
  //       ctx.stroke();
  //       lines.push([
  //         [x1, y1],
  //         [x1, y2],
  //       ]);
  //     }
  //     if ((cell.east && !cell.isLinked(cell.east)) || !cell.east) {
  //       ctx.moveTo(x2, y1);
  //       ctx.lineTo(x2, y2);
  //       ctx.stroke();
  //       lines.push([
  //         [x2, y1],
  //         [x2, y2],
  //       ]);
  //     }
  //     if ((cell.south && !cell.isLinked(cell.south)) || !cell.south) {
  //       ctx.moveTo(x1, y2);
  //       ctx.lineTo(x2, y2);
  //       ctx.stroke();
  //       lines.push([
  //         [x1, y2],
  //         [x2, y2],
  //       ]);
  //     }
  //   }
  //   return lines;
  // }
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
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
}

export class WeaveGrid extends Grid {
  constructor(rows, columns) {
    super(rows, columns);
    this.under_cells = [];
  }

  prepare_grid() {
    this.grid = new Array(this.rows);
    for (let i = 0; i < this.rows; i += 1) {
      this.grid[i] = new Array(this.columns);
      for (let j = 0; j < this.columns; j += 1) {
        this.grid[i][j] = new OverCell(i, j, this);
      }
    }
  }

  tunnel_under(over_cell) {
    let under_cell = new UnderCell(over_cell);
    this.under_cells.push(under_cell);
  }

  *each_cell() {
    let row_gen = this.each_row();
    for (let i = 0; i < this.rows; i += 1) {
      let row = row_gen.next().value;
      for (let j = 0; j < row.length; j += 1) {
        if (row[j]) yield row[j];
      }
    }

    for (let i = 0; i < this.under_cells.length; i += 1) {
      if (this.under_cells[i]) yield this.under_cells[i];
    }
  }

  to_img(ctx, cellSize = 10, inset = 0) {
    inset = inset || 0.1;
    super.to_img(ctx, cellSize, inset);
  }

  to_img_with_inset(ctx, cell, cellSize, x, y, inset) {
    if (
      cell.constructor.name == "OverCell" ||
      cell.constructor.name == "SimpleOverCell"
    ) {
      super.to_img_with_inset(ctx, cell, cellSize, x, y, inset);
    } else {
      let x1, x2, x3, x4, y1, y2, y3, y4;
      [x1, x2, x3, x4, y1, y2, y3, y4] = this.cell_coordinates_with_inset(
        x,
        y,
        cellSize,
        inset
      );

      if (cell.is_vertical_passage()) {
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x3, y1);
        ctx.lineTo(x3, y2);
        ctx.moveTo(x2, y3);
        ctx.lineTo(x2, y4);
        ctx.moveTo(x3, y3);
        ctx.lineTo(x3, y4);
        ctx.stroke();
      } else {
        ctx.moveTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x1, y3);
        ctx.lineTo(x2, y3);
        ctx.moveTo(x3, y2);
        ctx.lineTo(x4, y2);
        ctx.moveTo(x3, y3);
        ctx.lineTo(x4, y3);
        ctx.stroke();
      }
    }
  }

  braid(p = 1.0) {
    let deadends = this.deadends();
    this.shuffle(deadends);

    deadends.forEach(function (cell) {
      if (cell.get_links().length != 1 || Math.random() > p) {
        return;
      }

      let neighbors = cell.neighbors().filter((c) => !c.isLinked(cell));
      let best = neighbors.filter((c) => c.get_links().length == 1);
      if (best.length == 0) best = neighbors;

      let neighbor = best[Math.floor(Math.random() * best.length)];
      cell.link(neighbor);
    }, this);
  }
}

export class PreconfiguredGrid extends WeaveGrid {
  prepare_grid() {
    this.grid = new Array(this.rows);
    for (let i = 0; i < this.rows; i += 1) {
      this.grid[i] = new Array(this.columns);
      for (let j = 0; j < this.columns; j += 1) {
        this.grid[i][j] = new SimpleOverCell(i, j, this);
      }
    }
  }
}
