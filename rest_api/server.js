var express = require('express'),
    users = require('./routes/users');
 
var app = express();
 
app.get('/users', users.findAll);
app.get('/users/:id', users.findById);
 
app.listen(3000);
console.log('Listening on port 3000...');