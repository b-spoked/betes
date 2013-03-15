var express = require('express'),
    user = require('./routes/logbookuser');
 
var app = express();
/* User */ 
app.get('/users/:id', user.findById);
app.post('/users', user.addUser);
app.put('/users/:id', user.updateUser);

/* User Log Book */
app.get('/logbook/:id', user.findAllResults);
app.post('/logbook', user.addResult);
app.put('/logbook/:id', user.updateResult);
app.del('/logbook/:id', user.deleteResult);

 
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});