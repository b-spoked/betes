/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.InsightsGraphsView = Backbone.View
		.extend({

			events : {
				"click .show-line": "showMultiLineGraph",
				"click .show-horizon": "showHorizonsGraph"
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
					view.showMultiLineGraph();
				}, this);
				return this;
			},
			closeHelp : function() {
				if (this.model.logEntries.length > 0) {
					$("#graphs-getting-started").hide();
				}
			},
			showHorizonsGraph : function() {

				var data;
				
				if (this.model.logEntries.length >0) {
					data = new Array();
					this.model.logEntries.forEach(function(entry) {
						data.push(entry.toJSON());
					});
				}else{
					return false;
				}
				
				$("#bs-results").html('');

				var width = 960, height = 500;

				var chart = d3.horizon().width(width).height(height / 3).bands(
						3).mode("mirror").interpolate("basis");

				var chart2 = d3.horizon().width(width).height(height / 3)
						.bands(3).mode("mirror").interpolate("basis");

				var chart3 = d3.horizon().width(width).height(height / 3)
						.bands(3).mode("mirror").interpolate("basis");

				var svg = d3.select("#bs-results").append("svg").attr("width",
						width).attr("height", height / 3);

				var bsData = this.getGlucoseResults(data), dailyInsulinData = this
						.getDailyInsulinAmounts(data), insulinData = this
						.getInsulinAmounts(data);

				bsData = bsData.map(function(entry) {
					return [ entry.resultDate, entry.bsLevel ];
				});

				dailyInsulinData = dailyInsulinData.map(function(entry) {
					return [ entry.resultDate, entry.dailyInsulinAmount ];
				});

				insulinData = insulinData.map(function(entry) {
					return [ entry.resultDate, entry.insulinAmount ];
				});

				// Render the glucose chart.
				svg.data([ bsData ]).call(chart);
				svg.append("svg:text")
			      .attr("x", width - 6)
			      .attr("y", 12)
			      .attr("text-anchor", "end")
			      .text("Glucose Reading");
				// Render daily insulin chart.
				var svg2 = d3.select("#bs-results").append("svg").attr("width",
						width).attr("height", height / 3);
				svg2.data([ dailyInsulinData ]).call(chart2);
				svg2.append("svg:text")
			      .attr("x", width - 6)
			      .attr("y",12)
			      .attr("text-anchor", "end")
			      .text("Daily Insulin Total");
				// Render the insulin chart.
				var svg3 = d3.select("#bs-results").append("svg").attr("width",
						width).attr("height", height / 3);
				svg3.data([ insulinData ]).call(chart3);
				svg3.append("svg:text")
			      .attr("x", width - 6)
			      .attr("y",12)
			      .attr("text-anchor", "end")
			      .text("Bolus Volume Delivered");

			},
			showMultiLineGraph : function() {
				
				$("#bs-results").html('');
				var data;
				
				if (this.model.logEntries.length>0) {
					data = new Array();
					this.model.logEntries.forEach(function(entry) {
						data.push(entry.toJSON());
					});
				}
				
				this.createGlucoseChart(this.getGlucoseResults(data));
				this.createInsulinChart(this.getInsulinAmounts(data));
				this.createDailyInsulinChart(this.getDailyInsulinAmounts(data));
				
			},
			createInsulinChart : function(insulinData){
				
				var margin = {
						top : 5,
						right : 20,
						bottom : 0,
						left : 30
				}, width = 960 - margin.left - margin.right, height = 200
						- margin.top - margin.bottom;
				
				var x = d3.time.scale().range([ 0, width ]);
				var y = d3.scale.linear().range([ height, 0 ]);
				var xAxis = d3.svg.axis().scale(x).orient("bottom");
				var yAxis = d3.svg.axis().scale(y).orient("left");

				var line = d3.svg.line().x(function(d) {
					return x(d.resultDate);
				}).y(function(d) {
					return y(d.insulinAmount);
				});

				var svg = d3.select("#bs-results").append("svg").attr("width",
						width + margin.left + margin.right).attr("height",
						height + margin.top + margin.bottom).append("g").attr(
						"transform",
						"translate(" + margin.left + "," + margin.top + ")");

				x.domain([ insulinData[0].resultDate, insulinData[insulinData.length - 1].resultDate ]);
				y.domain([ 0, 20]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + height + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".71em").style("text-anchor", "end").text(
								"Units");

				svg.append("path").datum(insulinData).attr("class", "line").attr("d",
						line);
				
				svg.append("svg:text")
			      .attr("x", width - 6)
			      .attr("y", 6)
			      .attr("text-anchor", "end")
			      .text("Bolus Volume Delivered");
			},
			createDailyInsulinChart : function(dailyInsulinData){
				
				var margin = {
						top : 5,
						right : 20,
						bottom : 0,
						left : 30
				}, width = 960 - margin.left - margin.right, height = 200
						- margin.top - margin.bottom;
				
				var x = d3.time.scale().range([ 0, width ]);
				var y = d3.scale.linear().range([ height, 0 ]);
				var xAxis = d3.svg.axis().scale(x).orient("bottom");
				var yAxis = d3.svg.axis().scale(y).orient("left");

				var line = d3.svg.line().x(function(d) {
					return x(d.resultDate);
				}).y(function(d) {
					return y(d.dailyInsulinAmount);
				});

				var svg = d3.select("#bs-results").append("svg").attr("width",
						width + margin.left + margin.right).attr("height",
						height + margin.top + margin.bottom).append("g").attr(
						"transform",
						"translate(" + margin.left + "," + margin.top + ")");

				x.domain([ dailyInsulinData[0].resultDate, dailyInsulinData[dailyInsulinData.length - 1].resultDate ]);
				y.domain([ 0, 60]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + height + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".71em").style("text-anchor", "end").text(
								"Units");

				svg.append("path").datum(dailyInsulinData).attr("class", "line").attr("d",
						line);
				svg.append("svg:text")
			      .attr("x", width - 6)
			      .attr("y", 6)
			      .attr("text-anchor", "end")
			      .text("Daily Insulin Total");
			},
			createGlucoseChart : function(bsData){
				
				var margin = {
						top : 5,
						right : 20,
						bottom : 0,
						left : 30
				}, width = 960 - margin.left - margin.right, height = 200
						- margin.top - margin.bottom;
				
				var x = d3.time.scale().range([ 0, width ]);
				var y = d3.scale.linear().range([ height, 0 ]);
				var xAxis = d3.svg.axis().scale(x).orient("bottom");
				var yAxis = d3.svg.axis().scale(y).orient("left");

				var line = d3.svg.line().x(function(d) {
					return x(d.resultDate);
				}).y(function(d) {
					return y(d.bsLevel);
				});

				var svg = d3.select("#bs-results").append("svg").attr("width",
						width + margin.left + margin.right).attr("height",
						height + margin.top + margin.bottom).append("g").attr(
						"transform",
						"translate(" + margin.left + "," + margin.top + ")");

				x.domain([ bsData[0].resultDate, bsData[bsData.length - 1].resultDate ]);
				y.domain([ 0, 250]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + height + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".71em").style("text-anchor", "end").text(
								"Reading");

				svg.append("path").datum(bsData).attr("class", "line").attr("d",
						line);
				svg.append("svg:text")
			      .attr("x", width - 6)
			      .attr("y", 6)
			      .attr("text-anchor", "end")
			      .text("Glucose Reading");
			},
			showGlucoseWithHelp : function(entries) {

				if (entries && entries.length>0) {
						data = new Array();
					entries.forEach(function(entry) {

						data.push(entry.toJSON());

					});
				} else {
					return false;
				}

				var margin = {
						top : 10,
						right : 20,
						bottom : 20,
						left : 30
				}, width = 960 - margin.left - margin.right, height = 500
						- margin.top - margin.bottom;
				
				var x = d3.time.scale().range([ 0, width ]);
				var y = d3.scale.linear().range([ height, 0 ]);
				var xAxis = d3.svg.axis().scale(x).orient("bottom");
				var yAxis = d3.svg.axis().scale(y).orient("left");

				var line = d3.svg.line().x(function(d) {
					return x(d.resultDate);
				}).y(function(d) {
					return y(d.bsLevel);
				});

				var svg = d3.select("#bs-results").append("svg").attr("width",
						width + margin.left + margin.right).attr("height",
						height + margin.top + margin.bottom).append("g").attr(
						"transform",
						"translate(" + margin.left + "," + margin.top + ")");

				var bsData = this.getGlucoseResults(data);

				x.domain([ bsData[0].resultDate, bsData[bsData.length - 1].resultDate ]);
				y.domain([ 0, 250]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + height + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".71em").style("text-anchor", "end").text(
								"Reading");

				svg.append("path").datum(bsData).attr("class", "line").attr("d",
						line);
			},
			getGlucoseResults : function(data) {

				var glucoseReadings = new Array();
				if (data) {
					data.forEach(function(entry) {
						if (entry.bsLevel) {
							var point = {
								resultDate : new Date(entry.resultDate),
								bsLevel : entry.bsLevel
							};
							glucoseReadings.push(point);
						}
					});
				}
				
				glucoseReadings.sort(function(a, b) {
				    return a.resultDate - b.resultDate;
				});
				
				return glucoseReadings;
			},
			getInsulinAmounts : function(data) {

				var insulin = new Array();

				if (data) {

					data.forEach(function(entry) {
						if (entry.insulinAmount) {
							var point = {
								resultDate : new Date(entry.resultDate),
								insulinAmount : entry.insulinAmount
							};
							insulin.push(point);
						}
					});
				}
				insulin.sort(function(a, b) {
				    return a.resultDate - b.resultDate;
				});
				
				return insulin;
			},
			getDailyInsulinAmounts : function(data) {

				var insulin = new Array();

				if (data) {

					data.forEach(function(entry) {
						if (entry.dailyInsulinAmount != "") {
							var point = {
								resultDate : new Date(entry.resultDate),
								dailyInsulinAmount : entry.dailyInsulinAmount
							};
							insulin.push(point);
						}
					});
				}
				insulin.sort(function(a, b) {
				    return a.resultDate - b.resultDate;
				});
				return insulin;
			},
			getAverageResults : function(data) {

				var averaged = new Array(), averageReading = null, sumOfReadings = 0, numberOfReadings = 0;

				if (data) {

					data.forEach(function(entry) {
						if (entry.bsLevel) {
							numberOfReadings++;
							sumOfReadings += parseInt(entry.bsLevel);
						}
					});

					averageReading = sumOfReadings / numberOfReadings;

					data.forEach(function(entry) {
						if (entry.bsLevel) {
							var point = {
								resultDate : new Date(entry.resultDate),
								average : averageReading
							};
							averaged.push(point);
						}
					});
				}
				return averaged;
			},
			showGoalsGraph : function(entries) {

				var data = null;

				if (entries) {
					data = new Array();
					entries.forEach(function(entry) {
						data.push(entry.toJSON());
					});
				}

				var margin = {
					top : 5,
					right : 20,
					bottom : 5,
					left : 5
				}, width = 455;// - margin.left - margin.right,
				height = 100;// - margin.top - margin.bottom,
				cellSize = 8; // cell size

				var day = d3.time.format("%w"), week = d3.time.format("%U"), percent = d3
						.format(".1%"), format = d3.time.format("%Y-%m-%d");

				var color = d3.scale.quantize().domain([ -.05, .05 ]).range(
						d3.range(11).map(function(d) {
							return "q" + d + "-11";
						}));

				var svg = d3.select("#goals").selectAll("svg").data(
						d3.range(2013, 2014)).enter().append("svg").attr(
						"viewBox",
						"0 0 " + (width + margin.left + margin.right) + " "
								+ (height + margin.top + margin.bottom)).attr(
						"class", "RdYlGn").append("g").attr(
						"transform",
						"translate(" + ((width - cellSize * 53) / 2) + ","
								+ (height - cellSize * 7 - 1) + ")");

				svg.append("text").attr("transform",
						"translate(-6," + cellSize * 3.5 + ")rotate(-90)")
						.style("text-anchor", "middle").text(function(d) {
							return d;
						});

				var rect = svg.selectAll(".day").data(
						function(d) {
							return d3.time.days(new Date(d, 0, 1), new Date(
									d + 1, 0, 1));
						}).enter().append("rect").attr("class", "day").attr(
						"width", cellSize).attr("height", cellSize).attr("x",
						function(d) {
							return week(d) * cellSize;
						}).attr("y", function(d) {
					return day(d) * cellSize;
				}).datum(format);

				rect.append("title").text(function(d) {
					return d;
				});

				svg.selectAll(".month").data(
						function(d) {
							return d3.time.months(new Date(d, 0, 1), new Date(
									d + 1, 0, 1));
						}).enter().append("path").attr("class", "month").attr(
						"d", monthPath);

				// data

				// roll up goals for the day
				var goalsData = d3.nest().key(function(d) {
					return format(new Date(d.resultDate));
				}).rollup(function(d) {
					return .4;
				}).map(data);

				rect.filter(function(d) {
					return d in goalsData;
				}).attr("class", function(d) {
					return "day " + color(goalsData[d]);
				}).select("title").text(function(d) {
					return d + ": " + percent(goalsData[d]);
				});

				function monthPath(t0) {
					var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0), d0 = +day(t0), w0 = +week(t0), d1 = +day(t1), w1 = +week(t1);
					return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
							+ "H" + w0 * cellSize + "V" + 7 * cellSize + "H"
							+ w1 * cellSize + "V" + (d1 + 1) * cellSize + "H"
							+ (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1)
							* cellSize + "Z";
				}

			}
		});