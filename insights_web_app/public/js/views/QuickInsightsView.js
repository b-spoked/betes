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
					view.showFilterableDashboard(null,null,false);
				}, this);
				
				var self = this;
				
				$('#log-dates').daterangepicker(
						{},
						function(start, end) {
	                    	 self.showFilterableDashboard(start, end,false);
	                    	 //alert("todo");
	                     }      
	             );
				
				return this;
			},
			setDatePickerPeriod:function (fromDate,toDate){
				
				$('#log-dates').val(moment(fromDate).format("MMMM D, YYYY") + ' - ' + moment(toDate).format("MMMM D, YYYY"));
			},	
			showAll : function(e){
				e.preventDefault();
				this.showFilterableDashboard(null,null,true);
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
			showFilterableDashboard : function(startDate, endDate,showAll) {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}

				//Data
				var logBookData = this.getCleanedData(startDate, endDate,showAll);

				//Date dimension range
				
				var startDate = new Date(logBookData[logBookData.length - 1].resultDate);
				var endDate = new Date(logBookData[0].resultDate); 
				var axisStartDate = new Date(startDate.getFullYear(), startDate.getMonth(),startDate.getDate()); 
				var axisEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
				var maxBloodSugarX = parseInt(d3.max(logBookData, function(d) {return d.glucoseLevel;})) + 10;
				var minBloodSugarX = 30;
				

				//picker
				this.setDatePickerPeriod(startDate,endDate);

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
					.width(480)
					.height(40)
		            .margins({top: 10, right: 5, bottom: 20, left: 20})
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
						window.carbRatioChart.filter(chart.filter());
						window.bolusAmountChart.filter(chart.filter());
						window.insulinSensitivityChart.filter(chart.filter());
					}).on("filtered", function(chart) {
						dc.events.trigger(function() {
							window.quickInsightsChart.focus(chart.filter());
							window.carbRatioChart.focus(chart.filter());
							window.bolusAmountChart.focus(chart.filter());
							window.insulinSensitivityChart.focus(chart.filter());
						});
					});

			},
			createQuickInsightsChart : function(timePeriod,startDate, endDate,minBloodSugarX,maxBloodSugarX) {
				
				var bloodGlucoseGroup = timePeriod.group().reduceSum(function(d){ return d.glucoseLevel});
				var carbRatioGroup = timePeriod.group().reduceSum(function(d){ return d.carbRatio});
				var insulinSensitivityGroup = timePeriod.group().reduceSum(function(d){return d.insulinSensitivity});
				var bolusAmountGroup = timePeriod.group().reduceSum(function(d){return d.bolusAmount});
				
				window.quickInsightsChart = dc.barChart("#quick-insights-chart");
				
				quickInsightsChart
					.width(480)
		            .height(200)
		            .margins({top: 10, right: 5, bottom: 20, left: 20})
		            .dimension(timePeriod)
		            .group(bloodGlucoseGroup)   
		            .centerBar(true)
		            .gap(0)
		            .x(d3.time.scale().domain([startDate, endDate]))
		            .y(d3.scale.linear().domain([minBloodSugarX,maxBloodSugarX]))
		            .renderHorizontalGridLines(true)
		            .xAxis().ticks(5);
				
				window.carbRatioChart = dc.barChart("#quick-carb-ratio");
				
				carbRatioChart
					.width(480)
		            .height(200)
		            .margins({top: 10, right: 5, bottom: 20, left: 20})
		            .dimension(timePeriod)
		            .group(carbRatioGroup)   
		            .centerBar(true)
		            .gap(0)
		            .x(d3.time.scale().domain([startDate, endDate]))
		            .renderHorizontalGridLines(true)
		            .xAxis().ticks(5);
				
				window.bolusAmountChart = dc.barChart("#quick-insulin-amount");
				
				bolusAmountChart
					.width(480)
		            .height(200)
		            .margins({top: 10, right: 5, bottom: 20, left: 20})
		            .dimension(timePeriod)
		            .group(bolusAmountGroup)   
		            .centerBar(true)
		            .gap(0)
		            .x(d3.time.scale().domain([startDate, endDate]))
		            .renderHorizontalGridLines(true)
		            .xAxis().ticks(5);
				
				
				window.insulinSensitivityChart = dc.barChart("#quick-insulin-sensitivity");
				
				insulinSensitivityChart
					.width(480)
		            .height(200)
		            .margins({top: 10, right: 5, bottom: 20, left: 20})
		            .dimension(timePeriod)
		            .group(insulinSensitivityGroup)   
		            .centerBar(true)
		            .gap(0)
		            .x(d3.time.scale().domain([startDate, endDate]))
		            .renderHorizontalGridLines(true)
		            .xAxis().ticks(5);
				
			},
			getCleanedData : function(fromDate,toDate) {
				
				var data;
				
				if(showAll){
					console.log("show all");
					data = this.model.logEntries;
					
				}else if(fromDate&&toDate){
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