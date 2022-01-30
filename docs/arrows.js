console.log("arrows.js loaded");

function arrow_line(a, b) {
  const w = 0.5;
  const pl = 3;
  const pw = 1;
  const u = 100;

  const v = {x: u*(b.x - a.x), y: u*(b.y - a.y)};
  const m = Math.sqrt(v.x ** 2 + v.y **2);
  const perp = {x: -v.y * w / m, y : v.x * w / m };
  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');

  path.setAttribute('d',
    `M ${u * a.x + perp.x} ${u * a.y + perp.y}` +
          `l ${v.x * (1 - pl/m)} ${v.y * (1 - pl/m)}` +
          `l ${perp.x * pw/w} ${perp.y * pw/w}` +
          `L ${u * b.x} ${u * b.y}` +
          `L ${u * a.x - perp.x + (1 - pl/m) * v.x - perp.x * pw/w} ${u * a.y - perp.y + (1 - pl/m) * v.y - perp.y * pw/w}` +
          `l ${perp.x * pw/w} ${perp.y * pw/w}` +
          `l ${v.x * (pl/m - 1)} ${v.y * (pl/m - 1)}` +
          `a ${w} ${w} 0 1 0 ${2 * perp.x} ${2 * perp.y}`);
  path.setAttribute('fill', 'black');
  // path.setAttribute('stroke', 'none');

  return path;
}

function dot(a) {
  const u = 100;

  const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  circle.setAttribute('cx', (u * a.x).toString());
  circle.setAttribute('cy', (u * a.y).toString());
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', 'red');
  return circle;
}

const svg = document.getElementById('circle');

// svg.appendChild(arrow_line({x: -.30, y: -.80}, {x: .90, y: .50}));
// svg.appendChild(dot(-30,-80));

// const a = {x: .34, y: -.18};
// const b = {x : 1.4, y: 4.1};
// console.log(add(mul({x:-1,y:0}, a), mul(div(a,b),b)));

const unit = 100;
const a = {x: 0, y: -0.05};

function func(z) {
  return div(sub(z,a), sub({x:1, y:0}, mul(conj(a), z)));
}

svg.appendChild(dot(a));

for (let cnt = 0; cnt < 1000; cnt ++) {
  const z = {x : 1 - 2 *Math.random(), y : 1 - 2 *Math.random()};
  if (z.x * z.x + z.y * z.y > 1) continue;
  svg.appendChild(arrow_line(z, func(z)));
}

function add(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
}

function sub(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

function mul(a, b) {
  return {x: a.x * b.x - a.y * b.y, y: a.x * b.y + a.y * b.x};
}

function div(a, b) {
  const m = b.x * b.x + b.y * b.y;
  return {x: (a.x * b.x + a.y * b.y)/m, y: (a.y * b.x - a.x * b.y)/m};
}

function conj(a) {
  return {x: a.x, y: -a.y};
}
