var app = app || {};

$( function( $ ) {
    

	var Entry = Backbone.Model.extend({
		defaults: {
			name: '',
			bsLevel: 0,
			insulinAmount: 0,
			when: new Date(),
			excerciseDuration: 0,
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
		goalPercentageForDay : function() {
			
			
			return .25;
			
			
		},
		filterEntries : function(letters) {
			
			if(letters == "")
				return this;

			var pattern = new RegExp(letters,"gi");
			return _(this.filter( function(data) {
				return pattern.test(data.get("name"));
			}));
		}
	});

	app.LogBookEntries = new Entries();
	app.UserSettings = new UserDetails();	
	app.UserGoals = new GoalSet();

	// The DOM element for a todo item...
	app.LogBookEntryView = Backbone.View.extend({

		//... is a list tag.
		tagName:  'tr',
		
		className: 'success',

		// Cache the template function for a single item.
		rowTemplate: _.template( $('#item-template').html() ),
		detailTemplate: _.template( $('#item-detail-template').html() ),

		// The DOM events specific to an item.
		events: {
			'click .update': 'edit',
			'click .delete': 'deleteEntry',
			'click .save-entry': 'updateOnEnter',
			'click .close-entry': 'close'
		},

		initialize: function() {
			this.model.on( 'change', this.render, this );
		},
		// Re-render the titles of the todo item.
		render: function() {			
			this.$el.html( this.rowTemplate( this.model.toJSON() ) );
			return this;
		},
		
		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function() {
			var itemDetail = "#modal-item-detail";
			$(itemDetail).html( this.detailTemplate( this.model.toJSON() ) );
			
			var itemDetailDialog = "#edit_"+this.model.get('id');
			
			$(itemDetailDialog).modal('show');
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
		deleteEntry: function() {
			this.model.destroy();
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
	
	app.SummaryView = Backbone.View.extend({
		summaryTemplate: _.template( $('#summary-template').html()),

		events: {
			'click .email': 'emailResults',
			'click .graph-results': 'graphResults',
			'click .graph-goals': 'graphGoals',
			'click .graph-excercise': 'graphExcercise',
			'click .share': 'shareGraph'
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
		graphResults : function(e) {
		
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;

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
				.x(function(entry) { return x(entry.when); })
				.y(function(entry) { return y(entry.bsLevel); });	

			var svg = d3.select("#results-graph").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			app.LogBookEntries.fetch();			
			var data = app.LogBookEntries.toJSON();	
			
			data.forEach(function(entry) {			  
				entry.when = new Date(entry.when);
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
				  .attr("dy", "1em")
				  .style("text-anchor", "end")
				  .text("Reading (mmol)");			  
			  
			  svg.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("d", line);	  
					
		},
		
		graphGoals : function(e) {
		
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;

			var x = d3.time.scale()
				.range([0, width]);
			//blood sugars
			var y = d3.scale.linear().range([height, 0]);
			//excercise
			var y2 = d3.scale.linear().range([height, 0]);			

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxisLeft = d3.svg.axis()
				.scale(y)
				.orient("left");	
				
			var yAxisRight = d3.svg.axis()
				.scale(y2)
				.orient("right");		

			var line = d3.svg.line()
				.x(function(entry) { return x(entry.when); })
				.y(function(entry) { return y(entry.bsLevel); });	
				
			var line2 = d3.svg.line()
				.x(function(entry) { return x(entry.when); })
				.y(function(entry) { return y2(entry.excerciseDuration); });		

			var svg = d3.select("#goals-graph").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			app.LogBookEntries.fetch();			
			var data = app.LogBookEntries.toJSON();	
			
			data.forEach(function(entry) {			  
				entry.when = new Date(entry.when);
				entry.bsLevel = +entry.bsLevel;
				entry.excerciseDuration = entry.excerciseDuration;
			});
			  
			x.domain(d3.extent(data, function(entry) { return entry.when; }));
			y.domain(d3.extent(data, function(entry) { return entry.bsLevel; }));
			y2.domain(d3.extent(data, function(entry) { return entry.excerciseDuration; }));

			  svg.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .call(xAxis);

			  svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxisLeft)
				.append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", "1em")
				  .style("text-anchor", "end")
				  .text("Reading (mmol)");	

			 svg.append("g")
				  .attr("class", "y axis axisRight")
				  .call(yAxisRight)
				  .attr("transform", "translate("+(width-10)+",0)")
				.append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", "1em")
				  .style("text-anchor", "end")
				  .text("Excercise (mins)");			
			  
			  svg.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("d", line);

			  svg.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("d", line2);			
					
		},
		graphExcercise : function(e) {
		
			/* scatter plot */
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;

			var x = d3.scale.linear()
				.range([0, width]);

			var y = d3.scale.linear()
				.range([height, 0]);
				
			var color = d3.scale.category10();	

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");	

			var svg = d3.select("#excercise-graph").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			app.LogBookEntries.fetch();			
			var data = app.LogBookEntries.toJSON();	
			
			data.forEach(function(entry) {			  
				entry.excerciseDuration = entry.excerciseDuration;
				entry.bsLevel = +entry.bsLevel;
			});
			  
			x.domain(d3.extent(data, function(entry) { return entry.excerciseDuration; }));
			y.domain(d3.extent(data, function(entry) { return entry.bsLevel; }));

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.append("text")
				.attr("class", "label")
				.attr("x", width)
				.attr("y", -6)
				.style("text-anchor", "end")
				.text("Excercise (mins)");

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Blood Sugar (mmol)")

			svg.selectAll(".dot")
				.data(data)
				.enter().append("circle")
				.attr("class", "dot")
				.attr("r", 3.5)
				.attr("cx", function(entry) { return x(entry.excerciseDuration); })
				.attr("cy", function(entry) { return y(entry.bsLevel); })
				.style("fill", function(entry) { return color(entry.excerciseDuration); });
				
			var legend = svg.selectAll(".legend")
				.data(color.domain())
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(entry, i) { return "translate(0," + i * 20 + ")"; });

			legend.append("rect")
				.attr("x", width - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", color);

			legend.append("text")
				.attr("x", width - 24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(entry) { return entry; });	
				
		},
		emailResults : function(e) {
			alert('email');
		},
		shareGraph : function(e){
			var graphCanvas = document.getElementById("mycanvas");
			var graphImg = graphCanvas.toDataURL("image/png");
		}
	});

	app.LogBookView = Backbone.View.extend({
		logBookTemplate: _.template( $('#logbook-template').html()),
		addEntryTemplate: _.template( $('#add-item-template').html()),


		events: {
			'click .add-entry': 'saveNewEntry',
			'click .create-new-entry': 'showNewEntryDialog',
			"keyup #filter-logbook" : "filterLogBook",
			'click .show-bs-graph' : "showBloodSugarGraph",
			"keyup #filter-bs-graph" : "filterBloodSugarGraph",
			'click .show-bs-vs-excercise-graph' : "showBloodSugarVsExcerciseGraph",
			'keyup #filter-bs-vs-excercise-graph': "filterBloodSugarVsExcerciseGraph",
			'click .show-goals-graph' : "showGoalsGraph",
			'keyup #filter-goals-graph': "filterGoalsGraph"
		},

		initialize: function() {
			$(this.el).html(this.logBookTemplate());
			_.bindAll(this);
			app.LogBookEntries.bind( 'add', this.addOne, this );
			app.LogBookEntries.bind( 'reset', this.addAll, this );
			app.LogBookEntries.bind( 'remove', this.onShow, this );
			app.LogBookEntries.bind( 'all', this.render, this );
			app.LogBookEntries.fetch();
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
		addAll: function(entries) {
			if(entries == null){
				entries = app.LogBookEntries;
			}
			
			this.$('#events-list').html('');
			entries.each(this.addOne, this);
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
		showNewEntryDialog: function() {
			
			$("#modal-item-add").html( this.addEntryTemplate() );
			$('#entry-date').val(new Date().toJSON().substring(0,19).replace('T',' '));
			$("#add-entry-dialog").modal('show');
			
		},
		saveNewEntry: function( e ) {
			
			app.LogBookEntries.create(this.newAttributes());
			$("#add-entry-dialog").modal('hide');
			//this.addAll(app.LogBookEntries);
			this.onShow();
		},
		filterLogBook: function(e) {
			var searchString = $("#filter-logbook").val();
			this.addAll(app.LogBookEntries.filterEntries(searchString));
		},
		filterBloodSugarGraph: function(e){
			var searchString = $("#filter-bs-graph").val();
			this.showBloodSugarGraph(e,app.LogBookEntries.filterEntries(searchString));
		},
		filterBloodSugarVsExcerciseGraph: function(e){
			var searchString = $("#filter-bs-vs-excercise-graph").val();
			this.showBloodSugarVsExcerciseGraph(e,app.LogBookEntries.filterEntries(searchString));
		},
		showBloodSugarGraph : function(e,entries) {
			
			var data = null;
			
			if(entries){
				data = new Array(); 
				entries.forEach(function(entry) {
					data.push(entry.toJSON());
				});
			}
			else{
				data = app.LogBookEntries.toJSON();
			}
		
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;

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
				.x(function(entry) { return x(entry.when); })
				.y(function(entry) { return y(entry.bsLevel); });
				
			$("#bs-results").html('');	

			var svg = d3.select("#bs-results").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			data.forEach(function(entry) {			  
				entry.when = new Date(entry.when);
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
				  .attr("dy", "1em")
				  .style("text-anchor", "end")
				  .text("Reading (mmol)");			  
			  
			  svg.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("d", line);	  
					
		},
		showBloodSugarVsExcerciseGraph : function(e,entries) {
			
			var data = null;
			
			if(entries){
				data = new Array(); 
				entries.forEach(function(entry) {
					data.push(entry.toJSON());
				});
			}
			else{
				data = app.LogBookEntries.toJSON();
			}
			
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 960 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;

			var x = d3.time.scale()
				.range([0, width]);
			//blood sugars
			var y = d3.scale.linear().range([height, 0]);
			//excercise
			var y2 = d3.scale.linear().range([height, 0]);			

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxisLeft = d3.svg.axis()
				.scale(y)
				.orient("left");	
				
			var yAxisRight = d3.svg.axis()
				.scale(y2)
				.orient("right");		

			var line = d3.svg.line()
				.x(function(entry) { return x(entry.when); })
				.y(function(entry) { return y(entry.bsLevel); });	
				
			var line2 = d3.svg.line()
				.x(function(entry) { return x(entry.when); })
				.y(function(entry) { return y2(entry.excerciseDuration); });		

			$("#bs-vs-excercise").html('');

			var svg = d3.select("#bs-vs-excercise").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			data.forEach(function(entry) {			  
				entry.when = new Date(entry.when);
				entry.bsLevel = +entry.bsLevel;
				entry.excerciseDuration = entry.excerciseDuration;
			});
			  
			x.domain(d3.extent(data, function(entry) { return entry.when; }));
			y.domain(d3.extent(data, function(entry) { return entry.bsLevel; }));
			y2.domain(d3.extent(data, function(entry) { return entry.excerciseDuration; }));

			  svg.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .call(xAxis);

			  svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxisLeft)
				.append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", "1em")
				  .style("text-anchor", "end")
				  .text("Reading (mmol)");	

			 svg.append("g")
				  .attr("class", "y axis axisRight")
				  .call(yAxisRight)
				  .attr("transform", "translate("+(width-10)+",0)")
				.append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", "1em")
				  .style("text-anchor", "end")
				  .text("Excercise (mins)");			
			  
			  svg.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("d", line);

			  svg.append("path")
				.datum(data)
				.attr("class", "line2")
				.attr("d", line2);			
					
		},
		showGoalsGraph : function(e,entries){
			
			var data = null;
			
			if(entries){
				data = new Array(); 
				entries.forEach(function(entry) {
					data.push(entry.toJSON());
				});
			}
			else{
				data = app.LogBookEntries.toJSON();
			}
		
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 960,
				height = 137,
				cellSize = 17; // cell size
	
		    
			var day = d3.time.format("%w"),
			    week = d3.time.format("%U"),
			    percent = d3.format(".1%"),
			    format = d3.time.format("%Y-%m-%d");
		    
			var color = d3.scale.quantize()
			    .domain([-.05, .05])
			    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
		    
			var svg = d3.select("body").selectAll("svg")
			    .data(d3.range(2012, 2013))
			  .enter().append("svg")
			    .attr("width", width)
			    .attr("height", height)
			    .attr("class", "RdYlGn")
			  .append("g")
			    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
			
			svg.append("text")
			    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
			    .style("text-anchor", "middle")
			    .text(function(d) { return d; });
		    
			var rect = svg.selectAll(".day")
			    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
			  .enter().append("rect")
			    .attr("class", "day")
			    .attr("width", cellSize)
			    .attr("height", cellSize)
			    .attr("x", function(d) { return week(d) * cellSize; })
			    .attr("y", function(d) { return day(d) * cellSize; })
			    .datum(format);
		    
			rect.append("title")
			    .text(function(d) { return d; });
		    
			svg.selectAll(".month")
			    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
			  .enter().append("path")
			    .attr("class", "month")
			    .attr("d", monthPath);
		    
		    
			//data
			  
			  //roll up goals for the day
			  var goalsData = d3.nest()
			    .key(function(d) {
				var fullDate = new Date(d.when);
				var formattedDate = fullDate.getFullYear() + "-" + (fullDate.getMonth() + 1) + "-" + fullDate.getDate();			
				return formattedDate;
				})
			    .rollup(function(d) {
				return .4;
				})
			    .map(data);
			
			
			  rect.filter(function(d) { return d in goalsData; })
			      .attr("class", function(d) {
				return "day " + color(goalsData[d]);
				})
			    .select("title")
			      .text(function(d) {
				return d + ": " + percent(goalsData[d]);
				});
			          
			
			function monthPath(t0) {
			  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
			      d0 = +day(t0), w0 = +week(t0),
			      d1 = +day(t1), w1 = +week(t1);
			  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
			      + "H" + w0 * cellSize + "V" + 7 * cellSize
			      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
			      + "H" + (w1 + 1) * cellSize + "V" + 0
			      + "H" + (w0 + 1) * cellSize + "Z";
			}
			
			d3.select("#goals").style("height", "150px");

		},
		filterGoalsGraph: function(e){
			var searchString = $("#filter-goals-graph").val();
			this.showGoalsGraph(e,app.LogBookEntries.filterEntries(searchString));
		},
		
		shareGraph : function(e){
			var graphCanvas = document.getElementById("mycanvas");
			var graphImg = graphCanvas.toDataURL("image/png");
		}
	});
	
	var ApplicationRouter = Backbone.Router.extend({

		routes: {
			"":"showLogBook",
			"account" : "showAccount"
		},

		showLogBook: function() {
			RegionManager.show(new app.LogBookView());	
		},
		showAccount: function( ) {
			RegionManager.show(new app.AccountView());
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