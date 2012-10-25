var app = app || {};

$( function( $ ) {
    

	var Entry = Backbone.Model.extend({
		defaults: {
			name: '',
			bsLevel: 0,
			insulinAmount: 0,
			when: new Date(),
			excerciseDuration: 'na',
			excerciseIntensity: 'na',
			labels: '',
			goals : ''
		},
		initialize: function() {
			this.checkGoals();
		},
		checkGoals : function(){
			 this.set({ goals: "goals-not-meet" });
			//return "goals-meet";
			//this.model.goalsMeet = "goals-not-meet";
			//this.model.goalsMeet = "goals-partial-meet";
		}
	});
	
	var User = Backbone.Model.extend({
		defaults: {
			name: '',
			email: '',
			userName: '',
			showGoals: false
		}		
	});
	
	var Goal = Backbone.Model.extend({
		defaults: {
			bsLowerGoal: 8,
			bsUpperGoal: 5,
			bsTestFrequencyGoal: 2,
			excerciseDurationGoal: 30,
			excerciseFrequencyGoal: 3
		}
	});
	
	var GoalSet =  Backbone.Collection.extend({
		model : Goal,
		localStorage : new Store('logbook-goals')
	});
	
	var UserDetails =  Backbone.Collection.extend({
		model : User,
		localStorage : new Store('logbook-user')
	});
	
	var Entries =  Backbone.Collection.extend({
		model : Entry,
		localStorage : new Store('logbook-entries'),
		today : function() {
			return this.filter( function(item) {
				today = new Date();
				return ( item.get('when') === today)
			})
		},
		lastWeek : function() {
			return this.filter( function(item) {
				today = new Date();
				weekAgo = today.getDate() - 7;
				return ( (item.get('when') <= today)&&(item.get('when') >= weekAgo))
			})
		},
		lastFortnight : function() {
			return this.filter( function(item) {
				today = new Date();
				twoWeeksAgo = today.getDate() - 14;
				return ( (item.get('when') <= today)&&(item.get('when') >= twoWeeksAgo))
			})
		}
	});

	app.LogBookEntries = new Entries();
	app.UserSettings = new UserDetails();	
	app.UserGoals = new GoalSet();

	// The DOM element for a todo item...
	app.LogBookEntryView = Backbone.View.extend({

		//... is a list tag.
		tagName:  'li',

		// Cache the template function for a single item.
		template: _.template( $('#item-template').html() ),

		// The DOM events specific to an item.
		events: {
			'click .update': 'edit',
			'click .save-entry': 'updateOnEnter',
			'click .close-entry': 'close',
			'click .remove':  'clear'
		},

		initialize: function() {
			this.model.on( 'change', this.render, this );
		},
		// Re-render the titles of the todo item.
		render: function() {			
			this.$el.html( this.template( this.model.toJSON() ) );
			this.editSection = this.$('.edit');
			return this;
		},
		
		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function() {
			this.$el.addClass('editing');
			this.editSection.focus();
		},
		// Close the `"editing"` mode, saving changes to the todo.
		save: function() {

			this.model.save({
				name: $("#edit-entry-name").val().trim(),
				bsLevel: $("#edit-entry-level").val().trim(),
				when: $("#edit-entry-date").val().trim(),				
				insulinAmount: $("#edit-entry-insulin").val().trim(),
				excerciseDuration: $("#edit-entry-excercise-duration").val().trim(),
				excerciseIntensity: $("#edit-entry-excercise-intensity").val().trim(),
				labels: $("#edit-entry-labels").val().trim()
			});			

			this.close();
			this.render();
		},
		close: function() {	
			this.$el.removeClass('editing');
		},
		// If you hit `enter`, we're through editing the item.
		updateOnEnter: function( e ) {			
				this.save();			
		},
		clear: function() {
			this.model.destroy();
			this.render();
		}
	});

	app.AccountView = Backbone.View.extend({
		accountTemplate: _.template( $('#account-template').html()),

		events: {
			'submit #profile': 'saveAccount'
		},

		render: function() {
			$(this.el).html(this.accountTemplate());
			$(this.el).hide();
		},
		close: function() {
			this.remove();
			this.unbind();
		},
		onShow: function() {
			$(this.el).show(500);
		},
		saveAccount : function(e) {
			this.model.save({
				name: $("#account-user-name").val().trim(),
				email: $("#account-user-email").val().trim(),
				userName: $("#account-user-public-name").val().trim(),
				showGoals: $("#account-goals-public").val().trim()
			});	
		}
	});
	
	app.GoalsView = Backbone.View.extend({
		goalsTemplate: _.template( $('#goals-template').html()),

		events: {
			'submit #goals': 'saveGoals'
		},

		render: function() {
			$(this.el).html(this.goalsTemplate());
			$(this.el).hide();
		},
		close: function() {
			this.remove();
			this.unbind();
		},
		onShow: function() {
			$(this.el).show(500);
		},
		saveGoals : function(e) {
			this.model.save({
				bsLowerGoal: $('#goal-bs-lower').val().trim(),
				bsUpperGoal: $('#goal-bs-upper').val().trim(),
				bsTestFrequencyGoal: $('#goal-bs-frequency').val().trim(),
				excerciseDurationGoal: $('#goal-excercise-duration').val().trim(),
				excerciseFrequencyGoal: $('#goal-excercise-frequency').val().trim()
			});		
		}
	});
	
	app.SummaryView = Backbone.View.extend({
		summaryTemplate: _.template( $('#summary-template').html()),

		events: {
			'click .email': 'emailResults',
			'click .print': 'printResults',
			'click .graph': 'graphResults',
			'click .publish': 'pubishResults'
		},

		render: function() {
			$(this.el).html(this.summaryTemplate());
			$(this.el).hide();
		},
		close: function() {
			this.remove();
			this.unbind();
		},
		onShow: function() {
			$(this.el).show(500);
		},
		pubishResults : function(e) {
			alert('publish');
		},
		graphResults : function(e) {
		
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;

			var parseDate = d3.time.format("%d-%b-%y").parse;

			var x = d3.time.scale()
				.range([0, width]);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			var line = d3.svg.line()
				.x(function(d) { return x(d.when); })
				.y(function(d) { return y(d.bsLevel); });

			var svg = d3.select("#summary").append("preview")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			app.LogBookEntries.fetch();			
			var data = app.LogBookEntries.toJSON();	
			
			data.forEach(function(entry) {
			  
				console.log(entry.when);
				console.log(entry.bsLevel);
			  
				entry.when = parseDate(entry.when);
				entry.bsLevel = +entry.bsLevel;
			  });

			  x.domain(d3.extent(data, function(entry) { return entry.when; }));
			  y.domain(d3.extent(data, function(entry) { return entry.bsLevel; }));

			  svg.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .call(xAxis);

			  svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxis)
				.append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end")
				  .text("Reading (mmol)");

			  svg.append("path")
				  .datum(data)
				  .attr("class", "line")
				  .attr("d", line);
					
		},
		printResults : function(e) {
			alert('print');
		},
		emailResults : function(e) {
			alert('email');
		}
	});

	app.LogBookView = Backbone.View.extend({
		logBookTemplate: _.template( $('#logbook-template').html()),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'click .add-entry': 'createOnEnter'
		},

		initialize: function() {
			$(this.el).html(this.logBookTemplate());
			window.app.LogBookEntries.on( 'add', this.addOne, this );
			window.app.LogBookEntries.on( 'reset', this.addAll, this );
			window.app.LogBookEntries.on( 'all', this.render, this );
			window.app.LogBookEntries.fetch();
		},
		render: function() {			
			$(this.el).hide();
		},
		close: function() {
			this.remove();
			this.unbind();
		},
		onShow: function() {
			$(this.el).show(500);		
		},
		
		addOne: function( entry ) {
			var view = new app.LogBookEntryView({
				model: entry
			});
			this.$('#events-list').append( view.render().el );
		},
		addAll: function() {
			this.$('#events-list').html('');
			app.LogBookEntries.each(this.addOne, this);
		},
		newAttributes: function() {
			return {
				name: $("#entry-name").val().trim(),
				bsLevel: $("#entry-level").val().trim(),
				when: $("#entry-date").val().trim(),				
				insulinAmount: $("#entry-insulin").val().trim(),
				excerciseDuration: $("#entry-excercise-duration").val().trim(),
				excerciseIntensity: $("#entry-excercise-intensity").val().trim(),
				labels: $("#entry-labels").val().trim()
			};
		},
		createOnEnter: function( e ) {
			app.LogBookEntries.create( this.newAttributes() );
		}
	});
	
	var ApplicationRouter = Backbone.Router.extend({

		routes: {
			"":"showLogBook",
			"account" : "showAccount",
			"goals" : "showGoals",
			"summary" : "showSummary"
		},

		/**
		 * Handle rendering the initial 'today' view for the application
		 * @type function
		 */
		showLogBook: function() {
			RegionManager.show(new app.LogBookView());	
		},
		showAccount: function( ) {
			RegionManager.show(new app.AccountView());
		},
		showGoals: function( ) {
			RegionManager.show(new app.GoalsView());
		},
		showSummary: function( ) {
			RegionManager.show(new app.SummaryView());
		}
	});

	RegionManager = (function (Backbone, $) {
		var currentView;
		var el = "#main";
		var region = {};

		var closeView = function (view) {
			if (view && view.close) {
				view.close();
			}
		};
		var openView = function (view) {
			view.render();
			$(el).html(view.el);
			if (view.onShow) {
				view.onShow();
			}
		};
		region.show = function (view) {
			closeView(currentView);
			currentView = view;
			openView(currentView);
		};
		return region;
	})(Backbone, jQuery);
	AppRouter = new ApplicationRouter();
	Backbone.history.start();

});