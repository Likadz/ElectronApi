const { model , Schema} = require('mongoose')

const newUsuarioSchema = new Schema({
  usuario:{
    type: String,
    required: true
  },
  contraseña:{
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido:{
    type:String,
    required: false
  },
  rol:{
    type: String,
    required: true
  },
  conectado:{
    type:Boolean,
    required:true
  }
})

module.exports = model('Usuario', newUsuarioSchema);