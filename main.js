class Servicio {
  constructor(nombre, precio) {
    this.nombre = nombre;
    this.precio = precio;
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

  servicios.forEach((servicio) => {
    const btn = document.createElement("button");
    btn.textContent = `${servicio.nombre} - $${servicio.precio}`;
    btn.addEventListener("click", () => {
      serviciosSeleccionados.push(servicio);
      guardarEnStorage();
      mostrarSeleccionados();
    });
    container.appendChild(btn);
  });
}

function mostrarSeleccionados() {
  const lista = document.getElementById("lista-seleccionados");
  lista.innerHTML = "";

  serviciosSeleccionados.forEach((servicio) => {
    const li = document.createElement("li");
    li.textContent = `${servicio.nombre} - $${servicio.precio}`;
    lista.appendChild(li);
  });
}

function mostrarTotal() {
  let total = serviciosSeleccionados.reduce((acc, s) => acc + s.precio, 0);

  Swal.fire({
    title: 'Total a pagar',
    text: `El total es $${total}`,
    icon: 'info',
    confirmButtonText: 'Aceptar'
  });
}

function limpiarCarrito() {
  serviciosSeleccionados = [];
  guardarEnStorage();
  mostrarSeleccionados();
  document.getElementById("total").textContent = "";
}

document.getElementById("ver-total").addEventListener("click", mostrarTotal);
document.getElementById("limpiar-carrito").addEventListener("click", limpiarCarrito);

async function cargarServiciosDesdeJSON() {
  try {
    const res = await fetch("servicios.json");
    const data = await res.json();
    servicios.push(...data.map(s => new Servicio(s.nombre, s.precio)));
    mostrarServicios();
    mostrarSeleccionados();
  } catch (error) {
    console.error("Error al cargar los servicios:", error);
  }
}

cargarServiciosDesdeJSON();

document.getElementById("form-cliente").addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre-cliente").value.trim();
  const direccion = document.getElementById("direccion-cliente").value.trim();

  if (serviciosSeleccionados.length === 0) {
    Swal.fire({
      title: "Carrito vacío",
      text: "Seleccioná al menos un servicio antes de confirmar.",
      icon: "warning",
      confirmButtonText: "OK"
    });
    return;
  }

  if (nombre === "" || direccion === "") {
    Swal.fire({
      title: "Datos incompletos",
      text: "Por favor completá todos los campos.",
      icon: "error",
      confirmButtonText: "OK"
    });
    return;
  }

  let total = serviciosSeleccionados.reduce((acc, s) => acc + s.precio, 0);

  Swal.fire({
    title: "¡Pedido confirmado!",
    html: `
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Dirección:</strong> ${direccion}</p>
      <p><strong>Total:</strong> $${total}</p>
    `,
    icon: "success",
    confirmButtonText: "Aceptar"
  });

  serviciosSeleccionados = [];
  guardarEnStorage();
  mostrarSeleccionados();
  document.getElementById("total").textContent = "";
  document.getElementById("form-cliente").reset();
});