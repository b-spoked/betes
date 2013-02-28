/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:41 PM
 * To change this template use File | Settings | File Templates.
 */
window.User = Backbone.Model.extend({
	defaults : {
		name : '',
		email : 'na',
		newsletter : false,
		thumbnailPath : '',
		authenticated : false,
		testingUnits : 'mmol/l',
		logUsed : false,
		goalsUsed : false,
		logEntries : [],
		userGoals : []
	},

	urlRoot : "/api/index.php/user.json",

	initialize : function() {
		_.bindAll(this);
		var self = this;
		this.logEntries = new Entries(this.get('logEntries'));
		this.userGoals = new GoalSet(this.get('userGoals'));

		this.logEntries.url = function() {
			return self.urlRoot + '/logbook/' + self.get('id');
		};

		this.userGoals.url = function() {
			return self.urlRoot + '/goals/' + self.get('id');
		};
	},
	hasLogEntries : function() {
		this.logUsed = (this.logEntries.length > 0);
		return this.logUsed;
	},
	hasGoals : function() {
		this.goalsUsed = (this.userGoals.length > 0);
		return this.goalsUsed;
	},
	highs : function() {
		return _(this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("bsLevel")) > 10);
		}));
	},
	lows : function() {
		return _(this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("bsLevel")) > 0 && parseInt(entry
					.get("bsLevel")) < 4);
		}));

	},
	tests : function() {

		return _(this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("bsLevel")) > 0);
		}));

	},
	exercise : function() {

		return _(this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("exerciseDuration")) > 0);
		}));

	}

});

window.UserDetails = Backbone.Collection.extend({
	model : User,
	initialize : function() {
		this.storage = new Offline.Storage('logbook-user', this, {
			autoPush : true
		});
	},
	url : '/api/index.php/user.json'
});