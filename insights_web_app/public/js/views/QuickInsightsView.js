/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.QuickInsightsView = Backbone.View
		.extend({

			events : {
				"click #reset-log-period-chart" : "resetDateRange",
				"click #reset-quick-insights-chart" : "resetInsightsChart",
				"click #show-all-results" : "showAll"
					
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#quick-insights-template').html());
				this.model.logEntries.bind('reset', this.render, this);
				
			},
			render : function() {
				
				$(this.el).html(this.template(this.model.toJSON()));
				
				_.defer(function(view) {
					view.showFilterableDashboard(null,null);
				}, this);
				
				var self = this;
				
				$('#log-dates').daterangepicker(
						{},
						function(start, end) {
	                    	 //self.showFilterableDashboard(start, end);
	                    	 alert("todo");
	                     }      
	             );
				
				return this;
			},
			setDatePickerPeriod:function (fromDate,toDate){
				
				$('#log-dates').val(moment(fromDate).format("MMMM D, YYYY") + ' - ' + moment(toDate).format("MMMM D, YYYY"));
			},	
			showAll : function(e){
				this.showFilterableDashboard(null,null);
			},
			hideLoadingDialog : function() {
				var loadingDialog = new LoadingModal();
				loadingDialog.hideDialog();
			},
			resetDateRange : function(e) {
				window.datesChart.filterAll();
				dc.redrawAll();
			},
			resetInsightsChart : function(e) {
				window.quickInsightsChart.filterAll();
				dc.redrawAll();
			},
			showFilterableDashboard : function(startDate, endDate) {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}

				//Data
				var logBookData = this.getCleanedData(startDate, endDate);

				//Date dimension range
				
				var startDate = new Date(logBookData[logBookData.length - 1].resultDate);
				var endDate = new Date(logBookData[0].resultDate); 
				var axisStartDate = new Date(startDate.getFullYear(), startDate.getMonth(),startDate.getDate()); 
				var axisEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
				var maxBloodSugarX = parseInt(d3.max(logBookData, function(d) {return d.glucoseLevel;})) + 10;
				var minBloodSugarX = 30;

				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData);
				var timePeriod = logBook.dimension(function(d) { return d.resultDate; });
				var day = logBook.dimension(function(d) { return d.day; });
				
				this.createAllDatesChart(day, axisStartDate, axisEndDate);
				this.createQuickInsightsChart(timePeriod, axisStartDate, axisEndDate,minBloodSugarX,maxBloodSugarX);

				dc.renderAll();
			},
			createAllDatesChart : function(timePeriod, startDate, endDate) {

				var timePeriodGroup = timePeriod.group();

				window.datesChart = dc.barChart("#log-period-chart");
				
				datesChart
					.width(800)
					.height(80).margins({
						top : 10,
						right : 5,
						bottom : 20,
						left : 5
					})
					.dimension(timePeriod)
	                .group(timePeriodGroup)
	                .centerBar(true)
	                .gap(0)
	                .x(d3.time.scale().domain([startDate, endDate]))
	                .round(d3.time.day.round)
	                .xUnits(d3.time.days)
	                .renderlet(function(chart) {
						chart.select("g.y").style("display", "none");
						window.quickInsightsChart.filter(chart.filter());
					}).on("filtered", function(chart) {
						dc.events.trigger(function() {
							window.quickInsightsChart.focus(chart.filter());
						});
					});

			},
			createQuickInsightsChart : function(timePeriod,startDate, endDate,minBloodSugarX,maxBloodSugarX) {
				window.quickInsightsChart = dc.compositeChart("#quick-insights-chart");
				
				var bloodGlucoseGroup = timePeriod.group().reduceSum(function(d){return d.glucoseLevel});
				var carbRatioGroup = timePeriod.group().reduceSum(function(d){return d.carbRatio});
				var insulinSensitivityGroup = timePeriod.group().reduceSum(function(d){return d.insulinSensitivity});
				var bolusAmountGroup = timePeriod.group().reduceSum(function(d){return d.bolusAmount});
				
				/*quickInsightsChart
				    .width(800) // (optional) define chart width, :default = 200
				    .height(240) // (optional) define chart height, :default = 200
				    .margins({top: 10, right: 50, bottom: 30, left: 40})
				    .dimension(timePeriod) // set dimension
				    .group(bloodGlucoseGroup) // set group
				    .elasticY(true)
				    .elasticX(true)
				    .x(d3.time.scale().domain([startDate, endDate]))
				    .renderHorizontalGridLines(true)
				    .renderVerticalGridLines(true)
				    .renderArea(true)
				    .stack(carbRatioGroup)
				    .stack(insulinSensitivityGroup)
				    .stack(bolusAmountGroup)
				    .brushOn(true)
				    .title(function(d) { return "Value: " + d.value; })
				    .renderTitle(true)
				    .dotRadius(10);*/
				
				quickInsightsChart.width(800)
	                .height(180)
	                .transitionDuration(1000)
	                .margins({top: 10, right: 50, bottom: 25, left: 40})
	                .dimension(timePeriod) // set dimension
				    .group(bloodGlucoseGroup) // set group
	                .x(d3.time.scale().domain([startDate, endDate]))
	                .round(d3.time.day.round)
	                .xUnits(d3.time.days)
	                .elasticY(true)
	                .renderHorizontalGridLines(true)
	                .brushOn(false)
	                .compose([
	                    dc.lineChart(quickInsightsChart)
	                    	.group(bloodGlucoseGroup)
	                        .renderArea(true)
	                        .stack(carbRatioGroup)
	                        .stack(insulinSensitivityGroup)
	                        .stack(bolusAmountGroup)    
	                ])
	                .xAxis();
				
			},
			getCleanedData : function(fromDate,toDate) {
				
				var data;
				
				if(fromDate&&toDate){
					console.log("show data period");
					data = this.model.logEntries.filterPeriod(fromDate,toDate);
					
				}else{
					console.log("show data for the last month");
					toDate = new Date(this.model.logEntries.at(0).get("resultDate"));
					fromDate = new Date(
							toDate.getFullYear(), 
							toDate.getMonth() -1, 
							toDate.getDate(),
							toDate.getHours(),
							toDate.getMinutes(),
							toDate.getSeconds(),
							toDate.getMilliseconds()
					    );
					
					data = this.model.logEntries.filterPeriod(fromDate,toDate);
				}
				
				this.setDatePickerPeriod(fromDate,toDate);
				
				var logResults = new Array();
				data.forEach(function(entry) {
					logResults.push(entry.toJSON());
				});

				logResults
				.forEach(function(d, i) {
					d.resultDate = new Date(d.resultDate);
					d.glucoseLevel = parseFloat(d.glucoseLevel);
					d.insulinSensitivity = parseFloat(d.insulinSensitivity);
					d.bolusAmount = parseFloat(d.bolusAmount);
					d.carbRatio = parseFloat(d.carbRatio);
					d.day = d3.time.day(d.resultDate);
				});

				return logResults;
			}
		});