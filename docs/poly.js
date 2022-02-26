
// mesh_circle("w", z => mul(z, z), z => mul(z, {x: 2, y: 0} ) );
// mesh_circle("w", z => mul(z,mul(z, z)), z => mul(z, mul(z, {x: 3, y: 0} )) );

mesh_n(1)

function mesh_n(n) {
  mesh_circle('w-g', 1, 1, {x: 0, y: 0}, z => to_n(z, n), z => n ? mul({x: n, y: 0}, to_n(z, n - 1)) : {x: 0, y: 0});
}

document.getElementById("n").addEventListener("change", function()  {
  const n = parseInt(this.value);
  console.log("n =", n);
  const svg_g = document.getElementById('w-g');
  svg_g.innerHTML = '';
  mesh_n(n);
})
