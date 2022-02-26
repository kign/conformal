function curve(id, scale, fn, df, color) {
  const svg = document.getElementById(id);
  const N = 50;
  const u = 100 / scale;
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

function line(svg_id, a, b, scale, color, dash = null) {
  const u = 100 / scale;
  const svg = document.getElementById(svg_id);
  const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
  line.setAttribute('x1', (u * a.x).toString());
  line.setAttribute('y1', (u * a.y).toString());

  line.setAttribute('x2', (u * b.x).toString());
  line.setAttribute('y2', (u * b.y).toString());

  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '1');
  if(dash)
    line.setAttribute('stroke-dasharray', dash);

  svg.appendChild(line);
}

function text (svg_id, scale, pos, str) {
  const u = 100 / scale;
  const svg = document.getElementById(svg_id);
  const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  text.setAttribute('x', (u * pos.x).toString());
  text.setAttribute('y', (u * pos.y).toString());
  text.appendChild(document.createTextNode(str));
  svg.appendChild(text);
}

function dot(id, scale, a, color) {
  const u = 100 / scale;
  const svg = document.getElementById(id);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  circle.setAttribute('cx', (u * a.x).toString());
  circle.setAttribute('cy', (u * a.y).toString());
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', color);
  svg.appendChild(circle);
}

function straight_mesh(svg_id, scale) {
  const N = 20;

  for (let iy = 1; iy < N; iy ++) {
    const y = -1 + 2*iy/N;
    const x = Math.sqrt(1 - y * y);
    line(svg_id, {x: -x, y: y}, {x: x, y: y}, scale, "blue");
  }

  for (let ix = 1; ix < N; ix ++) {
    const x = -1 + 2*ix/N;
    const y = Math.sqrt(1 - x * x);
    line(svg_id, {x: x, y: -y}, {x: x, y: y}, scale, "red");
  }
}

function mesh_circle(svg_id, scale, r, c, func, derivative) {
  const N = 20;

  for (let iy = 1; iy < N; iy ++) {
    // const y = -1 + 2*iy/N;
    // const x = Math.sqrt(1 - y * y);
    const y = c.y - r + 2*r*iy/N;
    const dx = 2*r*Math.sqrt(iy/N - (iy/N)**2);
    curve(svg_id, scale, t => {
      // const z = {x: x * (2 * t - 1), y: y};
      const z = {x: c.x + dx * (2 * t - 1), y: y};
      return func(z);
    }, t => {
      // const z = {x: x * (2 * t - 1), y: y};
      const z = {x: c.x + dx * (2 * t - 1), y: y};
      return mul_s(2*dx, derivative(z));
    }, "blue");
  }

  for (let ix = 1; ix < N; ix ++) {
    // const x = -1 + 2*ix/N;
    // const y = Math.sqrt(1 - x * x);
    const x = c.x - r + 2*r*ix/N;
    const dy = 2*r*Math.sqrt(ix/N - (ix/N)**2);
    curve(svg_id, scale, t => {
      // const z = {x: x, y: y * (2 * t - 1)};
      const z = {x: x, y: c.y + dy * (2 * t - 1)};
      return func(z);
    }, t => {
      // const z = {x: x, y: y * (2 * t - 1)};
      const z = {x: x, y: c.y + dy * (2 * t - 1)};
      return mul(derivative(z), {x: 0, y: 2 * dy});
    }, "red");
  }
}

function unit_circle(svg_id, scale, c, r, func, derivative) {
  const k = mul_s(2*Math.PI, J);
  curve(svg_id, scale, t => {
    const z = mul_s(r, exp(mul_s(t, k)));
    return func(add(c, z));
  }, t => {
    const z = mul_s(r, exp(mul_s(t, k)));
    return mul(mul(k, z), derivative(add(c, z)));
  }, "green");
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

function mul_s(scalar, z) {
  return {x: scalar * z.x, y: scalar * z.y};
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

const J = {x: 0, y: 1};

function exp(z) {
  return mul_s(Math.exp(z.x), {x: Math.cos(z.y), y: Math.sin(z.y)});
}