var mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'us-cdbr-east-03.cleardb.com',
	user : 'b95d456714e818',
	password : 'e9ec1df8',
	database : 'heroku_fee62f08e9a254b',
});

exports.findById = function(req, res) {
	connection.connect();
	
	var userId = req.params.id;
	
	connection.query('SELECT * FROM user WHERE id = ?',[userId], function(err, results) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			console.log('Success: ' + JSON.stringify(results[0]));
			res.send(results[0]);
		}
	});
	connection.end();
};

exports.addUser = function(req, res) {

	var user = {
		name : req.body.name,
		thirdPartyId : req.body.thirdPartyId,
		email : req.body.email,
		thumbnailPath : req.body.thumbnailPath,
		newsletter : req.body.newsletter,
		updated_at : new Date()
	};
	connection.connect();

	console.log('about to add user: ' +  JSON.stringify(user));
	connection.query('INSERT INTO user SET ? ', [user], function(err, result) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			//console.log('Success: ' + JSON.stringify(result));
			res.send({"id":result.insertId});
		}
	});
	connection.end();
};

exports.updateUser = function(req, res) {

	var user = {
		name : req.body.name,
		thirdPartyId : req.body.thirdPartyId,
		email : req.body.email,
		thumbnailPath : req.body.thumbnailPath,
		newsletter : req.body.newsletter,
		updated_at : new Date()
	};
	connection.connect();
	var userId = req.params.id;
	console.log('update: ' + user);

	connection.query('UPDATE user SET ? WHERE id = ?', [user], [userId],
			function(err, results) {
				if (err) {
					res.send({
						'error' : 'An error has occurred'
					});
				} else {
					console.log('Success: ' + JSON.stringify(results));
					res.send(results);
				}
			});
	connection.end();
};

exports.findAllResults = function(req, res) {
	var userId = req.params.id;
	connection.connect();
	console.log('logbook for: ' + userId);
	
	connection.query('SELECT * FROM result WHERE userId = ?',[userId], function(err, results) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			console.log('Success: ' + JSON.stringify(results));
			res.send(results);
		}
	});
	connection.end();
};

exports.addResult = function(req, res) {

	var logResult = {
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
	connection.connect();

	console.log('about to add result: ' + logResult);
	connection.query('INSERT INTO result SET ? ', [logResult],
			function(err, result) {
				if (err) {
					res.send({
						'error' : 'An error has occurred'
					});
				} else {
					//console.log('Success: ' + JSON.stringify(results));
					res.send({"id":result.insertId});
				}
			});
	connection.end();
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
	connection.connect();
	console.log('about to update result: ' + result);
	var resultId = req.params.id;
	/*connection.query('UPDATE result SET ? WHERE id = ?', [result], [resultId],
			function(err, results) {
				if (err) {
					res.send({
						'error' : 'An error has occurred'
					});
				} else {
					console.log('Success: ' + JSON.stringify(results));
					res.send(results);
				}
			});*/
	connection.end();
};

exports.deleteResult = function(req, res) {
	var resultId = req.params.id;
	connection.connect();
	console.log('about to delete result: ' + resultId);
	/*connection.query('DELETE FROM result WHERE id = ?',  [resultId] , function(
			err, results) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			console.log('Success: ' + JSON.stringify(results));
			res.send(results);
		}
	});*/
	connection.end();
};
