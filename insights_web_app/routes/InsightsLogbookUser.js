var mysql = require('mysql');

var mysqldb = mysql.createConnection({
	host : 'us-cdbr-east-03.cleardb.com',
	user : 'b603ad3f253e78',
	password : 'f194bb0e',
	database : 'heroku_dd76de52e0812e0',
});

var logBookCarelinkSelectBase = "SELECT `Id`"
	+", `userId`"
	+", `resultDate`"
	+", COALESCE(`bsLevel`,`SensorGlucose`,`BWZBGInput`,`SensorCalibrationBG`) AS glucoseLevel"
	+", `BWZInsulinSensitivity` AS insulinSensitivity"
	+", `BolusVolumeDelivered` AS bolusAmount"
	+", `BWZCarbRatio` AS carbRatio"
	+", `RawValues` AS comments"
	+", `RawType` AS labels"
	+" FROM `insight_log_carelink`"
	+" WHERE userId = ?"
	+" AND COALESCE(`bsLevel`,`SensorGlucose`,`BWZBGInput`,`SensorCalibrationBG`) > 0"
	+" OR `BWZInsulinSensitivity` > 0"
	+" OR `BolusVolumeDelivered` > 0"
	+" OR `BWZCarbRatio` > 0";

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
							user : 'b603ad3f253e78',
							password : 'f194bb0e',
							database : 'heroku_dd76de52e0812e0',
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

exports.addUserData = function(req, res) {

	var form = new formidable.IncomingForm({uploadDir:__dirname+'/uploaded-data'});
	var userId = req.params.id;
	
	console.log('load data for: ' + userId);

	form.on('end',function(){
		console.log('upload complete');
		res.end('uploaded: '+util.inspect(files))
	});
	
	form.parse(req, function(err, fields, files) {
		 res.writeHead(200, {'content-type': 'text/plain'});
		 res.write('received upload:\n\n');
		 res.end(util.inspect({fields: fields, files: files}));
	});
	
	return;

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

exports.careLinkLogDetail = function(req, res) {
	var userId = req.params.userId;
	var getAll = req.query.all;
	var fromDate = req.query.fromDate;
	var toDate = req.query.toDate;
	var logBookSelect = "";
	
	logBookSelect = getAllLogEntriesSelect();
	/*
	if(getAll){
		console.log('Get All Entries: ');
		logBookSelect  = getAllLogEntriesSelect();
	}else{
		console.log('Get Months Entries: ');
		logBookSelect = getMonthsLogEntriesSelect();
	}*/
	
	mysqldb.query(logBookSelect, [userId],
			function(err, results) {
				if (err) {
					res.send({
						'error' : 'An error has occurred' +JSON.stringify(err)
					});
				} else {
					console.log('Success: ' + JSON.stringify(results));
					res.send(results);
				}
			});
	
};

function getLogEntriesForDateRangeSelect(fromDate,toDate){
	var datesBetween = " AND `resultDate` BETWEEN ? AND ? ORDER BY `resultDate` DESC";
	return logBookCarelinkSelectBase.concat(datesBetween);
}

function getAllLogEntriesSelect(){
	return logBookCarelinkSelectBase.concat(" ORDER BY `resultDate` DESC");
}

function getMonthsLogEntriesSelect(){
	return logBookCarelinkSelectBase.concat(" LIMIT 1000 ORDER BY `resultDate` DESC");
}