var express = require('express'),
	path = require('path'),
	http = require('http'),
    user = require('./routes/diaryuser');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
	app.use(express.bodyParser()),
	app.use(express.static(path.join(__dirname, 'public')));
});

/* User */ 
app.get('/users/:id', user.findUser);
app.get('/users', user.notUsed);
app.post('/users', user.addUser);
app.put('/users/:id', user.updateUser);
app.put('/users/:id', user.deleteUser);

/* User Diary */
app.get('/users/:userId/diary', user.findUserDiary);
app.post('/users/:userId/diary', user.addUserDiaryEntry);
app.put('/users/:userId/diary/:id', user.updateUserDiaryEntry);
app.delete('/users/:userId/diary/:id', user.deleteUserDiaryEntry);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});