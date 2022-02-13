
// mesh_circle("w", z => mul(z, z), z => mul(z, {x: 2, y: 0} ) );
// mesh_circle("w", z => mul(z,mul(z, z)), z => mul(z, mul(z, {x: 3, y: 0} )) );

mesh_n(1)

function mesh_n(n) {
  mesh_circle('w-g', z => to_n(z, n), z => n?mul({x:n, y: 0}, to_n(z, n - 1)):{x:0,y:0});
}

document.getElementById("n").addEventListener("change", function()  {
  const n = parseInt(this.value);
  console.log("n =", n);
  const svg_g = document.getElementById('w-g');
  svg_g.innerHTML = '';
  mesh_n(n);
})

function mesh_circle(svg_id, func, derivative) {
  const N = 20;

  for (let iy = 1; iy < N; iy ++) {
    const y = -1 + 2*iy/N;
    const x = Math.sqrt(1 - y * y);
    curve(svg_id,t => {
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
    curve(svg_id, t => {
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