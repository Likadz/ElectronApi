const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Josu:Plaiaundi2020@clusterjosu.zcvkx.mongodb.net/Reto?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(db => console.log('DB is connected'))
  .catch(err => console.log(err));

/*
mongoose.connect('mongodb://localhost/reto', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(db => console.log('DB is connected'))
  .catch(err => console.log(err));
*/