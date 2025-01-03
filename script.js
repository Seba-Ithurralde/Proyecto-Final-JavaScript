function mostrarProductos() {
fetch("./products.json")
.then(response => response.json())
.then(productos => principal(productos))
.catch(error => sweetAlert(error, "Hubo un error al intentar mostrar los productos", "error"));
}

mostrarProductos();

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
    
    let compraProductos = document.getElementById("compraProductos");
    compraProductos.addEventListener("change", (e) => buyProducts(e, productos));
}

function buyProducts(e, productos) {
    const categoria = e.target.value; 
    const products = productos.filter(producto => producto.categoria.includes(categoria));
    generarProductos(products);
}

function calcularTotal(productos) {
    return productos.reduce((acum, producto) => acum + producto.subtotal, 0);
}

function actualizarTotal(total) {
    let elementoTotal = document.getElementById("total");
    elementoTotal.innerText = "Total de la compra: $" + total;
}

function comprarProductos () {
    localStorage.removeItem("carrito");
    sweetAlertPromises("¿Desea finalizar la compra?", "", "question", "Si", "No");
}

function buscarProductos (e, productos) {
    if (e.keyCode === 13) {
        let productosFiltrados = filtrar(e.target.value, productos);
        generarProductos(productosFiltrados);
    }
    e.target.value === "" && generarProductos(productos);
}

function botonProductos (input, productos) {
    let productosFiltrados = filtrar(input.value, productos);
    generarProductos(productosFiltrados);
}

function filtrar (valor, productos) {
    return productos.filter(({ nombre, categoria }) => (nombre.includes(valor) || categoria.includes(valor)));
}

function ocultarCarrito (e) {
    let carrito = document.getElementById("pantallaCarrito");
    let contenedorProductos = document.getElementById("pantallaProductos");
    
    carrito.classList.toggle("ocultar");
    contenedorProductos.classList.toggle("ocultar");
       
    e.target.innerText = e.target.innerText === "Carrito" ? "Productos" : "Carrito";
}

function generarProductos (productos) {
    let container = document.getElementById("contenedor");
    container.innerHTML = "";
    productos.forEach(({ image, nombre, precio, id }) => {
        let card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <article>
            <img src=${image} alt=${nombre}>
            <div id=centro>
            <h3>${nombre}</h3>
            <p>Precio: $${precio}</p>
            <button class=agregarAlCarrito id=agc${id}>Agregar al carrito</button>
            </div>
            </article>
            `

            container.appendChild(card);
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
            id,
            nombre,
            precioUnitario: precio,
            unidades: 1,
            subtotal: precio
        })
    } else {
        carrito[indiceCarrito].unidades++;
        carrito[indiceCarrito].subtotal = carrito[indiceCarrito].precioUnitario * carrito[indiceCarrito].unidades;
    }

    guardarCarrito(carrito);
    mostrarCarrito(carrito);

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
        fila.className = "tarjetaCarrito";
        fila.id = "tca" + id;
        fila.innerHTML = `
            <p id=carro>${nombre}</p>
            <p id=carro>$${precioUnitario}</p>
            <div id=unidades>
                <button id=run${id}> ➖ </button> 
                <p id=carro>${unidades}</p>
                <button id=sun${id}> ➕ </button>
            </div>
            <p id=carro>$${subtotal}</p>
            <p><button class=eliminarProducto id=eli${id}>Eliminar</button></p>
            `;
            
            carritoHTML.appendChild(fila);

            let eliminar = document.getElementById("eli" + id);
            eliminar.addEventListener("click", eliminarProducto);
            
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
    if (indiceCarrito !== -1) {
        carrito[indiceCarrito].unidades--;
        if (carrito[indiceCarrito].unidades === 0) {
            carrito.splice(indiceCarrito, 1);
            e.target.parentElement.parentElement.remove();
        } else {
            carrito[indiceCarrito].subtotal = carrito[indiceCarrito].precioUnitario * carrito[indiceCarrito].unidades;

            e.target.parentElement.children[1].innerText = carrito[indiceCarrito].unidades;
            e.target.parentElement.nextElementSibling.innerText = carrito[indiceCarrito].subtotal;
        }
        guardarCarrito(carrito);
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

function guardarCarrito (valor) {
    let valorProducto = JSON.stringify(valor);
    localStorage.setItem("carrito", valorProducto); 
}

function recuperarCarrito () {
    return JSON.parse(localStorage.getItem("carrito")) ?? [];
}

function eliminarProducto(e) {
    let id = Number(e.target.id.substring(3));
    let carrito = recuperarCarrito();
    let indiceCarrito = carrito.findIndex(producto => producto.id === id);
    if (indiceCarrito !== -1) {
        carrito.splice(indiceCarrito, 1);
        e.target.parentElement.remove();
    }

    guardarCarrito(carrito);
    const total = calcularTotal(carrito);
    actualizarTotal(total);
    mostrarCarrito(carrito);
}

function sweetAlert (title, text, icon) {
    Swal.fire ({
        icon,
        title,
        text,
    });
}


function sweetAlertPromises (title, text, icon, confirmButtonText, showDenyButton) {
    Swal.fire({
        title,
        text,
        icon,
        showDenyButton,
        confirmButtonText
    }).then((resultado) => {
            if (resultado.isConfirmed) {
                mostrarCarrito([]);
                localStorage.removeItem("carrito");
                Toastify({
                    text: `¡Muchas gracias por su compra!`,
                    duration: 3000,
                    style: 
                    {
                        background: "linear-gradient(to right, rgb(255, 82, 82), rgb(110, 77, 143))",
                    }
                }).showToast();
            } 
            else if (resultado.isDenied) {
                Toastify({
                    text: `¡Compra cancelada!`,
                    duration: 3000,
                    style: 
                    {
                        background: "linear-gradient(to right, rgb(166, 168, 24), rgb(255, 198, 112))",
                    }
                }).showToast();
            }    
        });
}