const svg_scale = 100;

function curve(id, fn, df, color) {
  const svg = document.getElementById(id);
  const N = 50;
  const u = svg_scale;
  const show_points = false;
  const def = [];
  let p1 = null;
  let m1 = null;
  const c = 1/3;
  for (let i = 0; i <= N; i ++) {
    const t = i/N;
    const p = fn(t);
    if (isNaN(p.x) || isNaN(p.y))
      break;
    const d = df(t);
    const m = {x : c*d.x/N, y : c*d.y/N};

    if (show_points) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
      circle.setAttribute('cx', (u * p.x).toString());
      circle.setAttribute('cy', (u * p.y).toString());
      circle.setAttribute('r', '1');
      circle.setAttribute('fill', 'red');
      svg.appendChild(circle);
    }

    if (i === 0)
      def.push(`M ${u*p.x} ${u*p.y}`);
    else {
      def.push(`C ${u*(p1.x + m1.x)} ${u*(p1.y + m1.y)} ${u*(p.x - m.x)} ${u*(p.y - m.y)} ${u*p.x} ${u*p.y}`);
    }

    if (def.join('').includes('NaN'))
      console.log(def);

    p1 = p;
    m1 = m;
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute('d', def.join(' '));
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '1');
  svg.appendChild(path);
}


function line(a, b, color) {
  const u = svg_scale;
  const svg = document.getElementById('z');
  const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
  line.setAttribute('x1', (u * a.x).toString());
  line.setAttribute('y1', (u * a.y).toString());

  line.setAttribute('x2', (u * b.x).toString());
  line.setAttribute('y2', (u * b.y).toString());

  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '1');

  svg.appendChild(line);
}

function dot(id, a, color) {
  const u = svg_scale;
  const svg = document.getElementById(id);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  circle.setAttribute('cx', (u * a.x).toString());
  circle.setAttribute('cy', (u * a.y).toString());
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', color);
  svg.appendChild(circle);
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

function to_n_pos(z, n) {
  if (n < 0)
    return null;
  else if (n === 0)
    return {x: 1, y: 0};
  else
    return mul(z, to_n_pos(z, n - 1));
}

function to_n(z, n) {
  if (n < 0)
    return div({x: 1, y : 0}, to_n_pos(z, -n));
  else
    return to_n_pos(z, n);
}
