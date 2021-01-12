const {ipcRenderer } = require("electron");

const formLogin = document.querySelector("#form");
const nick = document.querySelector("#nick");
const password = document.querySelector("#pwd");

const rutaRegistro = document.querySelector("#rutaRegistro");
//cuando envia los datos del form 
formLogin.addEventListener('submit', e => {
  e.preventDefault(); 
  const usuario ={
    nombre:nick.value,
    contraseña: password.value,
    rol:"admin",
    conectado:false,
  }
  //ipcRenderer.send('create-usuario', usuario)
  console.log("login pulsado");
  ipcRenderer.send('login', usuario)//enviamos el usuario con los datos al main
  //console.log(taskName.value , taskDescription.value);
  form.reset();
});

rutaRegistro.addEventListener('click', function(){
  console.log("registro");
  ipcRenderer.send('registro','registro');
});


//get todos los adimins
ipcRenderer.on('new-usuario-created', (e, args)=>{
  console.log(args);
})

//login error
ipcRenderer.on("login-error", (e,args)=>{
  document.getElementById("msg").innerHTML=args;
})
