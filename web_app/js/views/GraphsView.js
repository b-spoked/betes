/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */
window.GraphsView = Backbone.View
		.extend({

			events : {
				"keyup .filter-graph" : "filterBloodSugarGraph",
				"click .show-graph" : "showAllBloodSugarGraph"
			},

			initialize : function() {
				_.bindAll(this);
				this.template = _.template($('#graphs-template').html());
				this.model.logEntries.bind('reset', this.render, this);
				
			},
			render : function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			},
			filterBloodSugarGraph : function(e) {
				var searchString = $(".filter-graph").val();
				this.showBloodSugarGraph(this.model.logEntries
						.filterEntries(searchString));
			},
			showAllBloodSugarGraph : function(e) {
				this.showBloodSugarGraph(this.model.logEntries);
			},
			showBloodSugarGraph : function(entries) {
				
				$("#bs-results").html('');
				
				var data = null;
				var color = d3.scale.category10();

				if (entries) {
					data = new Array();
					entries.forEach(function(entry) {
						if ((entry.get("bsLevel") != "")
								&& (entry.get("bsLevel") > 0)) {
							data.push(entry.toJSON());
						}
					});
				}

				var margin = {
					top : 10,
					right : 20,
					bottom : 20,
					left : 30
				}, width = 430;// - margin.left - margin.right,
				height = 290;// - margin.top - margin.bottom;

				var x = d3.time.scale().range([ 0, width ]);

				var y = d3.scale.linear().range([ height, 0 ]);

				var xAxis = d3.svg.axis().scale(x).orient("bottom");

				var yAxis = d3.svg.axis().scale(y).orient("left");

				//average
				var averagedData = this.getAverageResults(data);
				var averagedLine = d3.svg.line().x(function(entry) {
					return x(entry.resultDate);
				}).y(function(entry) {
					return y(entry.average);
				});

				var svg = d3.select("#bs-results").append("svg").attr(
						"viewBox",
						"0 0 " + (width + margin.left + margin.right) + " "
								+ (height + margin.top + margin.bottom))
						.append("g").attr(
								"transform",
								"translate(" + margin.left + "," + margin.top
										+ ")");

				data.forEach(function(entry) {
					entry.resultDate = new Date(entry.resultDate);
					console.log(entry.resultDate);
					console.log(entry.bsLevel);
					entry.bsLevel = +entry.bsLevel;
				});

				x.domain(d3.extent(data, function(entry) {
					return entry.resultDate;
				}));
				y.domain(d3.extent(data, function(entry) {
					return entry.bsLevel;
				}));

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(10," + height + ")").call(xAxis).append(
						"text").attr("y", -10).attr("dy", ".75em").style(
						"text-anchor", "middle").text("Reading Date")

				svg.append("g").attr("class", "y axis").call(yAxis).append(
						"text").attr("transform", "rotate(-90)").attr("y", 6)
						.attr("dy", ".75em").style("text-anchor", "end").text(
								"Reading (mmol)");

				svg.selectAll(".dot").data(data).enter().append("circle").attr(
						"class", "dot").attr("r", 2).attr("cx", function(d) {
					return x(d.resultDate);
				}).attr("cy", function(d) {
					return y(d.bsLevel);
				}).style("fill", function(d) {
					return color(d.name);
				});

				/*Average blood sugar */
				svg.append("path").datum(averagedData).attr("class", "line")
						.attr("d", averagedLine);

				/*Legend */
				var legend = svg.selectAll(".legend").data(color.domain())
						.enter().append("g").attr("class", "legend").attr(
								"transform", function(d, i) {
									return "translate(0," + i * 20 + ")";
								});

				legend.append("rect").attr("x", width - 5).attr("width", 5)
						.attr("height", 5).style("fill", color);

				legend.append("text").attr("x", width - 13).attr("y", 3).attr(
						"dy", ".25em").style("text-anchor", "end").text(
						function(d) {
							return d;
						});
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

				//data

				//roll up goals for the day
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