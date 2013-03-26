var express = require('express'),
	path = require('path'),
	http = require('http'),
    user = require('./routes/logbookuser');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser()),
	app.use(express.static(path.join(__dirname, 'public')));
});

/* User */ 
app.get('/users/:id', user.findById);
app.get('/users', user.findByLinkId);
app.post('/users', user.addUser);
app.put('/users/:id', user.updateUser);

/* User Log Book */
app.get('/users/:userId/logbook', user.findAllResults);
app.post('/users/:userId/logbook', user.addResult);
app.put('/users/:userId/logbook/:id', user.updateResult);
app.delete('/users/:userId/logbook/:id', user.deleteResult);

/* User Settings */
app.get('/settings/:id', user.findAllSettings);
app.post('/settings/:id', user.addSetting);
app.put('/settings/:id', user.updateSetting);
app.delete('/settings/:id', user.deleteSetting);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});