//import L from 'leaflet';
window.$ = window.jQuery = require('jquery');

//Obtener las ciudades de la base de datos
const {ipcRenderer } = require("electron");
/*ipcRenderer.send('getCiudades');
ipcRenderer.on("busqueda-ciudades", (e, args) => {
  const ciudades = JSON.parse(args);
  console.log("las ciudades " +ciudades);
  for(let i=0; i<ciudades.length; i++){
    //añadir las ciudades al selector
    var o = new Option(ciudades[i], ciudades[i]);//creamos una opcion
    $(o).html(ciudades[i]);
    $("#ciudadRuta").append(o);//la añadimos al selector
  }
});*/
const btnVolver = document.querySelector("#btnBack");
//boton volver a home
btnVolver.addEventListener('click', e => {
  ipcRenderer.send("volver-home");
});


var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab
titulo = ["Nueva Ruta","Nueva localizacion","Pregunta"];


var map = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
    attribution: '&copy; <a>OpenStreetMap</a> contributors'
}).addTo(map);

var latlang;
var lugar;
var localizaciones = [];
var numLocalizaciones = 0;
var listaMarker = [];

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
  
  function nuevaLocalizacion(){
    localizaciones.push([latlang.lat,latlang.lng]);
    console.log(localizaciones);

    marker = new L.marker(localizaciones[numLocalizaciones]);
    map.addLayer(marker);
    marker.bindPopup('Localizacion '+(numLocalizaciones+1)).openPopup();

    listaMarker.push(marker);


    /*****NUEVA FILA TABLA*****/

    $('#localizacionesDeRuta').append("<tr id='"+numLocalizaciones+"'></tr>");

    $('#localizacionesDeRuta #'+numLocalizaciones).append("<th scope='row'><input disabled type='text' id='inp"+numLocalizaciones+"' value='"+lugar+"'></th><td></td>");

    //$('#localizacionesDeRuta #'+numLocalizaciones+" td").append("<Button type='button' onclick=borrar('"+numLocalizaciones+"') ><i class='fa fa-close'></i></Button>");
    $('#localizacionesDeRuta #'+numLocalizaciones+" td").append("<Button id='btnEdit"+numLocalizaciones+"' type='button' onclick=editar('"+numLocalizaciones+"') ><i class='fa fa-edit'></i></Button>");
    $('#localizacionesDeRuta #'+numLocalizaciones+" td").append("<Button id='btnSave"+numLocalizaciones+"' type='button' onclick=guardar('"+numLocalizaciones+"') disabled><i class='fa fa-save'></i></Button>");

    /*****NUEVO QUESTIONARIO*****/

    //NOMBRE LOCALIZACION

    $('#accordeonPreguntas').append("<div id='div"+numLocalizaciones+"'><h1 onclick='pestana("+numLocalizaciones+")' id='h1Lugar"+numLocalizaciones+"'>"+lugar+"</h1></div>");    
    
    $("#div"+numLocalizaciones).append("<div class='subdiv'> </div>");

    //ESCRBIR DESCRIPCION

    $("#div"+numLocalizaciones+" .subdiv").append("Descripcion: <p><textarea id='descripcionPregunta"+numLocalizaciones+"' placeholder='Descripcion' name='' id='' style='resize: none; overflow: auto;'></textarea></p> ")

    //ESCRBIR PREGUNTA A

    $("#div"+numLocalizaciones+" .subdiv").append("Pregunta A:<p><input id='preguntaA"+numLocalizaciones+"' placeholder='Pregunta A' oninput=''></p> ");

    //ESCRBIR PREGUNTA B

    $("#div"+numLocalizaciones+" .subdiv").append("Pregunta B:<p><input id='preguntaB"+numLocalizaciones+"' placeholder='Pregunta B' oninput=''></p>");

    //ESCRBIR PREGUNTA C

    $("#div"+numLocalizaciones+" .subdiv").append("Pregunta C:<p><input id='preguntaC"+numLocalizaciones+"' placeholder='Pregunta C' oninput=''></p> ");
 
    //ESCRBIR IMAGEN

    $("#div"+numLocalizaciones+" .subdiv").append("Imagen:<p><input id='imagenPregunta"+numLocalizaciones+"' type='file' ></p>");

    //ELEGIR TIPO PREGUNTA
    $("#div"+numLocalizaciones+" .subdiv").append("Tipo:<p><input type='radio' name='tipo' id='Pregunta"+numLocalizaciones+"'><label for='Pregunta"+numLocalizaciones+"'>Pregunta</label></p>");
    $("#div"+numLocalizaciones+" .subdiv").append("<p><input type='radio' name='tipo' id='Localizacion"+numLocalizaciones+"'><label for='Localizacion"+numLocalizaciones+"'>Localizacion</label></p>");

    //ELEGIR RESPUESTA CORRECTA

    //$("#div"+numLocalizaciones+" .subdiv").append("Respuesta correcta:    <p><select id='respuestaPregunta"+numLocalizaciones+"' class='form-select' aria-label='Default select example'> <option selected>selecciona la respuesta correcta</option>  <option value='1'>A</option>      <option value='2'>B</option>      <option value='3'>C</option>  </select></p>");
    $("#div"+numLocalizaciones+" .subdiv").append(`Respuesta correcta:<p><select id='respuestaPregunta${numLocalizaciones}' name='respuestaPregunta${numLocalizaciones}' class='form-select' aria-label='Default select example'><option selected>selecciona la respuesta correcta</option><option value='1'>A</option><option value='2'>B</option><option value='3'>C</option></select></p>` );

    $("#div"+numLocalizaciones+" .subdiv").hide();
    $("#div0 .subdiv").show();

    numLocalizaciones++;
 
  }

  

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

function editar(sitio){
  $("#btnEdit"+sitio).prop('disabled', true);
  $("#btnSave"+sitio).prop('disabled', false);
  $("#inp"+sitio).prop('disabled', false);
 
}
function guardar(sitio){
  $("#btnEdit"+sitio).prop('disabled', false);
  $("#btnSave"+sitio).prop('disabled', true);
  $("#inp"+sitio).prop('disabled', true);
  $("#h1Lugar"+sitio).text($("#inp"+sitio).val());//sustituimos el titulo de la pregunta
  
}
function salirEditar(){
  window.location.href = 'nuevoForm.html';

}

function showTab(n) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  
  x[n].style.display = "block";
 
  if (titulo[n] === undefined){
    document.getElementById("titulo").innerHTML = "Nueva Ruta";
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
  if(document.getElementById("titulo").innerHTML == "Nueva localizacion"){
    map.invalidateSize();
    map.locate({setView : true});
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
  /*// This function deals with validation of the form fields
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
  return valid; // return the valid status*/
  return true;
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
  for(i=0;i<$('#dificultad input').length;i++){
    if($('#dificultad input')[i].checked){
      difi = $('#dificultad input')[i].value;
    }
  }
  if($('#imagenRuta').val()==null){
    $('#imagenRuta').val('foto.jpg');
  }
  var JSONRuta =  {
    "nombre" : $('#nombreRuta').val(),
    "descripcion" : $('#descripcionRuta').val(),
    "imagen" : $('#imagenRuta').val(),
    "ciudad" : $('#ciudadRuta').val(),
    "transporte" : $('#transporteRuta').val(),
    "tematica" : $('#tematicaRuta').val(),
    "dificultad":difi,
    "listaLocalizaciones":[],
  };
  //console.log("RUTAS JSON " + JSON.stringify(JSONRuta));

  var localizacionesJSON = [];
 // console.log($('#accordeonPreguntas div').even().length);
 
  for (i = 0; i < $('#accordeonPreguntas div').even().length; i++){
    var JSONPregunta = {
      "pregunta" :  $("#descripcionPregunta"+i).val(),
      "respuesta1" : $("#preguntaA"+i).val(),
      "respuesta2" : $("#preguntaB"+i).val(),
      "respuesta3" : $("#preguntaC"+i).val(),
      "imagen" : $("#imagenPregunta"+i).val(),
      "tipo" : "pregunta",
      "correcta" :$( "#respuestaPregunta"+i).val(),
      
    }
    /*console.log("PREGUNTA DATOS "+ JSON.stringify(JSONPregunta));
    var preguntaJSON=[];
    preguntaJSON.push(JSONPregunta);*/
    var JSONLocalizacion = {
      "nombre":$("#h1Lugar"+i).text(),
      "latitud":localizaciones[i][0],
      "longitud":localizaciones[i][1],
      "pista":$("#h1Lugar"+i).text(),
      "oculta":true,
      "rutaId":"0",
      "pregunta":JSONPregunta,
    }

    localizacionesJSON.push(JSONLocalizacion);
    
  }
  
  console.log(localizacionesJSON);
  ipcRenderer.send('crear-ruta',JSONRuta);
  ipcRenderer.send('crear-localizacion',localizacionesJSON);
  

  //volvemos al home
  ipcRenderer.send("volver-home");
      
}
