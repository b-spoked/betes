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
		this.model.logEntries.bind('reset', this.render, this);
		this.model.logEntries.bind('add', this.addOne, this);
	},
	render : function() {
		$(this.el).html(this.template(this.model.toJSON()));
		
		var logList = $('#events-list', $(this.el));
				
		if (this.model.logEntries != null && this.model.logEntries.length > 0) {
			logList.html('');
			this.model.logEntries.each(this.addOne,this);
		}
		
		return this;
	},
	addOne : function(entry) {
		var view = new HypoEntryView({
			model : entry
		});
		this.$('#events-list').append(view.render().el);
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