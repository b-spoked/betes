exports.findAll = function(req, res) {
	res.send([ {
		name : 'user1'
	}, {
		name : 'user2'
	}, {
		name : 'user3'
	} ]);
};

exports.findById = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};

exports.addSetting = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};

exports.updateSetting = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};

exports.deleteSetting = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};