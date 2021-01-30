const {ipcRenderer } = require("electron");
const { $where } = require("../models/Ruta");

const rutaList = document.querySelector("#rutaList");
const btnBuscar =document.querySelector("#btnBuscar");
const btnClean = document.querySelector("#btnClean");
const exit = document.querySelector(".exit");
const btnAdd = document.querySelector("#btnAdd");
const loading = document.querySelector("#loading");


//const btnChat = document.querySelector("#imgChat");
//add ruta (ir al form)
document.querySelector("#btnAdd").addEventListener('click', e => {
    ipcRenderer.send('addRuta');
});

//funcion para cuando selecciona eliminar una ruta
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
//mostrar las rutas actuales
function renderrutas(rutas) {
    rutaList.innerHTML = "";
    console.log(rutas['imagen']);
    
    rutas.map(r => {
    //si la ruta no tiene imagen definida le ponemos una basica
    if( r.imagen==null || r.imagen=="" ){
        if(r.tematica =="comida"){
            r.imagen="comida.jpg";
        }else if(r.tematica=="turismo"){
            r.imagen="turismo.jpg";
        }else{
            r.imagen="misterio.jpg";
        }
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
                        <button class="btn btn-danger" onclick="deleteruta('${r.id}')">🗑 Delete</button>
                        <button class="btn btn-secondary" onclick="editruta('${r.id}')">✎ Edit</button>
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



/* **************************************
  ************ CHAT  ********************
 ***************************************/
//CONSTANTES
const listadoChat = document.querySelector(".listaChats");
const rutasChat = document.querySelector("#rutasChats");
const chatRuta = document.querySelector("#chatRuta");
const menuChat = document.querySelector(".menuChat");
const volverChat = document.querySelector(".imgVolverRutasChat");
const btnChat=document.querySelector("#imgChat");

var net = require('net');

var usuario = "Endibra";
var ruta = "";
//conexion 
puerto = 1234;
//ip = '10.10.12.183'//IP Mikel

//ip servidor
//ip='13.95.106.247' 
//puerto chat
//443

ip = '127.0.0.1' //local
var client = new net.Socket();

//click boton chat
btnChat.addEventListener('click',e=>{
    ipcRenderer.send('chat');
});
//mostramos el chat 
ipcRenderer.on("chat", (e,arg)=>{
    menuChat.style.visibility="visible";//activamos la visibilidad
    renderChatRutas(JSON.parse(arg));//render de la lista de chats existentes
})


//Funcion para crear lista de chat rutas
function renderChatRutas(rutas) {
    menuChat.style.visibility="visible";//activamos la visibilidad
    listadoChat.innerHTML = "";
    rutas.map(r => {
        listadoChat.innerHTML += `<li><a href="#"  onclick="conexion('${r.nombre}')">${r.nombre}</a></li>`;
    });
}

//conexion cliente
client.connect(puerto, ip, function() {
    console.log('Conectado');
});

//cuando damos volver ocultamos el chat y volvemos a la lista
volverChat.addEventListener('click',e=>{
    rutasChat.style.visibility='visible';
    chatRuta.style.visibility='hidden';
})
//cuando clica un chat mostramos su conversacion
function conexion(route) {
    rutasChat.style.visibility='hidden';
    chatRuta.style.visibility='visible';
    ruta = route;
    $("#nombreRuta").html(ruta);
    var loginJson = '{ "action": "login", "user":"'+usuario+'", "route":"'+ruta+'"}';
    
   // client.write(loginJson);
    //client.write("\n");
}

function desconexion() {
    $(".textareaChat").val("");
    $(".textareaChat").height('5px');
    var contenidoChat = document.getElementById("contenidoChat");
    contenidoChat.innerHTML="";
}


client.on("data", (data) => {
    var datos = JSON.parse(data);
    anadirTextoExterno(datos);
});

function escribirTextoInterno(mensaje) {
    var mensajeJSON = '{"action":"msg","from":"'+usuario+'","route":"'+ruta+'","value":"'+mensaje+'"}';
    client.write(mensajeJSON);
    client.write("\n");
}


function botonPulsado() {
    //si se le da enter, envia el texto automaticamente
    if (window.event.keyCode === 13) {
        anadirTexto();
        
        //vaciamos el textarea y le ajustamos el tamaño en caso de que haya escrito mucho
        $(".textareaChat").val("");
        $(".textareaChat").height('5px');

        //evitamos que ponga un espacio cuando no hace falta
        window.event.preventDefault();
    }
}

function anadirTexto() {
    mensaje = $('.textareaChat').val();
    if(mensaje != ""){
        escribirTextoInterno(mensaje);
        var content = document.createElement("div");

        content.innerHTML = mensaje;
    
        $('#contenidoChat').append(content).append('<hr>');

        //vaciamos el textarea
        $(".textareaChat").val("");
        $(".textareaChat").height('5px');
    }
}

function anadirTextoExterno(json) {
    if(json["value"] != ""){
        var content = document.createElement("div");

        //cambiamos
        mensaje = json["value"];

        content.innerHTML = mensaje;
    
        $('#contenidoChat').append(content).append('<hr>');
    }
}

