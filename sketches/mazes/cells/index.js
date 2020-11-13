const { Distances } = require("../distances");

export class Cell {
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

class OverCell extends Cell {
  constructor(row, column, grid) {
    super(row, column);
    this.grid = grid;
  }

  link(cell, bidi = true) {
    let neighbor = null;
    if (
      this.north &&
      cell.south &&
      this.north.get_id() == cell.south.get_id()
    ) {
      neighbor = this.north;
    } else if (
      this.south &&
      cell.north &&
      this.south.get_id() == cell.north.get_id()
    ) {
      neighbor = this.south;
    } else if (
      this.east &&
      cell.west &&
      this.east.get_id() == cell.west.get_id()
    ) {
      neighbor = this.east;
    } else if (
      this.west &&
      cell.east &&
      this.west.get_id() == cell.east.get_id()
    ) {
      neighbor = this.west;
    }

    if (neighbor) {
      this.grid.tunnel_under(neighbor);
    } else {
      super.link(cell, bidi);
    }
  }

  neighbors() {
    let list = super.neighbors();
    if (this.can_tunnel_north()) list.push(this.north.north);
    if (this.can_tunnel_south()) list.push(this.south.south);
    if (this.can_tunnel_east()) list.push(this.east.east);
    if (this.can_tunnel_west()) list.push(this.west.west);
    return list;
  }

  can_tunnel_north() {
    return this.north && this.north.north && this.north.is_horizontal_passage();
  }

  can_tunnel_south() {
    return this.south && this.south.south && this.south.is_horizontal_passage();
  }

  can_tunnel_east() {
    return this.east && this.east.east && this.east.is_vertical_passage();
  }

  can_tunnel_west() {
    return this.west && this.west.west && this.west.is_vertical_passage();
  }

  is_horizontal_passage() {
    return (
      this.east &&
      this.isLinked(this.east) &&
      this.west &&
      this.isLinked(this.west) &&
      this.north &&
      !this.isLinked(this.north) &&
      this.south &&
      !this.isLinked(this.south)
    );
  }

  is_vertical_passage() {
    return (
      this.east &&
      !this.isLinked(this.east) &&
      this.west &&
      !this.isLinked(this.west) &&
      this.north &&
      this.isLinked(this.north) &&
      this.south &&
      this.isLinked(this.south)
    );
  }
}

export class UnderCell extends Cell {
  constructor(over_cell) {
    super(over_cell.row, over_cell.column);

    if (over_cell.is_horizontal_passage()) {
      this.north = over_cell.north;
      over_cell.north.south = this;
      this.south = over_cell.south;
      over_cell.south.north = this;
      this.link(this.north);
      this.link(this.south);
    } else {
      this.east = over_cell.east;
      over_cell.east.west = this;
      this.west = over_cell.west;
      over_cell.west.east = this;
      this.link(this.east);
      this.link(this.west);
    }
  }

  is_horizontal_passage() {
    return this.east || this.west;
  }

  is_vertical_passage() {
    return this.north || this.south;
  }
}

export class SimpleOverCell extends OverCell {
  neighbors() {
    list = [];
    if (this.north) list.push(this.north);
    if (this.south) list.push(this.south);
    if (this.east) list.push(this.east);
    if (this.west) list.push(this.west);
    return list;
  }
}
