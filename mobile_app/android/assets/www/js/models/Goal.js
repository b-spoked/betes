/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:43 PM
 * To change this template use File | Settings | File Templates.
 */
window.Goals = Backbone.Model.extend({
	defaults : {
		bsLowerRange : 6.0,
		bsUpperRange : 8.0,
		bsFrequency : 4,
		exerciseDuration : 30,
		exerciseFrequency : 3,
		longTermGoal : '',
		longTermGoalDate : ''
	}
});

window.GoalSet = Backbone.Collection.extend({
	model : Goals,
	initialize : function() {
		this.storage = new Offline.Storage('user-goals', this, {
			autoPush : true
		});
	}
});