var mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'us-cdbr-east-03.cleardb.com',
	user : 'b95d456714e818',
	password : 'e9ec1df8',
	database : 'heroku_fee62f08e9a254b',
});

handleDisconnect = function(connection) {
	  connection.on('error', function(err) {
	    if (!err.fatal) {
	      return;
	    }

	    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
	      throw err;
	    }

	    console.log('Re-connecting lost connection: ' + err.stack);

	    connection = mysql.createConnection({
	    	host : 'us-cdbr-east-03.cleardb.com',
	    	user : 'b95d456714e818',
	    	password : 'e9ec1df8',
	    	database : 'heroku_fee62f08e9a254b',
	    });
	    handleDisconnect(connection);
	    connection.connect();
	  });
};

connection.connect(function(err) {
	if (err) {
		console.log('Error: An error has occurred');
	} else {
		console.log('Successfully connected to db');
	}
});


handleDisconnect(connection);




exports.findById = function(req, res) {
	var userId = req.params.id;
	var sql = 'SELECT * FROM user WHERE id = ' + connection.escape(userId);
	connection.query(sql, function(err, results) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			console.log('Success: ' + JSON.stringify(results[0]));
			res.send(results[0]);
		}
	});
};

exports.addUser = function(req, res) {

	var user = {
		name : req.body.name,
		email : req.body.email,
		thumbnailPath : req.body.thumbnailPath,
		newsletter : req.body.newsletter,
		updated_at : new Date()
	};

	connection.query('INSERT INTO user SET ? ', user,
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

	connection.query('UPDATE user SET ? WHERE id = ?', user, resultId,
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
};

exports.findAllResults = function(req, res) {
	var userId = req.params.id;
	var sql = 'SELECT * FROM result WHERE userId = '
			+ connection.escape(userId);
	connection.query(sql, function(err, results) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			console.log('Success: ' + JSON.stringify(results));
			res.send(results);
		}
	});
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

	connection.query('INSERT INTO result SET ? ', result,
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

	connection.query('UPDATE result SET ? WHERE id = ?', result, resultId,
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
};

exports.deleteResult = function(req, res) {
	var resultId = req.params.id;

	connection.query('DELETE FROM result WHERE id = ?', [resultId],
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
};

exports.addSettings = function(req, res) {
	var setting = req.body;
	console.log('Adding setting: ' + JSON.stringify(setting));
	db.collection('settings', function(err, collection) {
		collection.insert(setting, {
			safe : true
		}, function(err, result) {
			if (err) {
				res.send({
					'error' : 'An error has occurred'
				});
			} else {
				console.log('Success: ' + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
};

exports.updateSettings = function(req, res) {
	var wine = req.body;
	console.log('Adding wine: ' + JSON.stringify(wine));
	db.collection('wines', function(err, collection) {
		collection.insert(wine, {
			safe : true
		}, function(err, result) {
			if (err) {
				res.send({
					'error' : 'An error has occurred'
				});
			} else {
				console.log('Success: ' + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
};