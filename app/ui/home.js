const {ipcRenderer } = require("electron");
const { $where } = require("../models/Ruta");

const seleccionado =  document.querySelector("#ciudad");
const rutaList = document.querySelector("#rutaList");

const btnBuscar =document.querySelector("#btnBuscar");
const btnClean = document.querySelector("#btnClean");
const exit = document.querySelector(".exit");

const btnAdd = document.querySelector("#btnAdd");


//add ruta (ir al form)
document.querySelector("#btnAdd").addEventListener('click', e => {
    ipcRenderer.send('addRuta');
});


function deleteruta(id) {
    
    const response = confirm("¿esta seguro de que quiere eliminarlo?");
    if (response) {
      ipcRenderer.send("delete-ruta", id);
    }
    return;
}
function editruta(id) {
    ipcRenderer.send("edit-ruta-form");
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
                    <p class="card-text">Ciudad: ${t.ciudad} </p>
                    <p class="card-text">Dificultad: ${t.dificultad} </p>
                    <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <button class="btn btn-danger" onclick="deleteruta('${t.id}')">🗑 Delete</button>
                        <button class="btn btn-secondary" onclick="editruta('${t.id}')">✎ Edit</button>
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
    console.log("GET RUTAS " + args)
    const receivedrutas = JSON.parse(args);
    rutas = receivedrutas;
    renderrutas(rutas);
});

ipcRenderer.on("delete-ruta-success", () => {
    ipcRenderer.send("get-rutas");
    //renderrutas(rutas);
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

//ir al formulario
btnAdd.addEventListener('click', e => {
    console.log("ir al formulario de ruta");
    ipcRenderer.send("create-ruta-form");
});
  