const { BrowserWindow, ipcMain, remote, ipcRenderer } = require("electron");
const Ruta = require("./models/Ruta");
const Usuario = require("./models/Usuario");
const { net } = require('electron')//para la conexion con la api
const delay = ms => new Promise(res => setTimeout(res, ms));
const Pregunta = require("./models/Pregunta");
var idUsuarioConectado;
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

  win.loadFile("app/html/login.html");

}

//window registro
ipcMain.on("registro", (e, arg)=>{
  BrowserWindow.getFocusedWindow().loadFile('app/html/registro.html')//cambiamos el html de la ventana.
})

//cuando registra un usuario volvemos al login
ipcMain.on("volver-login", (e, arg)=>{
  BrowserWindow.getFocusedWindow().loadFile('app/html/login.html')//cambiamos el html de la ventana.
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
        idUsuarioConectado=JSON.parse(chunk)[0]['id'] 
        console.log( JSON.parse(chunk)[0]);
        const request = net.request({ 
          method: 'PUT', 
          protocol: 'http:', 
          hostname: '127.0.0.1', 
          port: 8080,
          path: 'usuarios/conectarUsuario/'+ idUsuarioConectado   
        }); 
        request.end()
     
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
  
});


ipcMain.on("get-rutas", async (e, arg) => {
  
  //const request = net.request({method:'delete',path:'http://127.0.0.1:8080/rutas/getAll'})
  request = net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/getAll'
  }); 

  request.on('response',  (response) => {
    //await delay(3000);
    //cogemos la data 
    response.on('data',async (chunk) => {
      try{
        //variables inicializadas limpias
        chunkString=null;
        datos="";
        rutas=[];
        
        console.log("\nchunkString -" + chunkString + "- datos -" + datos + "- rutas -" + rutas);
        //cambiamos los valores de las variables
        chunkString=chunk.toString();
      //  console.log("---------------------------\ndatos en STRING\n---------------------------------\n" + chunkString);

        datos= JSON.parse(chunkString);
      //  console.log("---------------------------------\nDATOS\n---------------------------------\n" + datos + " - " + datos.length);

        rutas = JSON.stringify(datos);
      //  console.log("---------------------------------\nARRAY RUTAS\n---------------------------------\n" + rutas);
        e.reply("get-rutas", JSON.stringify(datos));//pasamos las rutas al app.js
      }catch(SyntaxError){
        console.log("el puto error");
        await delay(2000);
        BrowserWindow.getFocusedWindow().reload();
        //BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
      }
    },
    response.on('error', (error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`)
      //e.reply("login-error","EL USUARIO O CONTRASEnA SON INCORRECTOS");
    }),
    response.on('SyntaxError', function (error) {
      console.log("ERROR DE SINTAXIS")
    }));
    
  }) 
  request.on("error",(error) => {
    console.log(`ERROR: ${JSON.stringify(error)}`)
    //e.reply("login-error","EL USUARIO O CONTRASEnA SON INCORRECTOS");
  }),
  request.end()
  
});

ipcMain.on("delete-ruta", async (e, args) => {
  //const rutaDeleted = await Ruta.findByIdAndDelete(args);
  //console.log("delete " + args);
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
  //BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
  BrowserWindow.getFocusedWindow().reload();
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
  console.log(idUsuarioConectado);
  const request = net.request({ 
    method: 'PUT', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: 'usuarios/desconectarUsuario/'+ idUsuarioConectado   
  }); 
  request.end()
  idUsuarioConectado="";
  //console.log("LOGOUT");
  BrowserWindow.getFocusedWindow().loadFile('app/html/login.html')//cambiamos el html de la ventana.
});

//ir al form de crear ruta
ipcMain.on("create-ruta-form", async (e, arg) => {
  BrowserWindow.getFocusedWindow().loadFile('app/src/nuevo/nuevoForm.html')//cambiamos el html de la ventana.
});

//ir al form de editar ruta
ipcMain.on("edit-ruta-form", async (e, arg) => {
  console.log("vamos al form edit");
  console.log(arg);
  BrowserWindow.getFocusedWindow().loadFile('app/src/editar/editForm.html')//cambiamos el html de la ventana.
});

ipcMain.on("volver-home", async (e, arg) => {
  BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
});

//crear ruta
ipcMain.on("crear-ruta", async (e, arg) => {
  var elBody = JSON.stringify(arg);
 // console.log("crear Ruta " + JSON.parse(elBody));
  const request = net.request({ 
    method: 'POST', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/add',
    headers: {
      'Content-Type': 'application/json'
    }, 
  }); 
  //obtener id ruta
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data', (chunk) => {
  //    console.log('RUTA ' + JSON.parse(chunk));
    })
  })
  request.write(elBody);
  request.end();
});
//funcion obtener id ultima ruta
function obtenerIdRuta(localizacion){
 // console.log("obtener ultima id ");
  var idRuta="";//var id
  const request = net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/getUltimaRuta'    
  }); 
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data',async (chunk) => {
      var ruta=JSON.parse(chunk);
      idRuta=ruta['id'];//actualizamos la variable con el valor de la id
      crearLocalizacion(idRuta, localizacion);//llamamos a la funcion para crear la localizacion con la id y la localizacion actual
    })
  })
  request.end();
}
//funcion crear localizacion
function crearLocalizacion(idruta, localizacion){
  console.log(localizacion);
  //recorremos el array de localizaciones para obtener un json de uno en uno 
  for(let i=0; i< localizacion.length; i++){
    var elBody = JSON.stringify(localizacion[i]);//obtenemos el obj localizacion
    
    var json=JSON.parse(elBody);//creamos un json con el obj
    json.rutaId=idruta;//modificamos el key 'rutaId'
 //   console.log(json);
    elBody=JSON.stringify(json);//volvemos a asignar al body los datos
    console.log("EL BODY " + elBody);
    /*var p=[];
    p = JSON.parse(elBody['pregunta']);

    console.log("PREGUNTA " + p );
    elBody['pregunta']=JSON.parse(p);
    console.log("EL BODY2 " + elBody);*/


    //hacemos la llamada mandando el body
    const request = net.request({ 
      method: 'POST', 
      protocol: 'http:', 
      hostname: '127.0.0.1', 
      port: 8080,
      path: '/localizaciones/add',
      headers: {
        'Content-Type': 'application/json'
      },   
    }); 
    request.on('response', (response) => {
      //cogemos la data 
      response.on('data', (chunk) => {
 //       console.log('localizacion ' + JSON.parse(chunk));
      })
    })
    request.write(elBody);
    request.end();
    
  }
 // await delay(5000);
  actualizarDatos(idruta);//funcion para actualizar la lista de localizaciones de la ruta
}
//actualizar la lista de localizaciones de la ruta con id X
function actualizarDatos(id){
 // console.log("id " + id);
  const request = net.request({ 
    method: 'PUT', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/editIdListado/'+id,
    headers: {
      'Content-Type': 'application/json'
    },   
  }); 
  request.on('response', (response) => {
    response.on('data', (chunk) => {
      console.log("datos actualizados");
    })
  })
  request.end();
}

//crear localizacion
ipcMain.on("crear-localizacion", (e, arg) => {
  //llamamos a la funcion para obtener la id de la última ruta creada
  obtenerIdRuta(arg);
});

module.exports = { createWindow };
