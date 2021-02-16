var COLORS = [
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
var gamiList = [];

var hitOptions = {
  segments: false,
  stroke: false,
  fill: true,
  tolerance: 20,
};

function downloadSVG() {
  var fileName = "texture.svg";
  var config = { asString: true };
  var url =
    "data:image/svg+xml;utf8," + encodeURIComponent(project.exportSVG(config));
  var link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
}

function onKeyUp(event) {
  var key = event.key.toLowerCase();
  switch (key) {
    case "s":
      downloadSVG();
      break;
  }
}

var selectedSegment = null;
var selectedLine = null;
var selectedGami = null;

// function onMouseDrag(event) {
// 	if(selectedSegment!=null) {
// 		selectedLine.gami.updateLine(selectedSegment, event.delta);
// 	} else if(selectedGami!=null) {
// 		selectedGami.layer.position += event.delta;
// 	}
// }

function getOppositePointByLine(point, line) {
  var p = line.getNearestPoint(point);
  var v = p - point;
  return p + v;
}

function getNormalizedNoise(x, y, z) {
  if (z == null) {
    return simplexNoise.noise(x, y) / 2 + 0.5;
  } else {
    return simplexNoise.noise3d(x, y, z) / 2 + 0.5;
  }
}

function Gami(path, color0, color1, color2) {
  this.group = new Group();
  this.path = path;
  this.group.addChild(this.path);

  this.color0 = color0;
  this.color1 = color1;
  this.color2 = color2;
  this.path0 = null;
  this.path1 = null;
  this.path00 = null;
  this.path01 = null;
  this.path10 = null;
  this.path11 = null;

  this.updateStyles();

  var me = this;
  var offset0 = getRandomFloat(0.2, 0.4);
  var offset1 = getRandomFloat(0.6, 0.8);
  this.line = new Path({
    segments: [
      this.path.getPointAt(offset0 * this.path.length),
      this.path.getPointAt(offset1 * this.path.length),
    ],
    strokeColor: "blue",
  });
  this.group.addChild(this.line);

  var middleLocation = this.line.getLocationAt(
    this.line.length * getRandomFloat(0.1, 0.9)
  );
  var locationOnPath = this.path.getLocationAt(
    this.path.length * Math.random()
  );
  var middlePt = (middleLocation.point + locationOnPath.point) / 2;
  var vector = locationOnPath.point - middleLocation.point;
  this.line1 = new Path({
    segments: [middlePt - vector * 10, middlePt + vector * 10],
    strokeColor: "red",
  });
  this.line1.opacity = 0;
  this.group.addChild(this.line1);

  this.speed = 0.007; //getRandomFloat(0.005, 0.005);
  this.index = 100; //getRandomInt(0, 999);

  if (config.doubleFold) {
    this.fold();
    this.foldTwice();
  } else {
    this.fold();
    this.closePath(this.path0);
    this.closePath(this.path1);
  }
  this.line.remove();
  this.line1.remove();
}
Gami.prototype.foldTwice = function () {
  this.closePath(this.path1);

  var paths = this.splitPathByLine(this.path1, this.line1);
  if (paths == null) {
    return;
  }
  if (paths.length != 2) {
    return;
  }
  this.path10 = paths[0];
  this.path11 = paths[1];

  if (!config.noFill) {
    // this.path10.fillColor = chroma(this.color0).opacity(0.8).css();
    this.path10.fillColor = chroma(this.color0).brighten().alpha(0.5).css();
  }
  this.closePath(paths[0]);
  this.closePath(paths[1]);

  this.closePath(this.path0);

  var intersections = this.path0.getIntersections(this.line1);
  if (intersections.length < 2) {
    return;
  }

  var split0 = this.path0;
  split0.splitAt(intersections[0].offset);
  var split1 = split0.splitAt(
    split0.getNearestLocation(intersections[1].point)
  );

  if (split0 == null || split1 == null || split0.length == 0) {
    split1.remove();
    return;
  }

  var _line = new Path({
    segments: [
      split0.getLocationAt(split0.length * 0.5).point,
      paths[0].getLocationAt(paths[0].length * 0.5).point,
    ],
    strokeColor: "orange",
  });
  var check = _line.intersects(this.line1);

  if (check) {
    split0 = this.flipPathByLine(split0, this.line1);
  } else {
    split1 = this.flipPathByLine(split1, this.line1);
  }
  this.group.addChild(split0);
  this.group.addChild(split1);
  split0.sendToBack();
  split1.sendToBack();

  this.closePath(split0);
  this.closePath(split1);
  this.path00 = split0;
  this.path01 = split1;

  _line.remove();

  this.path00.locked = true;
  this.path01.locked = true;
};

Gami.prototype.closePath = function (path) {
  path.firstSegment.handleIn = null;
  path.lastSegment.handleOut = null;
  path.closed = true;
};

Gami.prototype.remove = function () {
  this.path0.remove();
  this.path1.remove();
  this.path.remove();
  this.line.remove();
  this.line1.remove();
  if (this.path00) {
    this.path00.remove();
  }
  if (this.path01) {
    this.path01.remove();
  }
  if (this.path10) {
    this.path10.remove();
  }
  if (this.path11) {
    this.path11.remove();
  }
};

Gami.prototype.animateLine = function (count) {
  if (this.path0) {
    this.path0.remove();
  }
  if (this.path1) {
    this.path1.remove();
  }
  if (this.path00) {
    this.path00.remove();
  }
  if (this.path01) {
    this.path01.remove();
  }
  if (this.path10) {
    this.path10.remove();
  }
  if (this.path11) {
    this.path11.remove();
  }

  var speed = config.doubleFold ? this.speed / 2 : this.speed;
  var div = 100;
  var offset0 =
    getNormalizedNoise(
      this.path.position.x / div,
      this.path.position.y / div,
      count * speed
    ) * 0.7;
  var offset1 =
    offset0 +
    getNormalizedNoise(this.index, count * speed) * (1 - offset0) * 0.9;
  this.line.segments[0].point = this.path.getLocationAt(
    this.path.length * offset0
  ).point;
  this.line.segments[1].point = this.path.getLocationAt(
    this.path.length * offset1
  ).point;
  this.fold();

  if (config.doubleFold) {
    var offset0 =
      getNormalizedNoise(
        this.path.position.x / div,
        this.path.position.y / div,
        count * speed
      ) *
        0.8 +
      0.1;
    var offset1 = getNormalizedNoise(this.index, count * speed) * 0.8 + 0.1;
    var middleLocation = this.line.getLocationAt(this.line.length * offset1);
    var locationOnPath = this.path.getLocationAt(offset0 * this.path.length);
    var middlePt = (middleLocation.point + locationOnPath.point) / 2;
    var vector = locationOnPath.point - middleLocation.point;
    this.line1.firstSegment.point = middlePt - vector * 10;
    this.line1.lastSegment.point = middlePt + vector * 10;
    this.foldTwice();
  } else {
    this.closePath(this.path0);
    this.closePath(this.path1);
  }
};

Gami.prototype.updateStyles = function () {
  if (config.noFill) {
    this.path.fillColor = "transparent";
    this.path.strokeColor = chroma(this.color0).alpha(0.9).css();
  } else {
    this.path.fillColor = chroma(this.color0).alpha(0.8).css();
    this.path.strokeColor = "transparent";
  }
};
Gami.prototype.splitPathByLine = function (path, line) {
  path.opacity = 0.15;

  var intersections = path.getIntersections(line);

  if (intersections.length < 2) {
    return;
  }
  var split0 = path.clone();
  split0.opacity = 1;
  split0.splitAt(intersections[0].offset);

  var split1 = split0.splitAt(
    split0.getNearestLocation(intersections[1].point)
  );

  var pathShort = null;
  var pathLong = null;

  pathShort = split0;
  pathLong = split1;

  // if(split0.length<=split1.length) {
  // 	pathShort = split0;
  // 	pathLong = split1;
  // } else {
  // 	pathShort = split1;
  // 	pathLong = split0;
  // }
  // pathShort.blendMode = 'multiply';

  pathShort = this.flipPathByLine(pathShort, line);

  this.group.addChild(pathShort);
  this.group.addChild(pathLong);
  pathShort.sendToBack();
  pathLong.sendToBack();

  pathShort.locked = true;
  pathLong.locked = true;

  return [pathShort, pathLong];
};
Gami.prototype.flipPathByLine = function (path, line) {
  var vector = line.lastSegment.point - line.firstSegment.point;
  var angle = vector.angle;

  var centerPoint = (path.firstSegment.point + path.lastSegment.point) / 2;
  var boundingBox = new Path.Rectangle({
    rectangle: {
      point: centerPoint - path.bounds.size,
      size: path.bounds.size * 2,
    },
  });

  var group = new Group([boundingBox, path]);
  group.rotate(-angle);
  group.scale(-1, 1);
  group.rotate(angle + 180);
  group.removeChildren(0, 1);
  group.reduce();

  return path;
};
Gami.prototype.fold = function () {
  var paths = this.splitPathByLine(this.path, this.line);
  if (paths != null) {
    this.path0 = paths[0];
    this.path1 = paths[1];
  }
};

function updateStyles() {
  layer.strokeWidth = config.strokeWidth;
  layer.strokeCap = "round";
  layer.strokeJoin = "round";

  for (var i = 0; i < gamiList.length; i++) {
    var gami = gamiList[i];
    gami.updateStyles();
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function getRandomPath(center, size) {
  var size = size * 0.9;
  var rand = Math.random();
  var path = null;
  if (rand < 0.15) {
    path = new Path.Ellipse({
      center: center,
      radius: [
        getRandomInt(size * 0.75, size * 0.85),
        getRandomInt(size * 0.75, size * 0.85),
      ],
    });
  } else if (rand < 0.6) {
    var sides = getRandomInt(3, 12);
    var radius = sides < 5 ? size * 0.95 : size * 0.8;
    if (sides == 3) {
      center.y += 18;
    }
    path = new Path.RegularPolygon({
      center: center,
      sides: sides,
      radius: radius,
    });
  } else {
    var points = getRandomInt(5, 12);
    var path = new Path.Star({
      center: center,
      points: points,
      radius1: size * getRandomFloat(0.65, 0.75),
      radius2: size * getRandomFloat(0.75, 0.85),
    });
    path.smooth({ type: "catmull-rom", factor: 0 });
  }
  // switch(index) {
  // case 3:
  // 	var sides = getRandomInt(3, 12);
  // 	var _path = new Path.RegularPolygon({
  // 		center: center,
  // 		sides: sides,
  // 		radius: size//getRandomInt(size*getRandomFloat(0.8,1.0), size*getRandomFloat(1.0,1.1)),
  // 	});
  // 	path = new Path();
  // 	path.add( _path.firstSegment.point );
  // 	for(var i=0; i<_path.segments.length; i++) {
  // 		var segment = _path.segments[i];
  // 		var curveTo = (i==(_path.segments.length-1)) ? _path.segments[0]:_path.segments[i+1];
  // 		var through = (segment.point + curveTo.point)/2;
  // 		var vector = center - through;
  // 		through += vector * getRandomFloat(0.3, 0.32);
  // 		path.curveTo(through, curveTo.point);
  // 	}
  // 	path.closePath();
  // 	_path.remove();
  // 	break;
  // case 3:
  // 	var r0 = size*getRandomFloat(0.8,1.2);
  // 	var r1 = size*getRandomFloat(0.8,1.2);
  // 	var path = new Path.Rectangle({
  // 		point: center - new Point(r0/2, r1/2),
  // 		size: [r0, r1]
  // 	});
  // 	break;
  // }
  // path.rotate(getRandomInt(0, 180));
  return path;
}

function create() {
  if (config.doubleFold) {
    var size = 400;
    var size = size;
    var path = getRandomPath(view.center, size);
    var colors = shuffle(COLORS);
    var gami = new Gami(path, colors[0], colors[1], colors[2]);
    gamiList.push(gami);
  } else {
    var size = view.size.width > 600 ? 220 : 180;
    var margin = view.size.width > 600 ? size / 4 : 40;
    var cols = Math.round((view.size.width - margin * 2) / size);
    var rows = Math.round((view.size.height - margin * 2) / size);
    var marginX = (view.size.width - cols * size) / 2;
    var marginY = (view.size.height - rows * size) / 2;
    console.log("marginX", marginX);
    for (var i = 0; i < cols * rows; i++) {
      var x = marginX + size * (i % cols) + size / 2;
      var y = marginY + size * Math.floor(i / cols) + size / 2;
      var path = getRandomPath(new Point(x, y), size / 2);
      var colors = shuffle(COLORS);
      var gami = new Gami(path, colors[0], colors[1], colors[2]);
      gamiList.push(gami);
    }
  }
}
var Config = function () {
  this.darkTheme = true;
  this.strokeWidth = 5;
  this.strokeOpacity = 0.8;
  this.speed = 1;
  this.doubleFold = false;
  this.noFill = true;
  this.shuffle = function () {
    for (var i = 0; i < gamiList.length; i++) {
      gamiList[i].remove();
    }
    gamiList = [];
    create();
    updateStyles();
  };
};
var config = new Config();
var gui = new dat.GUI();
var controllerDarkTheme = gui.add(config, "darkTheme");
var controllerDoubleFold = gui.add(config, "doubleFold");
var controllerStrokeWidth = gui.add(config, "strokeWidth", 1, 10).step(1);
var controllerNoFill = gui.add(config, "noFill");
// var controllerSpeed= gui.add(config, 'speed', 1, 4).step(0.1);
gui.add(config, "shuffle");

controllerDarkTheme.onFinishChange(function (value) {
  document.body.classList.toggle("dark", value);
});
controllerNoFill.onFinishChange(function (value) {
  updateStyles();
});
controllerDoubleFold.onFinishChange(function (value) {
  if (value) {
    controllerStrokeWidth.min(1);
    controllerStrokeWidth.max(40);
    controllerStrokeWidth.setValue(20);
  } else {
    controllerStrokeWidth.min(1);
    controllerStrokeWidth.max(10);
    controllerStrokeWidth.setValue(5);
  }
  for (var i = 0; i < gamiList.length; i++) {
    gamiList[i].remove();
  }
  gamiList = [];
  create();
  updateStyles();
});
controllerStrokeWidth.onFinishChange(function (value) {
  updateStyles();
});
// controllerSpeed.onFinishChange(function(value) {
// 	for(var i=0; i<gamiList.length; i++) {
// 		gamiList[i].speed = 0.002 * value;
// 	}
// });

var layer = null;
function init() {
  layer = new Layer();
  create();
  updateStyles();
  // var path = new Path({
  // 	segments: [[100, 100], [600, 100], [600, 200], [100, 200]],
  // 	closed: true,
  // });
  // var colors = shuffle(COLORS);
  // var gami = new Gami(path, colors[0], colors[1], colors[2]);
  // gamiList.push(gami);
}

var simplexNoise = new SimplexNoise();

init();

function onResize() {
  for (var i = 0; i < gamiList.length; i++) {
    gamiList[i].remove();
  }
  gamiList = [];
  create();
  updateStyles();
}

function onFrame(event) {
  for (var i = 0; i < gamiList.length; i++) {
    gamiList[i].animateLine(event.count);
  }
}
