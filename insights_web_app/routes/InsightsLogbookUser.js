var mysql = require('mysql');
var mysqldb = mysql.createConnection({
	host : 'us-cdbr-east-03.cleardb.com',
	user : 'b95d456714e818',
	password : 'e9ec1df8',
	database : 'heroku_fee62f08e9a254b',
});

function handleDisconnect(connection) {
	connection
			.on(
					'error',
					function(err) {
						if (!err.fatal) {
							return;
						}
						if (err.code === 'PROTOCOL_CONNECTION_LOST') {
							console
									.log("The mysql library fired a PROTOCOL_CONNECTION_LOST exception");
							throw err;
						}
						console.log('Re-connecting lost connection: '
								+ err.stack);

						mysqldb = mysql.createConnection({
							host : 'us-cdbr-east-03.cleardb.com',
							user : 'b95d456714e818',
							password : 'e9ec1df8',
							database : 'heroku_fee62f08e9a254b',
						});
						handleDisconnect(mysqldb);
						mysqldb.connect();
					});
}

handleDisconnect(mysqldb);

exports.findById = function(req, res) {

	var userId = req.params.id;

	mysqldb.query('SELECT * FROM user WHERE id = ?', [ userId ], function(err,
			results) {
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

	var userShareId = req.query.linkId;
	console.log('Get user to share: ' + userShareId);

	mysqldb.query('SELECT * FROM user WHERE shareLinkId = ?', [ userShareId ],
			function(err, results) {
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
		shareLinkId : req.body.shareLinkId,
		allowSharing : req.body.allowSharing,
		updated_at : new Date()
	};

	console.log('about to add or update user: ' + JSON.stringify(user));
	mysqldb.query('INSERT INTO user SET ? ON DUPLICATE KEY UPDATE ? ', [ user,
			user ], function(err, result) {
		if (err) {
			res.send({
				'error' : 'An error has occurred'
			});
		} else {
			// console.log('Success: ' + JSON.stringify(result));
			res.send({
				"id" : result.insertId
			});
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
		shareLinkId : req.body.shareLinkId,
		allowSharing : req.body.allowSharing,
		updated_at : new Date()
	};

	var userId = req.params.id;
	console.log('update: ' + user);

	mysqldb.query('UPDATE user SET ? WHERE id = ?', [ user, userId ], function(
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

exports.findCareLinkResults = function(req, res) {
	var userId = req.params.userId,
	fromDate = req.query.fromDate,
	toDate = req.query.toDate;
	
	console.log('carelink logbook for: ' + userId+" from ["+fromDate+"] to ["+toDate+"] of type");

	mysqldb.query('SELECT * FROM insight_entries_carelink WHERE userId = ? AND resultDate >= ? AND resultDate <= ? ORDER BY resultDate DESC ', [fromDate, toDate, userId ],
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