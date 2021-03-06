/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.LogbookView = Backbone.View.extend({

	events : {
		'click .create-new-entry' : 'showEventDialog',
		'click #login' : 'showLoginDialog',
		'keyup .logbook-days' : 'filterLogbookDays',
		"keyup .filter-logbook" : "filterLogEntries"
	},

	initialize : function() {
		_.bindAll(this);
		this.template = _.template($('#logbook-template').html());
		this.model.logEntries.bind('reset', this.render, this);
		this.model.logEntries.bind('add', this.addOne, this);
	},
	render : function() {
		$(this.el).html(this.template(this.model.toJSON()));

		_.defer( function( view ){ view.closeHelp();}, this );

		var logList = $('#events-list', $(this.el));

		if (this.model.logEntries != null && this.model.logEntries.length > 0) {
			logList.html('');
			this.model.logEntries.sort();
			this.model.logEntries.each(this.addOne,this);
		}
		return this;
	},
	closeHelp : function() {
		if (this.model.logEntries.length > 0) {
			$("#logbook-getting-started").hide();
		}
	},
	addOne : function(entry) {
		var view = new LogBookEntryView({
			model : entry
		});
		this.$('#events-list').append(view.render().el);
	},
	addAll : function(entries) {
		if (entries != null) {
			this.$('#events-list').html('');
			entries.each(this.addOne, this);
		}
	},
	showEventDialog : function(e) {
		e.preventDefault();
		var addEntryDialog = new AddEntryModal({
			model : this.model
		});
		addEntryDialog.render();

		var $modalEl = $("#modal-dialog");
		$modalEl.html(addEntryDialog.el);
		addEntryDialog.showDialog();
	},
	showLoginDialog : function(e) {
		var loginDialog = new LoginModal();
		loginDialog.render();
		var $modalEl = $("#modal-dialog");
		$modalEl.html(loginDialog.el);
		loginDialog.showDialog();
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