const { BrowserWindow, ipcMain, remote } = require("electron");
const Ruta = require("./models/Ruta");
const Usuario = require("./models/Usuario");
const { net } = require('electron')//para la conexion con la api

//variables globales
var idUsuarioConectado;
var rutaEdit;
var localizacionEdit;
var win;
//Creacion de la ventana
function createWindow() {
    win = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon:'./app/resources/explorer.png'//cambiar el logo del programa
  });

  win.maximize();
  
  //pantalla completa
  win.setFullScreen(true)
  win.removeMenu();//quitar menu superior
  win.loadFile("app/html/login.html");//html de login

}

/* ***************************************************************************************************
*********************************** REGISTRO  ********************************************************
*****************************************************************************************************/
//cargar pantalla
ipcMain.on("registro", (e, arg)=>{
  win.loadFile('app/html/registro.html')//cambiamos el html de la ventana.
})

//volvemos al login
ipcMain.on("volver-login", (e)=>{
  win.loadFile('app/html/login.html')//cambiamos el html de la ventana.
})

//crear un usuario 
ipcMain.on("create-admin", async (e, arg) => {
  var usuario  = JSON.parse(JSON.stringify(arg));
  const request = await net.request({ 
    method: 'POST', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/usuarios/add',
    headers: {
      'Content-Type': 'application/json'
    }, 
    body:usuario,
  }); 
  
  request.write(JSON.stringify(usuario));//enviamos el body
  request.end();
  e.reply("new-admin-created");
});

/* ***************************************************************************************************
************************************** LOGIN  ********************************************************
*****************************************************************************************************/
//comprobar si existe, en caso afirmativo reenviamos al usuario al home
ipcMain.on("login", async (e, arg) => {
  const usuario = new Usuario (arg);//usuario recibido por el form
  //llamada a la api
  const request = net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/usuarios/getLogin/'+usuario.nombre +'/'+usuario.contrasena+'/'+usuario.rol,
    
  }); 
  //respuesta de la llamada a la api
  request.on('response', (response) => {
    response.on('error', (error) => {
      e.reply("login-error","EL USUARIO O CONTRASEnA SON INCORRECTOS");
    })
    //cogemos la data 
    response.on('data', (chunk) => {
      if(typeof JSON.parse(chunk)[0] !== 'undefined'){//si nos devuelve un usuario será que existe
        idUsuarioConectado=JSON.parse(chunk)[0]['id'] 
       
        //cambiamos el estado de 'conectado' del usuario a activo
        const request = net.request({ 
          method: 'PUT', 
          protocol: 'http:', 
          hostname: '127.0.0.1', 
          port: 8080,
          path: 'usuarios/conectarUsuario/'+ idUsuarioConectado   
        }); 
        request.end()
     
        win.loadFile('app/html/home.html')//cambiamos el html de la ventana.
      }else{
        e.reply("login-error","EL USUARIO O CONTRASEÑA SON INCORRECTOS");
      }
      
    })
    //para saber que ha acabado.
    response.on('end', () => {
      console.log('No more data in response.')
    })
  })
  request.end()//fin de la request  
});


/* ***************************************************************************************************
************************************* LOGOUT  ********************************************************
*****************************************************************************************************/
ipcMain.on("exit", async (e, arg) => {
  const request = net.request({ 
    method: 'PUT', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: 'usuarios/desconectarUsuario/'+ idUsuarioConectado   
  }); 
  request.end()
  idUsuarioConectado="";
  win.loadFile('app/html/login.html')//cambiamos el html de la ventana.
});


/* ***************************************************************************************************
***************************************** GENERALES  *************************************************
*****************************************************************************************************/
//volver al home desde x pantalla
ipcMain.on("volver-home", async (e) => {
  win.loadFile('app/html/home.html')//cambiamos el html de la ventana.
});

/****************************************************************************************************
*************************************** HOME  ********************************************************
*****************************************************************************************************/
//obtener todas las rutas
ipcMain.on("get-rutas",  (e, arg) => {
  const request =  net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/getAll'
  }); 

  request.on('response', function (response) {
    var body = '';
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      try{
        let rutas=[];//array de usuarios
        var stringifyChunk=JSON.stringify(body);
        var jsonData = JSON.parse(stringifyChunk);
        var otro = JSON.parse(jsonData);//creamos un json de los datos
        for(let i = 0; i< otro.length; i++){
          rutas.push(otro[i]);
        }
        
        e.reply("get-rutas",rutas);//pasamos las rutas al app.js  para mostrar
      }catch(SyntaxError){//en caso de algun dato erroneo 
        console.log("problemas de desencriptado " + SyntaxError);
        win.loadFile('app/html/home.html')//cambiamos el html de la ventana.
      }
    });
  });
  request.end();

});

//eliminar ruta seleccionada
ipcMain.on("delete-ruta", async (e, args) => {
  const request = await net.request({ 
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
  request.end().
  win.reload();//recargamos la página
});

//Filtros de busqueda, obtener rutas por ciudad
ipcMain.on("buscar", async (e, arg) => {
  const request = net.request('http://127.0.0.1:8080/rutas/getCiudad/'+arg)
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data', (chunk) => {
      let rutas=[];//array de usuarios
      
      var sChunk=chunk.toString('utf8');
      var stringifyChunk=JSON.stringify(sChunk);
      var jsonData = JSON.parse(stringifyChunk);
      var otro = JSON.parse(jsonData);

      for(let i = 0; i< otro.length; i++){
        rutas.push(new Ruta(otro[i]));//por cada elemento de la data parseada creamos un usuario en el array
      }
      e.reply("busqueda-realizada", JSON.stringify(rutas));//pasamos las rutas al app.js

    })
  })
  request.end()
});


/* ***************************************************************************************************
***************************** FORMULARIO DE CREACION ***********************************************
*****************************************************************************************************/
//ir al form de crear ruta
ipcMain.on("create-ruta-form", async (e, arg) => {
  win.loadFile('app/html/formCrearRuta.html')//cambiamos el html de la ventana.
});


//CREAR RUTA
ipcMain.on("crear-ruta", (e, arg) => {
  var elBody = JSON.stringify(arg);
  const request = net.request({ 
    method: 'POST', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/add',
    headers: {
      'Content-Type': 'application/json'
    }, 
    body: elBody,
  }); 
  request.on('response', function (response) {
      var body = '';
      response.on('data', function (chunk) {
        body += chunk;
      });
      response.on('end', function () {
      });
  })
  request.write(elBody);//enviamos el body
  request.end();
});


//crear las localizaciones de la ruta
ipcMain.on("crear-localizacion", (e, arg) => {
  //llamamos a la funcion para obtener la id de la última ruta creada
  obtenerIdRuta(arg);
});

//funcion obtener id ultima ruta (la recien creada)
function obtenerIdRuta(localizacion){
   var idRuta="";//var id
   const request = net.request({ 
     method: 'GET', 
     protocol: 'http:', 
     hostname: '127.0.0.1', 
     port: 8080,
     path: '/rutas/getUltimaRuta'    
   }); 
   request.on('response', function (response) {
    var body = '';
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      var ruta=JSON.parse(body);
      idRuta=ruta['id'];//actualizamos la variable con el valor de la id
      crearLocalizacion(idRuta, localizacion);//llamamos a la funcion para crear la localizacion con la id y la localizacion actual
     
    });
  })
   request.end(()=>{
     console.log("request end de obtener ruta " + idRuta);
   });
 }

 //funcion crear localizacion X
 function crearLocalizacion(idruta, localizacion){
   console.log('Crear localizacion\n'+localizacion);
   //recorremos el array de localizaciones para obtener un json de uno en uno 
   for(let i=0; i< localizacion.length; i++){
     var elBody = JSON.stringify(localizacion[i]);//obtenemos el obj localizacion
     
     var json=JSON.parse(elBody);//creamos un json con el obj
     json.rutaId=idruta;//modificamos el key 'rutaId'
     elBody=JSON.stringify(json);//volvemos a asignar al body los datos
 
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
       body: elBody   
     }); 
     request.on('response', function (response) {
      var body = '';
      response.on('data', function (chunk) {
        body += chunk;
      });
      response.on('end', function () {
        console.log('localizaciones ' + body);
      });
    })
     request.write(elBody);
     request.end();
     
   }
   actualizarDatos(idruta);//funcion para actualizar la lista de localizaciones de la ruta
 }

 //actualizar la lista de localizaciones de la ruta con id X
 function actualizarDatos(id){
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
     })
   })
   request.end(()=>{
     console.log("actualizacion request acabada");
   });
 }
 

/* ***************************************************************************************************
*********************************** FORMULARIO DE EDICION  *******************************************
*****************************************************************************************************/

//ir al form de editar ruta
ipcMain.on("edit-ruta-form", async (e, arg) => {
  var ruta;
  
  //obtener la ruta a editar por su id
  const request = await net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/getId/'+arg    
  }); 
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data',async (chunk) => {
     
      ruta=JSON.parse(JSON.parse(JSON.stringify(chunk.toString('utf8'))));
      rutaEdit=ruta; //cambiamos la variable 
      win.loadFile('app/html/formEditRuta.html')//cambiamos el html de la ventana.
    })
  })
  request.end();
  
});
//enviar los datos para editar
ipcMain.on('obtener-datos-editar',async (e)=>{
  localizacionEdit=rutaEdit['listaLocalizaciones'];
  //recorremos la lista de localizaciones y hacemos una llamada a la api por cada localizacion
  for(let i = 0; i<localizacionEdit.length; i++){
    console.log("en el for " + localizacionEdit[i]['id']   );
    const request = await net.request({ 
      method: 'GET', 
      protocol: 'http:', 
      hostname: '127.0.0.1', 
      port: 8080,
      path: '/localizaciones/getId/'+localizacionEdit[i]['id']    
    }); 
    request.on('response', (response) => {
      //cogemos la data 
      response.on('data',async (chunk) => {
        ruta=JSON.parse(JSON.parse(JSON.stringify(chunk.toString('utf8'))));
        localizacionEdit.push(ruta); //cambiamos la variable 
       
      })
    })
    request.end();
  }
  console.log(rutaEdit);
  e.reply('datos-edit', JSON.stringify(rutaEdit), JSON.stringify(localizacionEdit));
})


//hacer el update de los datos
ipcMain.on("editar-datos",async (e,arg, loc)=>{

  var elBodyRuta = JSON.parse(JSON.stringify(arg));
  var elBodyLoc = JSON.parse(JSON.stringify(loc));
  var idR=elBodyRuta['id'];//id de la ruta
 
  var pathRuta=`/rutas/editId/${idR}`;//path update ruta

  var bodyRuta=JSON.stringify(elBodyRuta);//el body que pasamos al update de la ruta
  
  //update de las localizaciones
  for(let i=0 ; i < elBodyLoc.length; i++){
    var idL=elBodyLoc[i]['id'];
    var pathLoc=`/localizaciones/editId/${idL}`;
    var bodyLoc = JSON.stringify(elBodyLoc[i]);
    
    const request = await net.request({ 
      method: 'PUT', 
      protocol: 'http:', 
      hostname: '127.0.0.1', 
      port: 8080,
      path: pathLoc,
      headers: {
        'Content-Type': 'application/json'
      },  
      body: bodyLoc 
    }); 
    request.on('response', (response) => {
      //cogemos la data 
      response.on('data',async (chunk) => {
        
      })
    })
    request.write(bodyLoc);
    request.end();
  }
  
  //update de la ruta
  const request = await net.request({ 
    method: 'PUT', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: pathRuta,
    headers: {
      'Content-Type': 'application/json'
    },  
    body: bodyRuta
  }); 
  request.write(bodyRuta);
  request.end(async ()=>{
   //e.reply('actualizar-datos');
  });
  win.loadFile('app/html/home.html')//cambiamos el html de la ventana.
  
});

ipcMain.on('actualizar-datos', async (e,arg)=>{
  await actualizarDatos(arg);//actualizar la lista de las localizaciones de la ruta
  win.loadFile('app/html/home.html')//cambiamos el html de la ventana.
})


/* ***************************************************************************************************
******************************************** CHAT  **************************************************
*****************************************************************************************************/

ipcMain.on("chat",async (e)=>{
  //get rutas
  request = await net.request({ 
    method: 'GET', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/getAll'
  }); 
  request.on('response',  (response) => {
    //cogemos la data 
    response.on('data',async (chunk) => {
      console.log("DATA\n"+JSON.parse(chunk.toString('utf8')));
      e.reply("chat",JSON.parse(chunk.toString('utf8')));
    }
  )}); 
  request.end();
})

module.exports = { createWindow };