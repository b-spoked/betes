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
		thirdPartyId:0,
		email : 'na',
		newsletter : false,
		thumbnailPath : '',
		authenticated : false,
		testingUnits : 'mmol/l',
		logUsed : false,
		goalsUsed : false,
		logEntries : [],
		settings : []
	},

	urlRoot : "/users",

	initialize : function() {
		_.bindAll(this);
		var self = this;
		this.logEntries = new Entries(this.get('logEntries'));
		this.settings = new Settings(this.get('settings'));

		this.logEntries.url = function() {
			return '/logbook/'+ self.get('sid');
		};

		this.settings.url = function() {
			return '/settings/'+self.get('sid');
		};
	},
	hasLogEntries : function() {
		this.logUsed = (this.logEntries.length > 0);
		return this.logUsed;
	},
	hasGoals : function() {
		return false;
	},
	highs : function() {
		var highs = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("bsLevel")) > 10);
		}).length;

		return highs;
	},
	lows : function() {

		var lows = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("bsLevel")) > 0 && parseInt(entry
					.get("bsLevel")) < 4);
		}).length;

		return lows;
	},
	tests : function() {

		var tests = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("bsLevel")) > 0);
		}).length;

		return tests;

	},
	exercise : function() {

		var exercise = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("exerciseDuration")) > 0);
		});

		var total = 0;

		exercise.forEach(function(entry) {
			total += parseInt(entry.get("exerciseDuration"));
			console.log(total);
		});

		return total;

	}

});

window.UserDetails = Backbone.Collection.extend({
	model : User,
	initialize : function() {
		this.storage = new Offline.Storage('logbook-user', this, {
			autoPush : true
		});
	},
	url : '/users'
});