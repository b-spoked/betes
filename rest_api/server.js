var express = require('express'),
    user = require('./routes/logbookuser');
 
var app = express();
/* User */ 
app.get('/users/:id', user.findById);
app.post('/users', user.addUser);
app.put('/users/:id', user.updateUser);

/* User Log Book */
app.get('/logbook/:id', logbook.findAllResults);
app.post('/logbook', logbook.addResult);
app.put('/logbook/:id', logbook.updateResult);
app.del('/logbook/:id', logbook.deleteResult);

 
app.listen(3000);
console.log('Listening on port 3000...');