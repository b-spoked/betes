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

exports.addResult = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};

exports.updateResult = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};

exports.deleteResult = function(req, res) {
	res.send({
		id : req.params.id,
		name : "The Name",
		description : "description"
	});
};