/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */



window.GlucoseInsightsView = Backbone.View
		.extend({

			events : {
				"click #day" : "showDay",
				"click #week" : "showWeek",
				"click #month" : "showMonth",
				"click #all" : "showAll"
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
			showDay : function(e) {
				e.preventDefault();
				var summaryToDate = new Date();
				var summaryFromDate = new Date();
				summaryFromDate.setDate(summaryToDate.getDate() - 1);
				
				this.showFilterableDashboard(summaryFromDate, summaryToDate);
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
				var logBookData = this.getCleanedData(startDate, endDate);
				
				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData);
				var timePeriod = logBook.dimension(function(d) {
					return d.resultDate;
				});
				
				this.createGlucoseTimeInRangeChart(logBook);
				this.createDayOfWeekChart(logBook);
				this.createHourOfDayChart(logBook);
				this.createSummaryTableChart(timePeriod);
				

				dc.renderAll();
			},
			createDayOfWeekChart : function(logBook) {

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
				dayOfWeekChart.width(220).height(220).radius(100)
						.innerRadius(20).dimension(dayOfWeek).group(
								dayOfWeekGroup);

			},
			createHourOfDayChart : function(logBook) {
				var hourOfDay = logBook.dimension(function(d) {
					var hour = d.resultDate.getHours();
					return hour + 1;
				}), hourOfDayGroup = hourOfDay.group();
				
				window.hourOfDayChart = dc.barChart("#hour-of-day-chart");

				hourOfDayChart.width(320).height(120).dimension(hourOfDay).group(hourOfDayGroup).elasticY(true)
						.centerBar(true).gap(1).round(dc.round.floor).x(
								d3.scale.linear().domain([ 0, 24 ])).renderlet(
								function(chart) {
									chart.select("g.y")
											.style("display", "none");
								}).renderHorizontalGridLines(true);

			},
			createGlucoseTimeInRangeChart : function(logBook) {

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
					.radius(110)
					.dimension(range)
					.group(rangeGroup)
					.label(function (d) {
						return d.data.key;
					});
			},
			createSummaryTableChart : function(timePeriod) {

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

			},
			getCleanedData : function(fromDate, toDate) {

				var data;
				if(fromDate && toDate){
					data = this.model.logEntries.filterGlucoseLevels(fromDate, toDate);
				}else{
					data = this.model.logEntries.filterGlucoseLevels(null, null);
				}

				var logResults = new Array();
				data.forEach(function(entry) {
					logResults.push(entry.toJSON());
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