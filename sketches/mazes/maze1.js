/**
 * makin mazes
 *
 *
 * @author Alessia Bellisario (https://github.com/alessbell)
 */

const canvasSketch = require("canvas-sketch");
const { Grid, PreconfiguredGrid } = require("./grids");
const { HuntAndKill, BinaryTree, Kruskals, State } = require("./algorithms");
const { pathsToSVG } = require("canvas-sketch-util/penplot");

const settings = {
  dimensions: [5, 7],
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "in",
};

const sketch = () => {
  // var maze = new BinaryTree();
  // let grid = new Grid(45, 32);

  // maze.on(grid);
  // // console.log(grid.toString());

  // let start = grid.get_cell(
  //   Math.floor(grid.rows / 2),
  //   Math.floor(grid.columns / 2)
  // );

  // grid.set_distances(start.distances());

  let maze = new Kruskals();
  let h = 45;
  let w = 32;
  let grid = new PreconfiguredGrid(h, w);
  let state = new State(grid);

  for (let i = 0; i < grid.size(); i += 1) {
    let row = 1 + Math.floor(Math.random() * (grid.rows - 2));
    let column = 1 + Math.floor(Math.random() * (grid.columns - 2));
    state.add_crossing(grid.get_cell(row, column));
  }

  maze.on(grid, state);

  return ({ context, width, height, units }) => {
    context.lineWidth = 0.015;
    // context.lineCap = "square";
    // context.lineJoin = "miter";
    const lines = grid.to_img(context, 0.15, 0.1);

    // return [
    //   context.canvas,
    //   {
    //     data: pathsToSVG(lines, {
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
