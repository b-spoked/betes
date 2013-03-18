/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:43 PM
 * To change this template use File | Settings | File Templates.
 */
window.Setting = Backbone.Model.extend({
	defaults : {
		lowReading : "",
		highReading : "",
		readingFreq : "",
		excerciseTime:"",
		excerciseFreq:"",
		current : true,
		userId : 0
	}
});

window.Settings = Backbone.Collection.extend({
	model : Setting,
	initialize : function() {
		this.storage = new Offline.Storage('user-settings', this, {
			autoPush : true
		});
	}
});