var mysql = require('mysql');

var connection = mysql.createConnection({
	host : 'us-cdbr-east-03.cleardb.com',
	user : 'b95d456714e818',
	password : 'e9ec1df8',
	database : 'heroku_fee62f08e9a254b',
});

exports.findById = function(req, res) {
	
	
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
	
};

exports.findByLinkId = function(req, res) {
	
	
	var userShareId = req.params.linkId;
	
	connection.query('SELECT * FROM user WHERE shareLinkId = ?',[userShareId], function(err, results) {
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
		thirdPartyId : req.body.thirdPartyId,
		email : req.body.email,
		thumbnailPath : req.body.thumbnailPath,
		newsletter : req.body.newsletter,
		updated_at : new Date()
	};
	
	console.log('about to add or update user: ' +  JSON.stringify(user));
	connection.query('INSERT INTO user SET ? ON DUPLICATE KEY UPDATE ? ', [user,user], function(err, result) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			//console.log('Success: ' + JSON.stringify(result));
			res.send({"id":result.insertId});
		}
	});
	
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
	
	var userId = req.params.id;
	console.log('update: ' + user);

	connection.query('UPDATE user SET ? WHERE id = ?', [user,userId],
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
	var userId = req.params.userId;
	
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
	
	console.log('about to add result: ' +  JSON.stringify(logResult));
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
	
};

exports.updateResult = function(req, res) {
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
	
	console.log('about to update result: ' + JSON.stringify(logResult));
	var resultId = req.params.id;
	console.log('result id: ' + resultId);
	connection.query('UPDATE result SET ? WHERE id = ?', [logResult,resultId],
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
	
	console.log('about to delete result: ' + resultId);
	connection.query('DELETE FROM result WHERE id = ?',  [resultId] , function(
			err, results) {
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
exports.findAllSettings = function(req, res) {
	var userId = req.params.id;
	
	console.log('settings for: ' + userId);
	
	
};

exports.addSetting = function(req, res) {

	

	console.log('about to add setting: ');
	
	
};

exports.updateSetting = function(req, res) {
	var settingId = req.params.id;
	
	console.log('about to update setting: ' + settingId);
	
	
};

exports.deleteSetting = function(req, res) {
	var settingId = req.params.id;
	
	console.log('about to delete setting: ' + settingId);
	
	
};
