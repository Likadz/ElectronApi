const {ipcRenderer } = require("electron");

const formRegistro = document.querySelector("#formRegistro");
const nick = document.querySelector("#nickRegistro");
const password = document.querySelector("#pwdRegistro");
const nombre = document.querySelector("#nombreRegistro");
const apellido = document.querySelector("#apellidoRegistro");
const btnVolver = document.querySelector("#imgVolver");

formRegistro.addEventListener('submit', e => {
  e.preventDefault(); 
  const admin ={
    usuario:nick.value,
    nombre:nombre.value,
    contrasena: password.value,
    apellido:apellido.value,
    rol:"admin",
    conectado:false,
  }
  ipcRenderer.send('create-admin', admin)
  formRegistro.reset();
});


//get todos los adimins
ipcRenderer.on('new-admin-created', (e)=>{
  ipcRenderer.send('volver-login');
})
//boton volver a login
btnVolver.addEventListener('click', e => {
  ipcRenderer.send("volver-login");
});
