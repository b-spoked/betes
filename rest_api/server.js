var express = require('express'),
    users = require('./routes/users'),
	logbook = require('./routes/logbook'),
	settings = require('./routes/settings');
 
var app = express();
/* User */ 
app.get('/users/:id', users.findById);
app.post('/users', users.addUser);
app.put('/users/:id', users.updateUser);
app.delete('/users/:id', users.deleteUser);
/* User Logbook */
app.get('/logbook/:id', logbook.findAll);
app.post('/logbook', logbook.addResult);
app.put('/logbook/:id', logbook.updateResult);
app.delete('/logbook/:id', logbook.deleteResult);
/* User Settings */
app.get('/settings/:id', settings.findAll);
app.post('/settings', settings.addSetting);
app.put('/settings/:id', settings.updateSetting);
app.delete('/settings/:id', settings.deleteSetting);
 
app.listen(3000);
console.log('Listening on port 3000...');