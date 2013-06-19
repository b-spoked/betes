/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.EventInsightsView = Backbone.View
		.extend({

			events : {
				"click #reset-log-period-chart" : "resetDateRange",
				"change #show-filter" : "changeFilter"
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _
						.template($('#insights-events-template').html());
				this.model.logEntries.bind('reset', this.render, this);
			},
			render : function() {

				$(this.el).html(this.template(this.model.toJSON()));

				_.defer(function(view) {
					view.showCountsDashboard(view.model.logEntries);
				}, this);

				return this;
			},
			changeFilter:function(e){
				var self= this;
				  $("select option:selected").each(function () {
					  var selection = $(this).val();
					  switch (selection)
					  {
					  case "all":
						  self.showCountsDashboard(self.model.logEntries);
						    break;
					  case "high":
						  self.showCountsDashboard(self.model.logEntries.filterGreaterThan("8"));
					    break;
					  case "low":
						  self.showCountsDashboard(self.model.logEntries.filterLessThan("4"));
					    break;
					  case "excercise":
						  self.showCountsDashboard(self.model.logEntries.filterExercise());
					    break;
					  case "morning":
						  self.showCountsDashboard(self.model.logEntries.filterName("Breakfast"));
					    break;
					  case "bed":
						  self.showCountsDashboard(self.model.logEntries.filterName("Bed"));
					    break;
					  }
				  });
				
			},
			hideLoadingDialog : function() {
				var loadingDialog = new LoadingModal();
				loadingDialog.hideDialog();
			},
			resetDateRange : function(e) {
				window.datesChart.filterAll();
				dc.redrawAll();
			},
			showCountsDashboard : function(data) {
				this.hideLoadingDialog();

				if (data.length <= 0) {
					return false;
				}

				//Data
				var logBookData = this.getCleanedData(data);

				//Date dimension range

				var startDate = new Date(
						logBookData[logBookData.length - 1].resultDate);
				var endDate = new Date(logBookData[0].resultDate);

				//picker
				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData);
				
				/*var logBookByDay = logBook.dimension(function(d) {
					return d.day;
				});*/

				//this.createAllDatesChart(logBookByDay,startDate,endDate);	
				//this.showCounts(logBook);
				this.createSummaryTableChart(logBook);

				dc.renderAll();
			},
			createAllDatesChart : function(timePeriod, startDate, endDate) {

				var timePeriodGroup = timePeriod.group();

				window.datesChart = dc.barChart("#log-period-chart");

				window.datesChart.width(320).height(80).margins({
					top : 10,
					right : 5,
					bottom : 20,
					left : 30
				}).dimension(timePeriod).group(timePeriodGroup).centerBar(true)
						.gap(1).x(
								d3.time.scale().domain([ startDate, endDate ]))
						.round(d3.time.day.round).xUnits(d3.time.days)
						.renderlet(function(chart) {
							chart.select("g.y").style("display", "none");
						}).on("filtered", function(chart) {
							dc.events.trigger(function() {
							});
						}).xAxis().ticks(4);

			},
			createSummaryTableChart : function(logBook) {

				window.daySummaryChart = dc.dataTable("#day-summary-chart");
				
				var dateFormat = d3.time.format("%a @ %I:%M %p");
				var groupDateFormat = d3.time.format("%a %d-%b");
				
				var logByTime = logBook.dimension(function(d) {
					return d.resultDate;
				});
				
				daySummaryChart
			    	.dimension(logByTime)
			    	.group(function(d) {
			    		return d.day.getDate() + "/" + (d.day.getMonth() + 1);
			    	})
			    	.size(50)
			    	.columns([
			    	          function(d) { return dateFormat(d.resultDate); },
			    	          function(d) { return d.glucoseLevel>0 ? d.glucoseLevel : ""; },
			    	          function(d) { return d.insulinAmount>0 ? d.insulinAmount : ""; },
			    	          function(d) { return d.exerciseDuration>0 ? d.exerciseDuration : ""; }
			    	          ])
			    	 .sortBy(function(d){ return d3.time.dayOfYear(d.day); })
			    	 .order(d3.ascending);

			},
			getCleanedData : function(data) {

				//var data = this.model.logEntries;

				var logResults = new Array();
				data.forEach(function(entry) {
					logResults.push(entry.toJSON());
				});

				logResults
						.forEach(function(d, i) {
							d.resultDate = new Date(d.resultDate);
							d.glucoseLevel = d.glucoseLevel ? parseFloat(d.glucoseLevel)
									: 0;
							d.insulinAmount = d.insulinAmount ? parseFloat(d.insulinAmount)
									: 0;
							d.exerciseDuration = d.exerciseDuration ? d.exerciseDuration
									: 0;
							d.day = d3.time.day(d.resultDate);
							d.week = d3.time.week(d.resultDate);
						});
				return logResults;
			}
		});