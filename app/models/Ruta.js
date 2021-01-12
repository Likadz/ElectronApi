const { model , Schema} = require('mongoose')

const newRutaSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  description: {
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
  }
})

module.exports = model('Ruta', newRutaSchema);