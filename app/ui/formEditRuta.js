const { ipcMain } = require("electron");
const {ipcRenderer } = require("electron");
//import L from 'leaflet';
window.$ = window.jQuery = require('jquery');//para usar jquery

var laRuta;
var localizacionesEdit;
//campos del formulario
const nombre = document.querySelector("input[name='nombre']");
const descripcion = document.querySelector("#descripcion");
const ciudad = document.querySelector("#ciudadRuta");
const transporte= document.querySelector("#transporteRuta");
const tematica = document.querySelector("#tematicaRuta");
const dificultad=document.querySelector("#dificultad");
//const imagen=document.querySelector("#imagenRuta");
var id;
//pedimos los datos
ipcRenderer.send('obtener-datos-editar');
//rellenamos el formulario
ipcRenderer.on('datos-edit', (e, r, l) => {
  var ruta = JSON.parse(r);
  laRuta=ruta;
  localizacionesEdit = JSON.stringify(JSON.parse(l));

  id=ruta['id'];
  nombre.value=ruta['nombre'];
  descripcion.value=ruta['descripcion'];
  ciudad.value=ruta.ciudad;
  transporte.value=ruta.transporte;
  tematica.value=ruta.tematica;
  dificultad.value=ruta.dificultad;
 
});

//VOLVER AL HOME
const btnVolver = document.querySelector("#btnBack");
//boton volver a home
btnVolver.addEventListener('click', e => {
  ipcRenderer.send("volver-home");
});



var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab
titulo = ["Editar Ruta","Editar localizacion","Pregunta"];

var map = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('Nueva localizacion añadida')
    .openPopup();



function showTab(n) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
 
  if (titulo[n] === undefined){
    document.getElementById("titulo").innerHTML = " Editar Ruta";
  }else{
    document.getElementById("titulo").innerHTML = titulo[n];
  }
  
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Enviar";
  } else {
    document.getElementById("nextBtn").innerHTML = "Siguiente";
  }
  // ... and run a function that displays the correct step indicator:
  fixStepIndicator(n)
  //si esta en la pesaña del mapa
  if(n==1){
    rellenarTabla();//poner una tabla con las localizacionesEdit actuales  
  }
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    document.getElementById("regForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value == "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false:
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}



function recogerYEnviar(){
  var difi;
  for(i=0;i< $('#dificultad input').length;i++){
    if($('#dificultad input')[i].checked){
      difi = $('#dificultad input')[i].value;
    }
  }

  console.log("enviar " + id);
  var JSONRuta =  {
    "id":id,
    "nombre" : nombre.value,
    "descripcion" :descripcion.value,
    "imagen" :"fondo2.jpg",
    "ciudad" : ciudad.value,
    "transporte" : transporte.value,
    "tematica" :tematica.value,
    "dificultad":difi,
    "listaLocalizaciones":[],
  };
    
  ipcRenderer.send('editar-datos',JSONRuta);
  //ipcRenderer.send('actualizar-datos', JSONRuta['id'])
}


var localizaciones = [];
var listaMarker = [];
function rellenarTabla(){
  
  //console.log('localizaciones ' + localizaciones);
  var loc = JSON.parse(localizacionesEdit);
  console.log(loc[0]['nombre']);
  for(let i = 0 ; i < loc.length; i++){
    console.log("localizacion " + loc[i]['nombre']);
    $('#localizacionesDeRuta').append("<tr id='"+i+"'></tr>");

    $('#localizacionesDeRuta #'+i).append("<th scope='row'>"+loc[i]['nombre']+"</th><td></td>");

    $('#localizacionesDeRuta #'+i+" td").append("<Button type='button' onclick=borrar('"+i+"')><em class='fas fa-eraser'></em></Button>");
  
    var latitud = loc[i]['latitud'];
    var longitud = loc[i]['longitud'];
    localizaciones.push([latitud,longitud]);
    console.log(localizaciones);

    marker = new L.marker(localizaciones[i]);
    map.addLayer(marker);
    marker.bindPopup('Localizacion '+(i+1)).openPopup();

    listaMarker.push(marker);
  }
 
}