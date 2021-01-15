const { model , Schema, get} = require('mongoose')

const newRutaSchema = new Schema({
  id:{
    type:String,
    required: false
  },
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  ciudad:{
    type: String,
    required: true
  },
  duracion:{
    type:Number,
    required:false
  },
  tematica:{
    type:String,
    required:true
  },
  transporte:{
    type:String,
    required:true
  },
  imagen:{
    type:String,
    required:false
  },
  dificultad:{
    type:Number,
    required:true
  },
  listaLocalizaciones:{
    type:Array,
    required:false
  }
})

module.exports = model('Ruta', newRutaSchema);