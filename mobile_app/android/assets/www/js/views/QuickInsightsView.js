/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.QuickInsightsView = Backbone.View
		.extend({

			events : {
				"click #reset-log-period-chart" : "resetDateRange",
				"click #reset-bs-range-chart" : "resetGlucoseRange",
				"click #reset-quick-insights-chart" : "resetInsightsChart",
				"click #show-all-results" : "showAll"
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
					view.showFilterableDashboard(null, null, false);
					view.initializeDatePicker();
				}, this);

				return this;
			},
			initializeDatePicker : function() {
				$('#log-dates').daterangepicker({
					dateLimit : {
						days : 31
					}
				});
			},
			setDatePickerPeriod : function(fromDate, toDate) {

				var self = this;

				$('#log-dates').val(
						moment(fromDate).format("MMMM D, YYYY") + ' - '
								+ moment(toDate).format("MMMM D, YYYY"));

				$('#log-dates').daterangepicker({
					startDate : fromDate,
					endDate : toDate,
					dateLimit : {
						days : 31
					}
				}, function(start, end) {
					self.showFilterableDashboard(start, end, false);
				});

			},
			showAll : function(e) {
				e.preventDefault();
				this.showFilterableDashboard(null, null, true);
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
				var maxBloodSugarX = parseInt(d3.max(logBookData, function(d) {
					return d.glucoseLevel;
				})) + 10;
				var minBloodSugarX = 0;

				//picker
				this.setDatePickerPeriod(startDate, endDate);
				//console.log(JSON.stringify(logBookData));
				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData);
				var timePeriod = logBook.dimension(function(d) {
					return d.resultDate;
				});
				var logBookByGlucoseLevel = logBook.dimension(function(d) {
					return d.glucoseLevel;
				});
				var logBookResultsByGlucoseLevel = timePeriod.group()
						.reduceSum(function(d) {
							return d.glucoseLevel
						});
				var logBookByDay = logBook.dimension(function(d) {
					return d.day;
				});

				this.createGlucoseLevelRangeChart(logBook, minBloodSugarX,
						maxBloodSugarX);
				this.createGlucoseOverTimeChart(timePeriod,
						logBookResultsByGlucoseLevel, startDate, endDate,
						minBloodSugarX, maxBloodSugarX);

				this.createGlucoseTimeInRangeChart(logBook);	
				//this.createSummaryTableChart(logBookByDay);

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
						.gap(0).x(
								d3.time.scale().domain([ startDate, endDate ]))
						.round(d3.time.day.round).xUnits(d3.time.days)
						.renderlet(function(chart) {
							chart.select("g.y").style("display", "none");
							window.glucoseOverTime.filter(chart.filter());
							window.glucoseRangeChart.focus(chart.filter());
							//window.insulinOverTime.filter(chart.filter());
							dc.redrawAll();
						}).on("filtered", function(chart) {
							dc.events.trigger(function() {
								window.glucoseOverTime.focus(chart.filter());
								window.glucoseRangeChart.focus(chart.filter());
								//window.insulinOverTime.focus(chart.filter());
								dc.redrawAll();
							});
						}).xAxis().ticks(5);

			},
			createGlucoseLevelRangeChart : function(logBook, minBloodSugar,
					maxBloodSugar) {

				window.glucoseRangeChart = dc.barChart("#bs-range-chart");

				var bloodSugar = logBook.dimension(function(d) {
					return d.glucoseLevel;
				}), bloodSugarGroup = bloodSugar.group();

				window.glucoseRangeChart.width(320).height(140).margins({
					top : 20,
					right : 5,
					bottom : 20,
					left : 30
				}).dimension(bloodSugar).group(bloodSugarGroup).elasticY(true)
						.centerBar(true).gap(1).round(dc.round.floor).x(
								d3.scale.linear().domain(
										[ minBloodSugar, maxBloodSugar ]))
						.renderHorizontalGridLines(true);
			},
			createInsulinOverTimeChart : function(timePeriod, bolusAmountGroup,
					startDate, endDate, minBloodSugarX, maxBloodSugarX) {

				window.insulinOverTime = dc.barChart("#quick-insulin-amount");

				window.insulinOverTime.width(360).height(180).margins({
					top : 10,
					right : 5,
					bottom : 20,
					left : 30
				}).dimension(timePeriod).group(bolusAmountGroup)
						.centerBar(true).gap(0).x(
								d3.time.scale().domain([ startDate, endDate ]))
						.renderHorizontalGridLines(true).xAxis().ticks(5);

			},
			createGlucoseOverTimeChart : function(timePeriod,
					bloodGlucoseGroup, startDate, endDate, minBloodSugarX,
					maxBloodSugarX) {

				window.glucoseOverTime = dc.lineChart("#quick-insights-chart");
				
				window.glucoseOverTime.width(320).height(180).margins({
					top : 10,
					right : 5,
					bottom : 20,
					left : 30
				}).dimension(timePeriod)
				.group(bloodGlucoseGroup)
				.transitionDuration(500)
			    .elasticY(true)
			   .elasticX(true)
			   .x(d3.time.scale().domain([ startDate, endDate ]))
			   .y(d3.scale.linear().domain([ minBloodSugarX, maxBloodSugarX ]))
			    .round(d3.time.month.round)
			    .renderHorizontalGridLines(true)
			    .renderVerticalGridLines(true)
			    .renderArea(true)
			    .brushOn(true)
			    .title(function(d) { return "Value: " + d.value; })
			    .renderTitle(true)
			    .dotRadius(10)
			    .xAxis().ticks(5);

			},
			createGlucoseTimeInRangeChart : function(logBook) {

				window.timeInRangeChart = dc.pieChart("#time-in-range-chart");
				
				 var range = logBook.dimension(function (d) {
					 	var range = "na";
					 	if(d.glucoseLevel > 0 && d.glucoseLevel < 4){
					 		range = "below";
					 	}else if(d.glucoseLevel >= 4 && d.glucoseLevel <= 8){
					 		range = "in";
					 	}else if(d.glucoseLevel > 8){
					 		range = "above";
					 	}
					 	return range;
		            });
				 
				 
				 var rangeGroup = range.group()
				 
				
				
				window.timeInRangeChart
					.width(320)
					.height(320)
					.radius(150)
					.dimension(range)
					.group(rangeGroup)
					.label(function (d) {
						return d.data.key;
					});
			},
			getCleanedData : function(fromDate, toDate, showAll) {

				var data = this.model.logEntries;

				/*if (showAll) {
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
				}*/

				var logResults = new Array();
				data.forEach(function(entry) {
					//console.log(entry.get("glucoseLevel"));
					if(entry.get("glucoseLevel")>0){
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