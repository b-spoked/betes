/**
 * Log information source
 * 
 */
var LogSource = {
      manual: false,
      carelink: false
    };

/**
 * User Model
 */
window.InsightsUser = Backbone.Model.extend({
	
	defaults : {
		name : '',
		thirdPartyId:0,
		email : 'na',
		newsletter : false,
		thumbnailPath : '',
		authenticated : false,
		allowSharing : false,
		shareLinkId : null,
		logEntries : [],
		settings: [],
		logSources : []
	},

	urlRoot : "http://betes-insights.herokuapp.com/users",

	initialize : function() {
		_.bindAll(this);
		var self = this;
		this.logEntries = new LogBookEntries(this.get('logEntries'));

		this.logEntries.url = function() {
			
			var logUrl;
			
			if(self.get('sid')){
				logUrl = self.urlRoot+'/'+self.get('sid')+'/diary';
			}else{
				logUrl = self.urlRoot+'/'+self.get('id')+'/diary';
			}
			return logUrl;
		};
		
		/*this.settings = new UserSettings(this.get('settings'));
		
		this.settings.url = function() {
			
			var settingsUrl;
			
			if(self.get('sid')){
				settingsUrl = self.urlRoot+'/'+self.get('sid')+'/settings';
			}else{
				settingsUrl = self.urlRoot+'/'+self.get('id')+'/settings';
			}
			return settingsUrl;
		};*/
		
		

	},
	highs : function() {
		var highs = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("glucoseLevel")) > 10);
		}).length;

		return highs;
	},
	lows : function() {

		var lows = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("glucoseLevel")) > 0 && parseInt(entry
					.get("glucoseLevel")) < 4);
		}).length;

		return lows;
	},
	tests : function() {

		var tests = this.logEntries.filter(function(entry) {
			return (parseInt(entry.get("glucoseLevel")) > 0);
		}).length;

		return tests;
	}

});

window.InsightsUserDetails = Backbone.Collection.extend({
	model : InsightsUser,
	initialize : function() {
		this.storage = new Offline.Storage('insights-user', this);
	},
	url : '/users'
});