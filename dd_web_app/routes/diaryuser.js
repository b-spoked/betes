var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_URL);

var Schema = mongoose.Schema;

/**
 * Dairy entry
 */
var Entry = new Schema({
	name: {type: String, trim: true },
    glucose_level: Number,
    entry_date: Date,
    insulin_amount: Number,
    exercise_duration: Number,
    exercise_intensity: {type: String, trim: true },
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
	third_party_id : { type: String, unique: true },
	email : String,
	thumbnail_path : String,
	updated_at : { type: Date, default: Date.now },
    diary : [Entry],
});

var UserDiaryModel = mongoose.model('UserDiary', UserDiary);  




exports.findUser = function(req, res) {

	return UserDiaryModel.findById(userId, function (err, user) {
		if (!err) {
			return res.send(user);
	    } else {
	    	return console.log(err);
	    }
	});
};

exports.addUser = function(req, res) {

	  console.log(req.body);
	  var user = new UserDiaryModel({
		 name : req.body.name,
		 third_party_id : req.body.third_party_id,
		 email : req.body.email,
		 thumbnail_path : req.body.thumbnail_path,
		 diary: req.body.diary
	  });
	  user.save(function (err) {
	    if (!err) {
	      return console.log("created");
	    } else {
	      return console.log(err);
	    }
	  });
	  return res.send(user);

};

exports.updateUser = function(req, res) {

	var userId = req.params.id;
	console.log(req.body);
	
	return UserDiaryModel.findById(userId, function (err, user) {
		user.name : req.body.name,
		user.third_party_id : req.body.third_party_id,
		user.email : req.body.email,
		user.thumbnail_path : req.body.thumbnail_path,
		user.diary: req.body.diary
	    return user.save(function (err) {
	      if (!err) {
	        console.log("updated");
	      } else {
	        console.log(err);
	      }
	      return res.send(user);
	    });
	  });

};

exports.deleteUser = function(req, res) {

	var userId = req.params.id;
	return UserDiaryModel.findById(req.params.id, function (err, user) {
	    return user.remove(function (err) {
	      if (!err) {
	        console.log("removed");
	        return res.send('');
	      } else {
	        console.log(err);
	      }
	    });
	  });

};

exports.findUserDiary = function(req, res) {

	var userId = req.params.id;
	
	UserDiaryModel.findById(userId, function (err, user) {
		  if (!err) {
			  return res.send(user.diary);
		  }else{
			  return console.log(err);
		  }
	});
};

exports.addUserDiaryEntry = function(req, res) {

	var userId = req.params.id;
	
	var entry{
		name: req.body.name,
		glucose_level: req.body.glucose_level,
		entry_date: req.body.entry_date,
		insulin_amount: req.body.insulin_amount,
		exercise_duration: req.body.exercise_duration,
		exercise_intensity: req.body.exercise_intensity,
		labels: req.body.labels,
		comments: req.body.comments,
		latitude: req.body.latitude,
		longitude: req.body.longitude
	};
	
	UserDiaryModel.findById(userId, function (err, user) {
		  if (!err) {
		    user.diary.push(entry);
		    user.save(function (err) {
		      // do something
		    });
		  }
		});
};

exports.updateUserDiaryEntry = function(req, res) {

	var userId = req.params.id;
	
	UserDiaryModel.findById(userId, function (err, user) {
		  if (!err) {
		    user.diary[0].remove();
		    user.save(function (err) {
		      // do something
		    });
		  }
		});

};

exports.deleteUserDiaryEntry = function(req, res) {

var userId = req.params.id;
var entryId = req.params.entry_id;
	
	UserDiaryModel.findById(userId, function (err, user) {
		  if (!err) {
			  user.diary.id(entryId).remove();
		    user.save(function (err) {
		      // do something
		    });
		  }
		});

};