var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_URL);

var Schema = mongoose.Schema;

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
 * This is the user document
 */
var UserDiary = new Schema({
	name : {type: String, trim: true },
	thirdPartyId : { type: String, unique: true },
	email : String,
	thumbnailPath : String,
	updated_at : { type: Date, default: Date.now },
	logEntries : [Entry]
});

var User = mongoose.model('UserDiary', UserDiary);  


exports.findUser = function(req, res) {
	
	var userId = req.params.id;
	
	if(!userId)return;

	return User.findById(userId, function (err, user) {
		if (!err) {
			return res.send(user);
	    } else {
	    	return console.log(err);
	    }
	});
};

exports.addUser = function(req, res) {

	//console.log(req.body);
	
	var user = {
		name : req.body.name,
		thirdPartyId : req.body.thirdPartyId,
		email : req.body.email,
		thumbnailPath : req.body.thumbnailPath
	};
	
	User.findOneAndUpdate({ thirdPartyId: req.body.thirdPartyId }, user, { upsert: true }, function (err, object) {
		if (err) return handleError(err);
		console.log('added ['+req.body.thirdPartyId+']');
		return res.send(object);
	});
	
};

exports.updateUser = function(req, res) {

	var user = {
			name : req.body.name,
			thirdPartyId : req.body.thirdPartyId,
			email : req.body.email,
			thumbnailPath : req.body.thumbnailPath
		};
		
		User.findOneAndUpdate({ thirdPartyId: req.body.thirdPartyId }, user, { upsert: true }, function (err, object) {
			if (err) return handleError(err);
			console.log('updated ['+req.body.thirdPartyId+']');
			return res.send(object);
		});

};

exports.deleteUser = function(req, res) {

	User.findOneAndRemove({ thirdPartyId: req.body.thirdPartyId }, function (err) {
		if (err) return handleError(err);
		console.log('removed ['+req.body.thirdPartyId+']');
		return res.send('');
	});

};

exports.findUserDiary = function(req, res) {

	var userId = req.params.id;
	
	if(!userId)return;
	
	User.findById(userId, function (err, user) {
		  if (!err) {
			  return res.send(user.logEntries);
		  }else{
			  return console.log(err);
		  }
	});
};

exports.addUserDiaryEntry = function(req, res) {

	var userId = req.params.id;
	
	if(!userId)return;
	
	var entry = {
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
	};
	
	User.findById(userId, function (err, user) {
		if (!err) {
			user.logEntries.push(entry);
			user.save(function (err) {
				 if (!err) {
					  return res.send(entry);
				  }else{
					  return console.log(err);
				  }
		    });
		}
	});
};

exports.updateUserDiaryEntry = function(req, res) {

	var userId = req.params.id;
	
	User.findById(userId, function (err, user) {
		  if (!err) {
		    user.logEntries[0].remove();
		    user.save(function (err) {
		      // do something
		    });
		  }
		});

};

exports.deleteUserDiaryEntry = function(req, res) {

var userId = req.params.id;
var entryId = req.params.entry_id;
	
	User.findById(userId, function (err, user) {
		  if (!err) {
			  user.logEntries.id(entryId).remove();
		    user.save(function (err) {
		      // do something
		    });
		  }
		});

};