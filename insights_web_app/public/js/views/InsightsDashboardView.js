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
				"click #filter-bs-range" : "filterBloodSugarRange"
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
					view.showFilterableDashboard();
				}, this);
				return this;
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
			showFilterableDashboard : function() {
				this.hideLoadingDialog();

				if (this.model.logEntries.length <= 0) {
					return false;
				}

				//Data
				var logBookData = this.getCleanedData(this.model.logEntries);

				//Date dimension range
				var startDate = new Date(logBookData[0].resultDate), endDate = new Date(
						logBookData[logBookData.length - 1].resultDate), axisStartDate = new Date(
						startDate.getFullYear(), startDate.getMonth(),
						startDate.getDate()), axisEndDate = new Date(endDate
						.getFullYear(), endDate.getMonth(), endDate.getDate()), maxBloodSugarX = parseInt(d3
						.max(logBookData, function(d) {
							return d.bsLevel;
						})) + 10, minBloodSugarX = 30;

				// Create the crossfilter for the relevant dimensions and groups.
				var logBook = crossfilter(logBookData), date = logBook
						.dimension(function(d) {
							return d3.time.day.ceil(d.resultDate);
						});

				this
						.createLogBookChart(logBook, minBloodSugarX,
								maxBloodSugarX);
				this.createMonthChart(logBook);
				this.createDayOfWeekChart(logBook);
				this.createHourOfDayChart(logBook);
				this.createAllDatesChart(date, axisStartDate, axisEndDate);
				this.createDiabetesFactsChart(date);

				dc.renderAll();
			},
			createMonthChart : function(logBook) {
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
			createAllDatesChart : function(date, startDate, endDate) {

				var dates = date.group();

				window.datesChart = dc.barChart("#log-period-chart");

				datesChart.width(800).height(80).margins({
					top : 10,
					right : 5,
					bottom : 20,
					left : 5
				}).dimension(date).group(dates).elasticY(true).centerBar(true)
						.gap(1).x(
								d3.time.scale().domain([ startDate, endDate ]))
						.round(d3.time.day.round).xUnits(d3.time.days)
						.renderlet(function(chart) {
							chart.select("g.y").style("display", "none");
							dailyFactsChart.filter(chart.filter());
						}).on("filtered", function(chart) {
							dc.events.trigger(function() {
								dailyFactsChart.focus(chart.filter());
							});
						});

			},
			createLogBookChart : function(logBook, minBloodSugar, maxBloodSugar) {

				window.logBloodSugarChart = dc.barChart("#log-bs-chart");

				var bloodSugar = logBook.dimension(function(d) {
					if (d.bsLevel > 0) {
						return d.bsLevel;
					}
				}), bloodSugarGroup = bloodSugar.group().reduceSum(function(d) {
					return Math.floor(d.bsLevel / 10) * 10;
				});

				logBloodSugarChart.width(800).height(240).margins({
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
			createInsulinChart : function(logBook) {

				//window.logBloodSugarChart = dc.barChart("#log-bs-chart");

				var insulin = logBook.dimension(function(d) {
					if (d.bsLevel > 0) {
						return d.bsLevel;
					}
				}), insulinGroup = bloodSugar.group().reduceSum(function(d) {
					return Math.floor(d.bsLevel / 10) * 10;
				});

				logBloodSugarChart.width(800).height(240).margins({
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
			createDiabetesFactsChart : function(date) {

				window.dailyFactsChart = dc.bubbleChart("#bs-facts-chart");

				var dateFormat = d3.time.format("%m/%d/%Y");
				var numberFormat = d3.format(".1f")

				var dayFacts = date.group().reduce(
				//add
				function(p, v) {
					++p.count;
					p.total += v.bsLevel;
					p.avBloodSugar = Math.round(p.total / p.count);
					p.dailyInsulin = v.dailyInsulinAmount;
					if (v.bsLevel < 80) {
						++p.belowRange;
					} else if (v.bsLevel > 180) {
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
					--p.count;
					p.total -= v.bsLevel;
					p.avBloodSugar = Math.round(p.total / p.count);
					p.dailyInsulin = v.dailyInsulinAmount;
					if (v.bsLevel < 80) {
						--p.belowRange;
					} else if (v.bsLevel > 180) {
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
						avBloodSugar : 0,
						dailyInsulin : 0,
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
						.dimension(date)
						.group(dayFacts)
						.transitionDuration(1500)
						.colors([ "red", "#ccc", "steelblue", "green" ])
						.colorDomain([ 0, 100 ])
						.colorAccessor(function(d) {
							return d.value.inRangePercent;
						})
						.keyAccessor(function(p) {
							return p.value.avBloodSugar;
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
											+ "Av Result: "
											+ numberFormat(p.value.avBloodSugar)
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

				/*dc.dataTable("#dc-data-table")
				.dimension(dayFacts)
				.group(function (d) {
				    var format = d3.format("02d");
				    return d.key.getFullYear() + "/" + format((d.key.getMonth() + 1));
				})
				.columns([
				    function (d) {
				    	var dateFormat = d3.time.format("%m/%d/%Y");
				        return dateFormat(d.key);
				    },
				    function (d) {
				        return d.value.avBloodSugar;
				    },
				    function (d) {
				        return d.value.dailyInsulin;
				    },
				    function (d) {
				        return Math.floor(d.value.belowRangePercent);
				    },
				    function (d) {
				        return Math.floor(d.value.inRangePercent);
				    },
				    function (d) {
				        return Math.floor(d.value.aboveRangePercent);
				    }
				])
				// (optional) sort using the given field, :default = function(d){return d;}
				.sortBy(function(d){ return d.key; })
				// (optional) sort order, :default ascending
				.order(d3.ascending);*/
			},

			getCleanedData : function(data) {
				var logResults = new Array();
				this.model.logEntries.forEach(function(entry) {
					logResults.push(entry.toJSON());
				});

				logResults
						.forEach(function(d, i) {
							d.resultDate = new Date(d.resultDate);
							
							if(parseFloat(d.insulinAmount)){
								d.insulinAmount = d.insulinAmount ? parseFloat(d.insulinAmount)
										: 0;
								d.type = 'bolus-insulin';
							}else if(parseFloat(d.dailyInsulinAmount)>0){
								d.dailyInsulinAmount = d.dailyInsulinAmount ? parseFloat(d.dailyInsulinAmount)
										: 0;
								d.type = 'daily-insulin';
							}else if(parseFloat(d.bsLevel)>0){
								d.bsLevel = d.bsLevel ? parseFloat(d.bsLevel) : 0;
								d.type = 'blood-sugar';
							}
						});

				logResults.sort(function(a, b) {
					return new Date(a.resultDate) - new Date(b.resultDate);
				});

				return logResults;
			}
		});