const {ipcRenderer } = require("electron");
const { $where } = require("../models/Ruta");

const seleccionado =  document.querySelector("#ciudad");
const rutaList = document.querySelector("#rutaList");

const btnBuscar =document.querySelector("#btnBuscar");
const btnClean = document.querySelector("#btnClean");
const exit = document.querySelector(".exit");

const btnAdd = document.querySelector("#btnAdd");
const loading = document.querySelector("#loading");

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
    ipcRenderer.send("edit-ruta-form",id);
}
function renderrutas(rutas) {
    rutaList.innerHTML = "";
    console.log(rutas);
    
    rutas.map(r => {
    //si la ruta no tiene imagen definida le ponemos una basica
    if(r.imagen=="" || r.imagen==null){
        r.imagen="fondo.jpg";
    }
    rutaList.innerHTML += `
        <div class="col-md-4 " >
            <div class="card mb-4 cardMisEfectos">
                <img class="card-img-top" src="../resources/${r.imagen}" alt="ruta image cap">
                <div class="card-body">
                    <p class="card-text">${r.nombre}</p>
                    <p class="card-text">${r.descripcion}</p>
                    <p class="card-text">Transporte: ${r.transporte} </p>
                    <p class="card-text">Ciudad: ${r.ciudad} </p>
                    <p class="card-text">Dificultad: ${r.dificultad} </p>
                    <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <button class="btn btn-danger" onclick="deleteruta('${r._id}')">🗑 Delete</button>
                        <button class="btn btn-secondary" onclick="editruta('${r._id}')">✎ Edit</button>
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
   
    loading.style.visibility='hidden';
    const receivedrutas = JSON.parse(args);
    rutas = receivedrutas;
    console.log("GET RUTAS " + rutas)
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
  
ipcRenderer.on('edit-ruta', (e, args) => {
    console.log("editar ruta " + args);
    var ruta = JSON.parse(args);
    console.log(ruta['nombre']);
  });