/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.ShareView = Backbone.View.extend({

	events : {
		'keyup .logbook-days' : 'filterLogbookDays',
		"keyup .filter-logbook" : "filterLogEntries"
	},

	initialize : function() {
		_.bindAll(this);
		this.template = _.template($('#share-template').html());
		this.model.logEntries.bind('reset', this.render, this);
		this.model.logEntries.bind("add", function(result) {
			$(this.el).append(new LogBookEntryView({
				model : result
			}).render().el);
		});
	},
	render : function() {
		$(this.el).html(this.template(this.model.toJSON()));

		var logList = $('#events-list', $(this.el));

		if (this.model.logEntries != null && this.model.logEntries.length > 0) {

			logList.html('');

			this.model.logEntries.each(function(result) {
				logList.append(new LogBookEntryView({
					model : result
				}).render().el);
			}, this);
		}
		return this;
	},
	refresh : function() {
		this.render();
	},
	addOne : function(entry) {
		var view = new LogBookEntryView({
			model : entry
		});
		this.$('#events-list').append(view.render().el);
	},
	addAll : function(entries) {
		if (entries != null) {
			this.closeHelp();
			this.$('#events-list').html('');
			entries.each(this.addOne, this);
		}
	},
	filterLogbookDays : function() {
		var days = $(".logbook-days").val();
		this.addAll(this.model.logEntries.filterDays(days));
	},
	filterLogEntries : function(e) {
		var searchString = $(".filter-logbook").val();
		this.addAll(this.model.logEntries.filterEntries(searchString));
	}
});