/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */



window.GlucoseInsightsView = Backbone.View
		.extend({

			events : {
				"click #week" : "showWeek",
				"click #month" : "showMonth",
				"click #all" : "showAll",
				"click #filter-low" : "filterLow",
				"click #filter-high" : "filterHigh",
				"click #filter-allgood" : "filterAllGood",
				"click #filter-overnight" : "filterOvernight",
				"click #filter-weekendday" : "filterWeekendDay",
				"click #filter-weekday" : "filterWeekDay",
				"keyup .filter-entries" : "filterEntries"
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _
						.template($('#quick-insights-template').html());
				this.model.logEntries.bind('reset', this.render, this);
			},
			render : function() {

				$(this.el).html(this.template(this.model.toJSON()));

				_.defer(function(view) {
					view.showFilterableDashboard(null, null);
				}, this);

				return this;
			},
			filterEntries : function(e) {
				var searchString = $(".filter-logbook").val();
				this.addAll(this.model.logEntries.filterEntries(searchString));
			},
			showWeek : function(e) {
				e.preventDefault();
				var summaryToDate = new Date();
				var summaryFromDate = new Date();
				summaryFromDate.setDate(summaryToDate.getDate() - 7);
				
				this.showFilterableDashboard(summaryFromDate, summaryToDate);
			},
			showMonth : function(e) {
				e.preventDefault();
				var summaryToDate = new Date();
				var summaryFromDate = new Date();
				summaryFromDate.setDate(summaryToDate.getDate() - 31)
				this.showFilterableDashboard(summaryFromDate, summaryToDate);
			},
			showAll : function(e) {
				e.preventDefault();
				this.showFilterableDashboard(null, null);
			},
			filterLow : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.timeInRangeChart.filter("below \n(<4)");
				this.showFilteredTimeline(null,null);
				dc.renderAll();
			},
			filterHigh : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.timeInRangeChart.filter("above \n(>8)");
				this.showFilteredTimeline(null,null);
				dc.renderAll();
			},
			filterAllGood : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.timeInRangeChart.filter("in \n(4-8)");
				this.showFilteredTimeline(null,null);
				dc.renderAll();
			},
			filterOvernight : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.hourOfDayChart.filter([ 5, 9 ]);
				this.showFilteredTimeline(null,null);
				dc.renderAll();
			},
			filterWeekDay : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.dayOfWeekChart.filter([ "Mon","Fri" ]);
				this.showFilteredTimeline(null,null);
				dc.renderAll();
			},
			filterWeekendDay : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.dayOfWeekChart.filter([ "Sat", "Sun" ]);
				this.showFilteredTimeline(null,null);
				dc.renderAll();
			},
			resetAllCharts : function() {
				window.dayOfWeekChart.filterAll();
				window.hourOfDayChart.filterAll();
				window.timeInRangeChart.filterAll();
				//window.daySummaryChart.filterAll();
			},
			hideLoadingDialog : function() {
				var loadingDialog = new LoadingModal();
				loadingDialog.hideDialog();
			},
			resetDateRange : function(e) {
				window.datesChart.filterAll();
				dc.redrawAll();
			},
			resetGlucoseRange : function(e) {
				window.glucoseRangeChart.filterAll();
				dc.redrawAll();
			},
			resetInsightsChart : function(e) {
				window.glucoseOverTime.filterAll();
				dc.redrawAll();
			},
			showFilterableDashboard : function(startDate, endDate) {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}

				//Data
				var logBookData = this.getGlucoseData(startDate, endDate);
				
				// Create the crossfilter for the relevant dimensions and groups.
				app.logBook = crossfilter(logBookData);
				var timePeriod = app.logBook.dimension(function(d) {
					return d.resultDate;
				});
				
				this.createGlucoseTimeInRangeChart(app.logBook);
				this.createDayOfWeekChart(app.logBook);
				this.createHourOfDayChart(app.logBook);
				//this.createSummaryTableChart(timePeriod);

				this.showFilteredTimeline();
				

				dc.renderAll();
			},
			createDayOfWeekChart : function(logBook) {
				
				var self = this;

				window.dayOfWeekChart = dc.pieChart("#day-of-week-chart");

				var dayOfWeek = logBook.dimension(function(d) {
					var day = d.resultDate.getDay();
					switch (day) {
					case 0:
						return "Sun";
					case 1:
						return "Mon";
					case 2:
						return "Tue";
					case 3:
						return "Wed";
					case 4:
						return "Thu";
					case 5:
						return "Fri";
					case 6:
						return "Sat";
					}
				});

				var dayOfWeekGroup = dayOfWeek.group();
				
				dayOfWeekChart
					.width(220)
					.height(220)
					.radius(100)
					.innerRadius(20)
					.dimension(dayOfWeek)
					.group(dayOfWeekGroup)
					.on("filtered", 
							function(chart, filter){
							self.showFilteredTimeline(null,null);
						});

			},
			createHourOfDayChart : function(logBook) {
				
				var self = this;
				
				var hourOfDay = logBook.dimension(function(d) {
					var hour = d.resultDate.getHours();
					return hour + 1;
				}), hourOfDayGroup = hourOfDay.group();
				
				window.hourOfDayChart = dc.barChart("#hour-of-day-chart");

				hourOfDayChart.width(320).height(220).dimension(hourOfDay).group(hourOfDayGroup).elasticY(true)
						.centerBar(true)
						.gap(1)
						.round(dc.round.floor).x(d3.scale.linear()
						.domain([ 0, 24 ]))
						.renderlet(
								function(chart) {
									chart.select("g.y").style("display", "none");
						})
						.renderHorizontalGridLines(true)
						.on("filtered", 
							function(chart, filter){
							self.showFilteredTimeline(null,null);
						});

			},
			createGlucoseTimeInRangeChart : function(logBook) {
				
				var self = this;

				window.timeInRangeChart = dc.pieChart("#time-in-range-chart");
				
				 var all = logBook.groupAll();
				 
				 var range = logBook.dimension(function (d) {
					 	var range = "na";
					 	if(d.glucoseLevel > 0 && d.glucoseLevel < 4){
					 		range = "below \n(<4)";
					 	}else if(d.glucoseLevel >= 4 && d.glucoseLevel <= 8){
					 		range = "in \n(4-8)";
					 	}else if(d.glucoseLevel > 8){
					 		range = "above \n(>8)";
					 	}
					 	return range;
		            });
		            
		         var rangeGroup = range.group();   
		            
				 
				window.timeInRangeChart
					.width(220)
					.height(220)
					.radius(100)
					.innerRadius(20)
					.dimension(range)
					.group(rangeGroup)
					.label(function (d) {
						return d.data.key;
					}).on("filtered", 
							function(chart, filter){
						self.showFilteredTimeline(null,null);
					});
			},
			/*createSummaryTableChart : function(timePeriod) {

				window.daySummaryChart = dc.dataTable("#day-summary-chart");
				
				var dateFormat = d3.time.format("%I:%M %p");
				
				daySummaryChart
			    	.dimension(timePeriod)
			    	.group(function(d) {
			    		return d.day.getDate() + "/" + (d.day.getMonth() + 1);
			    	})
			    	.size(16)
			    	.columns([
			    	          function(d) { return dateFormat(d.resultDate); },
			    	          function(d) { return d.glucoseLevel>0 ? d.glucoseLevel : ""; },
			    	          function(d) { return d.insulinAmount>0 ? d.insulinAmount : ""; }
			    	          ])
			    	 .sortBy(function(d){ return d.resultDate; })
			    	 .order(d3.ascending);

			},*/
			showFilteredTimeline : function(fromDate,toDate) {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}
				
				document.getElementById("chart").innerHTML = "";
				document.getElementById("timeline").innerHTML = "";
				
				//Date dimension range
				var graph = new Rickshaw.Graph({
					element: document.getElementById("chart"),
					height: 200,
					padding: { top:0.02, right:0.01, bottom:0.01, left:0.02},
					renderer: 'scatterplot',
					stroke: true,
					series: [
						{
							color: 'black',
							data: this.getTimelineData(fromDate,toDate),
							name: 'Glucose'
						}
					]
				});
				
				var annotator = new Rickshaw.Graph.Annotate( {
					graph: graph,
					element: document.getElementById("timeline")
				} );
				
				this.getGlucoseNotes(fromDate,toDate).forEach(function(note) {
					annotator.add(note.when, note.what);
				});
				
				var time = new Rickshaw.Fixtures.Time();
				
				var units;
				if(fromDate&&toDate){
					units = time.unit('6 hour');
				}else{
					units = time.unit('week');
				}

				var xAxis = new Rickshaw.Graph.Axis.Time({
				    graph: graph,
				    timeUnit: '6 hour'
				});

				var yAxis = new Rickshaw.Graph.Axis.Y( {
					graph: graph,
					tickFormat: Rickshaw.Fixtures.Number.formatKMBT
				} );
				
				var hover = new Rickshaw.Graph.HoverDetail({
					graph:graph
				});
								
				graph.render();

			},
			getGlucoseNotes:function(fromDate,toDate){
				var notes = new Array();
				var self = this;
				
				this.model.logEntries.filterPeriod(fromDate,toDate).forEach(function(entry) {
					
					if(entry.get("resultDate")){
						var epoch = self.getEpoch(entry.get("resultDate"));
						var note = "";
						if(entry.get("insulinAmount")){	
							note += entry.get("insulinAmount")+" u ";
						}else if(entry.get("exerciseDuration")){
	
							note +=  entry.get("exerciseDuration")+" mins ";
							note +=  "@ "+entry.get("exerciseIntensity");
						}
						if(entry.get("comments")){
							note += entry.get("comments");
						}
						if(note){
							notes.push({when:epoch,what:note});
						}
					}
				});

				console.log(JSON.stringify(notes));
				return notes.reverse();
			},
			getTimelineData:function(fromDate,toDate){
				var glucose = new Array();
				var self = this;
				
				var results = app.logBook.dimension(function(d) {
					return d.resultDate;
				}).top(Infinity);
				
				results.forEach(function(entry) {
					
					var epoch = self.getEpoch(entry.resultDate);
					var glucoseAmount = parseFloat(entry.glucoseLevel);
					
					glucose.push({x:epoch,y:glucoseAmount});
				});

				console.log(JSON.stringify(glucose));
				return glucose.reverse();
			},
			getEpoch: function(dateString){
				
				var formatedDateString = moment(dateString).format("M/D/YY hh:mm"),
				myDate = new Date(formatedDateString);
				return Math.round(myDate.getTime()/1000.0);
			},
			getGlucoseData : function(fromDate, toDate) {

				var data;
				if(fromDate && toDate){
					data = this.model.logEntries.filterGlucoseLevels(fromDate, toDate);
				}else{
					data = this.model.logEntries.filterGlucoseLevels(null, null);
				}

				var logResults = new Array();
				data.forEach(function(entry) {
					if(entry.get("resultDate")){
						logResults.push(entry.toJSON());
					}
				});

				logResults
						.forEach(function(d, i) {
							d.resultDate = new Date(d.resultDate);
							d.glucoseLevel = parseFloat(d.glucoseLevel);
							d.day = d3.time.day(d.resultDate);
						});
				//console.log(JSON.stringify(logResults));
				return logResults;
			}
		});