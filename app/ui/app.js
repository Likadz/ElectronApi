const {ipcRenderer, remote } = require("electron");

const formLogin = document.querySelector("#form");
const nick = document.querySelector("#nick");
const password = document.querySelector("#pwd");

const rutaRegistro = document.querySelector("#rutaRegistro");
const btnExit = document.querySelector("#exit");

//cuando envia los datos del form 
formLogin.addEventListener('submit', e => {
  e.preventDefault(); 
  const usuario ={
    nombre:nick.value,
    contrasena: password.value,
    rol:"admin",
    conectado:false,
  }
  ipcRenderer.send('login', usuario)//enviamos el usuario con los datos al main
  form.reset();
});

rutaRegistro.addEventListener('click', function(){
  ipcRenderer.send('registro','registro');
});


//get todos los adimins
ipcRenderer.on('new-usuario-created', (e, args)=>{
  //console.log(args);
})

//login error
ipcRenderer.on("login-error", (e,args)=>{
  document.getElementById("msg").innerHTML=args;
})

//exit
btnExit.addEventListener('click', e => {
  var window = remote.getCurrentWindow();
  window.close();
});