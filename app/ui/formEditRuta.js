const { ipcMain } = require("electron");
const {ipcRenderer } = require("electron");
//import L from 'leaflet';

//campos del formulario
const nombre = document.querySelector("input[name='nombre']");
const descripcion = document.querySelector("#descripcion");

//pedimos los datos
ipcRenderer.send('obtener-datos-editar');
//rellenamos el formulario
ipcRenderer.on('datos-edit', (e, args) => {
  var ruta = JSON.parse(args);
  nombre.value=ruta['nombre'];
  descripcion.value=ruta['descripcion'];
  document.querySelector("#ciudadRuta option[value="+ruta['ciudad']+"]").attributes('selected','selected');
  document.querySelector("#transporteRuta option[value="+ruta['transporte']+"]").attributes('selected','selected');
  document.querySelector("#tematicaRuta option[value="+ruta['tematica']+"]").attributes('selected','selected');
  //document.querySelector("#dificultad [value="+ruta['dificultad']+"]").prop('checked', true);
});

//VOLVER AL HOME
const btnVolver = document.querySelector("#btnBack");
//boton volver a home
btnVolver.addEventListener('click', e => {
  ipcRenderer.send("volver-home");
});


function nuevaLocalizacion(){
  localizaciones.push([latlang.lat,latlang.lng]);
  console.log(localizaciones);

  marker = new L.marker(localizaciones[numLocalizaciones]);
  map.addLayer(marker);
  marker.bindPopup('Localizacion '+(numLocalizaciones+1)).openPopup();

  listaMarker.push(marker);


  /*****NUEVA FILA TABLA*****/

  $('#localizacionesDeRuta').append("<tr id='"+numLocalizaciones+"'></tr>");

  $('#localizacionesDeRuta #'+numLocalizaciones).append("<th scope='row'>"+lugar+"</th><td></td>");

  $('#localizacionesDeRuta #'+numLocalizaciones+" td").append("<Button type='button' onclick=borrar('"+numLocalizaciones+"')><em class='fas fa-eraser'></em></Button>");


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


var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab
titulo = ["Nueva Ruta","Nueva localizacion","Pregunta"];


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
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  // ... and run a function that displays the correct step indicator:
  fixStepIndicator(n)
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
 
  var JSONRuta =  {
    "nombre" : nombre.value,
    "descripcion" :descripcion.value,
    "imagen" : $('#imagenRuta').val(),
    "ciudad" : $('#ciudadRuta').val(),
    "transporte" : $('#transporteRuta').val(),
    "tematica" : $('#tematicaRuta').val(),
    "dificultad":difi,
    "listaLocalizaciones":[],
  };
    
  }


//hacer el update
ipcRenderer.send("editar-datos",JSONRuta);
