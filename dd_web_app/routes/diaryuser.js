var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_URL);

var Schema = mongoose.Schema;

var toJSON = mongoose.Document.prototype.toJSON;



/**
 * Dairy entry
 */
var Entry = new Schema({
	name: {type: String, trim: true },
    glucoseLevel: Number,
    resultDate: Date,
    insulinAmount: Number,
    exerciseDuration: Number,
    exerciseIntensity: {type: String, trim: true },
    labels: {type: String, trim: true },
    comments: {type: String, trim: true },
    latitude: Number,
    longitude: Number,
    updated_at :{ type: Date, default: Date.now }
});
/**
 * Override so we can add id field for offline and backbone support
 */
Entry.methods.toJSON = function (opts) {
	var ret = toJSON.apply(this, arguments);
	ret["id"] = ret["_id"]; 
	return ret;
};

/**
 * This is the user document
 */
var UserDiary = new Schema({
	name : {type: String, trim: true },
	thirdPartyId : { type: String, unique: true },
	email : {type: String, trim: true },
	thumbnailPath : {type: String, trim: true },
	updated_at : { type: Date, default: Date.now },
	logEntries : [Entry]
});
/**
 * Override so we can add id field for offline and backbone support
 */
UserDiary.methods.toJSON = function (opts) {
	var ret = toJSON.apply(this, arguments);
	ret["id"] = ret["_id"]; 
	return ret;
};

var User = mongoose.model('UserDiary', UserDiary);  
var DiaryEntry = mongoose.model('Entry', Entry);  

exports.findUser = function(req, res) {
	 console.log(req.body);
	var userId = req.params.id;
	if(!userId)return;
	console.log("user: "+userId);
	
	if (userId.match(/^[0-9a-fA-F]{24}$/)) {
	
		return User.findById(userId, function (err, user) {
			if (!err) {
				return res.send(user.toJSON());
			} else {
				return console.log(err);
			}
		});
	}
	return res.send(false);
};

exports.notUsed = function(req, res) {
	
	return res.send(false);
	    
};

exports.addUser = function(req, res) {

	 console.log(req.body);
	
	var upsertData = {
		name : req.body.name,
		thirdPartyId : req.body.thirdPartyId,
		email : req.body.email,
		thumbnailPath : req.body.thumbnailPath,
		updated_at: new Date()
	};
	
	// var upsertData = userDetails.toObject();
	
	return User.findOneAndUpdate({ thirdPartyId: req.body.thirdPartyId }, upsertData, { upsert: true }, function (err, user) {
		if (err) return res.send(err);
		// console.log('added ['+req.body.thirdPartyId+']');
		// console.log(user.toJSON());
		res.send(user.toJSON());
	});
	
};

exports.updateUser = function(req, res) {

	 console.log(req.body);
	
	var upsertData = {
			name : req.body.name,
			thirdPartyId : req.body.thirdPartyId,
			email : req.body.email,
			thumbnailPath : req.body.thumbnailPath,
			updated_at: new Date()
		};
	

	// var upsertData = userDetails.toObject();
	
	return User.findOneAndUpdate({ thirdPartyId: req.body.thirdPartyId }, upsertData , { upsert: true }, function (err, user) {
			if (err) return res.send(err);
			// console.log('updated ['+req.body.thirdPartyId+']');
			// console.log(user.toJSON());
			return res.send(user.toJSON());
		});

};

exports.deleteUser = function(req, res) {

	User.findOneAndRemove({ thirdPartyId: req.body.thirdPartyId }, function (err) {
		if (err) return res.send(err);
		console.log('removed ['+req.body.thirdPartyId+']');
		return res.send('');
	});

};

exports.findUserDiary = function(req, res) {

	var userId = req.params.userId;
	
	if(!userId)return;
	
	return User.findById(userId, function (err, user) {
		  if (!err) {
			  return res.send(user.logEntries);
		  }else{
			  return console.log(err);
		  }
	});
};

exports.addUserDiaryEntry = function(req, res) {

	var userId = req.params.userId;
	
	if(!userId)return;
	
	var entry = new DiaryEntry({
		name: req.body.name,
		glucoseLevel: req.body.glucoseLevel,
		resultDate: req.body.resultDate,
		insulinAmount: req.body.insulinAmount,
		exerciseDuration: req.body.exerciseDuration,
		exerciseIntensity: req.body.exerciseIntensity,
		labels: req.body.labels,
		comments: req.body.comments,
		latitude: req.body.latitude,
		longitude: req.body.longitude
	});
	
	return User.findById(userId, function (err, user) {
		if (!err) {
			user.logEntries.push(entry);
			user.save(function (err) {
				if (!err) {
					return res.send(entry.toJSON());
				}else{
					return console.log(err);
				}
		    });
		}
	});
	
	return User.findOneAndUpdate(userId, function (err, user) {
		if (err) return handleError(err);
		
		user.logEntries.push(entry);
		user.save(function (err) {
			if (!err) {
				return res.send(entry.toJSON());
			}else{
				return console.log(err);
			}
	    });
	});
};

exports.updateUserDiaryEntry = function(req, res) {

	var userId = req.params.userId;
	var entryId = req.params.id;
	
	if(!userId || !entryId) return;
	
	var entry = new DiaryEntry({
		name: req.body.name,
		glucoseLevel: req.body.glucoseLevel,
		resultDate: req.body.resultDate,
		insulinAmount: req.body.insulinAmount,
		exerciseDuration: req.body.exerciseDuration,
		exerciseIntensity: req.body.exerciseIntensity,
		labels: req.body.labels,
		comments: req.body.comments,
		latitude: req.body.latitude,
		longitude: req.body.longitude
	});
	
	return User.update({_id: userId, 'logEntries._id': entryId}, entry, function(err, result) {
		if (!err) {
			return res.send(result.toJSON());
		}else{
			return console.log(err);
		}
	});
	
};

exports.deleteUserDiaryEntry = function(req, res) {

	var userId = req.params.id;
	var entryId = req.params.entryId;

	if(!userId || !entryId)return;
	
	User.findById(userId, function (err, user) {
		  if (!err) {
			  user.logEntries.id(entryId).remove();
		    user.save(function (err) {
		    	if (!err) {
					return res.send('');
				}else{
					return console.log(err);
				}
		    });
		  }
		});

};