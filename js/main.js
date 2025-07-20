class Servicio {
  constructor(nombre, precio, descripcion, imagen) {
    this.nombre = nombre;
    this.precio = precio;
    this.descripcion = descripcion;
    this.imagen = imagen;
    this.cantidad = 1;
  }
}

const servicios = [];
let serviciosSeleccionados = JSON.parse(localStorage.getItem("seleccionados")) || [];

function guardarEnStorage() {
  localStorage.setItem("seleccionados", JSON.stringify(serviciosSeleccionados));
}

function mostrarServicios() {
  const container = document.getElementById("servicios-container");
  container.innerHTML = "";

  servicios.forEach((s) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="../assets/${s.imagen}" alt="${s.nombre}" />
      <h3>${s.nombre}</h3>
      <p>${s.descripcion}</p>
      <p>$${s.precio}</p>
      <button>Agregar</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      const existe = serviciosSeleccionados.find(serv => serv.nombre === s.nombre);
      if (existe) {
        existe.cantidad++;
      } else {
        serviciosSeleccionados.push({...s});
      }
      guardarEnStorage();
      mostrarSeleccionados();
    });

    container.appendChild(div);
  });
}

function mostrarSeleccionados() {
  const lista = document.getElementById("lista-seleccionados");
  lista.innerHTML = "";

  serviciosSeleccionados.forEach((s, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${s.nombre} - $${s.precio} x ${s.cantidad}
      <div class="controles">
        <button onclick="cambiarCantidad(${index}, 1)">+</button>
        <button onclick="cambiarCantidad(${index}, -1)">-</button>
        <button onclick="eliminarServicio(${index})">🗑️</button>
      </div>
    `;
    lista.appendChild(li);
  });

  const total = serviciosSeleccionados.reduce((acc, s) => acc + s.precio * s.cantidad, 0);
  document.getElementById("total").textContent = `Total: $${total}`;
}

function cambiarCantidad(index, delta) {
  serviciosSeleccionados[index].cantidad += delta;
  if (serviciosSeleccionados[index].cantidad <= 0) {
    serviciosSeleccionados.splice(index, 1);
  }
  guardarEnStorage();
  mostrarSeleccionados();
}

function eliminarServicio(index) {
  serviciosSeleccionados.splice(index, 1);
  guardarEnStorage();
  mostrarSeleccionados();
}

function soloLetrasYEspacios(texto) {
  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];
    if (!((char >= "A" && char <= "Z") || (char >= "a" && char <= "z") || char === " ")) {
      return false;
    }
  }
  return true;
}

async function cargarServiciosDesdeJSON() {
  try {
    const res = await fetch("../data/servicios.json");
    const data = await res.json();
    data.forEach(s => {
      servicios.push(new Servicio(s.nombre, s.precio, s.descripcion, s.imagen));
    });
    mostrarServicios();
    mostrarSeleccionados();
  } catch (error) {
    console.error("Error al cargar servicios:", error);
  }
}

document.getElementById("form-cliente").addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre-cliente").value.trim();
  const direccion = document.getElementById("direccion-cliente").value.trim();
  const email = document.getElementById("email-cliente").value.trim();
  const telefono = document.getElementById("telefono-cliente").value.trim();

  if (!soloLetrasYEspacios(nombre)) {
    return Swal.fire("Nombre inválido", "Solo letras y espacios por favor.", "error");
  }

  if (!direccion || !email || !telefono) {
    return Swal.fire("Campos incompletos", "Completá todos los campos.", "error");
  }

  if (serviciosSeleccionados.length === 0) {
    return Swal.fire("Carrito vacío", "Agregá al menos un servicio.", "warning");
  }

  const resumen = serviciosSeleccionados.map(s =>
    `<li>${s.nombre} x ${s.cantidad} - $${s.precio * s.cantidad}</li>`
  ).join("");

  const total = serviciosSeleccionados.reduce((acc, s) => acc + s.precio * s.cantidad, 0);

  Swal.fire({
    title: "Pedido Confirmado",
    html: `
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Dirección:</strong> ${direccion}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <ul>${resumen}</ul>
      <p><strong>Total:</strong> $${total}</p>
    `,
    icon: "success"
  });

  serviciosSeleccionados = [];
  guardarEnStorage();
  mostrarSeleccionados();
  document.getElementById("form-cliente").reset();
});

cargarServiciosDesdeJSON();