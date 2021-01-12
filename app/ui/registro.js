const {ipcRenderer } = require("electron");

const formRegistro = document.querySelector("#formRegistro");
const nick = document.querySelector("#nickRegistro");
const password = document.querySelector("#pwdRegistro");
const nombre = document.querySelector("#nombreRegistro");
const apellido = document.querySelector("#apellidoRegistro");


formRegistro.addEventListener('submit', e => {
  console.log("registrar");
  e.preventDefault(); 
  const admin ={
    usuario:nick.value,
    nombre:nombre.value,
    contraseña: password.value,
    apellido:apellido.value,
    rol:"admin",
    conectado:false,
  }
  ipcRenderer.send('create-admin', admin)
  form.reset();
});


//get todos los adimins
ipcRenderer.on('new-admin-created', (e, args)=>{
  console.log(args);
  ipcRenderer.send('volver-login', 'volver');
})
