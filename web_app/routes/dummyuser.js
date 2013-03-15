var mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'example.org',
	user : 'bob',
	password : 'secret',
	database : 'testdb',
});

connection.connect(function(err) {
	if (err) {
		console.log('Error: An error has occurred');
	} else {
		console.log('Success: ');
	}
});

exports.findById = function(req, res) {
	var userId = req.params.id;
	var sql = 'SELECT * FROM user WHERE id = ' + connection.escape(userId);
	console.log(sql);
};

exports.addUser = function(req, res) {

	var user = {
		name : req.body.name,
		email : req.body.email,
		thumbnailPath : req.body.thumbnailPath,
		newsletter : req.body.newsletter,
		updated_at : new Date()
	};
	
	console.log(JSON.stringify(user));
};

exports.updateUser = function(req, res) {
	
	var user = {
			name : req.body.name,
			email : req.body.email,
			thumbnailPath : req.body.thumbnailPath,
			newsletter : req.body.newsletter,
			updated_at : new Date()
		};

	var resultId = req.params.id;


	console.log(JSON.stringify(user));
	console.log("update for result:"+resultId);
	
};

exports.findAllResults = function(req, res) {
	var userId = req.params.id;
	var sql = 'SELECT * FROM result WHERE userId = '
			+ userId;

	console.log(sql);
	
};

exports.addResult = function(req, res) {

	var result = {
		name : req.body.name,
		bsLevel : req.body.bsLevel,
		insulinAmount : req.body.insulinAmount,
		resultDate : req.body.resultDate,
		exerciseDuration : req.body.exerciseDuration,
		exerciseIntensity : req.body.exerciseIntensity,
		comments : req.body.comments,
		labels : req.body.labels,
		userId : req.body.userId,
		updated_at : new Date()
	};
	
	console.log(JSON.stringify(result));
	
};

exports.updateResult = function(req, res) {
	var result = {
		name : req.body.name,
		bsLevel : req.body.bsLevel,
		insulinAmount : req.body.insulinAmount,
		resultDate : req.body.resultDate,
		exerciseDuration : req.body.exerciseDuration,
		exerciseIntensity : req.body.exerciseIntensity,
		comments : req.body.comments,
		labels : req.body.labels,
		userId : req.body.userId,
		updated_at : new Date()
	};

	var resultId = req.params.id;
	
	console.log(JSON.stringify(result));
	console.log("for result: "+resultId);
};

exports.deleteResult = function(req, res) {
	var resultId = req.params.id;

	console.log("delete result: "+resultId);
};

