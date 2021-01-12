const {ipcRenderer } = require("electron");

const seleccionado =  document.querySelector("#ciudad");
const rutaList = document.querySelector("#rutaList");

const btnBuscar =document.querySelector("#btnBuscar");
const btnClean = document.querySelector("#btnClean");
const exit = document.querySelector(".exit");
//add ruta (ir al form)
document.querySelector("#btnAdd").addEventListener('click', e => {
    ipcRenderer.send('addRuta');
});


function deleteruta(id) {
    const response = confirm("are you sure you want to delete it?");
    if (response) {
      ipcRenderer.send("delete-ruta", id);
    }
    return;
}

function renderrutas(rutas) {
    rutaList.innerHTML = "";
    console.log(rutas);
    rutas.map(t => {
    rutaList.innerHTML += `
        <div class="col-md-4 " >
            <div class="card mb-4 cardMisEfectos">
                <img class="card-img-top" src="../resources/${t.imagen}" alt="ruta image cap">
                <div class="card-body">
                    <p class="card-text">${t.nombre}</p>
                    <p class="card-text">${t.descripcion}</p>
                    <p class="card-text">Transporte: ${t.transporte} </p>
                    <p class="card-text">Localidad: ${t.ciudad} </p>
                    <p class="card-text">Dificultad: ${t.dificultad} </p>
                    <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <button class="btn btn-danger" onclick="deleteruta('${t._id}')">🗑 Delete</button>
                        <button class="btn btn-secondary" onclick="editruta('${t._id}')">✎ Edit</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
}

let rutas = [];

ipcRenderer.send("get-rutas");

ipcRenderer.on("get-rutas", (e, args) => {
    const receivedrutas = JSON.parse(args);
    rutas = receivedrutas;
    renderrutas(rutas);
});

ipcRenderer.on("delete-ruta-success", (e, args) => {
    const deletedruta = JSON.parse(args);
    const newrutas = rutas.filter(t => {
      return t._id !== deletedruta._id;
    });
    rutas = newrutas;
    renderrutas(rutas);
});
  
//formulario filtros
btnBuscar.addEventListener('click', e => {
    const ciudad = document.querySelector("#ciudad");
    ipcRenderer.send('buscar', ciudad.value);
    
});

btnClean.addEventListener('click', e => {
    console.log("limpiar filtro");
    ipcRenderer.send("get-rutas");
});

ipcRenderer.on("busqueda-realizada", (e, args) => {
    const rutas = JSON.parse(args);
    console.log("los rutas " +rutas);
    //rutas = newrutas;
    renderrutas(rutas);
});

exit.addEventListener('click', e => {
    ipcRenderer.send('exit', 'salir');    
});
  