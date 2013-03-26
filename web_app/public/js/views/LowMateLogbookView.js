/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.LowMateLogbookView = Backbone.View.extend({

	events : {
		'click .treat-hypo' : 'startProcess',
		'click .hypo-treated' : 'finishProcess'
	},

	initialize : function() {
		_.bindAll(this);

    	
		this.template = _.template($('#logbook-template').html());
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
		var view = new LowMateLogBookEntryView({
			model : entry
		});
		this.$('#events-list').append(view.render().el);
	},
	startProcess : function(e) {
		hypoWorkflow.startHypoProcess(this.model);				
	},
	finishProcess : function(e) {
		hypoWorkflow.endHypoProcess(this.model);
	}
});