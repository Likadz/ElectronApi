const { ipcMain } = require("electron");
const {ipcRenderer } = require("electron");
//import L from 'leaflet';
window.$ = window.jQuery = require('jquery');//para usar jquery

var laRuta;
var localizacionesEdit;

//variables
var localizaciones = [];
var listaMarker = [];
var lugar;
var numLocalizaciones = [];
var latlang;

//campos del formulario
const nombre = document.querySelector("input[name='nombre']");
const descripcion = document.querySelector("#descripcion");
const ciudad = document.querySelector("#ciudadRuta");
const transporte= document.querySelector("#transporteRuta");
const tematica = document.querySelector("#tematicaRuta");
const dificultad=document.querySelector("#dificultad");
//const imagen=document.querySelector("#imagenRuta");
var idRuta;
var idLoc=[];

//pedimos los datos
ipcRenderer.send('obtener-datos-editar');

//rellenamos el formulario
ipcRenderer.on('datos-edit', (e, r, l) => {
  var ruta = JSON.parse(r);
  laRuta=ruta;
  //console.log("l " + JSON.parse(l)[2]['id']);
  localizacionesEdit = JSON.stringify(JSON.parse(l));
  numLocalizaciones=JSON.parse(l).length;

  idRuta=ruta['id'];
  for( let i = 0 ; i < numLocalizaciones; i++){
    console.log("for " + JSON.parse(l)[i]['id']);
    idLoc.push(JSON.parse(l)[i]['id']);
  }
  //idLoc=JSON.parse(l)['id'];
  console.log(idLoc);
  nombre.value=ruta['nombre'];
  descripcion.value=ruta['descripcion'];
  ciudad.value=ruta.ciudad;
  transporte.value=ruta.transporte;
  tematica.value=ruta.tematica;
  //recorremos las estrellas y las marcamos segun la dificultad 
  for(i=1; i<=4;i++){//4=num de las estrellas 
    if(i<=ruta.dificultad){
      $('input[type="radio"][value='+i+']').prop('checked',true);
    }
  }
  dificultad.value=ruta.dificultad;
 
});

//VOLVER AL HOME
const btnVolver = document.querySelector("#btnBack");
//boton volver a home
btnVolver.addEventListener('click', e => {
  ipcRenderer.send("volver-home");
});

//tabla de localizaciones
$("#tablaBody").empty();//limpia


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



var placesAutocomplete = places({
  appId: 'plOJC0RKIYMV',
  apiKey: '4b3ce3367d9d2a1a12f1d09e32bd0c75',
  container: document.querySelector('#nombreLocalizacion'),
  templates: {
    value: function(suggestion) {
        map.setView([suggestion.latlng.lat,suggestion.latlng.lng],15);
    }
  },
});

  placesAutocomplete.on('change', e => {
    map.setView([e.suggestion.latlng.lat,e.suggestion.latlng.lng],15);
    console.log(e.suggestion.latlng);
    latlang = e.suggestion.latlng;
    lugar = e.suggestion.name;
    $('#nombreLocalizacion').text(lugar);
  });

  function onMapClick(e) {
    latlang = e.latlng;
    lugar = e.name;
    $('#nombreLocalizacion').text(lugar);
    nuevaLocalizacion();
  }

  map.on('click', onMapClick);

function pestana(num){

  $("#div"+num+" .subdiv").toggle(500);
  $(".subdiv").not("#div"+num+" .subdiv").hide(500);
}

function borrar(sitio){

  $('#'+sitio).remove();
  $('#div'+sitio).remove();

  numLocalizaciones--;
  map.removeLayer(listaMarker[sitio]);

  listaMarker.splice(sitio, 1);

  localizaciones.splice(sitio,1);
  
  console.log(sitio);

  console.log(localizaciones);
  console.log(listaMarker);
  

}



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
  if(document.getElementById("titulo").innerHTML == "Editar localizacion"){
    map.invalidateSize();//correccion mapa
    map.locate({setView : true});
  }
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
    //document.getElementById("regForm").submit();
    currentTab -= 1;
    showTab(currentTab);
    console.log('enviado');
    recogerYEnviar();
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



var placesAutocomplete = places({
  appId: 'plOJC0RKIYMV',
  apiKey: '4b3ce3367d9d2a1a12f1d09e32bd0c75',
  container: document.querySelector('#nombreLocalizacion'),
  templates: {
    value: function(suggestion) {
        map.setView([suggestion.latlng.lat,suggestion.latlng.lng],15);
    }
  },
});

  placesAutocomplete.on('change', e => {
    map.setView([e.suggestion.latlng.lat,e.suggestion.latlng.lng],15);
    console.log(e.suggestion.latlng);
    latlang = e.suggestion.latlng;
    lugar = e.suggestion.name;
    $('#nombreLocalizacion').text(lugar);
  });

  function onMapClick(e) {
    latlang = e.latlng;
    lugar = e.name;
    $('#nombreLocalizacion').text(lugar);
    nuevaLocalizacion();
  }


function recogerYEnviar(){
  var difi;
  for(i=0;i< $('#dificultad input').length;i++){
    if($('#dificultad input')[i].checked){
      difi = $('#dificultad input')[i].value;
    }
  }

  console.log("enviar " + idRuta);
  var JSONRuta =  {
    "id":idRuta,
    "nombre" : nombre.value,
    "descripcion" :descripcion.value,
    "imagen" :laRuta['imagen'],
    "ciudad" : ciudad.value,
    "transporte" : transporte.value,
    "tematica" :tematica.value,
    "dificultad":difi,
    "listaLocalizaciones":[],
  };
    
  var localizacionesJSON = [];
 // console.log($('#accordeonPreguntas div').even().length);
 
  for (i = 0; i < $('#accordeonPreguntas div').even().length; i++){
    var JSONPregunta = {
      "pregunta" :  $("#descripcionPregunta"+i).val(),
      "respuesta1" : $("#preguntaA"+i).val(),
      "respuesta2" : $("#preguntaB"+i).val(),
      "respuesta3" : $("#preguntaC"+i).val(),
      "imagen" : "",
      "tipo" : "pregunta",
      "correcta" :$( "#respuestaPregunta"+i).val(),
      
    }
    /*console.log("PREGUNTA DATOS "+ JSON.stringify(JSONPregunta));
    var preguntaJSON=[];
    preguntaJSON.push(JSONPregunta);*/
    console.log(idLoc[i]);
    var JSONLocalizacion = {
      "id":idLoc[i],
      "nombre":$("#h1Lugar"+i).text(),
      "latitud":localizaciones[i][0],
      "longitud":localizaciones[i][1],
      "pista":$("#h1Lugar"+i).text(),
      "oculta":true,
      "rutaId":idRuta,
      "pregunta":JSONPregunta,
    }

    localizacionesJSON.push(JSONLocalizacion);
    
  }
  console.log(localizacionesJSON);
  //editamos la ruta
  ipcRenderer.send('editar-datos',JSONRuta, localizacionesJSON);
  //ipcRenderer.send('actualizar-datos', JSONRuta['id'])
}

function nuevaLocalizacion(){
  localizacionesEdit.push([latlang.lat,latlang.lng]);
  console.log(localizaciones);

  marker = new L.marker(localizacionesEdit[numLocalizaciones]);
  map.addLayer(marker);
  marker.bindPopup('Localizacion '+(numLocalizaciones+1)).openPopup();

  listaMarker.push(marker);
}

function editar(sitio){
  $("#btnEdit"+sitio).prop('disabled', true);
  $("#btnSave"+sitio).prop('disabled', false);
  $("#inp"+sitio).prop('disabled', false);
 
}
function guardar(sitio){
  JSON.parse(localizacionesEdit)[sitio]['nombre']=$("#inp"+sitio).val();

  $("#btnEdit"+sitio).prop('disabled', false);
  $("#btnSave"+sitio).prop('disabled', true);
  $("#inp"+sitio).prop('disabled', true);
  $("#h1Lugar"+sitio).text($("#inp"+sitio).val());//sustituimos el titulo de la pregunta
  
}


//Crear la tabla con las localizaciones y los formularios de las preguntas
function rellenarTabla(){
  
  var loc = JSON.parse(localizacionesEdit);
  
  $("#tablaBody").empty();//limpiamos la tabla por si hay datos anteriores
  $('#accordeonPreguntas').empty();
  //recorremos las localizaciones creando una fila para cada uno y una pestaña con formulario 
  for(let i = 0 ; i < loc.length; i++){
    console.log("localizacion " + loc[i]['nombre']);
    //la tabla
    $('#tablaBody').append("<tr id='"+i+"'></tr>");

    $('#localizacionesDeRuta #'+i).append("<th scope='row'><input disabled type='text' id='inp"+i+"' value='"+loc[i]['nombre']+"'></th><td></td>");
    $('#localizacionesDeRuta #'+i+" td").append("<Button id='btnEdit"+i+"' type='button' onclick=editar('"+i+"') ><i class='fa fa-edit'></i></Button>");
    $('#localizacionesDeRuta #'+i+" td").append("<Button id='btnSave"+i+"' type='button' onclick=guardar('"+i+"') disabled><i class='fa fa-save'></i></Button>");
    
    //variables para el marker del mapa
    var latitud = loc[i]['latitud'];
    var longitud = loc[i]['longitud'];
    localizaciones.push([latitud,longitud]);
  //console.log(localizaciones);
    //mapa
    marker = new L.marker(localizaciones[i]);
    map.addLayer(marker);
    marker.bindPopup('Localizacion '+(i+1)).openPopup();
    listaMarker.push(marker);

    //formulario
    
    /*****NUEVO QUESTIONARIO*****/

    //NOMBRE LOCALIZACION

    $('#accordeonPreguntas').append("<div id='div"+i+"'><h1 onclick='pestana("+i+")' id='h1Lugar"+i+"'>"+loc[i]['nombre']+"</h1></div>");    
    
    $("#div"+i).append("<div class='subdiv'> </div>");

    //ESCRBIR DESCRIPCION

    $("#div"+i+" .subdiv").append("Descripcion: <p><textarea id='descripcionPregunta"+i+"' placeholder='Descripcion' name='' id='' style='resize: none; overflow: auto;'>"+loc[i]['pregunta']['pregunta']+"</textarea></p> ")

    //ESCRBIR PREGUNTA A

    $("#div"+i+" .subdiv").append("Pregunta A:<p><input id='preguntaA"+i+"' placeholder='Pregunta A' oninput='' value='"+loc[i]['pregunta']['respuesta1']+"'></p> ");

    //ESCRBIR PREGUNTA B

    $("#div"+i+" .subdiv").append("Pregunta B:<p><input id='preguntaB"+i+"' placeholder='Pregunta B' oninput='' value='"+loc[i]['pregunta']['respuesta2']+"'></p>");

    //ESCRBIR PREGUNTA C

    $("#div"+i+" .subdiv").append("Pregunta C:<p><input id='preguntaC"+i+"' placeholder='Pregunta C' oninput='' value='"+loc[i]['pregunta']['respuesta3']+"'></p> ");
 
    //ESCRBIR IMAGEN

    //$("#div"+i+" .subdiv").append("Imagen:<p><input id='imagenPregunta"+i+"' type='file' ></p>");

    
    //ELEGIR TIPO PREGUNTA
    if(loc[i]['pregunta']['tipo']=="pregunta"){
      $("#div"+i+" .subdiv").append("Tipo:<p><input type='radio' name='tipo' id='Pregunta"+i+"' checked ><label for='Pregunta"+i+"'>Pregunta</label></p>");
      $("#div"+i+" .subdiv").append("<p><input type='radio' name='tipo' id='Localizacion"+i+"'><label for='Localizacion"+i+"'>Localizacion</label></p>");
    }else{
      $("#div"+i+" .subdiv").append("Tipo:<p><input type='radio' name='tipo' id='Pregunta"+i+"'  ><label for='Pregunta"+i+"'>Pregunta</label></p>");
      $("#div"+i+" .subdiv").append("<p><input type='radio' name='tipo' id='Localizacion"+i+"'checked><label for='Localizacion"+i+"'>Localizacion</label></p>");
    }
    
    //ELEGIR RESPUESTA CORRECTA
    if(loc[i]['pregunta']['correcta']==1){
      $("#div"+i+" .subdiv").append(`Respuesta correcta:<p><select id='respuestaPregunta${i}' name='respuestaPregunta${i}' class='form-select' aria-label='Default select example'><option selected>selecciona la respuesta correcta</option><option value='1' selected>A</option><option value='2'>B</option><option value='3'>C</option></select></p>` );
    }else if (loc[i]['pregunta']['correcta']==2){
      $("#div"+i+" .subdiv").append(`Respuesta correcta:<p><select id='respuestaPregunta${i}' name='respuestaPregunta${i}' class='form-select' aria-label='Default select example'><option selected>selecciona la respuesta correcta</option><option value='1' >A</option><option value='2' selected>B</option><option value='3'>C</option></select></p>` );
    }else{
      $("#div"+i+" .subdiv").append(`Respuesta correcta:<p><select id='respuestaPregunta${i}' name='respuestaPregunta${i}' class='form-select' aria-label='Default select example'><option selected>selecciona la respuesta correcta</option><option value='1' >A</option><option value='2'>B</option><option value='3' selected>C</option></select></p>` );
    }

    $("#div"+i+" .subdiv").hide();
    $("#div0 .subdiv").show();
  }
 
}