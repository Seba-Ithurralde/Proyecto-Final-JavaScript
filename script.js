function pedirProductos() {
    fetch("./products.json")
    .then(response => response.json())
    .then(productos => principal(productos))
    .catch(error => sweetAlert(error, "Hubo un error al intentar mostrar los productos", "error"));
}

pedirProductos();

function principal (productos) {

    let carrito = recuperarCarrito("carrito");
    mostrarCarrito(carrito);

    generarProductos(productos);

    let  inputBuscar= document.getElementById("buscar");
    inputBuscar.addEventListener("keyup", (e) => buscarProductos(e, productos));

    let botonBuscar = document.getElementById("botonBuscar");
    botonBuscar.addEventListener("click", () => botonProductos(inputBuscar, productos));

    let botonProductosCarrito = document.getElementById("productosCarrito");
    botonProductosCarrito.addEventListener("click", ocultarCarrito)

    let botonProducts = document.getElementsByClassName("agregarAlCarrito");
    for (const boton of botonProducts) {  
        boton.addEventListener("click", (e) => agregarCarrito(e, productos));
    }

    let botonComprar = document.getElementById("botonComprar");
    botonComprar.addEventListener("click", () => comprarProductos(carrito, productos));

    let vaciar = document.getElementById("carrito");
    vaciar.addEventListener("click", vaciarCarrito);

    let compraProductos = document.getElementById("compraProductos");
    compraProductos.addEventListener("change",(e) => buyProducts(e, productos));
}

principal();

function buyProducts(e, productos) {
    let categoria = e.target.value; 
    let products = productos.filter(producto => producto.categoria.includes(categoria));
    generarProductos(products);
}


function calcularTotal(productos) {
    return productos.reduce((acum, producto) => acum + producto.subtotal, 0);
}

function vaciarCarrito() {
    let carrito = document.getElementById("carrito");
    carrito.innerHTML = "";
}

function actualizarTotal(total) {
    let elementoTotal = document.getElementById("total");
    elementoTotal.innerText = "Total de la compra: $" + total
}

function comprarProductos () {
    mostrarCarrito([]);
    localStorage.removeItem("carrito");
    Toastify({
        text: `¡Muchas gracias por su compra!`,
        duration: 3000,
        style: 
        {
            background: "linear-gradient( rgb(255, 82, 82), rgb(110, 77, 143))",
        }
      }).showToast();
}

function buscarProductos (productos) {
    let inputBuscar = document.getElementById("buscar");
    let productosFiltrados = filtrar(inputBuscar.value, productos);
    generarProductos(productosFiltrados);
}

function botonProductos (e, productos) {
    if (e.keyCode === 13) {
        let productosFiltrados = filtrar(e.target.value, productos);
        generarProductos(productosFiltrados);
}

    e.target.value === "" && generarProductos(productos);
}

function filtrar (valor, productos) {
    return productos.filter(({ nombre, categoria }) => nombre.includes(valor) || categoria.includes(valor));
}

function ocultarCarrito (e) {
    let carrito = document.getElementById("pantallaCarrito");
    let contenedorProductos = document.getElementById("pantallaProductos");
    
    carrito.classList.toggle("ocultar");
    contenedorProductos.classList.toggle("ocultar");
       
    e.target.innerText = e.target.innerText === "Carrito" ? "Productos" : "Carrito";
}

function generarProductos (productos) {
    let contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = ""; 
    productos.forEach(({ image, nombre, precio, stock, id }) => {
        let card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <article>
            <img src="${image}" alt="${nombre}">
            <h3>${nombre}</h3>
            <p>Precio: $${precio}</p>
            <p>Stock: ${stock}</p>
            </p>
            <button class=agregarAlCarrito id="agc${id}">Agregar al carrito</button>
            </article>
            `;

        contenedor.append(card);
    });
}

function agregarCarrito (e, productos) {
    let carrito = recuperarCarrito();
    let idProducto = Number(e.target.id.substring(3));
    let producto = productos.find(({ id }) => id === idProducto);
    let { nombre, id, precio } = producto;
    let indiceCarrito = carrito.findIndex(({ id }) => id === idProducto);
    if (indiceCarrito === -1) {
        carrito.push({
            id: id,
            nombre: nombre,
            precioUnitario: precio,
            unidades: 1,
            subtotal: precio
        });
    
    } else {
        carrito[indiceCarrito].unidades++;
        carrito[indiceCarrito].subtotal = carrito[indiceCarrito].unidades * carrito[indiceCarrito].precioUnitario;
    }

    guardarCarrito(carrito);
    mostrarCarrito(carrito);
    const total = calcularTotal(carrito);
    actualizarTotal(total);

    Toastify({
        text: `Se agregó ${nombre} al carrito`,
        duration: 3000,
        style: 
        {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
      }).showToast();
}

function mostrarCarrito (carrito) {
    let carritoHTML = document.getElementById("carrito");
    carritoHTML.innerHTML = "";
    carrito.forEach(({ nombre, precioUnitario, unidades, subtotal, id }) => {
        let fila = document.createElement("div");
        fila.innerHTML = `
            <p>${nombre}</p>
            <p>$${precioUnitario}</p>
            <div class=unidades>
            <button id="run${id}"> - </button> 
            <p>${unidades}</p>
            <button id="sun${id}"> + </button>
            </div>
            <p>$${subtotal}</p>
            <p><button class=eliminarProducto id="eli${id}">Eliminar</button></p>
            `;
            
            carritoHTML.append(fila);

            let botonEliminar = document.getElementById("eli" + id);
            botonEliminar.addEventListener("click", eliminarProducto);
            
            let restar = document.getElementById("run" + id);
            restar.addEventListener("click", restarUnidad);
            
            let sumar = document.getElementById("sun" + id);
            sumar.addEventListener("click", sumarUnidad);
    });

    let total = calcularTotal(carrito);
    actualizarTotal(total);  
}

function restarUnidad (e) {
    let id = Number(e.target.id.substring(3));
    let carrito = recuperarCarrito();
    let indiceCarrito = carrito.findIndex(producto => producto.id === id);
    if (indiceCarrito !== -1 && indiceCarrito > 1) {
        carrito[indiceCarrito].unidades--;
        carrito[indiceCarrito].subtotal = carrito[indiceCarrito].unidades * carrito[indiceCarrito].precioUnitario;
        guardarCarrito(carrito);

        e.target.parentElement.children[1].innerText = carrito[indiceCarrito].unidades;
        e.target.parentElement.nextElementSibling.innerText = carrito[indiceCarrito].subtotal;
    }

    const total = calcularTotal(carrito);
    actualizarTotal(total);
}

function sumarUnidad (e) {
    let id = Number(e.target.id.substring(3));
    let carrito = recuperarCarrito();
    let indiceCarrito = carrito.findIndex (producto => producto.id === id);
    if (indiceCarrito !== -1) {
        carrito[indiceCarrito].unidades++;
        carrito[indiceCarrito].subtotal = carrito[indiceCarrito].unidades * carrito[indiceCarrito].precioUnitario;
        guardarCarrito(carrito);

        e.target.parentElement.children[1].innerText = carrito[indiceCarrito].unidades;
        e.target.parentElement.nextElementSibling.innerText = carrito[indiceCarrito].subtotal;
    }

    const total = calcularTotal(carrito);
    actualizarTotal(total);
}   

function guardarCarrito (clave, valor) {
    let valorProducto = JSON.stringify(valor);
    localStorage.setItem(clave, valorProducto);   
}

function recuperarCarrito () {
    let carrito = localStorage.getItem("carrito");
    if (carrito) {
        return JSON.parse(carrito);
    } else {
        return [];
    }
}

function eliminarProducto(e) {
    let carrito = recuperarCarrito();
    let id = Number(e.target.id.substring(3));
    let indiceCarrito = carrito.findIndex(producto => producto.id === id);
    if (indiceCarrito!== -1) {
        carrito.splice(indiceCarrito, 1);
        e.target.parentElement.remove();
    }

    guardarCarrito(carrito);
    const total = calcularTotal(carrito);
    actualizarTotal(total);
}

function sweetAlert(title, text, icon) {
    Swal.fire({
        title,
        text,
        icon,
    });
}