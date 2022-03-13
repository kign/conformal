

let power_n = parseInt(document.getElementById('power_n').value);
// console.log("power_n =", power_n);

const Gamma = z => {
  const g = math.gamma(math.complex(z.x, z.y));
  if (g.re === undefined)
    return {x: g, y:0};
  return {x: g.re, y: g.im};
}

const fRef = {
  joukowsky: z => [add(z, div(One, z)), sub(One, div(One, mul(z,z)))],
  power: z => [to_n(z, power_n), mul_s(power_n, to_n(z, power_n - 1))],
  gamma: z => {
    const e = 0.01;
    const gz = Gamma(z);
    const gz1 = Gamma({x: z.x + e, y: z.y});
    return [gz, mul_s(1/e, sub(gz1, gz))];
  }
};

let name = document.querySelector('table.sel-func input[name="func"][checked="checked"]').id;

const scale = 2;
const font_size = 8;
const One = {x:1,y:0};

const mesh_cb = document.getElementById('mesh');
const w_main = document.getElementById('w-main');

straight_mesh("z-mesh", scale);

coordinate_mesh("z", scale);
coordinate_mesh("w", scale);

setup_callbacks();

function setup_callbacks () {
  const svg = document.getElementById('z');
  const g = document.getElementById("z-circle");
  let mode = null; // 'move', 'zoom'
  let r = 1;

  let start, t = {x: 0, y : 0}, pt;
  let lastRedrawTime = 0;

  const trf2geom = trf => {
    return {x: scale * trf.x / svg.viewBox.baseVal.width, y: scale * trf.y / svg.viewBox.baseVal.height};
  }

  const client2geom = client => {
    const rect = svg.getBoundingClientRect();
    return trf2geom({x: client.x - rect.left - svg.clientWidth / 2, y: client.y - rect.top - svg.clientHeight / 2});
  };

  const redraw = () => {
    const f = z => fRef[name](z)[0];
    const d = z => fRef[name](z)[1];

    unit_circle('w-main', scale, trf2geom(t), r, f, d);
    if (mesh_cb.checked)
      mesh_circle('w-main', scale, r, trf2geom(t), f, d);
  }

  mesh_cb.addEventListener('change', () => {
    document.getElementById('z-mesh').style.visibility = mesh_cb.checked? 'visible' : 'hidden';
    w_main.innerHTML = '';
    redraw();
  });

  for (const func_rb of document.querySelectorAll('table.sel-func input[name="func"]'))
    func_rb.addEventListener('change', function () {
      if (this.checked) {
        // console.log(this.id, this.checked);
        w_main.innerHTML = '';
        name = this.id;
        redraw();
      }
    });

  document.getElementById('power_n').addEventListener('change', function () {
    power_n = parseInt(this.value);
    if (name === "power") {
      w_main.innerHTML = '';
      redraw();
    }
  });

  svg.addEventListener('pointerdown',   evt => {
    evt.preventDefault();
    if (!mode) {
      const rect = svg.getBoundingClientRect();
      const x = scale * (evt.clientX - rect.left - svg.clientWidth/2 - t.x) / svg.viewBox.baseVal.width;
      const y = scale * (evt.clientY - rect.top - svg.clientHeight/2 - t.y) / svg.viewBox.baseVal.height;
      // console.log("x =", x, "; y =", y);
      const eps = 0.05;
      const d = Math.sqrt(x*x + y*y);
      if (d < (1 - eps) * r) {
        mode = 'move';
        pt = t;
        start = {x: evt.clientX, y: evt.clientY};
      }
      else if (d < (1 + eps) * r) {
        mode = 'zoom';
        start = {d: d, r: r};
      }
    }
  });
  const c = svg.viewBox.baseVal.width / svg.clientWidth;
  svg.addEventListener('pointermove',   evt => {
    if (mode === 'move') {
      t = {x : evt.clientX - start.x + pt.x, y : evt.clientY - start.y + pt.y};
      g.setAttribute('transform', `translate(${c*t.x} ${c*t.y}) scale(${r})`);
    }
    else if (mode === 'zoom') {
      const rect = svg.getBoundingClientRect();
      const x = scale * (evt.clientX - rect.left - svg.clientWidth/2 - t.x) / svg.viewBox.baseVal.width;
      const y = scale * (evt.clientY - rect.top - svg.clientHeight/2 - t.y) / svg.viewBox.baseVal.height;
      r = start.r - start.d + Math.sqrt(x*x + y*y);
      g.setAttribute('transform', `translate(${c*t.x} ${c*t.y}) scale(${r})`);
    }
    else
      return;
    window.requestAnimationFrame(ts => {
      if (ts > lastRedrawTime) {
        lastRedrawTime = ts;
        w_main.innerHTML = '';
        redraw();
      }
    });

  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(x =>
    svg.addEventListener(x, () => {
      // console.log(x);
      mode = null;
    }));
}


function coordinate_mesh(svg_id, scale) {
  const fu = font_size*scale/100;
  for (let tick = -scale; tick <= scale; tick ++) {
    const dash = -scale < tick && tick < scale ? '1 1' : null;
    line(svg_id, {x: tick, y: -scale}, {x: tick, y: scale}, scale, "black", dash);
    line(svg_id, {x: -scale, y: tick}, {x: scale, y: tick}, scale, "black", dash);

    text(svg_id, scale, {x: tick - 0.3 * fu, y: scale + fu}, tick);
    text(svg_id, scale, {x: tick - 0.3 * fu, y: -scale - 0.3 * fu}, tick);

    text(svg_id, scale, {x: scale + 0.1 * fu, y: tick + 0.5 * fu}, -tick);
    text(svg_id, scale, {x: -scale - 0.95 * fu, y: tick + 0.5 * fu}, -tick);
  }
}