const { BrowserWindow, ipcMain, remote, ipcRenderer } = require("electron");
const Ruta = require("./models/Ruta");
const Usuario = require("./models/Usuario");
const { net } = require('electron')//para la conexion con la api

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  //pantalla completa
  //win.setFullScreen(true)

  win.loadFile("app/html/index.html");

}

//window registro
ipcMain.on("registro", (e, arg)=>{
  BrowserWindow.getFocusedWindow().loadFile('app/html/registro.html')//cambiamos el html de la ventana.
})

//cuando registra un usuario volvemos al login
ipcMain.on("volver-login", (e, arg)=>{
  BrowserWindow.getFocusedWindow().loadFile('app/html/index.html')//cambiamos el html de la ventana.
})

//crear un usuario usuarioistrador
ipcMain.on("create-usuario", async (e, arg) => {
  //const todosusuarios = usuario.find();
  console.log(arg);
  const newusuario = new Usuario(arg);
  const usuarioSaved = await newusuario.save();
  console.log(usuarioSaved);
  e.reply("new-usuario-created", JSON.stringify(usuarioSaved));
});

//LOGIN
ipcMain.on("login", async (e, arg) => {
  const usuario = new Usuario (arg);//usuario recibido por el form
  //llamada a la api
  //const request = net.request('http://127.0.0.1:8080/usuarios/getLogin/'+usuario.nombre +'/'+usuario.contrasena+'/'+usuario.rol)
  const request = net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/usuarios/getLogin/'+usuario.nombre +'/'+usuario.contrasena+'/'+usuario.rol,
    
  }); 

  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`);
    response.on('error', (error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`)
      e.reply("login-error","EL USUARIO O CONTRASEnA SON INCORRECTOS");
    })
    //cogemos la data 
    response.on('data', (chunk) => {
      if(typeof JSON.parse(chunk)[0] !== 'undefined'){
        console.log("en el if, al home");
        BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
      }else{
        e.reply("login-error","EL USUARIO O CONTRASEnA SON INCORRECTOS");
        console.log("EL USUARIO O CONTRASEnA SON INCORRECTOS");
      }
      
    })
    //para saber que ha acabado.
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  request.end()
  
  
  /*Con request all
  const request = net.request('http://127.0.0.1:8080/usuarios/all')
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data', (chunk) => {
      let usuariosCombo=[];//array de usuarios
      for(let i = 0; i< JSON.parse(chunk).length; i++){
        usuariosCombo.push(new Usuario(JSON.parse(chunk)[i]));//por cada elemento de la data parseada creamos un usuario en el array
      }
      //recorremos el array en busca de coincidencias
      for (let index = 0; index < usuariosCombo.length; index++) {
        const a=new Usuario (usuariosCombo[index])
        if(a.nombre==usuario.nombre && a.contrasena ==usuario.contrasena && a.rol == usuario.rol && !a.conectado && a.conectado==usuario.conectado){
          login=true;
        }
      }
      if(login){
        console.log("al home");
        BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
      }else{
        e.reply("login-error","EL USUARIO O CONTRASEnA SON INCORRECTOS");
        console.log("EL USUARIO O CONTRASEnA SON INCORRECTOS");
      }
     
    })
    //para saber que ha acabado.
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  request.end()*/
});
//Volver del registro al login
ipcMain.on("volver-login", async (e, arg) => {
  console.log("volver");
  BrowserWindow.getFocusedWindow().loadFile('app/html/index.html')//cambiamos el html de la ventana.
});


ipcMain.on("get-rutas", async (e, arg) => {
  //const request = net.request({method:'delete',path:'http://127.0.0.1:8080/rutas/getAll'})
  const request = net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/getAll'
    
  }); 
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data', (chunk) => {
      let rutas=[];//array de usuarios
      for(let i = 0; i< JSON.parse(chunk).length; i++){
        rutas.push(new Ruta(JSON.parse(chunk)[i]));//por cada elemento de la data parseada creamos un usuario en el array
      }
      e.reply("get-rutas", JSON.stringify(rutas));//pasamos las rutas al app.js
    })
  })
  request.end()
  
});

ipcMain.on("delete-ruta", async (e, args) => {
  //const rutaDeleted = await Ruta.findByIdAndDelete(args);
  console.log("delete " + args);
  //const request = net.request('http://127.0.0.1:8080/rutas/deleteId/'+args)
  const request = net.request({ 
    method: 'DELETE', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: 'rutas/deleteId/'+args
    
  }); 
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data', (chunk) => {
     
      
    })
  })
  request.end()
  BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.

});

ipcMain.on("buscar", async (e, arg) => {
  const request = net.request('http://127.0.0.1:8080/rutas/getCiudad/'+arg)
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data', (chunk) => {
      let rutas=[];//array de usuarios
      for(let i = 0; i< JSON.parse(chunk).length; i++){
        rutas.push(new Ruta(JSON.parse(chunk)[i]));//por cada elemento de la data parseada creamos un usuario en el array
      }
      
      e.reply("busqueda-realizada", JSON.stringify(rutas));//pasamos las rutas al app.js
    })
  })
  request.end()
});

ipcMain.on("exit", async (e, arg) => {
  console.log("LOGOUT");
  BrowserWindow.getFocusedWindow().loadFile('app/html/index.html')//cambiamos el html de la ventana.
});

//ir al form de crear ruta
ipcMain.on("create-ruta-form", async (e, arg) => {
  console.log("vamos al form");
  BrowserWindow.getFocusedWindow().loadFile('app/src/nuevo/index.html')//cambiamos el html de la ventana.
});

//ir al form de editar ruta
ipcMain.on("edit-ruta-form", async (e, arg) => {
  console.log("vamos al form edit");
  BrowserWindow.getFocusedWindow().loadFile('app/src/editar/index.html')//cambiamos el html de la ventana.
});

module.exports = { createWindow };
