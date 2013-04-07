/**
 * Created by JetBrains PhpStorm. User: Jamie Date: 27/02/13 Time: 3:45 PM To
 * change this template use File | Settings | File Templates.
 */
window.InsightsGraphsView = Backbone.View
		.extend({

			events : {
				"click .show-line" : "showMultiLineGraph",
				"click .show-horizon" : "showHorizonsGraph"
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

				if (this.model.logEntries.length > 0) {
					data = new Array();
					this.model.logEntries.forEach(function(entry) {
						data.push(entry.toJSON());
					});
				} else {
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
				svg.append("svg:text").attr("x", width - 6).attr("y", 12).attr(
						"text-anchor", "end").text("Glucose Reading");
				// Render daily insulin chart.
				var svg2 = d3.select("#bs-results").append("svg").attr("width",
						width).attr("height", height / 3);
				svg2.data([ dailyInsulinData ]).call(chart2);
				svg2.append("svg:text").attr("x", width - 6).attr("y", 12)
						.attr("text-anchor", "end").text("Daily Insulin Total");
				// Render the insulin chart.
				var svg3 = d3.select("#bs-results").append("svg").attr("width",
						width).attr("height", height / 3);
				svg3.data([ insulinData ]).call(chart3);
				svg3.append("svg:text").attr("x", width - 6).attr("y", 12)
						.attr("text-anchor", "end").text(
								"Bolus Volume Delivered");

			},
			showMultiLineGraph : function() {

				$("#bs-results").html('');
				var data;

				if (this.model.logEntries.length > 0) {
					data = new Array();
					this.model.logEntries.forEach(function(entry) {
						data.push(entry.toJSON());
					});
				}

				this.createGlucoseChart(this.getGlucoseResults(data));
				this.createInsulinChart(this.getInsulinAmounts(data));
				this.createDailyInsulinChart(this.getDailyInsulinAmounts(data));

			},
			createInsulinChart : function(insulinData) {

				if(insulinData.length <= 0){
					return;
				}
				
				var margin = {
					top : 5,
					right : 20,
					bottom : 0,
					left : 30
				}, width = 960 - margin.left - margin.right, height = 200
						- margin.top - margin.bottom;

				var parseDate = d3.time.format("%c").parse, bisectDate = d3
						.bisector(function(d) {
							return d.resultDate;
						}).left, formatValue = d3.format(",.1f"), formatUnits = function(
						d) {
					return formatValue(d) + "u";
				};

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

				x.domain([ insulinData[0].resultDate,
						insulinData[insulinData.length - 1].resultDate ]);
				
				y.domain([ 0, 20 ]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + height + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".71em").style("text-anchor", "end").text(
								"Units");

				svg.append("path").datum(insulinData).attr("class", "line")
						.attr("d", line);

				var focus = svg.append("g").attr("class", "focus").style(
						"display", "none");

				focus.append("circle").attr("r", 4.5);

				focus.append("text").attr("x", 9).attr("dy", ".35em");

				svg.append("rect").attr("class", "overlay")
						.attr("width", width).attr("height", height).on(
								"mouseover", function() {
									focus.style("display", null);
								}).on("mouseout", function() {
							focus.style("display", "none");
						}).on("mousemove", mousemove);

				function mousemove() {
					var x0 = x.invert(d3.mouse(this)[0]), i = bisectDate(
							insulinData, x0, 1), d0 = insulinData[i - 1], d1 = insulinData[i], d = x0
							- d0.resultDate > d1.resultDate - x0 ? d1 : d0;
					focus.attr("transform", "translate(" + x(d.resultDate)
							+ "," + y(d.insulinAmount) + ")");
					focus.select("text").text(formatUnits(d.insulinAmount));
				}

				svg.append("svg:text").attr("x", width - 6).attr("y", 6).attr(
						"text-anchor", "end").text("Bolus Volume Delivered");
			},
			createDailyInsulinChart : function(dailyInsulinData) {

				if(dailyInsulinData.length <= 0){
					return;
				}
				
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
				
				var parseDate = d3.time.format("%c").parse, bisectDate = d3
				.bisector(function(d) {
					return d.resultDate;
				}).left, formatValue = d3.format(",.1f"), formatUnits = function(
				d) {
					return formatValue(d) + "u";
				};

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

				x
						.domain([
								dailyInsulinData[0].resultDate,
								dailyInsulinData[dailyInsulinData.length - 1].resultDate ]);
				y.domain([ 0, 60 ]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + height + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".71em").style("text-anchor", "end").text(
								"Units");

				svg.append("path").datum(dailyInsulinData)
						.attr("class", "line").attr("d", line);
				
				var focus = svg.append("g").attr("class", "focus").style(
						"display", "none");

				focus.append("circle").attr("r", 4.5);

				focus.append("text").attr("x", 9).attr("dy", ".35em");

				svg.append("rect").attr("class", "overlay")
						.attr("width", width).attr("height", height).on(
								"mouseover", function() {
									focus.style("display", null);
								}).on("mouseout", function() {
							focus.style("display", "none");
						}).on("mousemove", mousemove);

				function mousemove() {
					var x0 = x.invert(d3.mouse(this)[0]), i = bisectDate(
							dailyInsulinData, x0, 1), d0 = dailyInsulinData[i - 1], d1 = dailyInsulinData[i], d = x0
							- d0.resultDate > d1.resultDate - x0 ? d1 : d0;
					focus.attr("transform", "translate(" + x(d.resultDate)
							+ "," + y(d.dailyInsulinAmount) + ")");
					focus.select("text").text(formatUnits(d.dailyInsulinAmount));
				}
				
				svg.append("svg:text").attr("x", width - 6).attr("y", 6).attr(
						"text-anchor", "end").text("Daily Insulin Total");
			},
			createGlucoseChart : function(bsData) {

				if(bsData.length <= 0){
					return;
				}
				
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
				
				var parseDate = d3.time.format("%c").parse, bisectDate = d3
				.bisector(function(d) {
					return d.resultDate;
				}).left, formatValue = d3.format(",.1f"), formatUnits = function(
				d) {
					return formatValue(d);
				};

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

				x.domain([ bsData[0].resultDate,
						bsData[bsData.length - 1].resultDate ]);
				y.domain([ 0, 250 ]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + height + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".71em").style("text-anchor", "end").text(
								"Reading");

				svg.append("path").datum(bsData).attr("class", "line").attr(
						"d", line);
				
				var focus = svg.append("g").attr("class", "focus").style(
						"display", "none");

				focus.append("circle").attr("r", 4.5);

				focus.append("text").attr("x", 9).attr("dy", ".35em");

				svg.append("rect").attr("class", "overlay")
						.attr("width", width).attr("height", height).on(
								"mouseover", function() {
									focus.style("display", null);
								}).on("mouseout", function() {
							focus.style("display", "none");
						}).on("mousemove", mousemove);

				function mousemove() {
					var x0 = x.invert(d3.mouse(this)[0]), i = bisectDate(
							bsData, x0, 1), d0 = bsData[i - 1], d1 = bsData[i], d = x0
							- d0.resultDate > d1.resultDate - x0 ? d1 : d0;
					focus.attr("transform", "translate(" + x(d.resultDate)
							+ "," + y(d.bsResult) + ")");
					focus.select("text").text(d.bsResult);
				}
				
				svg.append("svg:text").attr("x", width - 6).attr("y", 6).attr(
						"text-anchor", "end").text("Glucose Reading");
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
								resultDate : new Date(
										entry.resultDate),
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
			}
		});