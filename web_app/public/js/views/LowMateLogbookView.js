/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.LowMateLogbookView = Backbone.View.extend({

	events : {
		'click .create-new-entry' : 'startProcess',
		'click .done-entry' : 'finishProcess'
	},

	initialize : function() {
		_.bindAll(this);
		this.template = _.template($('#logbook-template').html());
		
	},
	render : function() {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},
	startProcess : function(e) {
		hypoWorkflow.startHypoProcess();
	},
	finishProcess : function(e) {
		hypoWorkflow.endHypoProcess();
	}
});