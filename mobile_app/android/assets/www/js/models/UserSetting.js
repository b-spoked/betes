/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:39 PM
 * To change this template use File | Settings | File Templates.
 */
window.UserSetting = Backbone.Model.extend({
	defaults : {
		lowBloodGlucoseLimit: 0,
		highBloodGlucoseLimit: 0,
		hypoBloodGlucoseLevel: 0,
        validUntilDate: "",
        userId : ""
	}
});

window.UserSettings = Backbone.Collection.extend({
	model : UserSetting,
	initialize : function() {
		this.storage = new Offline.Storage('insights-settings', this);
	},
	currentValidSettings:function(){
		var now = new Date();
		
		return _(this.filter(function(data) {
			var validDate = new Date(data.get('validUntilDate'));
			return (validDate >= now);
		}));
	},
	comparator : function(entry) {
		var date = new Date(entry.get('validUntilDate'));
		return -date.getTime();
	}
});