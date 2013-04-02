/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:41 PM
 * To change this template use File | Settings | File Templates.
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
		logEntries : []
	},

	urlRoot : "/insights-users",

	initialize : function() {
		_.bindAll(this);
		var self = this;
		this.logEntries = new CareLinkEntries(this.get('logEntries'));

		this.logEntries.url = function() {
			
			var logUrl;
			
			if(self.get('sid')){
				logUrl = self.urlRoot+'/'+self.get('sid')+'/logbook';
			}else{
				logUrl = self.urlRoot+'/'+self.get('id')+'/logbook';
			}
			return logUrl;
		};

	},
	hasLogEntries : function() {
		this.logUsed = (this.logEntries.length > 0);
		return this.logUsed;
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

	}

});

window.InsightsUserDetails = Backbone.Collection.extend({
	model : InsightsUser,
	initialize : function() {
		this.storage = new Offline.Storage('insights-user', this, {
			autoPush : true
		});
	},
	url : '/insights-users'
});