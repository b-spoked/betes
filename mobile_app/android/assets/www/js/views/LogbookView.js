/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.LogbookView = Backbone.View.extend({

	events : {
		'click #login' : 'showLoginDialog',
		'click .force-load' : 'loadLogBook',
		'keyup .filter-logbook' : 'filterLogEntries'
	},
	initialize : function() {
		_.bindAll(this);
		this.template = _.template($('#logbook-template').html());
		this.model.logEntries.bind('reset', this.render, this);
		this.model.logEntries.bind('add', this.addOne, this);
		//$('#create-new-entry').on('show', this.setEventDate)
	},
	render : function() {
		$(this.el).html(this.template(this.model.toJSON()));
		var logList = $('#events-list', $(this.el));
		var self = this;

		if (self.model.logEntries != null && this.model.logEntries.length > 0) {
			logList.html('');
			self.hideLoadingDialog();
			if (self.model.logEntries.length > 100) {
				var firstHundered = self.model.logEntries.slice(0, 99);
				firstHundered.forEach(function(entry) {
					self.addOne(entry);
				});
			} else {
				self.model.logEntries.each(self.addOne, self);
			}
		}
		return self;
	},
	loadLogBook : function(e) {
		this.model.logEntries.fetch({
			success : this.render()
		});
	},
	addOne : function(entry) {
		var view = new LogbookEntryView({
			model : entry
		});
		this.$('#events-list').append(view.render().el);
	},
	addAll : function(entries) {
		if (entries != null) {
			this.$('#events-list').html('');
			var self = this;

			if (entries.length > 100) {
				var firstHundered = entries.slice(0, 99);
				firstHundered.forEach(function(entry) {
					self.addOne(entry);
				});
			} else {
				entries.each(self.addOne, self);
			}
		}
	},
	hideLoadingDialog : function() {
		var loadingDialog = new LoadingModal();
		loadingDialog.hideDialog();
	},
	showLoginDialog : function(e) {
		var loginDialog = new LoginModal();
		loginDialog.render();
		var $modalEl = $("#modal-dialog");
		$modalEl.html(loginDialog.el);
		loginDialog.showDialog();
	},
	filterLogEntries : function(e) {
		var searchString = $(".filter-logbook").val();
		this.addAll(this.model.logEntries.filterEntries(searchString));
	}
});