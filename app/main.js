const { BrowserWindow, ipcMain, remote } = require("electron");
const Ruta = require("./models/Ruta");
const Usuario = require("./models/Usuario");
const { net } = require('electron')//para la conexion con la api
const delay = ms => new Promise(res => setTimeout(res, ms));

//variables globales
var idUsuarioConectado;
var rutaEdit;
var localizacionEdit;

//Creacion de la ventana
function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon:'./app/resources/explorer.png'//cambiar el logo del programa
  });

  win.maximize();
  
  //pantalla completa
  //win.setFullScreen(true)
  //win.removeMenu();//quitar menu superior
  win.loadFile("app/html/login.html");//html de

}

/* ***************************************************************************************************
*********************************** REGISTRO  ********************************************************
*****************************************************************************************************/
//cargar pantalla
ipcMain.on("registro", (e, arg)=>{
  BrowserWindow.getFocusedWindow().loadFile('app/html/registro.html')//cambiamos el html de la ventana.
})

//volvemos al login
ipcMain.on("volver-login", (e, arg)=>{
  BrowserWindow.getFocusedWindow().loadFile('app/html/login.html')//cambiamos el html de la ventana.
})

//crear un usuario 
ipcMain.on("create-usuario", async (e, arg) => {
  //const todosusuarios = usuario.find();
  //console.log(arg);
  const newusuario = new Usuario(arg);
  const usuarioSaved = await newusuario.save();
  //console.log(usuarioSaved);
  e.reply("new-usuario-created", JSON.stringify(usuarioSaved));
});

/* ***************************************************************************************************
************************************** LOGIN  ********************************************************
*****************************************************************************************************/
//comprobar si existe, en caso afirmativo reenviamos al usuario al home
ipcMain.on("login", async (e, arg) => {
  const usuario = new Usuario (arg);//usuario recibido por el form
  //llamada a la api
  //const request = net.request('http://127.0.0.1:8080/usuarios/getLogin/'+usuario.nombre +'/'+usuario.contrasena+'/'+usuario.rol)
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
   // console.log(`STATUS: ${response.statusCode}`);
    response.on('error', (error) => {
     // console.log(`ERROR: ${JSON.stringify(error)}`)
      e.reply("login-error","EL USUARIO O CONTRASEnA SON INCORRECTOS");
    })
    //cogemos la data 
    response.on('data', (chunk) => {
      if(typeof JSON.parse(chunk)[0] !== 'undefined'){//si nos devuelve un usuario será que existe
        idUsuarioConectado=JSON.parse(chunk)[0]['id'] 
       // console.log( JSON.parse(chunk)[0]);
        //cambiamos el estado de 'conectado' del usuario a activo
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
        e.reply("login-error","EL USUARIO O CONTRASEÑA SON INCORRECTOS");
        //console.log("EL USUARIO O CONTRASEnA SON INCORRECTOS");
      }
      
    })
    //para saber que ha acabado.
    response.on('end', () => {
     // console.log('No more data in response.')
    })
  })
  request.end()//fin de la request
  
});


/* ***************************************************************************************************
************************************* LOGOUT  ********************************************************
*****************************************************************************************************/
ipcMain.on("exit", async (e, arg) => {
  //console.log(idUsuarioConectado);
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


/* ***************************************************************************************************
***************************************** GENERALES  *************************************************
*****************************************************************************************************/
//volver al home desde x pantalla
ipcMain.on("volver-home", async (e, arg) => {
  BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
});

/****************************************************************************************************
*************************************** HOME  ********************************************************
*****************************************************************************************************/
//obtener todas las rutas
ipcMain.on("get-rutas", async (e, arg) => {
  //const request = net.request({method:'delete',path:'http://127.0.0.1:8080/rutas/getAll'})
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
      
      try{
        let rutas=[];//array de usuarios
        
        var sChunk=chunk.toString('utf8');//pasamos el buffer a strin tipo utf/
        var stringifyChunk=JSON.stringify(sChunk);
        var jsonData = JSON.parse(stringifyChunk);

        var otro = JSON.parse(jsonData);//creamos un json de los datos
        
        for(let i = 0; i< otro.length; i++){
          rutas.push(otro[i]);
        }
       
       //console.log(rutas)
        e.reply("get-rutas",JSON.stringify(rutas));//pasamos las rutas al app.js  para mostrar
      }catch(SyntaxError){
        //console.log("el puto error");
        await delay(2000);
        BrowserWindow.getFocusedWindow().reload();//recargamos la pagina para que vuelva ha hacer la llamda
      }
    }
  )}); 
  request.end();

  /*
  //SIN LLAMADA A API PERO VA BIEN --> si usamos esto en el home los botones edit/delete tienen que coger el _id no id
  const rutas = await Ruta.find();
 // console.log("RUTAS FIND " + rutas);
  e.reply("get-rutas", JSON.stringify(rutas));//pasamos las rutas al app.js
*/
});
//eliminar ruta seleccionada
ipcMain.on("delete-ruta", async (e, args) => {
  //const rutaDeleted = await Ruta.findByIdAndDelete(args);
  //console.log("delete " + args);
  //const request = net.request('http://127.0.0.1:8080/rutas/deleteId/'+args)

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
    // console.log("ELIMINAR ruta" + JSON.stringify(chunk));
    })
  })
  request.end()
  //BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
  BrowserWindow.getFocusedWindow().reload();//recargamos la página
});

//Filtros de busqueda, obtener rutas por ciudad
ipcMain.on("buscar", async (e, arg) => {
  const request = net.request('http://127.0.0.1:8080/rutas/getCiudad/'+arg)
  request.on('response', (response) => {
    //cogemos la data 
    response.on('data', (chunk) => {
      let rutas=[];//array de usuarios
      
      var sChunk=chunk.toString('utf8');
      //console.log(sChunk);
      var stringifyChunk=JSON.stringify(sChunk);
      //console.log(stringifyChunk);
      var jsonData = JSON.parse(stringifyChunk);
     // console.log("JSON DATA\n" + jsonData + "\nLENGTH " + jsonData.length);

      var otro = JSON.parse(jsonData);
      //console.log("OTRO\n" + otro.length);
      for(let i = 0; i< otro.length; i++){
        rutas.push(new Ruta(otro[i]));//por cada elemento de la data parseada creamos un usuario en el array
       // console.log(otro[i]['imagen']);
        //rutas.push(otro[i]);
      }
     // console.log(rutas);
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
  BrowserWindow.getFocusedWindow().loadFile('app/html/formCrearRuta.html')//cambiamos el html de la ventana.
});


//CREAR RUTA
ipcMain.on("crear-ruta", async (e, arg) => {
  var elBody = JSON.stringify(arg);
 // console.log("crear Ruta " + JSON.parse(elBody));
  const request = await net.request({ 
    method: 'POST', 
    protocol: 'http:', 
    hostname: '127.0.0.1', 
    port: 8080,
    path: '/rutas/add',
    headers: {
      'Content-Type': 'application/json'
    }, 
  }); 
  request.on('response', (response) => {
    
    response.on('data', (chunk) => {
      //console.log('RUTA ' + JSON.parse(chunk));
    })
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
async function obtenerIdRuta(localizacion){
  // console.log("obtener ultima id ");
   var idRuta="";//var id
   const request = await net.request({ 
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

 //funcion crear localizacion X
 async function crearLocalizacion(idruta, localizacion){
   //console.log(localizacion);
   //recorremos el array de localizaciones para obtener un json de uno en uno 
   for(let i=0; i< localizacion.length; i++){
     var elBody = JSON.stringify(localizacion[i]);//obtenemos el obj localizacion
     
     var json=JSON.parse(elBody);//creamos un json con el obj
     json.rutaId=idruta;//modificamos el key 'rutaId'
    //console.log(json);
     elBody=JSON.stringify(json);//volvemos a asignar al body los datos
     //console.log("EL BODY " + elBody);
 
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
         //console.log('localizacion ' + JSON.parse(chunk));
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
       //console.log("datos actualizados");
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
      //console.log("r " + ruta['listaLocalizaciones']);
      rutaEdit=ruta; //cambiamos la variable 
      //get localizaciones
     // var localizacionEdit = rutaEdit['listaLocalizaciones'];
      
      BrowserWindow.getFocusedWindow().loadFile('app/html/formEditRuta.html')//cambiamos el html de la ventana.
    })
  })
  request.end();
  
});
//enviar los datos para editar
ipcMain.on('obtener-datos-editar',async (e)=>{
  //falta mandar tambien la localizacion para editar
  //console.log(JSON.stringify(rutaEdit['listaLocalizaciones']));
  localizacionEdit=rutaEdit['listaLocalizaciones'];
  //console.log(localizacionEdit['id']);
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
  //console.log('LOCALIZACION ' + JSON.stringify(loc) + "\nRUTA " + JSON.stringify(arg));
  var elBodyRuta = JSON.parse(JSON.stringify(arg));
  var elBodyLoc = JSON.parse(JSON.stringify(loc));

  var idR=elBodyRuta['id'];//id de la ruta
  var idL="60015b33e6d96332d2adfd3a";
  var pathLoc=`/localizaciones/editId/60015b33e6d96332d2adfd3a`;
  var pathRuta=`/rutas/editId/${idR}`;//path update ruta

  var bodyRuta=JSON.stringify(elBodyRuta);//el body que pasamos al update de la ruta
  var bodyLoc = JSON.stringify(elBodyLoc);

  console.log('loc ' + bodyLoc +"\nid " + idL);
  
  //update de las localizaciones
  for(let i=0 ; i<JSON.stringify(loc).length; i++){
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
  console.log("Localizacion actualizada");
  
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
  BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
  
});

ipcMain.on('actualizar-datos', async (e,arg)=>{
  await actualizarDatos(arg);//actualizar la lista de las localizaciones de la ruta
  BrowserWindow.getFocusedWindow().loadFile('app/html/home.html')//cambiamos el html de la ventana.
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
    
      let rutas=[];//array de usuarios
      var sChunk=chunk.toString('utf8');//pasamos el buffer a strin tipo utf/
      var stringifyChunk=JSON.stringify(sChunk);
      var jsonData = JSON.parse(stringifyChunk);

      var otro = JSON.parse(jsonData);//creamos un json de los datos
      for(let i = 0; i< otro.length; i++){
        rutas.push(otro[i]);
      }

      e.reply("chat",JSON.stringify(rutas));
    }
  )}); 
  request.end();
 
})


module.exports = { createWindow };