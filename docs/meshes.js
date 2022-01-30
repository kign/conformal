console.log("arrows.js loaded");

draw_mesh (true);
draw_mesh(false, {x: 0, y: 0});
dot('w', {x: 0, y: 0}, 'green');
dot('z', {x: 0, y: 0}, 'green');
setup_callbacks();

function setup_callbacks () {
  const svg_z = document.getElementById('z');
  let start = {x: 0, y : 0};
  let t = {x : 0, y : 0};
  let pt = {x: 0, y: 0};
  let target = null;
  const u = 100;
  svg_z.addEventListener('pointerdown',   evt => {
    if (evt.target.tagName === 'circle' && !target) {
      start = {x: evt.clientX, y: evt.clientY};
      pt = t;
      target = evt.target;
    }
  });
  const c = svg_z.viewBox.baseVal.width / svg_z.clientWidth;
  svg_z.addEventListener('pointermove',   evt => {
    if (target) {
      t = {x : evt.clientX - start.x + pt.x, y : evt.clientY - start.y + pt.y};
      target.setAttribute('transform', `translate(${c*t.x} ${c*t.y})`);
      update_w({x: t.x * c/u, y: t.y * c/u});
    }
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(x =>
    svg_z.addEventListener(x, () => {
      // console.log(x);
      target = null;
    }));
}


let lastRedrawTime = 0;

function update_w(a) {
  window.requestAnimationFrame(ts => {
    if (ts > lastRedrawTime) {
      lastRedrawTime = ts;
      draw_mesh(false, a);
    }
  });
}

function draw_mesh(is_orig, a) {
  const N = 20;

  if (!is_orig) {
    const svg = document.getElementById('w-g');
    svg.innerHTML = '';
  }

  const func = z => {
    return div(sub(z,a), sub({x:1, y:0}, mul(conj(a), z)));
  };

  const derivative = z => {
    const g = sub({x:1, y:0}, mul(conj(a), z));
    return div({x: 1 - a.x*a.x-a.y*a.y, y:0}, mul(g,g));
  };

  for (let iy = 1; iy < N; iy ++) {
    const y = -1 + 2*iy/N;
    const x = Math.sqrt(1 - y * y);
    if (is_orig)
      line({x: -x, y: y}, {x: x, y: y}, "blue");
    else
      curve(t => {
          const z = {x: x*(2*t-1), y:y};
          return func(z);
        }, t => {
          const z = {x: x*(2*t-1), y:y};
          const d = derivative(z);
          return mul(d, {x: 2*x, y: 0});
        },
        "blue");
  }

  for (let ix = 1; ix < N; ix ++) {
    const x = -1 + 2*ix/N;
    const y = Math.sqrt(1 - x * x);
    if (is_orig)
      line({x: x, y: -y}, {x: x, y: y}, "red");
    else
      curve(t => {
          const z = {x: x, y: y*(2*t-1)};
          return func(z);
        }, t => {
          const z = {x: x, y: y*(2*t-1)};
          const d = derivative(z);
          return mul(d, {x: 0, y: 2*y});
        },
        "red");
  }
}

function curve(fn, df, color) {
  const svg = document.getElementById('w-g');
  const N = 50;
  const u = 100;
  const show_points = false;
  const def = [];
  let p1 = null;
  let m1 = null;
  const c = 1/3;
  for (let i = 0; i <= N; i ++) {
    const t = i/N;
    const p = fn(t);
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
  const u = 100;
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
  const u = 100;
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
