/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.DailyLogView = Backbone.View
		.extend({

			events : {
				"click #reset-log-period-chart" : "resetDateRange"
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _
						.template($('#insights-log-template').html());
				this.model.logEntries.bind('reset', this.render, this);
			},
			render : function() {

				$(this.el).html(this.template(this.model.toJSON()));

				_.defer(function(view) {
					view.showFilterableDashboard(null, null, false);
				}, this);

				return this;
			},
			hideLoadingDialog : function() {
				var loadingDialog = new LoadingModal();
				loadingDialog.hideDialog();
			},
			resetDateRange : function(e) {
				window.datesChart.filterAll();
				dc.redrawAll();
			},
			showFilterableDashboard : function(startDate, endDate, showAll) {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}

				//Data
				var logBookData = this.getCleanedData(startDate, endDate,
						showAll);

				//Date dimension range

				var startDate = new Date(
						logBookData[logBookData.length - 1].resultDate);
				var endDate = new Date(logBookData[0].resultDate);

				//picker
				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData);
				var timePeriod = logBook.dimension(function(d) {
					return d.resultDate;
				});
				var logBookByDay = logBook.dimension(function(d) {
					return d.day;
				});

				this.createAllDatesChart(logBookByDay,startDate,endDate);	
				this.createSummaryTableChart(logBookByDay);

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
						.gap(2).x(
								d3.time.scale().domain([ startDate, endDate ]))
						.round(d3.time.day.round).xUnits(d3.time.days)
						.renderlet(function(chart) {
							chart.select("g.y").style("display", "none");
							window.daySummaryChart.filter(chart.filter());
							//dc.redrawAll();
						}).on("filtered", function(chart) {
							dc.events.trigger(function() {
								//window.daySummaryChart.focus(chart.filter());
								//dc.redrawAll();
							});
						}).xAxis().ticks(3);

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
			    	          function(d) { return d.insulinAmount>0 ? d.insulinAmount : ""; },
			    	          function(d) { return d.exerciseDuration>0 ? d.exerciseDuration : ""; }
			    	          ])
			    	 .sortBy(function(d){ return -d.day; })
			    	 .order(d3.ascending);

			},
			getCleanedData : function(fromDate, toDate, showAll) {

				var data;

				if (showAll) {
					console.log("show all");
					data = this.model.logEntries;

				} else if (fromDate && toDate) {
					console.log("show data period");
					data = this.model.logEntries.filterPeriod(fromDate, toDate);

				} else {
					console.log("show data for the last month");
					toDate = new Date(this.model.logEntries.at(0).get(
							"resultDate"));
					fromDate = new Date(toDate.getFullYear(),
							toDate.getMonth() - 1, toDate.getDate(), toDate
									.getHours(), toDate.getMinutes(), toDate
									.getSeconds(), toDate.getMilliseconds());

					data = this.model.logEntries.filterPeriod(fromDate, toDate);
					//console.log(JSON.stringify(data));
				}

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
						});
				//console.log(JSON.stringify(logResults));
				return logResults;
			}
		});