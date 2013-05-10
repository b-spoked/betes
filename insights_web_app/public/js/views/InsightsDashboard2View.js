/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.InsightsDashboardView = Backbone.View
		.extend({

			events : {
				"click #reset-month-of-year-chart" : "resetMonthOfYearChart",
				"click #reset-day-of-week-chart" : "resetDayOfWeekChart",
				"click #reset-hour-of-day-chart" : "resetHourOfDayChart",
				"click #reset-log-bs-chart" : "resetLogBloodSugarChart",
				"click #reset-log-period-chart" : "resetDatesChart",
				"click #reset-bs-facts-chart" : "resetFactsChart",
				"click #filter-morning" : "filterMorning",
				"click #filter-evening" : "filterEvening",
				"click #filter-xmas" : "filterXmas",
				"click #filter-weekday" : "filterWeekday",
				"click #filter-weekendday" : "filterWeekendDay",
				"click #filter-bs-range" : "filterBloodSugarRange",
				"clickApply #" : "applyDateFilter"
					
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#graphs-template').html());
				this.model.logEntries.bind('reset', this.render, this);
				
			},
			render : function() {
				
				
				$(this.el).html(this.template(this.model.toJSON()));
				_.defer(function(view) {
					view.closeHelp();
				}, this);
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
			initializeDatePicker:function (fromDate,toDate){
				
				$('#log-dates').val(moment(fromDate).format("MMMM D, YYYY") + ' - ' + moment(toDate).format("MMMM D, YYYY"));
			},	
			applyDateFilter : function(e){
				alert('date range');
			},
			closeHelp : function() {
				if (this.model.logEntries.length > 0) {
					$("#graphs-getting-started").hide();
				}
			},
			hideLoadingDialog : function() {
				var loadingDialog = new LoadingModal();
				loadingDialog.hideDialog();
			},
			resetMonthOfYearChart : function(e) {
				window.monthOfYearChart.filterAll();
				dc.redrawAll();
			},
			resetDayOfWeekChart : function(e) {
				window.dayOfWeekChart.filterAll();
				dc.redrawAll();
			},
			resetHourOfDayChart : function(e) {
				window.hourOfDayChart.filterAll();
				dc.redrawAll();
			},
			resetLogBloodSugarChart : function(e) {
				window.logBloodSugarChart.filterAll();
				dc.redrawAll();
			},
			resetDatesChart : function(e) {
				window.datesChart.filterAll();
				dc.redrawAll();
			},
			resetFactsChart : function(e) {
				window.dailyFactsChart.filterAll();
				dc.redrawAll();
			},
			resetAllCharts : function() {
				window.monthOfYearChart.filterAll();
				window.dayOfWeekChart.filterAll();
				window.hourOfDayChart.filterAll();
				window.dailyFactsChart.filterAll();
			},
			filterBloodSugarRange : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.logBloodSugarChart.filter([ 80, 180 ]);
				dc.renderAll();
			},
			filterMorning : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.hourOfDayChart.filter([ 6, 10 ]);
				dc.renderAll();
			},
			filterEvening : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.hourOfDayChart.filter([ 18, 22 ]);
				dc.renderAll();
			},
			filterXmas : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.monthOfYearChart.filter("Dec");
				dc.renderAll();
			},
			filterWeekday : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.dayOfWeekChart.filter("Tue");
				dc.renderAll();
			},
			filterWeekendDay : function(e) {
				e.preventDefault();
				this.resetAllCharts();
				window.dayOfWeekChart.filter("Sat");
				dc.renderAll();
			},
			showFilterableDashboard : function(startDate, endDate) {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}

				//Data
				var logBookData = this.getCleanedData(startDate, endDate);

				//Date dimension range
				var startDate = new Date(logBookData[0].resultDate); 
				var endDate = new Date(logBookData[logBookData.length - 1].resultDate);
				var axisStartDate = new Date(startDate.getFullYear(), startDate.getMonth(),startDate.getDate()); 
				var axisEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
				var maxBloodSugarX = parseInt(d3.max(logBookData, function(d) {return d.glucoseLevel;})) + 10;
				var minBloodSugarX = 30;

				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData);
				var day = logBook.dimension(function(d) { return d.day; });
				
				this.createLogBookChart(logBook, minBloodSugarX,maxBloodSugarX);
				this.createMonthOfYearChart(logBook);
				this.createDayOfWeekChart(logBook);
				this.createHourOfDayChart(logBook);
				
				this.createAllDatesChart(day, axisStartDate, axisEndDate);
				this.createDiabetesFactsChart(day);
				
				this.createCarbRatioChart(day, axisStartDate, axisEndDate);
				this.createBolusChart(day, axisStartDate, axisEndDate);
				this.createInsulinSensitivityChart(day, axisStartDate, axisEndDate);
				this.createBloodGlucoseChart(day, axisStartDate, axisEndDate);

				dc.renderAll();
			},
			createMonthOfYearChart : function(logBook) {
				window.monthOfYearChart = dc.pieChart("#month-of-year-chart");

				var monthOfYear = logBook.dimension(function(d) {
					var month = d.resultDate.getMonth();
					switch (month) {
					case 0:
						return "Jan";
					case 1:
						return "Feb";
					case 2:
						return "Mar";
					case 3:
						return "Apr";
					case 4:
						return "May";
					case 5:
						return "Jun";
					case 6:
						return "Jul";
					case 7:
						return "Aug";
					case 8:
						return "Sep";
					case 9:
						return "Oct";
					case 10:
						return "Nov";
					case 11:
						return "Dec";
					}
				});

				var monthOfYearGroup = monthOfYear.group();

				monthOfYearChart.width(220).height(220).radius(80).innerRadius(
						30).dimension(monthOfYear).group(monthOfYearGroup);

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
				dayOfWeekChart.width(220).height(220).radius(80)
						.innerRadius(30).dimension(dayOfWeek).group(
								dayOfWeekGroup);

			},
			createHourOfDayChart : function(logBook) {
				var hourOfDay = logBook.dimension(function(d) {
					var hour = d.resultDate.getHours();
					return hour + 1;
				}), hourOfDayGroup = hourOfDay.group();

				window.hourOfDayChart = dc.barChart("#hour-of-day-chart");

				hourOfDayChart.width(220).height(220).margins({
					top : 10,
					right : 5,
					bottom : 30,
					left : 5
				}).dimension(hourOfDay).group(hourOfDayGroup).elasticY(true)
						.centerBar(true).gap(1).round(dc.round.floor).x(
								d3.scale.linear().domain([ 0, 24 ])).renderlet(
								function(chart) {
									chart.select("g.y")
											.style("display", "none");
								}).renderHorizontalGridLines(true);

			},
			createAllDatesChart : function(day, startDate, endDate) {

				var days = day.group();

				window.datesChart = dc.barChart("#log-period-chart");

				datesChart.width(800).height(80).margins({
					top : 10,
					right : 5,
					bottom : 20,
					left : 5
				}).dimension(day).group(days).elasticY(true).centerBar(true)
						.gap(0).x(
								d3.time.scale().domain([ startDate, endDate ]))
						.round(d3.time.day.round).xUnits(d3.time.days)
						.renderlet(function(chart) {
							chart.select("g.y").style("display", "none");
							dailyFactsChart.filter(chart.filter());
							bolusChart.filter(chart.filter());
							carbRatioChart.filter(chart.filter());
							insulinSensitivityChart.filter(chart.filter());
							bloodGlucoseChart.filter(chart.filter());
						}).on("filtered", function(chart) {
							dc.events.trigger(function() {
								dailyFactsChart.focus(chart.filter());
								bolusChart.focus(chart.filter());
								carbRatioChart.focus(chart.filter());
								insulinSensitivityChart.focus(chart.filter());
								bloodGlucoseChart.focus(chart.filter());
							});
						});

			},
			createBloodGlucoseChart : function(timePeriod,startDate, endDate) {
				window.bloodGlucoseChart = dc.lineChart("#blood-glucose-chart");
				
				var bloodGlucoseGroup = timePeriod.group().reduce(
						//add
						function(p, v) {
							
							if(v.glucoseLevel>0){
								++p.count;
							}
								//console.log("bs: "+v.glucoseLevel);
								p.total += v.glucoseLevel;
								p.meanGlucoseLevel = p.total / p.count;
							
							return p;
						
						},
						//remove
						function(p, v) {
							if(v.glucoseLevel>0){
								--p.count;
							}
							p.total -= v.glucoseLevel;
							p.meanGlucoseLevel = p.total / p.count;
						
							
							return p;
							
						},
						//init
						function() {
							return {
								count : 0,
								total : 0,
								meanGlucoseLevel : 0
							};
						});

				bloodGlucoseChart
	               .width(800)
	                .height(240)
	                .margins({top: 10, right: 50, bottom: 30, left: 60})
	                .dimension(timePeriod)
	                .group(bloodGlucoseGroup)
	                .valueAccessor(function(d) {
	                	return d.value.meanGlucoseLevel;
	                })
	                .x(d3.time.scale().domain([startDate, endDate]))
	                .renderHorizontalGridLines(true)
	                .elasticY(true)
	                .brushOn(false)
	                .title(function(d){
	                    return d.value.meanGlucoseLevel;
	                });
			},
			createCarbRatioChart : function(timePeriod,startDate, endDate) {
				window.carbRatioChart = dc.lineChart("#carb-ratio-chart");
				
				var carbRatioGroup = timePeriod.group().reduce(
						//add
						function(p, v) {
							if(v.carbRatio>0){
								++p.count;
							}
							p.total += v.carbRatio;
							p.meanCarbRatio = p.total / p.count;
							
							return p;
						},
						//remove
						function(p, v) {
							if(v.carbRatio>0){
								--p.count;
							}
							p.total -= v.carbRatio;
							p.meanCarbRatio = p.total / p.count;
							
							return p;
						},
						//init
						function() {
							return {
								count : 0,
								total : 0,
								meanCarbRatio : 0
							};
						});
				
				carbRatioChart
	               .width(800)
	                .height(240)
	                .margins({top: 10, right: 50, bottom: 30, left: 60})
	                .dimension(timePeriod)
	                .group(carbRatioGroup)
	                .valueAccessor(function(d) {
	                    return d.value.meanCarbRatio;
	                })
	                .x(d3.time.scale().domain([startDate, endDate]))
	                .renderHorizontalGridLines(true)
	                .elasticY(true)
	                .brushOn(false)
	                .title(function(d){
	                    return d.value.meanCarbRatio;
	                });
			},
			createInsulinSensitivityChart : function(timePeriod,startDate, endDate) {
				window.insulinSensitivityChart = dc.lineChart("#insulin-sensitivity-chart");
				
				
				var insulinSensitivityGroup = timePeriod.group().reduce(
						//add
						function(p, v) {
							
							if(v.insulinSensitivity>0){
								++p.count;
							}
							p.total += v.insulinSensitivity;
							p.meanInsulinSensitivity = p.total / p.count;
							
							return p;
						},
						//remove
						function(p, v) {
							if(v.insulinSensitivity>0){
								--p.count;
							}
							p.total -= v.insulinSensitivity;
							p.meanInsulinSensitivity = p.total / p.count;
						
							
							return p;
						},
						//init
						function() {
							return {
								count : 0,
								total : 0,
								meanInsulinSensitivity : 0
							};
						});

				insulinSensitivityChart
	               .width(800)
	                .height(240)
	                .margins({top: 10, right: 50, bottom: 30, left: 60})
	                .dimension(timePeriod)
	                .group(insulinSensitivityGroup)
	                .valueAccessor(function(d) {
	                    return d.value.meanInsulinSensitivity;
	                })
	                .x(d3.time.scale().domain([startDate, endDate]))
	                .renderHorizontalGridLines(true)
	                .elasticY(true)
	                .brushOn(false)
	                .title(function(d){
	                    return d.value.meanInsulinSensitivity;
	                });
			},
			createBolusChart : function(timePeriod,startDate, endDate) {
				window.bolusChart = dc.lineChart("#bolus-chart");
				
				var bolusGroup = timePeriod.group().reduce(
						//add
						function(p, v) {
							if(v.bolusAmount>0){
								++p.count;
							}
							p.total += v.bolusAmount;
							p.meanBolusAmount = p.total / p.count;
							
							return p;
						},
						//remove
						function(p, v) {
							if(v.bolusAmount>0){
								--p.count;
							}
							p.total -= v.bolusAmount;
							p.meanBolusAmount = p.total / p.count;
							
							return p;
						},
						//init
						function() {
							return {
								count : 0,
								total : 0,
								meanBolusAmount : 0
							};
						});
				
				bolusChart
	               .width(800)
	                .height(240)
	                .margins({top: 10, right: 50, bottom: 30, left: 60})
	                .dimension(timePeriod)
	                .group(bolusGroup)
	                .valueAccessor(function(d) {
	                    return d.value.meanBolusAmount;
	                })
	                .x(d3.time.scale().domain([startDate, endDate]))
	                .renderHorizontalGridLines(true)
	                .elasticY(true)
	                .brushOn(false)
	                .title(function(d){
	                    return d.value.meanBolusAmount+" u";
	                });
			},
			createLogBookChart : function(logBook, minBloodSugar, maxBloodSugar) {

				window.logBloodSugarChart = dc.barChart("#log-bs-chart");

				var bloodSugar = logBook.dimension(function(d) {
					if (d.glucoseLevel > 0) {
						return d.glucoseLevel;
					}
				}), bloodSugarGroup = bloodSugar.group().reduceSum(function(d) {
					return Math.floor(d.glucoseLevel / 10) * 10;
				});

				logBloodSugarChart.width(220).height(140).margins({
					top : 20,
					right : 5,
					bottom : 20,
					left : 30
				}).dimension(bloodSugar).group(bloodSugarGroup).elasticY(true)
						.centerBar(true).gap(1).round(dc.round.floor).x(
								d3.scale.linear().domain(
										[ minBloodSugar, maxBloodSugar ]))
						.renderlet(function(chart) {
							chart.select("g.y").style("display", "none");
						}).renderHorizontalGridLines(true);
			},
			createDiabetesFactsChart : function(day) {

				window.dailyFactsChart = dc.bubbleChart("#bs-facts-chart");

				var dateFormat = d3.time.format("%m/%d/%Y");
				var numberFormat = d3.format(".1f")

				var dayFacts = day.group().reduce(
				//add
				function(p, v) {
					
						if(v.glucoseLevel>0){
							++p.count;
						}
						p.total += v.glucoseLevel;
						p.meanGlucoseLevel = Math.round(p.total / p.count);
						if (v.glucoseLevel < 80) {
							++p.belowRange;
						} else if (v.glucoseLevel > 180) {
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
						if (v.glucoseLevel < 80) {
							--p.belowRange;
						} else if (v.glucoseLevel > 180) {
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
						.width(800)
						.height(240)
						.margins({
							top : 20,
							right : 5,
							bottom : 20,
							left : 50
						})
						.dimension(day)
						.group(dayFacts)
						.transitionDuration(1500)
						.colors([ "red", "#ccc", "steelblue", "green" ])
						.colorDomain([ 0, 100 ])
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
						.r(d3.scale.linear().domain([ 0, 10 ]))
						.elasticY(true)
						.elasticX(true)
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
											+ "mg/dl\n"
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

			getCleanedData : function(fromDate,toDate) {
				
				var data;
				
				if(fromDate&&toDate){
					
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
				
				this.initializeDatePicker(fromDate,toDate);
				
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
					d.day = d3.time.day(d.resultDate); // pre-calculate day for better performance
					d.hour = d3.time.hour(d.resultDate); // pre-calculate hour for better performance
				});

				return logResults;
			}
		});