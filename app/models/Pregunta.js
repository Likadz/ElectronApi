const { model , Schema, get} = require('mongoose')

const newPreguntaSchema = new Schema({
  id:{
    type:String,
    required: false
  },
  pregunta: {
    type: String,
    required: true
  },
  respuestaA: {
    type: String,
    required: true
  },
  respuestaB:{
    type: String,
    required: true
  },
  respuestaC:{
    type:String,
    required:true
  },
  imagen:{
    type:String,
    required:true
  },
  correcta:{
    type:Number,
    required:true
  },
})

module.exports = model('Pregunta', newPreguntaSchema);