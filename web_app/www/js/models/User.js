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
		logEntries : []
		//userSettings : []
	},

	urlRoot : "/api/index.php/user.json",

	initialize : function() {
		_.bindAll(this);
		var self = this;
		this.logEntries = new Entries(this.get('logEntries'));
		//this.userSettings = new Settings(this.get('userSettings'));

		this.logEntries.url = function() {
			return self.urlRoot + '/logbook/' + self.get('id');
		};

		/*this.userSettings.url = function() {
			return self.urlRoot + '/settings/' + self.get('id');
		};*/
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
			return ( parseInt(entry.get("bsLevel")) > 10);
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
			return (parseInt(entry.get("bsLevel")) > 0 );
		}).length;
		
		return tests;

	},
	exercise : function() {
		
		var exercise = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("exerciseDuration")) > 0 );
		});
		
		var total;
		
		exercise.forEach(function(entry) {
			console.log(entry);
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
	url : '/api/index.php/user.json'
});