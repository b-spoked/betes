/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.QuickInsightsView = Backbone.View
		.extend({

			events : {
				"click #reset-log-period-chart" : "resetDateRange",
				"click #reset-bs-range-chart": "resetGlucoseRange",
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
					view.initializeDatePicker();
				}, this);
				
				return this;
			},
			initializeDatePicker:function(){
				$('#log-dates').daterangepicker(
						{
			                dateLimit: { days: 31 }
			            }    
	             );
			},
			setDatePickerPeriod:function (fromDate,toDate){
				
				var self = this;
				
				$('#log-dates').val(moment(fromDate).format("MMMM D, YYYY") + ' - ' + moment(toDate).format("MMMM D, YYYY"));
				
				$('#log-dates').daterangepicker(
						{
							startDate: fromDate,
			                endDate: toDate,
			                dateLimit: { days: 31 }
			            },
						function(start, end) {
	                    	 self.showFilterableDashboard(start, end,false);
	                     }      
	             );
				
			
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
			resetGlucoseRange : function(e) {
				window.glucoseRangeChart.filterAll();
				dc.redrawAll();
			},
			resetInsightsChart : function(e) {
				window.glucoseOverTime.filterAll();
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
				var minBloodSugarX = 0;
				
				//picker
				this.setDatePickerPeriod(startDate,endDate);
				//console.log(JSON.stringify(logBookData));
				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData),
				timePeriod = logBook.dimension(function(d) { return d.resultDate; }),
				day = logBook.dimension(function(d) { return d.day; });
				
				var groupBuilder = new BuildGroups(timePeriod);
				//this.createAllDatesChart(day, axisStartDate, axisEndDate);
				this.createDiabetesFactsChart(day);
				this.createGlucoseLevelRangeChart(logBook, minBloodSugarX, maxBloodSugarX);
				this.createGlucoseOverTimeChart(timePeriod, groupBuilder.glucoseLevelGroup(),axisStartDate, axisEndDate, minBloodSugarX, maxBloodSugarX);
				//this.createCountChart(timePeriod,timePeriod.group());
				//this.createInsulinOverTimeChart(timePeriod, groupBuilder.glucoseLevelGroup(),axisStartDate, axisEndDate);
				dc.renderAll();
			},
			createAllDatesChart : function(timePeriod, startDate, endDate) {

				var timePeriodGroup = timePeriod.group();

				window.datesChart = dc.barChart("#log-period-chart");
				
				window.datesChart
					.width(320)
					.height(80)
		            .margins({top: 10, right: 5, bottom: 20, left: 30})
					.dimension(timePeriod)
	                .group(timePeriodGroup)
	                .centerBar(true)
	                .gap(0)
	                .x(d3.time.scale().domain([startDate, endDate]))
	                .round(d3.time.day.round)
	                .xUnits(d3.time.days)
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
			createGlucoseLevelRangeChart : function(logBook, minBloodSugar, maxBloodSugar) {

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
			createInsulinOverTimeChart : function(timePeriod,bolusAmountGroup,startDate, endDate,minBloodSugarX,maxBloodSugarX) {
				
				window.insulinOverTime = dc.barChart("#quick-insulin-amount");
				
				window.insulinOverTime
					.width(360)
		            .height(180)
		            .margins({top: 10, right: 5, bottom: 20, left: 30})
		            .dimension(timePeriod)
		            .group(bolusAmountGroup) 
		            .centerBar(true)
		            .gap(0)
		            .x(d3.time.scale().domain([startDate, endDate]))
		            .renderHorizontalGridLines(true)
		            .xAxis().ticks(5);
				
			},
			createGlucoseOverTimeChart : function(timePeriod,bloodGlucoseGroup, startDate, endDate,minBloodSugarX,maxBloodSugarX) {
			
				window.glucoseOverTime = dc.barChart("#quick-insights-chart");
				
				window.glucoseOverTime
					.width(320)
		            .height(180)
		            .margins({top: 10, right: 5, bottom: 20, left: 30})
		            .dimension(timePeriod)
		            .group(bloodGlucoseGroup)   
		            .centerBar(true)
		            .gap(0)
		            .x(d3.time.scale().domain([startDate, endDate]))
		            .y(d3.scale.linear().domain([minBloodSugarX,maxBloodSugarX]))
		            .renderHorizontalGridLines(true)
		            .xAxis().ticks(5);
				
			},
			createCountChart : function(dimensionData,groupData) {
				
				window.countChart = dc.dataCount("#data-count");
				
				window.countChart
			    .dimension(dimensionData) // set dimension to all data
			    .group(groupData);
				
			},
			createDiabetesFactsChart : function(day) {

				window.dailyFactsChart = dc.bubbleChart("#bs-facts-chart");

				var dateFormat = d3.time.format("%m/%d/%Y");
				var numberFormat = d3.format(".1f");

				var dayFacts = day.group().reduce(
				//add
				function(p, v) {
					
						if(v.glucoseLevel>0){
							++p.count;
						}
						p.total += v.glucoseLevel;
						p.meanGlucoseLevel = Math.round(p.total / p.count);
						if (v.glucoseLevel < 4) {
							++p.belowRange;
						} else if (v.glucoseLevel > 10) {
							++p.aboveRange;
						} else {
							++p.inRange;
						}
						p.belowRangePercent = (p.belowRange / p.count) * 100;
						p.inRangePercent = (p.inRange / p.count) * 100;
						p.aboveRangePercent = (p.aboveRange / p.count) * 100;
						return p;
				},
				//remove
				function(p, v) {
					if(v.glucoseLevel>0){
						--p.count;
					}
						p.total -= v.glucoseLevel;
						p.meanGlucoseLevel = Math.round(p.total / p.count);
						if (v.glucoseLevel < 4) {
							--p.belowRange;
						} else if (v.glucoseLevel > 10) {
							--p.aboveRange;
						} else {
							--p.inRange;
						}
						p.belowRangePercent = (p.belowRange / p.count) * 100;
						p.inRangePercent = (p.inRange / p.count) * 100;
						p.aboveRangePercent = (p.aboveRange / p.count) * 100;
						return p;
				},
				//init
				function() {
					return {
						count : 0,
						total : 0,
						meanGlucoseLevel : 0,
						inRange : 0,
						aboveRange : 0,
						belowRange : 0,
						inRangePercent : 0,
						aboveRangePercent : 0,
						belowRangePercent : 0
					};
				});

				window.dailyFactsChart
						.width(320)
						.height(180)
						.margins({
							top : 20,
							right : 5,
							bottom : 20,
							left : 30
						})
						.dimension(day)
						.group(dayFacts)
						.transitionDuration(1500)
						.colors([ "red", "#ccc", "steelblue", "green" ])
						.colorDomain([ 80, 180 ])
						.colorAccessor(function(d) {
							return d.value.inRangePercent;
						})
						.keyAccessor(function(p) {
							return p.value.meanGlucoseLevel;
						})
						.valueAccessor(function(p) {
							return p.value.inRangePercent;
						})
						.radiusValueAccessor(function(p) {
							return p.value.count * 0.01;
						})
						.maxBubbleRelativeSize(0.05)
						.x(d3.scale.linear().domain([ 0, 350 ]))
						.y(d3.scale.linear().domain([ 0, 100 ]))
						.r(d3.scale.linear().domain([ 0, 100 ]))
						.elasticY(true)
						.yAxisPadding(10)
						.elasticX(true)
						.xAxisPadding(10)
						.renderHorizontalGridLines(true)
						.renderVerticalGridLines(true)
						.renderLabel(false)
						.label(function(p) {
							return '';
						})
						.renderTitle(true)
						.title(
								function(p) {
									return dateFormat(p.key)
											+ "\n"
											+ "Mean Glucose Level: "
											+ numberFormat(p.value.meanGlucoseLevel)
											+ "\n"
											+ "Below Target: "
											+ numberFormat(p.value.belowRangePercent)
											+ "%\n"
											+ "In Target: "
											+ numberFormat(p.value.inRangePercent)
											+ "%\n"
											+ "Above Target: "
											+ numberFormat(p.value.aboveRangePercent)
											+ "%\n";
								}).yAxis().tickFormat(function(v) {
							return v + " %";
						});
			},
			getCleanedData : function(fromDate,toDate,showAll) {
				
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
					//console.log(JSON.stringify(data));
				}
				
				var logResults = new Array();
				data.forEach(function(entry) {
					logResults.push(entry.toJSON());
				});

				logResults
				.forEach(function(d, i) {
					d.resultDate = new Date(d.resultDate);
					d.glucoseLevel = d.glucoseLevel ? parseFloat(d.glucoseLevel) : 1;
					d.insulinAmount = d.insulinAmount ? parseFloat(d.insulinAmount) : 0;
					d.exerciseDuration = d.exerciseDuration? d.exerciseDuration : 0;
					d.day = d3.time.day(d.resultDate);
				});
				//console.log(JSON.stringify(logResults));
				return logResults;
			}
		});