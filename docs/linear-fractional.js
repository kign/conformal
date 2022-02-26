const scale = 1;

draw_mesh (true);
draw_mesh(false, {x: 0, y: 0});
dot('w', 1, {x: 0, y: 0}, 'green');
dot('z', 1, {x: 0, y: 0}, 'green');
setup_callbacks();

function setup_callbacks () {
  const svg_z = document.getElementById('z');
  let start = {x: 0, y : 0};
  let t = {x : 0, y : 0};
  let pt = {x: 0, y: 0};
  let target = null;
  const u = 100 / scale;
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
      line('z', {x: -x, y: y}, {x: x, y: y}, scale, "blue");
    else
      curve("w-g", scale, t => {
        const z = {x: x * (2 * t - 1), y: y};
        return func(z);
      }, t => {
        const z = {x: x * (2 * t - 1), y: y};
        const d = derivative(z);
        return mul(d, {x: 2 * x, y: 0});
      }, "blue");
  }

  for (let ix = 1; ix < N; ix ++) {
    const x = -1 + 2*ix/N;
    const y = Math.sqrt(1 - x * x);
    if (is_orig)
      line('z', {x: x, y: -y}, {x: x, y: y}, scale, "red");
    else
      curve("w-g", scale, t => {
        const z = {x: x, y: y * (2 * t - 1)};
        return func(z);
      }, t => {
        const z = {x: x, y: y * (2 * t - 1)};
        const d = derivative(z);
        return mul(d, {x: 0, y: 2 * y});
      }, "red");
  }
}

