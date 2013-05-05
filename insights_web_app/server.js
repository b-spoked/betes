var express = require('express'),
	path = require('path'),
	http = require('http'),
	formidable = require('formidable'),
	util = require('util'),
    user = require('./routes/InsightsLogbookUser');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser()),
	app.use(express.static(path.join(__dirname, 'public')));
});

/* User */ 
app.get('/insights-users/:id', user.findById);
app.get('/insights-users', user.findByLinkId);
app.post('/insights-users', user.addUser);
app.put('/insights-users/:id', user.updateUser);

/* User Data*/
app.post('/insights-users/:id/upload-data', user.addUserData);

/* User Log Book */
app.get('/insights-users/:userId/logbook/carelink', user.careLinkLogDetail);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
