/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.LogbookView = Backbone.View
		.extend({

			events : {
				'click .create-new-entry' : 'showEventDialog',
				'click #login' : 'showLoginDialog',
				'click .show-today' : 'filterToday',
				'click .show-two' : 'filterTwo',
				'click .show-seven' : 'filterSeven',
				'click .show-thirty' : 'filterThirty',
				"keyup .filter-logbook" : "filterLogEntries"
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#logbook-template').html());
				this.model.logEntries.bind('add', this.addOne, this);
				this.model.logEntries.bind('reset', this.addAll, this);
				this.model.logEntries.bind('remove', this.refresh, this);
				this.model.logEntries.bind('change:length', this.gettingStarted, this);
				
				this.model.logEntries.fetch();
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));										
				return this;
			},
			gettingStarted : function(){
				if(this.model.logEntries.length>0){
					$("#getting-started").hide();
				}
			},			
			refresh : function() {
				this.model.logEntries.fetch();
				
				this.render();
			},
			addOne : function(entry) {
				var view = new LogBookEntryView({
					model : entry
				});
				this.$('#events-list').append(view.render().el);
			},
			addAll : function(entries) {
				if (entries == null) {
					entries = this.model.logEntries.fetch();
				}
				if (entries != null) {
					this.$('#events-list').html('');
					entries.each(this.addOne, this);
				}
			},
			showEventDialog : function() {
				var addEntryDialog = new AddLogbookEntryModal({model:this.model});
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
			filterToday : function() {
				this.addAll(this.model.logEntries.filterToday());
			},
			filterTwo : function() {
				this.addAll(this.model.logEntries.filterDays('2'));
			},
			filterSeven : function() {
				this.addAll(this.model.logEntries.filterDays('7'));
			},
			filterThirty : function() {
				this.addAll(this.model.logEntries.filterDays('30'));
			},
			filterLogEntries : function(e) {
				var searchString = $(".filter-logbook").val();
				this.addAll(this.model.logEntries
						.filterEntries(searchString));
			}
		});