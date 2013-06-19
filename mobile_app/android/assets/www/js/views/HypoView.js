/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
var hypoWorkflow;

window.HypoView = Backbone.View.extend({

	events : {
		'click .treat-hypo' : 'startProcess',
		'click .hypo-treated' : 'finishProcess',
		'click .still-hypo' : 'finishProcess'
	},

	initialize : function() {
		_.bindAll(this);
		this.template = _.template($('#hypo-template').html());
	},
	render : function() {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},
	startProcess : function(e) {
		this.hypoWorkflow = new HypoWorkflow(this.model)
		this.hypoWorkflow.startHypoProcess();
	},
	finishProcess : function(e) {
		if(this.hypoWorkflow){
			this.hypoWorkflow.endHypoProcess();
		}
	}
});