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
				"click #reset-log-period-chart" : "resetDatesChart"
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
			resetMonthOfYearChart: function(e){
				window.monthOfYearChart.filterAll();
				dc.redrawAll();
			},
			resetDayOfWeekChart: function(e){
				window.dayOfWeekChart.filterAll();
				dc.redrawAll();
			},
			resetHourOfDayChart: function(e){
				window.hourOfDayChart.filterAll();
				dc.redrawAll();
			},
			resetLogBloodSugarChart: function(e){
				window.logBloodSugarChart.filterAll();
				dc.redrawAll();
			},
			resetDatesChart: function(e){
				window.datesChart.filterAll();
				dc.redrawAll();
			},
			showFilterableDashboard:function(){
				
				if(this.model.logEntries.length <= 0){
					return false;
				}
				
				//chart areas
				window.monthOfYearChart = dc.pieChart("#month-of-year-chart");
				window.dayOfWeekChart = dc.pieChart("#day-of-week-chart");
				window.hourOfDayChart = dc.barChart("#hour-of-day-chart");
				window.logBloodSugarChart = dc.barChart("#log-bs-chart");
				window.datesChart = dc.barChart("#log-period-chart");
				window.averageBsChart = dc.barChart("#bs-avg-chart");
				window.averageInsulinChart = dc.barChart("#insulin-avg-chart");
				
				//Data
				var logBookData = this.getCleanedData(this.model.logEntries);
	            
	            //Date dimension range
	            var startDate = new Date(logBookData[0].resultDate),
				endDate = new Date(logBookData[logBookData.length-1].resultDate),
				axisStartDate = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()),
				axisEndDate = new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate()),
				maxBloodSugarX = parseInt(d3.max(logBookData, function(d){return d.bsLevel;})) + 10,
				minBloodSugarX = 30;
				
				
				//dimensions
				// Create the crossfilter for the relevant dimensions and groups.
				  var logBook = crossfilter(logBookData),
				      date = logBook.dimension(function(d) { return d3.time.day(new Date(d.resultDate)); }),
				      dates = date.group(),
				      bloodSugar = logBook.dimension(function(d) { if(d.bsLevel > 0) { return d.bsLevel; }}),
				      bloodSugarGroup = bloodSugar.group(),
				      insulin  = logBook.dimension(function(d) { if(d.insulinAmount > 0) { return d.insulinAmount; }});
				  
				  var hourOfDay = logBook.dimension(function (d) {
		                var hour = d.resultDate.getHours();
		                return hour+1;
		            });
		           
		           var hourOfDayGroup = hourOfDay.group();
				      
				  
		           
		           
				  var bloodSugarAvgByDayGroup = date.group().reduce(
		                    function (p, v) {
		                        ++p.days;
		                        p.total += v.bsLevel;
		                        p.avg = Math.round(p.total / p.days);
		                        return p;
		                    },
		                    function (p, v) {
		                        --p.days;
		                        p.total -= v.bsLevel;
		                        p.avg = p.days == 0 ? 0 : Math.round(p.total / p.days);
		                        return p;
		                    },
		                    function () {
		                        return {days: 0, total: 0, avg: 0};
		                    }
		            );
				  
				  var insulinAvgByDayGroup = date.group().reduceSum(function(d){
		                    return d.dailyInsulinAmount;}
		            );

				  
	            var dayOfWeek = logBook.dimension(function (d) {
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

	            var monthOfYear = logBook.dimension(function (d) {
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
	            
	           var hourOfDay = logBook.dimension(function (d) {
	                var hour = d.resultDate.getHours();
	                return hour+1;
	            });
	           
	           var hourOfDayGroup = hourOfDay.group();
		          
	           monthOfYearChart.width(180)
	                    .height(180)
	                    .radius(80)
	                    .innerRadius(30)
	                    .dimension(monthOfYear)
	                    .group(monthOfYearGroup);

	            dayOfWeekChart.width(180)
                		.height(180)
                		.radius(80)
                		.innerRadius(30)
	                    .dimension(dayOfWeek)
	                    .group(dayOfWeekGroup);
	            
	            hourOfDayChart.width(220)
	                .height(180)
	                .margins({top: 10, right: 5, bottom: 30, left: 5})
	                .dimension(hourOfDay)
	                .group(hourOfDayGroup)
	                .elasticY(true)
	                .centerBar(true)
	                .gap(1)
	                .round(dc.round.floor)
	                .x(d3.scale.linear().domain([0, 24]))
	                .renderlet(function (chart) {
                        chart.select("g.y").style("display", "none");
                    })
	                .renderHorizontalGridLines(true);
	            
	            logBloodSugarChart.width(800)
	                .height(240)
	                .margins({top: 10, right: 5, bottom: 20, left: 30})
	                .dimension(bloodSugar)
	                .group(bloodSugarGroup)
	                .elasticY(true)
	                .centerBar(true)
	                .gap(1)
	                .x(d3.scale.linear().domain([minBloodSugarX,maxBloodSugarX]))
	                .renderHorizontalGridLines(true);
	            
	            averageBsChart
	                .width(800)
	                .height(150)
	                .margins({top: 10, right: 5, bottom: 20, left: 30})
	                .dimension(date)
	                .group(bloodSugarAvgByDayGroup)
	                .valueAccessor(function(d) {
	                    return d.value.avg;
	                })
	                .x(d3.time.scale().domain([axisStartDate, axisEndDate]))
	                .renderHorizontalGridLines(true)
	                .centerBar(true)
	                .elasticY(true)
	                .brushOn(false)
	                .title(function(d){
	                	 var value = d.value;
                         if (isNaN(value)) value = 0;
                         return d.key + "\n" + value;
	                })
	                .xAxis().ticks(5);
	            
	            averageInsulinChart
	                .width(800)
	                .height(150)
	                .margins({top: 10, right: 5, bottom: 20, left: 30})
	                .dimension(date)
	                .group(insulinAvgByDayGroup)
	                .valueAccessor(function(d) {
	                    return d.value;
	                })
	                .x(d3.time.scale().domain([axisStartDate, axisEndDate]))
	                .renderHorizontalGridLines(true)
	                .centerBar(true)
	                .elasticY(true)
	                .brushOn(false)
	                .title(function(d){
	                	 var value = d.value;
	                     if (isNaN(value)) value = 0;
	                     return d.key + "\n" + value;
	                })
	                .xAxis().ticks(5);
	            
	            
	           /* logInsulinChart.width(800)
	                .height(240)
	                .margins({top: 10, right: 50, bottom: 30, left: 40})
	                .dimension(insulin)
	                .group(insulin.group())
	                .centerBar(true)
	                .elasticY(true)
	                .gap(1)
	                .x(d3.scale.linear().domain([0,15]))
	                .renderlet(function (chart) {
                        chart.select("g.y").style("display", "none");
                    })
                    .y(d3.scale.linear().domain([0,10]));*/
	           
	            
	            datesChart.width(800)
	                .height(80)
	                 .margins({top: 10, right: 5, bottom: 20, left: 5})
	                .dimension(date)
	                .group(dates)
	                .elasticY(true)
	                .centerBar(true)
	                .gap(1)
	                .x(d3.time.scale().domain([axisStartDate, axisEndDate]))
	                .round(d3.time.day.round)
	                .xUnits(d3.time.days)
	                .renderlet(function (chart) {
                        chart.select("g.y").style("display", "none");
                    });

	            dc.renderAll();		
			},
			getCleanedData : function(data){
				var logResults = new Array();
					this.model.logEntries.forEach(function(entry) {
						logResults.push(entry.toJSON());
					});
					
					// A little coercion, since the CSV is untyped.
					logResults.forEach(function(d, i) {
					    d.resultDate = new Date(d.resultDate);
					    d.insulinAmount = d.insulinAmount ? parseFloat(d.insulinAmount) : 0;
					    d.dailyInsulinAmount = d.dailyInsulinAmount ? parseFloat(d.dailyInsulinAmount) : 0;
					    d.bsLevel = d.bsLevel ? parseFloat(d.bsLevel) : 0;
					  });
					
					logResults.sort(function(a, b) {
						return new Date(a.resultDate) - new Date(b.resultDate);
					});
					
				return logResults;
			}
		});